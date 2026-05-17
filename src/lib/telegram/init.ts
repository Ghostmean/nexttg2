export async function validateTelegramInitData(
  initDataRaw: string,
  botToken: string
): Promise<boolean> {
  const urlParams = new URLSearchParams(initDataRaw);
  const hash = urlParams.get("hash");
  if (!hash) return false;

  urlParams.delete("hash");

  const sortedKeys = Array.from(urlParams.keys()).sort((a, b) =>
    a.localeCompare(b)
  );
  const dataCheckString = sortedKeys
    .map((key) => `${key}=${urlParams.get(key)}`)
    .join("\n");

  const encoder = new TextEncoder();

  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const botTokenSignature = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    encoder.encode(botToken)
  );

  const finalKey = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(botTokenSignature),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const computedSignature = await crypto.subtle.sign(
    "HMAC",
    finalKey,
    encoder.encode(dataCheckString)
  );

  const computedHash = Array.from(new Uint8Array(computedSignature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHash === hash;
}
