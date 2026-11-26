import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    website: String,
    email: String,
    industry: String,
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Suspicious', 'High Risk'],
      default: 'Suspicious',
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    linkedRecruiters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);
