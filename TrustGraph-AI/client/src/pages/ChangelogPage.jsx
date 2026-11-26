import React from 'react';
import { Shield } from 'lucide-react';
import { Footer } from '../components/Layout';

const ENTRIES = [
  {
    version: 'v1.3.0', date: 'July 2025',
    changes: [
      'Added Groq Llama3-powered deep AI analysis',
      'Recruiter verification now includes DNS/MX record checks',
      'Community reports cross-referenced during scam analysis',
      'Offer letter analysis improvements — missing clause detection',
    ],
  },
  {
    version: 'v1.2.0', date: 'June 2025',
    changes: [
      'Introduced Trusty AI assistant chatbot',
      'Admin panel with user, report, and recruiter management',
      'Investigation detail pages with full risk breakdown',
      'Risk pattern engine covering 15+ fraud signals',
    ],
  },
  {
    version: 'v1.1.0', date: 'May 2025',
    changes: [
      'Community reporting system launched',
      'Offer letter drag-and-drop upload',
      'Profile completion indicator on dashboard',
      'Responsive mobile layout improvements',
    ],
  },
  {
    version: 'v1.0.0', date: 'April 2025',
    changes: [
      'Initial platform launch',
      'Job scam detection with trust scoring',
      'Recruiter verification module',
      'JWT authentication and role-based access',
    ],
  },
];

export const ChangelogPage = () => (
  <div className="bg-white min-h-screen">
    <div className="page-container py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Shield size={18} className="text-gray-800" />
        <span className="text-sm font-semibold text-gray-900">TrustGraph AI</span>
        <span className="text-xs text-gray-400">/ Changelog</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Changelog</h1>
      <p className="text-sm text-gray-500 mb-10">Platform updates, improvements, and release notes.</p>

      <div className="space-y-8">
        {ENTRIES.map(({ version, date, changes }) => (
          <div key={version} className="border-l-2 border-gray-200 pl-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-bold text-gray-900">{version}</span>
              <span className="text-xs text-gray-400">{date}</span>
            </div>
            <ul className="space-y-1.5">
              {changes.map(c => (
                <li key={c} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-300 mt-1">—</span>{c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);
