import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:  { type: String, required: true },
    sourcePlatform: {
      type: String,
      enum: ['job-posting', 'email', 'whatsapp', 'other'],
      required: true,
    },
    content: { type: String, required: true },

    // Trust Score Engine
    trustScore:    { type: Number, min: 0, max: 100 },
    trustCategory: { type: String, enum: ['High Risk', 'Suspicious', 'Moderately Trusted', 'Verified'] },
    scoreBreakdown: [{ factor: String, penalty: Number, severity: String, reason: String }],

    // Legacy (kept for backwards compatibility)
    riskScore: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['Low Risk', 'Medium Risk', 'High Risk'] },
    flags:     [String],

    // Risk Pattern Engine
    riskPatterns: { type: mongoose.Schema.Types.Mixed, default: [], cast: false },

    // Entity Extraction
    extractedEntities: {
      emails:          [String],
      phones:          [String],
      urls:            [String],
      domains:         [String],
      companies:       [String],
      recruiterNames:  [String],
      salaryMentions:  [String],
      paymentMentions: [String],
      freeEmailsFound: [String],
      hasFreeEmail:    Boolean,
      hasPaymentKeyword: Boolean,
    },

    // Graph Connections
    graphConnections: [{
      node:   String,
      values: [String],
      risk:   String,
    }],

    // Similar Incidents
    similarIncidents: [{
      type:            String,
      id:              mongoose.Schema.Types.ObjectId,
      title:           String,
      riskLevel:       String,
      reportType:      String,
      status:          String,
      verificationStatus: String,
      similarityScore: Number,
      sharedFactors:   mongoose.Schema.Types.Mixed,
      date:            Date,
    }],

    // Investigation Report
    investigationReport: {
      executiveSummary: String,
      recommendation: {
        verdict:     String,
        color:       String,
        description: String,
      },
      recommendedActions: [String],
      generatedAt: String,
    },

    summary:           String,
    recommendedActions:[String],
    savedBy:           { type: Boolean, default: false },

    // AI Layer (Groq/Llama3)
    aiAnalysis: {
      languageDetected:    mongoose.Schema.Types.Mixed,
      aiExtractedEntities: mongoose.Schema.Types.Mixed,
      aiRiskPatterns:      [mongoose.Schema.Types.Mixed],
      trustSignals:        mongoose.Schema.Types.Mixed,
      aiReport:            mongoose.Schema.Types.Mixed,
      communityMatch:      mongoose.Schema.Types.Mixed,
      graphData:           mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true, strict: false }
);

export default mongoose.model('Analysis', analysisSchema);
