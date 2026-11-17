import React, { useState } from "react";
import axios from "axios";
import "./ForgotPassword_admin.css";
import VnrNavbar from "../components/Navbar";

const ForgotPassword_admin = () => {
  const API = import.meta.env.VITE_ADMIN_BASE_URL;
  console.log("ADMIN API:", API);

  const [adminID, setAdminID] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Password Rules State
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    upperCase: false,
    number: false,
    specialChar: false,
  });

  // ✅ Handle Password Change (Live Validation)
  const handlePasswordChange = (value) => {
    setNewPassword(value);

    setPasswordRules({
      minLength: /.{8,}/.test(value),
      upperCase: /[A-Z]/.test(value),
      number: /[0-9]/.test(value),
      specialChar: /[@$!%*?&]/.test(value),
    });
  };

  // ✅ Send OTP
  const sendOtp = async () => {
    try {
      setLoading(true);
      setMessage("");
      await axios.post(`${API}/send-otp`, { adminID });
      setOtpSent(true);
      setMessage("OTP sent successfully");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset Password
  const resetPassword = async () => {
    try {
      setLoading(true);
      setMessage("");

      await axios.post(`${API}/reset-password`, {
        adminID,
        otp,
        newPassword,
      });

      setMessage("Password reset successful");
      setAdminID("");
      setOtp("");
      setNewPassword("");
      setOtpSent(false);

      // Reset validation state
      setPasswordRules({
        minLength: false,
        upperCase: false,
        number: false,
        specialChar: false,
      });

    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <VnrNavbar />

      <div className="admin-forgot-wrapper">
        <div className="forgot-card">
          <h5 className="text-center mb-3 fw-semibold">
            Admin Forgot Password
          </h5>

          {message && (
            <div className="alert alert-info text-center py-2">
              {message}
            </div>
          )}

          {!otpSent ? (
            <>
              <label className="form-label">Admin ID</label>
              <input
                className="form-control mb-3"
                placeholder="Enter admin ID"
                value={adminID}
                onChange={(e) => setAdminID(e.target.value)}
              />

              <button
                className="btn gradient-btn w-100"
                style={{ color: "white" }}
                onClick={sendOtp}
                disabled={loading || !adminID}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <label className="form-label">OTP</label>
              <input
                className="form-control mb-3"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />

              {/* ✅ Live Password Rules */}
              <div className="small mb-3">
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
                className="btn gradient-btn w-100"
                style={{ color: "white" }}
                onClick={resetPassword}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword_admin;