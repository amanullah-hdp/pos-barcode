import type { Product } from './api';

const stockPaths = [
  '/stock/perfume.jpg',
  '/stock/apparel.jpg',
  '/stock/accessories.jpg',
  '/stock/footwear.jpg',
  '/stock/bag.jpg',
  '/stock/default.jpg',
] as const;

function categoryKey(name: string | null): string {
  return (name ?? '').toLowerCase();
}

export function productStockImage(product: Product): string {
  const c = categoryKey(product.category_name);
  const n = product.name.toLowerCase();

  if (c.includes('perfume') || n.includes('oud') || n.includes('perfume') || n.includes('musk')) return '/stock/perfume.jpg';
  if (c.includes('shoe') || c.includes('footwear') || n.includes('shoe') || n.includes('sneaker') || n.includes('loafer') || n.includes('sandal'))
    return '/stock/footwear.jpg';
  if (c.includes('bag')) return '/stock/bag.jpg';
  if (c.includes('belt') || n.includes('belt')) return '/stock/accessories.jpg';
  if (c.includes('watch') || n.includes('watch')) return '/stock/accessories.jpg';
  if (c.includes('jewelry') || n.includes('ring') || n.includes('earring') || n.includes('bracelet')) return '/stock/accessories.jpg';
  if (c.includes('eyewear') || n.includes('glasses') || n.includes('sunglass')) return '/stock/accessories.jpg';
  if (c.includes('scarf') || n.includes('shawl') || n.includes('scarf')) return '/stock/apparel.jpg';
  if (c.includes('gift')) return '/stock/perfume.jpg';
  if (c.includes('accessories') || n.includes('wallet') || n.includes('sock') || n.includes('cap')) return '/stock/accessories.jpg';
  if (
    c.includes('clothes') ||
    c.includes('apparel') ||
    c.includes('kids') ||
    c.includes('outerwear') ||
    c.includes('formal') ||
    c.includes('sportswear') ||
    n.includes('tee') ||
    n.includes('polo') ||
    n.includes('jean') ||
    n.includes('hoodie') ||
    n.includes('jacket') ||
    n.includes('coat') ||
    n.includes('shirt') ||
    n.includes('blazer')
  )
    return '/stock/apparel.jpg';

  return stockPaths[product.id % stockPaths.length] ?? '/stock/default.jpg';
}

export function categoryPillClass(category: string | null): string {
  const c = categoryKey(category);
  if (c.includes('perfume')) return 'bg-rose-100 text-rose-700';
  if (c.includes('apparel') || c.includes('clothes')) return 'bg-indigo-100 text-indigo-700';
  if (c.includes('accessories')) return 'bg-orange-100 text-orange-800';
  if (c.includes('footwear') || c.includes('shoe')) return 'bg-emerald-100 text-emerald-800';
  if (c.includes('bag')) return 'bg-violet-100 text-violet-800';
  if (c.includes('belt')) return 'bg-amber-100 text-amber-900';
  if (c.includes('watch')) return 'bg-cyan-100 text-cyan-900';
  if (c.includes('jewelry')) return 'bg-yellow-100 text-yellow-900';
  if (c.includes('kids')) return 'bg-pink-100 text-pink-800';
  if (c.includes('outerwear')) return 'bg-sky-100 text-sky-900';
  if (c.includes('sportswear')) return 'bg-lime-100 text-lime-900';
  if (c.includes('eyewear')) return 'bg-teal-100 text-teal-900';
  if (c.includes('gift')) return 'bg-fuchsia-100 text-fuchsia-900';
  if (c.includes('scarf')) return 'bg-red-100 text-red-800';
  if (c.includes('formal')) return 'bg-indigo-100 text-indigo-900';
  return 'bg-slate-100 text-slate-600';
}
