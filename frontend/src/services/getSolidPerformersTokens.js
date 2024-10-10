export const getSolidPerformersTokens = async (chain, one_month_net_volume_change_usd, one_week_net_volume_change_usd, one_day_net_volume_change_usd, one_month_volume_change_usd, security_score, one_month_price_percent_change_usd) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/get-solid-performers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chain,
        one_month_net_volume_change_usd,
        one_week_net_volume_change_usd,
        one_day_net_volume_change_usd,
        one_month_volume_change_usd,
        security_score,
        one_month_price_percent_change_usd,
      }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch solid performers');
    }
  
    const data = await response.json();
    return data;
  };
  