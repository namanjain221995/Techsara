import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = 'admin_session';
const TOKEN_EXPIRY = '7d';

// Verify submitted credentials against .env values
export function verifyCredentials(
  username: string,
  password: string
): boolean {
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;
  return username === validUsername && password === validPassword;
}

// Create a signed JWT token
export function createToken(): string {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

// Verify a JWT token — returns true if valid
export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// Cookie settings
export const cookieOptions = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  path: '/',
};

export { COOKIE_NAME };
