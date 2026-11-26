import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, StatCard, StatusBadge, SkeletonCard, EmptyState } from '../components/UI';
import { analysisService, reportService, recruiterService, offerLetterService } from '../services';
import { useAuth } from '../hooks/useAuth';
import {
  TrendingUp, AlertTriangle, Flag, UserCheck, Search,
  FileText, ArrowRight, Clock, Shield, Plus, Activity,
  ChevronRight, AlertCircle, Mail, CheckCircle, XCircle
} from 'lucide-react';

const ACTIVITY_META = {
  analysis:    { icon: Search,    bg: 'bg-gray-100',   iconColor: 'text-gray-600',  label: 'Analysis' },
  report:      { icon: Flag,      bg: 'bg-red-50',     iconColor: 'text-red-500',   label: 'Report' },
  recruiter:   { icon: UserCheck, bg: 'bg-blue-50',    iconColor: 'text-blue-500',  label: 'Recruiter Check' },
  offerLetter: { icon: FileText,  bg: 'bg-purple-50',  iconColor: 'text-purple-500',label: 'Offer Letter' },
};

const ThreatRow = ({ a }) => {
  const navigate = useNavigate();
  const isHigh = a.riskLevel === 'High Risk';
  return (
    <tr className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => navigate(`/analysis/${a._id}`)}>
      <td className="max-w-[160px]">
        <p className="truncate text-xs font-medium text-gray-900">{a.title || 'Untitled'}</p>
        <p className="text-2xs text-gray-400 mt-0.5 capitalize">{a.sourcePlatform?.replace('-', ' ')}</p>
      </td>
      <td><StatusBadge status={a.riskLevel} /></td>
      <td>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isHigh ? 'bg-red-500' : a.riskScore > 40 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${a.riskScore}%` }}
            />
          </div>
          <span className="mono text-xs text-gray-700 font-semibold">{a.riskScore}</span>
        </div>
      </td>
      <td className="text-2xs text-gray-400 whitespace-nowrap">
        {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </td>
    </tr>
  );
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [analyses,     setAnalyses]     = useState([]);
  const [reports,      setReports]      = useState([]);
  const [recruiters,   setRecruiters]   = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, r, rec, ol] = await Promise.all([
          analysisService.getAnalyses(),
          reportService.getUserReports(),
          recruiterService.getUserRecruiters(),   // user-scoped
          offerLetterService.getOfferLetters(),
        ]);
        setAnalyses(Array.isArray(a)   ? a   : []);
        setReports(Array.isArray(r)    ? r   : []);
        setRecruiters(Array.isArray(rec) ? rec : []);
        setOfferLetters(Array.isArray(ol)  ? ol  : []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const profileFields  = ['name', 'email', 'college', 'degree', 'graduationYear', 'profilePicture'];
  const profilePct     = user ? Math.round((profileFields.filter(f => user[f]).length / profileFields.length) * 100) : 0;
  const scamsFlagged   = analyses.filter(a => a.riskLevel === 'High Risk').length;
  const recentAnalyses = analyses.slice(0, 8);

  // Activity feed — all 4 modules, sorted by date, capped at 8
  const activityFeed = [
    ...analyses.slice(0, 4).map(a  => ({ type: 'analysis',    data: a,  ts: a.createdAt,  badge: a.riskLevel })),
    ...reports.slice(0, 3).map(r   => ({ type: 'report',      data: r,  ts: r.createdAt,  badge: r.reportType })),
    ...recruiters.slice(0, 3).map(r => ({ type: 'recruiter',  data: r,  ts: r.createdAt,  badge: r.verificationStatus })),
    ...offerLetters.slice(0, 2).map(o => ({ type: 'offerLetter', data: o, ts: o.createdAt, badge: o.companyName })),
  ].sort((a, b) => new Date(b.ts) - new Date(a.ts)).slice(0, 8);

  // Verification queue — show Suspicious + High Risk recruiters the user checked
  const verificationQueue = recruiters
    .filter(r => r.verificationStatus === 'Suspicious' || r.verificationStatus === 'High Risk')
    .slice(0, 4);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-base font-semibold text-gray-900">
            {user?.name?.split(' ')[0]}'s Workspace
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {user?.college ? `${user.college} · ` : ''}Investigation dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <Button variant="secondary" size="sm" onClick={() => navigate('/admin')}>Admin Console</Button>
          )}
          <Button variant="primary" size="sm" onClick={() => navigate('/analyze')}>
            <Plus size={12} /> New Analysis
          </Button>
        </div>
      </div>

      {/* Profile completion banner */}
      {!loading && profilePct < 100 && (
        <div className="mb-5 flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={13} className="text-amber-600 shrink-0" />
            <span className="text-xs text-amber-800 font-medium">Complete your profile to improve analysis accuracy</span>
          </div>
          <Link to="/profile">
            <Button variant="ghost" size="xs" className="text-amber-700 hover:bg-amber-100">Update <ArrowRight size={10} /></Button>
          </Link>
        </div>
      )}

      {/* Stats row — all 4 modules */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Analyses run"      value={analyses.length}     icon={TrendingUp} />
            <StatCard label="Scams flagged"      value={scamsFlagged}        icon={AlertTriangle} />
            <StatCard label="Reports filed"      value={reports.length}      icon={Flag} />
            <StatCard label="Recruiter checks"   value={recruiters.length}   icon={UserCheck} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: threat table + activity */}
        <div className="lg:col-span-2 space-y-5">

          {/* Recent threat analysis table */}
          <Card padding={false}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-gray-500" />
                <p className="text-xs font-semibold text-gray-700">Recent Threat Analyses</p>
              </div>
              <Link to="/analyze" className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
                New <ChevronRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div className="p-5 space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-8" />)}</div>
            ) : recentAnalyses.length === 0 ? (
              <EmptyState icon={Search} title="No analyses yet"
                description="Run your first job analysis to see results here."
                action={<Button variant="primary" size="sm" onClick={() => navigate('/analyze')}>Analyze a job</Button>} />
            ) : (
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Job / Source</th>
                      <th>Risk Level</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAnalyses.map(a => <ThreatRow key={a._id} a={a} />)}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Investigation Activity Feed — all 4 modules */}
          <Card padding={false}>
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
              <Activity size={13} className="text-gray-500" />
              <p className="text-xs font-semibold text-gray-700">Investigation Activity</p>
              <span className="ml-auto text-2xs text-gray-400 mono">{activityFeed.length} events</span>
            </div>
            {loading ? (
              <div className="p-5 space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-10" />)}</div>
            ) : activityFeed.length === 0 ? (
              <EmptyState icon={Clock} title="No activity yet" description="Your analyses, reports, recruiter checks and offer letters appear here." />
            ) : (
              <div className="divide-y divide-gray-50">
                {activityFeed.map((item, i) => {
                  const meta = ACTIVITY_META[item.type];
                  const Icon = meta.icon;
                  // get the display title for each type
                  const title =
                    item.type === 'recruiter'   ? `${item.data.name} @ ${item.data.company}` :
                    item.type === 'offerLetter' ? (item.data.companyName || item.data.fileName || 'Offer Letter') :
                    item.data.title || 'Untitled';

                  return (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => item.type === 'analysis' ? navigate(`/analysis/${item.data._id}`) : undefined}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                        <Icon size={12} className={meta.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{title}</p>
                        <p className="text-2xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <span className="uppercase font-medium">{meta.label}</span>
                          <span className="text-gray-300">·</span>
                          {new Date(item.ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {/* Badge per type */}
                      {item.type === 'analysis'    && item.badge && <StatusBadge status={item.badge} />}
                      {item.type === 'report'      && item.badge && <Badge variant="neutral" size="sm">{item.badge}</Badge>}
                      {item.type === 'recruiter'   && item.badge && <StatusBadge status={item.badge} />}
                      {item.type === 'offerLetter' && (
                        item.data.riskScore > 60
                          ? <Badge variant="danger"  size="sm">High Risk</Badge>
                          : item.data.riskScore > 30
                          ? <Badge variant="warning" size="sm">Medium</Badge>
                          : <Badge variant="success" size="sm">Low Risk</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Offer Letters summary */}
          {!loading && offerLetters.length > 0 && (
            <Card padding={false}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-gray-500" />
                  <p className="text-xs font-semibold text-gray-700">Offer Letter Analyses</p>
                </div>
                <Link to="/offer-letter" className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
                  New <ChevronRight size={11} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {offerLetters.slice(0, 4).map(ol => (
                  <div key={ol._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{ol.companyName || ol.fileName}</p>
                      <p className="text-2xs text-gray-400 mt-0.5">{ol.position || 'Position not specified'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ol.signatureValid
                        ? <CheckCircle size={12} className="text-green-500" />
                        : <XCircle    size={12} className="text-red-400" />}
                      <span className={`mono text-xs font-semibold ${ol.riskScore > 60 ? 'text-red-600' : ol.riskScore > 30 ? 'text-amber-600' : 'text-green-600'}`}>
                        {ol.riskScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Quick actions */}
          <Card>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-0.5">
              {[
                { label: 'Analyze a job offer',  icon: Search,    href: '/analyze',          desc: 'Run scam detection' },
                { label: 'Verify a recruiter',   icon: UserCheck, href: '/verify-recruiter',  desc: 'Check credentials' },
                { label: 'Review offer letter',  icon: FileText,  href: '/offer-letter',      desc: 'Document analysis' },
                { label: 'File an incident',     icon: Flag,      href: '/report',            desc: 'Report to community' },
              ].map(({ label, icon: Icon, href, desc }) => (
                <Link key={href} to={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="p-1.5 bg-gray-50 border border-gray-100 rounded shrink-0 group-hover:border-gray-200 transition-colors">
                    <Icon size={12} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">{label}</p>
                    <p className="text-2xs text-gray-400">{desc}</p>
                  </div>
                  <ChevronRight size={11} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Recruiter checks — Suspicious/High Risk flagged */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider">Flagged Recruiters</p>
              <Link to="/verify-recruiter" className="text-2xs text-gray-400 hover:text-gray-700 transition-colors">New →</Link>
            </div>
            {loading ? (
              <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-8" />)}</div>
            ) : verificationQueue.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No flagged recruiters</p>
            ) : (
              <div className="space-y-1.5">
                {verificationQueue.map(r => (
                  <div key={r._id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 truncate">{r.name}</p>
                      <p className="text-2xs text-gray-400 truncate mono">{r.company}</p>
                    </div>
                    <StatusBadge status={r.verificationStatus} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Platform summary — all 4 modules */}
          <Card>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Activity</p>
            <div className="space-y-2.5">
              {[
                { label: 'Analyses run',          value: analyses.length,                                           icon: Search },
                { label: 'High-risk detections',  value: scamsFlagged,                                             icon: AlertTriangle },
                { label: 'Reports filed',         value: reports.length,                                           icon: Flag },
                { label: 'Recruiter checks',      value: recruiters.length,                                        icon: UserCheck },
                { label: 'Offer letters scanned', value: offerLetters.length,                                      icon: FileText },
                { label: 'Suspicious recruiters', value: recruiters.filter(r => r.verificationStatus !== 'Verified').length, icon: Shield },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Icon size={11} className="text-gray-400" />
                    {label}
                  </div>
                  <span className="font-semibold text-gray-900 mono">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
