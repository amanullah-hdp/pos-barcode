import { Router } from 'express';
import fs from 'node:fs';
import multer from 'multer';
import { getDb, getSettingsRow } from '../db.js';
import { logoFilePath } from '../utils/dataDir.js';
import { logoFileExists, mimeForLogoBuffer } from '../utils/receiptLogo.js';
import { settingsForClient } from '../utils/settingsDto.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

const router = Router();

router.get('/', (_req, res) => {
  res.json(settingsForClient());
});

router.get('/logo', (_req, res) => {
  const file = logoFilePath();
  if (!logoFileExists()) {
    res.status(404).end();
    return;
  }
  const buf = fs.readFileSync(file);
  res.setHeader('Cache-Control', 'no-store');
  res.type(mimeForLogoBuffer(buf));
  res.send(buf);
});

router.post('/logo', upload.single('logo'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Logo file required (field: logo)' });
    return;
  }
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(req.file.mimetype)) {
    res.status(400).json({ error: 'Logo must be PNG, JPEG, or WebP' });
    return;
  }
  fs.writeFileSync(logoFilePath(), req.file.buffer);
  getDb().prepare('UPDATE settings SET logo_path = ? WHERE id = 1').run('uploads/logo.png');
  res.json(settingsForClient());
});

router.put('/', (req, res) => {
  const {
    shop_name,
    address,
    phone,
    receipt_footer,
    receipt_brand,
    till_no,
    receipt_terms,
    feedback_whatsapp,
    receipt_powered_by,
    payment_methods,
  } = req.body ?? {};

  const db = getDb();
  const current = getSettingsRow();

  const methods =
    payment_methods !== undefined
      ? JSON.stringify(payment_methods)
      : current.payment_methods_json;

  db.prepare(
    `UPDATE settings SET
      shop_name = ?,
      address = ?,
      phone = ?,
      receipt_footer = ?,
      receipt_brand = ?,
      till_no = ?,
      receipt_terms = ?,
      feedback_whatsapp = ?,
      receipt_powered_by = ?,
      payment_methods_json = ?
     WHERE id = 1`,
  ).run(
    shop_name ?? current.shop_name,
    address ?? current.address,
    phone ?? current.phone,
    receipt_footer ?? current.receipt_footer,
    receipt_brand ?? current.receipt_brand ?? 'BARCODE',
    till_no ?? current.till_no ?? '1',
    receipt_terms ?? current.receipt_terms ?? '',
    feedback_whatsapp ?? current.feedback_whatsapp ?? '',
    receipt_powered_by ?? current.receipt_powered_by ?? 'www.cubexretail.com',
    methods,
  );

  res.json(settingsForClient());
});

export default router;
