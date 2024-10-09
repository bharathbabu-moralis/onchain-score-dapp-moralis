export const getTransactionHistoryAndFees = async (walletAddress, chain) => {
  const apiKey = process.env.REACT_APP_MORALIS_API_KEY;
  let url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/history?chain=${chain}&order=DESC`;
  let totalTransactionFees = 0;
  let allTimestamps = []; // Store timestamps for heatmap
  let cursor = null;

  try {
    do {
      const response = await fetch(`${url}${cursor ? `&cursor=${cursor}` : ''}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });

      const data = await response.json();

      // Ensure data.result is valid and default to an empty array if missing
      const transactions = data.result || [];

      // Sum transaction fees where from_address matches the wallet address
      transactions.forEach((transaction) => {
        const transactionFee = parseFloat(transaction.transaction_fee || 0); // Default to 0 if missing
        if (transaction.from_address.toLowerCase() === walletAddress.toLowerCase()) {
          totalTransactionFees += isNaN(transactionFee) ? 0 : transactionFee; // Ensure no NaN values
          allTimestamps.push(transaction.block_timestamp); // Collect timestamps
        }
      });

      cursor = data.cursor || null; // Get next cursor, if available

    } while (cursor);

    // Ensure totalTransactionFees is a valid number
    totalTransactionFees = isNaN(totalTransactionFees) ? 0 : totalTransactionFees;

    return { totalTransactionFees, allTimestamps };
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};
