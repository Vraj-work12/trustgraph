import React, { useState, useEffect } from 'react';
import {
  Button, Card, Badge, StatCard, StatusBadge,
  EmptyState, Pagination, Alert, SearchInput, SkeletonCard
} from '../components/UI';
import { adminService } from '../services';
import { Users, AlertCircle, TrendingUp, Shield, UserCheck, Flag, Building2, RefreshCw, Settings, Activity, CheckCircle } from 'lucide-react';

const TABS = [
  { id: 'stats',      label: 'Overview',   icon: TrendingUp },
  { id: 'users',      label: 'Users',      icon: Users },
  { id: 'reports',    label: 'Reports',    icon: Flag },
  { id: 'recruiters', label: 'Recruiters', icon: UserCheck },
  { id: 'companies',  label: 'Companies',  icon: Building2 },
];

export const AdminPanel = () => {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchData(); }, [tab, page, statusFilter]);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      if (tab === 'stats') {
        setStats(await adminService.getStats());
      } else if (tab === 'users') {
        const d = await adminService.getUsers({ page, search, limit: 15 });
        setUsers(d.users || []); setTotalPages(d.pagination?.pages || 1);
      } else if (tab === 'reports') {
        const d = await adminService.getReports({ page, status: statusFilter, limit: 15 });
        setReports(d.reports || []); setTotalPages(d.pagination?.pages || 1);
      } else if (tab === 'recruiters') {
        const d = await adminService.getRecruiters({ page, limit: 15 });
        setRecruiters(d.recruiters || []); setTotalPages(d.pagination?.pages || 1);
      } else if (tab === 'companies') {
        const d = await adminService.getCompanies({ page, search, limit: 15 });
        setCompanies(d.companies || []); setTotalPages(d.pagination?.pages || 1);
      }
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await adminService.updateReportStatus(id, status);
      setReports(p => p.map(r => r._id === id ? { ...r, status } : r));
    } catch { setError('Failed to update status.'); }
    finally { setUpdatingId(null); }
  };

  const switchTab = (id) => { setTab(id); setPage(1); setStatusFilter(''); setSearch(''); };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gray-100 border border-gray-200 rounded-lg">
            <Settings size={14} className="text-gray-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Admin Console</h1>
            <p className="text-xs text-gray-500">Platform management</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchData}>
          <RefreshCw size={12} /> Refresh
        </Button>
      </div>

      {error && <Alert type="error" className="mb-5">{error}</Alert>}

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-200 mb-5 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => switchTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'stats' && (
        <div className="space-y-5">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : stats && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Total users"         value={stats.totalUsers}       icon={Users} />
                <StatCard label="Community reports"   value={stats.totalReports}     icon={AlertCircle} />
                <StatCard label="Total analyses"      value={stats.totalAnalyses}    icon={TrendingUp} />
                <StatCard label="Flagged recruiters"  value={stats.flaggedRecruiters} icon={Shield} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Platform Metrics</p>
                  <div className="space-y-4">
                    {[
                      { label: 'Scam detection rate',         val: '87%', w: 87, color: 'bg-gray-700' },
                      { label: 'Recruiter verification rate', val: '62%', w: 62, color: 'bg-gray-700' },
                      { label: 'Community engagement',        val: '74%', w: 74, color: 'bg-gray-700' },
                    ].map(({ label, val, w, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600">{label}</span>
                          <span className="mono font-semibold text-gray-900">{val}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${w}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-4">System Status</p>
                  <div className="space-y-2">
                    {[
                      { label: 'API',              status: 'Operational', ok: true },
                      { label: 'Database',         status: 'Operational', ok: true },
                      { label: 'Analysis Service', status: 'Mock Mode',   ok: false },
                      { label: 'Document Service', status: 'Mock Mode',   ok: false },
                    ].map(({ label, status, ok }) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-amber-400'}`} />
                          <span className="text-xs text-gray-600">{label}</span>
                        </div>
                        <span className={`text-2xs font-medium px-2 py-0.5 rounded border ${
                          ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <SearchInput value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users by name..." className="max-w-xs" />
            <Button variant="secondary" size="sm" onClick={() => { setPage(1); fetchData(); }}>Search</Button>
          </div>
          <Card padding={false}>
            {loading
              ? <div className="p-4 space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-10" />)}</div>
              : users.length === 0
              ? <EmptyState icon={Users} title="No users found" />
              : (
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead><tr><th>User</th><th>College</th><th>Degree</th><th>Role</th><th>Joined</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">{u.name}</p>
                                <p className="text-2xs text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-xs text-gray-600">{u.college || <span className="text-gray-300">—</span>}</td>
                          <td className="text-xs text-gray-600">{u.degree  || <span className="text-gray-300">—</span>}</td>
                          <td><Badge variant={u.role === 'admin' ? 'danger' : 'info'} size="sm">{u.role}</Badge></td>
                          <td className="text-2xs text-gray-400 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Reports */}
      {tab === 'reports' && (
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded focus:outline-none focus:border-gray-400 text-gray-700 min-w-32">
              <option value="">All status</option>
              {['Pending', 'Verified', 'Dismissed'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="text-xs text-gray-400">{reports.length} reports</span>
          </div>
          <Card padding={false}>
            {loading
              ? <div className="p-4 space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
              : reports.length === 0
              ? <EmptyState icon={Flag} title="No reports found" />
              : (
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead><tr><th>Report</th><th>Type</th><th>Company</th><th>Verifications</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {reports.map(r => (
                        <tr key={r._id}>
                          <td className="max-w-[180px]">
                            <p className="text-xs font-medium text-gray-900 truncate">{r.title}</p>
                            {r.description && <p className="text-2xs text-gray-400 truncate mt-0.5">{r.description}</p>}
                          </td>
                          <td><Badge variant={r.reportType === 'Fake Job' ? 'danger' : 'warning'} size="sm">{r.reportType}</Badge></td>
                          <td className="text-xs text-gray-600">{r.companyName || <span className="text-gray-300">—</span>}</td>
                          <td className="mono text-xs text-gray-600">{r.verificationCount}</td>
                          <td>
                            <select value={r.status} disabled={updatingId === r._id}
                              onChange={e => handleStatusUpdate(r._id, e.target.value)}
                              className="px-2 py-1 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:border-gray-400 disabled:opacity-50 cursor-pointer">
                              {['Pending', 'Verified', 'Dismissed'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className="text-2xs text-gray-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Recruiters */}
      {tab === 'recruiters' && (
        <div className="space-y-3">
          <Card padding={false}>
            {loading
              ? <div className="p-4 space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-10" />)}</div>
              : recruiters.length === 0
              ? <EmptyState icon={UserCheck} title="No recruiters found" />
              : (
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead><tr><th>Recruiter</th><th>Company</th><th>Status</th><th>Trust Score</th><th>Reports</th><th>Added</th></tr></thead>
                    <tbody>
                      {recruiters.map(r => (
                        <tr key={r._id}>
                          <td>
                            <p className="text-xs font-medium text-gray-900">{r.name}</p>
                            <p className="text-2xs text-gray-400 mono">{r.email}</p>
                          </td>
                          <td className="text-xs text-gray-600">{r.company}</td>
                          <td><StatusBadge status={r.verificationStatus} /></td>
                          <td><span className="mono text-xs font-semibold text-gray-900">{r.verificationScore}</span></td>
                          <td>
                            <span className={`mono text-xs font-semibold ${r.communityReportCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              {r.communityReportCount}
                            </span>
                          </td>
                          <td className="text-2xs text-gray-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Companies */}
      {tab === 'companies' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <SearchInput value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search companies..." className="max-w-xs" />
            <Button variant="secondary" size="sm" onClick={() => { setPage(1); fetchData(); }}>Search</Button>
          </div>
          <Card padding={false}>
            {loading
              ? <div className="p-4 space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-10" />)}</div>
              : companies.length === 0
              ? <EmptyState icon={Building2} title="No companies found"
                  description="Companies are created when recruiters are verified." />
              : (
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead><tr><th>Company</th><th>Website</th><th>Industry</th><th>Status</th><th>Reports</th></tr></thead>
                    <tbody>
                      {companies.map(c => (
                        <tr key={c._id}>
                          <td>
                            <p className="text-xs font-medium text-gray-900">{c.name}</p>
                            {c.email && <p className="text-2xs text-gray-400 mono">{c.email}</p>}
                          </td>
                          <td className="text-xs text-gray-500 mono">{c.website || <span className="text-gray-300">—</span>}</td>
                          <td className="text-xs text-gray-600">{c.industry || <span className="text-gray-300">—</span>}</td>
                          <td><StatusBadge status={c.verificationStatus} /></td>
                          <td>
                            <span className={`mono text-xs font-semibold ${c.reportCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              {c.reportCount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};
