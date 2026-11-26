import mongoose from 'mongoose';

const offerLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    companyName: String,
    position: String,
    salary: String,
    missingInformation: [String],
    suspiciousClauses: [String],
    signatureValid: Boolean,
    companyDetailsValid: Boolean,
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

export default mongoose.model('OfferLetter', offerLetterSchema);
