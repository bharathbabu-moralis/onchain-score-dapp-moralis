export const getTokenPriceInUsd = async (tokenAddress, chain) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-token-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenAddress, chain }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token price');
    }

    const data = await response.json();
    return data.usdPrice; // Return the USD price of the token
  } catch (error) {
    console.error('Error fetching token price:', error);
    throw error;
  }
};
