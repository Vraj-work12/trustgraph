import React, { useState, useRef } from 'react';
import {
  Button, InputField, Card, Alert, RiskIndicator,
  PageHeader, CheckRow, FlagItem, Badge, Loader
} from '../components/UI';
import { offerLetterService } from '../services';
import { Upload, FileText, X, Building2, Briefcase, DollarSign, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

export const OfferLetterPage = () => {
  const [form, setForm] = useState({ fileName: '', fileUrl: '', companyName: '', position: '', salary: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFile = (file) => {
    if (file) setForm(p => ({ ...p, fileName: file.name, fileUrl: `mock://uploaded/${file.name}` }));
  };
  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fileName) { setError('Please upload a document first.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await offerLetterService.analyzeOfferLetter(form);
      setResult(res.offerLetter);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Offer Letter Review"
        description="Upload an offer letter for document-level validation — missing clauses, suspicious terms, company legitimacy."
        badge={<Badge variant="neutral">Mock Analysis</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload form */}
        <div className="lg:col-span-2">
          <Card>
            <p className="text-xs font-semibold text-gray-700 mb-4">Document Upload</p>
            {error && <Alert type="error" className="mb-4">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!form.fileName ? (
                <div
                  onDragEnter={() => setDrag(true)} onDragLeave={() => setDrag(false)}
                  onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    drag ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <Upload size={20} className={`mx-auto mb-2.5 ${drag ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className="text-sm font-medium text-gray-600">Drop your offer letter</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse — PDF, DOC, DOCX</p>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                    onChange={e => handleFile(e.target.files?.[0])} />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="p-2 bg-white border border-gray-200 rounded-lg">
                    <FileText size={14} className="text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{form.fileName}</p>
                    <p className="text-2xs text-green-600 mt-0.5">Ready for review</p>
                  </div>
                  <button type="button" onClick={() => setForm(p => ({ ...p, fileName: '', fileUrl: '' }))}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <InputField label="Company name" placeholder="e.g. Wipro Technologies"
                  value={form.companyName} onChange={set('companyName')} icon={Building2} />
                <InputField label="Position / Role" placeholder="e.g. Software Engineer"
                  value={form.position} onChange={set('position')} icon={Briefcase} />
                <InputField label="Offered salary" placeholder="e.g. ₹8 LPA"
                  value={form.salary} onChange={set('salary')} icon={DollarSign} />
              </div>

              <Button variant="primary" className="w-full"
                disabled={loading || !form.fileName} type="submit">
                {loading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Reviewing document...</>
                  : <><Shield size={13} /> Analyze Document</>}
              </Button>
            </form>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {loading && <Card><Loader rows={6} /></Card>}

          {!loading && !result && (
            <div className="h-full flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">Document review results appear here</p>
                <p className="text-xs text-gray-400 mt-1">Upload an offer letter to begin</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4 result-enter">
              {/* Document Trust Score */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold">Document Risk Assessment</p>
                  {form.fileName && (
                    <span className="flex items-center gap-1.5 text-2xs text-gray-500 mono">
                      <FileText size={10} />{form.fileName}
                    </span>
                  )}
                </div>
                <RiskIndicator score={result.riskScore} />
              </Card>

              {/* Validation checklist */}
              <Card>
                <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                  <CheckCircle size={10} className="text-green-600" /> Validation Checklist
                </p>
                <div className="space-y-2">
                  <CheckRow
                    valid={result.signatureValid}
                    label="Digital Signature"
                    detail={result.signatureValid
                      ? 'Signature verification passed'
                      : 'Signature could not be verified or is absent'}
                  />
                  <CheckRow
                    valid={result.companyDetailsValid}
                    label="Company Details"
                    detail={result.companyDetailsValid
                      ? 'Company details appear legitimate'
                      : 'Company details could not be confirmed against public records'}
                  />
                </div>
              </Card>

              {/* Missing information */}
              {result.missingInformation?.length > 0 && (
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <AlertTriangle size={10} className="text-amber-500" /> Missing Clauses
                    </p>
                    <span className="text-2xs text-gray-400">{result.missingInformation.length} items</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.missingInformation.map((item, i) => <FlagItem key={i} text={item} severity="warning" />)}
                  </div>
                </Card>
              )}

              {/* Suspicious clauses — highlighted document review style */}
              {result.suspiciousClauses?.length > 0 && (
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <AlertTriangle size={10} className="text-red-500" /> Suspicious Clauses
                    </p>
                    <span className="text-2xs text-gray-400">{result.suspiciousClauses.length} detected</span>
                  </div>
                  <div className="space-y-2">
                    {result.suspiciousClauses.map((clause, i) => (
                      <div key={i} className="px-3 py-2.5 bg-red-50 border-l-2 border-red-400 rounded-r text-xs text-red-800 leading-relaxed">
                        <span className="mono text-red-400 mr-2">§{i + 1}</span>{clause}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Button variant="secondary" size="sm"
                onClick={() => { setResult(null); setForm(p => ({ ...p, fileName: '', fileUrl: '' })); }}>
                Review another document
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
