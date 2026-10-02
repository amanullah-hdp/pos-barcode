import type { NextFunction, Request, Response } from 'express';
import { COOKIE_NAME, pinRequired, verifySessionToken } from '../utils/session.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!pinRequired()) {
    next();
    return;
  }
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (verifySessionToken(token)) {
    next();
    return;
  }
  res.status(401).json({ error: 'Authentication required' });
}
