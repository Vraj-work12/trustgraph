import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, InputField, Alert, Divider } from '../components/UI';
import { Shield, User, Mail, Lock, GraduationCap, Building2, Calendar } from 'lucide-react';

export const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', college: '', degree: '', graduationYear: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex p-2.5 bg-white border border-gray-200 rounded-xl shadow-card mb-4">
            <Shield size={20} className="text-gray-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Free — no credit card required</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-card p-6">
          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <InputField label="Full name" name="name" placeholder="Aditya Kumar"
              value={form.name} onChange={set('name')} icon={User} required />
            <InputField label="Email address" name="email" type="email" placeholder="you@university.edu"
              value={form.email} onChange={set('email')} icon={Mail} required />
            <InputField label="Password" name="password" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={set('password')} icon={Lock} hint="At least 6 characters" required />

            <Divider label="Optional — profile info" />

            <InputField label="College / University" name="college" placeholder="e.g. IIT Bombay"
              value={form.college} onChange={set('college')} icon={Building2} />
            <InputField label="Degree" name="degree" placeholder="e.g. B.Tech Computer Science"
              value={form.degree} onChange={set('degree')} icon={GraduationCap} />
            <InputField label="Graduation year" name="graduationYear" type="number" placeholder="2025"
              value={form.graduationYear} onChange={set('graduationYear')} icon={Calendar} />

            <Button variant="primary" className="w-full mt-1" disabled={loading} loading={loading} type="submit">
              {!loading && 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
