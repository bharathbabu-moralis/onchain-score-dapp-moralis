export const getTokenApprovals = async (walletAddress, chain) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-token-approvals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, chain }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch token approvals for ${chain}`);
      }
  
      const data = await response.json();
      return data; // Returns the array of approval results
    } catch (error) {
      console.error(`Error fetching token approvals for ${chain}:`, error);
      throw error;
    }
  };
  