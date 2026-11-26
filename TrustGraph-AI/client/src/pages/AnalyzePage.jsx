import React, { useState } from 'react';
import {
  Button, InputField, TextArea, Card, Alert,
  RiskIndicator, PageHeader, Badge, Loader, StatusBadge
} from '../components/UI';
import { analysisService, aiService } from '../services';
import {
  Search, Briefcase, Mail, MessageSquare, BookOpen,
  AlertTriangle, CheckCircle, Shield, Terminal, Clock,
  Link2, Users, Building2, Phone, Globe, ChevronDown, ChevronUp,
  ArrowRight, FileWarning, Activity, Hash, Sparkles, Brain,
  ThumbsUp, ThumbsDown, Send, Languages, Info
} from 'lucide-react';

const SOURCE_OPTS = [
  { value: 'job-posting', label: 'Job Posting',      icon: Briefcase },
  { value: 'email',       label: 'Email',            icon: Mail },
  { value: 'whatsapp',    label: 'WhatsApp Message', icon: MessageSquare },
  { value: 'other',       label: 'Other',            icon: BookOpen },
];

const SEVERITY_COLORS = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High:     'bg-orange-100 text-orange-700 border-orange-200',
  Medium:   'bg-amber-100 text-amber-700 border-amber-200',
  Low:      'bg-gray-100 text-gray-600 border-gray-200',
};

const VERDICT_STYLES = {
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',    icon: 'text-red-500' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-800',  icon: 'text-amber-500' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-500' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800',  icon: 'text-green-500' },
};

const NODE_ICONS = { Email: Mail, Phone, Domain: Globe, Company: Building2, URL: Link2 };

const LANG_OPTS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'gu', label: 'ગુજરાતી' },
];

const SIGNAL_WEIGHT = { High: 'text-green-700 bg-green-50 border-green-200', Medium: 'text-amber-700 bg-amber-50 border-amber-200', Low: 'text-gray-600 bg-gray-50 border-gray-200' };
const SIGNAL_WEIGHT_NEG = { High: 'text-red-700 bg-red-50 border-red-200', Medium: 'text-orange-700 bg-orange-50 border-orange-200', Low: 'text-gray-600 bg-gray-50 border-gray-200' };

const TrustSignalRow = ({ s, negative }) => (
  <div className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
    <span className={`shrink-0 text-2xs font-semibold px-1.5 py-0.5 rounded border ${
      negative ? (SIGNAL_WEIGHT_NEG[s.weight] || SIGNAL_WEIGHT_NEG.Low) : (SIGNAL_WEIGHT[s.weight] || SIGNAL_WEIGHT.Low)
    }`}>{s.weight}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-700">{s.signal}</p>
      {s.evidence && <p className="text-2xs text-gray-400 mono mt-0.5 truncate">&quot;{s.evidence}&quot;</p>}
    </div>
  </div>
);

const ChatBubble = ({ role, text }) => (
  <div className={`flex gap-2 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    {role === 'ai' && <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center shrink-0 mt-0.5"><Brain size={12} className="text-white" /></div>}
    <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
      role === 'user' ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
    }`}>{text}</div>
  </div>
);

const PatternCard = ({ p }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${SEVERITY_COLORS[p.severity]}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={12} />
          <span className="text-xs font-semibold">{p.type}</span>
          <span className="text-2xs opacity-70 mono">{p.confidence}% confidence</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xs font-medium px-1.5 py-0.5 rounded ${SEVERITY_COLORS[p.severity]}`}>{p.severity}</span>
          {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </div>
      </div>
      {open && p.evidence?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-current border-opacity-20 space-y-1">
          <p className="text-2xs font-semibold uppercase tracking-wider opacity-60 mb-1">Evidence</p>
          {p.evidence.map((e, i) => (
            <p key={i} className="text-2xs mono bg-white bg-opacity-50 rounded px-2 py-1 break-all">"{e}"</p>
          ))}
        </div>
      )}
    </div>
  );
};

const SimilarIncidentRow = ({ item }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
      {item.type === 'Community Report' ? <Users size={12} className="text-gray-600" /> : <Search size={12} className="text-gray-600" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
      <p className="text-2xs text-gray-400 mt-0.5">{item.type} · {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-xs font-bold text-gray-800 mono">{item.similarityScore}%</p>
      <p className="text-2xs text-gray-400">match</p>
    </div>
  </div>
);

export const AnalyzePage = () => {
  const [form, setForm]     = useState({ title: '', sourcePlatform: 'job-posting', content: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // AI Deep Analysis state
  const [aiData, setAiData]           = useState(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiError, setAiError]         = useState('');
  const [aiLang, setAiLang]           = useState('en');

  // Explainability chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput]     = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const selected = SOURCE_OPTS.find(o => o.value === form.sourcePlatform);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null); setAiData(null); setChatHistory([]);
    try {
      const res = await analysisService.createAnalysis(form);
      setResult(res.analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!result?._id) return;
    setAiError(''); setAiLoading(true);
    try {
      const res = await aiService.runAnalysis(result._id, aiLang);
      setAiData(res.aiAnalysis);
    } catch (err) {
      setAiError(err.response?.data?.message || 'AI analysis failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !result?._id) return;
    const q = chatInput.trim();
    setChatInput('');
    setChatHistory(h => [...h, { role: 'user', text: q }]);
    setChatLoading(true);
    try {
      const res = await aiService.explain(result._id, q, aiLang);
      setChatHistory(h => [...h, { role: 'ai', text: res.answer }]);
    } catch (err) {
      setChatHistory(h => [...h, { role: 'ai', text: err.response?.data?.message || 'Could not get an answer. Try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const report     = result?.investigationReport;
  const verdict    = report?.recommendation;
  const vstyle     = verdict ? VERDICT_STYLES[verdict.color] || VERDICT_STYLES.amber : null;
  const patterns   = result?.riskPatterns || [];
  const entities   = result?.extractedEntities || {};
  const similar    = result?.similarIncidents || [];
  const graph      = result?.graphConnections || [];
  const breakdown  = result?.scoreBreakdown || [];

  return (
    <div>
      <PageHeader
        title="Trust Investigation Engine"
        description="Submit any job content for a full trust analysis — entities, risk patterns, graph connections, and community cross-reference."
        badge={<Badge variant="neutral">Trust Graph</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input panel */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-700 mb-2">Content source</p>
              <div className="grid grid-cols-2 gap-1.5">
                {SOURCE_OPTS.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button"
                    onClick={() => setForm(p => ({ ...p, sourcePlatform: value }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      form.sourcePlatform === value
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}>
                    <Icon size={12} />{label}
                  </button>
                ))}
              </div>
            </div>

            {error && <Alert type="error" className="mb-4">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField label="Investigation title" name="title"
                placeholder="e.g. Suspicious remote data entry role"
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <TextArea label={`${selected?.label} content`} name="content"
                placeholder="Paste the full content here — email, job post, WhatsApp message..."
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                rows={12} required />
              <Button variant="primary" className="w-full"
                disabled={loading || !form.content.trim()} type="submit">
                {loading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running investigation...</>
                  : <><Search size={13} /> Run Trust Analysis</>}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Analysis pipeline</p>
              {['Entity extraction', 'Risk pattern detection (15+ patterns)', 'Trust score computation', 'Community cross-reference', 'Similar incident discovery', 'Investigation report'].map(c => (
                <div key={c} className="flex items-center gap-2 text-xs text-gray-500 py-0.5">
                  <Shield size={10} className="text-gray-300 shrink-0" />{c}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-3">
          {loading && <Card><Loader rows={8} /></Card>}

          {!loading && !result && (
            <div className="h-full flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Search size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">No analysis yet</p>
                <p className="text-xs text-gray-400 mt-1">Submit content to begin the trust investigation</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">

              {/* 1. Verdict Banner */}
              {verdict && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${vstyle.bg} ${vstyle.border}`}>
                  <FileWarning size={18} className={`${vstyle.icon} shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-sm font-bold ${vstyle.text}`}>{verdict.verdict}</p>
                    <p className={`text-xs mt-0.5 ${vstyle.text} opacity-80`}>{verdict.description}</p>
                  </div>
                </div>
              )}

              {/* 2. Trust Score */}
              <Card>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Terminal size={10} /> Trust Score
                  </p>
                  <p className="text-2xs text-gray-400 mono flex items-center gap-1.5">
                    <Clock size={10} />
                    {new Date(result.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <h2 className="text-sm font-semibold text-gray-900 mb-4">{result.title}</h2>
                <div className="flex items-center gap-6">
                  <RiskIndicator score={result.riskScore} />
                  <div className="text-right">
                    <p className="text-2xs text-gray-400 mb-0.5">Trust Score</p>
                    <p className={`text-3xl font-bold mono ${result.trustScore >= 70 ? 'text-green-600' : result.trustScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                      {result.trustScore}<span className="text-sm font-normal text-gray-400">/100</span>
                    </p>
                    <p className="text-2xs text-gray-500 mt-0.5">{result.trustCategory}</p>
                  </div>
                </div>
              </Card>

              {/* 3. Executive Summary */}
              {report?.executiveSummary && (
                <Card>
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Executive Summary</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{report.executiveSummary}</p>
                </Card>
              )}

              {/* 4. Risk Patterns */}
              {patterns.length > 0 && (
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <AlertTriangle size={10} className="text-red-500" /> Detected Risk Patterns
                    </p>
                    <span className="text-2xs text-gray-400 mono">{patterns.length} pattern{patterns.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2">
                    {patterns.map((p, i) => <PatternCard key={i} p={p} />)}
                  </div>
                </Card>
              )}

              {patterns.length === 0 && (
                <Card>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <p className="text-xs text-green-700 font-medium">No risk patterns detected in submitted content</p>
                  </div>
                </Card>
              )}

              {/* 5. Score Breakdown */}
              {breakdown.length > 0 && (
                <Card>
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                    <Activity size={10} /> Score Breakdown
                  </p>
                  <div className="space-y-2">
                    {breakdown.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{b.factor}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xs px-1.5 py-0.5 rounded border ${SEVERITY_COLORS[b.severity] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{b.severity}</span>
                          <span className="mono font-semibold text-red-600">-{b.penalty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 6. Extracted Entities */}
              {graph.length > 0 && (
                <Card>
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                    <Hash size={10} /> Extracted Entities
                  </p>
                  <div className="space-y-2.5">
                    {graph.map((g, i) => {
                      const Icon = NODE_ICONS[g.node] || Link2;
                      return (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon size={11} className="text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-2xs font-semibold text-gray-500 mb-1">{g.node}</p>
                            <div className="flex flex-wrap gap-1">
                              {g.values.map((v, j) => (
                                <span key={j} className={`text-2xs mono px-1.5 py-0.5 rounded border ${
                                  g.risk === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                  g.risk === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>{v}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* 7. Similar Incidents */}
              {similar.length > 0 && (
                <Card>
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                    <Users size={10} /> Related Incidents Found
                  </p>
                  <p className="text-2xs text-gray-400 mb-3">{similar.length} related incident{similar.length !== 1 ? 's' : ''} found via shared entities</p>
                  {similar.map((item, i) => <SimilarIncidentRow key={i} item={item} />)}
                </Card>
              )}

              {/* 8. Recommended Actions */}
              {report?.recommendedActions?.length > 0 && (
                <Card>
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                    <CheckCircle size={10} className="text-green-600" /> Recommended Actions
                  </p>
                  <ol className="space-y-2">
                    {report.recommendedActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs text-gray-700">
                        <span className="mono text-gray-400 shrink-0 w-5">{String(i + 1).padStart(2, '0')}</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              {/* AI DEEP ANALYSIS SECTION */}
              <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-500" />
                    <p className="text-sm font-semibold text-gray-800">AI Deep Analysis</p>
                    <span className="text-2xs px-1.5 py-0.5 bg-violet-50 text-violet-600 border border-violet-200 rounded font-medium">Groq / Llama3</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Languages size={12} className="text-gray-400" />
                    <select value={aiLang} onChange={e => setAiLang(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none">
                      {LANG_OPTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                </div>

                {!aiData && !aiLoading && (
                  <p className="text-xs text-gray-400">Run a deeper AI-powered investigation — trust signals, key findings, evidence collection, community intelligence, and explainability chat.</p>
                )}

                {aiError && <Alert type="error">{aiError}</Alert>}

                {!aiData && (
                  <Button variant="primary" size="sm" onClick={handleAIAnalysis} disabled={aiLoading}
                    className="w-full bg-violet-600 hover:bg-violet-700 border-violet-600">
                    {aiLoading
                      ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Running AI Analysis...</>
                      : <><Sparkles size={12} /> Run AI Deep Analysis</>}
                  </Button>
                )}

                {aiData && (
                  <div className="space-y-4">

                    {/* Trust Signals */}
                    {(aiData.trustSignals?.positiveSignals?.length > 0 || aiData.trustSignals?.negativeSignals?.length > 0) && (
                      <Card className="!p-3">
                        <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                          <Shield size={10} /> Trust Signals
                        </p>
                        {aiData.trustSignals.overallAssessment && (
                          <p className="text-xs text-gray-600 italic mb-3 pb-2 border-b border-gray-100">{aiData.trustSignals.overallAssessment}</p>
                        )}
                        {aiData.trustSignals.positiveSignals?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-2xs font-semibold text-green-600 flex items-center gap-1 mb-1"><ThumbsUp size={9} /> Positive</p>
                            {aiData.trustSignals.positiveSignals.map((s, i) => <TrustSignalRow key={i} s={s} />)}
                          </div>
                        )}
                        {aiData.trustSignals.negativeSignals?.length > 0 && (
                          <div>
                            <p className="text-2xs font-semibold text-red-600 flex items-center gap-1 mb-1"><ThumbsDown size={9} /> Negative</p>
                            {aiData.trustSignals.negativeSignals.map((s, i) => <TrustSignalRow key={i} s={s} negative />)}
                          </div>
                        )}
                      </Card>
                    )}

                    {/* Key Findings */}
                    {aiData.aiReport?.keyFindings?.length > 0 && (
                      <Card className="!p-3">
                        <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                          <Search size={10} /> Key Findings
                        </p>
                        <ol className="space-y-1.5">
                          {aiData.aiReport.keyFindings.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                              <span className="mono text-gray-400 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ol>
                      </Card>
                    )}

                    {/* Evidence Collected */}
                    {aiData.aiReport?.evidenceCollected?.length > 0 && (
                      <Card className="!p-3">
                        <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                          <FileWarning size={10} /> Evidence Collected
                        </p>
                        <div className="space-y-1">
                          {aiData.aiReport.evidenceCollected.map((e, i) => (
                            <p key={i} className="text-2xs mono bg-gray-50 border border-gray-100 rounded px-2 py-1 text-gray-700">{e}</p>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Community Intelligence */}
                    {(aiData.communityMatch || aiData.aiReport?.communityIntelligence) && (
                      <Card className="!p-3">
                        <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                          <Users size={10} /> Community Intelligence
                        </p>
                        {aiData.aiReport?.communityIntelligence && (
                          <p className="text-xs text-gray-700 mb-2">{aiData.aiReport.communityIntelligence}</p>
                        )}
                        {aiData.communityMatch?.threatLevel && (
                          <div className="flex items-center gap-2">
                            <Info size={10} className="text-gray-400" />
                            <span className="text-2xs font-semibold text-gray-600">Threat Level:</span>
                            <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded border ${
                              aiData.communityMatch.threatLevel === 'Known Scam Network' ? 'bg-red-50 text-red-700 border-red-200' :
                              aiData.communityMatch.threatLevel === 'Emerging Pattern' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>{aiData.communityMatch.threatLevel}</span>
                          </div>
                        )}
                        {aiData.communityMatch?.matchingFactors?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {aiData.communityMatch.matchingFactors.map((f, i) => (
                              <span key={i} className="text-2xs mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{f}</span>
                            ))}
                          </div>
                        )}
                      </Card>
                    )}

                    {/* AI Recommendation */}
                    {aiData.aiReport?.recommendation && (
                      <Card className="!p-3 bg-gray-50">
                        <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                          <Brain size={10} /> AI Recommendation
                        </p>
                        <p className="text-xs font-bold text-gray-900 mb-1">{aiData.aiReport.recommendation}</p>
                        {aiData.aiReport.recommendationReason && (
                          <p className="text-xs text-gray-600">{aiData.aiReport.recommendationReason}</p>
                        )}
                      </Card>
                    )}

                    {/* Explainability Chat */}
                    <Card className="!p-3">
                      <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                        <Brain size={10} /> Ask AI — Explainability Chat
                      </p>
                      {chatHistory.length === 0 && (
                        <p className="text-2xs text-gray-400 mb-3">Ask anything about this analysis — why a flag was raised, what the evidence means, or what you should do next.</p>
                      )}
                      {chatHistory.length > 0 && (
                        <div className="space-y-2.5 mb-3 max-h-64 overflow-y-auto">
                          {chatHistory.map((m, i) => <ChatBubble key={i} role={m.role} text={m.text} />)}
                          {chatLoading && (
                            <div className="flex gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center shrink-0"><Brain size={12} className="text-white" /></div>
                              <div className="bg-gray-100 rounded-xl rounded-bl-sm px-3 py-2">
                                <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <form onSubmit={handleChat} className="flex gap-2">
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                          placeholder="Why is the trust score low? What should I do?"
                          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-400 placeholder-gray-300"
                          disabled={chatLoading} />
                        <button type="submit" disabled={chatLoading || !chatInput.trim()}
                          className="w-8 h-8 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                          <Send size={12} className="text-white" />
                        </button>
                      </form>
                    </Card>

                  </div>
                )}
              </div>

              <Button variant="secondary" size="sm"
                onClick={() => { setResult(null); setAiData(null); setChatHistory([]); setForm(p => ({ ...p, content: '', title: '' })); }}>
                Run another analysis
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
