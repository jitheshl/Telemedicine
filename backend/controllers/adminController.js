import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';

// @desc    Get portal-wide analytics dashboard statistics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });

    // Appointments Breakdown
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Financial Calculation
    // Sum the doctor fees for all completed appointments
    const completedAppDetails = await Appointment.find({ status: 'completed' }).populate('doctor');
    let totalRevenue = 0;
    
    // Sum doctor fees
    for (const app of completedAppDetails) {
      if (app.doctor) {
        const docProfile = await DoctorProfile.findOne({ user: app.doctor._id });
        if (docProfile) {
          totalRevenue += docProfile.consultationFee;
        }
      }
    }

    // Specialization distribution mapping
    const docs = await DoctorProfile.find();
    const specializationCount = {};
    docs.forEach(doc => {
      specializationCount[doc.specialization] = (specializationCount[doc.specialization] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, patients: totalPatients, doctors: totalDoctors },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
        },
        revenue: totalRevenue,
        specializations: specializationCount,
      },
    });
  } catch (error) {
    console.error('Get Admin Analytics Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all doctors for verification dashboard
// @route   GET /api/admin/doctors
// @access  Private (Admin only)
export const getAdminDoctorsList = async (req, res) => {
  try {
    const profiles = await DoctorProfile.find()
      .populate('user', 'name email phone profileImage location createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: profiles.length,
      doctors: profiles,
    });
  } catch (error) {
    console.error('Get Admin Doctors Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle doctor verification status
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private (Admin only)
export const toggleDoctorVerification = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.params.id });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    profile.isVerified = !profile.isVerified;
    await profile.save();

    res.json({
      success: true,
      message: `Doctor verification status updated successfully to: ${profile.isVerified ? 'VERIFIED' : 'UNVERIFIED'}`,
      isVerified: profile.isVerified,
    });
  } catch (error) {
    console.error('Toggle Doctor Verification Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
