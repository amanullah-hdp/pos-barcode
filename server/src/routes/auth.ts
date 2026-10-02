import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { COOKIE_NAME, SESSION_MS, createSessionToken, pinRequired, verifyPin } from '../utils/session.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

router.get('/status', (_req, res) => {
  res.json({ pin_required: pinRequired() });
});

router.post('/login', loginLimiter, (req, res) => {
  if (!pinRequired()) {
    res.json({ ok: true });
    return;
  }
  const pin = typeof req.body?.pin === 'string' ? req.body.pin : '';
  if (!verifyPin(pin)) {
    res.status(401).json({ error: 'Invalid PIN' });
    return;
  }
  const token = createSessionToken();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MS,
    path: '/',
  });
  res.json({ ok: true });
});

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
});

export default router;
