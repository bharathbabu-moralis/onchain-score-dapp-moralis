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
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/resolve/ens/${domain}`,
        {
          headers: {
            accept: "application/json",
            "X-API-Key": process.env.REACT_APP_MORALIS_API_KEY, // Add your Moralis API key here
          },
        }
      );
      const data = await response.json();
      return data.address || null;
    } catch (error) {
      console.error("Error resolving ENS:", error);
      return null;
    }
  };

  const resolveUnstoppable = async (domain) => {
    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/resolve/${domain}?currency=eth`,
        {
          headers: {
            accept: "application/json",
            "X-API-Key": process.env.REACT_APP_MORALIS_API_KEY, // Add your Moralis API key here
          },
        }
      );
      const data = await response.json();
      return data.address || null;
    } catch (error) {
      console.error("Error resolving Unstoppable domain:", error);
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
          <h1 style={{ fontWeight: "560" }}> Discover Your Onchain Score 📈 </h1>
          <p
            style={{
              textAlign: "center",
              marginLeft: "15%",
              marginRight: "15%",
            }}
            className="hero-description"
          >
            Uncover the full story of your wallet! Analyze your multi-chain
            interactions, DeFi positions, NFT holdings, and more.
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
              Check My Onchain Score 🚀
            </button>
          </form>

          {/* Display an error if the input is invalid */}
          {error && <p style={{ color: "red"}}>{error}</p>}

          <section className="features-section">
            <div className="feature-card">
              <h3>🌍 Multi-Chain Explorer</h3>
              <p>
                See how many blockchains your wallet has interacted with. The more chains, the higher your score—unlock insights on your multi-chain dominance.
              </p>
            </div>
            <div className="feature-card">
              <h3>💼 Wallet Classification</h3>
              <p>
                Are you a Whale, Trader, or Degen? Find out how your wallet is classified based on activity, net worth, and interactions across DeFi, NFTs, and tokens.
              </p>
            </div>
            <div className="feature-card">
              <h3>📊 Wallet Health & Activity</h3>
              <p>
                Measure your wallet's performance—track transaction frequency, gas efficiency, and overall activity to discover how healthy and active your wallet really is.
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
