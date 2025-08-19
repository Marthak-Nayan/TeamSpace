import mongoose from "mongoose";
const { Schema } = mongoose;

const OrganizationSchema = new Schema({
  name: { type: String, required: true, trim: true },
  
  OrgMail: { type: String, required: true, lowercase: true, trim: true },
  
  // store Clerk's userID from Member, not ObjectId
  createdBy: { type: String, required: true }, 
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);
