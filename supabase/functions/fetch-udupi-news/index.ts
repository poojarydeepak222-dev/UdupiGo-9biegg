import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const CACHE_HOURS = 6; // Refresh every 6 hours

interface NewsItem {
  id: string;
  title: string;
  body: string;
  url: string;
  source: string;
  category: string;
  image_url: string;
  pub_date: string;
  fetched_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check cache freshness
    const { data: cached } = await supabaseAdmin
      .from('news_cache')
      .select('*')
      .order('fetched_at', { ascending: false })
      .limit(1);

    const lastFetch = cached?.[0]?.fetched_at ? new Date(cached[0].fetched_at) : null;
    const ageHours = lastFetch ? (Date.now() - lastFetch.getTime()) / 3600000 : 999;

    // Return cached data if fresh enough
    if (ageHours < CACHE_HOURS && cached && cached.length > 0) {
      const { data: allCached } = await supabaseAdmin
        .from('news_cache')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(30);
      
      console.log(`Returning ${allCached?.length} cached news items (${ageHours.toFixed(1)}h old)`);
      return new Response(JSON.stringify({ news: allCached, from_cache: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch fresh news from Google News RSS
    const queries = ['udupi', 'udupi karnataka', 'manipal udupi'];
    const allItems: NewsItem[] = [];
    const seenTitles = new Set<string>();

    for (const q of queries) {
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;
        const rssResp = await fetch(rssUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UdupiGoNewsBot/1.0)' }
        });
        
        if (!rssResp.ok) continue;
        
        const xml = await rssResp.text();
        
        // Parse RSS XML items
        const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
        
        for (const match of itemMatches) {
          const item = match[1];
          
          const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
          const linkMatch = item.match(/<link>(.*?)<\/link>/);
          const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || item.match(/<description>(.*?)<\/description>/);
          const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
          const sourceMatch = item.match(/<source[^>]*>(.*?)<\/source>/);

          const title = titleMatch?.[1]?.trim() || '';
          
          if (!title || seenTitles.has(title.toLowerCase().slice(0, 40))) continue;
          seenTitles.add(title.toLowerCase().slice(0, 40));

          const desc = descMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
          const url = linkMatch?.[1]?.trim() || '';
          const pubDate = pubDateMatch?.[1]?.trim() || new Date().toUTCString();
          const source = sourceMatch?.[1]?.trim() || 'Google News';

          allItems.push({
            id: crypto.randomUUID(),
            title,
            body: desc.slice(0, 500),
            url,
            source,
            category: 'General',
            image_url: '',
            pub_date: pubDate,
            fetched_at: new Date().toISOString(),
          });

          if (allItems.length >= 40) break;
        }
      } catch (e) {
        console.error(`RSS fetch error for "${q}":`, e);
      }
      if (allItems.length >= 40) break;
    }

    console.log(`Fetched ${allItems.length} raw news items from RSS`);

    // Use OnSpace AI to categorize, summarize, and enrich news
    if (allItems.length > 0) {
      const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
      const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

      if (apiKey && baseUrl) {
        const titlesForAI = allItems.slice(0, 25).map((item, i) => `${i + 1}. Title: "${item.title}"\nDesc: "${item.body.slice(0, 200)}"`).join('\n\n');

        try {
          const aiResp = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'google/gemini-3-flash-preview',
              messages: [
                {
                  role: 'system',
                  content: `You are a news curator for UdupiGo, a local directory app for Udupi city, India.
Given news items, return a JSON array with exactly this structure for each item:
{"index": <number>, "category": <one of: "Temples","Health","Community","Business","Tourism","Food","Education","Infrastructure","Politics","Sports","Technology","Crime","Weather">, "summary": <2-3 sentence engaging summary in English, max 200 chars>}
Only return valid JSON array, no markdown, no explanation.`
                },
                {
                  role: 'user',
                  content: `Categorize and summarize these ${allItems.slice(0, 25).length} news items:\n\n${titlesForAI}`
                }
              ]
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json();
            const aiText = aiData.choices?.[0]?.message?.content?.trim() || '';
            
            // Parse AI response
            const jsonMatch = aiText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const enriched = JSON.parse(jsonMatch[0]) as { index: number; category: string; summary: string }[];
              for (const e of enriched) {
                const idx = e.index - 1;
                if (idx >= 0 && idx < allItems.length) {
                  allItems[idx].category = e.category || 'General';
                  if (e.summary && e.summary.length > 20) {
                    allItems[idx].body = e.summary;
                  }
                }
              }
              console.log('AI enrichment applied to', enriched.length, 'items');
            }
          }
        } catch (e) {
          console.error('AI enrichment error:', e);
        }
      }
    }

    // Store fresh news in DB (clear old, insert new)
    if (allItems.length > 0) {
      // Delete old cache
      await supabaseAdmin.from('news_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert new items
      const toInsert = allItems.slice(0, 30).map(item => ({
        id: item.id,
        title: item.title,
        body: item.body,
        url: item.url,
        source: item.source,
        category: item.category,
        image_url: item.image_url,
        pub_date: item.pub_date,
        fetched_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabaseAdmin.from('news_cache').insert(toInsert);
      if (insertError) {
        console.error('Insert error:', insertError);
      } else {
        console.log(`Cached ${toInsert.length} fresh news items`);
      }
    }

    // Return news (fresh or fallback to old cache if fetch failed)
    const { data: finalNews } = await supabaseAdmin
      .from('news_cache')
      .select('*')
      .order('fetched_at', { ascending: false })
      .limit(30);

    return new Response(JSON.stringify({ news: finalNews || [], from_cache: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('fetch-udupi-news error:', error);
    return new Response(JSON.stringify({ error: String(error), news: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
