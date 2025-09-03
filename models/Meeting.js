import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    hostId: { type: String, required: true },
    organizationId: { type: String, required: true }, // ✅ new field
    creatorName: { type: String, required: true },
    scheduledTime: { type: Date, default: null },
    isStarted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["upcoming", "live", "ended"],
      default: "upcoming",
    },
    endedAt: { type: Date, default: null },
    participants: [
      {
        userId: { type: String, required: true },
        name: { type: String },
        role: { type: String, enum: ["host", "member"], default: "member" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Meeting =mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);

export default Meeting;
