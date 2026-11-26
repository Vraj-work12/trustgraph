import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, InputField, Alert } from '../components/UI';
import { Shield, Mail, Lock } from 'lucide-react';

export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex p-2.5 bg-white border border-gray-200 rounded-xl shadow-card mb-4">
            <Shield size={20} className="text-gray-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Sign in to TrustGraph</h1>
          <p className="text-sm text-gray-500 mt-1">Employment fraud investigation platform</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-card p-6">
          {error && <Alert type="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email address" name="email" type="email"
              placeholder="you@university.edu" value={form.email}
              onChange={set('email')} icon={Mail} required
            />
            <div>
              <InputField
                label="Password" name="password" type="password"
                placeholder="Enter your password" value={form.password}
                onChange={set('password')} icon={Lock} required
              />
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button variant="primary" className="w-full" disabled={loading} loading={loading} type="submit">
              {!loading && 'Sign in'}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded px-3 py-2.5">
              <span className="font-medium text-gray-600">Demo account</span>
              <span className="mono text-gray-500">test@example.com / test123</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-gray-900 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};
