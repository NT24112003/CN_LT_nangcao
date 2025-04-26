const mongoose = require("mongoose");
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedBy: String,       // Email người giao
  assignedTo: String,       // Email người nhận
  startTime: Date,
  endTime: Date,
  notes: String,
  reason: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'submitted', 'completed', 'overdue'],
    default: 'pending'
  }
  ,
  submittedFile: [{
    filename: String,
    url: String,
    format: String, 
    size: Number,
    submittedAt: Date
  }],
  receivedFiles: [{
    filename: String,
    url: String,
    format: String, 
    size: Number,
    submittedAt: Date
  }],
  history: [{
    action: String,
    user: String,
    timestamp: { type: Date, default: Date.now }
  }],
  reminderSent: { type: Boolean, default: false }
}, { collection: "taskData", timestamps: true });




module.exports = mongoose.model("Task", TaskSchema);
