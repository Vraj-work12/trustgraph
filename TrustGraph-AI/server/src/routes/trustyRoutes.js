import express from 'express';
import { chat, proactiveSuggestion } from '../controllers/trustyController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/chat',       authMiddleware, chat);
router.get('/proactive',   authMiddleware, proactiveSuggestion);

export default router;
