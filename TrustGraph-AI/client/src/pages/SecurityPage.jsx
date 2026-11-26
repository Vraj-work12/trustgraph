import React from 'react';
import { Shield, Lock, Key, Eye, Server, AlertTriangle } from 'lucide-react';
import { Footer } from '../components/Layout';

const PRACTICES = [
  {
    icon: Key,
    title: 'Authentication',
    items: [
      'Passwords hashed with bcryptjs (cost factor 12)',
      'JWT tokens with configurable expiry (default 7 days)',
      'No plain-text credential storage at any layer',
    ],
  },
  {
    icon: Lock,
    title: 'Data in Transit',
    items: [
      'All API communication over HTTPS / TLS 1.2+',
      'CORS restricted to allowed origins',
      'HTTP security headers enforced',
    ],
  },
  {
    icon: Server,
    title: 'API Security',
    items: [
      'Protected routes require valid JWT on every request',
      'Role-based access control (user / admin)',
      'Input validation on all endpoints via express-validator',
    ],
  },
  {
    icon: Eye,
    title: 'Data Minimisation',
    items: [
      'Submitted content not persisted unless user explicitly saves',
      'No third-party analytics or advertising scripts',
      'Sensitive fields excluded from API responses by default',
    ],
  },
];

export const SecurityPage = () => (
  <div className="bg-white min-h-screen">
    <div className="page-container py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Shield size={18} className="text-gray-800" />
        <span className="text-sm font-semibold text-gray-900">TrustGraph AI</span>
        <span className="text-xs text-gray-400">/ Security</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Security</h1>
      <p className="text-sm text-gray-500 mb-10">
        How we protect your data and keep the platform secure.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {PRACTICES.map(({ icon: Icon, title, items }) => (
          <div key={title} className="p-5 border border-gray-200 rounded-xl">
            <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg w-fit mb-3">
              <Icon size={14} className="text-gray-700" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
            <ul className="space-y-1.5">
              {items.map(item => (
                <li key={item} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-gray-300 mt-0.5">—</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-5 border border-amber-200 bg-amber-50 rounded-xl flex items-start gap-3">
        <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">Report a Vulnerability</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            If you discover a security vulnerability, please disclose it responsibly by emailing{' '}
            <span className="font-medium">security@trustgraph.ai</span>. Do not publish details publicly until we have had a chance to investigate and patch the issue.
          </p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
