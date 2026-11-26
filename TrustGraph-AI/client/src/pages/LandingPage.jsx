import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Search, UserCheck, FileText, Flag, ChevronDown,
  ArrowRight, CheckCircle, AlertTriangle, BookOpen, Lock,
  Terminal, Activity, Eye, Database
} from 'lucide-react';
import { Footer } from '../components/Layout';
import { Badge } from '../components/UI';

const STATS = [
  { value: '50,247', label: 'Analyses run',      mono: true },
  { value: '8,519',  label: 'Scams reported',    mono: true },
  { value: '24,891', label: 'Students protected', mono: true },
  { value: '98.2%',  label: 'Detection accuracy', mono: true },
];

const FEATURES = [
  {
    icon: Search,
    title: 'Job Scam Detection',
    desc: 'Submit job descriptions, recruiter emails, or messages. The engine cross-references 50+ fraud indicators.',
    href: '/analyze',
    tags: ['Pattern Matching', 'Domain Check'],
  },
  {
    icon: UserCheck,
    title: 'Recruiter Verification',
    desc: 'Validate email domain authenticity, LinkedIn consistency, and community incident records.',
    href: '/verify-recruiter',
    tags: ['Email Analysis', 'Community Data'],
  },
  {
    icon: FileText,
    title: 'Offer Letter Review',
    desc: 'Document-level analysis for missing clauses, suspicious terms, and company legitimacy.',
    href: '/offer-letter',
    tags: ['Clause Detection', 'Trust Score'],
  },
  {
    icon: BookOpen,
    title: 'Investigation Feed',
    desc: 'Browse and verify community-submitted employment fraud cases. Searchable incident database.',
    href: '/community-reports',
    tags: ['Crowd-sourced', 'Verified Reports'],
  },
];

const STEPS = [
  { n: '01', title: 'Submit',   desc: 'Paste a job description, recruiter email, or upload a document.' },
  { n: '02', title: 'Analyze',  desc: 'System checks 50+ indicators — domain records, payment requests, salary anomalies.' },
  { n: '03', title: 'Report',   desc: 'Receive a structured risk report with flags, evidence, and severity ratings.' },
  { n: '04', title: 'Act',      desc: 'Follow recommended actions and optionally file a community incident report.' },
];

const FAQS = [
  { q: 'Is my submitted data kept private?', a: 'All submitted content is encrypted in transit and at rest. We do not share your data with third parties. You can delete your account and all associated data at any time.' },
  { q: 'How accurate is the detection?', a: 'The system cross-references submissions against 50+ known fraud indicators. Accuracy improves continuously as community reports are verified and integrated.' },
  { q: 'Can I use TrustGraph for free?', a: 'Basic features including job analysis, recruiter verification, and community reports are free. Registered users get 20 analyses per month on the free tier.' },
  { q: 'What kinds of scams are detected?', a: 'Upfront payment requests, fake company emails, phantom internships, credential harvesting, offer letters from unregistered entities, and ghost recruiter patterns.' },
  { q: 'Can universities or placement cells use this?', a: 'Yes. TrustGraph is designed for institutional use. Placement officers can review flagged job offers before distributing them to students.' },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors">
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <ChevronDown size={14} className={`text-gray-400 shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-sm text-gray-500 leading-relaxed border-t border-gray-50">{a}</div>
      )}
    </div>
  );
};

/* Simulated live threat ticker */
const THREAT_ITEMS = [
  { type: 'High Risk', label: 'Fake internship — unregistered startup, upfront deposit requested' },
  { type: 'Verified',  label: 'Phantom recruiter confirmed — 14 community verifications' },
  { type: 'High Risk', label: 'Credential farming via fake HR email detected' },
  { type: 'Warning',   label: 'Suspicious offer letter — missing CIN, salary clause absent' },
];

export const LandingPage = () => (
  <div className="bg-white min-h-screen">

    {/* Hero — terminal/data-first style */}
    <section className="border-b border-gray-100">
      <div className="page-container py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded text-xs font-medium text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                System active
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500 mono">v2.1.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
              Employment fraud<br />investigation platform.
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-lg">
              TrustGraph identifies fake jobs, suspicious recruiters, and fraudulent offer letters before they reach students. Built for placement cells, universities, and individual job seekers.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 mb-8">
              <Link to="/analyze"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                <Search size={13} /> Run an Analysis
              </Link>
              <Link to="/community-reports"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Eye size={13} /> Browse Cases
              </Link>
            </div>

            <div className="flex flex-wrap gap-4">
              {['No credit card required', 'Free tier available', 'GDPR compliant'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CheckCircle size={11} className="text-green-600" />{t}
                </div>
              ))}
            </div>
          </div>

          {/* Live threat feed preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity size={13} className="text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">Live Threat Feed</span>
              </div>
              <span className="flex items-center gap-1.5 text-2xs text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Monitoring
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {THREAT_ITEMS.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium border shrink-0 mt-0.5 ${
                    item.type === 'High Risk' ? 'bg-red-50 text-red-700 border-red-200' :
                    item.type === 'Verified'  ? 'bg-green-50 text-green-700 border-green-200' :
                                               'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {item.type}
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-2xs text-gray-400 mono">Updated 2 min ago</span>
              <Link to="/community-reports" className="text-2xs text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1">
                View all cases <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Stats bar */}
    <section className="border-b border-gray-100 bg-gray-50">
      <div className="page-container">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
          {STATS.map(({ value, label, mono }) => (
            <div key={label} className="px-6 py-5 first:pl-0 last:pr-0">
              <p className={`text-2xl font-bold text-gray-900 ${mono ? 'mono' : ''}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="border-b border-gray-100 bg-white">
      <div className="page-container py-16">
        <div className="mb-8">
          <p className="text-2xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Modules</p>
          <h2 className="text-2xl font-bold text-gray-900">Four investigative tools, one platform</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc, href, tags }) => (
            <Link key={title} to={href}
              className="group p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
              <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg w-fit mb-4">
                <Icon size={15} className="text-gray-700" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{desc}</p>
              <div className="flex flex-wrap gap-1">
                {tags.map(t => (
                  <span key={t} className="text-2xs px-1.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 rounded">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* How it works — dense grid */}
    <section className="border-b border-gray-100 bg-gray-50">
      <div className="page-container py-16">
        <div className="mb-8">
          <p className="text-2xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Process</p>
          <h2 className="text-2xl font-bold text-gray-900">From submission to verdict</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="bg-white px-5 py-6">
              <span className="text-2xs mono text-gray-400 mb-3 block">{n}</span>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Sample report + feature list */}
    <section className="border-b border-gray-100 bg-white">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Built for institutions</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Used by placement cells and university career departments</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              TrustGraph is designed for rigorous use — whether you're a student quickly checking an offer, or a placement officer reviewing 50 job listings before the campus placement season.
            </p>
            <ul className="space-y-2.5">
              {[
                'Detects 50+ fraud patterns in job descriptions and emails',
                'Validates recruiter email domains against company records',
                'Cross-references community reports on suspicious entities',
                'Provides structured investigation reports with evidence chains',
                'Designed for bulk review by placement departments',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle size={13} className="text-green-600 mt-0.5 shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Sample investigation report */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-700 mono">CASE-2847 · Investigation Report</span>
              </div>
              <span className="text-2xs px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">High Risk</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Risk Score</span>
                  <span className="mono font-bold text-red-600">87 / 100</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider">Detected Flags</p>
                {['Upfront payment requested (₹5,000 deposit)', 'Email domain: jobs-infosys-hr.com (unverified)', 'Salary: ₹85K/month — 3× market rate for role'].map(f => (
                  <div key={f} className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                    <AlertTriangle size={10} className="shrink-0" />{f}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-2xs text-gray-500">
                  Verdict: <span className="font-semibold text-red-700">Do not proceed. 3 high-severity indicators confirmed.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="border-b border-gray-100 bg-gray-50">
      <div className="page-container py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-7 text-center">
            <p className="text-2xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">FAQ</p>
            <h2 className="text-2xl font-bold text-gray-900">Common questions</h2>
          </div>
          <div className="space-y-1">
            {FAQS.map(f => <FAQItem key={f.q} {...f} />)}
          </div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-white">
      <div className="page-container py-16">
        <div className="border border-gray-200 rounded-xl p-8 max-w-2xl mx-auto text-center bg-gray-50">
          <Shield size={24} className="text-gray-800 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Start investigating today</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Free to use. No card required. Join placement cells and students already using TrustGraph to verify job opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
              Create free account <ArrowRight size={13} />
            </Link>
            <Link to="/community-reports"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-white transition-colors">
              Browse investigations
            </Link>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);
