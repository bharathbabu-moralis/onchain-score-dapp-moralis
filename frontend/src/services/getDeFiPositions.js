export const getDeFiPositions = async (walletAddress, chain) => {
    const apiKey = process.env.REACT_APP_MORALIS_API_KEY;
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/defi/positions?chain=${chain}`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch DeFi positions for ${chain}`);
      }
  
      const data = await response.json();
      return data; // Returns the DeFi positions and protocol details
    } catch (error) {
      console.error(`Error fetching DeFi positions for ${chain}:`, error);
      throw error;
    }
  };
  