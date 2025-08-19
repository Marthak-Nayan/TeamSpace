// Project/models/Messages.js
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const messageSchema = new Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
  userid: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const Message = models.Message || model("Message", messageSchema);
module.exports = Message;
