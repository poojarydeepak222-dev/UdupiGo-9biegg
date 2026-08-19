import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Mail } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `When you use UdupiGo, we collect the following types of information:

• **Account Information**: Email address, username, and password (stored encrypted) when you register.
• **Business Listings**: Business name, address, phone number, category, description, and photos when you list a business.
• **Usage Data**: Pages viewed, searches performed, businesses clicked, and time spent — used to improve your experience.
• **Location Data**: Your city or general area (with your permission) to show nearby businesses. We do not continuously track your location.
• **Device Information**: Device type, operating system, and browser — used for compatibility and debugging.
• **Reviews & Ratings**: Content you post publicly on business pages.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use collected information for the following purposes:

• **Service Delivery**: To create your account, show business listings, and power the search and discovery features.
• **Personalisation**: To show relevant businesses, offers, and news based on your location and usage.
• **Communications**: To send OTP verification codes, notification emails, and service updates. You can opt out of marketing emails.
• **Analytics**: To understand how people use UdupiGo and improve our features.
• **Safety**: To detect and prevent fraud, spam, and abuse of the platform.
• **Legal Compliance**: To fulfil obligations under applicable Indian laws and regulations.`,
  },
  {
    title: '3. Data Sharing',
    content: `We do NOT sell your personal data to third parties. We share data only in these circumstances:

• **Business Contact**: When you call or contact a business through UdupiGo, your inquiry details may be shared with that business.
• **Service Providers**: We use third-party services for hosting, payment processing, and analytics. These providers are contractually bound to protect your data.
• **Legal Requirements**: If required by law, court order, or to protect the rights and safety of our users and platform.
• **Business Transfer**: In case of a merger or acquisition, data may be transferred to the new entity under the same privacy protections.`,
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures to protect your data:

• All data is encrypted in transit using SSL/TLS encryption.
• Passwords are hashed using bcrypt and never stored in plain text.
• Payment processing uses PCI-DSS compliant payment gateways.
• Database access is restricted to authorised personnel only.
• Regular security audits and vulnerability assessments are conducted.

While we take all reasonable precautions, no internet transmission is 100% secure. Please use strong, unique passwords.`,
  },
  {
    title: '5. Cookies & Tracking',
    content: `UdupiGo uses cookies and similar technologies for:

• **Essential Cookies**: Required for login sessions and basic app functionality.
• **Analytics Cookies**: To understand usage patterns and improve performance.
• **Preference Cookies**: To remember your language, location, and display preferences.

You can control cookie settings through your browser. Note that disabling cookies may affect some features.`,
  },
  {
    title: '6. Your Rights',
    content: `As a UdupiGo user, you have the right to:

• **Access**: Request a copy of all personal data we hold about you.
• **Correction**: Update or correct inaccurate personal information via your Profile settings.
• **Deletion**: Request deletion of your account and associated data.
• **Portability**: Export your data in a machine-readable format.
• **Opt-Out**: Unsubscribe from marketing emails and push notifications at any time.
• **Objection**: Object to processing of your data for specific purposes.

To exercise any of these rights, contact us at privacy@udupigo.in.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `UdupiGo is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us personal information, please contact us immediately and we will delete that information.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we do, we will:

• Update the "Last Updated" date at the top of this page.
• Notify you via email if changes are material.
• Display an in-app notice for significant changes.

Continued use of UdupiGo after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '9. Contact Us',
    content: `For privacy-related questions, requests, or complaints, contact our Privacy Team:

Email: privacy@udupigo.in
Phone: +91 82022 99800
Address: UdupiGo Technologies Pvt. Ltd., City Center, Udupi — 576101, Karnataka, India

We respond to all privacy requests within 72 hours.`,
  },
];

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">Privacy Policy</h1>
          <p className="text-xs text-gray-500">Last updated: June 22, 2026</p>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-5 text-white">
        <Shield size={28} className="text-white/80 mb-2" />
        <h2 className="font-heading font-bold text-lg">Your Privacy Matters</h2>
        <p className="text-white/80 text-sm mt-1 leading-relaxed">UdupiGo is committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights as a user.</p>
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
        <a href="mailto:privacy@udupigo.in" className="flex items-center justify-center gap-2 bg-brand-teal text-white font-bold py-3 rounded-2xl">
          <Mail size={16} /> Contact Privacy Team
        </a>
      </div>

      <BottomNav />
    </div>
  );
};

export default Privacy;
