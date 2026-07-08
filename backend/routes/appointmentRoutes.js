import express from 'express';
import {
    bookAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    completeAppointment,
    payForAppointment,
    shareMeetingLink
} from "../controllers/appointmentController.js";
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('patient'), bookAppointment);
router.get('/patient', authorize('patient'), getPatientAppointments);
router.get('/doctor', authorize('doctor'), getDoctorAppointments);
router.put('/:id/status', updateAppointmentStatus);
router.put("/:id/pay", protect, payForAppointment);
router.put("/:id/meeting-link", authorize("doctor"), shareMeetingLink);
router.put('/:id/complete', authorize('doctor'), completeAppointment);

export default router;
