import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import { analyzeSymptoms, generateAppointmentSummary } from '../services/aiService.js';

// @desc    Book a new appointment (includes AI symptom analysis)
// @route   POST /api/appointments
// @access  Private (Patient only)
export const bookAppointment = async (req, res) => {
  const { doctor, date, timeSlot, consultationType, symptomsDescription } = req.body;

  if (!doctor || !date || !timeSlot || !symptomsDescription) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  try {
    // Verify doctor exists and has a profile
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Run AI Symptom Analysis
    console.log('Running AI symptom checker on symptoms:', symptomsDescription);
    const aiAnalysis = await analyzeSymptoms(symptomsDescription);

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date: new Date(date),
      timeSlot,
      consultationType: consultationType || 'video',
      symptomsDescription,
      aiSymptomAnalysis: aiAnalysis,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    console.error('Book Appointment Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get patient appointments
// @route   GET /api/appointments/patient
// @access  Private (Patient only)
export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({
        path: 'doctor',
        select: 'name email phone profileImage location',
      })
      .sort({ date: -1, timeSlot: -1 });

    // Since we also want to display doctor specialization and hospital, we can map over and query DoctorProfiles
    const populatedAppointments = await Promise.all(
      appointments.map(async (app) => {
        const appObj = app.toObject();
        if (app.doctor) {
          const docProfile = await DoctorProfile.findOne({ user: app.doctor._id }).select('specialization hospital');
          appObj.doctorProfile = docProfile || { specialization: 'General Physician', hospital: 'Clinic' };
        }
        return appObj;
      })
    );

    res.json({
      success: true,
      count: populatedAppointments.length,
      appointments: populatedAppointments,
    });
  } catch (error) {
    console.error('Get Patient Appointments Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get doctor appointments
// @route   GET /api/appointments/doctor
// @access  Private (Doctor only)
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate({
        path: 'patient',
        select: 'name email phone profileImage',
      })
      .sort({ date: 1, timeSlot: 1 });

    // Populate patient DOB, blood group, medical history
    const populatedAppointments = await Promise.all(
      appointments.map(async (app) => {
        const appObj = app.toObject();
        if (app.patient) {
          const patientProfile = await PatientProfile.findOne({ user: app.patient._id }).select('dateOfBirth gender bloodGroup medicalHistory');
          appObj.patientProfile = patientProfile || {};
        }
        return appObj;
      })
    );

    res.json({
      success: true,
      count: populatedAppointments.length,
      appointments: populatedAppointments,
    });
  } catch (error) {
    console.error('Get Doctor Appointments Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status (confirm / cancel)
// @route   PUT /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;

  if (!['confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Auth check: Patient can cancel their own, Doctor can accept/cancel theirs
    const isPatient = appointment.patient.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    if (isPatient && status !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Patients can only cancel appointments' });
    }

    appointment.status = status;

// If doctor confirms appointment,
// create a pending payment automatically
if (status === "confirmed") {

    // Get doctor's consultation fee
    const doctorProfile = await DoctorProfile.findOne({
    user: appointment.doctor
});

if (doctorProfile) {
    appointment.paymentStatus = "pending";
    appointment.paymentAmount = doctorProfile.consultationFee;
    appointment.paidAt = null;
}
}

// If appointment is cancelled
if (status === "cancelled") {
    appointment.paymentStatus = "not_required";
}

await appointment.save();

    res.json({
      success: true,
      message: `Appointment successfully ${status}`,
      appointment,
    });
  } catch (error) {
    console.error('Update Appointment Status Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete appointment and generate AI summary
// @route   PUT /api/appointments/:id/complete
// @access  Private (Doctor only)
export const completeAppointment = async (req, res) => {
  const { doctorNotes } = req.body;

  if (!doctorNotes) {
    return res.status(400).json({ success: false, message: 'Please provide consultation notes to complete appointment' });
  }

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure the logged-in doctor is the assigned doctor
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Appointment is already marked as completed' });
    }

    // Generate AI Summary using symptoms and doctorNotes
    console.log('Generating AI summary for appointment:', appointment._id);
    const aiSummary = await generateAppointmentSummary(appointment.symptomsDescription, doctorNotes);

    appointment.status = 'completed';
    appointment.aiSummary = aiSummary;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment marked as completed. AI Summary generated.',
      appointment,
    });
  } catch (error) {
    console.error('Complete Appointment Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pay for confirmed appointment
// @route   PUT /api/appointments/:id/pay
// @access  Private (Patient)

export const payForAppointment = async (req, res) => {
  try {

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Only patient can pay

    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Appointment is not confirmed"
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed"
      });
    }

    appointment.paymentStatus = "paid";
    appointment.paidAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: "Payment Successful",
      appointment
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// @desc    Doctor shares Google Meet link
// @route   PUT /api/appointments/:id/meeting-link
// @access  Private (Doctor)
export const shareMeetingLink = async (req, res) => {
  try {
    const { meetingLink } = req.body;

    if (!meetingLink) {
      return res.status(400).json({
        success: false,
        message: "Meeting link is required",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Only the assigned doctor can share the meeting link
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    appointment.meetingLink = meetingLink;
    appointment.meetingStatus = "shared";

    await appointment.save();

    res.json({
      success: true,
      message: "Meeting link shared successfully",
      appointment,
    });

  } catch (error) {
    console.error("Share Meeting Link Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};