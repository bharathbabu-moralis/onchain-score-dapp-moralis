export const getBlueChipTokens = async (chain, min_market_cap, one_week_price_percent_change_usd, one_day_price_percent_change_usd, one_month_volume_change_usd, security_score, one_month_price_percent_change_usd) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-blue-chip-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chain,
        min_market_cap,
        one_week_price_percent_change_usd,
        one_day_price_percent_change_usd,
        one_month_volume_change_usd,
        security_score,
        one_month_price_percent_change_usd,
      }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch blue-chip tokens');
    }
  
    const data = await response.json();
    return data;
  };
  