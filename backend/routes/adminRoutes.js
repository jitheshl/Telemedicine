import express from 'express';
import {
  getAdminAnalytics,
  getAdminDoctorsList,
  toggleDoctorVerification,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getAdminAnalytics);
router.get('/doctors', getAdminDoctorsList);
router.put('/doctors/:id/verify', toggleDoctorVerification);

export default router;
