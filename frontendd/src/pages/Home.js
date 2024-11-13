import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@suiet/wallet-kit'; // Make sure this import matches your wallet package
import "../styles/Home.css";
import img from '../assets/transparent2.png';

// Utility function to truncate address
const addressEllipsis = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Home = () => {
  const [user, setUser] = useState({ name: '' });
  const [jobData, setJobData] = useState([]); // State to store fetched job data
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

  return (
    <div>
      {/* Navbar */}
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

      {/* Greeting Section */}
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
                <div className="salary">${job.salary}</div>
                <button className="apply-btn">Apply Now</button>
              </div>
            </div>
          ))
        ) : (
          <p>No jobs available</p>
        )}
      </div>
    </div>
  );
};

export default Home;
