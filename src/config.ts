import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "currency-converter",
  slug: "currency-converter",
  description: "Fiat and crypto currency converter -- ECB rates for fiat, CoinGecko for crypto. Instant cross-rate lookup.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/convert",
      price: "$0.001",
      description: "Convert between fiat currencies and cryptocurrencies",
      toolName: "finance_convert_currency",
      toolDescription: `Use this when you need to convert between any currencies -- both fiat (USD, EUR, GBP, JPY) and crypto (BTC, ETH, SOL). Returns conversion result in JSON.

1. convertedAmount: the resulting amount in target currency
2. exchangeRate: the rate used for conversion
3. from: source currency code
4. to: target currency code
5. amount: original amount provided
6. rateSource: data source used (ECB for fiat, CoinGecko for crypto)
7. timestamp: when the rate was fetched

Example output: {"convertedAmount":2815.40,"exchangeRate":0.9218,"from":"USD","to":"EUR","amount":3054.00,"rateSource":"ECB","timestamp":"2026-04-13T12:00:00Z"}

Use this FOR price conversions across fiat and crypto in a single call. Essential for international pricing, invoice generation, and portfolio valuation in local currency.

Do NOT use for market data or charts -- use finance_get_token_price instead. Do NOT use for DeFi swap quotes -- use dex_get_swap_quote instead. Do NOT use for wallet balances -- use wallet_get_portfolio instead.`,
      inputSchema: {
        type: "object",
        properties: {
          amount: { type: "number", description: "Amount to convert" },
          from: { type: "string", description: "Source currency code (e.g., USD, EUR, BTC, ETH)" },
          to: { type: "string", description: "Target currency code (e.g., EUR, GBP, USD, BTC)" },
        },
        required: ["amount", "from", "to"],
      },
    },
  ],
};
