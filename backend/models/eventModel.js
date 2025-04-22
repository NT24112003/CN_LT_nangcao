const mongoose = require("mongoose");

const SingleEventSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    reminderEnabled: { type: Boolean, default: false },
    reminderMinutes: { type: Number },
    reminderEmail: { type: String },
    reminderSent: { type: Boolean, default: false }
}, { _id: false });

const SingleTodoListSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String },
    isCompleted: { type: Boolean, required: true },
}, { _id: false });
// Schema cho người dùng và danh sách sự kiện của họ
const EventSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    events: { type: [SingleEventSchema], default: [] },
    todolist: { type: [SingleTodoListSchema], default: [] }
}, { collection: 'eventData', timestamps: true });


module.exports = mongoose.model("Event", EventSchema);
