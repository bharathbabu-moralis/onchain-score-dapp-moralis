import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers"; // Import ethers.js
import "../Home.css";

const Home = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous error
    setError("");

    // Determine if it's an ENS, Unstoppable Domain, or Ethereum address
    if (walletAddress.endsWith(".eth")) {
      // ENS domain
      const resolvedAddress = await resolveENS(walletAddress);
      if (resolvedAddress) {
        navigate(`/onchain-score/${resolvedAddress}`);
      } else {
        setError("Invalid ENS domain. Please try again.");
      }
    } else if (!isValidAddress(walletAddress)) {
      // Unstoppable or other domains (catch all for anything not ENS or ETH address)
      const resolvedAddress = await resolveUnstoppable(walletAddress);
      if (resolvedAddress) {
        navigate(`/onchain-score/${resolvedAddress}`);
      } else {
        setError("Invalid domain or address. Please try again.");
      }
    } else {
      // Valid Ethereum address
      navigate(`/onchain-score/${walletAddress}`);
    }
  };

const resolveENS = async (domain) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/resolve-ens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to resolve ENS domain');
      }
  
      const data = await response.json();
      return data.address || null;
    } catch (error) {
      console.error('Error resolving ENS domain:', error);
      return null;
    }
  };
  

const resolveUnstoppable = async (domain) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/resolve-unstoppable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to resolve Unstoppable domain');
      }
  
      const data = await response.json();
      return data.address || null;
    } catch (error) {
      console.error('Error resolving Unstoppable domain:', error);
      return null;
    }
  };
  

  // Use ethers.js to validate Ethereum addresses
  const isValidAddress = (address) => {
    return ethers.isAddress(address);
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div style={{ textAlign: "center" }} className="hero-content">
          <h1 style={{ fontWeight: "560" }}>
            {" "}
            Find Out Your Onchain Score 📈{" "}
          </h1>
          <p
            style={{
              textAlign: "center",
              marginLeft: "15%",
              marginRight: "15%",
            }}
            className="hero-description"
          >
            Your wallet's Onchain Score measures more than just
            transactions—discover your performance across multiple chains, DeFi
            engagement, risk, and more!
          </p>

          <form className="input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter address / ENS domain / Unstoppable domain"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="input-box"
              required
            />
            <button type="submit" className="cta-button">
              Fetch Onchain Score
            </button>
          </form>

          {/* Display an error if the input is invalid */}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <section className="features-section">
            <div className="feature-card">
              <h3>🌍 Chain Diversity</h3>
              <p>
                Explore how many blockchains you’ve transacted on. Greater chain
                activity boosts your score.
              </p>
            </div>
            <div className="feature-card">
              <h3>🔍 Wallet Activity</h3>
              <p>
                Analyze how active your wallet is across transactions, trades,
                and different blockchains. More activity means a better score!
              </p>
            </div>
            <div className="feature-card">
              <h3>🏦 DeFi Engagement</h3>
              <p>
                Find out how much you’ve engaged in DeFi protocols. The more you
                stake, swap, and participate, the higher your score.
              </p>
            </div>
          </section>
        </div>

        <footer className="footer-section">
          <a
            href="https://developers.moralis.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://moralis-portfolio-staging-f5f5e6cfeae8.herokuapp.com/images/Powered-by-Moralis-Badge-Text-Grey.svg"
              alt="Powered by Moralis"
              className="moralis-logo"
            />
          </a>
        </footer>
      </section>
    </div>
  );
};

export default Home;
