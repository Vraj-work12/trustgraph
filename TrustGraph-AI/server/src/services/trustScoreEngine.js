// Computes Trust Score 0–100 with weighted factor breakdown

const WEIGHTS = {
  upfrontPayment:         25,  // Critical
  credentialHarvesting:   20,  // Critical
  impersonation:          20,  // Critical
  interviewFee:           18,  // Critical
  freeEmailProvider:      12,
  unrealisticSalary:      12,
  urgencyPressure:         8,
  telegramOnlyContact:    10,
  vagueJobDescription:     7,
  suspiciousDomain:       10,
  communityReports:       15,  // per report, capped at 30
  noOfficialWebsite:       5,
  suspiciousWording:       3,
  tooGoodToBeTrue:         8,
  credentialFarming:       6,
};

const SEVERITY_PENALTY = { Critical: 1.0, High: 0.75, Medium: 0.5, Low: 0.25 };

const PATTERN_WEIGHT_MAP = {
  'Upfront Payment Request':       WEIGHTS.upfrontPayment,
  'Credential Harvesting':         WEIGHTS.credentialHarvesting,
  'Impersonation of Known Company':WEIGHTS.impersonation,
  'Interview Fee Request':         WEIGHTS.interviewFee,
  'Free Email Provider':           WEIGHTS.freeEmailProvider,
  'Unrealistic Salary Promise':    WEIGHTS.unrealisticSalary,
  'Urgency Pressure':              WEIGHTS.urgencyPressure,
  'Telegram/WhatsApp Only Recruitment': WEIGHTS.telegramOnlyContact,
  'Vague Job Description':         WEIGHTS.vagueJobDescription,
  'Suspicious Domain':             WEIGHTS.suspiciousDomain,
  'No Official Website':           WEIGHTS.noOfficialWebsite,
  'Suspicious Wording':            WEIGHTS.suspiciousWording,
  'Too Good To Be True':           WEIGHTS.tooGoodToBeTrue,
  'Missing Company Information':   WEIGHTS.credentialFarming,
  'Fake Government Job':           WEIGHTS.upfrontPayment,
};

const computeTrustScore = ({ patterns = [], entities = {}, communityReportCount = 0, domainMatch = null }) => {
  let deductions = 0;
  const breakdown = [];

  // Pattern-based deductions
  for (const p of patterns) {
    const base   = PATTERN_WEIGHT_MAP[p.type] || 5;
    const weight = base * SEVERITY_PENALTY[p.severity] * (p.confidence / 100);
    deductions  += weight;
    breakdown.push({
      factor:    p.type,
      penalty:   Math.round(weight),
      severity:  p.severity,
      reason:    `Detected with ${p.confidence}% confidence`,
    });
  }

  // Community reports penalty (capped at 30)
  if (communityReportCount > 0) {
    const reportPenalty = Math.min(communityReportCount * WEIGHTS.communityReports, 30);
    deductions += reportPenalty;
    breakdown.push({
      factor:   'Community Reports',
      penalty:  Math.round(reportPenalty),
      severity: communityReportCount >= 3 ? 'High' : 'Medium',
      reason:   `${communityReportCount} community report(s) on record`,
    });
  }

  // Domain mismatch bonus/penalty
  if (domainMatch === false) {
    deductions += 8;
    breakdown.push({ factor: 'Domain Mismatch', penalty: 8, severity: 'High', reason: 'Email domain does not match company domain' });
  }

  // Free email bonus deduction (if not already caught by pattern)
  if (entities.hasFreeEmail && !patterns.find(p => p.type === 'Free Email Provider')) {
    deductions += WEIGHTS.freeEmailProvider * 0.5;
    breakdown.push({ factor: 'Free Email Provider', penalty: Math.round(WEIGHTS.freeEmailProvider * 0.5), severity: 'Medium', reason: 'Recruiter using non-corporate email' });
  }

  const rawScore   = Math.max(0, 100 - deductions);
  const trustScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  let trustCategory;
  if      (trustScore <= 30)  trustCategory = 'High Risk';
  else if (trustScore <= 60)  trustCategory = 'Suspicious';
  else if (trustScore <= 80)  trustCategory = 'Moderately Trusted';
  else                        trustCategory = 'Verified';

  // Legacy riskLevel mapping (for backwards compat with existing model)
  let riskLevel;
  if      (trustScore <= 30)  riskLevel = 'High Risk';
  else if (trustScore <= 65)  riskLevel = 'Medium Risk';
  else                        riskLevel = 'Low Risk';

  const riskScore = Math.round(100 - trustScore);

  return { trustScore, trustCategory, riskScore, riskLevel, breakdown };
};

export { computeTrustScore };
