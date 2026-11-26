import React, { useState } from 'react';
import { Shield, Mail, MessageSquare, Github } from 'lucide-react';
import { Footer } from '../components/Layout';

export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="page-container py-16 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Shield size={18} className="text-gray-800" />
          <span className="text-sm font-semibold text-gray-900">TrustGraph AI</span>
          <span className="text-xs text-gray-400">/ Contact</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-sm text-gray-500 mb-10">Have a question, found a bug, or want to collaborate? Reach out.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Mail,          label: 'Email',   value: 'support@trustgraph.ai' },
            { icon: MessageSquare, label: 'Issues',  value: 'GitHub Issues' },
            { icon: Github,        label: 'Source',  value: 'github.com/trustgraph-ai' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-4 border border-gray-200 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg">
                <Icon size={14} className="text-gray-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm text-gray-700">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {sent ? (
          <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-sm font-semibold text-green-800 mb-1">Message sent!</p>
            <p className="text-xs text-green-600">We'll get back to you within 1–2 business days.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'name',  label: 'Name',          type: 'text',  placeholder: 'Your name' },
                { key: 'email', label: 'Email',         type: 'email', placeholder: 'you@example.com' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-gray-900"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="What's this about?"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Describe your question or issue..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-gray-900 resize-none"
              />
            </div>
            <button type="submit"
              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
              Send message
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};
