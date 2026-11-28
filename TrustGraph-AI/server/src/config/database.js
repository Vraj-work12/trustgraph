import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    let mongoURI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trustgraph-ai').trim();

    if (
      (mongoURI.startsWith('"') && mongoURI.endsWith('"')) ||
      (mongoURI.startsWith("'") && mongoURI.endsWith("'"))
    ) {
      mongoURI = mongoURI.slice(1, -1).trim();
    }

    if (!/^mongodb(?:\+srv)?:\/\//i.test(mongoURI)) {
      throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
    }

    if (/mongodb\+srv:\/\//i.test(mongoURI)) {
      const uri = new URL(mongoURI);
      if (!uri.hostname || uri.hostname.includes('<') || uri.hostname.includes('>')) {
        throw new Error('MONGODB_URI is missing a valid MongoDB Atlas hostname');
      }
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
