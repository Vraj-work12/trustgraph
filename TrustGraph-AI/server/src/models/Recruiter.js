import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true },
    company: { type: String, required: true },
    email:   { type: String, required: true },
    phone:   String,
    linkedinUrl: String,

    verificationStatus: {
      type: String,
      enum: ['Verified', 'Suspicious', 'High Risk'],
      default: 'Suspicious',
    },
    verificationScore:    { type: Number, min: 0, max: 100 },
    domainMatch:          Boolean,
    communityReportCount: { type: Number, default: 0 },
    riskExplanation:      String,

    evidence: [{ signal: String, type: String }],

    // Deep verification fields
    emailRisk: {
      isFreeEmail:      Boolean,
      emailDomain:      String,
      isImpersonation:  Boolean,
      officialDomain:   String,
      domainAgeRisk:    String,   // 'Unknown' | 'Suspicious' | 'OK'
    },
    phoneRisk: {
      isVoip:           Boolean,
      isBurner:         Boolean,
      carrier:          String,
      riskLevel:        String,   // 'Low' | 'Medium' | 'High'
    },
    linkedinRisk: {
      provided:         Boolean,
      urlValid:         Boolean,
      profileConsistent:Boolean,
      riskNote:         String,
    },
    impersonationFlags: [String],
    patternHistory: [{
      type:       String,
      severity:   String,
      reportCount:Number,
    }],
    relatedAnalysesCount: { type: Number, default: 0 },
    companyReportCount:   { type: Number, default: 0 },
    relatedReports: [{
      title:      String,
      reportType: String,
      status:     String,
      riskCategory: String,
    }],
    companyReports: [{
      title:      String,
      reportType: String,
      status:     String,
    }],

    // AI Verdict
    aiVerdict: {
      summary:        String,
      riskFactors:    [String],
      recommendation: String,
      confidence:     Number,
    },

    scoreBreakdown: [{
      factor:  String,
      delta:   Number,
      reason:  String,
    }],

    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    verifiedAt: Date,
  },
  { timestamps: true, strict: false }
);

export default mongoose.model('Recruiter', recruiterSchema);
