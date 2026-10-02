import type { Product } from './api';

export type StockCartLine = { key: string; qty: number };

export function cartQtyForProduct(cart: StockCartLine[], productId: number): number {
  const key = `p-${productId}`;
  return cart.find((l) => l.key === key)?.qty ?? 0;
}

/** Units still available to add (catalog stock minus qty already in cart). */
export function remainingStock(product: Pick<Product, 'id' | 'stock_qty'>, cart: StockCartLine[]): number {
  return Math.max(0, product.stock_qty - cartQtyForProduct(cart, product.id));
}
