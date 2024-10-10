import React from 'react';
import '../TokenCard.css'; // Custom CSS file for styling

const chainIdToNameMap = {
  '0x1': 'ethereum',       // Ethereum
  '0x89': 'polygon',       // Polygon
  '0x38': 'binance',       // Binance Smart Chain
  '0xa': 'optimism',       // Optimism
  '0x2105': 'base',        // Base
};

const TokenCard = ({ token }) => {
  // Handle null or missing values for price
  const priceUsd = token.price_usd ? token.price_usd.toFixed(4) : 'N/A';

  // Get the chain name from the chain_id
  const chainName = chainIdToNameMap[token.chain_id] || 'ethereum'; // Default to 'ethereum' if not found

  return (
    <div className="token-card">
      <div className="token-card-content">
        <img src={token.token_logo} alt={token.token_symbol} className="token-logo" />
        <div className="token-details">
          <span className="token-name">{token.token_name}</span>
          <span className="token-symbol">${token.token_symbol}</span>
          <span className="token-price">${priceUsd} USD</span>
          {/* Link to token page */}
          <a
            href={`https://moralis.com/chain/${chainName}/token/price/${token.token_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="view-token-link"
          >
            View Token
          </a>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
