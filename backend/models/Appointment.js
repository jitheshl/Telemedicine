import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
    type: String,
    enum: ['not_required', 'pending', 'paid'],
    default: 'not_required',
},

paymentAmount: {
    type: Number,
    default: 0,
},

paidAt: {
    type: Date,
},
    consultationType: {
      type: String,
      enum: ['video', 'chat', 'in-person'],
      default: 'video',
    },
    meetingLink: {
      type: String,
      default: "",
    },
    meetingStatus: {
      type: String,
      enum: ["waiting", "shared", "completed"],
      default: "waiting",
    },
    symptomsDescription: {
      type: String,
      required: true,
    },
    aiSymptomAnalysis: {
      severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
      },
      suggestedSpecialization: {
        type: String,
        default: 'General Physician',
      },
      details: {
        type: String,
        default: '',
      },
    },
    aiSummary: {
      type: String,
      default: '',
    },
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
