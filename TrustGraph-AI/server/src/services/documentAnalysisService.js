import { detectPatterns }    from './riskPatternEngine.js';
import { extractEntities }   from './entityExtractor.js';
import { computeTrustScore } from './trustScoreEngine.js';

const REQUIRED_FIELDS = [
  { key: 'start date',       pattern: /start\s*date|joining\s*date|date\s*of\s*joining/i },
  { key: 'salary / CTC',     pattern: /salary|ctc|compensation|stipend|remuneration/i },
  { key: 'job title',         pattern: /designation|position|role|job\s*title/i },
  { key: 'company name',     pattern: /company\s*name|employer|organization/i },
  { key: 'location',         pattern: /location|office|work\s*from|city|address/i },
  { key: 'notice period',    pattern: /notice\s*period/i },
  { key: 'reporting manager',pattern: /reporting\s*(to|manager)|supervisor/i },
  { key: 'HR signature',     pattern: /signature|signed\s*by|authorized\s*signatory|hr\s*manager/i },
];

const SUSPICIOUS_CLAUSES = [
  { clause: 'Security deposit required',        pattern: /security\s*deposit/i },
  { clause: 'Training fee required',             pattern: /training\s*fee/i },
  { clause: 'Unusual non-compete (2+ years)',    pattern: /non[- ]compete.{0,30}(\d+)\s*year/i },
  { clause: 'Vague compensation structure',      pattern: /compensation\s*(as\s*per|to\s*be)\s*discussed/i },
  { clause: 'No termination clause',             pattern: /employment\s*at\s*will.*?no\s*notice/i },
  { clause: 'Asks for Aadhaar/PAN upfront',      pattern: /submit.{0,30}(aadhar|pan\s*card|passport)/i },
  { clause: 'Unilateral contract modification',  pattern: /company\s*reserves\s*the\s*right\s*to\s*(change|modify|amend)/i },
  { clause: 'Payment before joining',            pattern: /pay.{0,30}before\s*(joining|starting)/i },
  { clause: 'No probation terms',               pattern: /no\s*probation|probation\s*not\s*applicable/i },
];

const analyzeOfferLetter = async (textContent) => {
  // If no text content provided (URL-only upload), return graceful defaults
  if (!textContent || textContent.startsWith('http')) {
    return {
      missingInformation: ['Unable to extract text — provide raw text content for analysis'],
      suspiciousClauses:  [],
      signatureValid:     false,
      companyDetailsValid:false,
      riskScore:          50,
      trustScore:         50,
      trustCategory:      'Suspicious',
      recommendations:    ['Re-submit with the offer letter text pasted directly for full analysis'],
    };
  }

  // Check required fields
  const missingInformation = REQUIRED_FIELDS
    .filter(f => !f.pattern.test(textContent))
    .map(f => f.key);

  // Check suspicious clauses
  const suspiciousClauses = SUSPICIOUS_CLAUSES
    .filter(c => c.pattern.test(textContent))
    .map(c => c.clause);

  const signatureValid     = /signature|signed\s*by|authorized\s*signatory/i.test(textContent);
  const companyDetailsValid= /registered\s*(office|address)|cin\s*:|company\s*registration/i.test(textContent);

  // Run pattern engine on content
  const patterns  = detectPatterns(textContent);
  const entities  = extractEntities(textContent);
  const { trustScore, trustCategory, riskScore } = computeTrustScore({ patterns, entities });

  // Adjust for missing fields
  const missingPenalty = missingInformation.length * 4;
  const clausePenalty  = suspiciousClauses.length  * 8;
  const finalTrust     = Math.max(0, trustScore - missingPenalty - clausePenalty);
  const finalRisk      = Math.round(100 - finalTrust);

  const recommendations = [];
  if (!signatureValid)       recommendations.push('Request a digitally signed copy from authorized HR');
  if (!companyDetailsValid)  recommendations.push('Verify company registration number on MCA portal (mca.gov.in)');
  if (missingInformation.length > 2) recommendations.push('Request a complete offer letter with all standard clauses');
  if (suspiciousClauses.length > 0)  recommendations.push('Have the offer letter reviewed by a legal professional');
  if (patterns.some(p => p.type === 'Upfront Payment Request')) recommendations.push('Do NOT pay any fees — this is a scam indicator');
  if (recommendations.length === 0)  recommendations.push('Offer letter appears standard. Verify with company HR before accepting.');

  return {
    missingInformation,
    suspiciousClauses,
    signatureValid,
    companyDetailsValid,
    riskScore:    finalRisk,
    trustScore:   finalTrust,
    trustCategory,
    riskPatterns: patterns,
    extractedEntities: entities,
    recommendations,
  };
};

export { analyzeOfferLetter };
