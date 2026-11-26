import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Badge, Button, StatusBadge, Loader, Alert, RiskIndicator
} from '../components/UI';
import { analysisService } from '../services';
import {
  ArrowLeft, AlertTriangle, CheckCircle, Shield, Search,
  Hash, Users, Activity, FileWarning, Clock, Terminal,
  ChevronDown, ChevronUp, Mail, Phone, Globe, Link2,
  Building2, Sparkles, Brain, ThumbsUp, ThumbsDown, Info
} from 'lucide-react';

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

const SIGNAL_WEIGHT     = { High: 'text-green-700 bg-green-50 border-green-200', Medium: 'text-amber-700 bg-amber-50 border-amber-200', Low: 'text-gray-600 bg-gray-50 border-gray-200' };
const SIGNAL_WEIGHT_NEG = { High: 'text-red-700 bg-red-50 border-red-200',       Medium: 'text-orange-700 bg-orange-50 border-orange-200', Low: 'text-gray-600 bg-gray-50 border-gray-200' };

const Section = ({ icon: Icon, title, count, children }) => (
  <Card>
    <div className="flex items-center justify-between mb-3">
      <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
        <Icon size={10} /> {title}
      </p>
      {count !== undefined && <span className="text-2xs text-gray-400 mono">{count}</span>}
    </div>
    {children}
  </Card>
);

const PatternCard = ({ p }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${SEVERITY_COLORS[p.severity] || SEVERITY_COLORS.Low}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={12} />
          <span className="text-xs font-semibold">{p.type}</span>
          <span className="text-2xs opacity-70 mono">{p.confidence}%</span>
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

const TrustSignalRow = ({ s, negative }) => (
  <div className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
    <span className={`shrink-0 text-2xs font-semibold px-1.5 py-0.5 rounded border ${
      negative ? (SIGNAL_WEIGHT_NEG[s.weight] || SIGNAL_WEIGHT_NEG.Low) : (SIGNAL_WEIGHT[s.weight] || SIGNAL_WEIGHT.Low)
    }`}>{s.weight}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-700">{s.signal}</p>
      {s.evidence && <p className="text-2xs text-gray-400 mono mt-0.5 truncate">"{s.evidence}"</p>}
    </div>
  </div>
);

const DoneTag = ({ label }) => (
  <span className="inline-flex items-center gap-1 text-2xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
    <CheckCircle size={9} /> {label}
  </span>
);

export const AnalysisDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await analysisService.getAnalysisById(id);
        setAnalysis(data);
      } catch {
        setError('Failed to load analysis.');
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="p-8"><Loader rows={8} /></div>;
  if (error)   return <div className="p-8"><Alert type="error">{error}</Alert></div>;
  if (!analysis) return null;

  const ai       = analysis.aiAnalysis;
  const report   = analysis.investigationReport;
  const verdict  = report?.recommendation;
  const vstyle   = verdict ? VERDICT_STYLES[verdict.color] || VERDICT_STYLES.amber : null;
  const patterns = analysis.riskPatterns || [];
  const entities = analysis.extractedEntities || {};
  const graph    = analysis.graphConnections || [];
  const similar  = analysis.similarIncidents || [];
  const breakdown= analysis.scoreBreakdown || [];

  // What has been done on this analysis
  const completedSteps = [
    { done: true,                        label: 'Entity Extraction' },
    { done: patterns.length > 0,         label: 'Risk Pattern Detection' },
    { done: !!analysis.trustScore,       label: 'Trust Score Computed' },
    { done: !!report?.executiveSummary,  label: 'Investigation Report' },
    { done: similar.length > 0,          label: 'Similar Incidents Found' },
    { done: !!ai,                        label: 'AI Deep Analysis' },
    { done: !!ai?.trustSignals,          label: 'Trust Signals (AI)' },
    { done: !!ai?.aiReport,              label: 'AI Investigation Report' },
    { done: !!ai?.communityMatch,        label: 'Community Intelligence' },
  ].filter(s => s.done);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors mt-0.5">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900">{analysis.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <Clock size={10} />
              {new Date(analysis.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              <span className="text-gray-300">·</span>
              <span className="capitalize">{analysis.sourcePlatform?.replace('-', ' ')}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={analysis.riskLevel} />
      </div>

      {/* Completed steps tags */}
      <div className="flex flex-wrap gap-1.5">
        {completedSteps.map(s => <DoneTag key={s.label} label={s.label} />)}
      </div>

      {/* Verdict banner */}
      {verdict && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${vstyle.bg} ${vstyle.border}`}>
          <FileWarning size={18} className={`${vstyle.icon} shrink-0 mt-0.5`} />
          <div>
            <p className={`text-sm font-bold ${vstyle.text}`}>{verdict.verdict}</p>
            <p className={`text-xs mt-0.5 ${vstyle.text} opacity-80`}>{verdict.description}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">

          {/* Trust Score */}
          <Section icon={Terminal} title="Trust Score">
            <div className="flex items-center gap-6">
              <RiskIndicator score={analysis.riskScore} />
              <div className="text-right">
                <p className="text-2xs text-gray-400 mb-0.5">Trust Score</p>
                <p className={`text-3xl font-bold mono ${analysis.trustScore >= 70 ? 'text-green-600' : analysis.trustScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                  {analysis.trustScore}<span className="text-sm font-normal text-gray-400">/100</span>
                </p>
                <p className="text-2xs text-gray-500 mt-0.5">{analysis.trustCategory}</p>
              </div>
            </div>
          </Section>

          {/* Executive Summary */}
          {report?.executiveSummary && (
            <Section icon={FileWarning} title="Executive Summary">
              <p className="text-sm text-gray-700 leading-relaxed">{report.executiveSummary}</p>
            </Section>
          )}

          {/* Risk Patterns */}
          <Section icon={AlertTriangle} title="Detected Risk Patterns" count={`${patterns.length} pattern${patterns.length !== 1 ? 's' : ''}`}>
            {patterns.length === 0 ? (
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <p className="text-xs text-green-700 font-medium">No risk patterns detected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {patterns.map((p, i) => <PatternCard key={i} p={p} />)}
              </div>
            )}
          </Section>

          {/* Score Breakdown */}
          {breakdown.length > 0 && (
            <Section icon={Activity} title="Score Breakdown">
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
            </Section>
          )}

          {/* Extracted Entities (graph) */}
          {graph.length > 0 && (
            <Section icon={Hash} title="Extracted Entities">
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
                              g.risk === 'High'   ? 'bg-red-50 text-red-700 border-red-200' :
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
            </Section>
          )}

          {/* Similar Incidents */}
          {similar.length > 0 && (
            <Section icon={Users} title="Related Incidents" count={`${similar.length} found`}>
              <div className="divide-y divide-gray-50">
                {similar.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                      <p className="text-2xs text-gray-400 mt-0.5">{item.type} · {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-gray-800 mono">{item.similarityScore}%</p>
                      <p className="text-2xs text-gray-400">match</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Recommended Actions */}
          {report?.recommendedActions?.length > 0 && (
            <Section icon={CheckCircle} title="Recommended Actions">
              <ol className="space-y-2">
                {report.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-gray-700">
                    <span className="mono text-gray-400 shrink-0 w-5">{String(i + 1).padStart(2, '0')}</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* ── AI DEEP ANALYSIS ── */}
          {ai && (
            <div className="border border-dashed border-violet-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-violet-500" />
                <p className="text-sm font-semibold text-gray-800">AI Deep Analysis</p>
                <span className="text-2xs px-1.5 py-0.5 bg-violet-50 text-violet-600 border border-violet-200 rounded font-medium">Groq / Llama3</span>
              </div>

              {/* Trust Signals */}
              {(ai.trustSignals?.positiveSignals?.length > 0 || ai.trustSignals?.negativeSignals?.length > 0) && (
                <Card className="!p-3">
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                    <Shield size={10} /> Trust Signals
                  </p>
                  {ai.trustSignals.overallAssessment && (
                    <p className="text-xs text-gray-600 italic mb-3 pb-2 border-b border-gray-100">{ai.trustSignals.overallAssessment}</p>
                  )}
                  {ai.trustSignals.positiveSignals?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-2xs font-semibold text-green-600 flex items-center gap-1 mb-1"><ThumbsUp size={9} /> Positive</p>
                      {ai.trustSignals.positiveSignals.map((s, i) => <TrustSignalRow key={i} s={s} />)}
                    </div>
                  )}
                  {ai.trustSignals.negativeSignals?.length > 0 && (
                    <div>
                      <p className="text-2xs font-semibold text-red-600 flex items-center gap-1 mb-1"><ThumbsDown size={9} /> Negative</p>
                      {ai.trustSignals.negativeSignals.map((s, i) => <TrustSignalRow key={i} s={s} negative />)}
                    </div>
                  )}
                </Card>
              )}

              {/* Key Findings */}
              {ai.aiReport?.keyFindings?.length > 0 && (
                <Card className="!p-3">
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                    <Search size={10} /> Key Findings
                  </p>
                  <ol className="space-y-1.5">
                    {ai.aiReport.keyFindings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="mono text-gray-400 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              )}

              {/* Evidence Collected */}
              {ai.aiReport?.evidenceCollected?.length > 0 && (
                <Card className="!p-3">
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                    <FileWarning size={10} /> Evidence Collected
                  </p>
                  <div className="space-y-1">
                    {ai.aiReport.evidenceCollected.map((e, i) => (
                      <p key={i} className="text-2xs mono bg-gray-50 border border-gray-100 rounded px-2 py-1 text-gray-700">{e}</p>
                    ))}
                  </div>
                </Card>
              )}

              {/* Community Intelligence */}
              {(ai.communityMatch || ai.aiReport?.communityIntelligence) && (
                <Card className="!p-3">
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                    <Users size={10} /> Community Intelligence
                  </p>
                  {ai.aiReport?.communityIntelligence && (
                    <p className="text-xs text-gray-700 mb-2">{ai.aiReport.communityIntelligence}</p>
                  )}
                  {ai.communityMatch?.threatLevel && (
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={10} className="text-gray-400" />
                      <span className="text-2xs font-semibold text-gray-600">Threat Level:</span>
                      <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded border ${
                        ai.communityMatch.threatLevel === 'Known Scam Network' ? 'bg-red-50 text-red-700 border-red-200' :
                        ai.communityMatch.threatLevel === 'Emerging Pattern'   ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>{ai.communityMatch.threatLevel}</span>
                    </div>
                  )}
                  {ai.communityMatch?.matchingFactors?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ai.communityMatch.matchingFactors.map((f, i) => (
                        <span key={i} className="text-2xs mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{f}</span>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* AI Recommendation */}
              {ai.aiReport?.recommendation && (
                <Card className="!p-3 bg-gray-50">
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                    <Brain size={10} /> AI Recommendation
                  </p>
                  <p className="text-xs font-bold text-gray-900 mb-1">{ai.aiReport.recommendation}</p>
                  {ai.aiReport.recommendationReason && (
                    <p className="text-xs text-gray-600">{ai.aiReport.recommendationReason}</p>
                  )}
                </Card>
              )}

              {/* AI Risk Patterns */}
              {ai.aiRiskPatterns?.length > 0 && (
                <Card className="!p-3">
                  <p className="text-2xs text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={10} className="text-violet-500" /> AI Detected Patterns
                  </p>
                  <div className="space-y-2">
                    {ai.aiRiskPatterns.map((p, i) => (
                      <div key={i} className={`rounded-lg border px-3 py-2 ${SEVERITY_COLORS[p.severity] || SEVERITY_COLORS.Low}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{p.pattern}</span>
                          <span className={`text-2xs px-1.5 py-0.5 rounded ${SEVERITY_COLORS[p.severity]}`}>{p.severity}</span>
                        </div>
                        {p.explanation && <p className="text-2xs mt-1 opacity-80">{p.explanation}</p>}
                        {p.evidence && <p className="text-2xs mono mt-1 bg-white bg-opacity-50 rounded px-1.5 py-0.5">"{p.evidence}"</p>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {!ai && (
            <div className="border border-dashed border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={13} className="text-gray-400" />
                <p className="text-xs font-medium text-gray-500">AI Deep Analysis not run yet</p>
              </div>
              <p className="text-2xs text-gray-400">Go to the Analyze page and run AI Deep Analysis on this investigation to unlock trust signals, key findings, and community intelligence.</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Analysis metadata */}
          <Card>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Details</p>
            <div className="space-y-0">
              {[
                { label: 'Source',       value: analysis.sourcePlatform?.replace('-', ' ') },
                { label: 'Risk Level',   value: analysis.riskLevel },
                { label: 'Trust Category', value: analysis.trustCategory },
                { label: 'Risk Score',   value: analysis.riskScore },
                { label: 'Trust Score',  value: analysis.trustScore },
                { label: 'Saved',        value: analysis.savedBy ? 'Yes' : 'No' },
                { label: 'Created',      value: new Date(analysis.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-medium text-gray-900 capitalize">{value ?? '—'}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Raw entity counts */}
          {Object.keys(entities).length > 0 && (
            <Card>
              <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Entities Found</p>
              <div className="space-y-0">
                {[
                  { label: 'Emails',    value: entities.emails?.length },
                  { label: 'Phones',    value: entities.phones?.length },
                  { label: 'URLs',      value: entities.urls?.length },
                  { label: 'Domains',   value: entities.domains?.length },
                  { label: 'Companies', value: entities.companies?.length },
                  { label: 'Free Emails Found', value: entities.hasFreeEmail ? 'Yes' : 'No' },
                  { label: 'Payment Keywords',  value: entities.hasPaymentKeyword ? 'Yes' : 'No' },
                ].filter(e => e.value !== undefined && e.value !== 0 && e.value !== null).map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className={`text-xs font-semibold mono ${
                      (label === 'Free Emails Found' || label === 'Payment Keywords') && value === 'Yes'
                        ? 'text-red-600' : 'text-gray-900'
                    }`}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Submitted content preview */}
          <Card>
            <p className="text-2xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Submitted Content</p>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-10">{analysis.content}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
