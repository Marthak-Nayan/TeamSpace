const taskSchema = new Schema({
  _id: { type: String, required: true }, // e.g., "task001"
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  meetingId: {
    type: String,
    ref: "Meeting" // referencing by custom string _id
  },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  }
}, { _id: false });

const Task = models.Task || model("Task", taskSchema);
export default Task;
