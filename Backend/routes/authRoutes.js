const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { sendParentInvite } = require("../utils/emailService");

// ✅ Unified Registration (Student & Parent)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, dob, role, parentEmail } = req.body;

    // Check if user already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "student") {
      if (!dob || !parentEmail) {
        return res.status(400).json({ message: "Student registration requires DOB and Parent Email." });
      }

      // Save Student
      const student = new User({ name, email, password: hashedPassword, dob, role, parentEmail });
      await student.save();

      // Send Parent Invite
      await sendParentInvite(parentEmail, email);
      return res.status(201).json({ message: "Student registered! Parent invite sent." });
    }

    if (role === "parent") {
      // Verify Parent is Linked to a Student
      const student = await User.findOne({ parentEmail: email });
      if (!student) {
        return res.status(400).json({ message: "No student linked with this email." });
      }

      // Save Parent
      const parent = new User({ name, email, password: hashedPassword, role: "parent", childEmail: student.email });
      await parent.save();
      return res.status(201).json({ message: "Parent registered successfully!" });
    }

    res.status(400).json({ message: "Invalid role. Choose 'student' or 'parent'." });
  } catch (error) {
    res.status(500).json({ message: "Error registering user.", error: error.message });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful!", token, user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in.", error: error.message });
  }
});

// ✅ Protected Route
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to your dashboard!", user: req.user });
});

module.exports = router;
