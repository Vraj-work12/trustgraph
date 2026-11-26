import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, Card, Badge, StatusBadge, Modal,
  Pagination, EmptyState, SearchInput, Loader
} from '../components/UI';
import { reportService } from '../services';
import { Flag, Building2, Mail, Phone, Calendar, Users, User, ArrowRight, BookOpen, Shield, AlertTriangle } from 'lucide-react';

const TYPE_VARIANT = {
  'Fake Job':        'danger',
  'Fake Internship': 'warning',
  'Fake Recruiter':  'danger',
  'Fake Company':    'info',
};

const SEVERITY_MAP = {
  'Fake Job':        { label: 'HIGH',   color: 'text-red-600' },
  'Fake Internship': { label: 'MEDIUM', color: 'text-amber-600' },
  'Fake Recruiter':  { label: 'HIGH',   color: 'text-red-600' },
  'Fake Company':    { label: 'MEDIUM', color: 'text-amber-600' },
};

export const CommunityReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchReports(); }, [page, filterType, filterStatus]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterType) params.reportType = filterType;
      if (filterStatus) params.status = filterStatus;
      const data = await reportService.getReports(params);
      setReports(data.reports || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch { setReports([]); }
    finally { setLoading(false); }
  };

  const handleVerify = async (id) => {
    try { await reportService.verifyReport(id); fetchReports(); } catch {}
  };

  const filtered = search
    ? reports.filter(r =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        r.recruiterName?.toLowerCase().includes(search.toLowerCase()))
    : reports;

  return (
    <div className="bg-white min-h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="page-container py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-gray-600" />
                <p className="text-2xs font-semibold uppercase tracking-wider text-gray-400">Incident Database</p>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Community Investigations</h1>
              <p className="text-sm text-gray-500 mt-1">Employment fraud cases reported and verified by the community.</p>
            </div>
            <Link to="/report">
              <Button variant="primary" size="sm"><Flag size={13} /> File Report</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5">
          <SearchInput
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search cases, companies, or recruiters..."
            className="flex-1"
          />
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:border-gray-400 text-gray-700 min-w-36">
            <option value="">All types</option>
            {['Fake Job', 'Fake Internship', 'Fake Recruiter', 'Fake Company'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:border-gray-400 text-gray-700 min-w-32">
            <option value="">All status</option>
            {['Pending', 'Verified', 'Dismissed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-4">
            {filtered.length} case{filtered.length !== 1 ? 's' : ''}
            {filterType && ` · ${filterType}`}
            {filterStatus && ` · ${filterStatus}`}
          </p>
        )}

        {/* Incident table */}
        <Card padding={false}>
          {loading ? (
            <div className="p-5"><Loader rows={6} /></div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No cases found"
              description="Try adjusting filters, or be the first to report a case."
              action={<Link to="/report"><Button variant="primary" size="sm">File a report</Button></Link>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Case / Description</th>
                    <th>Type</th>
                    <th>Entity</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Verifications</th>
                    <th>Filed</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const sev = SEVERITY_MAP[r.reportType] || { label: 'LOW', color: 'text-gray-500' };
                    return (
                      <tr key={r._id} className="cursor-pointer" onClick={() => setSelected(r)}>
                        <td className="max-w-xs">
                          <p className="text-xs font-medium text-gray-900 truncate">{r.title}</p>
                          {r.riskCategory && (
                            <p className="text-2xs text-gray-400 mt-0.5">{r.riskCategory}</p>
                          )}
                        </td>
                        <td><Badge variant={TYPE_VARIANT[r.reportType] || 'default'} size="sm">{r.reportType}</Badge></td>
                        <td>
                          <p className="text-xs text-gray-700">{r.companyName || '—'}</p>
                          {r.recruiterName && <p className="text-2xs text-gray-400">{r.recruiterName}</p>}
                        </td>
                        <td>
                          <span className={`mono text-2xs font-bold ${sev.color}`}>{sev.label}</span>
                        </td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>
                          <span className="mono text-xs text-gray-600">{r.verificationCount}</span>
                        </td>
                        <td className="text-2xs text-gray-400 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td>
                          <button onClick={e => { e.stopPropagation(); setSelected(r); }}
                            className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-0.5">
                            View <ArrowRight size={10} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Case Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Incident Report" maxWidth="max-w-2xl">
        {selected && (
          <div className="space-y-4">
            {/* Header badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={TYPE_VARIANT[selected.reportType] || 'default'}>{selected.reportType}</Badge>
              <StatusBadge status={selected.status} />
              {selected.riskCategory && <Badge variant="warning">{selected.riskCategory}</Badge>}
            </div>

            {/* Title + description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{selected.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{selected.description}</p>
            </div>

            {/* Entity details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 border border-gray-100 rounded-lg p-4 bg-gray-50">
              {[
                { label: 'Company',   value: selected.companyName,   icon: Building2 },
                { label: 'Recruiter', value: selected.recruiterName, icon: User },
                { label: 'Email',     value: selected.email,         icon: Mail },
                { label: 'Phone',     value: selected.phone,         icon: Phone },
              ].filter(f => f.value).map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-2 py-1.5">
                  <Icon size={12} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-2xs text-gray-400">{label}</p>
                    <p className="text-xs font-medium text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Users size={12} />{selected.verificationCount} community verification{selected.verificationCount !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(selected.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
              </span>
            </div>

            {selected.status === 'Pending' && (
              <Button variant="outline" size="sm" className="w-full"
                onClick={() => { handleVerify(selected._id); setSelected(null); }}>
                Mark as community verified
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
