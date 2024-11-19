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

  // Update wallet address when wallet connection changes
  useEffect(() => {
    if (wallet?.account?.address) {
      setApplicationForm(prev => ({
        ...prev,
        walletAddress: wallet.account.address
      }));
    }
  }, [wallet?.account]);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    // Pre-fill wallet address if connected
    if (wallet?.account?.address) {
      setApplicationForm(prev => ({
        ...prev,
        walletAddress: wallet.account.address
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: name === 'resumeFile' ? files[0] : value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!applicationForm.walletAddress) {
      alert('Please connect your wallet or enter a wallet address');
      return;
    }

    if (!selectedJob || !selectedJob.id) {
      alert('Invalid job selection');
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('jobId', selectedJob.id);
    formData.append('walletAddress', applicationForm.walletAddress.trim());
    formData.append('resumeFile', applicationForm.resumeFile);

    // Log what we're sending
    console.log('Submitting application:', {
      jobId: selectedJob.id,
      walletAddress: applicationForm.walletAddress,
      resumeFile: applicationForm.resumeFile?.name
    });

    try {
      const response = await fetch('http://localhost:8080/api/apply', {
        method: 'POST',
        body: formData // Do not set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const data = await response.json();
      console.log('Application submission successful:', data);
      alert('Application submitted successfully!');
      
      // Reset form but keep wallet address if connected
      setApplicationForm({
        walletAddress: wallet?.account?.address || '',
        resumeFile: null
      });
      setSelectedJob(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(error.message);
    }
  };

  return (
    <div className='main-container'>
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
          jobData.map((job) => (
            <div className="job-card" key={job.id}>
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
          <div className="no-jobs-message">
            <h3>No Jobs Available</h3>
            <p>Check back later for new opportunities</p>
        </div>
        )}
      </div>

      {/* Job Application Modal */}
      {selectedJob && (
        <div className="application-modal">
          <div className="application-modal-content">
            <h2>Apply for {selectedJob.title}</h2>
            <form onSubmit={handleSubmitApplication}>
              <div className="form-group">
                <label>Wallet Address *</label>
                <div className="wallet-input-container">
                  <input
                    type="text"
                    name="walletAddress"
                    value={applicationForm.walletAddress}
                    onChange={handleInputChange}
                    placeholder="Your Wallet Address"
                    required
                    className={!applicationForm.walletAddress ? 'error' : ''}
                  />
                  {!wallet?.account && (
                    <p className="wallet-warning">
                      Connect wallet or enter address manually
                    </p>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Resume/CV *</label>
                <input
                  type="file"
                  name="resumeFile"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx"
                  required
                />
              </div>
              <div className="application-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={!applicationForm.walletAddress}
                >
                  Submit Application
                </button>
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