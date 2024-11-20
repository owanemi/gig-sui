import React, { useState, useEffect } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useWallet } from '@suiet/wallet-kit';
import "../styles/Messages.css";

const MIST_PER_SUI = 1_000_000_000; // 1 SUI = 1 billion MIST

const Messages = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wallet = useWallet();

  useEffect(() => {
    // Fetch all applications
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    fetch('https://gig-sui.onrender.com/api/applications')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        return response.json();
      })
      .then(data => {
        setApplications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching applications:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  const handlePayApplicant = async (applicantWallet, basePay) => {
    if (!wallet.connected) {
      alert("Please connect your wallet first!");
      return;
    }

    console.log("Base Pay:", basePay);

    try {
      // Convert basePay to MIST
      const depositAmountMist = window.BigInt(Math.floor(parseFloat(basePay) * MIST_PER_SUI));

      if (depositAmountMist <= window.BigInt(0)) {
        alert("Payment amount must be greater than 0");
        return;
      }

      // Create a new transaction
      const tx = new Transaction();

      // Set the sender's address (from connected wallet)
      tx.setSender(wallet.account?.address);

      // Split the gas coin to cover payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [depositAmountMist.toString()]);

      // Transfer the payment to the applicant's wallet
      tx.transferObjects([paymentCoin], applicantWallet);
      console.log(applicantWallet);

      // Sign and execute the transaction
      const resData = await wallet.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      });

      console.log('Payment successful:', resData);
      alert(`Payment of ${basePay} SUI to ${applicantWallet} was successful!`);
    } catch (error) {
      console.error('Error during payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handleDownloadResume = (filename) => {
    const downloadUrl = `https://gig-sui.onrender.com/api/resume/${filename}`;
    fetch(downloadUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to download resume');
            }
            return response.blob();
        })
        .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
            console.error('Error downloading resume:', error);
        });
};


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="messages-container">Loading applications...</div>;
  }

  if (error) {
    return <div className="messages-container">Error: {error}</div>;
  }

  return (
    <div className="messages-container">
      <h1>All Job Applications</h1>
      {applications.length === 0 ? (
        <p>No job applications found.</p>
      ) : (
        <div className="applications-list">
          {applications.map(application => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <h2>{application.job_title}</h2>
                <span className="application-date">
                  Applied on: {formatDate(application.application_date)}
                </span>
              </div>
              <div className="application-details">
                <p>Job Type: {application.job_type}</p>
                <p>Location: {application.job_location}</p>
                <p>Applicant Wallet: {application.wallet_address}</p>
                <p>Base Pay: {application.base_pay} SUI</p> {/* Display the basePay */}
              </div>
              <div className="application-actions">
                <button 
                  onClick={() => handleDownloadResume(application.resume_path.split('/').pop())}
                  className="download-resume-btn"
                >
                  Download Resume
                </button>
                <button
                  onClick={() => handlePayApplicant(application.wallet_address, application.base_pay)}
                  className="pay-btn"
                >
                  Pay {application.base_pay} SUI
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
