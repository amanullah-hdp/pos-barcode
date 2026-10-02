import { useEffect, useState } from 'react';
import type { ReceiptPayload } from '../../lib/api';
import { ReceiptPrint } from './ReceiptPrint';

export function ReceiptHost() {
  const [payload, setPayload] = useState<ReceiptPayload | null>(null);

  useEffect(() => {
    const h = (e: Event) => setPayload((e as CustomEvent<ReceiptPayload>).detail);
    document.addEventListener('receipt-print', h);
    return () => document.removeEventListener('receipt-print', h);
  }, []);

  useEffect(() => {
    if (!payload) return;

    const runPrint = () => {
      window.print();
    };

    const t = window.setTimeout(runPrint, 200);
    const onAfterPrint = () => {
      setPayload(null);
      document.dispatchEvent(new CustomEvent('receipt-print-done'));
    };
    window.addEventListener('afterprint', onAfterPrint);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [payload]);

  if (!payload) return null;

  const s = payload.settings;

  return (
    <div className="receipt-print-host" aria-hidden>
      <ReceiptPrint
        settings={{
          shop_name: s.shop_name,
          receipt_brand: s.receipt_brand,
          address: s.address,
          phone: s.phone,
          receipt_footer: s.receipt_footer,
          receipt_terms: s.receipt_terms,
          feedback_whatsapp: s.feedback_whatsapp,
          receipt_powered_by: s.receipt_powered_by,
          till_no: s.till_no,
          staff_id: payload.sale.staff_code ?? '—',
          cashier_name: payload.sale.staff_name ?? '—',
        }}
        logoUrl={s.logo_url}
        receiptNumber={payload.sale.receipt_number}
        createdAt={payload.sale.created_at}
        paymentMethod={payload.sale.payment_method}
        paymentReference={payload.sale.payment_reference}
        customerName={payload.customer_name}
        shopDiscountCents={Number(payload.sale.shop_discount_cents ?? 0)}
        lines={payload.lines}
        totalCents={payload.sale.total_cents}
      />
    </div>
  );
}
