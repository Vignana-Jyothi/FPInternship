import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Navbar'
import { useEffect } from 'react';

const Upload = () => {
  const VITE_ADMIN_BASE_URL=import.meta.env.VITE_ADMIN_BASE_URL
  const VITE_AUTH_BASE_URL=import.meta.env.VITE_AUTH_BASE_URL
  const VITE_USER_BASE_URL = import.meta.env.VITE_USER_BASE_URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rollNo: '',
    internshipID: "",
    skillsLearned: '',
    technicalSkill: 1,
    communicationSkill: 1,
    teamWork: 1,
    timeManagement: 1,
    overallExperience: ''
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        "x-auth-token": token
      }
    };
  };

  
  const token = localStorage.getItem("token");
    
  const [internships, setInternships] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.internshipID) {
      alert("Please select internship");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`${VITE_ADMIN_BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Feedback submitted successfully!');
        navigate("/home");
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert("Error submitting feedback");
    }
  };
  useEffect(() => {
    const fetchInternships = async () => {
      const token = localStorage.getItem("token");
  
      const res = await fetch(
        `${VITE_ADMIN_BASE_URL}/past-internships`,
        {
          headers: {
            "x-auth-token": token
          }
        }
      );
  
      if (!res.ok) {
    
        setInternships([]); // prevent crash
        return;
      }
  
      const data = await res.json();
  
      setInternships(Array.isArray(data) ? data : []);
    };
  
    fetchInternships();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
  
      const res = await fetch(`${VITE_USER_BASE_URL}/profile`, {
        headers: { "x-auth-token": token }
      });
  
      if (!res.ok) {

        return;
      }
  
      const data = await res.json();
  
      if (!data.student) return;
  
      setFormData(prev => ({
        ...prev,
        rollNo: data.student.rollNo
      }));
    };
  
    fetchData();
  }, []);
  return (
    <div>
    <Header/>
    <button className="back-btn btn btn-secondary my-1 mx-2" onClick={() => navigate('/home')}>
        ⬅ Back to Home
      </button>
    <div className="container mt-5">
      
      <h2 className="text-center mb-4 mt-4">Submit Feedback</h2>
      <form onSubmit={handleSubmit} className="border p-4 shadow rounded bg-light">
        <div className="mb-3">
          <label className="form-label">Roll Number</label>
          <input
        type="text"
        name="rollNo"
        className="form-control"
        value={formData.rollNo}
        readOnly
        />
                </div>

        <div className="mb-3">
        <label className="form-label">Select Internship</label>
        <select
          name="internshipID"
          className="form-control"
          value={formData.internshipID}
          onChange={handleChange}
          required
        >
          <option value="">Select Internship</option>
          {internships.map(i => (
            <option key={i._id} value={i._id}>
              {i.organizationName} - {new Date(i.endingDate).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>
        <div className="mb-3">
          <label className="form-label">Skills Learned</label>
          <textarea
            name="skillsLearned"
            className="form-control"
            rows="3"
            value={formData.skillsLearned}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Technical Skill (1-10)</label>
            <input
              type="number"
              name="technicalSkill"
              className="form-control"
              value={formData.technicalSkill}
              onChange={handleChange}
              min="1"
              max="10"
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Communication Skill (1-10)</label>
            <input
              type="number"
              name="communicationSkill"
              className="form-control"
              value={formData.communicationSkill}
              onChange={handleChange}
              min="1"
              max="10"
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Teamwork (1-10)</label>
            <input
              type="number"
              name="teamWork"
              className="form-control"
              value={formData.teamWork}
              onChange={handleChange}
              min="1"
              max="10"
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Time Management (1-10)</label>
            <input
              type="number"
              name="timeManagement"
              className="form-control"
              value={formData.timeManagement}
              onChange={handleChange}
              min="1"
              max="10"
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Overall Experience</label>
          <textarea
            name="overallExperience"
            className="form-control"
            rows="3"
            value={formData.overallExperience}
            onChange={handleChange}
            required
          ></textarea>
        </div>
       <div className="text-center mt-3">
  <button type="submit" className="btn btn-success px-4 py-2" style={{ fontSize: "16px" }}>
    Submit Feedback
  </button>
</div>

      </form>
    </div>
    </div>
  );
};

export default Upload;