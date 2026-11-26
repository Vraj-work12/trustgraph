import React from 'react';
import { Shield } from 'lucide-react';
import { Footer } from '../components/Layout';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: `We collect information you provide directly: name, email address, and account credentials during registration. When you use our analysis tools, we process the text content you submit (job descriptions, recruiter emails, offer letter content) solely to provide scam detection results. We do not store raw submitted content beyond session duration unless you explicitly save an analysis.`,
  },
  {
    title: 'How We Use Your Information',
    body: `Your information is used to: authenticate your account, deliver scam analysis results, maintain your analysis history, send transactional emails (password reset, account alerts), and improve detection accuracy through anonymised aggregate patterns. We do not sell your personal data to third parties.`,
  },
  {
    title: 'Community Reports',
    body: `Reports you submit are stored and used to cross-reference future analyses for the benefit of all users. Reports are associated with your account but recruiter names and company names within reports may be surfaced publicly to warn other users.`,
  },
  {
    title: 'Data Retention',
    body: `Account data is retained as long as your account is active. Saved analyses are retained until you delete them. Community reports are retained indefinitely as they serve a public safety function. You may request deletion of your account and associated personal data at any time by contacting support.`,
  },
  {
    title: 'Cookies & Tracking',
    body: `We use session cookies for authentication (JWT token storage) and no third-party advertising cookies. We do not use cross-site tracking technologies.`,
  },
  {
    title: 'Security',
    body: `Passwords are hashed using bcryptjs and never stored in plain text. API access is protected with JWT tokens. Data in transit is encrypted using TLS. We perform regular security reviews.`,
  },
  {
    title: 'Your Rights',
    body: `You have the right to access, correct, or delete your personal data. You may export your analysis history from your dashboard. To exercise any rights or raise a concern, contact us at support@trustgraph.ai.`,
  },
  {
    title: 'Changes to This Policy',
    body: `We may update this Privacy Policy to reflect changes in our practices. We will notify registered users of material changes via email. Continued use of the platform after changes constitutes acceptance.`,
  },
];

export const PrivacyPolicyPage = () => (
  <div className="bg-white min-h-screen">
    <div className="page-container py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Shield size={18} className="text-gray-800" />
        <span className="text-sm font-semibold text-gray-900">TrustGraph AI</span>
        <span className="text-xs text-gray-400">/ Privacy Policy</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-2">Last updated: July 2025</p>
      <p className="text-sm text-gray-500 mb-10">
        TrustGraph AI ("we", "our", "us") is committed to protecting your privacy. This policy describes how we collect, use, and protect your information.
      </p>
      <div className="space-y-8">
        {SECTIONS.map(({ title, body }) => (
          <div key={title}>
            <h2 className="text-sm font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);
