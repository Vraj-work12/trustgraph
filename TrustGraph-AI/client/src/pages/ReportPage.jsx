import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, InputField, TextArea, Card, Alert, PageHeader } from '../components/UI';
import { reportService } from '../services';
import { Flag, CheckCircle, Shield, ArrowRight, Info } from 'lucide-react';

const REPORT_TYPES = ['Fake Job', 'Fake Internship', 'Fake Recruiter', 'Fake Company'];
const RISK_CATS = [
  { value: 'Upfront Payment',        desc: 'Asked for money for registration, training, or equipment' },
  { value: 'Credential Verification', desc: 'Requested personal documents or ID suspiciously' },
  { value: 'Credential Farming',     desc: 'Collected personal info without legitimate purpose' },
  { value: 'Others',                 desc: 'Other suspicious activity not listed above' },
];

export const ReportPage = () => {
  const [form, setForm] = useState({
    reportType: 'Fake Job', title: '', description: '',
    recruiterName: '', companyName: '', email: '', phone: '',
    riskCategory: 'Upfront Payment',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await reportService.createReport(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="inline-flex p-4 bg-green-50 border border-green-100 rounded-2xl mb-5">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Report submitted</h2>
      <p className="text-sm text-gray-500 mb-1">Your report has been received and is pending review.</p>
      <p className="text-xs text-gray-400 mb-7">Verified reports are published to the community investigation feed and help warn other job seekers.</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button variant="primary" size="sm" onClick={() => setSubmitted(false)}>Submit another report</Button>
        <Link to="/community-reports">
          <Button variant="secondary" size="sm">Browse investigations <ArrowRight size={12} /></Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="File an Incident Report"
        description="Report fake jobs, recruiters, and suspicious opportunities to protect the community."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            {error && <Alert type="error" className="mb-5">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Report type */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Incident type</p>
                <div className="flex flex-wrap gap-1.5">
                  {REPORT_TYPES.map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm(p => ({ ...p, reportType: t }))}
                      className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                        form.reportType === t
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <InputField label="Report title" placeholder="Brief description of the incident"
                value={form.title} onChange={set('title')} required />
              <TextArea label="Detailed description" placeholder="Describe exactly what happened — include dates, platforms used, suspicious requests, and any communication details..."
                value={form.description} onChange={set('description')} rows={6} required />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Recruiter name" placeholder="Name of recruiter (if known)"
                  value={form.recruiterName} onChange={set('recruiterName')} />
                <InputField label="Company name" placeholder="Company name"
                  value={form.companyName} onChange={set('companyName')} />
                <InputField label="Email address" type="email" placeholder="scammer@example.com"
                  value={form.email} onChange={set('email')} />
                <InputField label="Phone number" type="tel" placeholder="+91 98765 43210"
                  value={form.phone} onChange={set('phone')} />
              </div>

              {/* Risk category */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Incident category</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {RISK_CATS.map(({ value, desc }) => (
                    <button key={value} type="button"
                      onClick={() => setForm(p => ({ ...p, riskCategory: value }))}
                      className={`p-3 rounded border text-left transition-colors ${
                        form.riskCategory === value
                          ? 'bg-gray-900 border-gray-900'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <p className={`text-xs font-medium ${form.riskCategory === value ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                      <p className={`text-2xs mt-0.5 ${form.riskCategory === value ? 'text-gray-300' : 'text-gray-400'}`}>{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="danger" className="w-full" disabled={loading} loading={loading} type="submit">
                {!loading && <><Flag size={13} /> Submit Incident Report</>}
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-gray-600" />
              <p className="text-xs font-semibold text-gray-700">Reporting guidelines</p>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-500">
              {[
                'Be factual and specific about what occurred',
                'Include dates, platforms, and channels used',
                'Do not share your own financial or ID details in the report',
                'More evidence increases report credibility and priority',
                'All reports are reviewed before being published',
                'Fraudulent reports may result in account suspension',
              ].map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mono text-gray-300 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  {g}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Info size={14} className="text-gray-600" />
              <p className="text-xs font-semibold text-gray-700">Community impact</p>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Reports filed',    value: '8,500+' },
                { label: 'Scams verified',   value: '4,200+' },
                { label: 'Students warned',  value: '25,000+' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
