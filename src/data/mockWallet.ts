import type { Wallet } from "@/types";
export const mockWallet: Wallet = {
  id: "wallet-main", name: "Primary wallet", address: "GDKQ4AVP7DNTJOFMBWLU5P3K4XQZW7TMMFXGQDGVXHLVLQOQX2JCFLOW", network: "Stellar Network", connected: true, totalBalance: 12480.32,
  assets: [
    { id: "usdc", name: "USD Coin", symbol: "USDC", balance: 8742.18, usdValue: 8742.18, change: 4.8, allocation: 70.05, issuer: "Centre" },
    { id: "xlm", name: "Stellar Lumens", symbol: "XLM", balance: 16428.5, usdValue: 3104.99, change: -1.2, allocation: 24.88, issuer: "Native" },
    { id: "eurc", name: "Euro Coin", symbol: "EURC", balance: 584.1, usdValue: 633.15, change: 2.1, allocation: 5.07, issuer: "Circle" },
  ],
};
