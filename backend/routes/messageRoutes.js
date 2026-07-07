import express from 'express';
import { getMessagesForAppointment } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/appointment/:appointmentId', protect, getMessagesForAppointment);

export default router;
