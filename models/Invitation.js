// models/Invitation.js
import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  invitedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
});

export default mongoose.models.Invitation || mongoose.model("Invitation", InvitationSchema);
