require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');

const { sendFeedbackEmailReminders } = require('./utils/reminderEmailService');
const adminRoutes = require('./routes/adminRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const authRoutes = require('./routes/authRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const userRoutes = require('./routes/UserRoutes');
const guestRoutes = require('./routes/guestRoutes');
const Admin = require('./models/Admin');

const app = express();

// ✅ Proper CORS setup — must be first
const allowedOrigins = [
  'http://localhost:3131',  // local frontend
  'http://localhost:5173',
  'https://cseinterns.vjstartup.com', // deployed frontend
  'https://hub.vjstartup.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));


// Parse JSON
app.use(express.json());

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unexpected Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Schedule reminder emails
cron.schedule('0 10 * * 1,4', async () => {
  
  await sendFeedbackEmailReminders();
}, {
  timezone: "Asia/Kolkata"
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.catch((err) => console.log('MongoDB Error:', err));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/guest', guestRoutes);


const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});