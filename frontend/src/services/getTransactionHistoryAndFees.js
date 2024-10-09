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
        
        // Sum transaction fees where from_address matches the wallet address
        data.result.forEach((transaction) => {
          if (transaction.from_address.toLowerCase() === walletAddress.toLowerCase()) {
            totalTransactionFees += parseFloat(transaction.transaction_fee);
            allTimestamps.push(transaction.block_timestamp); // Collect timestamps
          }
        });
  
        cursor = data.cursor; // Get next cursor, if available
  
      } while (cursor);
  
      return { totalTransactionFees, allTimestamps };
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  };
  