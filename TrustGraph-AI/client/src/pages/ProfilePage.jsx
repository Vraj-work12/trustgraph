import React, { useState, useEffect } from 'react';
import { Button, InputField, Card, Alert, PageHeader } from '../components/UI';
import { authService } from '../services';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Building2, GraduationCap, Calendar, Link2, CheckCircle } from 'lucide-react';

const FIELDS = [
  { key: 'name',           label: 'Full name',          icon: User,          required: true },
  { key: 'email',          label: 'Email address',      icon: Mail,          disabled: true },
  { key: 'college',        label: 'College / University', icon: Building2 },
  { key: 'degree',         label: 'Degree',             icon: GraduationCap },
  { key: 'graduationYear', label: 'Graduation year',    icon: Calendar,      type: 'number' },
  { key: 'profilePicture', label: 'Profile picture URL', icon: Link2 },
];

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', college: '', degree: '', graduationYear: '', profilePicture: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]   = useState('');

  useEffect(() => {
    if (user) setForm({
      name: user.name || '', college: user.college || '',
      degree: user.degree || '', graduationYear: user.graduationYear || '',
      profilePicture: user.profilePicture || '',
    });
  }, [user]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser?.(res.user || form);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setLoading(false); }
  };

  const allFields = ['name', 'email', 'college', 'degree', 'graduationYear', 'profilePicture'];
  const completeness = user ? Math.round((allFields.filter(f => user[f]).length / allFields.length) * 100) : 0;
  const missing = allFields.filter(f => !user?.[f]);

  return (
    <div>
      <PageHeader title="Profile Settings" description="Manage your account information and academic details." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            {error   && <Alert type="error"   className="mb-5">{error}</Alert>}
            {success && <Alert type="success" className="mb-5">{success}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Full name" placeholder="Your full name"
                  value={form.name} onChange={set('name')} icon={User} required />
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">Email address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    <input className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded text-gray-400 cursor-not-allowed"
                      value={user?.email || ''} disabled />
                  </div>
                  <p className="text-2xs text-gray-400">Email address cannot be changed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="College / University" placeholder="e.g. IIT Bombay"
                  value={form.college} onChange={set('college')} icon={Building2} />
                <InputField label="Degree" placeholder="e.g. B.Tech Computer Science"
                  value={form.degree} onChange={set('degree')} icon={GraduationCap} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Graduation year" type="number" placeholder="2025"
                  value={form.graduationYear} onChange={set('graduationYear')} icon={Calendar} />
                <InputField label="Profile picture URL" placeholder="https://..."
                  value={form.profilePicture} onChange={set('profilePicture')} icon={Link2} />
              </div>

              <div className="pt-2 flex gap-2">
                <Button variant="primary" disabled={loading} loading={loading} type="submit">
                  {!loading && 'Save changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Avatar card */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile"
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                <span className={`inline-flex mt-1 text-2xs px-1.5 py-0.5 rounded border font-medium ${
                  user?.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Student'}
                </span>
              </div>
            </div>
            {user?.college && (
              <div className="border-t border-gray-50 pt-3 space-y-1.5 text-xs text-gray-500">
                {user.college && <p className="flex items-center gap-2"><Building2 size={11} className="text-gray-400" />{user.college}</p>}
                {user.degree && <p className="flex items-center gap-2"><GraduationCap size={11} className="text-gray-400" />{user.degree}</p>}
                {user.graduationYear && <p className="flex items-center gap-2"><Calendar size={11} className="text-gray-400" />Class of {user.graduationYear}</p>}
              </div>
            )}
          </Card>

          {/* Completeness */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-700">Profile completeness</p>
              <span className={`text-xs font-bold mono ${completeness === 100 ? 'text-green-600' : 'text-gray-900'}`}>
                {completeness}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ${completeness === 100 ? 'bg-green-500' : 'bg-gray-900'}`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            {completeness < 100 ? (
              <div>
                <p className="text-2xs text-gray-400 mb-2">Missing fields</p>
                <div className="flex flex-wrap gap-1">
                  {missing.map(f => (
                    <span key={f} className="text-2xs px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 rounded">{f}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-green-600 text-xs">
                <CheckCircle size={12} /> Profile complete
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
