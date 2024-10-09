export const getDomainData = async (walletAddress) => {
    const apiKey = process.env.REACT_APP_MORALIS_API_KEY;
  
    try {
      // Fetch ENS domain
      const ensResponse = await fetch(`https://deep-index.moralis.io/api/v2.2/resolve/${walletAddress}/reverse`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
  
      const ensData = await ensResponse.json();
      const ensDomain = ensData?.name || null;
  
      // Fetch Unstoppable Domain
      const udResponse = await fetch(`https://deep-index.moralis.io/api/v2.2/resolve/${walletAddress}/domain`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
  
      const udData = await udResponse.json();
      const unstoppableDomain = udData?.name || null;
  
      return {
        ensDomain,
        unstoppableDomain,
      };
    } catch (error) {
      console.error(`Error fetching domain data for wallet ${walletAddress}:`, error);
      throw error;
    }
  };
  