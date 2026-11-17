import React, { useState } from "react";
import { sendResetCode, verifyResetCode } from "../services/Api";
import { Link } from "react-router-dom";
import VnrNavbar from "../components/Navbar";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    upperCase: false,
    number: false,
    specialChar: false,
  });

  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const upperCase = /[A-Z]/;
    const number = /[0-9]/;
    const specialChar = /[@$!%*?&]/;
  
    if (!minLength.test(password)) {
      return "Password must be at least 8 characters long.";
    }
    if (!upperCase.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!number.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!specialChar.test(password)) {
      return "Password must contain at least one special character (@$!%*?&).";
    }
  
    return null; // valid
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await sendResetCode({ email });
      setMessage(res.message || "Verification code sent to your email.");
      setOtpSent(true);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
  
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }
  
    setLoading(true);
    setMessage("");
  
    try {
      const res = await verifyResetCode({ email, otp, newPassword });
      setMessage(res.message || "Password updated successfully.");
      setOtpSent(false);
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Invalid code or request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
  
    setPasswordRules({
      minLength: /.{8,}/.test(value),
      upperCase: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      specialChar: /[@$!%*?&]/.test(value),
    });
  };

  return (
    <>
      {/* FULL WIDTH HEADER */}
      <VnrNavbar />

      {/* CENTERED CONTENT */}
      <div className="user-forgot-wrapper">
        <div className="forgot-card">
          <h5 className="text-center mb-3 fw-semibold">
            Forgot Password
          </h5>

          {message && (
            <div className="alert alert-info text-center py-2">
              {message}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendCode}>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            <button
              type="submit"
              className="btn gradient-btn w-100"
              style={{ color: "white" }}
              disabled={loading || !email}
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndReset}>
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <label className="form-label">New Password</label>
              <input
              type="password"
              className="form-control mb-3"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
           <div className="small mb-2">
          <div className={passwordRules.minLength ? "text-success" : "text-danger"}>
            • At least 8 characters
          </div>
          <div className={passwordRules.upperCase ? "text-success" : "text-danger"}>
            • At least one uppercase letter
          </div>
          <div className={passwordRules.number ? "text-success" : "text-danger"}>
            • At least one number
          </div>
          <div className={passwordRules.specialChar ? "text-success" : "text-danger"}>
            • At least one special character (@$!%*?&)
          </div>
        </div>
          <button
          type="submit"
          className="btn gradient-btn w-100"
          disabled={
            loading ||
            !otp ||
            !passwordRules.minLength ||
            !passwordRules.upperCase ||
            !passwordRules.number ||
            !passwordRules.specialChar
          }
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
            </form>
          )}

          <div className="text-center mt-3">
            <small>
              <Link to="/login" className="text-decoration-none fw-medium">
                Back to Login
              </Link>
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
