import React from 'react';
import { Shield } from 'lucide-react';
import { Footer } from '../components/Layout';

const SECTIONS = [
  {
    title: 'Acceptance of Terms',
    body: `By accessing or using TrustGraph AI, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.`,
  },
  {
    title: 'Permitted Use',
    body: `TrustGraph AI is provided to help individuals identify potentially fraudulent employment opportunities. You may use the platform for personal, non-commercial fraud detection purposes. You may not use the platform to harass individuals, make false reports, or circumvent any security measures.`,
  },
  {
    title: 'User Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials. You must be at least 16 years of age to create an account. You are responsible for all activity under your account.`,
  },
  {
    title: 'Community Reports',
    body: `By submitting a community report, you confirm that the information is accurate to the best of your knowledge. Knowingly submitting false reports about individuals or companies is prohibited and may result in account termination. We reserve the right to moderate, verify, or remove any report.`,
  },
  {
    title: 'Analysis Results',
    body: `Analysis results are provided for informational purposes only and do not constitute legal or professional advice. Risk scores and verdicts are probabilistic and may not be fully accurate. Do not rely solely on TrustGraph AI results when making employment decisions.`,
  },
  {
    title: 'Intellectual Property',
    body: `The platform, its design, and software are the property of TrustGraph AI. You may not copy, modify, distribute, or reverse-engineer any part of the platform without prior written permission.`,
  },
  {
    title: 'Limitation of Liability',
    body: `TrustGraph AI is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, or consequential damages arising from your use of the platform, including any employment decisions made based on analysis results.`,
  },
  {
    title: 'Termination',
    body: `We reserve the right to suspend or terminate accounts that violate these terms, submit false reports, or use the platform for malicious purposes.`,
  },
  {
    title: 'Changes to Terms',
    body: `We may update these Terms of Service. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.`,
  },
];

export const TermsOfServicePage = () => (
  <div className="bg-white min-h-screen">
    <div className="page-container py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Shield size={18} className="text-gray-800" />
        <span className="text-sm font-semibold text-gray-900">TrustGraph AI</span>
        <span className="text-xs text-gray-400">/ Terms of Service</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-2">Last updated: July 2025</p>
      <p className="text-sm text-gray-500 mb-10">
        Please read these Terms of Service carefully before using TrustGraph AI.
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
