import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';

const groqChat = async (messages, temperature = 0.2) => {
  try {
    const res = await axios.post(
      GROQ_API_URL,
      { model: GROQ_MODEL, messages, temperature, max_tokens: 1024 },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return res.data.choices[0].message.content;
  } catch (err) {
    const detail = err.response?.data?.error?.message || err.message;
    throw new Error(`Groq API error: ${detail}`);
  }
};

const truncate = (str, max = 800) => (str?.length > max ? str.substring(0, max) + '...' : str || '');

// ─────────────────────────────────────────────
// SYSTEM PROMPT — defines the AI persona
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are TrustGraph AI — a professional Employment Fraud Investigation Assistant.

Your ONLY purpose is to help students detect job scams, fake recruiters, fraudulent internships, and suspicious employment opportunities BEFORE they pay money, share documents, or accept offers.

RULES:
- You are NOT a general chatbot. Refuse any off-topic questions.
- Never classify an opportunity as simply "fake" or "real". Always provide evidence-based reasoning.
- Every conclusion must cite specific evidence from the content provided.
- Never invent facts not present in the provided content.
- Always explain WHY something is risky, not just that it is.
- Be direct, professional, and concise.
- When asked about risk, always structure your response with: Finding → Evidence → Explanation.`;

// ─────────────────────────────────────────────
// MODULE 1: ENTITY EXTRACTION
// ─────────────────────────────────────────────
const extractEntitiesAI = async (content, language = 'en') => {
  const langNote = language !== 'en' ? `The content may be in Hindi, Gujarati, or mixed language. Extract entities regardless of language.` : '';

  const prompt = `${langNote}
Analyze this employment-related content and extract all entities.

CONTENT:
"""
${truncate(content)}
"""

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "company": "",
  "recruiter": "",
  "emails": [],
  "phones": [],
  "urls": [],
  "domains": [],
  "salary": "",
  "joining_date": "",
  "location": "",
  "job_role": "",
  "fees_detected": [],
  "registration_fee": "",
  "training_fee": "",
  "security_deposit": "",
  "interview_fee": "",
  "payment_methods": [],
  "language_detected": ""
}

For fees_detected, list all fee/payment demands found with amounts if present.
If a field is not found, use empty string "" or empty array [].`;

  const raw = await groqChat([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: prompt },
  ]);

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    return {};
  }
};

// ─────────────────────────────────────────────
// MODULE 2: RISK PATTERN DETECTION
// ─────────────────────────────────────────────
const detectRiskPatternsAI = async (content, existingPatterns = []) => {
  const existingSummary = existingPatterns.length
    ? `Rule-based engine already detected: ${existingPatterns.map(p => p.type).join(', ')}.`
    : '';

  const prompt = `${existingSummary}

Analyze this employment content for fraud patterns as an Employment Fraud Investigator.

CONTENT:
"""
${truncate(content)}
"""

Detect ALL fraud patterns present. For each pattern return JSON array (no markdown):
[
  {
    "pattern": "pattern name",
    "severity": "Low|Medium|High|Critical",
    "confidence": 0.0 to 1.0,
    "evidence": "exact quote or phrase from content that triggered this",
    "explanation": "why this is a red flag in 1-2 sentences"
  }
]

Check for: Registration Fee, Training Fee, Security Deposit, Interview Fee, Telegram-Only Contact, WhatsApp-Only Contact, Gmail/Yahoo Recruiter, Unrealistic Salary, Urgent Joining Pressure, No Official Website, Missing Company Info, Fake HR Language, Generic Offer Letter, Personal Bank Account Payment, Credential Harvesting, Company Impersonation, Government Job Fraud.

Return empty array [] if no patterns found.`;

  const raw = await groqChat([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: prompt },
  ], 0.1);

  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    return [];
  }
};

// ─────────────────────────────────────────────
// MODULE 3: TRUST SIGNALS
// ─────────────────────────────────────────────
const analyzeTrustSignalsAI = async (content, entities = {}) => {
  const prompt = `As an Employment Fraud Investigator, identify trust signals in this content.

CONTENT:
"""
${truncate(content)}
"""

EXTRACTED ENTITIES: ${JSON.stringify(entities)}

Return ONLY JSON (no markdown):
{
  "positiveSignals": [
    { "signal": "description", "evidence": "quote from content", "weight": "Low|Medium|High" }
  ],
  "negativeSignals": [
    { "signal": "description", "evidence": "quote from content", "weight": "Low|Medium|High" }
  ],
  "overallAssessment": "one sentence professional assessment"
}

Positive signals: official domain, company website, proper letterhead, LinkedIn profile, standard job requirements, realistic salary, proper HR process.
Negative signals: free email, payment demand, unrealistic salary, urgency, missing company info, WhatsApp/Telegram only, vague description.`;

  const raw = await groqChat([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: prompt },
  ], 0.2);

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { positiveSignals: [], negativeSignals: [], overallAssessment: '' };
  } catch {
    return { positiveSignals: [], negativeSignals: [], overallAssessment: '' };
  }
};

// ─────────────────────────────────────────────
// MODULE 4: INVESTIGATION REPORT
// ─────────────────────────────────────────────
const generateAIInvestigationReport = async ({
  content, trustScore, trustCategory, riskPatterns,
  extractedEntities, similarIncidents, communityReportCount, language = 'en',
}) => {
  const langInstruction = language === 'hi'
    ? 'Generate the report in Hindi (Devanagari script).'
    : language === 'gu'
    ? 'Generate the report in Gujarati.'
    : 'Generate the report in English.';

  const prompt = `${langInstruction}

You are generating a professional Employment Fraud Investigation Report.

ANALYSIS DATA:
- Trust Score: ${trustScore}/100 (${trustCategory})
- Risk Patterns: ${JSON.stringify(riskPatterns?.slice(0, 8))}
- Extracted Entities: ${JSON.stringify(extractedEntities)}
- Similar Incidents: ${similarIncidents?.length || 0} found
- Community Reports Matching: ${communityReportCount || 0}

ORIGINAL CONTENT (excerpt):
"""
${truncate(content, 600)}
"""

Generate a structured investigation report as JSON (no markdown):
{
  "executiveSummary": "2-3 sentence professional summary of findings",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "riskIndicators": [
    { "indicator": "", "severity": "Low|Medium|High|Critical", "evidence": "" }
  ],
  "evidenceCollected": ["evidence item 1", "evidence item 2"],
  "communityIntelligence": "assessment based on community report count and similar incidents",
  "trustAssessment": "professional trust assessment paragraph",
  "recommendation": "Safe To Proceed|Proceed With Caution|Additional Verification Required|Avoid Opportunity",
  "recommendationReason": "why this recommendation was made, citing specific evidence",
  "immediateActions": ["action 1", "action 2", "action 3"]
}

Base every statement on evidence. Never invent facts.`;

  const raw = await groqChat([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: prompt },
  ], 0.2);

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// MODULE 5: EXPLAINABILITY — Q&A
// ─────────────────────────────────────────────
const explainAnalysis = async ({ question, analysisData, language = 'en' }) => {
  const langInstruction = language === 'hi'
    ? 'Answer in Hindi.'
    : language === 'gu'
    ? 'Answer in Gujarati.'
    : 'Answer in English.';

  const context = `
Trust Score: ${analysisData.trustScore}/100 (${analysisData.trustCategory})
Risk Level: ${analysisData.riskLevel}
Risk Patterns: ${analysisData.riskPatterns?.map(p => `${p.type} (${p.severity}, ${p.confidence}% confidence)`).join(', ') || 'None'}
Extracted Entities: ${JSON.stringify(analysisData.extractedEntities || {})}
Similar Incidents Found: ${analysisData.similarIncidents?.length || 0}
Community Reports: ${analysisData.communityReportCount || 0}
Executive Summary: ${analysisData.investigationReport?.executiveSummary || ''}
`;

  const prompt = `${langInstruction}

A student is asking about their employment fraud investigation result.

INVESTIGATION CONTEXT:
${context}

STUDENT QUESTION: "${question}"

Answer as a professional Employment Fraud Investigator. Be specific, cite evidence from the analysis, and be helpful to the student. Keep answer under 200 words. Structure with numbered points if listing multiple reasons.`;

  return await groqChat([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: prompt },
  ], 0.3);
};

// ─────────────────────────────────────────────
// MODULE 6: MULTILINGUAL ANALYSIS
// ─────────────────────────────────────────────
const detectLanguageAndAnalyze = async (content) => {
  const prompt = `Detect the primary language of this content and translate key scam-related phrases to English for analysis.

CONTENT:
"""
${truncate(content, 500)}
"""

Return JSON (no markdown):
{
  "detectedLanguage": "en|hi|gu|mixed",
  "languageName": "English|Hindi|Gujarati|Mixed",
  "translatedKeyPhrases": ["phrase1 in English", "phrase2 in English"],
  "scamKeywordsFound": ["keyword1", "keyword2"],
  "shouldAnalyzeInOriginal": true
}`;

  const raw = await groqChat([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: prompt },
  ], 0.1);

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { detectedLanguage: 'en', languageName: 'English' };
  } catch {
    return { detectedLanguage: 'en', languageName: 'English' };
  }
};

// ─────────────────────────────────────────────
// MODULE 7: COMMUNITY REPORT MATCHING
// ─────────────────────────────────────────────
const matchCommunityReports = async ({ entities, similarIncidents }) => {
  if (!similarIncidents?.length) {
    return { similarReports: [], matchPercentage: 0, matchingFactors: [], summary: 'No similar incidents found in the community database.' };
  }

  const prompt = `Analyze these similar community incidents for an employment fraud investigation.

EXTRACTED ENTITIES FROM CURRENT SUBMISSION: ${JSON.stringify(entities)}

SIMILAR INCIDENTS FOUND: ${JSON.stringify(similarIncidents?.slice(0, 5))}

Return JSON (no markdown):
{
  "similarReports": [
    { "id": "", "title": "", "matchReason": "why it matches", "matchStrength": "Low|Medium|High" }
  ],
  "matchPercentage": 0,
  "matchingFactors": ["factor1", "factor2"],
  "summary": "1-2 sentence summary of community intelligence findings",
  "threatLevel": "Isolated|Emerging Pattern|Known Scam Network"
}`;

  const raw = await groqChat([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: prompt },
  ], 0.2);

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { similarReports: [], matchPercentage: 0, matchingFactors: [], summary: '' };
  } catch {
    return { similarReports: [], matchPercentage: 0, matchingFactors: [], summary: '' };
  }
};

// ─────────────────────────────────────────────
// MODULE 8: GRAPH ENRICHMENT DATA
// ─────────────────────────────────────────────
const generateGraphData = async (entities, patterns) => {
  const nodes = [];
  const relationships = [];

  // Build nodes from entities
  if (entities.company)    nodes.push({ type: 'Company',    value: entities.company,    risk: 'Unknown' });
  if (entities.recruiter)  nodes.push({ type: 'Recruiter',  value: entities.recruiter,  risk: 'Unknown' });
  entities.emails?.forEach(e  => nodes.push({ type: 'Email',  value: e,  risk: e.includes('gmail') || e.includes('yahoo') ? 'High' : 'Low' }));
  entities.phones?.forEach(p  => nodes.push({ type: 'Phone',  value: p,  risk: 'Medium' }));
  entities.domains?.forEach(d => nodes.push({ type: 'Domain', value: d,  risk: 'Unknown' }));
  entities.urls?.forEach(u    => nodes.push({ type: 'URL',    value: u,  risk: 'Medium' }));

  // Build relationships
  if (entities.recruiter && entities.company) relationships.push({ from: entities.recruiter, rel: 'RECRUITER_WORKS_FOR', to: entities.company });
  entities.emails?.forEach(e => {
    if (entities.recruiter) relationships.push({ from: entities.recruiter, rel: 'USES_EMAIL', to: e });
    if (entities.company)   relationships.push({ from: entities.company,   rel: 'HAS_DOMAIN',  to: e.split('@')[1] || e });
  });
  entities.phones?.forEach(p => {
    if (entities.recruiter) relationships.push({ from: entities.recruiter, rel: 'USES_PHONE', to: p });
  });
  patterns.forEach(p => {
    nodes.push({ type: 'RiskPattern', value: p.pattern || p.type, risk: p.severity });
    if (entities.company) relationships.push({ from: entities.company, rel: 'CONNECTED_TO_PATTERN', to: p.pattern || p.type });
  });

  return { nodes, relationships };
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────────
// FULL AI ANALYSIS PIPELINE
// ─────────────────────────────────────────────
const runFullAIAnalysis = async ({ content, trustScore, trustCategory, riskLevel, riskPatterns, extractedEntities, similarIncidents, communityReportCount, language }) => {
  // Detect language first
  const langData = await detectLanguageAndAnalyze(content);
  const detectedLang = language || langData.detectedLanguage || 'en';

  await sleep(2000);
  const aiEntities = await extractEntitiesAI(content, detectedLang);

  await sleep(2000);
  const aiPatterns = await detectRiskPatternsAI(content, riskPatterns);

  await sleep(2000);
  const trustSignals = await analyzeTrustSignalsAI(content, extractedEntities);

  await sleep(2000);
  const aiReport = await generateAIInvestigationReport({ content, trustScore, trustCategory, riskPatterns, extractedEntities, similarIncidents, communityReportCount, language: detectedLang });

  await sleep(2000);
  const communityMatch = await matchCommunityReports({ entities: extractedEntities, similarIncidents });

  const graphData = await generateGraphData(extractedEntities, riskPatterns);

  return {
    languageDetected:    langData,
    aiExtractedEntities: aiEntities,
    aiRiskPatterns:      aiPatterns,
    trustSignals,
    aiReport,
    communityMatch,
    graphData,
  };
};

export {
  runFullAIAnalysis,
  extractEntitiesAI,
  detectRiskPatternsAI,
  analyzeTrustSignalsAI,
  generateAIInvestigationReport,
  explainAnalysis,
  detectLanguageAndAnalyze,
  matchCommunityReports,
  generateGraphData,
};
