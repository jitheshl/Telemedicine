import DoctorProfile from '../models/DoctorProfile.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// @desc    Get all doctors with filtering and pagination
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  try {
    const { specialization, search, minRating, maxFee, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filter by Specialization
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // Filter by Maximum Consultation Fee
    if (maxFee) {
      query.consultationFee = { $lte: Number(maxFee) };
    }

    // Filter by Minimum Average Rating
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Text Search in Doctor's Name or Hospital
    let matchedUserIds = [];
    if (search) {
      const users = await User.find({
        role: 'doctor',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      matchedUserIds = users.map(u => u._id);
      
      // Also match hospital name in DoctorProfile
      query.$or = [
        { user: { $in: matchedUserIds } },
        { hospital: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch profiles
    const profiles = await DoctorProfile.find(query)
      .populate('user', 'name email phone profileImage location bio')
      .skip(skip)
      .limit(Number(limit))
      .sort({ averageRating: -1, experience: -1 });

    const total = await DoctorProfile.countDocuments(query);

    res.json({
      success: true,
      count: profiles.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalDoctors: total,
      doctors: profiles,
    });
  } catch (error) {
    console.error('Get Doctors Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor profile by User ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    // Check if ID is matching a DoctorProfile or User
    let profile = await DoctorProfile.findOne({ user: req.params.id })
      .populate('user', 'name email phone profileImage location bio');

    if (!profile) {
      // Fallback: try finding by DoctorProfile _id
      profile = await DoctorProfile.findById(req.params.id)
        .populate('user', 'name email phone profileImage location bio');
    }

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Get doctor's completed appointments with reviews
    const reviews = await Appointment.find({
      doctor: profile.user._id,
      status: 'completed',
      'review.rating': { $exists: true }
    })
    .populate('patient', 'name profileImage')
    .select('review patient updatedAt')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      doctor: profile,
      reviews: reviews.map(r => ({
        patientName: r.patient ? r.patient.name : 'Anonymous Patient',
        patientImage: r.patient ? r.patient.profileImage : '',
        rating: r.review.rating,
        comment: r.review.comment,
        date: r.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get Doctor By ID Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a review for a completed appointment
// @route   POST /api/doctors/review/:appointmentId
// @access  Private (Patient only)
export const addDoctorReview = async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
  }

  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure the patient reviewing is the one who booked it
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to review this appointment' });
    }

    // Ensure the appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed appointments' });
    }

    // Add/Update review in appointment
    appointment.review = {
      rating,
      comment,
      createdAt: new Date(),
    };

    await appointment.save();

    // Recalculate average rating & total reviews for the doctor
    const docAppointments = await Appointment.find({
      doctor: appointment.doctor,
      status: 'completed',
      'review.rating': { $exists: true }
    });

    const totalReviews = docAppointments.length;
    const sumRatings = docAppointments.reduce((sum, app) => sum + app.review.rating, 0);
    const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0;

    await DoctorProfile.findOneAndUpdate(
      { user: appointment.doctor },
      { averageRating, totalReviews }
    );

    res.json({
      success: true,
      message: 'Review submitted successfully',
      review: appointment.review,
    });
  } catch (error) {
    console.error('Add Review Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
