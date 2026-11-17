const Admin = require('../models/Admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendMail(to, subject, text) {
  try {
    // 🔥 1️⃣ Get admin email from DB
    const admin = await Admin.findOne();

    if (!admin) {
      throw new Error("Admin not found in database");
    }

   

    // 🔥 2️⃣ Create transporter dynamically
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: admin.email,               // 👈 FROM DB
        pass: process.env.EMAIL_PASS,    // 👈 App password from .env
      },
    });

    // 🔥 3️⃣ Send email
    const info = await transporter.sendMail({
      from: `"Internship Cell" <${admin.email}>`, // 👈 FROM DB
      to: to,                                     // 👈 Student email
      subject,
      text,
    });

    return info;

  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    throw err;
  }
}

module.exports = sendMail;