export const getTrendingTokens = async (chain, min_market_cap, security_score) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-trending-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chain,
        min_market_cap,
        security_score,
      }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch trending tokens');
    }
  
    const data = await response.json();
    return data;
  };
  