// ==== BACKEND (Express) ==== 

// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendMail = require('../utils/forgotpasswordEmailservice');
const JWT_SECRET = process.env.JWT_SECRET;// Use process.env.JWT_SECRET in production
const role = require('../middleware/role');


function getPassoutYear(rollNo) {
  try {
    const roll = rollNo.trim().toUpperCase();

    const yearPrefix = parseInt(roll.substring(0, 2));
    const branchCode = roll.substring(2, 5);

    let admissionYear = 2000 + yearPrefix;

    // Lateral entry (075)
    if (branchCode === "075") {
      admissionYear -= 1;
    }

    return admissionYear + 4;
  } catch (err) {
    return null;
  }
}
// ✅ Register Route
router.post('/register', async (req, res) => {
  const { rollNo, name, branch, semester, password, section } = req.body;
  const email = req.body.email.toLowerCase().trim();

  try {
    if (!rollNo || !name || !email || !branch || !semester || !password || !section) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passoutYear = getPassoutYear(rollNo);

    if (!passoutYear) {
      return res.status(400).json({ error: 'Invalid roll number format' });
    }

    const user = new User({
      rollNo,
      name,
      email,
      branch,
      semester,
      section,
      password,
      role: 'student',
      passoutYear
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Register error:', err.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});
// ✅ Login Route

router.post('/login', async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const password = req.body.password;

  try {


    // 🔍 Find user in DB
    const user = await User.findOne({ email });
    if (!user) {
    
      return res.status(400).json({ error: 'Invalid credentials' });
    }

   

    // 🔐 Compare plain password with hashed DB password
    const isMatch = await bcrypt.compare(password, user.password);
    

    if (!isMatch) {
      
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 🪪 Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, email: user.email });
  } catch (err) {
    console.error('Login error:', err.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/send-reset-code
// POST /auth/send-reset-code
router.post('/send-reset-code', async (req, res) => {
  try {
    const { email } = req.body;
   

    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2️⃣ Generate OTP (6 digits)
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3️⃣ Set reset code and expiry (10 minutes)
    user.resetCode = code;
    user.resetCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // 4️⃣ Send email
    await sendMail(
      email,
      "Password Reset Code – CSE Internship Portal",
      `Hello,
    
    Your password reset code is: ${code}
    
    This code expires in 10 minutes.
    If you didn’t request this, ignore this email.
    
    – CSE Internship Portal`
    );
    

    
    res.json({ message: "Code sent to your email." });

  } catch (err) {
    
    res.status(500).json({ error: "Server error while sending reset code." });
  }
});


// POST /auth/verify-reset-code
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // 1️⃣ Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        error: "Missing email, otp, or new password.",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Initialize attempts
    if (!user.resetAttempts) user.resetAttempts = 0;

    // 3️⃣ Check expiry
    if (!user.resetCode || Date.now() > user.resetCodeExpiry) {
      return res.status(400).json({
        error: "Code expired. Please request a new one.",
      });
    }

    // 4️⃣ Check OTP
    if (String(user.resetCode) !== String(otp)) {
      user.resetAttempts += 1;
      await user.save();

      if (user.resetAttempts >= 5) {
        user.resetCode = null;
        user.resetCodeExpiry = null;
        user.resetAttempts = 0;
        await user.save();
        return res.status(400).json({
          error: "Too many attempts. Request a new code.",
        });
      }

      return res.status(400).json({
        error: "Invalid verification code.",
      });
    }

    // ✅ 5️⃣ SET PLAIN PASSWORD (AUTO-HASHED BY SCHEMA)
    user.password = newPassword;

    // 6️⃣ Clear reset fields
    user.resetCode = null;
    user.resetCodeExpiry = null;
    user.resetAttempts = 0;

    await user.save();

    res.json({ message: "Password updated successfully." });

  } catch (err) {
   
    res.status(500).json({
      error: "Server error while verifying reset code.",
    });
  }
});

router.use(auth);


// ✅ Admin: Get All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'rollNo name email branch semester role');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err.message || err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/feedbacks', auth, role('student'), async (req, res) => {
  try {
    const {
      internshipID,
      skillsLearned,
      technicalSkill,
      communicationSkill,
      teamWork,
      timeManagement,
      overallExperience
    } = req.body;

    if (
      !internshipID ||
      !skillsLearned ||
      !technicalSkill ||
      !communicationSkill ||
      !teamWork ||
      !timeManagement ||
      !overallExperience
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const internship = await Internship.findOne({
      _id: internshipID,
      rollNo: user.rollNo,
      isVerified: true
    });

    if (!internship) {
      return res.status(400).json({ error: 'Invalid internship selected' });
    }

    const today = new Date();
    if (today < new Date(internship.endingDate)) {
      return res.status(400).json({
        error: 'Feedback can only be submitted after internship ends'
      });
    }

    const existingFeedback = await Feedback.findOne({ internshipID });
    if (existingFeedback) {
      return res.status(400).json({
        error: 'Feedback already submitted for this internship'
      });
    }

    const newFeedback = new Feedback({
      internshipID,
      rollNo: user.rollNo,
      skillsLearned,
      technicalSkill,
      communicationSkill,
      teamWork,
      timeManagement,
      overallExperience
    });

    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });

  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

router.get('/past-internships', auth, role('student'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const internships = await Internship.find({
      rollNo: user.rollNo,
      isVerified: true
    });

    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 🔥 normalize today

    const pastInternships = internships
      .filter(i => {
        const end = new Date(i.endingDate);
        end.setHours(0, 0, 0, 0); // 🔥 normalize end date
        return end < today;
      })
      .map(i => ({
        _id: i._id,
        organizationName: i.organizationName,
        role: i.role,
        endingDate: i.endingDate
      }));

   

    res.json(pastInternships);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch internships" });
  }
});







module.exports = router;