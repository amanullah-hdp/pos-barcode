import crypto from 'node:crypto';

const COOKIE_NAME = 'pos_session';
const SESSION_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.BARCODE_POS_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BARCODE_POS_SECRET must be set (min 16 chars) in production');
  }
  return 'dev-only-insecure-secret-change-me';
}

export function pinRequired(): boolean {
  return Boolean(process.env.BARCODE_POS_PIN?.length);
}

export function verifyPin(pin: string): boolean {
  const expected = process.env.BARCODE_POS_PIN;
  if (!expected) return true;
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const exp = String(Date.now() + SESSION_MS);
  const sig = crypto.createHmac('sha256', secret()).update(exp).digest('base64url');
  return `${exp}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!pinRequired()) return true;
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  const expected = crypto.createHmac('sha256', secret()).update(exp).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  return Number(exp) > Date.now();
}

export { COOKIE_NAME, SESSION_MS };
