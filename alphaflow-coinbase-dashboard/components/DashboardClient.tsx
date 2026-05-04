"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { CoinbaseAccount, CoinbaseOrder, CoinbaseProduct } from "@/lib/types";

type ApiState = {
  accounts?: CoinbaseAccount[];
  products?: CoinbaseProduct[];
  orders?: CoinbaseOrder[];
  raw?: unknown;
  error?: string;
};

async function invokeCoinbase(endpoint: string, params?: Record<string, string>) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.functions.invoke("coinbase-proxy", {
    body: {
      method: "GET",
      endpoint,
      params: params ?? {},
    },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

function eur(value?: string) {
  const n = Number(value ?? "0");
  if (!Number.isFinite(n)) return "0,00 €";
  return new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR" }).format(n);
}

export default function DashboardClient() {
  const [state, setState] = useState<ApiState>({});
  const [loading, setLoading] = useState<string | null>(null);

  const totalCash = useMemo(() => {
    return (state.accounts ?? []).reduce((sum, account) => {
      const currency = account.available_balance?.currency;
      const value = Number(account.available_balance?.value ?? "0");
      if (currency === "EUR" && Number.isFinite(value)) return sum + value;
      return sum;
    }, 0);
  }, [state.accounts]);

  async function loadAccounts() {
    setLoading("accounts");
    setState((s) => ({ ...s, error: undefined }));
    try {
      const data = await invokeCoinbase("/api/v3/brokerage/accounts");
      setState((s) => ({ ...s, accounts: data.accounts ?? [], raw: data }));
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : String(err) }));
    } finally {
      setLoading(null);
    }
  }

  async function loadProducts() {
    setLoading("products");
    setState((s) => ({ ...s, error: undefined }));
    try {
      const data = await invokeCoinbase("/api/v3/brokerage/products", { limit: "25" });
      setState((s) => ({ ...s, products: data.products ?? [], raw: data }));
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : String(err) }));
    } finally {
      setLoading(null);
    }
  }

  async function loadOrders() {
    setLoading("orders");
    setState((s) => ({ ...s, error: undefined }));
    try {
      const data = await invokeCoinbase("/api/v3/brokerage/orders/historical/batch", { limit: "25" });
      setState((s) => ({ ...s, orders: data.orders ?? [], raw: data }));
    } catch (err) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : String(err) }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <main>
      <section className="header">
        <div>
          <div className="brand-kicker">AlphaFlow OS / Coinbase Advanced Trade</div>
          <h1>Portfolio Dashboard</h1>
          <p className="subtitle">
            Supabase Edge Function toimii turvallisena server-side välityskerroksena.
            Coinbase private key ei koskaan mene selaimeen.
          </p>
        </div>

        <div className="status-card">
          <div className="status-row"><span>Supabase</span><span className="status-ok">configured</span></div>
          <div className="status-row"><span>Coinbase API</span><span>edge proxy</span></div>
          <div className="status-row"><span>Secrets</span><span>server-side only</span></div>
        </div>
      </section>

      <section className="grid">
        <div className="card col-3">
          <h2>EUR cash</h2>
          <div className="metric">{eur(String(totalCash))}</div>
          <div className="metric-label">Coinbase accounts EUR saldoista</div>
        </div>

        <div className="card col-3">
          <h2>Accounts</h2>
          <div className="metric">{state.accounts?.length ?? 0}</div>
          <div className="metric-label">Ladatut tilit</div>
        </div>

        <div className="card col-3">
          <h2>Products</h2>
          <div className="metric">{state.products?.length ?? 0}</div>
          <div className="metric-label">Markkinat</div>
        </div>

        <div className="card col-3">
          <h2>Orders</h2>
          <div className="metric">{state.orders?.length ?? 0}</div>
          <div className="metric-label">Historialliset orderit</div>
        </div>

        <div className="card col-12">
          <h2>API Actions</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={loadAccounts} disabled={!!loading}>
              {loading === "accounts" ? "Ladataan..." : "Load accounts"}
            </button>
            <button onClick={loadProducts} disabled={!!loading} className="secondary">
              {loading === "products" ? "Ladataan..." : "Load products"}
            </button>
            <button onClick={loadOrders} disabled={!!loading} className="secondary">
              {loading === "orders" ? "Ladataan..." : "Load orders"}
            </button>
          </div>
          {state.error && <p className="error" style={{ marginTop: 14 }}>{state.error}</p>}
        </div>

        <div className="card col-6">
          <h2>Accounts</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Currency</th>
                  <th>Available</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {(state.accounts ?? []).map((a, i) => (
                  <tr key={a.uuid ?? i}>
                    <td>{a.name ?? "—"}</td>
                    <td><span className="badge">{a.currency ?? "—"}</span></td>
                    <td>{a.available_balance?.value ?? "0"} {a.available_balance?.currency ?? ""}</td>
                    <td>{a.active ? "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card col-6">
          <h2>Products</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>24h %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(state.products ?? []).map((p, i) => (
                  <tr key={p.product_id ?? i}>
                    <td>{p.product_id ?? "—"}</td>
                    <td>{p.price ?? "—"}</td>
                    <td>{p.price_percentage_change_24h ?? "—"}</td>
                    <td><span className="badge">{p.status ?? "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card col-12">
          <h2>Orders</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Side</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {(state.orders ?? []).map((o, i) => (
                  <tr key={o.order_id ?? i}>
                    <td>{o.order_id?.slice(0, 12) ?? "—"}</td>
                    <td>{o.product_id ?? "—"}</td>
                    <td>{o.side ?? "—"}</td>
                    <td><span className="badge">{o.status ?? "—"}</span></td>
                    <td>{o.created_time ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card col-12">
          <h2>Raw response</h2>
          <pre>{JSON.stringify(state.raw ?? { message: "Load data to inspect API response" }, null, 2)}</pre>
        </div>
      </section>
    </main>
  );
}
