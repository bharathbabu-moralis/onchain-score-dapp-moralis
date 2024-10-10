import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import makeBlockie from "ethereum-blockies-base64";
import { getChainActivity } from "../services/getChainActivity";
import { getTokenApprovals } from "../services/getTokenApprovals";
import { getDeFiPositions } from "../services/getDeFiPositions";
import { getWalletNetWorth } from "../services/getWalletNetWorth";
import { getProfitabilitySummary } from "../services/getProfitabilitySummary";
import { getDomainData } from "../services/getDomainData";
import { getTransactionHistoryAndFees } from "../services/getTransactionHistoryAndFees";
import { getTokenPriceInUsd } from "../services/getTokenPriceInUsd";
import { getTrendingTokens } from "../services/getTrendingTokens";
import { getBlueChipTokens } from "../services/getBlueChipTokens";
import { getRiskyBetsTokens } from "../services/getRiskyBetsTokens";
import { getSolidPerformersTokens } from "../services/getSolidPerformersTokens";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip } from "react-tooltip";
import TokenCard from './TokenCard'; 
import "../OnchainScore.css"; // Import the new CSS file

const OnchainScore = () => {
  const { walletAddress } = useParams();
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Fetching wallet data");
  const [onchainScore, setOnchainScore] = useState(0);
  const [chainData, setChainData] = useState(null); // Holds active chain data
  const [transactedChains, setTransactedChains] = useState([]); // Chains with transactions
  const [chainStats, setChainStats] = useState({}); // Holds stats for each chain
  const [totalTransactions, setTotalTransactions] = useState(0); // Total number of transactions
  const [favoriteChain, setFavoriteChain] = useState(""); // Chain with most transactions
  const [favoriteChainTxCount, setFavoriteChainTxCount] = useState(""); // Chain with most transactions
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
  const [totalFeesPerChain, setTotalFeesPerChain] = useState({}); // Holds total gas fees per chain
  const [totalFeesInUsdPerChain, setTotalFeesInUsdPerChain] = useState({}); // Holds total gas fees in USD per chain
  const [transactionHeatmapData, setTransactionHeatmapData] = useState([]); // Holds transaction timestamps
  const [totalFeesInUsd, setTotalFeesInUsd] = useState(0);
  const [highestFeesInUsd, setHighestFeesInUsd] = useState(0);
  const [highestFeeChain, setHighestFeeChain] = useState("");
  const [userType, setUserType] = useState("");
  const [gaugeValue, setGaugeValue] = useState("");
  const [recommendedTokens, setRecommendedTokens] = useState([])
  const sampleTokens = [
    {
      token_address: "0x64d0f55cd8c7133a9d7102b13987235f486f2224",
      token_logo: "https://d23exngyjlavgo.cloudfront.net/0x1_0x64d0f55cd8c7133a9d7102b13987235f486f2224",
      token_name: "SwissBorg Token",
      token_symbol: "BORG",
      price_usd: 0.1607,
      price_percent_change_usd: { "1d": -1.88 },
    },
    {
      token_address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      token_logo: "https://d23exngyjlavgo.cloudfront.net/0x1_0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      token_name: "Wrapped Ether",
      token_symbol: "WETH",
      price_usd: 2441.12,
      price_percent_change_usd: { "1d": 2.34 },
    },
    {
      token_address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      token_logo: "https://d23exngyjlavgo.cloudfront.net/0x1_0x514910771af9ca656af840dff83e8264ecf986ca",
      token_name: "ChainLink Token",
      token_symbol: "LINK",
      price_usd: 18.45,
      price_percent_change_usd: { "1d": 0.45 },
    },
  ];

  useEffect(() => {
    let loadingMessages = [
      "Fetching wallet data",
      "Analyzing transactions",
      "Gathering DeFi positions",
      "Fetching token prices",
      "Calculating total transaction fees",
      "Aggregating data across multiple chains",
      "Checking for wallet domains (ENS, Unstoppable)",
      "Processing transaction heatmap data",
      "Building your transaction heatmap",
      "Evaluating risk from token approvals",
      "Calculating total gas fees in USD",
      "Analyzing smart contract interactions",
      "Calculating wallet's net worth",
      "Finalizing onchain analysis",
    ];

    let count = 0;
    const intervalId = setInterval(() => {
      setLoadingText(loadingMessages[count % loadingMessages.length] + "...");
      count++;
    }, 1300);

    const fetchData = async () => {
      try {
        // Fetch chain activity data
        const data = await getChainActivity(walletAddress);
        setChainData(data);

        // Filter chains with transactions (i.e., those that have a first transaction)
        const activeChains = data.active_chains.filter(
          (chain) => chain.first_transaction !== null
        );
        setTransactedChains(activeChains);

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

        // Fetch the current USD price of ETH, BNB, AVAX, and MATIC
        const [ethPriceInUsd, bnbPriceInUsd, avaxPriceInUsd, maticPriceInUsd] =
          await Promise.all([
            getTokenPriceInUsd(
              "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
              "eth"
            ), // ETH price
            getTokenPriceInUsd(
              "0x418D75f65a02b3D53B2418FB8E1fe493759c7605",
              "eth"
            ), // BNB price
            getTokenPriceInUsd(
              "0x85f138bfEE4ef8e540890CFb48F620571d67Eda3",
              "eth"
            ), // AVAX price
            getTokenPriceInUsd(
              "0x7c9f4C87d911613Fe9ca58b579f737911AAD2D43",
              "eth"
            ), // MATIC price
          ]);

        // Initialize local variables
        let totalFees = {};
        let totalFeesInUsd = {};
        let transactionCounts = {};
        let totalTransactionsAcrossChains = 0;

        // Fetch transaction history and fees for each chain
        const chainPromises = activeChains.map(async (chain) => {
          const { totalTransactionFees, allTimestamps } =
            await getTransactionHistoryAndFees(walletAddress, chain.chain);

          let chainPriceInUsd;
          switch (chain.chain) {
            case "avalanche":
              chainPriceInUsd = avaxPriceInUsd;
              break;
            case "bsc":
              chainPriceInUsd = bnbPriceInUsd;
              break;
            case "polygon":
              chainPriceInUsd = maticPriceInUsd;
              break;
            default:
              chainPriceInUsd = ethPriceInUsd; // For Ethereum and layer 2s
          }

          const feesInUsd = totalTransactionFees * chainPriceInUsd;
          totalFees[chain.chain] = isNaN(totalTransactionFees)
            ? 0
            : totalTransactionFees;
          totalFeesInUsd[chain.chain] = isNaN(feesInUsd) ? 0 : feesInUsd;

          const transactionCount = allTimestamps.length;
          transactionCounts[chain.chain] = transactionCount;
          totalTransactionsAcrossChains += transactionCount;

          return { chain: chain.chain, timestamps: allTimestamps };
        });

        // Wait for all chains to finish fetching
        const chainResults = await Promise.all(chainPromises);
        const heatmapData = processHeatmapData(chainResults);

        const mostActiveChain = Object.keys(transactionCounts).reduce(
          (maxChain, currentChain) => {
            return transactionCounts[currentChain] > transactionCounts[maxChain]
              ? currentChain
              : maxChain;
          }
        );

        setFavoriteChain(mostActiveChain);
        setFavoriteChainTxCount(transactionCounts[mostActiveChain]);
        setTotalTransactions(totalTransactionsAcrossChains);

        const totalGasFeesInUsd = Object.values(totalFeesInUsd).reduce(
          (acc, fees) => acc + fees,
          0
        );
        const highestFeeChain = Object.keys(totalFeesInUsd).reduce(
          (highest, chain) => {
            return totalFeesInUsd[chain] > totalFeesInUsd[highest]
              ? chain
              : highest;
          },
          Object.keys(totalFeesInUsd)[0]
        );

        const highestFeeAmount = totalFeesInUsd[highestFeeChain];
        setTotalFeesInUsd(totalGasFeesInUsd);
        setHighestFeeChain(highestFeeChain);
        setHighestFeesInUsd(highestFeeAmount);
        setTotalFeesPerChain(totalFees);
        setTotalFeesInUsdPerChain(totalFeesInUsd);
        setTransactionHeatmapData(heatmapData);

        // Fetch ENS and Unstoppable Domains
        const { ensDomain, unstoppableDomain } = await getDomainData(
          walletAddress
        );
        console.log("Domain data API Response ens: ", ensDomain)
        console.log("Domain data API Response ud: ", unstoppableDomain)
        setEnsDomain(ensDomain);
        setUnstoppableDomain(unstoppableDomain);

        // Fetch wallet net worth
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
        setNetWorth(netWorthData.total_networth_usd);

        let highestNetWorth = 0;
        let highestChainData = {};
        netWorthData.chains.forEach((chain) => {
          if (parseFloat(chain.networth_usd) > highestNetWorth) {
            highestNetWorth = parseFloat(chain.networth_usd);
            highestChainData = { chain: chain.chain, amount: highestNetWorth };
          }
        });
        setHighestChain(highestChainData);

        // Calculate USD at risk per chain
        let totalUsdRisk = 0;
        let usdRiskMap = {};

        const approvalsPromises = activeChains.map(async (chain) => {
          try {
            const approvals = await getTokenApprovals(
              walletAddress,
              chain.chain
            );
            let totalUsdRiskForChain = 0;

            approvals.forEach((approval) => {
              // Ensure usd_at_risk is a valid number and safely parse it
              const usdAtRisk = approval?.token?.usd_at_risk
                ? parseFloat(approval.token.usd_at_risk)
                : 0;

              if (!isNaN(usdAtRisk)) {
                totalUsdRiskForChain += usdAtRisk; // Add to the total for this chain
              }
            });

            usdRiskMap[chain.chain] = totalUsdRiskForChain;
            totalUsdRisk += totalUsdRiskForChain; // Accumulate total risk across chains
          } catch (error) {
            console.error(
              `Error fetching approvals for chain ${chain.chain}:`,
              error
            );
            usdRiskMap[chain.chain] = 0; // Default to 0 risk if an error occurs
          }
        });

        // Wait for all promises to resolve
        await Promise.all(approvalsPromises);

        // Update state with the calculated values
        setUsdAtRiskPerChain(usdRiskMap);
        setTotalUsdAtRisk(totalUsdRisk);

        const chains = ["eth"];

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

        const chains_pnl_summary = ["eth", "polygon"];

        let totalTradeCount = 0;
        let totalRealizedProfit = 0;

        // Fetch profitability data for each chain
        const profitPromises = chains_pnl_summary.map(async (chain) => {
          const profitData = await getProfitabilitySummary(
            walletAddress,
            chain
          );

          // Add to total trades and realized profit
          totalTradeCount += profitData.total_count_of_trades;
          totalRealizedProfit += parseFloat(
            profitData.total_realized_profit_usd
          );
        });

        await Promise.all(profitPromises);

        // Set the states for total trades and profit
        setTotalTrades(totalTradeCount);
        setTotalProfit(totalRealizedProfit);

        await Promise.all(defiPromises);

        // Update the states
        setDefiProtocols(protocolSet);
        setHighestPosition(maxPosition);
        setHighestProtocolName(protocolOfMaxPosition);

        let recommendedTokens = [];

        const tokenRecommendationChains = [
          "eth",
          "polygon",
          "bsc",
          "optimism",
          "base",
        ];

  // Helper to pick a random chain excluding the most active one
  const pickRandomChain = (excludeChain) => {
    const filteredChains = tokenRecommendationChains.filter(chain => chain !== excludeChain);
    const randomIndex = Math.floor(Math.random() * filteredChains.length);
    return filteredChains[randomIndex];
  };


    // Pick a random chain (excluding the most active chain) for trending tokens
  const randomChain = pickRandomChain(mostActiveChain);

  // 1. Fetch trending tokens from a random chain
  let trendingTokens = await getTrendingTokens(randomChain, 50000000, 80);

  // 2. Fetch regular tokens (blue-chip, risky, or solid performers) from the most active chain
  let secondaryTokens = [];
  if (totalTrades > 100) {
    // Degen: Fetch risky bets
    secondaryTokens = await getRiskyBetsTokens(mostActiveChain, 10000000, 25, 500, 10000, 70, 1);
  } else if (totalTrades > 50) {
    // Trader: Fetch blue-chip tokens
    secondaryTokens = await getBlueChipTokens(mostActiveChain, 250000000, 2, 2, 10000, 70, 1);
  } else {
    // Newbie: Fetch solid performers
    secondaryTokens = await getSolidPerformersTokens(mostActiveChain, 100000, 10000, 1, 10000, 80, 1);
  }

  recommendedTokens.push(...trendingTokens.slice(0, 3)); // 3 tokens from trending (random chain)
  recommendedTokens.push(...secondaryTokens.slice(0, 2)); // 2 tokens from secondary recommendation (most active chain)

  // 4. Set the recommended tokens in state
  setRecommendedTokens(recommendedTokens.slice(0, 5));

  console.log(recommendedTokens)

        const score = (() => {
          let score = 0;

          // Transaction Activity (40%)
          const baseTransactionScore = 25;
          const transactionScore =
            baseTransactionScore +
            Math.min(15, (totalTransactionsAcrossChains / 250) * 15);
          const chainsScore = Math.min(10, (activeChains.length / 3) * 10);
          const tradesScore = Math.min(10, (totalTrades / 40) * 10);
          score += transactionScore + chainsScore + tradesScore;

          // Wallet Age (5%)
          const baseWalletAgeScore = 4;
          const walletAgeScore =
            baseWalletAgeScore + Math.min(1, (walletAge / 1.5) * 1);
          score += walletAgeScore;

          // DeFi Engagement (10%)
          const baseDeFiEngagementScore = 6;
          const defiEngagementScore =
            baseDeFiEngagementScore + Math.min(4, (defiProtocols.size / 3) * 4);
          score += defiEngagementScore;

          // Net Worth (20%)
          const netWorthScore = Math.min(
            20,
            (netWorthData.total_networth_usd / 20000) * 20
          );
          score += netWorthScore;

          // Risk and Security (5%)
          const maxUsdAtRisk = 50000;
          const riskScore = Math.max(0, (1 - totalUsdRisk / maxUsdAtRisk) * 5);
          score += riskScore;

          // Gas Fees (10%)
          const gasFeesToNetWorthRatio =
            totalGasFeesInUsd / (netWorthData.total_networth_usd || 1);
          const gasFeesScore = Math.min(
            10,
            (gasFeesToNetWorthRatio / 0.05) * 10
          );
          score += gasFeesScore;

          // Profitability (5%)
          const profitScore =
            totalProfit >= 0 ? Math.min(5, (totalProfit / 2000) * 5) : 2;
          score += profitScore;

          // Domain Ownership (10%)
          let domainScore = 0;
          if (ensDomain && unstoppableDomain) {
            domainScore = 10;
          } else if (ensDomain || unstoppableDomain) {
            domainScore = 5;
          }
          score += domainScore;

          // Normalize the score
          return Math.min(100, Math.max(0, score));
        })();
        if (isNaN(score)) score = 0;
        setOnchainScore(score.toFixed(2));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Stop the loading on error
      }
    };

    fetchData();

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [walletAddress]);

  // Function to process transaction timestamps into daily counts per chain for the heatmap
  const processHeatmapData = (chainResults) => {
    const dayCounts = {};

    // Initialize day counts for the past year for each chain
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const day = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i
      );
      dayCounts[day.toISOString().split("T")[0]] = {};
    }

    // Increment counts based on transaction timestamps for each chain
    chainResults.forEach(({ chain, timestamps }) => {
      timestamps.forEach((timestamp) => {
        const date = new Date(timestamp).toISOString().split("T")[0];
        if (dayCounts[date] !== undefined) {
          if (!dayCounts[date][chain]) {
            dayCounts[date][chain] = 0;
          }
          dayCounts[date][chain]++;
        }
      });
    });

    // Convert to array format for react-calendar-heatmap
    return Object.keys(dayCounts).map((date) => ({
      date,
      chains: dayCounts[date],
    }));
  };

  // Format the tooltip to show transactions per chain for each date
  const getTooltipData = (value) => {
    if (!value || !value.chains) return `${value.date}: No transactions`;

    const chainDetails = Object.entries(value.chains)
      .map(([chain, count]) => `${chain}: ${count} tx(s)`)
      .join(", ");

    return `${value.date}: ${chainDetails}`;
  };

  const formatNetWorthSummary = () => {
    if (!highestChain.chain) return "";

    return `💰 The total net worth is $${netWorth} with the highest funds on ${highestChain.chain.toUpperCase()} amounting to $${
      highestChain.amount
    }.`;
  };

  const formatProfitabilitySummary = () => {
    if (totalTrades === 0) return "";

    return `📈 You have made a total of ${totalTrades} trades across Ethereum and Polygon with your net profit of $${totalProfit.toFixed(
      2
    )}.`;
  };

  // Format the protocols and position data for display
  const formatDeFiProtocolInteractionsSummary = () => {
    if (!highestPosition || defiProtocols.size === 0) return "";

    const protocolsArray = Array.from(defiProtocols);
    const protocolsString = protocolsArray.join(", ");
    const highestUsdValue = highestPosition.balance_usd.toFixed(2);
    const highestPositionLabel = highestPosition.label;
    const highestTokenName = highestPosition.tokens[0]?.name || "";
    const protocol = highestProtocolName; // Protocol of the highest position

    return `💳 Interacted with ${defiProtocols.size} unique DeFi protocols (${protocolsString})`;
  };

  // Format the protocols and position data for display
  const formatDeFiPositionTypeSummary = () => {
    if (!highestPosition || defiProtocols.size === 0) return "";

    const protocolsArray = Array.from(defiProtocols);
    const protocolsString = protocolsArray.join(", ");
    const highestUsdValue = highestPosition.balance_usd.toFixed(2);
    const highestPositionLabel = highestPosition.label;
    const highestTokenName = highestPosition.tokens[0]?.name || "";
    const protocol = highestProtocolName; // Protocol of the highest position

    return `🤑 Your highest DeFi position is a ${highestPositionLabel} position with ${highestTokenName} on ${protocol} amounting to $${highestUsdValue}`;
  };

  return (
    <div className="onchain-container">
      <section className="onchain-hero-section">
        <div className="onchain-hero-content">
          <img src={makeBlockie(walletAddress)} alt="Wallet Avatar" />
          {!ensDomain && !unstoppableDomain && <h1>{walletAddress}</h1>}
          {ensDomain && <h1>{ensDomain}</h1>}
          {!ensDomain && unstoppableDomain && <h1>{unstoppableDomain}</h1>}
          {loading ? (
            <div>
              <div className="onchain-loader"></div>
              <p className="onchain-loading-text">{loadingText}</p>
            </div>
          ) : (
            <div>
              <h2 className="onchain-score">Your Onchain Score is:</h2>
              <h2 style={{ fontSize: "3rem", color: "blue" }}>
                {onchainScore} / 100
              </h2>
              <div className="onchain-info">
                <h3>Multichain Transaction Heatmap</h3>
                <CalendarHeatmap
                  startDate={
                    new Date(new Date().setDate(new Date().getDate() - 365))
                  }
                  endDate={new Date()}
                  values={transactionHeatmapData}
                  classForValue={(value) => {
                    if (
                      !value ||
                      !value.chains ||
                      Object.keys(value.chains).length === 0
                    ) {
                      return "color-empty";
                    }
                    // Define classes for intensity based on total transaction count
                    const totalCount = Object.values(value.chains).reduce(
                      (acc, count) => acc + count,
                      0
                    );
                    return `color-scale-${Math.min(totalCount, 4)}`;
                  }}
                  tooltipDataAttrs={(value) => ({
                    "data-tooltip-id": "heatmap-tooltip",
                    "data-tooltip-content": getTooltipData(value),
                  })}
                  showWeekdayLabels={true}
                />
                <Tooltip id="heatmap-tooltip" />
              </div>
              <div className="onchain-info">
                <h3>Top Token Recommendations Based on your Onchain Activity</h3>
      <div className="token-cards-wrapper">
        {recommendedTokens.map((token) => (
          <TokenCard key={token.token_address} token={token} />
        ))}
      </div>
              </div>
              <div className="onchain-info">
                <h3>Wallet Summary</h3>
                <ul>
                  {ensDomain && (
                    <>
                      <li>📌 The wallet owns an ENS Domain ({ensDomain})</li>
                    </>
                  )}
                  {unstoppableDomain && (
                    <>
                      <li>
                        🛑 The wallet owns an Unstoppable Domain (
                        {unstoppableDomain})
                      </li>
                    </>
                  )}
                  <li>
                    💡 The wallet has performed transactions on{" "}
                    {transactedChains.length} chain(s).
                  </li>
                  <li>
                    🌐 Transacted Chains:{" "}
                    {transactedChains.map((chain) => chain.chain).join(", ")}
                  </li>
                  {totalTransactions > 0 && (
                    <>
                      <li>
                        ❄️ You have performed {totalTransactions} transactions
                        totally across all chains, with your highest on{" "}
                        {favoriteChain} with {favoriteChainTxCount}{" "}
                        transactions.
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
                      💡 The total USD at risk from open token approvals is: $
                      {totalUsdAtRisk.toFixed(2)}
                    </li>
                    {highestPosition && (
                      <li>{formatDeFiProtocolInteractionsSummary()}</li>
                    )}
                    {highestPosition && (
                      <li>{formatDeFiPositionTypeSummary()}</li>
                    )}
                    {netWorth > 0 && <li>{formatNetWorthSummary()}</li>}
                    {totalTrades > 0 && <li>{formatProfitabilitySummary()}</li>}
                    {
                      <li>
                        ⛽️ Total gas fees paid across all chains amounts to $
                        {totalFeesInUsd.toFixed(2)}, with the highest paid on{" "}
                        {highestFeeChain.toUpperCase()} amounting to $
                        {highestFeesInUsd.toFixed(2)}
                      </li>
                    }
                  </ul>
                </ul>
              </div>
            </div>
          )}
        </div>
        <a
          href="https://developers.moralis.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://moralis-portfolio-staging-f5f5e6cfeae8.herokuapp.com/images/Powered-by-Moralis-Badge-Text-Grey.svg"
            alt="Powered by Moralis"
            className="moralis-logo"
          />
        </a>
      </section>
    </div>
  );
};

export default OnchainScore;
