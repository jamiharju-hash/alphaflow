import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SignJWT, importPKCS8 } from "npm:jose@5.9.6";

const COINBASE_API_BASE = Deno.env.get("COINBASE_API_BASE") ?? "https://api.coinbase.com";
const COINBASE_KEY_ID = Deno.env.get("COINBASE_KEY_ID");
const COINBASE_PRIVATE_KEY_PEM = Deno.env.get("COINBASE_PRIVATE_KEY_PEM");
const COINBASE_PRIVATE_KEY_BASE64 = Deno.env.get("COINBASE_PRIVATE_KEY_BASE64");

const ALLOWED_ENDPOINTS = [
  /^\/api\/v3\/brokerage\/accounts$/,
  /^\/api\/v3\/brokerage\/products$/,
  /^\/api\/v3\/brokerage\/products\/[A-Z0-9-]+$/,
  /^\/api\/v3\/brokerage\/orders\/historical\/batch$/,
  /^\/api\/v3\/brokerage\/portfolios$/,
  /^\/api\/v3\/brokerage\/transaction_summary$/,
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function derBase64ToPkcs8Pem(base64: string) {
  const clean = base64.replace(/\s+/g, "");
  const lines = clean.match(/.{1,64}/g)?.join("\n") ?? clean;
  return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`;
}

function getPrivateKeyPem() {
  if (COINBASE_PRIVATE_KEY_PEM) {
    return COINBASE_PRIVATE_KEY_PEM.replace(/\\n/g, "\n");
  }

  if (COINBASE_PRIVATE_KEY_BASE64) {
    return derBase64ToPkcs8Pem(COINBASE_PRIVATE_KEY_BASE64);
  }

  throw new Error("Missing COINBASE_PRIVATE_KEY_PEM or COINBASE_PRIVATE_KEY_BASE64");
}

function assertAllowed(method: string, endpoint: string) {
  if (method !== "GET") {
    throw new Error("Only GET is enabled in this MVP proxy. Add POST order placement only after trade safeguards.");
  }

  const ok = ALLOWED_ENDPOINTS.some((pattern) => pattern.test(endpoint));
  if (!ok) {
    throw new Error(`Endpoint not allowlisted: ${endpoint}`);
  }
}

async function buildCoinbaseJwt(method: string, endpoint: string) {
  if (!COINBASE_KEY_ID) throw new Error("Missing COINBASE_KEY_ID");

  const privateKey = await importPKCS8(getPrivateKeyPem(), "ES256");
  const url = new URL(COINBASE_API_BASE);
  const host = url.host;
  const uri = `${method.toUpperCase()} ${host}${endpoint}`;
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT({
    iss: "cdp",
    sub: COINBASE_KEY_ID,
    nbf: now,
    exp: now + 120,
    uri,
  })
    .setProtectedHeader({
      alg: "ES256",
      kid: COINBASE_KEY_ID,
      nonce: crypto.randomUUID(),
      typ: "JWT",
    })
    .sign(privateKey);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Expected POST" }, 405);
  }

  try {
    const body = await req.json();
    const method = String(body.method ?? "GET").toUpperCase();
    const endpoint = String(body.endpoint ?? "");
    const params = body.params ?? {};

    assertAllowed(method, endpoint);

    const url = new URL(endpoint, COINBASE_API_BASE);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const jwt = await buildCoinbaseJwt(method, endpoint);

    const coinbaseResponse = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const text = await coinbaseResponse.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }

    return json(payload, coinbaseResponse.status);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      400,
    );
  }
});
