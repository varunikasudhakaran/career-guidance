const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date, required: true },
  role: { type: String, enum: ["student", "parent"], required: true },
  parentEmail: { type: String }, // Only for students
  childEmail: { type: String }, // Only for parents
});

module.exports = mongoose.model("User", UserSchema);
