type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "good" | "warning";
};

const toneClass = {
  default: "text-zinc-100",
  good: "text-emerald-300",
  warning: "text-copper",
};

export function StatCard({ label, value, helper, tone = "default" }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className={`mt-3 text-3xl font-black tracking-tight ${toneClass[tone]}`}>{value}</div>
      {helper ? <div className="mt-2 text-xs text-zinc-500">{helper}</div> : null}
    </div>
  );
}
