import { createHmac } from "crypto";

export function validateTelegramInitData(
  initDataRaw: string,
  botToken: string
): boolean {
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

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return computedHash === hash;
}
