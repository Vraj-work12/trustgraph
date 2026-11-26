import mongoose from 'mongoose';
import Recruiter from '../models/Recruiter.js';
import { verifyRecruiter as verifyRecruiterService } from '../services/recruiterVerificationService.js';

const buildDoc = (base, v, userId) => ({
  ...base,
  verificationStatus:   v.verificationStatus,
  verificationScore:    v.verificationScore,
  domainMatch:          v.domainMatch,
  communityReportCount: v.communityReportCount,
  companyReportCount:   v.companyReportCount,
  riskExplanation:      v.riskExplanation,
  evidence:             v.evidence,
  scoreBreakdown:       v.scoreBreakdown,
  emailRisk:            v.emailRisk,
  phoneRisk:            v.phoneRisk,
  linkedinRisk:         v.linkedinRisk,
  impersonationFlags:   v.impersonationFlags,
  relatedReports:       v.relatedReports,
  companyReports:       v.companyReports,
  linkedAnalyses:       v.linkedAnalyses,
  aiVerdict:            v.aiVerdict,
  relatedAnalysesCount: v.linkedAnalyses?.length || 0,
  domainIntelligence:   v.domainIntelligence,
  companyIntelligence:  v.companyIntelligence,
  verifiedAt:           v.verifiedAt,
  updatedAt:            new Date(),
  ...(userId ? { reportedBy: [new mongoose.Types.ObjectId(userId)] } : {}),
});

const verifyRecruiter = async (req, res) => {
  try {
    const { name, company, email, phone, linkedinUrl } = req.body;

    const existing = await Recruiter.findOne({ email: { $regex: email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } });
    if (existing) {
      const ageHours = (Date.now() - new Date(existing.updatedAt)) / 3600000;
      if (ageHours < 24) return res.status(200).json({ message: 'Recruiter found', recruiter: existing });
    }

    const v = await verifyRecruiterService(name, company, email, phone, linkedinUrl);
    const col = mongoose.connection.collection('recruiters');

    let recruiter;
    if (existing) {
      const doc = buildDoc({ name, company, email, phone, linkedinUrl }, v, null);
      await col.updateOne({ _id: existing._id }, { $set: doc, $addToSet: { reportedBy: new mongoose.Types.ObjectId(req.userId) } });
      recruiter = await col.findOne({ _id: existing._id });
    } else {
      const doc = { _id: new mongoose.Types.ObjectId(), createdAt: new Date(), ...buildDoc({ name, company, email, phone, linkedinUrl }, v, req.userId) };
      await col.insertOne(doc);
      recruiter = doc;
    }

    res.status(existing ? 200 : 201).json({ message: 'Recruiter verified', recruiter });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

const reVerify = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });

    const v = await verifyRecruiterService(
      recruiter.name, recruiter.company, recruiter.email,
      recruiter.phone, recruiter.linkedinUrl
    );

    const col = mongoose.connection.collection('recruiters');
    const doc = buildDoc({ name: recruiter.name, company: recruiter.company, email: recruiter.email, phone: recruiter.phone, linkedinUrl: recruiter.linkedinUrl }, v, null);
    await col.updateOne({ _id: recruiter._id }, { $set: doc });
    const updated = await col.findOne({ _id: recruiter._id });

    res.status(200).json({ message: 'Re-verified', recruiter: updated });
  } catch (error) {
    res.status(500).json({ message: 'Re-verification failed', error: error.message });
  }
};

const getRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find().sort({ createdAt: -1 });
    res.status(200).json(recruiters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiters', error: error.message });
  }
};

const getUserRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find({ reportedBy: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(recruiters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user recruiters', error: error.message });
  }
};

const getRecruiterById = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (!recruiter) return res.status(404).json({ message: 'Recruiter not found' });
    res.status(200).json(recruiter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiter', error: error.message });
  }
};

export { verifyRecruiter, reVerify, getRecruiters, getUserRecruiters, getRecruiterById };
