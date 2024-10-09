export const getChainActivity = async (walletAddress) => {
    const apiKey = process.env.REACT_APP_MORALIS_API_KEY;
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/chains?chains%5B0%5D=eth&chains%5B1%5D=polygon&chains%5B2%5D=base&chains%5B3%5D=bsc&chains%5B4%5D=avalanche&chains%5B5%5D=optimism&chains%5B6%5D=arbitrum&chains%5B7%5D=gnosis&chains%5B8%5D=linea`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch chain activity');
      }
  
      const data = await response.json();
      return data; // Returns the JSON data which includes all chain activity
    } catch (error) {
      console.error('Error fetching chain activity:', error);
      throw error;
    }
  };
  