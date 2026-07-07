import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import DoctorProfile from '../models/DoctorProfile.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'telemed_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, phone, ...extraDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create base user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
    });

    if (user) {
      // Create role-specific profile
      if (user.role === 'patient') {
        await PatientProfile.create({
          user: user._id,
          dateOfBirth: extraDetails.dateOfBirth || null,
          gender: extraDetails.gender || 'Prefer not to say',
          bloodGroup: extraDetails.bloodGroup || 'Unknown',
          medicalHistory: {
            allergies: extraDetails.allergies || [],
            chronicConditions: extraDetails.chronicConditions || [],
            currentMedications: extraDetails.currentMedications || [],
          },
        });
      } else if (user.role === 'doctor') {
        await DoctorProfile.create({
          user: user._id,
          specialization: extraDetails.specialization || 'General Physician',
          experience: extraDetails.experience || 0,
          consultationFee: extraDetails.consultationFee || 100,
          qualifications: extraDetails.qualifications || ['MBBS'],
          hospital: extraDetails.hospital || 'General Hospital',
          availability: extraDetails.availability || [
            { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
            { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
            { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
          ],
        });
      }

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile details
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profileData = {};
    if (user.role === 'patient') {
      profileData = await PatientProfile.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profileData = await DoctorProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user,
      profile: profileData || {},
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update core fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.profileImage = req.body.profileImage || user.profileImage;
    user.bio = req.body.bio || user.bio;
    user.location = req.body.location || user.location;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Update role-specific fields
    let updatedProfile = {};
    if (user.role === 'patient') {
      const patientProfile = await PatientProfile.findOne({ user: user._id });
      if (patientProfile) {
        patientProfile.dateOfBirth = req.body.dateOfBirth || patientProfile.dateOfBirth;
        patientProfile.gender = req.body.gender || patientProfile.gender;
        patientProfile.bloodGroup = req.body.bloodGroup || patientProfile.bloodGroup;
        
        if (req.body.medicalHistory) {
          patientProfile.medicalHistory = {
            allergies: req.body.medicalHistory.allergies || patientProfile.medicalHistory.allergies,
            chronicConditions: req.body.medicalHistory.chronicConditions || patientProfile.medicalHistory.chronicConditions,
            currentMedications: req.body.medicalHistory.currentMedications || patientProfile.medicalHistory.currentMedications,
          };
        }
        updatedProfile = await patientProfile.save();
      }
    } else if (user.role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ user: user._id });
      if (doctorProfile) {
        doctorProfile.specialization = req.body.specialization || doctorProfile.specialization;
        doctorProfile.experience = req.body.experience !== undefined ? req.body.experience : doctorProfile.experience;
        doctorProfile.consultationFee = req.body.consultationFee !== undefined ? req.body.consultationFee : doctorProfile.consultationFee;
        doctorProfile.qualifications = req.body.qualifications || doctorProfile.qualifications;
        doctorProfile.hospital = req.body.hospital || doctorProfile.hospital;
        doctorProfile.availability = req.body.availability || doctorProfile.availability;
        updatedProfile = await doctorProfile.save();
      }
    }

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio,
        location: updatedUser.location,
      },
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
