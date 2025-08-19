import mongoose from "mongoose";
const { Schema } = mongoose;

const MemberSchema = new Schema({
  userID: { type: String, required: true }, // Clerk user ID
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  role: { type: String, default: "member" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Member || mongoose.model("Member", MemberSchema);
