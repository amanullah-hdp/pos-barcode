import type { CartLine } from '../features/register/CartPanel';

export type DiscountMode = 'line' | 'shop';

export function lineGross(line: CartLine): number {
  return line.qty * line.unit_price_cents;
}

export function cartSubtotal(cart: CartLine[]): number {
  return cart.reduce((s, l) => s + lineGross(l), 0);
}

export function cartLineDiscountTotal(cart: CartLine[]): number {
  return cart.reduce((s, l) => s + (l.line_discount_cents ?? 0), 0);
}

export function cartTotal(cart: CartLine[], mode: DiscountMode, shopDiscountCents: number): number {
  const sub = cartSubtotal(cart);
  if (mode === 'shop') {
    return Math.max(0, sub - shopDiscountCents);
  }
  return Math.max(0, sub - cartLineDiscountTotal(cart));
}
