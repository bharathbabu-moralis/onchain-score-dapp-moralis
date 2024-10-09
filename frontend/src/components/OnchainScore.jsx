import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import makeBlockie from "ethereum-blockies-base64";
import { getChainActivity } from "../services/getChainActivity";
import { getChainStats } from "../services/getChainStats";
import { getTokenApprovals } from "../services/getTokenApprovals";
import { getDeFiPositions } from "../services/getDeFiPositions";
import { getWalletNetWorth } from "../services/getWalletNetWorth";
import { getProfitabilitySummary } from '../services/getProfitabilitySummary';
import { getDomainData } from '../services/getDomainData';
import { getTransactionHistoryAndFees } from '../services/getTransactionHistoryAndFees';
import { getEthPriceInUsd } from '../services/getEthPriceInUsd';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import "../OnchainScore.css"; // Import the new CSS file



const OnchainScore = () => {
  const { walletAddress } = useParams();
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Fetching wallet data");
  const [onchainScore, setOnchainScore] = useState(null);
  const [chainData, setChainData] = useState(null); // Holds active chain data
  const [transactedChains, setTransactedChains] = useState([]); // Chains with transactions
  const [chainStats, setChainStats] = useState({}); // Holds stats for each chain
  const [totalTransactions, setTotalTransactions] = useState(0); // Total number of transactions
  const [favoriteChain, setFavoriteChain] = useState(""); // Chain with most transactions
  const [favoriteNftChain, setFavoriteNftChain] = useState(""); // Chain with most NFTs
  const [firstTransactionDate, setFirstTransactionDate] = useState(null); // First transaction date
  const [firstTransactionChain, setFirstTransactionChain] = useState(""); // Chain with first transaction
  const [walletAge, setWalletAge] = useState(""); // Age of the wallet
  const [usdAtRiskPerChain, setUsdAtRiskPerChain] = useState({}); // Holds usd_at_risk per chain
  const [totalUsdAtRisk, setTotalUsdAtRisk] = useState(0); // Total USD at risk across all chains
  const [defiProtocols, setDefiProtocols] = useState(new Set()); // Holds unique DeFi protocols
  const [highestPosition, setHighestPosition] = useState(null); // Holds the highest position
  const [highestProtocolName, setHighestProtocolName] = useState(""); // Holds the protocol of the highest position
  const [netWorth, setNetWorth] = useState(0); // Holds total net worth
  const [highestChain, setHighestChain] = useState({}); // Holds the chain with the most funds
  const [totalTrades, setTotalTrades] = useState(0); // Holds total trades
  const [totalProfit, setTotalProfit] = useState(0);
  const [ensDomain, setEnsDomain] = useState(null); // Holds ENS domain
  const [unstoppableDomain, setUnstoppableDomain] = useState(null); // Holds Unstoppable domain
  const [totalFees, setTotalFees] = useState(0); // Holds total gas fees
const [totalFeesInUsd, setTotalFeesInUsd] = useState(0)
  const [transactionHeatmapData, setTransactionHeatmapData] = useState([]);



  useEffect(() => {
    let loadingMessages = [
      "Fetching wallet data",
      "Analyzing transactions",
      "Gathering DeFi positions",
      "Checking NFT holdings",
      "Calculating onchain score",
    ];

    let count = 0;
    const intervalId = setInterval(() => {
      setLoadingText(loadingMessages[count % loadingMessages.length] + "...");
      count++;
    }, 2000);

    const fetchData = async () => {

        try {
            // Fetch transaction history and fees for Ethereum chain
            const { totalTransactionFees, allTimestamps } = await getTransactionHistoryAndFees(walletAddress, 'eth');

            const ethPriceInUsd = await getEthPriceInUsd();

            const feesInUsd = totalTransactionFees * ethPriceInUsd;

            setTotalFeesInUsd(feesInUsd.toFixed(2))
    
            // Set total fees and timestamps for heatmap
            setTotalFees(totalTransactionFees);
            setTransactionHeatmapData(allTimestamps);
          } catch (error) {
            console.error('Error fetching transaction history:', error);
            setLoading(false); // Stop the loading on error
          }

      try {
        // Fetch chain activity data
        const data = await getChainActivity(walletAddress);
        setChainData(data);

        // Filter chains with transactions (i.e., those that have a first transaction)
        const activeChains = data.active_chains.filter(
          (chain) => chain.first_transaction !== null
        );
        setTransactedChains(activeChains);

        try {
            // Fetch ENS and Unstoppable Domains
            const { ensDomain, unstoppableDomain } = await getDomainData(walletAddress);
            setEnsDomain(ensDomain);
            setUnstoppableDomain(unstoppableDomain);
          } catch (error) {
            console.error('Error fetching domain data:', error);
            setLoading(false); // Stop the loading on error
          }

        const netWorthApiChains = [
          "eth",
          "polygon",
          "bsc",
          "avalanche",
          "arbitrum",
          "optimism",
          "base",
        ];

        const netWorthData = await getWalletNetWorth(
          walletAddress,
          netWorthApiChains
        );

        // Set total net worth
        setNetWorth(netWorthData.total_networth_usd);

        // Find the chain with the highest net worth
        let highestNetWorth = 0;
        let highestChainData = {};

        netWorthData.chains.forEach((chain) => {
          if (parseFloat(chain.networth_usd) > highestNetWorth) {
            highestNetWorth = parseFloat(chain.networth_usd);
            highestChainData = {
              chain: chain.chain,
              amount: highestNetWorth,
            };
          }
        });

        setHighestChain(highestChainData);

        // For each active chain, fetch token approvals and calculate usd_at_risk per chain
        let totalUsdRisk = 0;
        const usdRiskMap = {};

        const approvalsPromises = activeChains.map(async (chain) => {
          const approvals = await getTokenApprovals(walletAddress, chain.chain);

          let totalUsdRiskForChain = 0;
          approvals.forEach((approval) => {
            if (approval.token && approval.token.usd_at_risk !== null) {
              totalUsdRiskForChain += parseFloat(approval.token.usd_at_risk);
            }
          });

          usdRiskMap[chain.chain] = totalUsdRiskForChain;
          totalUsdRisk += totalUsdRiskForChain;
        });

        await Promise.all(approvalsPromises);
        setUsdAtRiskPerChain(usdRiskMap); // Set the usd_at_risk for each chain
        setTotalUsdAtRisk(totalUsdRisk); // Set the total usd_at_risk

        const chains_pnl_summary = ['eth', 'polygon']

        try {
            let totalTradeCount = 0;
            let totalRealizedProfit = 0;
    
            // Fetch profitability data for each chain
            const profitPromises = chains_pnl_summary.map(async (chain) => {
              const profitData = await getProfitabilitySummary(walletAddress, chain);
    
              // Add to total trades and realized profit
              totalTradeCount += profitData.total_count_of_trades;
              totalRealizedProfit += parseFloat(profitData.total_realized_profit_usd);
            });
    
            await Promise.all(profitPromises);
    
            // Set the states for total trades and profit
            setTotalTrades(totalTradeCount);
            setTotalProfit(totalRealizedProfit);
          } catch (error) {
            console.error('Error fetching profitability data:', error);
            setLoading(false); // Stop the loading on error
          }

        const chains = ["eth"];

        try {
          let allPositions = [];
          let protocolSet = new Set();
          let maxPosition = null;
          let maxUsdValue = 0;
          let protocolOfMaxPosition = "";

          // Fetch DeFi positions for each chain
          const defiPromises = chains.map(async (chain) => {
            const defiData = await getDeFiPositions(walletAddress, chain);

            defiData.forEach((protocolData) => {
              // Add protocol name to the set (ensure uniqueness)
              if (protocolData.protocol_name) {
                protocolSet.add(protocolData.protocol_name);
              }

              // Store positions and check for highest position
              if (
                protocolData.position &&
                protocolData.position.balance_usd > maxUsdValue
              ) {
                maxUsdValue = protocolData.position.balance_usd;
                maxPosition = protocolData.position;
                protocolOfMaxPosition = protocolData.protocol_name; // Store the protocol of the highest position
              }

              if (protocolData.position) {
                allPositions.push(protocolData.position);
              }
            });
          });

          await Promise.all(defiPromises);

          // Update the states
          setDefiProtocols(protocolSet);
          setHighestPosition(maxPosition);
          setHighestProtocolName(protocolOfMaxPosition); // Store protocol of the highest position
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false); // Stop the loading on error
        }

        // Calculate the onchain score based on the active chains
        const score = calculateOnchainScore(activeChains);
        setOnchainScore(score);

        // Find the earliest transaction across all chains
        let earliestTransaction = null;
        let earliestTransactionChain = "";

        activeChains.forEach((chain) => {
          if (
            chain.first_transaction &&
            chain.first_transaction.block_timestamp
          ) {
            const firstTxDate = new Date(
              chain.first_transaction.block_timestamp
            );
            if (!earliestTransaction || firstTxDate < earliestTransaction) {
              earliestTransaction = firstTxDate;
              earliestTransactionChain = chain.chain;
            }
          }
        });

        // Set the first transaction date and chain
        if (earliestTransaction) {
          setFirstTransactionDate(earliestTransaction.toDateString());
          setFirstTransactionChain(earliestTransactionChain);

          // Calculate wallet age
          const now = new Date();
          const diffTime = Math.abs(now - earliestTransaction);
          const diffYears = (diffTime / (1000 * 60 * 60 * 24 * 365)).toFixed(2);
          setWalletAge(diffYears);
        }

        // Simulate fetching stats for each chain and calculate totals (as in the earlier version)
        const statsPromises = activeChains.map(async (chain) => {
          const stats = await getChainStats(walletAddress, chain.chain);
          return { chain: chain.chain, stats };
        });

        const statsResults = await Promise.all(statsPromises);

        // Combine the stats and store them in the state
        const combinedStats = {};
        let totalTx = 0;
        let mostTxChain = "";
        let mostNftChain = "";
        let maxTxCount = 0;
        let maxNftCount = 0;

        statsResults.forEach((result) => {
          const { chain, stats } = result;
          combinedStats[chain] = stats;

          // Sum the total transactions across all chains
          const chainTxCount = parseInt(stats.transactions.total, 10);
          totalTx += chainTxCount;

          // Check if this chain has the most transactions
          if (chainTxCount > maxTxCount) {
            maxTxCount = chainTxCount;
            mostTxChain = chain;
          }

          // Check if this chain has the most NFTs
          const chainNftCount = parseInt(stats.nfts, 10);
          if (chainNftCount > maxNftCount) {
            maxNftCount = chainNftCount;
            mostNftChain = chain;
          }
        });


        setChainStats(combinedStats); // Store the stats for each chain
        setTotalTransactions(totalTx); // Set the total number of transactions
        setFavoriteChain(mostTxChain); // Set the chain with the most transactions
        setFavoriteNftChain(mostNftChain); // Set the chain with the most NFTs

        setLoading(false); // Stop the loading
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Stop the loading on error
      }
    };

    fetchData();

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [walletAddress]);

  // Function to calculate onchain score based on fetched chain data
  const calculateOnchainScore = (activeChains) => {
    return Math.floor((activeChains.length / 8) * 100); // Example logic
  };

   // Function to process transaction timestamps into daily counts for the heatmap
   const processHeatmapData = () => {
    const dayCounts = {};

    // Initialize day counts for the past year
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      dayCounts[day.toISOString().split('T')[0]] = 0; // YYYY-MM-DD format
    }

    // Increment counts based on transaction timestamps
    transactionHeatmapData.forEach((timestamp) => {
      const date = new Date(timestamp).toISOString().split('T')[0];
      if (dayCounts[date] !== undefined) {
        dayCounts[date]++;
      }
    });

    // Convert to array format for react-calendar-heatmap
    return Object.keys(dayCounts).map(date => ({
      date,
      count: dayCounts[date],
    }));
  };

  const heatmapData = processHeatmapData(); // Prepare data for heatmap

  const getTooltipData = (value) => {
    return value.count ? `${value.date}: ${value.count} transaction(s)` : `${value.date}: No transactions`;
  };

  // Function to format the USD at risk per chain for display
  const formatUsdAtRiskPerChain = () => {
    return Object.keys(usdAtRiskPerChain)
      .map((chain) => `${chain} ($${usdAtRiskPerChain[chain].toFixed(2)})`)
      .join(", ");
  };

  const formatNetWorthSummary = () => {
    if (!highestChain.chain) return "";

    return `💰 The total net worth is $${netWorth} with the highest funds on ${highestChain.chain.toUpperCase()} amounting to $${
      highestChain.amount
    }.`;
  };

  const formatProfitabilitySummary = () => {
    if (totalTrades === 0) return '';

    return `📈 You have made a total of ${totalTrades} trades across Ethereum and Polygon with your net profit of $${totalProfit.toFixed(2)}.`;
  };

 // Format the protocols and position data for display
const formatDeFiSummary = () => {
    if (!highestPosition || defiProtocols.size === 0) return "";
  
    const protocolsArray = Array.from(defiProtocols);
    const protocolsString = protocolsArray.join(", ");
    const highestUsdValue = highestPosition.balance_usd.toFixed(2);
    const highestPositionLabel = highestPosition.label;
    const highestTokenName = highestPosition.tokens[0]?.name || "";
    const protocol = highestProtocolName; // Protocol of the highest position
  
    return `💳 Interacted with ${defiProtocols.size} unique DeFi protocols (${protocolsString}) with your highest being $${highestUsdValue} in ${highestTokenName} on ${protocol} as a ${highestPositionLabel} position.`;
  };
  return (
    <div className="onchain-container">
      <section className="onchain-hero-section">
        <div className="onchain-hero-content">
          <img src={makeBlockie(walletAddress)} alt="Wallet Avatar" />
          <h1>{walletAddress}</h1>
          {loading ? (
            <div>
              <div className="onchain-loader"></div>
              <p className="onchain-loading-text">{loadingText}</p>
            </div>
          ) : (
            <div>
              <h2 className="onchain-score">
                Your Onchain Score is: {onchainScore}
              </h2>
              <div className="onchain-info">
                <h3>ETH Mainnet Transaction Heatmap (1y)</h3>
                <CalendarHeatmap
                  startDate={new Date(new Date().setDate(new Date().getDate() - 365))} // Last year
                  endDate={new Date()} // Today
                  values={heatmapData}
                  classForValue={(value) => {
                    if (!value || value.count === 0) {
                      return 'color-empty'; // No transactions
                    }
                    // Define classes for intensity (based on transaction count)
                    return `color-scale-${Math.min(value.count, 4)}`;
                  }}
                  tooltipDataAttrs={value => ({
                    'data-tooltip-id': 'heatmap-tooltip',
                    'data-tooltip-content': getTooltipData(value),
                  })}
                  showWeekdayLabels={true}
                />
                <Tooltip id="heatmap-tooltip" />
              </div>
              <div className="onchain-info">
              <h3>Wallet Summary</h3>
                <ul>
                {ensDomain && (
                    <>
                      <li>
                        📌 The wallet owns an ENS Domain ({ensDomain})
                      </li>
                    </>
                  )}
                      {unstoppableDomain && (
                    <>
                      <li>
                      📌 The wallet owns an Unstoppable Domain ({unstoppableDomain})
                      </li>
                    </>
                  )}
                  <li>
                    💡 The wallet has transacted on {transactedChains.length}{" "}
                    chain(s).
                  </li>
                  <li>
                    🌐 Transacted on:{" "}
                    {transactedChains.map((chain) => chain.chain).join(", ")}
                  </li>
                  {totalTransactions > 0 && (
                    <>
                      <li>
                        ❄️ You have performed {totalTransactions} transactions
                        totally across all chains, with your highest on{" "}
                        {favoriteChain} with{" "}
                        {chainStats[favoriteChain]?.transactions.total}{" "}
                        transactions.
                      </li>
                      <li>
                        ⚡️ Your favorite chain for trading NFTs seems to be{" "}
                        {favoriteNftChain}, owning{" "}
                        {chainStats[favoriteNftChain]?.nfts} NFTs and{" "}
                        {chainStats[favoriteNftChain]?.nft_transfers.total} NFT
                        Transfers
                      </li>
                    </>
                  )}
                  {firstTransactionDate && (
                    <>
                      <li>
                        📅 Your first transaction ever was performed on{" "}
                        {firstTransactionDate} on {firstTransactionChain}.
                      </li>
                      <li>⏳ Your wallet is {walletAge} years old.</li>
                    </>
                  )}
                  <ul>
                    <li>
                      {" "}
                      💡 The total USD at risk from token approvals is: $
                      {totalUsdAtRisk.toFixed(2)} on the following chains -{" "}
                      {formatUsdAtRiskPerChain()}.
                    </li>
                    <li>{formatDeFiSummary()}</li>
                    <li>{formatNetWorthSummary()}</li>
                    <li>{formatProfitabilitySummary()}</li>
                    <li>💵 Total gas fees paid till date (ETH Mainnet): {totalFees.toFixed(6)} ETH (USD {totalFeesInUsd})</li>
                  </ul>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OnchainScore;
