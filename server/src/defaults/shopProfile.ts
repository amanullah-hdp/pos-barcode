import { CUBEX_RECEIPT_POWERED_BY, CUBEX_RECEIPT_TERMS_BODY } from './cubexReceipt.js';

/** Legacy demo values — used to auto-upgrade existing dev databases once. */
export const LEGACY_DEMO_SHOP_NAME = 'Barcode — Add-on Counter';
export const LEGACY_DEMO_ADDRESS = 'Main Boulevard, Lahore';

export const BARCODE_PWD_ISB_PROFILE = {
  shop_name: 'BARCODE PWD-ISB',
  address:
    'Plot # 378 & 379, First Floor, Block D,\nNational Police Foundation, Main PWD Road, O-9\nIslamabad',
  phone: '0319-9979908 051-6137681',
  receipt_footer: 'Thank you for Shopping at Barcode',
  receipt_brand: 'BARCODE',
  till_no: '60.1',
  staff_id: '75',
  cashier_name: 'Cashier',
  feedback_whatsapp: '0313-2041115',
  receipt_terms: CUBEX_RECEIPT_TERMS_BODY,
  receipt_powered_by: CUBEX_RECEIPT_POWERED_BY,
};

export function shouldApplyDefaultShopProfile(shop_name: string, address: string): boolean {
  const a = address.trim();
  if (!a || a.includes('Main Boulevard') || a === LEGACY_DEMO_ADDRESS) return true;
  if (shop_name === 'Barcode' || shop_name === LEGACY_DEMO_SHOP_NAME) return true;
  return false;
}
