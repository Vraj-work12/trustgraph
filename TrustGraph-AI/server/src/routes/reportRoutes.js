import express from 'express';
import {
  createReport,
  getReports,
  getReportById,
  getUserReports,
  verifyReport,
} from '../controllers/reportController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createReport);
router.get('/', getReports);
router.get('/user/my-reports', authMiddleware, getUserReports);
router.get('/:id', getReportById);
router.put('/:id/verify', authMiddleware, verifyReport);

export default router;
