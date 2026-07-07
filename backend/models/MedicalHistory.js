import mongoose from 'mongoose';

const medicalHistorySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each patient has exactly one history log file
  },
  bloodGroup: {
    type: String,
    default: ''
  },
  allergies: {
    type: String,
    default: ''
  },
  diagnoses: [{
    type: String
  }],
  medications: [{
    type: String
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);
export default MedicalHistory;
