import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },

    adminReply: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const SupportTicket = mongoose.model(
  "SupportTicket",
  supportTicketSchema
);

export default SupportTicket;