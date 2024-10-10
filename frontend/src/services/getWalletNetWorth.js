export const getWalletNetWorth = async (walletAddress, chains) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-wallet-net-worth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, chains }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch net worth for wallet ${walletAddress}`);
      }
  
      const data = await response.json();
      return data; // Returns the net worth data
    } catch (error) {
      console.error(`Error fetching net worth for ${walletAddress}:`, error);
      throw error;
    }
  };
  