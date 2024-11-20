// JobPost.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@suiet/wallet-kit";
import "../styles/JobPost.css";
import { Transaction } from "@mysten/sui/transactions";
// import { ObjectID } from "@mysten/sui/dist/cjs/transactions/data/internal";

const nftMintAddress = "0xc42c3c618d7485d2fc58621c85129022c80ac8a06f09e9a4bd0095f4bd9bc6ab";
const imageLink = ".arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4";

const JobPost = () => {
  const wallet = useWallet();
  // const client = useSuiClient();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobTitle: "",
    jobType: "Full Time",
    location: "Remote",
    basePay: "",
    description: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const createMintNftTxb = () => {
    const tx = new Transaction();
    tx.moveCall({
      target: nftMintAddress,
      arguments: [
        tx.pure.string(formData.jobTitle), // Job title
        tx.pure.string(formData.description), // Job description
        tx.pure.string(imageLink), // Fixed image URL
      ],
    });
    return tx;
  };

  const mintNFT = async () => {
    try {
      const tx = createMintNftTxb();
      const response = await wallet.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showObjectChanges: true,
        },
      });


    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Failed to mint NFT. Please check the console for more details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!wallet.connected) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      // Submit the job post data to your backend
      const response = await fetch("https://gig-sui.onrender.com/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      console.log("Job post created:", data);

      // Call the mint function after successfully adding the job to the database
      await mintNFT();

      navigate("/home");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to post job. Please try again.");
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
            {wallet.connected ? "Post Job" : "Connect Wallet to Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobPost;
