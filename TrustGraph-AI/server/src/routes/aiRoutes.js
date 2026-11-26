import express from 'express';
import { runAIAnalysis, explainAnalysisResult, detectLanguage, getAIStatus } from '../controllers/aiController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/status', getAIStatus);
router.post('/analyze/:analysisId', authMiddleware, runAIAnalysis);
router.post('/explain/:analysisId', authMiddleware, explainAnalysisResult);
router.post('/detect-language', detectLanguage);

export default router;
