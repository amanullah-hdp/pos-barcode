import {
  Archive,
  BarChart3,
  ClipboardList,
  LayoutGrid,
  Package,
  ScanLine,
  Settings,
  Upload,
  UserSquare,
  Users,
  Wallet,
} from 'lucide-react';

export const mainNav = [
  { to: '/', label: 'Point of sales', icon: ScanLine, end: true },
  { to: '/activity', label: 'Activity', icon: ClipboardList },
  { to: '/reports', label: 'Report', icon: BarChart3 },
] as const;

export const inventoryNav = [
  { to: '/products', label: 'Products', icon: Package },
  { to: '/catalog', label: 'Catalog', icon: LayoutGrid },
  { to: '/staff', label: 'Staff', icon: UserSquare },
  { to: '/import', label: 'Import', icon: Upload },
] as const;

export const otherNav = [
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/close', label: 'End of day', icon: Wallet },
  { to: '/exports', label: 'Exports', icon: Archive },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

export const pageTitles: Record<string, string> = {
  '/': 'Point of sales',
  '/activity': 'Activity',
  '/reports': 'Report',
  '/products': 'Inventory',
  '/catalog': 'Catalog',
  '/staff': 'Staff',
  '/import': 'Import',
  '/customers': 'Customers',
  '/close': 'End of day',
  '/exports': 'Exports',
  '/settings': 'Settings',
};
