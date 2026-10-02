import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './db.js';
import { requireAuth } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import brandsRouter from './routes/brands.js';
import categoriesRouter from './routes/categories.js';
import customersRouter from './routes/customers.js';
import dayCloseRouter from './routes/dayClose.js';
import exportsRouter from './routes/exports.js';
import importRouter from './routes/import.js';
import productsRouter from './routes/products.js';
import reportsRouter from './routes/reports.js';
import salesRouter from './routes/sales.js';
import settingsRouter from './routes/settings.js';
import staffRouter from './routes/staff.js';
import { pinRequired } from './utils/session.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST ?? '127.0.0.1';
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  if (!process.env.BARCODE_POS_PIN) {
    console.error('Refusing to start: set BARCODE_POS_PIN in production.');
    process.exit(1);
  }
  if (!process.env.BARCODE_POS_SECRET || process.env.BARCODE_POS_SECRET.length < 16) {
    console.error('Refusing to start: set BARCODE_POS_SECRET (min 16 chars) in production.');
    process.exit(1);
  }
  if (HOST === '0.0.0.0' && !process.env.BARCODE_POS_TRUST_LAN) {
    console.warn('Warning: listening on all interfaces. Use HTTPS reverse proxy and strong PIN.');
  }
}

getDb();

const app = express();
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: isProd ? undefined : false,
  }),
);

const corsOrigin = process.env.BARCODE_POS_CORS_ORIGIN ?? (isProd ? false : 'http://127.0.0.1:5173');
app.use(
  cors(
    corsOrigin
      ? {
          origin: corsOrigin,
          credentials: true,
        }
      : { origin: false },
  ),
);

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    pin_required: pinRequired(),
    /** Bump when checkout contract changes; client uses features.discounts. */
    api_version: 2,
    features: { discounts: true },
  });
});

app.use('/api/auth', authRouter);

function apiAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.path.startsWith('/auth')) {
    next();
    return;
  }
  requireAuth(req, res, next);
}

app.use('/api', apiLimiter, apiAuth);

app.use('/api/settings', settingsRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/staff', staffRouter);
app.use('/api/products', productsRouter);
app.use('/api/import', importRouter);
app.use('/api/customers', customersRouter);
app.use('/api/sales', salesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/day-close', dayCloseRouter);
app.use('/api/exports', exportsRouter);

const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  console.log(`Barcode POS ready at http://${HOST}:${PORT}`);
  if (pinRequired()) {
    console.log('Staff PIN is enabled for API access.');
  }
  if (fs.existsSync(clientDist)) {
    console.log('Open the URL above in your browser (Chrome/Edge recommended for printing).');
  } else {
    console.log('Client not built — run npm run dev from repo root for development.');
  }
});
