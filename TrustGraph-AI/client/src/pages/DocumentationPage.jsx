import React, { useState } from 'react';
import { ChevronDown, Shield, Search, UserCheck, FileText, Flag, Brain } from 'lucide-react';
import { Footer } from '../components/Layout';

const Section = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden mb-2">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors">
        <span className="text-sm font-medium text-gray-900">{title}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 text-sm text-gray-500 leading-relaxed border-t border-gray-50 space-y-2">{children}</div>}
    </div>
  );
};

const MODULES = [
  {
    icon: Search,
    title: 'Job Scam Analysis',
    endpoint: 'POST /api/analysis',
    desc: 'Submit a job description, recruiter email, or WhatsApp message. The engine runs 15+ pattern detectors, entity extraction, trust scoring, and community cross-reference.',
    fields: ['title', 'sourcePlatform (job-posting | email | whatsapp | other)', 'content'],
    returns: ['trustScore (0–100)', 'riskPatterns[]', 'extractedEntities', 'scoreBreakdown', 'investigationReport', 'similarIncidents'],
  },
  {
    icon: UserCheck,
    title: 'Recruiter Verification',
    endpoint: 'POST /api/recruiters/verify',
    desc: 'Deep recruiter verification including email domain DNS lookup, MX record check, domain reachability, Wikipedia company validation, phone risk analysis, and LinkedIn consistency check.',
    fields: ['name', 'company', 'email', 'phone (optional)', 'linkedinUrl (optional)'],
    returns: ['verificationStatus (Verified | Suspicious | High Risk)', 'verificationScore', 'emailRisk', 'phoneRisk', 'domainIntelligence', 'companyIntelligence', 'aiVerdict'],
  },
  {
    icon: FileText,
    title: 'Offer Letter Analysis',
    endpoint: 'POST /api/offer-letters',
    desc: 'Upload and analyze offer letters for missing clauses, suspicious payment terms, signature validation, and company legitimacy.',
    fields: ['companyName', 'position', 'salary', 'content / file'],
    returns: ['riskScore', 'redFlags[]', 'missingClauses[]', 'signatureValid', 'recommendations[]'],
  },
  {
    icon: Flag,
    title: 'Community Reports',
    endpoint: 'POST /api/reports',
    desc: 'Submit community incident reports about fake jobs, fake recruiters, or fraudulent companies. Reports are cross-referenced during analysis.',
    fields: ['reportType', 'title', 'description', 'recruiterName', 'companyName', 'email', 'phone'],
    returns: ['reportId', 'status', 'verificationCount'],
  },
  {
    icon: Brain,
    title: 'AI Deep Analysis (Groq)',
    endpoint: 'POST /api/ai/analyze/:analysisId',
    desc: 'Run Groq Llama3-powered deep analysis on an existing investigation. Returns trust signals, key findings, evidence collected, community intelligence, and an AI recommendation.',
    fields: ['analysisId (URL param)', 'language (en | hi | gu, optional)'],
    returns: ['trustSignals', 'aiRiskPatterns[]', 'aiReport (keyFindings, evidenceCollected, recommendation)', 'communityMatch', 'languageDetected'],
  },
];

export const DocumentationPage = () => (
  <div className="bg-white min-h-screen">
    <div className="page-container py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Shield size={18} className="text-gray-800" />
        <span className="text-sm font-semibold text-gray-900">TrustGraph AI</span>
        <span className="text-xs text-gray-400">/ Documentation</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation</h1>
      <p className="text-sm text-gray-500 mb-10">Platform modules, API endpoints, and usage reference.</p>

      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <p className="text-xs font-semibold text-gray-700 mb-1">Base URL</p>
        <p className="text-xs mono text-gray-600">https://trustgraph-ai.onrender.com/api</p>
        <p className="text-xs text-gray-400 mt-2">All authenticated endpoints require: <span className="mono">Authorization: Bearer &lt;token&gt;</span></p>
      </div>

      <h2 className="text-base font-semibold text-gray-900 mb-4">Authentication</h2>
      <div className="space-y-1 mb-10">
        {[
          { method: 'POST', path: '/auth/register', desc: 'Create new account' },
          { method: 'POST', path: '/auth/login',    desc: 'Login — returns JWT token' },
          { method: 'GET',  path: '/auth/profile',  desc: 'Get current user profile' },
          { method: 'PUT',  path: '/auth/profile',  desc: 'Update profile' },
        ].map(({ method, path, desc }) => (
          <div key={path} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
            <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${method === 'GET' ? 'bg-blue-50 text-blue-700' : method === 'POST' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{method}</span>
            <span className="text-xs mono text-gray-700">{path}</span>
            <span className="text-xs text-gray-400 ml-auto">{desc}</span>
          </div>
        ))}
      </div>

      <h2 className="text-base font-semibold text-gray-900 mb-4">Modules</h2>
      {MODULES.map(({ icon: Icon, title, endpoint, desc, fields, returns }) => (
        <Section key={title} title={`${title} — ${endpoint}`}>
          <p>{desc}</p>
          <div className="mt-3">
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Request Fields</p>
            <ul className="space-y-0.5">{fields.map(f => <li key={f} className="mono text-xs text-gray-600">• {f}</li>)}</ul>
          </div>
          <div className="mt-3">
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Returns</p>
            <ul className="space-y-0.5">{returns.map(r => <li key={r} className="mono text-xs text-gray-600">• {r}</li>)}</ul>
          </div>
        </Section>
      ))}
    </div>
    <Footer />
  </div>
);
