export const getDomainData = async (walletAddress) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-domain-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch domain data for wallet ${walletAddress}`);
      }
  
      const data = await response.json();
      return data; // { ensDomain, unstoppableDomain }
    } catch (error) {
      console.error(`Error fetching domain data for wallet ${walletAddress}:`, error);
      throw error;
    }
  };
  