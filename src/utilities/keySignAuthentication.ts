import crypto from "crypto";

export function generateAuthKey(secret: string): string {
  const payload = {
    rand: crypto.randomBytes(16).toString("hex"),
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8h from now
  };

  const payloadStr = JSON.stringify(payload);
  const payloadBuf = Buffer.from(payloadStr, "utf8");

  const signatureBuf = Buffer.from(
    crypto.createHmac("sha256", secret).update(payloadStr).digest("hex"),
    "hex"
  );
  const lengthBuf = Buffer.allocUnsafe(4);
  lengthBuf.writeUInt32BE(payloadBuf.length, 0);

  // Combine [length][payload][signature] into a single opaque token
  const combined = Buffer.concat([
    lengthBuf as unknown as Uint8Array,
    payloadBuf as unknown as Uint8Array,
    signatureBuf as unknown as Uint8Array,
  ]);

  return combined.toString("base64url");
}

/**
 * Verify a previously generated auth key.
 */
export function verifyAuthKey(secret: string, key: string): boolean {
  let combined: Buffer;
  try {
    combined = Buffer.from(key, "base64url");
  } catch {
    return false;
  }

  // Read payload length (first 4 bytes)
  const payloadLength = combined.readUInt32BE(0);

  // Slice payload + signature correctly
  const payloadBuf = combined.subarray(4, 4 + payloadLength);
  const signatureBuf = combined.subarray(4 + payloadLength);

  const payloadStr = payloadBuf.toString("utf8");

  let payload: { rand: string; exp: number };
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return false;
  }

  // Recompute expected signature
  const expectedSignatureBuf = Buffer.from(
    crypto.createHmac("sha256", secret).update(payloadStr).digest("hex"),
    "hex"
  );

  // Convert to Uint8Array to satisfy TS's strict typing for timingSafeEqual
  const sigBytes = new Uint8Array(signatureBuf);
  const expectedBytes = new Uint8Array(expectedSignatureBuf);

  if (sigBytes.length !== expectedBytes.length) return false;
  if (!crypto.timingSafeEqual(sigBytes, expectedBytes)) return false;

  // Expiration check
  if (Date.now() > payload.exp) return false;

  return true;
}
