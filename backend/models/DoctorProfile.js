import mongoose from 'mongoose';

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please add a specialization'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Please add years of experience'],
      min: [0, 'Experience cannot be negative'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Please add consultation fee'],
      min: [0, 'Fee cannot be negative'],
    },
    availability: [
      {
        day: {
          type: String,
          required: true,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        slots: {
          type: [String], // e.g., ["09:00 AM", "10:30 AM", "02:00 PM"]
          required: true,
        },
      },
    ],
    qualifications: {
      type: [String], // e.g., ["MD - Cardiology", "MBBS"]
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    hospital: {
      type: String,
      required: [true, 'Please add affiliated hospital/clinic name'],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
export default DoctorProfile;
