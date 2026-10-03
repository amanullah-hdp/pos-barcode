import { useEffect, useRef, useState } from 'react';
import type { ReceiptPayload } from '../../lib/api';
import { receiptLogoSrc, waitForImages } from '../../lib/receiptLogo';
import { ReceiptPrint } from './ReceiptPrint';

export function ReceiptHost() {
  const [payload, setPayload] = useState<ReceiptPayload | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: Event) => setPayload((e as CustomEvent<ReceiptPayload>).detail);
    document.addEventListener('receipt-print', h);
    return () => document.removeEventListener('receipt-print', h);
  }, []);

  useEffect(() => {
    if (!payload) return;

    let cancelled = false;

    const onAfterPrint = () => {
      setPayload(null);
      document.dispatchEvent(new CustomEvent('receipt-print-done'));
    };
    window.addEventListener('afterprint', onAfterPrint);

    const runPrint = async () => {
      await new Promise<void>((r) => {
        requestAnimationFrame(() => requestAnimationFrame(() => r()));
      });
      const host = hostRef.current;
      if (host) await waitForImages(host);
      if (!cancelled) window.print();
    };

    void runPrint();

    return () => {
      cancelled = true;
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [payload]);

  if (!payload) return null;

  const s = payload.settings;

  return (
    <div ref={hostRef} className="receipt-print-host" aria-hidden>
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
        logoSrc={receiptLogoSrc(s)}
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
