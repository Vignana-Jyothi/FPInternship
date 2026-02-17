const Internship = require('../models/Internship');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Admin = require('../models/Admin');   // 👈 add this
const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendFeedbackEmailReminders() {

  const admin = await Admin.findOne();

  if (!admin) {
  
    return [];
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: admin.email,
      pass: process.env.EMAIL_PASS
    }
  });
  

  const today = new Date();
  const internships = await Internship.find({ endingDate: { $lte: today } });
  const feedbacks = await Feedback.find({});
  const remindersSent = [];

  

  for (let internship of internships) {

    const existingFeedback = feedbacks.find(fb =>
      fb.rollNo === internship.rollNo &&
      fb.internshipID?.toString() === internship._id.toString()
    );

    if (!existingFeedback) {

      const user = await User.findOne({ rollNo: internship.rollNo });
      if (!user) continue;


      try {
        await transporter.sendMail({
          from: `"Internship Cell" <${admin.email}>`,
          to: user.email,
          subject: "Feedback Reminder for Internship",
          text: `Hi ${user.name},

Greetings from the Internship Cell.

This is a reminder to submit your feedback for your recently completed internship at ${internship.organizationName}.

Your feedback is important for maintaining internship records and improving future student experiences.

Please log in to the Internship Portal and complete the feedback form at the earliest.

If you have already submitted the feedback, please ignore this email.

Regards,
Internship Cell
Department of Computer Science and Engineering`
        });

      } catch (err) {
        console.error("❌ Mail sending failed:", err.message);
      }
    }
  }

  return remindersSent;
}
module.exports = { sendFeedbackEmailReminders };