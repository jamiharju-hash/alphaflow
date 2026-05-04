export type OpportunityScoreInput = {
  expectedUpsideMultiple: number;
  expectedReturnDays: number;
  ownerEdgeScore: number;
  liquidityScore: number;
};

export function scoreAsymmetry(upside: number) {
  if (upside >= 10) return 30;
  if (upside >= 5) return 24;
  if (upside >= 3) return 18;
  if (upside >= 2) return 10;
  return 0;
}

export function scoreVelocity(days: number) {
  if (days <= 30) return 30;
  if (days <= 60) return 24;
  if (days <= 90) return 18;
  if (days <= 180) return 10;
  return 0;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function scoreOpportunity(input: OpportunityScoreInput) {
  const asymmetry = scoreAsymmetry(input.expectedUpsideMultiple);
  const velocity = scoreVelocity(input.expectedReturnDays);
  const ownerEdge = clamp(input.ownerEdgeScore, 0, 20);
  const liquidity = clamp(input.liquidityScore, 0, 20);
  const total = asymmetry + velocity + ownerEdge + liquidity;

  return {
    asymmetry,
    velocity,
    ownerEdge,
    liquidity,
    total,
    decision: total >= 80 ? "EXECUTE_REVIEW" : total >= 60 ? "WATCHLIST" : "IGNORE",
  } as const;
}
