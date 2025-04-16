const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sendParentInvite } = require("../utils/emailService");

//  Student Registration
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, dob, parentEmail } = req.body;

    // Validate Input
    if (!name || !email || !password || !dob || !parentEmail) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if Student Exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Student already registered." });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save Student
    const student = new User({ name, email, password: hashedPassword, dob, role: "student", parentEmail });
    await student.save();

    // Send Parent Invitation Email
    await sendParentInvite(parentEmail, email);

    res.status(201).json({ message: "Student registered successfully! Parent invite sent." });
  } catch (error) {
    res.status(500).json({ message: "Error registering student.", error: error.message });
  }
};

//  Parent Registration
const registerParent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate Input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if Parent Is Linked to a Student
    const student = await User.findOne({ parentEmail: email });
    if (!student) {
      return res.status(400).json({ message: "No student linked with this email." });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save Parent Account
    const parent = new User({ name, email, password: hashedPassword, role: "parent", childEmail: student.email });
    await parent.save();

    res.status(201).json({ message: "Parent registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering parent.", error: error.message });
  } 
};

module.exports = { registerStudent, registerParent };
