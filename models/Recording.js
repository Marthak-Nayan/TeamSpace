const recordingSchema = new Schema({
  _id: { type: String, required: true }, // e.g., "rec001"
  meetingId: {
    type: String,
    ref: "Meeting",
    required: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  url: { type: String, required: true },
  recordedAt: { type: Date, default: Date.now }
}, { _id: false });

const Recording = models.Recording || model("Recording", recordingSchema);
export default Recording;
