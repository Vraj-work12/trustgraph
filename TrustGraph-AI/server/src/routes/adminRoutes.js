import express from 'express';
import {
  getAdminStats,
  getUsers,
  getReports,
  updateReportStatus,
  getRecruiters,
  getCompanies,
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/auth.js';

// Simple admin check middleware
const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const router = express.Router();

router.get('/stats', authMiddleware, adminMiddleware, getAdminStats);
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.get('/reports', authMiddleware, adminMiddleware, getReports);
router.put('/reports/:id', authMiddleware, adminMiddleware, updateReportStatus);
router.get('/recruiters', authMiddleware, adminMiddleware, getRecruiters);
router.get('/companies', authMiddleware, adminMiddleware, getCompanies);

export default router;
