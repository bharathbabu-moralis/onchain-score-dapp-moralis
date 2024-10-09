export const getProfitabilitySummary = async (walletAddress, chain) => {
    const apiKey = process.env.REACT_APP_MORALIS_API_KEY;
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/profitability/summary?chain=${chain}`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch profitability summary for ${chain}`);
      }
  
      const data = await response.json();
      return data; // Returns the profitability summary
    } catch (error) {
      console.error(`Error fetching profitability summary for ${walletAddress}:`, error);
      throw error;
    }
  };
  