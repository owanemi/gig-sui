import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@mysten/sui/transactions';
import { useWallet, useSuiClient } from '@suiet/wallet-kit';
import '../styles/JobPost.css';

const MIST_PER_SUI = 1_000_000_000; // 1 SUI = 1 billion MIST

const JobPost = () => {
  const wallet = useWallet();
  const client = useSuiClient();
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

    if (!formData.basePay || Number(formData.basePay) <= 0) {
      alert("Please enter a valid base pay amount");
      return;
    }

    try {
      // Convert basePay to MIST (assuming basePay is in SUI)
      const basePayNumber = parseFloat(formData.basePay);
      const depositAmountMist = window.BigInt(Math.floor(basePayNumber * MIST_PER_SUI));
      
      if (depositAmountMist <= window.BigInt(0)) {
        alert("Deposit amount must be greater than 0");
        return;
      }

      // Create new transaction
      const tx = new Transaction();
      
      // Set the sender's address
      tx.setSender(wallet.account?.address);

      // Split gas coin for deposit using the basePay amount
      const [depositCoin] = tx.splitCoins(tx.gas, [depositAmountMist.toString()]);

      // Transfer the deposit amount to the destination address
      // Replace 'recipient_address_here' with your actual recipient address
      tx.transferObjects([depositCoin], '0xc8ef1c69d448b8c373c6de6f7170b0dc4ab8804591601c77ac6d6d0aad9fb914');

      // Sign and execute the transaction using custom execution
      const resData = await wallet.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
          showInput: true,
          showRawInput: true,
          showRawEffects: true,
        },
      });

      console.log('Transaction successful:', resData);

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
          transactionDigest: resData.digest,
          depositAmount: formData.basePay,
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
            {wallet.connected ? `Post Job (Deposit ${formData.basePay || '0'} SUI)` : 'Connect Wallet to Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobPost;