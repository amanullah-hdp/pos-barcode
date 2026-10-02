/**
 * SVG double frame — thermal printers often ignore CSS border/mm; vector strokes print reliably.
 */
export function ReceiptBrandLogo({ label }: { label: string }) {
  const text = (label || 'BARCODE').toUpperCase();
  const stroke = 10;
  const gap = 8;
  const padX = 28;
  const padY = 16;
  const textLen = Math.max(text.length, 6);
  const innerW = textLen * 14 + padX * 2;
  const innerH = 44 + padY;
  const outerW = innerW + (stroke + gap) * 2;
  const outerH = innerH + (stroke + gap) * 2;

  return (
    <svg
      className="receipt-brand-svg"
      viewBox={`0 0 ${outerW} ${outerH}`}
      role="img"
      aria-label={text}
    >
      <rect
        x={stroke / 2}
        y={stroke / 2}
        width={outerW - stroke}
        height={outerH - stroke}
        fill="#fff"
        stroke="#000"
        strokeWidth={stroke}
      />
      <rect
        x={stroke + gap + stroke / 2}
        y={stroke + gap + stroke / 2}
        width={innerW + stroke}
        height={innerH + stroke}
        fill="#fff"
        stroke="#000"
        strokeWidth={stroke}
      />
      <text
        x={outerW / 2}
        y={outerH / 2 + 7}
        textAnchor="middle"
        fill="#000"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={22}
        fontWeight={700}
        fontStyle="italic"
      >
        {text}
      </text>
    </svg>
  );
}
