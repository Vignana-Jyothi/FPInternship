import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/Api';
import './Register.css';
import Header from '../components/Navbar'
import RegisterPic from '../assets/Register.svg'
import { LuEye, LuEyeClosed } from "react-icons/lu";

export default function Register() {
  const [form, setForm] = useState({
    rollNo: '',
    name: '',
    email: '',
    branch: '',
    semester: '',
    section: '',
    password: '',
    confirmPassword: '',
    agree: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const branchOption = ['CSE','CSBS']
  const semesterOptions = ['I-I','I-II', 'II-I', 'II-II', 'III-I', 'III-II', 'IV-I', 'IV-II'];
  const sectionOptions = ['A', 'B', 'C', 'D'];
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 Password rule checks
const passwordRules = {
  length: form.password.length >= 8,
  uppercase: /[A-Z]/.test(form.password),
  number: /\d/.test(form.password),
  special: /[@$!%*?&]/.test(form.password),
};

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  let updatedValue = type === "checkbox" ? checked : value;

  // 🔥 Roll number logic
  if (name === "rollNo") {
    // Remove spaces
    updatedValue = value.replace(/\s/g, "");

    // Allow only letters & numbers
    updatedValue = updatedValue.replace(/[^a-zA-Z0-9]/g, "");

    // Convert letters to uppercase
    updatedValue = updatedValue.toUpperCase();
  }

  let updatedForm = {
    ...form,
    [name]: updatedValue
  };

  // Branch logic (your existing logic)
  if (name === "branch" && value === "CSBS") {
    updatedForm.section = "A";
  }

  if (name === "branch" && value === "CSE") {
    updatedForm.section = "";
  }

  setForm(updatedForm);
};

const handleSubmit = async e => {
  e.preventDefault();
  const cleanedEmail = form.email.toLowerCase().trim();

  if (!cleanedEmail.endsWith('@vnrvjiet.in')) {
    setError('Email must end with @vnrvjiet.in');
    return;
  }

  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  // 🔥 BLOCK if password rules fail
  if (
    !passwordRules.length ||
    !passwordRules.uppercase ||
    !passwordRules.number ||
    !passwordRules.special
  ) {
    setError('Password does not meet security requirements');
    return;
  }

  if (
    !form.rollNo || !form.name || !form.email ||
    !form.branch || !form.semester || !form.section || !form.password
  ) {
    setError('Please fill all fields');
    return;
  }

  setLoading(true);
  setError('');

  try {
    await registerUser({ ...form, email: cleanedEmail });
    alert('Registered successfully!');
    navigate('/student-login');
  } catch (err) {
    setError(err.response?.data?.error || 'An error occurred');
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <Header/>
    <div className="register-container">
    
      {/* Left Side */}
      <div className="register-left-green">
      <div className="left-content">
        <img src={RegisterPic} alt="Sign Up Illustration" className="left-svg" style={{width:"800px"}} />
        <h1>Get Started</h1>
        <p>Already have an account?</p>
        <Link to="/student-login">
          <button className="left-login-btn">Log in</button>
        </Link>
      </div>
    </div>

      {/* Right Side */}
      <div className="register-right-form shiftup">
        <div className="form-card">
          <h2 className="form-title">Create Account</h2>
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="info-message">Registering...</div>}

          <form onSubmit={handleSubmit}>
            <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="Roll No" required />
            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email (must end with @vnrvjiet.in)" required />
            <select name="branch" value={form.branch} onChange={handleChange} required>
          <option value="">Select Branch</option>
          <option value="CSE">CSE</option>
          <option value="CSBS">CSBS</option>
        </select>
            <select name="semester" value={form.semester} onChange={handleChange} required>
              <option value="">Select Semester</option>
              {semesterOptions.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
            <select
            name="section"
            value={form.section}
            onChange={handleChange}
            required
            disabled={form.branch === "CSBS"}
          >
            <option value="">Select Section</option>
            {sectionOptions.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
                <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="password-input"
        />

        <span
          className="eye-icon"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <LuEyeClosed size={20} /> : <LuEye size={20} />}
        </span>
      </div>

          {/* 🔥 Live Password Rules */}
          <div className="password-rules">
            <p className={passwordRules.length ? "valid" : "invalid"}>
              • At least 8 characters
            </p>
            <p className={passwordRules.uppercase ? "valid" : "invalid"}>
              • At least one uppercase letter
            </p>
            <p className={passwordRules.number ? "valid" : "invalid"}>
              • At least one number
            </p>
            <p className={passwordRules.special ? "valid" : "invalid"}>
              • At least one special character (@$!%*?&)
            </p>
          </div>
          
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
            <button type="submit" className="submit-btn gradient-button" disabled={loading}>
              {loading ? 'Registering...' : 'Sign up'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
