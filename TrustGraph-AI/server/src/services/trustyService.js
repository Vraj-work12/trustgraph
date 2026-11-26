import axios from 'axios';
import Analysis      from '../models/Analysis.js';
import CommunityReport from '../models/CommunityReport.js';
import Recruiter     from '../models/Recruiter.js';
import OfferLetter   from '../models/OfferLetter.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';

const truncate = (str, max = 600) => str?.length > max ? str.substring(0, max) + '...' : (str || '');
const sleep    = (ms) => new Promise(r => setTimeout(r, ms));

const groq = async (messages) => {
  try {
    const res = await axios.post(
      GROQ_API_URL,
      { model: GROQ_MODEL, messages, temperature: 0.3, max_tokens: 700 },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return res.data.choices[0].message.content;
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    if (msg.includes('Rate limit')) throw new Error('RATE_LIMIT');
    throw new Error(msg);
  }
};

const TRUSTY_SYSTEM = `You are Trusty — the AI fraud investigation copilot for TrustGraph AI.

Your ONLY purpose is helping students detect employment scams, fake recruiters, fraudulent job offers, and suspicious internships.

RULES:
- Always reason using ONLY the CONTEXT DATA provided below — never hallucinate facts.
- If context is insufficient, say: "I couldn't find enough evidence in the platform data to support a conclusion."
- Structure every response as: Finding → Evidence → Recommendation.
- Be concise, professional, and evidence-based.
- Refuse any off-topic questions politely.
- Never say "this is definitely a scam" without evidence — say "this shows X red flags because Y".`;

// ─────────────────────────────────────────────
// INTENT DETECTION
// ─────────────────────────────────────────────
const INTENTS = {
  ANALYSIS_EXPLAIN:    /why.*(risk|score|flag|suspicious|high|low)|explain.*(analysis|result|finding)|what.*wrong|red flag/i,
  RECRUITER_CHECK:     /recruiter|hr|hiring manager|this person|is .* legit|verify|check.*person/i,
  COMPANY_CHECK:       /company|organisation|organization|is .* real|fake company/i,
  OFFER_LETTER:        /offer letter|clause|contract|suspicious clause|joining letter/i,
  COMMUNITY_INTEL:     /anyone report|community|seen before|similar scam|reported|other victims/i,
  SCAM_EDUCATION:      /how does|what is|explain.*scam|registration fee scam|whatsapp.*recruit|how.*work/i,
  TRUST_SCORE:         /trust score|score mean|what.*\d+.*mean|score.*\d+/i,
  SIMILAR_INCIDENTS:   /similar|like this|same pattern|other cases|related/i,
  ONBOARDING:          /how.*use|getting started|what can|show me|tutorial|help me|new here/i,
};

const detectIntent = (message) => {
  for (const [intent, pattern] of Object.entries(INTENTS)) {
    if (pattern.test(message)) return intent;
  }
  return 'GENERAL';
};

// ─────────────────────────────────────────────
// CONTEXT RETRIEVERS (MongoDB RAG)
// ─────────────────────────────────────────────

const retrieveAnalysisContext = async (userId, analysisId) => {
  if (analysisId) {
    const a = await Analysis.findById(analysisId).lean();
    if (a) return formatAnalysis(a);
  }
  // Fall back to most recent
  const recent = await Analysis.findOne({ userId }).sort({ createdAt: -1 }).lean();
  return recent ? formatAnalysis(recent) : null;
};

const formatAnalysis = (a) => ({
  title:          a.title,
  trustScore:     a.trustScore,
  riskScore:      a.riskScore,
  trustCategory:  a.trustCategory,
  riskLevel:      a.riskLevel,
  riskPatterns:   a.riskPatterns?.slice(0, 6).map(p => `${p.type} (${p.severity}, ${p.confidence}% confidence)`),
  flags:          a.flags?.slice(0, 5),
  executiveSummary: a.investigationReport?.executiveSummary,
  recommendedActions: a.investigationReport?.recommendedActions?.slice(0, 4),
  extractedEntities: {
    emails:   a.extractedEntities?.emails?.slice(0, 3),
    phones:   a.extractedEntities?.phones?.slice(0, 3),
    domains:  a.extractedEntities?.domains?.slice(0, 3),
    companies:a.extractedEntities?.companies?.slice(0, 2),
    hasFreeEmail: a.extractedEntities?.hasFreeEmail,
    hasPaymentKeyword: a.extractedEntities?.hasPaymentKeyword,
  },
  similarIncidents: a.similarIncidents?.length,
  aiTrustSignals: a.aiAnalysis?.trustSignals?.overallAssessment,
  aiRecommendation: a.aiAnalysis?.aiReport?.recommendation,
  scoreBreakdown: a.scoreBreakdown?.slice(0, 5),
  createdAt: a.createdAt,
});

const retrieveRecruiterContext = async (userId, query) => {
  // Try to find matching recruiter by name/company extracted from query
  const recruiters = await Recruiter.find().sort({ createdAt: -1 }).limit(10).lean();
  return recruiters.slice(0, 3).map(r => ({
    name:               r.name,
    company:            r.company,
    email:              r.email,
    verificationStatus: r.verificationStatus,
    verificationScore:  r.verificationScore,
    domainMatch:        r.domainMatch,
    communityReports:   r.communityReportCount,
    riskExplanation:    r.riskExplanation,
    evidence:           r.evidence?.slice(0, 3),
  }));
};

const retrieveCommunityContext = async (query) => {
  const reports = await CommunityReport.find({ status: { $ne: 'Dismissed' } })
    .sort({ verificationCount: -1, createdAt: -1 })
    .limit(5)
    .lean();
  return reports.map(r => ({
    title:        r.title,
    type:         r.reportType,
    company:      r.companyName,
    recruiter:    r.recruiterName,
    email:        r.email,
    riskCategory: r.riskCategory,
    description:  truncate(r.description, 200),
    status:       r.status,
    verifications:r.verificationCount,
  }));
};

const retrieveUserHistory = async (userId) => {
  const [analyses, reports, recruiters] = await Promise.all([
    Analysis.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    CommunityReport.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
    Recruiter.find().sort({ createdAt: -1 }).limit(3).lean(),
  ]);
  return {
    totalAnalyses:   analyses.length,
    highRiskFound:   analyses.filter(a => a.riskLevel === 'High Risk').length,
    recentAnalyses:  analyses.slice(0, 3).map(a => ({ title: a.title, riskLevel: a.riskLevel, trustScore: a.trustScore })),
    reportsFiledBy:  reports.length,
    recruitersChecked: recruiters.length,
  };
};

// ─────────────────────────────────────────────
// GRAPH-STYLE RELATIONSHIP RETRIEVAL
// ─────────────────────────────────────────────
const retrieveGraphContext = async (analysisId, userId) => {
  const analysis = analysisId
    ? await Analysis.findById(analysisId).lean()
    : await Analysis.findOne({ userId }).sort({ createdAt: -1 }).lean();

  if (!analysis) return null;

  const entities  = analysis.extractedEntities || {};
  const emails    = entities.emails || [];
  const phones    = entities.phones || [];
  const companies = entities.companies || [];

  // Find community reports matching any entity (graph traversal over MongoDB)
  const relatedReports = emails.length || phones.length || companies.length
    ? await CommunityReport.find({
        $or: [
          ...emails.map(e    => ({ email:       { $regex: e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } })),
          ...phones.map(p    => ({ phone:       { $regex: p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } })),
          ...companies.map(c => ({ companyName: { $regex: c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } })),
        ],
      }).limit(4).lean()
    : [];

  return {
    entities: {
      emails,
      phones,
      domains:   entities.domains || [],
      companies,
      hasFreeEmail:       entities.hasFreeEmail,
      hasPaymentKeyword:  entities.hasPaymentKeyword,
    },
    patterns:       analysis.riskPatterns?.slice(0, 5).map(p => `${p.type} (${p.severity})`),
    relatedReports: relatedReports.map(r => ({
      title:    r.title,
      company:  r.companyName,
      type:     r.reportType,
      status:   r.status,
    })),
    graphSummary: `${relatedReports.length} community reports share entities with this analysis.`,
  };
};

// ─────────────────────────────────────────────
// CONTEXT ASSEMBLER
// ─────────────────────────────────────────────
const assembleContext = async ({ intent, userId, analysisId, query }) => {
  const parts = [];

  if (['ANALYSIS_EXPLAIN', 'TRUST_SCORE', 'SIMILAR_INCIDENTS', 'GENERAL'].includes(intent)) {
    const a = await retrieveAnalysisContext(userId, analysisId);
    if (a) parts.push(`CURRENT ANALYSIS:\n${JSON.stringify(a, null, 1)}`);
  }

  if (['RECRUITER_CHECK', 'COMPANY_CHECK'].includes(intent)) {
    const r = await retrieveRecruiterContext(userId, query);
    if (r.length) parts.push(`RECRUITER DATABASE:\n${JSON.stringify(r, null, 1)}`);
    const a = await retrieveAnalysisContext(userId, analysisId);
    if (a) parts.push(`CURRENT ANALYSIS:\n${JSON.stringify(a, null, 1)}`);
  }

  if (['COMMUNITY_INTEL', 'SIMILAR_INCIDENTS'].includes(intent)) {
    const c = await retrieveCommunityContext(query);
    if (c.length) parts.push(`COMMUNITY REPORTS:\n${JSON.stringify(c, null, 1)}`);
    const g = await retrieveGraphContext(analysisId, userId);
    if (g) parts.push(`GRAPH CONNECTIONS:\n${JSON.stringify(g, null, 1)}`);
  }

  if (intent === 'ONBOARDING') {
    const h = await retrieveUserHistory(userId);
    parts.push(`USER ACTIVITY:\n${JSON.stringify(h, null, 1)}`);
  }

  if (parts.length === 0) {
    // General fallback — give user history + recent analysis
    const [h, a] = await Promise.all([
      retrieveUserHistory(userId),
      retrieveAnalysisContext(userId, analysisId),
    ]);
    if (h) parts.push(`USER ACTIVITY:\n${JSON.stringify(h, null, 1)}`);
    if (a) parts.push(`MOST RECENT ANALYSIS:\n${JSON.stringify(a, null, 1)}`);
  }

  return parts.join('\n\n---\n\n');
};

// ─────────────────────────────────────────────
// MAIN TRUSTY CHAT
// ─────────────────────────────────────────────
const trustyChat = async ({ userId, message, history = [], analysisId, context: pageContext }) => {
  const intent = detectIntent(message);

  // Retrieve platform data
  const platformContext = await assembleContext({ intent, userId, analysisId, query: message });

  const systemMessage = `${TRUSTY_SYSTEM}

PLATFORM CONTEXT DATA:
${platformContext || 'No platform data available yet.'}

${pageContext ? `CURRENT PAGE CONTEXT: ${JSON.stringify(pageContext)}` : ''}

DETECTED INTENT: ${intent}

Respond in this structure (use plain text, no markdown headers):
1. Finding: [what you found]
2. Evidence: [specific data points from the context above]  
3. Recommendation: [what the user should do]

Keep response under 180 words. Be specific — cite actual numbers, names, patterns from the data.`;

  // Build message history (last 4 turns to stay under TPM)
  const messages = [
    { role: 'system', content: systemMessage },
    ...history.slice(-4).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  const response = await groq(messages);
  return { response, intent };
};

// ─────────────────────────────────────────────
// PROACTIVE SUGGESTION GENERATOR
// ─────────────────────────────────────────────
const getProactiveSuggestion = async ({ userId, analysisId, page }) => {
  if (page === 'analyze' && analysisId) {
    const a = await Analysis.findById(analysisId).lean();
    if (!a) return null;
    if (a.riskLevel === 'High Risk') {
      return `I found ${a.riskPatterns?.length || 0} risk patterns in this analysis. The trust score is ${a.trustScore}/100. Would you like me to explain the most critical findings?`;
    }
    if (!a.aiAnalysis) {
      return `The rule-based scan is complete. Run AI Deep Analysis for trust signals, key findings, and community intelligence on this job.`;
    }
  }
  if (page === 'dashboard') {
    const h = await retrieveUserHistory(userId);
    if (h.highRiskFound > 0) {
      return `You have ${h.highRiskFound} high-risk analysis result${h.highRiskFound > 1 ? 's' : ''}. Ask me to review any of them.`;
    }
    if (h.totalAnalyses === 0) {
      return `Welcome! I'm Trusty, your fraud investigation copilot. Paste any job description, email, or recruiter message — I'll help you detect scams before they harm you.`;
    }
  }
  if (page === 'verify-recruiter') {
    return `I can investigate any recruiter using community reports and platform data. Ask me: "Is this recruiter trustworthy?"`;
  }
  if (page === 'community-reports') {
    return `I have access to all community reports. Ask me about scam patterns, reported companies, or "Have others reported this recruiter?"`;
  }
  return null;
};

export { trustyChat, getProactiveSuggestion, detectIntent };
