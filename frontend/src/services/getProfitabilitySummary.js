export const getProfitabilitySummary = async (walletAddress, chain) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-profitability-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, chain }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch profitability summary for ${chain}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching profitability summary for ${walletAddress}:`, error);
      throw error;
    }
  };
  