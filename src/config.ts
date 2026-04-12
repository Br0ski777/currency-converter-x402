import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "currency-converter",
  slug: "currency-converter",
  description: "Real-time currency conversion using ECB rates for fiat and CoinGecko for crypto.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/convert",
      price: "$0.001",
      description: "Convert between fiat currencies and cryptocurrencies",
      toolName: "finance_convert_currency",
      toolDescription: "Use this when you need to convert between currencies — both fiat (USD, EUR, GBP, JPY, etc.) and crypto (BTC, ETH, SOL, etc.). Accepts amount, source currency, and target currency. Returns converted amount, exchange rate, and rate source. Fiat rates from ECB, crypto rates from CoinGecko. Do NOT use for market data or charts — use stock_quote instead. Do NOT use for DeFi swap quotes — use dex_get_swap_quote instead. Do NOT use for wallet balances — use wallet_get_portfolio instead.",
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
