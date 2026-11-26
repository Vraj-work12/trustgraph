import mongoose from 'mongoose';

const communityReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportType: {
      type: String,
      enum: ['Fake Job', 'Fake Internship', 'Fake Recruiter', 'Fake Company'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    recruiterName: String,
    companyName: String,
    email: String,
    phone: String,
    riskCategory: {
      type: String,
      enum: ['Upfront Payment', 'Credential Verification', 'Credential Farming', 'Others'],
    },
    evidence: [String], // File URLs
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Dismissed'],
      default: 'Pending',
    },
    verificationCount: {
      type: Number,
      default: 0,
    },
    verifiedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('CommunityReport', communityReportSchema);
