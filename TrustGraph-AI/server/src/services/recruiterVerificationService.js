import axios from 'axios';
import dns   from 'dns';
import { promisify } from 'util';
import CommunityReport from '../models/CommunityReport.js';
import Analysis        from '../models/Analysis.js';
import { extractDomain, isFreeEmail } from './entityExtractor.js';

const resolveMx  = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';

// ─────────────────────────────────────────────
// KNOWN COMPANY DOMAIN MAP
// ─────────────────────────────────────────────
const COMPANY_DOMAINS = {
  tcs: 'tcs.com', infosys: 'infosys.com', wipro: 'wipro.com',
  accenture: 'accenture.com', ibm: 'ibm.com', amazon: 'amazon.in',
  google: 'google.com', microsoft: 'microsoft.com', flipkart: 'flipkart.com',
  paytm: 'paytm.com', swiggy: 'swiggy.com', zomato: 'zomato.com',
  byjus: 'byjus.com', razorpay: 'razorpay.com', hdfc: 'hdfcbank.com',
  icici: 'icicibank.com', deloitte: 'deloitte.com', capgemini: 'capgemini.com',
  cognizant: 'cognizant.com', hcl: 'hcltech.com', tech: 'techmahindra.com',
  mahindra: 'techmahindra.com', oracle: 'oracle.com', sap: 'sap.com',
  pwc: 'pwc.com', kpmg: 'kpmg.com', ey: 'ey.com', ernst: 'ey.com',
  naukri: 'naukri.com', linkedin: 'linkedin.com', freshworks: 'freshworks.com',
  zoho: 'zoho.com', ola: 'olacabs.com', uber: 'uber.com',
  meesho: 'meesho.com', phonepe: 'phonepe.com', myntra: 'myntra.com',
};

// VOIP / suspicious phone patterns (Indian)
const VOIP_PREFIXES = ['70', '71', '72', '91707', '91708'];
const BURNER_PATTERNS = [/(\d)\1{7,}/]; // e.g. 9999999999

const normalizeCompany = (n) => n.toLowerCase().replace(/[^a-z]/g, '');

// ─────────────────────────────────────────────
// A. DNS DOMAIN LOOKUP — MX + TXT records
// ─────────────────────────────────────────────
const checkDomainDNS = async (domain) => {
  if (!domain) return { hasMx: false, hasSPF: false, exists: false, mxRecords: [] };
  try {
    const [mxRecords, txtRecords] = await Promise.allSettled([
      resolveMx(domain),
      resolveTxt(domain),
    ]);

    const mx  = mxRecords.status  === 'fulfilled' ? mxRecords.value  : [];
    const txt = txtRecords.status === 'fulfilled' ? txtRecords.value.flat() : [];
    const hasSPF = txt.some(t => t.startsWith('v=spf'));

    return {
      exists:     mx.length > 0,
      hasMx:      mx.length > 0,
      hasSPF,
      mxRecords:  mx.slice(0, 3).map(r => r.exchange),
      spfRecord:  txt.find(t => t.startsWith('v=spf')) || null,
    };
  } catch {
    return { exists: false, hasMx: false, hasSPF: false, mxRecords: [] };
  }
};

// ─────────────────────────────────────────────
// B. DOMAIN REACHABILITY — HTTP HEAD
// ─────────────────────────────────────────────
const checkDomainReachability = async (domain) => {
  if (!domain) return { reachable: false, statusCode: null, finalUrl: null };
  try {
    const res = await axios.head(`https://${domain}`, {
      timeout: 6000,
      maxRedirects: 3,
      validateStatus: () => true,
    });
    return {
      reachable:  res.status < 500,
      statusCode: res.status,
      finalUrl:   res.request?.res?.responseUrl || `https://${domain}`,
      isParked:   res.headers?.['x-powered-by']?.includes('GoDaddy') || false,
    };
  } catch {
    // Try http fallback
    try {
      const res2 = await axios.head(`http://${domain}`, { timeout: 5000, maxRedirects: 3, validateStatus: () => true });
      return { reachable: res2.status < 500, statusCode: res2.status, finalUrl: `http://${domain}`, isParked: false };
    } catch {
      return { reachable: false, statusCode: null, finalUrl: null };
    }
  }
};

// ─────────────────────────────────────────────
// C. WIKIPEDIA COMPANY LOOKUP
// ─────────────────────────────────────────────
const checkCompanyWikipedia = async (company) => {
  try {
    const res = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action:   'query',
        list:     'search',
        srsearch: company,
        srlimit:  3,
        srprop:   'snippet|titlesnippet',
        format:   'json',
        origin:   '*',
      },
      timeout: 6000,
    });

    const results = res.data?.query?.search || [];
    if (!results.length) return { found: false, results: [] };

    const companyKey = normalizeCompany(company);
    // Check if any result title closely matches the company name
    const topMatch = results[0];
    const titleKey = normalizeCompany(topMatch.title);
    const isMatch  = titleKey.includes(companyKey.substring(0, 5)) || companyKey.includes(titleKey.substring(0, 5));

    // Strip HTML from snippet
    const cleanSnippet = (s) => s.replace(/<[^>]+>/g, '').trim();

    return {
      found:    isMatch,
      topTitle: topMatch.title,
      snippet:  cleanSnippet(topMatch.snippet),
      results:  results.slice(0, 2).map(r => ({ title: r.title, snippet: cleanSnippet(r.snippet) })),
    };
  } catch {
    return { found: false, results: [] };
  }
};

// ─────────────────────────────────────────────
// 1. EMAIL RISK ENGINE
// ─────────────────────────────────────────────
const analyzeEmail = (email, company) => {
  const domain      = extractDomain(email);
  const companyKey  = normalizeCompany(company);
  const officialDomain = Object.entries(COMPANY_DOMAINS).find(([k]) =>
    companyKey.includes(k) || k.includes(companyKey.substring(0, 4))
  )?.[1];

  const free = isFreeEmail(email);
  const isImpersonation = !free && officialDomain && domain !== officialDomain;

  // Domain age risk heuristic — suspicious TLDs
  const suspiciousTLDs = ['.tk', '.xyz', '.top', '.cc', '.pw', '.click', '.info'];
  const domainAgeRisk = suspiciousTLDs.some(t => domain?.endsWith(t)) ? 'Suspicious' : 'OK';

  let match = false;
  let matchReason = '';
  if (free) {
    matchReason = `Free email provider (${domain}) — not a corporate address`;
  } else if (isImpersonation) {
    matchReason = `Possible impersonation — ${company}'s official domain is ${officialDomain}, but uses ${domain}`;
  } else if (officialDomain && domain === officialDomain) {
    match = true;
    matchReason = `Email domain ${domain} matches official ${company} domain`;
  } else {
    // Fuzzy: company name in domain
    const domainBase = domain?.split('.')[0] || '';
    match = domainBase.includes(companyKey.substring(0, 4)) || companyKey.includes(domainBase);
    matchReason = match
      ? `Email domain ${domain} is consistent with ${company}`
      : `Email domain ${domain} could not be verified against ${company}`;
  }

  return {
    match,
    matchReason,
    isFreeEmail:     free,
    emailDomain:     domain,
    isImpersonation: !!isImpersonation,
    officialDomain:  officialDomain || null,
    domainAgeRisk,
  };
};

// ─────────────────────────────────────────────
// 2. PHONE RISK ENGINE
// ─────────────────────────────────────────────
const analyzePhone = (phone) => {
  if (!phone) return { riskLevel: 'Unknown', isVoip: false, isBurner: false };

  const digits = phone.replace(/\D/g, '');
  const isBurner = BURNER_PATTERNS.some(p => p.test(digits));
  const isVoip   = VOIP_PREFIXES.some(p => digits.startsWith(p));

  // Sequential digits check (12345678)
  let isSequential = false;
  const d = digits.slice(-8);
  if (d === '12345678' || d === '87654321' || d === '00000000') isSequential = true;

  let riskLevel = 'Low';
  if (isBurner || isSequential) riskLevel = 'High';
  else if (isVoip)              riskLevel = 'Medium';

  return { riskLevel, isVoip, isBurner, isSequential };
};

// ─────────────────────────────────────────────
// 3. LINKEDIN RISK ENGINE
// ─────────────────────────────────────────────
const analyzeLinkedIn = (url, name, company) => {
  if (!url) return { provided: false, urlValid: false, profileConsistent: false, riskNote: 'No LinkedIn profile provided' };

  const isLinkedIn = /linkedin\.com\/in\//i.test(url);
  if (!isLinkedIn) return { provided: true, urlValid: false, profileConsistent: false, riskNote: 'URL is not a valid LinkedIn profile link' };

  // Check if name appears in URL slug
  const slug = url.split('/in/')[1]?.split('/')[0]?.toLowerCase() || '';
  const nameParts = name.toLowerCase().split(' ');
  const profileConsistent = nameParts.some(p => p.length > 2 && slug.includes(p));

  return {
    provided: true,
    urlValid: true,
    profileConsistent,
    riskNote: profileConsistent
      ? 'LinkedIn URL slug is consistent with recruiter name'
      : 'LinkedIn URL slug does not match recruiter name — verify manually',
  };
};

// ─────────────────────────────────────────────
// 4. IMPERSONATION DETECTOR
// ─────────────────────────────────────────────
const detectImpersonation = (email, company, emailAnalysis) => {
  const flags = [];
  if (emailAnalysis.isImpersonation)
    flags.push(`Email domain mimics ${company} but uses ${emailAnalysis.emailDomain} instead of ${emailAnalysis.officialDomain}`);
  if (emailAnalysis.isFreeEmail)
    flags.push(`Legitimate companies like ${company} never recruit from Gmail/Yahoo/Hotmail`);
  if (emailAnalysis.domainAgeRisk === 'Suspicious')
    flags.push(`Email domain ${emailAnalysis.emailDomain} uses a suspicious TLD commonly used in scam domains`);

  const companyKey = normalizeCompany(company);
  const knownBig = ['amazon','google','microsoft','tcs','infosys','wipro','flipkart','paytm'];
  if (knownBig.includes(companyKey) && emailAnalysis.isFreeEmail)
    flags.push(`${company} is a known major company — they exclusively use official corporate emails`);

  return flags;
};

// ─────────────────────────────────────────────
// 5. CROSS-REFERENCE WITH ANALYSES
// ─────────────────────────────────────────────
const crossReferenceAnalyses = async (email, phone, company) => {
  const queries = [
    { 'extractedEntities.emails': { $regex: email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
  ];
  if (phone) queries.push({ 'extractedEntities.phones': { $regex: phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
  if (company) queries.push({ 'extractedEntities.companies': { $regex: company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });

  const analyses = await Analysis.find({ $or: queries })
    .select('title riskLevel trustScore riskPatterns createdAt')
    .limit(5)
    .lean();

  return analyses.map(a => ({
    title:     a.title,
    riskLevel: a.riskLevel,
    trustScore:a.trustScore,
    patterns:  a.riskPatterns?.slice(0, 3).map(p => p.type),
  }));
};

// ─────────────────────────────────────────────
// 6. SCORE ENGINE
// ─────────────────────────────────────────────
const computeScore = ({ emailAnalysis, phoneAnalysis, linkedinAnalysis, communityReportCount, companyReportCount, impersonationFlags, linkedAnalyses, domainDNS, domainReach, wikiResult }) => {
  let score = 60;
  const breakdown = [];

  if (emailAnalysis.match) {
    score += 25; breakdown.push({ factor: 'Email domain verified', delta: +25, reason: emailAnalysis.matchReason });
  }
  if (emailAnalysis.isFreeEmail) {
    score -= 20; breakdown.push({ factor: 'Free email provider', delta: -20, reason: emailAnalysis.matchReason });
  }
  if (emailAnalysis.isImpersonation) {
    score -= 35; breakdown.push({ factor: 'Possible impersonation', delta: -35, reason: emailAnalysis.matchReason });
  }
  if (emailAnalysis.domainAgeRisk === 'Suspicious') {
    score -= 15; breakdown.push({ factor: 'Suspicious domain TLD', delta: -15, reason: 'Domain uses a high-risk TLD' });
  }
  if (communityReportCount > 0) {
    const penalty = Math.min(communityReportCount * 15, 45);
    score -= penalty; breakdown.push({ factor: `${communityReportCount} community report(s)`, delta: -penalty, reason: 'Recruiter/email/phone found in community incident reports' });
  } else {
    score += 5; breakdown.push({ factor: 'No community reports', delta: +5, reason: 'Clean community record' });
  }
  if (companyReportCount > 0) {
    const penalty = Math.min(companyReportCount * 5, 15);
    score -= penalty; breakdown.push({ factor: `${companyReportCount} company report(s)`, delta: -penalty, reason: 'Company has incident reports on platform' });
  }
  if (linkedinAnalysis.provided && linkedinAnalysis.urlValid) {
    score += 5; breakdown.push({ factor: 'LinkedIn profile provided', delta: +5, reason: 'Adds identity verifiability' });
  }
  if (!linkedinAnalysis.provided) {
    score -= 5; breakdown.push({ factor: 'No LinkedIn profile', delta: -5, reason: 'Legitimate recruiters typically have LinkedIn' });
  }
  if (phoneAnalysis.riskLevel === 'High') {
    score -= 10; breakdown.push({ factor: 'Suspicious phone pattern', delta: -10, reason: 'Phone number matches burner/sequential pattern' });
  }
  if (linkedAnalyses.length > 0) {
    const highRisk = linkedAnalyses.filter(a => a.riskLevel === 'High Risk').length;
    if (highRisk > 0) {
      score -= highRisk * 10;
      breakdown.push({ factor: `${highRisk} linked high-risk analysis(es)`, delta: -(highRisk * 10), reason: 'This recruiter appears in platform analyses flagged as High Risk' });
    }
  }

  // DNS checks (skip for free emails)
  if (domainDNS && !emailAnalysis.isFreeEmail) {
    if (domainDNS.hasMx) {
      score += 10; breakdown.push({ factor: 'Domain has MX records', delta: +10, reason: 'Real mail server exists for this domain' });
    } else {
      score -= 25; breakdown.push({ factor: 'No MX records found', delta: -25, reason: 'Domain cannot send or receive email — likely fake' });
    }
    if (domainDNS.hasSPF) {
      score += 5;  breakdown.push({ factor: 'SPF record present', delta: +5, reason: 'Domain has anti-spoofing DNS configuration' });
    } else {
      score -= 5;  breakdown.push({ factor: 'No SPF record', delta: -5, reason: 'Missing email authentication record' });
    }
    if (domainReach?.reachable) {
      score += 10; breakdown.push({ factor: 'Domain website reachable', delta: +10, reason: `Website at ${emailAnalysis.emailDomain} is live` });
    } else {
      score -= 15; breakdown.push({ factor: 'Domain website unreachable', delta: -15, reason: 'No live website found at this domain' });
    }
  }

  // Wikipedia company verification
  if (wikiResult?.found) {
    score += 10; breakdown.push({ factor: 'Company verified on Wikipedia', delta: +10, reason: `"${wikiResult.topTitle}" found on Wikipedia` });
  } else {
    score -= 5;  breakdown.push({ factor: 'Company not found on Wikipedia', delta: -5, reason: 'Could not verify company existence via Wikipedia' });
  }

  score = Math.max(0, Math.min(100, score));

  let verificationStatus;
  if      (score >= 70) verificationStatus = 'Verified';
  else if (score >= 35) verificationStatus = 'Suspicious';
  else                  verificationStatus = 'High Risk';

  return { score, verificationStatus, breakdown };
};

// ─────────────────────────────────────────────
// 7. AI VERDICT (Groq)
// ─────────────────────────────────────────────
const generateAIVerdict = async ({ name, company, email, emailAnalysis, phoneAnalysis, linkedinAnalysis, communityReportCount, companyReportCount, impersonationFlags, linkedAnalyses, score, verificationStatus, domainDNS, domainReach, wikiResult }) => {
  if (!process.env.GROQ_API_KEY) return null;

  const context = `
Recruiter: ${name}
Company: ${company}
Email: ${email} (domain: ${emailAnalysis.emailDomain}, free: ${emailAnalysis.isFreeEmail}, match: ${emailAnalysis.match}, impersonation: ${emailAnalysis.isImpersonation})
Domain MX Records: ${domainDNS?.hasMx ? 'Found (' + domainDNS.mxRecords?.join(', ') + ')' : 'NONE — domain cannot receive email'}
Domain SPF Record: ${domainDNS?.hasSPF ? 'Present' : 'Missing'}
Domain Website: ${domainReach?.reachable ? 'Live (HTTP ' + domainReach.statusCode + ')' : 'UNREACHABLE'}
Company Wikipedia: ${wikiResult?.found ? 'Found — ' + wikiResult.topTitle + ': ' + wikiResult.snippet?.substring(0, 120) : 'NOT FOUND'}
Phone Risk: ${phoneAnalysis.riskLevel}
LinkedIn: ${linkedinAnalysis.provided ? linkedinAnalysis.riskNote : 'Not provided'}
Community Reports: ${communityReportCount}
Company Reports: ${companyReportCount}
Impersonation Flags: ${impersonationFlags.join('; ') || 'None'}
Platform Analyses Linked: ${linkedAnalyses.length} (High Risk: ${linkedAnalyses.filter(a => a.riskLevel === 'High Risk').length})
Trust Score: ${score}/100 — ${verificationStatus}
`.trim();

  const prompt = `You are an Employment Fraud Investigator reviewing a recruiter verification report.

VERIFICATION DATA:
${context}

Generate a concise AI verdict as JSON (no markdown):
{
  "summary": "2-3 sentence professional assessment of this recruiter",
  "riskFactors": ["risk factor 1", "risk factor 2"],
  "recommendation": "one of: Safe to Contact | Contact with Caution | Avoid Contact | Likely Fraudulent",
  "confidence": 0-100
}

Base everything ONLY on the data provided. Never invent facts.`;

  try {
    const res = await axios.post(
      GROQ_API_URL,
      { model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 400 },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    const raw = res.data.choices[0].message.content;
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// MAIN VERIFICATION FUNCTION
// ─────────────────────────────────────────────
const verifyRecruiter = async (name, company, email, phone, linkedinUrl) => {
  const emailAnalysis    = analyzeEmail(email, company);
  const phoneAnalysis    = analyzePhone(phone);
  const linkedinAnalysis = analyzeLinkedIn(linkedinUrl, name, company);
  const impersonationFlags = detectImpersonation(email, company, emailAnalysis);

  const esc = (s) => s?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') || '';
  const domain = extractDomain(email);

  // Run all async checks in parallel
  const [
    communityReports, companyReports, linkedAnalyses,
    domainDNS, domainReach, wikiResult,
  ] = await Promise.all([
    CommunityReport.find({
      $or: [
        { email:         { $regex: esc(email), $options: 'i' } },
        { recruiterName: { $regex: esc(name),  $options: 'i' } },
        ...(phone ? [{ phone: { $regex: esc(phone), $options: 'i' } }] : []),
      ],
    }).select('title reportType status riskCategory createdAt').limit(6).lean(),

    CommunityReport.find({ companyName: { $regex: esc(company), $options: 'i' } })
      .select('title reportType status createdAt').limit(4).lean(),

    crossReferenceAnalyses(email, phone, company),

    // NEW: DNS + HTTP + Wikipedia (skip for free email providers)
    isFreeEmail(email) ? Promise.resolve({ exists: true, hasMx: true, hasSPF: true, mxRecords: [], note: 'Free email provider — DNS check skipped' }) : checkDomainDNS(domain),
    isFreeEmail(email) ? Promise.resolve({ reachable: true, note: 'Free email provider — reachability check skipped' }) : checkDomainReachability(domain),
    checkCompanyWikipedia(company),
  ]);

  const communityReportCount = communityReports.length;
  const companyReportCount   = companyReports.length;

  const { score, verificationStatus, breakdown } = computeScore({
    emailAnalysis, phoneAnalysis, linkedinAnalysis,
    communityReportCount, companyReportCount,
    impersonationFlags, linkedAnalyses,
    domainDNS, domainReach, wikiResult,
  });

  const aiVerdict = await generateAIVerdict({
    name, company, email, emailAnalysis, phoneAnalysis, linkedinAnalysis,
    communityReportCount, companyReportCount,
    impersonationFlags, linkedAnalyses, score, verificationStatus,
    domainDNS, domainReach, wikiResult,
  });

  // Build evidence list including new signals
  const evidence = [];
  if (emailAnalysis.match)             evidence.push({ signal: emailAnalysis.matchReason, type: 'positive' });
  if (!emailAnalysis.match && !emailAnalysis.isFreeEmail && !emailAnalysis.isImpersonation)
                                       evidence.push({ signal: emailAnalysis.matchReason, type: 'warning' });
  if (emailAnalysis.isFreeEmail)       evidence.push({ signal: `Free email: ${emailAnalysis.emailDomain}`, type: 'negative' });
  if (emailAnalysis.isImpersonation)   evidence.push({ signal: emailAnalysis.matchReason, type: 'critical' });
  if (emailAnalysis.domainAgeRisk === 'Suspicious') evidence.push({ signal: `Suspicious domain TLD: ${emailAnalysis.emailDomain}`, type: 'critical' });

  // DNS signals
  if (!isFreeEmail(email)) {
    if (domainDNS.hasMx)   evidence.push({ signal: `Domain ${domain} has valid MX records — real mail server confirmed`, type: 'positive' });
    else                   evidence.push({ signal: `Domain ${domain} has NO MX records — cannot send/receive email`, type: 'critical' });
    if (domainDNS.hasSPF)  evidence.push({ signal: `Domain ${domain} has SPF record — anti-spoofing configured`, type: 'positive' });
    else                   evidence.push({ signal: `Domain ${domain} has no SPF record — spoofing risk`, type: 'warning' });
    if (domainReach.reachable) evidence.push({ signal: `Domain ${domain} is live and reachable (HTTP ${domainReach.statusCode})`, type: 'positive' });
    else                       evidence.push({ signal: `Domain ${domain} is NOT reachable — website does not exist`, type: 'negative' });
  }

  // Wikipedia signals
  if (wikiResult.found)  evidence.push({ signal: `Company "${company}" found on Wikipedia: ${wikiResult.topTitle}`, type: 'positive' });
  else                   evidence.push({ signal: `Company "${company}" not found on Wikipedia — may be unverified or unknown`, type: 'warning' });

  if (communityReportCount > 0) evidence.push({ signal: `${communityReportCount} community report(s) linked to this recruiter`, type: 'negative' });
  else                          evidence.push({ signal: 'No community reports found for this recruiter', type: 'positive' });
  if (companyReportCount > 0)   evidence.push({ signal: `${companyReportCount} report(s) filed against ${company}`, type: 'warning' });
  if (linkedinAnalysis.provided && linkedinAnalysis.urlValid) evidence.push({ signal: linkedinAnalysis.riskNote, type: linkedinAnalysis.profileConsistent ? 'positive' : 'warning' });
  if (!linkedinAnalysis.provided) evidence.push({ signal: 'No LinkedIn profile provided', type: 'warning' });
  if (phoneAnalysis.riskLevel === 'High') evidence.push({ signal: 'Suspicious phone pattern detected', type: 'negative' });
  if (linkedAnalyses.length > 0)  evidence.push({ signal: `Found in ${linkedAnalyses.length} platform analysis(es)`, type: linkedAnalyses.some(a => a.riskLevel === 'High Risk') ? 'negative' : 'neutral' });
  impersonationFlags.forEach(f => evidence.push({ signal: f, type: 'critical' }));

  const riskExplanation = aiVerdict?.summary || [
    emailAnalysis.matchReason,
    domainDNS.hasMx ? '' : `Domain ${domain} has no MX records.`,
    domainReach.reachable ? '' : `Domain ${domain} is unreachable.`,
    wikiResult.found ? `${company} verified on Wikipedia.` : `${company} not found on Wikipedia.`,
    communityReportCount > 0 ? `${communityReportCount} community incident report(s) linked.` : '',
    impersonationFlags[0] || '',
  ].filter(Boolean).join(' ');

  return {
    verificationStatus,
    verificationScore:    score,
    domainMatch:          emailAnalysis.match,
    communityReportCount,
    companyReportCount,
    riskExplanation,
    evidence,
    scoreBreakdown:       breakdown,
    emailRisk:            emailAnalysis,
    phoneRisk:            phoneAnalysis,
    linkedinRisk:         linkedinAnalysis,
    impersonationFlags,
    domainIntelligence:   { dns: domainDNS, reachability: domainReach },
    companyIntelligence:  wikiResult,
    relatedReports:       communityReports,
    companyReports,
    linkedAnalyses,
    aiVerdict,
    verifiedAt:           new Date(),
  };
};

export { verifyRecruiter };
