const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/User');
const Internship = require('../models/Internship');
const Feedback = require('../models/Feedback');
const role = require('../middleware/role');

// 🔐 GET user profile (JWT protected)
router.get('/profile',auth,role('student'), async (req, res) => {
  try {
    // Get logged-in user from token
    const student = await Student.findById(req.user.userId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.role !== 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }


   
    // Get internships
    const internships = await Internship.find({
      rollNo: student.rollNo
    });



    // Get feedbacks
    let feedbacks = await Feedback.find({
      rollNo: student.rollNo
    }).populate('internshipID', 'organizationName');

    // Enrich feedback with organization name
    feedbacks = feedbacks.map(feedback => ({
      ...feedback.toObject(),
      organizationName: feedback.internshipID?.organizationName || "Unknown Organization"
    }));

    // Clean internship response
    const internshipsWithDetails = internships.map(internship => ({
      _id: internship._id,
      internshipID: internship.internshipID,
      startingDate: internship.startingDate,
      endingDate: internship.endingDate,
      offerLetter: internship.offerLetter,
      applicationLetter: internship.applicationLetter,
      noc: internship.noc,
      rollNo: internship.rollNo,
      role: internship.role,
      organizationName: internship.organizationName,
      hrName: internship.hrName,
      hrEmail: internship.hrEmail,
      hrPhone: internship.hrPhone,
      duration: internship.duration,
      package: internship.package,
      semester: internship.semester,
      branch: internship.branch,
      status: internship.status,
    }));
  

    res.json({
      student,
      internships: internshipsWithDetails,
      feedbacks,
    });

  } catch (error) {
    console.error('Error in /profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;