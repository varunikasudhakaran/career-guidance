const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendParentInvite = async (parentEmail, studentEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: parentEmail,
      subject: "Your Child Has Registered - Create Your Parent Account",
      text: `Your child with email ${studentEmail} has registered. Click here to create your parent account.`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Parent invite email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendParentInvite };
