import React, { useState, useEffect } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useWallet } from '@suiet/wallet-kit';
import { useNavigate } from 'react-router-dom';
import "../styles/Messages.css";

const MIST_PER_SUI = 1_000_000_000; // 1 SUI = 1 billion MIST

const Messages = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wallet = useWallet();
  const [minting, setMinting] = useState(false);
  const navigate = useNavigate(); // Add the useNavigate hook


  const nftMintAddress = "0xcf8aab56fc3226a8d76e4cf0b7af8231d370e5af4f922cdfd6e8ed0941fb93b1::nft::mint";

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    fetch('http://localhost:8080/api/applications')
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

  const validateNftData = (application) => {
    // Log the application data to help debug
    console.log("Application data for NFT:", application);

    const requiredFields = {
      job_title: application.job_title,
      description: application.description || `${application.job_type} position at ${application.job_location}`, // Fallback for description
      image_url: "https://gold-developing-iguana-528.mypinata.cloud/ipfs/QmQDhJLqVKWQHR1hMTB5YJ1k1BFcKNjEbAQntSB7AeNLoA", // Fallback image URL
      wallet_address: application.wallet_address
    };

    // Check if any required field is missing
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for NFT: ${missingFields.join(', ')}`);
    }

    return requiredFields;
  };

  const createPaymentTx = (applicantWallet, basePay) => {
    if (!applicantWallet || !basePay) {
      throw new Error('Missing required fields for payment: wallet address or base pay');
    }

    const tx = new Transaction();
    tx.setSender(wallet.account?.address);
    
    const depositAmountMist = window.BigInt(Math.floor(parseFloat(basePay) * MIST_PER_SUI));
    const [paymentCoin] = tx.splitCoins(tx.gas, [depositAmountMist.toString()]);
    tx.transferObjects([paymentCoin], applicantWallet);
    
    return tx;
  };

  const createMintNftTx = (jobTitle, description, imageUrl, applicantWallet) => {
    // Additional validation before creating the transaction
    if (!jobTitle || !description || !imageUrl || !applicantWallet) {
      console.error("NFT Data:", { jobTitle, description, imageUrl, applicantWallet });
      throw new Error('Missing required NFT data');
    }

    const tx = new Transaction();
    tx.moveCall({
      target: nftMintAddress,
      arguments: [
        tx.pure.string(jobTitle),
        tx.pure.string(description),
        tx.pure.string(imageUrl),
        tx.pure.address(applicantWallet),
      ],
    });
    return tx;
  };

  const handlePaymentAndMint = async (application) => {
    if (!wallet.connected) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      setMinting(true);

      // Validate payment data
      if (!application.wallet_address || !application.base_pay) {
        throw new Error('Missing payment information');
      }
      
      if (parseFloat(application.base_pay) <= 0) {
        throw new Error("Payment amount must be greater than 0");
      }

      // Validate NFT data and get formatted values
      const nftData = validateNftData(application);

      console.log("Creating payment transaction...");
      // Create and execute payment transaction
      const paymentTx = createPaymentTx(
        application.wallet_address,
        application.base_pay
      );

      console.log("Executing payment transaction...");
      const paymentResult = await wallet.signAndExecuteTransaction({
        transaction: paymentTx,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      });

      console.log('Payment successful:', paymentResult);

      console.log("Creating NFT transaction...");
      // Create and execute NFT minting transaction
      const nftTx = createMintNftTx(
        nftData.job_title,
        nftData.description,
        nftData.image_url,
        nftData.wallet_address
      );

      console.log("Executing NFT transaction...");
      const nftResult = await wallet.signAndExecuteTransaction({
        transaction: nftTx,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      });

      console.log('NFT minting successful:', nftResult);
      navigate('/');
      
      alert(`Payment of ${application.base_pay} SUI and Job completion to ${application.wallet_address} was successful!`);
    } catch (error) {
      console.error('Error during payment and minting:', error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setMinting(false);
    }
  };

  const handleDownloadResume = (filename) => {
    const downloadUrl = `http:localhost:8080/api/resume/${filename}`;
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
                <p>Base Pay: {application.base_pay} SUI</p>
                {application.description && <p>Description: {application.description}</p>}
              </div>
              <div className="application-actions">
                <button 
                  onClick={() => handleDownloadResume(application.resume_path.split('/').pop())}
                  className="download-resume-btn"
                >
                  Download Resume
                </button>
                <button
                  onClick={() => handlePaymentAndMint(application)}
                  className="pay-btn"
                  disabled={minting}
                >
                  {minting ? 'Processing...' : `Pay ${application.base_pay} SUI & Mint NFT`}
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