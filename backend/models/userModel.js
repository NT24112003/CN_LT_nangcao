const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  googleId: {type: String},
  guthubId:{type: String},
  role: { type: String, enum: ["user", "manager"], default: "user" },
  
}, { collection: "userData", timestamps: true });

module.exports = mongoose.model("User", UserSchema);
