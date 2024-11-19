// JobPost.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@suiet/wallet-kit';
import '../styles/JobPost.css';

const JobPost = () => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobType: 'Full Time',
    location: 'Remote',
    basePay: '',
    description: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!wallet.connected) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      // Submit the job post data to your backend
      const response = await fetch('http://localhost:8080/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.jobTitle,
          type: formData.jobType,
          location: formData.location,
          basePay: formData.basePay,
          description: formData.description,
        }),
      });

      const data = await response.json();
      console.log('Job post created:', data);
      navigate('/home');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to post job. Please try again.');
    }
  };

  return (
    <div className="post-page-wrapper">
      <div className="post-page-container">
        <form className="job-post-form" onSubmit={handleSubmit}>
          <h2>Post a New Job</h2>

          <div className="form-group">
            <label htmlFor="jobTitle">Job Title</label>
            <input
              type="text"
              id="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              required
              placeholder="e.g. UI/UX Designer"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jobType">Job Type</label>
              <select
                id="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
              >
                <option value="Full Time">Full Time</option>
                <option value="Contract">Contract</option>
                <option value="Part Time">Part Time</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                value={formData.location}
                onChange={handleChange}
                required
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="basePay">Base Pay (SUI)</label>
            <input
              type="number"
              id="basePay"
              value={formData.basePay}
              onChange={handleChange}
              required
              placeholder="e.g. 5"
              min="0.000000001"
              step="0.000000001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the role, requirements, and responsibilities"
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={!wallet.connected}
          >
            {wallet.connected ? 'Post Job' : 'Connect Wallet to Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobPost;