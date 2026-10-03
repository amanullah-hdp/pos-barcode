import { getSettingsRow, parsePaymentMethods } from '../db.js';
import { logoFileExists, readLogoDataUrl } from './receiptLogo.js';

export function settingsForClient() {
  const row = getSettingsRow();
  const hasLogo = Boolean(row.logo_path && logoFileExists());
  return {
    shop_name: row.shop_name,
    address: row.address,
    phone: row.phone,
    logo_url: hasLogo ? '/api/settings/logo' : null,
    receipt_footer: row.receipt_footer,
    receipt_brand: row.receipt_brand ?? 'BARCODE',
    till_no: row.till_no ?? '1',
    receipt_terms: row.receipt_terms ?? '',
    feedback_whatsapp: row.feedback_whatsapp ?? '',
    receipt_powered_by: row.receipt_powered_by ?? 'www.cubexretail.com',
    payment_methods: parsePaymentMethods(row.payment_methods_json),
    db_path: row.db_path,
    day_closed_date: row.day_closed_date,
  };
}

/** Settings snapshot for printed receipts — embeds logo bytes for reliable Windows/Electron print. */
export function settingsForReceipt() {
  const base = settingsForClient();
  const logo_data_url = readLogoDataUrl();
  return {
    ...base,
    logo_data_url,
    logo_url: logo_data_url ? base.logo_url : null,
  };
}
