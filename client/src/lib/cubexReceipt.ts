/** Cubex legacy slip — terms body (heading rendered separately on print). Use `\n` for manual line breaks within a bullet. */
export const CUBEX_RECEIPT_TERMS_BODY = `• No cash refunds.
• All items must be in original condition with
barcode,hangtags and labels intact.
• Exchange within 15 days from the date of purchase.
• Sales receipt is to be presented for product
exchange and complaint registration.
• Item purchased at full price which go on sale, will be exchanged at the marked down prices.
• Kindly check the product at the time of purchase.
• Store will not be responsible for any damage
afterward.
• Please take care of your personal belongings.
• Management will not be responsible for any loss.`;

export const CUBEX_RECEIPT_POWERED_BY = 'www.cubexretail.com';

/** Detect pre-Cubex-parity terms so migrate can upgrade once. */
export function isLegacyBarcodeReceiptTerms(terms: string): boolean {
  return terms.includes('exchange only as per store policy') || terms.includes('Undergarments and socks');
}

/** Single-line Cubex terms (before forced line breaks for thermal layout). */
export function needsCubexTermsLineBreaks(terms: string): boolean {
  return (
    terms.includes('condition with barcode,hangtags') ||
    terms.includes('presented for product exchange and') ||
    terms.includes('any damage afterward.')
  );
}
