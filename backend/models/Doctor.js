import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required']
  },
  experience: {
    type: String,
    required: [true, 'Experience is required']
  },
  fee: {
    type: Number,
    required: [true, 'Consultation fee is required']
  },
  availability: {
    type: String,
    required: [true, 'Availability slots are required']
  },
  rating: {
    type: Number,
    default: 5.0
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
