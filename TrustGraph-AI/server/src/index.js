import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import offerLetterRoutes from './routes/offerLetterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes    from './routes/aiRoutes.js';
import trustyRoutes from './routes/trustyRoutes.js';

const app = express();
  
// Connect to database
connectDB();

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/offer-letters', offerLetterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai',     aiRoutes);
app.use('/api/trusty', trustyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
