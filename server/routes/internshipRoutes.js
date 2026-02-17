// ✅ Corrected internshipRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const fs = require('fs');
const Internship = require('../models/Internship');
const User = require('../models/User');
const Admin = require('../models/Admin');
const sendMail = require('../utils/forgotpasswordEmailservice');

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// POST: Submit internship form with file uploads
const parseDuration = (str) => {
  const match = str.match(/(\d+(?:\.\d+)?)/); // Extract first float-like number
  return match ? parseFloat(match[1]) : 0;
};
router.post(
  "/submit",
  auth,
  upload.fields([
    { name: "offerLetter", maxCount: 1 },
    { name: "applicationLetter", maxCount: 1 },
    { name: "noc", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // 1️⃣ Get logged-in user
      const user = await User.findById(req.admin.userId);

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (user.role !== "student") {
        return res.status(403).json({
          error: "Only students can submit internship",
        });
      }

      const rollNo = user.rollNo;

      // 2️⃣ Find OTP verified internship record
      const verifiedInternship = await Internship.findOne({
        rollNo,
        isVerified: true,
      }).sort({ createdAt: -1 });

      if (!verifiedInternship) {
        return res.status(403).json({
          error: "Please complete OTP verification first.",
        });
      }

      // 3️⃣ Prepare updated data
      const internshipData = {
        role: req.body.role,
        organizationName: req.body.organizationName,
        hrEmail: req.body.hrEmail,
        hrPhone: Number(req.body.hrMobile || req.body.hrPhone),
        duration: parseDuration(req.body.duration),
        package: Number(req.body.package),
        startingDate: new Date(req.body.startDate),
        endingDate: new Date(req.body.endDate),

        offerLetter: req.files?.offerLetter
          ? `/uploads/${req.files.offerLetter[0].filename}`
          : verifiedInternship.offerLetter,

        applicationLetter: req.files?.applicationLetter
          ? `/uploads/${req.files.applicationLetter[0].filename}`
          : verifiedInternship.applicationLetter,

        noc: req.files?.noc
          ? `/uploads/${req.files.noc[0].filename}`
          : verifiedInternship.noc,
      };

      // 4️⃣ Validate required fields
      const requiredFields = [
        "role",
        "organizationName",
        "hrEmail",
        "duration",
        "package",
        "startingDate",
        "endingDate",
      ];

      for (const field of requiredFields) {
        if (
          internshipData[field] === undefined ||
          internshipData[field] === null ||
          internshipData[field] === "" ||
          (field.includes("Date") &&
            isNaN(new Date(internshipData[field]).getTime()))
        ) {
          return res
            .status(400)
            .json({ error: `Missing or invalid field: ${field}` });
        }
      }

      // 5️⃣ Update the same OTP record (NO new document)
      await Internship.findByIdAndUpdate(
        verifiedInternship._id,
        internshipData,
        { new: true }
      );

      res.status(200).json({
        message: "Internship submitted successfully",
      });

    } catch (error) {
      console.error("Internship submission error:", error);
      res.status(500).json({
        error: "Failed to save internship data",
      });
    }
  }
);

// GET: Fetch all submitted internships
router.get('/all', auth, async (req, res) => {
  if (req.admin.role !== 'admin') {
    return res.status(403).json({ error: "Access denied" });
  }
  try {
    const internships = await Internship.find();

    const now = new Date();
    internships.forEach(internship => {
      if (internship.startingDate && internship.endingDate) {
        if (now < internship.startingDate) {
          internship.status = 'Upcoming';
        } else if (now >= internship.startingDate && now <= internship.endingDate) {
          internship.status = 'Ongoing';
        } else if (now > internship.endingDate) {
          internship.status = 'Completed';
        }
      }
    });

    res.json(internships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch internships' });
  }
});

router.post("/generate-internship-otp", auth, async (req, res) => {
  try {
    const loggedUser = await User.findById(req.admin.userId);

    if (!loggedUser || loggedUser.role !== "student") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const rollNo = loggedUser.rollNo;

    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // 🔢 Generate OTP (admin only)
    const adminOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let internship = await Internship.findOne({ rollNo });

    if (!internship) {
      internship = new Internship({ rollNo });
    }

    internship.verificationOTP = adminOTP;
    internship.verificationExpires = expiry;
    internship.isVerified = false;
    internship.otpAttempts = 0;

    await internship.save();

    // Respond immediately
    res.json({ message: "OTP sent to admin successfully" });

    // 📧 Send OTP ONLY to admin
    sendMail(
      admin.email,
      "Internship Verification OTP",
      `Student Roll No: ${rollNo}
Admin OTP: ${adminOTP}
Valid for 24 hours.`
    ).catch(err => console.error("Admin mail error:", err));

  } catch (err) {
    console.error("Generate OTP error:", err);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
});

router.post("/verify-internship-otp", auth, async (req, res) => {
  try {
    const { adminOTP } = req.body;

    if (!adminOTP) {
      return res.status(400).json({ error: "OTP is required." });
    }

    const loggedUser = await User.findById(req.admin.userId);

    if (!loggedUser || loggedUser.role !== "student") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const rollNo = loggedUser.rollNo;

    const internship = await Internship
      .findOne({ rollNo })
      .sort({ createdAt: -1 });

    if (!internship) {
      return res.status(404).json({ error: "OTP not generated yet." });
    }

    if (Date.now() > internship.verificationExpires) {
      return res.status(400).json({ error: "OTP expired. Generate again." });
    }

    if (internship.otpAttempts >= 5) {
      return res.status(400).json({ error: "Too many attempts. Generate new OTP." });
    }

    if (String(adminOTP).trim() !== String(internship.verificationOTP).trim()){
      internship.otpAttempts += 1;
      await internship.save();
      return res.status(400).json({ error: "Invalid OTP." });
    }

    internship.isVerified = true;
    internship.adminOTP = null;
    internship.verificationExpires = null;
    internship.otpAttempts = 0;

    await internship.save();

    res.json({ message: "Internship verified successfully." });

  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;