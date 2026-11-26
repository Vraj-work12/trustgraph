// Generates structured investigation report from trust analysis data

const getRecommendation = (trustScore, patterns) => {
  const hasCritical = patterns.some(p => p.severity === 'Critical');

  if (trustScore <= 20 || hasCritical) {
    return {
      verdict:     'Avoid Opportunity',
      color:       'red',
      description: 'Multiple critical risk indicators detected. This opportunity shows strong characteristics of employment fraud. Do not share money, documents, or personal information.',
    };
  }
  if (trustScore <= 40) {
    return {
      verdict:     'Avoid Opportunity',
      color:       'red',
      description: 'High risk indicators present. This opportunity is likely fraudulent. Avoid engaging further.',
    };
  }
  if (trustScore <= 60) {
    return {
      verdict:     'Additional Verification Required',
      color:       'amber',
      description: 'Suspicious patterns detected. Independently verify the company, recruiter identity, and official contact details before proceeding.',
    };
  }
  if (trustScore <= 80) {
    return {
      verdict:     'Proceed With Caution',
      color:       'yellow',
      description: 'Some risk factors detected. Verify key details before sharing personal information or accepting the offer.',
    };
  }
  return {
    verdict:     'Proceed',
    color:       'green',
    description: 'No significant risk factors detected. This appears to be a legitimate opportunity. Standard due diligence still recommended.',
  };
};

const generateRecommendedActions = (patterns, entities, trustScore) => {
  const actions = [];

  if (patterns.some(p => p.type === 'Upfront Payment Request' || p.type === 'Interview Fee Request')) {
    actions.push('Do NOT pay any fees — legitimate employers never charge candidates for jobs or interviews');
    actions.push('Report to the National Cyber Crime Reporting Portal at cybercrime.gov.in');
  }
  if (patterns.some(p => p.type === 'Credential Harvesting')) {
    actions.push('Do NOT share Aadhaar, PAN, bank details, or any ID documents');
  }
  if (patterns.some(p => p.type === 'Impersonation of Known Company')) {
    actions.push('Verify directly with the company\'s official HR via their official website');
    actions.push('Check the official company careers page for the job listing');
  }
  if (entities.hasFreeEmail) {
    actions.push('Confirm the recruiter\'s official corporate email through LinkedIn or the company website');
  }
  if (patterns.some(p => p.type === 'Telegram/WhatsApp Only Recruitment')) {
    actions.push('Request a formal email from an official company domain before proceeding');
    actions.push('Legitimate companies conduct interviews through official channels, not only WhatsApp/Telegram');
  }
  if (trustScore <= 60) {
    actions.push('Cross-reference this opportunity on Glassdoor, LinkedIn, and the company\'s official website');
    actions.push('Report this to your college placement cell if you received it through campus channels');
  }
  if (actions.length === 0) {
    actions.push('Verify the offer letter with the company\'s official HR department');
    actions.push('Confirm all details are consistent with the company\'s official website');
  }

  return [...new Set(actions)];
};

const generateExecutiveSummary = (trustScore, trustCategory, patterns, entities, similarIncidents) => {
  const criticalCount = patterns.filter(p => p.severity === 'Critical').length;
  const highCount     = patterns.filter(p => p.severity === 'High').length;
  const hasRelated    = similarIncidents.length > 0;

  let summary = `Trust analysis completed with a score of ${trustScore}/100 (${trustCategory}). `;

  if (criticalCount > 0) {
    summary += `${criticalCount} critical risk indicator${criticalCount > 1 ? 's' : ''} detected`;
    if (highCount > 0) summary += ` alongside ${highCount} high-severity pattern${highCount > 1 ? 's' : ''}`;
    summary += '. ';
  } else if (highCount > 0) {
    summary += `${highCount} high-severity risk pattern${highCount > 1 ? 's' : ''} detected. `;
  } else if (patterns.length === 0) {
    summary += 'No significant risk patterns detected in the submitted content. ';
  }

  if (entities.hasFreeEmail) {
    summary += 'Recruiter is using a free email provider (non-corporate), which is inconsistent with legitimate company hiring. ';
  }
  if (entities.hasPaymentKeyword) {
    summary += 'Payment-related language detected in the content. ';
  }
  if (hasRelated) {
    summary += `${similarIncidents.length} related incident${similarIncidents.length > 1 ? 's' : ''} found in the community database with shared identifiers. `;
  }

  return summary.trim();
};

const generateInvestigationReport = ({ trustScore, trustCategory, riskScore, riskLevel, patterns, entities, similarIncidents, breakdown, communityReportCount }) => {
  const recommendation = getRecommendation(trustScore, patterns);
  const recommendedActions = generateRecommendedActions(patterns, entities, trustScore);
  const executiveSummary = generateExecutiveSummary(trustScore, trustCategory, patterns, entities, similarIncidents);

  // Build graph connections summary
  const graphConnections = [];
  if (entities.emails?.length)    graphConnections.push({ node: 'Email',    values: entities.emails,    risk: entities.hasFreeEmail ? 'High' : 'Low' });
  if (entities.phones?.length)    graphConnections.push({ node: 'Phone',    values: entities.phones,    risk: 'Medium' });
  if (entities.domains?.length)   graphConnections.push({ node: 'Domain',   values: entities.domains,   risk: 'Low' });
  if (entities.companies?.length) graphConnections.push({ node: 'Company',  values: entities.companies, risk: 'Low' });
  if (entities.urls?.length)      graphConnections.push({ node: 'URL',      values: entities.urls,      risk: 'Medium' });

  return {
    executiveSummary,
    trustScore,
    trustCategory,
    riskScore,
    riskLevel,
    scoreBreakdown:    breakdown,
    detectedPatterns:  patterns,
    extractedEntities: entities,
    graphConnections,
    similarIncidents,
    communityReportCount,
    recommendedActions,
    recommendation,
    generatedAt: new Date().toISOString(),
  };
};

export { generateInvestigationReport };
