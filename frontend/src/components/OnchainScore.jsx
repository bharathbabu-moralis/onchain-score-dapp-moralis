import React from 'react';
import { useParams } from 'react-router-dom';

const OnchainScore = () => {
  const { walletAddress } = useParams();

  return (
    <div>
      <h1>Onchain Score for {walletAddress}</h1>
      {/* Fetch and display the onchain score using the walletAddress */}
    </div>
  );
};

export default OnchainScore;
