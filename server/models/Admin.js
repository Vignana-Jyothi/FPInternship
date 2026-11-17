const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema({
  adminID: { type: String, required: true },


  email: { type: String, required: true },

  // 👇 Phone numbers as array
  phoneNumbers: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.every(num => /^\d{10}$/.test(num));
      },
      message: "Each phone number must be exactly 10 digits"
    },
    default: []
  },

  password: { type: String, required: true },

  otp: {
    code: String,
    expiresAt: Date,
  },
});

/* 🔐 Hash password */
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* 🔑 Compare password */
AdminSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema, "Admin");