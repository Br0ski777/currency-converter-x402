import type { Hono } from "hono";

const CRYPTO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  USDC: "usd-coin",
  USDT: "tether",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  DOT: "polkadot",
  ADA: "cardano",
  LINK: "chainlink",
  UNI: "uniswap",
  DOGE: "dogecoin",
  XRP: "ripple",
  BNB: "binancecoin",
  ARB: "arbitrum",
  OP: "optimism",
  NEAR: "near",
  ATOM: "cosmos",
};

function isCrypto(currency: string): boolean {
  return CRYPTO_IDS.hasOwnProperty(currency.toUpperCase());
}

async function getFiatRate(from: string, to: string): Promise<{ rate: number; source: string }> {
  // Frankfurter API (ECB rates, free, no key needed)
  const response = await fetch(
    `https://api.frankfurter.app/latest?from=${from.toUpperCase()}&to=${to.toUpperCase()}`
  );

  if (!response.ok) {
    throw new Error(`Fiat rate not found for ${from} -> ${to}`);
  }

  const data = (await response.json()) as any;
  const rate = data.rates?.[to.toUpperCase()];

  if (!rate) {
    throw new Error(`Currency pair not supported: ${from} -> ${to}`);
  }

  return { rate, source: "ECB via Frankfurter" };
}

async function getCryptoPrice(cryptoId: string, vsCurrency: string): Promise<number> {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${vsCurrency.toLowerCase()}`
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error`);
  }

  const data = (await response.json()) as any;
  const price = data[cryptoId]?.[vsCurrency.toLowerCase()];

  if (!price) {
    throw new Error(`Crypto price not found for ${cryptoId} in ${vsCurrency}`);
  }

  return price;
}

async function convert(
  amount: number,
  from: string,
  to: string
): Promise<{ convertedAmount: number; rate: number; source: string }> {
  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();
  const fromIsCrypto = isCrypto(fromUpper);
  const toIsCrypto = isCrypto(toUpper);

  // Case 1: Both fiat
  if (!fromIsCrypto && !toIsCrypto) {
    const { rate, source } = await getFiatRate(fromUpper, toUpper);
    return { convertedAmount: amount * rate, rate, source };
  }

  // Case 2: Crypto -> Fiat
  if (fromIsCrypto && !toIsCrypto) {
    const cryptoId = CRYPTO_IDS[fromUpper];
    const price = await getCryptoPrice(cryptoId, toUpper);
    return { convertedAmount: amount * price, rate: price, source: "CoinGecko" };
  }

  // Case 3: Fiat -> Crypto
  if (!fromIsCrypto && toIsCrypto) {
    const cryptoId = CRYPTO_IDS[toUpper];
    const price = await getCryptoPrice(cryptoId, fromUpper);
    const rate = 1 / price;
    return { convertedAmount: amount * rate, rate, source: "CoinGecko" };
  }

  // Case 4: Crypto -> Crypto (go via USD)
  const fromId = CRYPTO_IDS[fromUpper];
  const toId = CRYPTO_IDS[toUpper];
  const fromUsd = await getCryptoPrice(fromId, "usd");
  const toUsd = await getCryptoPrice(toId, "usd");
  const rate = fromUsd / toUsd;
  return { convertedAmount: amount * rate, rate, source: "CoinGecko (via USD)" };
}

export function registerRoutes(app: Hono) {
  app.post("/api/convert", async (c) => {
    const body = await c.req.json().catch(() => null);

    if (!body?.amount || !body?.from || !body?.to) {
      return c.json({ error: "Missing required fields: amount, from, to" }, 400);
    }

    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return c.json({ error: "Amount must be a positive number" }, 400);
    }

    const from: string = body.from.toUpperCase();
    const to: string = body.to.toUpperCase();

    if (from === to) {
      return c.json({
        amount,
        from,
        to,
        convertedAmount: amount,
        rate: 1,
        source: "identity",
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const result = await convert(amount, from, to);

      return c.json({
        amount,
        from,
        to,
        convertedAmount: Math.round(result.convertedAmount * 100000000) / 100000000,
        rate: result.rate,
        source: result.source,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return c.json({ error: "Conversion failed: " + error.message }, 500);
    }
  });
}
