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
  
      let ensDomain = null;
      if (ensResponse.ok) {
        const ensData = await ensResponse.json();
        if (ensData && ensData.name) {
          ensDomain = ensData.name;
        }
      } else if (ensResponse.status === 404) {
        console.warn(`ENS domain not found for wallet ${walletAddress}`);
      } else {
        console.error(`Error fetching ENS domain: ${ensResponse.status} ${ensResponse.statusText}`);
      }
  
      // Fetch Unstoppable Domain
      const udResponse = await fetch(`https://deep-index.moralis.io/api/v2.2/resolve/${walletAddress}/domain`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });
  
      let unstoppableDomain = null;
      if (udResponse.ok) {
        const udData = await udResponse.json();
        if (udData && udData.name) {
          unstoppableDomain = udData.name;
        }
      } else if (udResponse.status === 404) {
        console.warn(`Unstoppable domain not found for wallet ${walletAddress}`);
      } else {
        console.error(`Error fetching Unstoppable domain: ${udResponse.status} ${udResponse.statusText}`);
      }
  
      return {
        ensDomain,
        unstoppableDomain,
      };
    } catch (error) {
      console.error(`Error fetching domain data for wallet ${walletAddress}:`, error);
      return { ensDomain: null, unstoppableDomain: null };
    }
  };
  