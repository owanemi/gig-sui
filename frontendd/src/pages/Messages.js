import React, { useState, useEffect } from 'react';
import { useWallet } from '@suiet/wallet-kit';
import "../styles/Messages.css"; // You'll need to create this CSS file

const Messages = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wallet = useWallet();

  useEffect(() => {
    // Fetch applications only if wallet is connected
    if (wallet?.account) {
      fetchApplications();
    }
  }, [wallet?.account]);

  const fetchApplications = () => {
    fetch(`http://localhost:8080/api/applications/${wallet.account.address}`)
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

  const handleDownloadResume = async (fullPath) => {
    try {
        // Extract the filename from the full path
        const filename = fullPath.split('\\').pop(); // For Windows paths
        console.log('Extracted filename:', filename); // Debugging

        const response = await fetch(`http://localhost:8080/api/resume/${filename}`, {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error('Failed to download resume');
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (error) {
        console.error('Full download error:', error);
    }
};

  

  // Utility function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!wallet?.account) {
    return <div className="messages-container">Please connect your wallet to view applications</div>;
  }

  if (loading) {
    return <div className="messages-container">Loading applications...</div>;
  }

  if (error) {
    return <div className="messages-container">Error: {error}</div>;
  }

  return (
    <div className="messages-container">
      <h1>My Job Applications</h1>
      {applications.length === 0 ? (
        <p>No job applications found.</p>
      ) : (
        <div className="applications-list">
          {applications.map((application) => (
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
              </div>
              <div className="application-actions">
                <button 
                  onClick={() => handleDownloadResume(application.resume_path.split('/').pop())}
                  className="download-resume-btn"
                >
                  Download Resume
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