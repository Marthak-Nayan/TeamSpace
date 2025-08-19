import mongoose, { Schema, model, models } from "mongoose";

const meetingSchema = new Schema({
  _id: { type: String, required: true }, // meet001
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  name: { type: String, required: true },
  reason: { type: String },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: String },
  schedule: { type: String, enum: ["One-time", "Recurring"], default: "One-time" },
  status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" }
}, { _id: false });

const Meeting = models.Meeting || model("Meeting", meetingSchema);
export default Meeting;
