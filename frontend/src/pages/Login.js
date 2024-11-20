import React, { useState } from "react";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { useNavigate } from 'react-router-dom';
import img from "../assets/transparent2.png";
import "@suiet/wallet-kit/style.css";
import '../styles/Login.css';
import axios from 'axios';

function Login() {
  const [name, setName] = useState("");
  const { account } = useWallet();  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !account) {
      alert('Please enter your name and connect your wallet!');
      return;
    }

    try {
      const response = await axios.post('https://gig-sui.onrender.com/api/users', {
        name: name,
        walletAddress: account.address
      });

      // Store user ID or other info in localStorage
      localStorage.setItem('user', JSON.stringify({ 
        id: response.data.id,
        name: name,
        walletAddress: account.address
      }));

      navigate('/home');
    } catch (error) {
      console.error('Error submitting user data:', error);
      alert('There was an error submitting your data. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="logo-wrapper">
        <img alt="Logo" src={img} />
      </div>
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Get started</h1>
          <p className="small-text">Welcome to GIG SUI - Let's create your account</p>
          <hr />
          <div className="input-box">
            <input 
              type="text" 
              placeholder="Enter your name" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="connect-button">
            <ConnectButton style={{ width: '100%' }} label="Connect Wallet" />
          </div>
          <div className="submit-button">
            <button type="submit" style={{ width: '100%' }}>Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
