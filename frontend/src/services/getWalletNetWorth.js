export const getWalletNetWorth = async (walletAddress, chains) => {
    const apiKey = process.env.REACT_APP_MORALIS_API_KEY;
    const chainQuery = chains.map(chain => `chains%5B%5D=${chain}`).join('&'); // Format the chain array for query params
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/net-worth?${chainQuery}&exclude_spam=true&exclude_unverified_contracts=true`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
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
  