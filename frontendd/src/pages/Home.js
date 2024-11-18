import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@suiet/wallet-kit';
import "../styles/Home.css";
import img from '../assets/transparent2.png';

// Utility function to truncate address
const addressEllipsis = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Home = () => {
  const [user, setUser] = useState({ name: '' });
  const [jobData, setJobData] = useState([]); 
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    walletAddress: '',
    resumeFile: null
  });
  const wallet = useWallet();

  useEffect(() => {
    // Fetch user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }

    // Fetch job posts from the backend
    fetch('http://localhost:8080/api/jobs')
      .then(response => response.json())
      .then(data => setJobData(data))
      .catch(error => console.error('Error fetching job data:', error));
  }, []);

  // Handle applying to a job
  const handleApplyClick = (job) => {
    setSelectedJob(job);
    
    // Pre-fill wallet address if connected
    if (wallet?.account) {
      setApplicationForm(prev => ({
        ...prev,
        walletAddress: wallet.account.address
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: name === 'resumeFile' ? files[0] : value
    }));
  };

  // Submit job application
  const handleSubmitApplication = (e) => {
    e.preventDefault();
    
    // Create FormData to send file
    const formData = new FormData();
    formData.append('jobId', selectedJob.id);
    formData.append('walletAddress', applicationForm.walletAddress);
    formData.append('resumeFile', applicationForm.resumeFile);

    // Log file details
    console.log('Submitting application with file:', {
        filename: applicationForm.resumeFile.name,
        type: applicationForm.resumeFile.type,
        size: applicationForm.resumeFile.size
    });

    // Send application to backend
    fetch('http://localhost:8080/api/apply', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        // Log error response
        return response.json().then(err => { throw err; });
      }
      return response.json();
    })
    .then(data => {
      console.log('Application submission response:', data);
      alert('Application submitted successfully!');
      setSelectedJob(null);
      setApplicationForm({ walletAddress: '', resumeFile: null });
    })
    .catch(error => {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    });
};

  return (
    <div>
      {/* Existing Navbar and Greeting Section */}
      <div className="navbar-container">
      <div className="left-stuff">
          <Link to="/" className="logo-link">
            <img src={img} alt="GIG SUI" className="logo" />
          </Link>
        </div>
        <div className="middle-stuff">
          <Link to="/home" className="nav-link">FIND GIG</Link>
          <Link to="/job-post" className="nav-link">POST A GIG</Link>
          <Link to="/messages" className="nav-link">MESSAGES</Link>
        </div>
        <div className="right-stuff">
          <div className="profile-info">
            <Link to="/profile" className="nav-link">{user.name || 'Andre Salmanan'}</Link>
            {wallet?.account ? (
              <div className="wallet-address">
                {addressEllipsis(wallet.account.address)}
              </div>
            ) : (
              <div className="wallet-address connect-prompt">
                Not Connected
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="greeting-wrapper">
        <div className="greeting-container">
          <div className="greeting-text">
            <h1>Welcome back, {user.name || 'Sotonye'}</h1>
            <p>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>


      {/* Job Cards Section */}
      <div className="job-cards-container">
        {jobData.length > 0 ? (
          jobData.map((job, index) => (
            <div className="job-card" key={index}>
              <div className="job-title">{job.title}</div>
              <div className="job-details">
                <div className="job-type">{job.type}</div>
                <div className="job-location">{job.location}</div>
              </div>
              <div className="job-description">{job.description}</div>
              <div className="job-footer">
                <div className="salary">$SUI {job.basePay}</div>
                <button 
                  className="apply-btn"
                  onClick={() => handleApplyClick(job)}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No jobs available</p>
        )}
      </div>

      {/* Job Application Modal */}
      {selectedJob && (
        <div className="application-modal">
          <div className="application-modal-content">
            <h2>Apply for {selectedJob.title}</h2>
            <form onSubmit={handleSubmitApplication}>
              <div className="form-group">
                <label>Wallet Address</label>
                <input
                  type="text"
                  name="walletAddress"
                  value={applicationForm.walletAddress}
                  onChange={handleInputChange}
                  placeholder="Your Wallet Address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Resume/CV</label>
                <input
                  type="file"
                  name="resumeFile"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx"
                  required
                />
              </div>
              <div className="application-actions">
                <button type="submit" className="submit-btn">Submit Application</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setSelectedJob(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;