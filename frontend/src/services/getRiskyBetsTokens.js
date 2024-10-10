export const getRiskyBetsTokens = async (chain, max_market_cap, one_week_holders_change, one_week_net_volume_change_usd, one_month_volume_change_usd, security_score, one_month_price_percent_change_usd) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-risky-bets-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chain,
        max_market_cap,
        one_week_holders_change,
        one_week_net_volume_change_usd,
        one_month_volume_change_usd,
        security_score,
        one_month_price_percent_change_usd,
      }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch risky bets tokens');
    }
  
    const data = await response.json();
    return data;
  };
  