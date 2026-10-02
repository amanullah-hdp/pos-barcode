import { getSettingsRow, parsePaymentMethods } from '../db.js';

export function settingsForClient() {
  const row = getSettingsRow();
  return {
    shop_name: row.shop_name,
    address: row.address,
    phone: row.phone,
    logo_url: row.logo_path ? '/api/settings/logo' : null,
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
