import { CUBEX_RECEIPT_POWERED_BY } from '../../lib/cubexReceipt';
import { ReceiptBrandLogo } from './ReceiptBrandLogo';
import { formatPkrReceiptCubex } from '../../lib/money';
import { formatInvoiceNo, formatReceiptDateTime, parseReceiptTermsBullets } from '../../lib/receiptFormat';

export type ReceiptPrintSettings = {
  shop_name: string;
  receipt_brand: string;
  address: string;
  phone: string;
  receipt_footer: string;
  receipt_terms: string;
  feedback_whatsapp: string;
  receipt_powered_by: string;
  till_no: string;
  staff_id: string;
  cashier_name: string;
};

function formatPhonesCubex(phone: string): string {
  return phone
    .split(/\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ');
}

function formatPaymentLabel(method: string): string {
  return method.replace(/_/g, ' ').toUpperCase();
}

function formatDiscountAmount(cents: number): string {
  if (cents <= 0) return '0.00';
  return `${formatPkrReceiptCubex(cents)}-`;
}

function SummaryRow(props: { label: string; value: string; amountDue?: boolean }) {
  return (
    <div className={`receipt-summary-row${props.amountDue ? ' receipt-summary-row-amount-due' : ''}`}>
      <span className="receipt-summary-label">
        {props.amountDue ? <strong>{props.label}</strong> : props.label}
      </span>
      <span className="receipt-summary-value receipt-nums">
        {props.amountDue ? <strong>{props.value}</strong> : props.value}
      </span>
    </div>
  );
}

export function ReceiptPrint(props: {
  settings: ReceiptPrintSettings;
  logoUrl: string | null;
  receiptNumber: number;
  createdAt: string;
  paymentMethod: string;
  paymentReference: string | null;
  customerName?: string | null;
  shopDiscountCents: number;
  lines: {
    label: string;
    qty: number;
    unit_price_cents: number;
    line_total_cents: number;
    discount_cents?: number;
    sku?: string | null;
  }[];
  totalCents: number;
}) {
  const { settings: s } = props;
  const itemQty = props.lines.reduce((n, l) => n + l.qty, 0);
  const subTotal = props.lines.reduce((n, l) => n + l.qty * l.unit_price_cents, 0);
  const lineDiscountSum = props.lines.reduce((n, l) => n + (l.discount_cents ?? 0), 0);
  const shopDisc = props.shopDiscountCents;
  const totalSavings = lineDiscountSum + shopDisc;
  const pay = props.paymentMethod.toLowerCase();
  const isCash = pay === 'cash';
  const addressLines = s.address
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const poweredBy = (s.receipt_powered_by || CUBEX_RECEIPT_POWERED_BY).replace(/^https?:\/\//, '');

  const termsBullets = parseReceiptTermsBullets(s.receipt_terms || '');

  return (
    <div className="receipt-print">
      {props.logoUrl ? (
        <img src={props.logoUrl} alt="" className="receipt-logo" />
      ) : (
        <ReceiptBrandLogo label={s.receipt_brand || 'BARCODE'} />
      )}

      <p className="receipt-branch">{s.shop_name}</p>
      {addressLines.map((line) => (
        <p key={line} className="receipt-meta">
          {line}
        </p>
      ))}
      {s.phone ? <p className="receipt-meta">{formatPhonesCubex(s.phone)}</p> : null}

      <div className="receipt-meta-block">
        <p>
          <span className="receipt-label">CUSTOMER TYPE:</span> {props.customerName ?? 'Walkin Customer'}
        </p>
        <p>
          <span className="receipt-label">STAFF ID:</span> {s.staff_id}
        </p>
        <p>
          <span className="receipt-label">TILL NO:</span> {s.till_no}
        </p>
        <p>
          <span className="receipt-label">INVOICE NO:</span>{' '}
          <span className="receipt-nums">{formatInvoiceNo(props.createdAt, props.receiptNumber)}</span>
        </p>
        <p>
          <span className="receipt-label">INVOICE DATE:</span>{' '}
          <span className="receipt-nums">{formatReceiptDateTime(props.createdAt)}</span>
        </p>
        <p>
          <span className="receipt-label">CASHIER:</span> {s.cashier_name}
        </p>
      </div>

      <hr className="receipt-rule-solid" />

      <div className="receipt-line-items">
        <div className="receipt-table-head receipt-table-6">
          <span>ITEM</span>
          <span>QTY</span>
          <span className="receipt-table-spacer" aria-hidden />
          <span>PRICE</span>
          <span>DISCOUNT</span>
          <span>TOTAL</span>
        </div>
        <hr className="receipt-rule-solid receipt-rule-tight" />

        {props.lines.map((l, i) => {
          const disc = l.discount_cents ?? 0;
          const skuPart = l.sku?.trim();
          const itemLabel = skuPart ? `${skuPart} ${l.label}` : l.label;
          return (
            <div key={i} className="receipt-line">
              <p className="receipt-item-name">{itemLabel}</p>
              <div className="receipt-table-row receipt-table-6">
                <span aria-hidden />
                <span className="receipt-nums">{l.qty}</span>
                <span className="receipt-table-spacer" aria-hidden />
                <span className="receipt-nums">{formatPkrReceiptCubex(l.unit_price_cents)}</span>
                <span className="receipt-nums">{formatPkrReceiptCubex(disc)}</span>
                <span className="receipt-nums">{formatPkrReceiptCubex(l.line_total_cents)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <hr className="receipt-rule-solid" />

      <div className="receipt-summary">
        <SummaryRow label="QUANTITY" value={String(itemQty)} />
        <SummaryRow label="SUB-TOTAL" value={formatPkrReceiptCubex(subTotal)} />
        <SummaryRow label="DISCOUNT" value={formatDiscountAmount(lineDiscountSum)} />
        <SummaryRow label="SHOP DISCOUNT" value={formatDiscountAmount(shopDisc)} />
        <SummaryRow label="AMOUNT DUE" value={formatPkrReceiptCubex(props.totalCents)} amountDue />
      </div>

      <hr className="receipt-rule-solid receipt-rule-after-due" />

      <div className="receipt-summary">
        {isCash ? (
          <>
            <SummaryRow label="CASH" value={formatPkrReceiptCubex(props.totalCents)} />
            <SummaryRow label="CHANGE" value="0.00" />
          </>
        ) : (
          <SummaryRow label={formatPaymentLabel(props.paymentMethod)} value={formatPkrReceiptCubex(props.totalCents)} />
        )}
      </div>

      {props.paymentReference ? (
        <p className="receipt-ref">
          Ref: <span className="receipt-nums">{props.paymentReference}</span>
        </p>
      ) : null}

      <p className="receipt-savings">
        TOTAL SAVINGS: <span className="receipt-nums">{formatPkrReceiptCubex(totalSavings)}</span>
      </p>

      <div className="receipt-terms">
        <p className="receipt-terms-heading">
          <strong>TERMS AND CONDITIONS:</strong>
        </p>
        <ul className="receipt-terms-list">
          {termsBullets.map((text, i) => (
            <li key={i}>
              <span className="receipt-terms-text">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="receipt-footer-block">
        <p className="receipt-thanks">{s.receipt_footer || 'Thank you for Shopping at Barcode'}</p>
        <p className="receipt-footer-line">For Feedback and Complaints</p>
        {s.feedback_whatsapp ? (
          <p className="receipt-footer-line">Whatsapp : {s.feedback_whatsapp}</p>
        ) : null}
      </div>

      <hr className="receipt-rule-solid receipt-rule-before-powered" />

      <p className="receipt-powered">Powered by {poweredBy}</p>
    </div>
  );
}
