// Finds similar historical incidents using shared entities (graph-style cross-reference)
import Analysis from '../models/Analysis.js';
import CommunityReport from '../models/CommunityReport.js';
import Recruiter from '../models/Recruiter.js';

const computeSimilarityScore = (sharedFactors) => {
  const weights = { email: 40, phone: 35, domain: 25, company: 20, pattern: 15 };
  let score = 0;
  for (const [key, count] of Object.entries(sharedFactors)) {
    score += (weights[key] || 10) * Math.min(count, 3);
  }
  return Math.min(100, score);
};

const findSimilarIncidents = async ({ emails = [], phones = [], domains = [], companies = [], patterns = [] }) => {
  const patternTypes = patterns.map(p => p.type);
  const similar = [];

  // Search past analyses
  if (emails.length || phones.length || domains.length || companies.length) {
    const contentQueries = [];
    if (emails.length)    emails.forEach(e    => contentQueries.push({ content: { $regex: e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));
    if (phones.length)    phones.forEach(p    => contentQueries.push({ content: { $regex: p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));
    if (companies.length) companies.forEach(c => contentQueries.push({ content: { $regex: c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));

    if (contentQueries.length) {
      const analyses = await Analysis.find({ $or: contentQueries }).limit(10).lean();
      for (const a of analyses) {
        const shared = {};
        emails.forEach(e    => { if (a.content?.includes(e))    shared.email    = (shared.email    || 0) + 1; });
        phones.forEach(p    => { if (a.content?.includes(p))    shared.phone    = (shared.phone    || 0) + 1; });
        companies.forEach(c => { if (a.content?.includes(c))    shared.company  = (shared.company  || 0) + 1; });
        (a.flags || []).forEach(f => { if (patternTypes.includes(f)) shared.pattern = (shared.pattern || 0) + 1; });

        const simScore = computeSimilarityScore(shared);
        if (simScore > 20) {
          similar.push({
            type:            'Past Analysis',
            id:              a._id,
            title:           a.title,
            riskLevel:       a.riskLevel,
            riskScore:       a.riskScore,
            similarityScore: simScore,
            sharedFactors:   shared,
            date:            a.createdAt,
          });
        }
      }
    }
  }

  // Search community reports
  const reportQueries = [];
  if (emails.length)    emails.forEach(e    => reportQueries.push({ email: { $regex: e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));
  if (phones.length)    phones.forEach(p    => reportQueries.push({ phone: { $regex: p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));
  if (companies.length) companies.forEach(c => reportQueries.push({ companyName: { $regex: c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));

  if (reportQueries.length) {
    const reports = await CommunityReport.find({ $or: reportQueries }).limit(10).lean();
    for (const r of reports) {
      const shared = {};
      emails.forEach(e    => { if (r.email?.includes(e))       shared.email   = (shared.email   || 0) + 1; });
      phones.forEach(p    => { if (r.phone?.includes(p))       shared.phone   = (shared.phone   || 0) + 1; });
      companies.forEach(c => { if (r.companyName?.toLowerCase().includes(c.toLowerCase())) shared.company = (shared.company || 0) + 1; });

      const simScore = computeSimilarityScore(shared);
      if (simScore > 20) {
        similar.push({
          type:            'Community Report',
          id:              r._id,
          title:           r.title,
          reportType:      r.reportType,
          status:          r.status,
          similarityScore: simScore,
          sharedFactors:   shared,
          date:            r.createdAt,
        });
      }
    }
  }

  // Search recruiters
  if (emails.length) {
    const recruiters = await Recruiter.find({ email: { $in: emails } }).limit(5).lean();
    for (const r of recruiters) {
      similar.push({
        type:            'Known Recruiter',
        id:              r._id,
        title:           `${r.name} @ ${r.company}`,
        verificationStatus: r.verificationStatus,
        verificationScore:  r.verificationScore,
        communityReports:   r.communityReportCount,
        similarityScore: 80,
        sharedFactors:   { email: 1 },
        date:            r.createdAt,
      });
    }
  }

  return similar
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 8);
};

export { findSimilarIncidents };
