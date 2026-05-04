import { Activity, BarChart3, Database, ShieldCheck, Wallet } from "lucide-react";
import { formatCurrency, formatPct } from "@/lib/format";
import { opportunities, portfolioMetrics, positions, weeklyReviews } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";

export function DashboardShell() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 md:py-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-copper">AlphaFlow OS 2026</div>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-0.06em] text-zinc-50 md:text-6xl">
            Portfolio intelligence dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
            Coinbase Advanced Trade -yhteys, opportunity scoring, exposure control, due diligence ja viikkokatsaus yhdessä operatiivisessa näkymässä.
          </p>
        </div>

        <div className="card w-full p-5 md:w-80">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <ShieldCheck className="h-4 w-4 text-copper" /> System status
          </div>
          <StatusRow label="Coinbase proxy" value="Server-side" />
          <StatusRow label="Supabase" value="RLS-ready" />
          <StatusRow label="Trade execution" value="Locked" />
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Portfolio value" value={formatCurrency(portfolioMetrics.portfolioValue)} helper="Starting capital: 10 000 €" />
        <StatCard label="Cash buffer" value={formatCurrency(portfolioMetrics.cash)} helper="Min target 10–20%" tone="good" />
        <StatCard label="Total ROI" value={formatPct(portfolioMetrics.totalRoiPct)} helper="Realized + unrealized" />
        <StatCard label="Execute reviews" value={String(portfolioMetrics.executeReviews)} helper="Score > 80 requires DD" tone="warning" />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Positions" icon={<Wallet className="h-4 w-4" />} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="py-3">Asset</th>
                  <th>Category</th>
                  <th>Value</th>
                  <th>PnL</th>
                  <th>Exposure</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.asset} className="border-t border-white/5">
                    <td className="py-3 font-semibold text-zinc-100">{position.asset}</td>
                    <td><span className="badge">{position.category}</span></td>
                    <td>{formatCurrency(position.value)}</td>
                    <td className={position.pnlPct >= 0 ? "text-emerald-300" : "text-red-300"}>{formatPct(position.pnlPct)}</td>
                    <td>{position.exposurePct}%</td>
                    <td><span className="badge">{position.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Risk engine" icon={<ShieldCheck className="h-4 w-4" />}>
          <div className="space-y-4">
            <RiskBar label="Risk used" value={portfolioMetrics.riskUsedPct} />
            <RiskBar label="Crypto token max" value={35} />
            <RiskBar label="SaaS exposure" value={23} />
            <div className="rounded-2xl border border-copper/30 bg-copper/10 p-4 text-sm text-orange-100">
              Trading is disabled until manual approval, max exposure, and stop-loss checks pass.
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Opportunity scoring" icon={<BarChart3 className="h-4 w-4" />} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="py-3">Name</th>
                  <th>Score</th>
                  <th>Decision</th>
                  <th>Asym</th>
                  <th>Vel</th>
                  <th>Edge</th>
                  <th>Liq</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((item) => (
                  <tr key={item.name} className="border-t border-white/5">
                    <td className="py-3 font-semibold text-zinc-100">{item.name}</td>
                    <td className="font-black text-copper">{item.score}</td>
                    <td><span className="badge">{item.decision}</span></td>
                    <td>{item.asymmetry}</td>
                    <td>{item.velocity}</td>
                    <td>{item.edge}</td>
                    <td>{item.liquidity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Automation pipeline" icon={<Activity className="h-4 w-4" />}>
          <ol className="space-y-3 text-sm text-zinc-300">
            <li className="flex gap-3"><Step /> Source scanner</li>
            <li className="flex gap-3"><Step /> Normalize payload</li>
            <li className="flex gap-3"><Step /> Score opportunity</li>
            <li className="flex gap-3"><Step /> Due diligence if score &gt; 80</li>
            <li className="flex gap-3"><Step /> Weekly KPI review</li>
          </ol>
        </Panel>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Weekly reviews" icon={<Database className="h-4 w-4" />}>
          <div className="space-y-3">
            {weeklyReviews.map((review) => (
              <div key={review.week} className="rounded-2xl border border-white/5 bg-white/[.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-zinc-100">{review.week}</div>
                  <div className="text-sm text-emerald-300">{formatCurrency(review.pnl)}</div>
                </div>
                <div className="mt-2 text-sm text-zinc-400">Win rate {review.winRate}% · Velocity {review.velocityDays} days</div>
                <div className="mt-2 text-sm text-zinc-300">{review.action}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Next build priorities" icon={<Activity className="h-4 w-4" />}>
          <div className="space-y-3 text-sm text-zinc-300">
            <Priority title="1. Connect Supabase data" text="Replace mock-data with live views and service queries." />
            <Priority title="2. Enable Coinbase sync" text="Persist accounts, products and order history through API route." />
            <Priority title="3. Add DD workflow" text="Score > 80 creates required 15-minute checklist before execution." />
            <Priority title="4. Add guarded execution" text="Only after manual approve, exposure check and stop-loss validation." />
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Panel({ title, icon, children, className = "" }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-100">
        <span className="text-copper">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-white/5 py-2 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-semibold text-zinc-200">{value}</span>
    </div>
  );
}

function RiskBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5">
        <div className="h-2 rounded-full bg-copper" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function Step() {
  return <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-copper" />;
}

function Priority({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[.03] p-4">
      <div className="font-bold text-zinc-100">{title}</div>
      <div className="mt-1 text-zinc-400">{text}</div>
    </div>
  );
}
