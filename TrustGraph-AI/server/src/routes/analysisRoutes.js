import express from 'express';
import {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  saveAnalysis,
  deleteAnalysis,
} from '../controllers/analysisController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createAnalysis);
router.get('/', authMiddleware, getAnalyses);
router.get('/:id', authMiddleware, getAnalysisById);
router.put('/:id/save', authMiddleware, saveAnalysis);
router.delete('/:id', authMiddleware, deleteAnalysis);

export default router;
