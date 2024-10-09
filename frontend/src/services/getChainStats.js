export const getChainStats = async (walletAddress, chain) => {
    const apiKey = process.env.REACT_APP_MORALIS_API_KEY;
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/stats?chain=${chain}`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch stats for ${chain}`);
      }
  
      const data = await response.json();
      return data; // Returns the JSON data which includes stats for the chain
    } catch (error) {
      console.error(`Error fetching stats for ${chain}:`, error);
      throw error;
    }
  };
  