import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Layout';

const RIGHTS = [
  { title: 'Right of Access',       desc: 'Request a copy of the personal data we hold about you.' },
  { title: 'Right to Rectification', desc: 'Correct inaccurate or incomplete personal data.' },
  { title: 'Right to Erasure',       desc: 'Request deletion of your personal data ("right to be forgotten").' },
  { title: 'Right to Restriction',   desc: 'Restrict how we process your data in certain circumstances.' },
  { title: 'Right to Portability',   desc: 'Receive your data in a structured, machine-readable format.' },
  { title: 'Right to Object',        desc: 'Object to processing of your data for direct marketing or legitimate interest purposes.' },
];

export const GDPRPage = () => (
  <div className="bg-white min-h-screen">
    <div className="page-container py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Shield size={18} className="text-gray-800" />
        <span className="text-sm font-semibold text-gray-900">TrustGraph AI</span>
        <span className="text-xs text-gray-400">/ GDPR</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">GDPR Compliance</h1>
      <p className="text-sm text-gray-500 mb-2">Last updated: July 2025</p>
      <p className="text-sm text-gray-500 mb-10">
        TrustGraph AI is committed to compliance with the General Data Protection Regulation (EU) 2016/679. This page outlines our obligations and your rights as a data subject.
      </p>

      <h2 className="text-sm font-bold text-gray-900 mb-4">Lawful Basis for Processing</h2>
      <div className="space-y-2 mb-10 text-sm text-gray-600 leading-relaxed">
        <p><span className="font-medium text-gray-800">Contractual necessity</span> — Processing your name and email to provide the service you signed up for.</p>
        <p><span className="font-medium text-gray-800">Legitimate interests</span> — Using anonymised, aggregated report data to improve fraud detection accuracy for all users.</p>
        <p><span className="font-medium text-gray-800">Consent</span> — Where we send marketing communications (you may withdraw at any time).</p>
      </div>

      <h2 className="text-sm font-bold text-gray-900 mb-4">Your Rights Under GDPR</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {RIGHTS.map(({ title, desc }) => (
          <div key={title} className="p-4 border border-gray-200 rounded-xl flex items-start gap-2.5">
            <CheckCircle size={13} className="text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-900 mb-0.5">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-bold text-gray-900 mb-3">Data Transfers</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-8">
        TrustGraph AI may process data on servers located outside the EU/EEA. Where such transfers occur, we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) where required.
      </p>

      <h2 className="text-sm font-bold text-gray-900 mb-3">Data Retention</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-8">
        Personal data is retained only as long as necessary for the purposes described in our{' '}
        <Link to="/privacy-policy" className="text-gray-900 underline underline-offset-2">Privacy Policy</Link>.
        Community reports may be retained longer as they serve a public safety purpose.
      </p>

      <div className="p-5 border border-gray-200 bg-gray-50 rounded-xl">
        <p className="text-sm font-semibold text-gray-900 mb-1">Exercise Your Rights</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          To exercise any of your GDPR rights, contact our Data Protection contact at{' '}
          <span className="font-medium text-gray-700">privacy@trustgraph.ai</span>. We will respond within 30 days.
        </p>
      </div>
    </div>
    <Footer />
  </div>
);
