export const getEthPriceInUsd = async () => {
    const apiKey = process.env.REACT_APP_MORALIS_API_KEY;
    const url = `https://deep-index.moralis.io/api/v2.2/erc20/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/price?chain=eth&include=percent_change`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch ETH price');
      }
  
      const data = await response.json();
      return data.usdPrice; // Return the USD price of ETH
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      throw error;
    }
  };
  