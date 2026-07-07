import Message from '../models/Message.js';
import Appointment from '../models/Appointment.js';

// @desc    Get messages for a specific appointment
// @route   GET /api/messages/appointment/:appointmentId
// @access  Private
export const getMessagesForAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check authorization: User must be patient, doctor of this appointment, or admin
    const userIdStr = req.user._id.toString();
    const isPatient = appointment.patient.toString() === userIdStr;
    const isDoctor = appointment.doctor.toString() === userIdStr;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages for this consultation',
      });
    }

    const messages = await Message.find({ appointment: appointmentId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email role');

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
