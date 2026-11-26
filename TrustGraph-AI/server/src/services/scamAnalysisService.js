import { extractEntities }           from './entityExtractor.js';
import { detectPatterns }            from './riskPatternEngine.js';
import { computeTrustScore }         from './trustScoreEngine.js';
import { findSimilarIncidents }      from './similarityEngine.js';
import { generateInvestigationReport } from './investigationReportGenerator.js';
import CommunityReport               from '../models/CommunityReport.js';

const runTrustAnalysis = async (content, sourcePlatform) => {
  // 1. Extract entities
  const entities = extractEntities(content);

  // 2. Detect risk patterns
  const patterns = detectPatterns(content);

  // 3. Check community reports for any extracted email/phone
  let communityReportCount = 0;
  if (entities.emails.length || entities.phones.length) {
    const queries = [
      ...entities.emails.map(e => ({ email: { $regex: e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } })),
      ...entities.phones.map(p => ({ phone: { $regex: p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } })),
    ];
    communityReportCount = await CommunityReport.countDocuments({ $or: queries });
  }

  // 4. Compute trust score
  const { trustScore, trustCategory, riskScore, riskLevel, breakdown } = computeTrustScore({
    patterns,
    entities,
    communityReportCount,
  });

  // 5. Find similar incidents
  const similarIncidents = await findSimilarIncidents({
    emails:    entities.emails,
    phones:    entities.phones,
    domains:   entities.domains,
    companies: entities.companies,
    patterns,
  });

  // 6. Generate investigation report
  const report = generateInvestigationReport({
    trustScore, trustCategory, riskScore, riskLevel,
    patterns, entities, similarIncidents, breakdown,
    communityReportCount,
  });

  // 7. Build legacy flags array for backwards compat
  const flags = patterns.map(p => p.type);

  return {
    trustScore,
    trustCategory,
    riskScore,
    riskLevel,
    scoreBreakdown:    breakdown,
    riskPatterns:      patterns,
    extractedEntities: entities,
    similarIncidents,
    graphConnections:  report.graphConnections,
    investigationReport: {
      executiveSummary:   report.executiveSummary,
      recommendation:     report.recommendation,
      recommendedActions: report.recommendedActions,
      generatedAt:        report.generatedAt,
    },
    flags,
    summary:            report.executiveSummary,
    recommendedActions: report.recommendedActions,
  };
};

// Keep named exports for backwards compat with controller
const analyzeJobDescription = (content) => runTrustAnalysis(content, 'job-posting');
const analyzeEmail          = (content) => runTrustAnalysis(content, 'email');
const analyzeMessage        = (content) => runTrustAnalysis(content, 'whatsapp');

export { analyzeJobDescription, analyzeEmail, analyzeMessage, runTrustAnalysis };
