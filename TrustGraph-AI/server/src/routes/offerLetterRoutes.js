import express from 'express';
import {
  analyzeOfferLetter,
  getOfferLetters,
  getOfferLetterById,
} from '../controllers/offerLetterController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, analyzeOfferLetter);
router.get('/', authMiddleware, getOfferLetters);
router.get('/:id', authMiddleware, getOfferLetterById);

export default router;
