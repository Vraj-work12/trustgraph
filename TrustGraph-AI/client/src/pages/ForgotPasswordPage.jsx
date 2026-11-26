import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, InputField, Alert } from '../components/UI';
import { Shield, Mail, CheckCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex p-2.5 bg-white border border-gray-200 rounded-xl shadow-card mb-4">
            <Shield size={20} className="text-gray-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-card p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="inline-flex p-3 bg-green-50 border border-green-100 rounded-xl mb-4">
                <CheckCircle size={22} className="text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Check your inbox</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-5">
                If an account exists for <span className="font-medium text-gray-700">{email}</span>, we've sent a reset link. It expires in 1 hour.
              </p>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setSubmitted(false)}>
                Try a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
              <Alert type="info">Password reset is a UI demo. Email requires backend integration.</Alert>
              <InputField
                label="Email address" type="email" placeholder="you@university.edu"
                value={email} onChange={e => setEmail(e.target.value)} icon={Mail} required
              />
              <Button variant="primary" className="w-full" type="submit">Send reset link</Button>
            </form>
          )}
        </div>

        <div className="text-center mt-5">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={12} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
