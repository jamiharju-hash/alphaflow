export function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}
