export const getTokenApprovals = async (walletAddress, chain) => {
    const apiKey = process.env.REACT_APP_MORALIS_API_KEY;
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/approvals?chain=${chain}`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch token approvals for ${chain}`);
      }
  
      const data = await response.json();
      return data.result; // Returns the array of approval results
    } catch (error) {
      console.error(`Error fetching token approvals for ${chain}:`, error);
      throw error;
    }
  };
  