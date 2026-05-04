import { SignJWT, importPKCS8 } from "jose";

const DEFAULT_BASE = "https://api.coinbase.com";

const allowedEndpoints = [
  /^\/api\/v3\/brokerage\/accounts$/,
  /^\/api\/v3\/brokerage\/products$/,
  /^\/api\/v3\/brokerage\/products\/[A-Z0-9-]+$/,
  /^\/api\/v3\/brokerage\/orders\/historical\/batch$/,
  /^\/api\/v3\/brokerage\/portfolios$/,
  /^\/api\/v3\/brokerage\/transaction_summary$/,
];

function derBase64ToPkcs8Pem(base64: string) {
  const clean = base64.replace(/\s+/g, "");
  const lines = clean.match(/.{1,64}/g)?.join("\n") ?? clean;
  return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`;
}

function getPrivateKeyPem() {
  const pem = process.env.COINBASE_PRIVATE_KEY_PEM;
  const base64 = process.env.COINBASE_PRIVATE_KEY_BASE64;

  if (pem && pem !== "ADD_THIS_ONLY_LOCALLY_OR_IN_VERCEL_SECRETS") {
    return pem.replace(/\\n/g, "\n");
  }

  if (base64 && base64 !== "OPTIONAL_BASE64_PKCS8_DER") {
    return derBase64ToPkcs8Pem(base64);
  }

  throw new Error("Missing Coinbase private key env");
}

export function assertCoinbaseEndpoint(method: string, endpoint: string) {
  if (method !== "GET") {
    throw new Error("Only GET is enabled. Trading requires guarded execution workflow.");
  }

  if (!allowedEndpoints.some((pattern) => pattern.test(endpoint))) {
    throw new Error(`Endpoint not allowlisted: ${endpoint}`);
  }
}

async function buildCoinbaseJwt(method: string, endpoint: string) {
  const keyId = process.env.COINBASE_KEY_ID;
  const apiBase = process.env.COINBASE_API_BASE ?? DEFAULT_BASE;

  if (!keyId) throw new Error("Missing COINBASE_KEY_ID");

  const host = new URL(apiBase).host;
  const uri = `${method.toUpperCase()} ${host}${endpoint}`;
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await importPKCS8(getPrivateKeyPem(), "ES256");

  return new SignJWT({
    iss: "cdp",
    sub: keyId,
    nbf: now,
    exp: now + 120,
    uri,
  })
    .setProtectedHeader({
      alg: "ES256",
      kid: keyId,
      nonce: crypto.randomUUID(),
      typ: "JWT",
    })
    .sign(privateKey);
}

export async function callCoinbaseApi(input: {
  method?: "GET";
  endpoint: string;
  params?: Record<string, string | number | boolean | null | undefined>;
}) {
  const method = input.method ?? "GET";
  assertCoinbaseEndpoint(method, input.endpoint);

  const apiBase = process.env.COINBASE_API_BASE ?? DEFAULT_BASE;
  const url = new URL(input.endpoint, apiBase);

  Object.entries(input.params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const jwt = await buildCoinbaseJwt(method, input.endpoint);

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();
  const payload = text ? JSON.parse(text) : {};

  if (!res.ok) {
    return { ok: false, status: res.status, payload };
  }

  return { ok: true, status: res.status, payload };
}
