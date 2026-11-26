import express from 'express';
import { verifyRecruiter, reVerify, getRecruiters, getUserRecruiters, getRecruiterById } from '../controllers/recruiterController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/verify',              authMiddleware, verifyRecruiter);
router.post('/:id/re-verify',       authMiddleware, reVerify);
router.get('/user/my-recruiters',   authMiddleware, getUserRecruiters);
router.get('/',                     getRecruiters);
router.get('/:id',                  getRecruiterById);

export default router;
