import express from 'express';
import {
  getDoctors,
  getDoctorById,
  addDoctorReview,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Patient only rating reviews route
router.post('/review/:appointmentId', protect, authorize('patient'), addDoctorReview);

export default router;
