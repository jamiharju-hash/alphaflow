import { NextResponse } from "next/server";
import { callCoinbaseApi } from "@/lib/coinbase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const endpoint = String(body.endpoint ?? "");
    const params = body.params ?? {};

    const result = await callCoinbaseApi({
      method: "GET",
      endpoint,
      params,
    });

    return NextResponse.json(result.payload, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}
