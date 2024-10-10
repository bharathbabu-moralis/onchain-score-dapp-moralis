export const getChainActivity = async (walletAddress) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-chain-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chain activity');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chain activity:', error);
    throw error;
  }
};
