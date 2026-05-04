import { NextResponse } from "next/server";
import { callCoinbaseApi } from "@/lib/coinbase";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createSupabaseAdminClient();

    const [accountsResult, productsResult, ordersResult] = await Promise.all([
      callCoinbaseApi({ endpoint: "/api/v3/brokerage/accounts" }),
      callCoinbaseApi({ endpoint: "/api/v3/brokerage/products", params: { limit: 50 } }),
      callCoinbaseApi({ endpoint: "/api/v3/brokerage/orders/historical/batch", params: { limit: 50 } }),
    ]);

    if (!accountsResult.ok || !productsResult.ok || !ordersResult.ok) {
      return NextResponse.json(
        { accountsResult, productsResult, ordersResult },
        { status: 502 }
      );
    }

    const accounts = Array.isArray(accountsResult.payload.accounts) ? accountsResult.payload.accounts : [];
    const products = Array.isArray(productsResult.payload.products) ? productsResult.payload.products : [];
    const orders = Array.isArray(ordersResult.payload.orders) ? ordersResult.payload.orders : [];

    if (accounts.length > 0) {
      await supabase.from("coinbase_accounts").upsert(
        accounts.map((account: any) => ({
          coinbase_uuid: account.uuid,
          name: account.name,
          currency: account.currency,
          available_value: Number(account.available_balance?.value ?? 0),
          hold_value: Number(account.hold?.value ?? 0),
          raw: account,
          synced_at: new Date().toISOString(),
        })),
        { onConflict: "coinbase_uuid" }
      );
    }

    if (products.length > 0) {
      await supabase.from("coinbase_products").upsert(
        products.map((product: any) => ({
          product_id: product.product_id,
          base_name: product.base_name,
          quote_name: product.quote_name,
          price: Number(product.price ?? 0),
          price_change_24h: Number(product.price_percentage_change_24h ?? 0),
          volume_24h: Number(product.volume_24h ?? 0),
          status: product.status,
          raw: product,
          synced_at: new Date().toISOString(),
        })),
        { onConflict: "product_id" }
      );
    }

    if (orders.length > 0) {
      await supabase.from("coinbase_orders").upsert(
        orders.map((order: any) => ({
          order_id: order.order_id,
          product_id: order.product_id,
          side: order.side,
          status: order.status,
          created_time: order.created_time,
          raw: order,
          synced_at: new Date().toISOString(),
        })),
        { onConflict: "order_id" }
      );
    }

    await supabase.from("coinbase_sync_logs").insert({
      sync_type: "coinbase_full_sync",
      status: "success",
      payload: {
        accounts: accounts.length,
        products: products.length,
        orders: orders.length,
      },
    });

    return NextResponse.json({
      ok: true,
      synced: {
        accounts: accounts.length,
        products: products.length,
        orders: orders.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
