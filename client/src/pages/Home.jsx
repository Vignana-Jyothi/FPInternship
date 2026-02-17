import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Header from '../components/Navbar';
import Student from '../assets/students.svg'
import vnrImg from '../assets/vnrImage.jpg'
export default function Home  () {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="homepage-container">
      
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <img
              src={vnrImg}
              alt="VNR VJIET Logo"
              className="logo-img"
            />
            <div>
              <h2 className="gradient-text fw-bold mb-1">
                VNR Vignana Jyothi Institute of Engineering and Technology
              </h2>
              <h5 className="fw-semibold text-light">
                Department of Computer Science and Engineering
              </h5>
            </div>
          </div>

          <div className="header-buttons">
            <button className="icon-button" onClick={() => navigate('/profile')}>👤 Profile</button>
            <button className="icon-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Welcome Section with SVG */}
      <section className="homepage-welcome-section  d-flex justify-content-around align-items-center flex-wrap" style={{fontSize:"20px"}}>
        <div className="text-center mb-4" >
          <h1 className="portal-title" style={{fontSize:"50px"}}>UG/PG Internship Portal</h1>
          <p className="portal-subtext">Manage your internship applications and documents with ease.</p>
          
        </div>
        
        <img
          src={Student}
          alt="Student working"
          className="welcome-illustration "
          style={{width:"340px"}}
        />
      </section>
      

      {/* Quote */}
  

      {/* Cards Section */}
      <section className="homepage-cards-section d-flex justify-content-around align-items-center flex-wrap">
        <div className="homepage-document-card shadow">
          <h3>📄 Document Templates</h3>
          <ul className="document-grid">
            <li><a href="/docs/LOR.docx" download>Letter of Recommendation</a></li>
            <li><a href="/docs/NOC-Application.docx" download>NOC Application</a></li>
            <li><a href="/docs/NOC.docx" download>No Objection Certificate (NOC)</a></li>
            <li><a href="/docs/Rules.docx" download>VNR CSE Internship Rules</a></li>
            <li><a href="/docs/VNR-Bonafide-by-HOD-Template.docx" download>VNR Bonafide by HOD</a></li>
          
            <li><a href="/docs/VNRVJIET-Header.docx" download>VNRVJIET Header</a></li>
          </ul>
        </div>

        <div className="homepage-action-card shadow">
          <h3>📝 Apply</h3>
          <button onClick={() => navigate('/apply')}>Fill Application Form</button>
        </div>

        <div className="homepage-action-card shadow">
          <h3>📤 Submit Feedback</h3>
          <button onClick={() => navigate('/upload')}>Upload Feedback Form</button>
        </div>
      </section>
    </div>
  );
}
