// Simple password-based admin auth: verify the shared password, then issue a
// signed JWT stored in an httpOnly cookie. Verified in the proxy (edge) and in
// route handlers. No user table — a single admin protected by ADMIN_PASSWORD.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "xr_admin_session";
const SESSION_TTL = "12h";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set (see .env.example).");
  }
  return new TextEncoder().encode(secret);
}

/** Check a submitted password against ADMIN_PASSWORD (constant-time-ish). */
export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not set (see .env.example).");
  }
  if (password.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Create a signed session token for the admin. */
export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

/** Returns true if the token is a valid, unexpired admin session. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
