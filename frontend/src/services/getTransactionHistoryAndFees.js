export const getTransactionHistoryAndFees = async (walletAddress, chain) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-transaction-history-and-fees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, chain }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transaction history and fees');
    }

    const data = await response.json();
    return data; // { totalTransactionFees, allTimestamps }
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};
