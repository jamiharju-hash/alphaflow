export const portfolioMetrics = {
  portfolioValue: 10000,
  cash: 2380,
  activeValue: 7620,
  totalRoiPct: 0,
  riskUsedPct: 41,
  executeReviews: 3,
};

export const positions = [
  { asset: "BTC", category: "crypto", value: 3500, pnlPct: 8.4, exposurePct: 35, status: "active" },
  { asset: "ETH", category: "crypto", value: 1800, pnlPct: 4.2, exposurePct: 18, status: "active" },
  { asset: "Micro-SaaS A", category: "micro_saas", value: 2320, pnlPct: 0, exposurePct: 23.2, status: "active" },
];

export const opportunities = [
  { name: "Base infra token", category: "crypto", score: 84, decision: "EXECUTE_REVIEW", asymmetry: 27, velocity: 24, edge: 16, liquidity: 17 },
  { name: "Solana wallet-flow signal", category: "crypto", score: 78, decision: "WATCHLIST", asymmetry: 24, velocity: 22, edge: 14, liquidity: 18 },
  { name: "Local contractor SaaS", category: "micro_saas", score: 88, decision: "EXECUTE_REVIEW", asymmetry: 28, velocity: 23, edge: 20, liquidity: 17 },
  { name: "Illiquid private deal", category: "private_deal", score: 52, decision: "IGNORE", asymmetry: 18, velocity: 8, edge: 16, liquidity: 10 },
];

export const weeklyReviews = [
  { week: "2026-W17", winRate: 62, velocityDays: 54, pnl: 420, action: "Increase DD threshold discipline" },
  { week: "2026-W16", winRate: 57, velocityDays: 68, pnl: 190, action: "Reduce low-liquidity exposure" },
];
