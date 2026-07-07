import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    medicalHistory: {
      allergies: {
        type: [String],
        default: [],
      },
      chronicConditions: {
        type: [String],
        default: [],
      },
      currentMedications: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);
export default PatientProfile;
