import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Mail } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using UdupiGo ("the Platform", "the App", "the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use UdupiGo.

These terms apply to all visitors, users, and businesses using the platform, including browsing, listing a business, writing reviews, making payments, or accessing any other feature.`,
  },
  {
    title: '2. Eligibility',
    content: `You must be at least 18 years of age to use UdupiGo. By using the platform, you represent and warrant that:

• You are at least 18 years old.
• You have the legal authority to enter into these terms.
• You will comply with all applicable local, state, and national laws.
• The information you provide is accurate and complete.`,
  },
  {
    title: '3. Business Listings',
    content: `**For Business Owners:**
• You may list your business for free. Listings are subject to review and may be rejected or removed at our discretion.
• You must provide accurate, up-to-date business information. False or misleading listings will be permanently removed.
• You are responsible for keeping your contact details, hours, and other information current.
• UdupiGo may remove listings that violate our community standards, contain inappropriate content, or are reported as fraudulent.

**For Users:**
• Business information on UdupiGo is provided in good faith but may not always be current or accurate. Verify critical details (hours, prices) directly with the business.`,
  },
  {
    title: '4. User Reviews & Content',
    content: `By posting reviews, comments, or other content on UdupiGo, you agree that:

• Your content is truthful and based on genuine personal experience.
• You will not post fake, misleading, defamatory, or hateful content.
• You will not post reviews for businesses you own, manage, or are affiliated with.
• UdupiGo has the right to remove any content that violates these guidelines.
• You grant UdupiGo a non-exclusive license to display your reviews on the platform.`,
  },
  {
    title: '5. Payments',
    content: `For paid services (advertising packages, B2B transactions):

• All prices are in Indian Rupees (INR) and inclusive of applicable taxes.
• Payments are processed through secure third-party payment gateways.
• Subscription fees are billed monthly or annually as selected.
• Refunds are provided only in cases of service failure or billing error.
• UdupiGo reserves the right to change pricing with 30 days' notice.`,
  },
  {
    title: '6. Prohibited Activities',
    content: `You agree NOT to:

• Use the platform for illegal purposes or in violation of any laws.
• Post fake business listings, reviews, or ratings.
• Attempt to hack, scrape, or reverse-engineer the platform.
• Spam other users or businesses through the platform.
• Impersonate any person or business entity.
• Use the platform to distribute malware or harmful content.
• Circumvent any security or access controls.

Violation of these terms may result in immediate account termination.`,
  },
  {
    title: '7. Intellectual Property',
    content: `All content on UdupiGo — including logos, design, software, text, and images created by us — is the property of UdupiGo Technologies Pvt. Ltd. and protected by applicable intellectual property laws.

You may not reproduce, distribute, or create derivative works without our prior written consent. User-generated content (reviews, photos) remains the property of the respective users.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `UdupiGo provides the platform on an "as is" basis. We do not guarantee:

• The accuracy, completeness, or reliability of business listings.
• Uninterrupted or error-free service.
• That the platform will be free from security vulnerabilities.

To the maximum extent permitted by law, UdupiGo shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.`,
  },
  {
    title: '9. Governing Law',
    content: `These terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Udupi, Karnataka, India.`,
  },
  {
    title: '10. Changes to Terms',
    content: `We reserve the right to modify these terms at any time. We will notify users of significant changes via email and in-app notifications. Continued use of UdupiGo after changes constitutes acceptance of the new terms.`,
  },
  {
    title: '11. Contact',
    content: `For questions about these Terms of Service:

Email: legal@udupigo.in
Address: UdupiGo Technologies Pvt. Ltd., City Center, Udupi — 576101, Karnataka, India`,
  },
];

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">Terms of Service</h1>
          <p className="text-xs text-gray-500">Last updated: June 22, 2026</p>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-5 text-white">
        <FileText size={28} className="text-white/80 mb-2" />
        <h2 className="font-heading font-bold text-lg">Terms of Service</h2>
        <p className="text-white/80 text-sm mt-1 leading-relaxed">Please read these terms carefully before using UdupiGo. By using our platform, you agree to these terms.</p>
      </div>

      {/* Sections */}
      <div className="px-4 mt-4 space-y-4">
        {SECTIONS.map(({ title, content }) => (
          <div key={title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">{title}</h2>
            <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-gray-800">{part}</strong> : <span key={i}>{part}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mx-4 mt-4">
        <a href="mailto:legal@udupigo.in" className="flex items-center justify-center gap-2 bg-brand-teal text-white font-bold py-3 rounded-2xl">
          <Mail size={16} /> Contact Legal Team
        </a>
      </div>

      <BottomNav />
    </div>
  );
};

export default Terms;
