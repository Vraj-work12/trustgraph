import React, { useState } from 'react';
import {
  Button, InputField, Card, Badge, Alert,
  PageHeader, CheckRow, Loader, StatusBadge
} from '../components/UI';
import { recruiterService } from '../services';
import {
  UserCheck, User, Building2, Mail, Phone, Shield,
  ExternalLink, AlertTriangle, CheckCircle, Brain,
  ChevronDown, ChevronUp, RefreshCw, Search, Users,
  Activity, Globe, Link2, XCircle, Info
} from 'lucide-react';

const SEVERITY_COLORS = {
  positive: 'bg-green-50 text-green-700 border-green-200',
  negative: 'bg-red-50 text-red-600 border-red-200',
  critical: 'bg-red-100 text-red-800 border-red-300',
  warning:  'bg-amber-50 text-amber-700 border-amber-200',
  neutral:  'bg-gray-50 text-gray-600 border-gray-200',
};
const EVIDENCE_ICONS = {
  positive: <CheckCircle size={11} className="shrink-0 mt-0.5 text-green-600" />,
  negative: <XCircle    size={11} className="shrink-0 mt-0.5 text-red-500" />,
  critical: <AlertTriangle size={11} className="shrink-0 mt-0.5 text-red-700" />,
  warning:  <AlertTriangle size={11} className="shrink-0 mt-0.5 text-amber-600" />,
  neutral:  <Info       size={11} className="shrink-0 mt-0.5 text-gray-400" />,
};

const VERDICT_STYLES = {
  'Safe to Contact':      { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800' },
  'Contact with Caution': { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-800' },
  'Avoid Contact':        { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800' },
  'Likely Fraudulent':    { bg: 'bg-red-100',   border: 'border-red-300',    text: 'text-red-900' },
};

const Section = ({ icon: Icon, title, children, collapsible = false, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <div className={`flex items-center justify-between ${collapsible ? 'cursor-pointer' : ''} mb-3`}
        onClick={collapsible ? () => setOpen(v => !v) : undefined}>
        <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
          <Icon size={10} /> {title}
        </p>
        {collapsible && (open ? <ChevronUp size={12} className="text-gray-400" /> : <ChevronDown size={12} className="text-gray-400" />)}
      </div>
      {(!collapsible || open) && children}
    </Card>
  );
};

const RiskPill = ({ level }) => {
  const colors = { Low: 'bg-green-50 text-green-700 border-green-200', Medium: 'bg-amber-50 text-amber-700 border-amber-200', High: 'bg-red-50 text-red-700 border-red-200', Unknown: 'bg-gray-50 text-gray-500 border-gray-200' };
  return <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded border ${colors[level] || colors.Unknown}`}>{level}</span>;
};

const DataItem = ({ label, value, mono = false, highlight }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-xs font-medium text-right truncate max-w-[60%] ${mono ? 'mono' : ''} ${highlight || 'text-gray-900'}`}>{value ?? '—'}</span>
  </div>
);

export const VerifyRecruiterPage = () => {
  const [form, setForm]     = useState({ name: '', company: '', email: '', phone: '', linkedinUrl: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reVerifying, setReVerifying] = useState(false);
  const [error, setError]   = useState('');

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await recruiterService.verifyRecruiter(form);
      setResult(res.recruiter);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleReVerify = async () => {
    if (!result?._id) return;
    setReVerifying(true);
    try {
      const res = await recruiterService.reVerify(result._id);
      setResult(res.recruiter);
    } catch {/* silent */}
    finally { setReVerifying(false); }
  };

  const r = result;
  const scoreColor = r
    ? r.verificationScore >= 70 ? 'text-green-600' : r.verificationScore >= 35 ? 'text-amber-600' : 'text-red-600'
    : '';
  const barColor = r
    ? r.verificationScore >= 70 ? 'bg-green-500' : r.verificationScore >= 35 ? 'bg-amber-500' : 'bg-red-500'
    : '';
  const aiVerdictStyle = r?.aiVerdict?.recommendation ? (VERDICT_STYLES[r.aiVerdict.recommendation] || VERDICT_STYLES['Contact with Caution']) : null;

  return (
    <div>
      <PageHeader
        title="Recruiter Verification"
        description="Deep identity verification — email domain, phone risk, LinkedIn, community reports, impersonation detection, and AI verdict."
        badge={<Badge variant="neutral">Deep Verification</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <p className="text-xs font-semibold text-gray-700 mb-4">Recruiter Details</p>
            {error && <Alert type="error" className="mb-4">{error}</Alert>}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <InputField label="Recruiter name"       name="name"       placeholder="e.g. Priya Sharma"           value={form.name}       onChange={set('name')}       icon={User}      required />
              <InputField label="Company name"         name="company"    placeholder="e.g. Infosys Technologies"   value={form.company}    onChange={set('company')}    icon={Building2} required />
              <InputField label="Email address"        name="email"      type="email" placeholder="recruiter@company.com" value={form.email}  onChange={set('email')}      icon={Mail}      required />
              <InputField label="Phone (optional)"     name="phone"      type="tel"   placeholder="+91 98765 43210" value={form.phone}      onChange={set('phone')}      icon={Phone} />
              <InputField label="LinkedIn URL"         name="linkedinUrl" type="url"  placeholder="https://linkedin.com/in/..." value={form.linkedinUrl} onChange={set('linkedinUrl')} icon={Link2} />
              <Button variant="primary" className="w-full" disabled={loading} type="submit">
                {loading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verifying...</>
                  : <><UserCheck size={13} /> Run Deep Verification</>}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Verification pipeline</p>
              {[
                'Email domain vs company domain',
                'Free email & impersonation detection',
                'Phone risk analysis (burner/VOIP)',
                'LinkedIn profile validation',
                'Community incident cross-reference',
                'Platform analyses cross-reference',
                'Impersonation flag detection',
                'AI-generated verdict (Groq)',
                'Trust score breakdown',
              ].map(c => (
                <div key={c} className="flex items-center gap-2 text-xs text-gray-500 py-0.5">
                  <Shield size={10} className="text-gray-300 shrink-0" />{c}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {loading && <Card><Loader rows={8} /></Card>}

          {!loading && !result && (
            <div className="h-full flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <UserCheck size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">Verification results appear here</p>
                <p className="text-xs text-gray-400 mt-1">Enter recruiter details to begin deep verification</p>
              </div>
            </div>
          )}

          {r && (
            <div className="space-y-4">

              {/* Header — Status + Score */}
              <Card>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-1.5">Verification Status</p>
                    <StatusBadge status={r.verificationStatus} />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xs text-gray-400 mb-0.5">Trust Score</p>
                    <p className={`text-3xl font-bold mono ${scoreColor}`}>
                      {r.verificationScore}<span className="text-sm font-normal text-gray-400">/100</span>
                    </p>
                  </div>
                </div>
                <div className="risk-bar-track mb-1">
                  <div className={`risk-bar-fill ${barColor}`} style={{ width: `${r.verificationScore}%` }} />
                </div>
                <div className="flex justify-between text-2xs text-gray-400 mt-1 mb-3">
                  <span>0 — Untrusted</span><span>50 — Suspicious</span><span>100 — Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xs text-gray-400">
                    Verified {r.verifiedAt ? new Date(r.verifiedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </p>
                  <Button variant="secondary" size="xs" onClick={handleReVerify} disabled={reVerifying}>
                    {reVerifying ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <RefreshCw size={10} />}
                    Re-verify
                  </Button>
                </div>
              </Card>

              {/* Recruiter Profile */}
              <Section icon={User} title="Recruiter Profile">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                    {r.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.company}</p>
                    {r.linkedinUrl && (
                      <a href={r.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="text-2xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-0.5">
                        <ExternalLink size={10} /> View LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  {[
                    { label: 'Email',    value: r.email,  mono: true },
                    { label: 'Phone',    value: r.phone,  mono: true },
                    { label: 'Company Reports', value: r.companyReportCount > 0 ? `${r.companyReportCount} report(s)` : 'None', highlight: r.companyReportCount > 0 ? 'text-red-600' : 'text-green-600' },
                    { label: 'Platform Analyses', value: r.relatedAnalysesCount > 0 ? `${r.relatedAnalysesCount} found` : 'None' },
                  ].filter(i => i.value).map(i => <DataItem key={i.label} {...i} />)}
                </div>
              </Section>

              {/* AI Verdict */}
              {r.aiVerdict && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${aiVerdictStyle?.bg} ${aiVerdictStyle?.border}`}>
                  <Brain size={16} className={`${aiVerdictStyle?.text} shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-sm font-bold ${aiVerdictStyle?.text}`}>{r.aiVerdict.recommendation}</p>
                      {r.aiVerdict.confidence && (
                        <span className="text-2xs mono text-gray-500">{r.aiVerdict.confidence}% confidence</span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${aiVerdictStyle?.text} opacity-85`}>{r.aiVerdict.summary}</p>
                    {r.aiVerdict.riskFactors?.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {r.aiVerdict.riskFactors.map((f, i) => (
                          <li key={i} className={`text-2xs flex items-start gap-1.5 ${aiVerdictStyle?.text} opacity-80`}>
                            <span className="shrink-0 mt-0.5">•</span>{f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Deep Checks */}
              <Section icon={Shield} title="Deep Verification Checks">
                <div className="space-y-2">
                  <CheckRow
                    valid={r.domainMatch}
                    label="Email Domain Match"
                    detail={r.emailRisk?.matchReason}
                  />
                  <CheckRow
                    valid={!r.emailRisk?.isFreeEmail}
                    label="Corporate Email Address"
                    detail={r.emailRisk?.isFreeEmail
                      ? `Uses free provider: ${r.emailRisk.emailDomain}`
                      : `Using corporate domain: ${r.emailRisk?.emailDomain}`}
                  />
                  <CheckRow
                    valid={!r.emailRisk?.isImpersonation}
                    label="Impersonation Check"
                    detail={r.emailRisk?.isImpersonation
                      ? `Impersonation risk — official domain is ${r.emailRisk.officialDomain}`
                      : 'No impersonation pattern detected'}
                  />
                  <CheckRow
                    valid={r.communityReportCount === 0}
                    label="Community Incident History"
                    detail={r.communityReportCount === 0
                      ? 'No community reports found for this recruiter'
                      : `${r.communityReportCount} community incident report(s) on record`}
                  />
                  <CheckRow
                    valid={r.linkedinRisk?.provided && r.linkedinRisk?.urlValid}
                    label="LinkedIn Profile"
                    detail={r.linkedinRisk?.riskNote || 'No LinkedIn provided'}
                  />
                  <CheckRow
                    valid={r.phoneRisk?.riskLevel === 'Low' || !r.phone}
                    label="Phone Risk"
                    detail={!r.phone
                      ? 'Phone not provided'
                      : `Risk level: ${r.phoneRisk?.riskLevel}${r.phoneRisk?.isBurner ? ' — suspicious pattern detected' : ''}`}
                  />
                </div>
              </Section>

              {/* Email Risk Detail */}
              <Section icon={Mail} title="Email Risk Analysis" collapsible defaultOpen>
                <div>
                  <DataItem label="Email Domain"      value={r.emailRisk?.emailDomain} mono />
                  <DataItem label="Free Email"        value={r.emailRisk?.isFreeEmail ? 'Yes — High Risk' : 'No'} highlight={r.emailRisk?.isFreeEmail ? 'text-red-600' : 'text-green-600'} />
                  <DataItem label="Impersonation"     value={r.emailRisk?.isImpersonation ? 'Detected' : 'None'} highlight={r.emailRisk?.isImpersonation ? 'text-red-600' : 'text-green-600'} />
                  {r.emailRisk?.officialDomain && <DataItem label="Official Domain" value={r.emailRisk.officialDomain} mono />}
                  <DataItem label="Domain TLD Risk"   value={r.emailRisk?.domainAgeRisk} highlight={r.emailRisk?.domainAgeRisk === 'Suspicious' ? 'text-red-600' : 'text-green-600'} />
                </div>
                {r.impersonationFlags?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-50 space-y-1.5">
                    <p className="text-2xs font-semibold text-red-600 mb-1">⚠ Impersonation Flags</p>
                    {r.impersonationFlags.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs px-2.5 py-2 rounded bg-red-50 border border-red-200 text-red-700">
                        <AlertTriangle size={11} className="shrink-0 mt-0.5" />{f}
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Phone Risk */}
              {r.phone && (
                <Section icon={Phone} title="Phone Risk Analysis" collapsible defaultOpen>
                  <div>
                    <DataItem label="Phone Number"  value={r.phone} mono />
                    <DataItem label="Risk Level"    value={r.phoneRisk?.riskLevel} highlight={r.phoneRisk?.riskLevel === 'High' ? 'text-red-600' : r.phoneRisk?.riskLevel === 'Medium' ? 'text-amber-600' : 'text-green-600'} />
                    <DataItem label="VOIP Pattern"  value={r.phoneRisk?.isVoip ? 'Detected' : 'No'} highlight={r.phoneRisk?.isVoip ? 'text-amber-600' : 'text-gray-900'} />
                    <DataItem label="Burner Pattern" value={r.phoneRisk?.isBurner ? 'Detected' : 'No'} highlight={r.phoneRisk?.isBurner ? 'text-red-600' : 'text-gray-900'} />
                  </div>
                </Section>
              )}

              {/* LinkedIn */}
              <Section icon={Link2} title="LinkedIn Verification" collapsible defaultOpen>
                <div>
                  <DataItem label="Profile Provided"  value={r.linkedinRisk?.provided ? 'Yes' : 'No'} highlight={!r.linkedinRisk?.provided ? 'text-amber-600' : 'text-gray-900'} />
                  {r.linkedinRisk?.provided && <>
                    <DataItem label="Valid LinkedIn URL" value={r.linkedinRisk.urlValid ? 'Yes' : 'No'} highlight={!r.linkedinRisk.urlValid ? 'text-red-600' : 'text-green-600'} />
                    <DataItem label="Name Consistent"   value={r.linkedinRisk.profileConsistent ? 'Yes' : 'Mismatch'} highlight={!r.linkedinRisk.profileConsistent ? 'text-amber-600' : 'text-green-600'} />
                  </>}
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{r.linkedinRisk?.riskNote}</div>
                </div>
              </Section>

              {/* Domain Intelligence */}
              {r.domainIntelligence && !r.emailRisk?.isFreeEmail && (
                <Section icon={Globe} title="Domain Intelligence" collapsible defaultOpen>
                  <div>
                    <DataItem label="Domain"         value={r.emailRisk?.emailDomain} mono />
                    <DataItem label="MX Records"     value={r.domainIntelligence.dns?.hasMx ? `Found (${r.domainIntelligence.dns.mxRecords?.join(', ')})` : 'NONE — cannot receive email'} highlight={r.domainIntelligence.dns?.hasMx ? 'text-green-600' : 'text-red-600'} />
                    <DataItem label="SPF Record"     value={r.domainIntelligence.dns?.hasSPF ? 'Present' : 'Missing'} highlight={r.domainIntelligence.dns?.hasSPF ? 'text-green-600' : 'text-amber-600'} />
                    <DataItem label="Website Live"   value={r.domainIntelligence.reachability?.reachable ? `Yes (HTTP ${r.domainIntelligence.reachability.statusCode})` : 'Unreachable'} highlight={r.domainIntelligence.reachability?.reachable ? 'text-green-600' : 'text-red-600'} />
                    {r.domainIntelligence.reachability?.finalUrl && <DataItem label="Final URL" value={r.domainIntelligence.reachability.finalUrl} mono />}
                  </div>
                  {!r.domainIntelligence.dns?.hasMx && (
                    <div className="mt-3 flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      This domain has no MX records — it cannot send or receive emails. This is a strong indicator of a fake or newly created domain.
                    </div>
                  )}
                </Section>
              )}

              {/* Company Intelligence */}
              {r.companyIntelligence && (
                <Section icon={Building2} title="Company Intelligence (Wikipedia)" collapsible defaultOpen>
                  <DataItem label="Company Found" value={r.companyIntelligence.found ? `Yes — ${r.companyIntelligence.topTitle}` : 'Not found on Wikipedia'} highlight={r.companyIntelligence.found ? 'text-green-600' : 'text-amber-600'} />
                  {r.companyIntelligence.found && r.companyIntelligence.snippet && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                      {r.companyIntelligence.snippet}
                    </div>
                  )}
                  {!r.companyIntelligence.found && (
                    <div className="mt-2 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      <Info size={12} className="shrink-0 mt-0.5" />
                      Company "{r.company}" was not found on Wikipedia. This doesn't confirm fraud, but legitimate large companies are typically listed. Verify independently.
                    </div>
                  )}
                </Section>
              )}

              {/* Domain Intelligence */}
              {r.domainIntelligence && !r.emailRisk?.isFreeEmail && (
                <Section icon={Globe} title="Domain Intelligence" collapsible defaultOpen>
                  <div>
                    <DataItem label="Domain"       value={r.emailRisk?.emailDomain} mono />
                    <DataItem label="MX Records"   value={r.domainIntelligence.dns?.hasMx ? `Found (${r.domainIntelligence.dns.mxRecords?.join(', ')})` : 'NONE — cannot receive email'} highlight={r.domainIntelligence.dns?.hasMx ? 'text-green-600' : 'text-red-600'} />
                    <DataItem label="SPF Record"   value={r.domainIntelligence.dns?.hasSPF ? 'Present' : 'Missing'} highlight={r.domainIntelligence.dns?.hasSPF ? 'text-green-600' : 'text-amber-600'} />
                    <DataItem label="Website Live" value={r.domainIntelligence.reachability?.reachable ? `Yes (HTTP ${r.domainIntelligence.reachability.statusCode})` : 'Unreachable'} highlight={r.domainIntelligence.reachability?.reachable ? 'text-green-600' : 'text-red-600'} />
                    {r.domainIntelligence.reachability?.finalUrl && <DataItem label="Final URL" value={r.domainIntelligence.reachability.finalUrl} mono />}
                  </div>
                  {!r.domainIntelligence.dns?.hasMx && (
                    <div className="mt-3 flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      This domain has no MX records — it cannot send or receive emails. Strong indicator of a fake or newly registered domain.
                    </div>
                  )}
                </Section>
              )}

              {/* Company Intelligence */}
              {r.companyIntelligence && (
                <Section icon={Building2} title="Company Intelligence (Wikipedia)" collapsible defaultOpen>
                  <DataItem
                    label="Company Found"
                    value={r.companyIntelligence.found ? `Yes — ${r.companyIntelligence.topTitle}` : 'Not found on Wikipedia'}
                    highlight={r.companyIntelligence.found ? 'text-green-600' : 'text-amber-600'}
                  />
                  {r.companyIntelligence.found && r.companyIntelligence.snippet && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                      {r.companyIntelligence.snippet}
                    </div>
                  )}
                  {!r.companyIntelligence.found && (
                    <div className="mt-2 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      <Info size={12} className="shrink-0 mt-0.5" />
                      "{r.company}" was not found on Wikipedia. Legitimate large companies are typically listed. Verify this company independently.
                    </div>
                  )}
                </Section>
              )}

              {/* Score Breakdown */}
              {r.scoreBreakdown?.length > 0 && (
                <Section icon={Activity} title="Score Breakdown" collapsible defaultOpen>
                  <div className="space-y-2">
                    {r.scoreBreakdown.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-700 font-medium">{b.factor}</span>
                          {b.reason && <p className="text-2xs text-gray-400 mt-0.5">{b.reason}</p>}
                        </div>
                        <span className={`mono font-bold shrink-0 ml-3 ${b.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {b.delta > 0 ? `+${b.delta}` : b.delta}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* All Evidence */}
              <Section icon={Shield} title="Verification Evidence" collapsible defaultOpen={false}>
                <div className="space-y-1.5">
                  {r.evidence?.map((e, i) => (
                    <div key={i} className={`flex items-start gap-2 text-xs px-2.5 py-2 rounded border ${SEVERITY_COLORS[e.type] || SEVERITY_COLORS.neutral}`}>
                      {EVIDENCE_ICONS[e.type] || EVIDENCE_ICONS.neutral}
                      <span>{e.signal}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Community Reports */}
              {r.relatedReports?.length > 0 && (
                <Section icon={Users} title={`Community Reports (${r.relatedReports.length})`} collapsible defaultOpen>
                  <div className="space-y-2">
                    {r.relatedReports.map((rep, i) => (
                      <div key={i} className="flex items-start gap-3 p-2.5 bg-red-50 border border-red-100 rounded-lg">
                        <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{rep.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-2xs text-gray-500">{rep.reportType}</span>
                            {rep.riskCategory && <><span className="text-gray-300">·</span><span className="text-2xs text-gray-500">{rep.riskCategory}</span></>}
                            <span className="text-gray-300">·</span>
                            <StatusBadge status={rep.status} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Linked Platform Analyses */}
              {r.linkedAnalyses?.length > 0 && (
                <Section icon={Search} title={`Linked Platform Analyses (${r.linkedAnalyses.length})`} collapsible defaultOpen>
                  <div className="space-y-2">
                    {r.linkedAnalyses.map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{a.title}</p>
                          {a.patterns?.length > 0 && (
                            <p className="text-2xs text-gray-400 mt-0.5 truncate">{a.patterns.join(', ')}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-2xs mono font-semibold text-gray-600">{a.trustScore}/100</span>
                          <StatusBadge status={a.riskLevel} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Company Reports */}
              {r.companyReports?.length > 0 && (
                <Section icon={Building2} title={`Company Reports for "${r.company}" (${r.companyReports.length})`} collapsible defaultOpen={false}>
                  <div className="space-y-2">
                    {r.companyReports.map((rep, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <p className="text-xs text-gray-700 truncate flex-1">{rep.title}</p>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-2xs text-gray-400">{rep.reportType}</span>
                          <StatusBadge status={rep.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <Button variant="secondary" size="sm" onClick={() => setResult(null)}>
                Verify another recruiter
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
