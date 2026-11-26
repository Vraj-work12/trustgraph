import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, Users, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';
import { Footer } from '../components/Layout';

export const AboutPage = () => (
  <div className="bg-white min-h-screen">
    <div className="page-container py-16 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Shield size={18} className="text-gray-800" />
        <span className="text-sm font-semibold text-gray-900">TrustGraph AI</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">About TrustGraph AI</h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-10">
        TrustGraph AI is an employment fraud detection platform built to protect students, fresh graduates, and job seekers from fake jobs, fraudulent internships, and suspicious recruiters in India.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: Target,   title: 'Mission',  desc: 'Make every job opportunity verifiable before a student commits time, money, or personal data.' },
          { icon: Users,    title: 'Who We Serve', desc: 'Students, fresh graduates, placement cells, and university career departments across India.' },
          { icon: BookOpen, title: 'Approach', desc: 'Combine rule-based pattern detection, community intelligence, DNS verification, and AI reasoning.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-5 border border-gray-200 rounded-xl">
            <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg w-fit mb-3">
              <Icon size={14} className="text-gray-700" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">What TrustGraph Detects</h2>
      <ul className="space-y-2 mb-12">
        {[
          'Upfront payment requests disguised as registration, training, or security fees',
          'Free email providers (Gmail, Yahoo) used by fake corporate recruiters',
          'Domains with no MX records — email addresses that cannot receive replies',
          'Company impersonation — fake emails mimicking TCS, Infosys, Amazon etc.',
          'Unrealistic salary promises designed to lure desperate job seekers',
          'Credential harvesting — requests for Aadhar, PAN, bank details early in process',
          'Telegram/WhatsApp-only recruitment bypassing formal HR channels',
          'Offer letters missing CIN, registered address, or HR signature',
        ].map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
            <CheckCircle size={13} className="text-green-600 mt-0.5 shrink-0" />{item}
          </li>
        ))}
      </ul>

      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 text-center">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Start protecting yourself today</h2>
        <p className="text-xs text-gray-500 mb-4">Free to use. No credit card required.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/register" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
            Create free account <ArrowRight size={13} />
          </Link>
          <Link to="/analyze" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-white transition-colors">
            Try without account
          </Link>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);
