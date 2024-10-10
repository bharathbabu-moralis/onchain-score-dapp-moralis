export const getDeFiPositions = async (walletAddress, chain) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-defi-positions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, chain }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch DeFi positions for ${chain}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching DeFi positions for ${chain}:`, error);
      throw error;
    }
  };
  