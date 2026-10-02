import {
  Archive,
  BarChart3,
  LayoutGrid,
  Package,
  ScanLine,
  Settings,
  Upload,
  Users,
  UserSquare,
  Wallet,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { api, type Settings as ShopSettings } from '../../lib/api';
import { Badge } from '../ui/Badge';
import { SearchField } from '../ui/SearchField';

const mainNav = [
  { to: '/', label: 'Point of sales', icon: ScanLine, end: true },
  { to: '/activity', label: 'Activity', icon: ClipboardList },
  { to: '/reports', label: 'Report', icon: BarChart3 },
] as const;

const inventoryNav = [
  { to: '/products', label: 'Products', icon: Package },
  { to: '/catalog', label: 'Catalog', icon: LayoutGrid },
  { to: '/staff', label: 'Staff', icon: UserSquare },
  { to: '/import', label: 'Import', icon: Upload },
] as const;

const otherNav = [
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/close', label: 'End of day', icon: Wallet },
  { to: '/exports', label: 'Exports', icon: Archive },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

const titles: Record<string, string> = {
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

function NavItem({ to, label, icon: Icon, end }: { to: string; label: string; icon: typeof ScanLine; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-[var(--primary)] text-white shadow-[var(--primary-glow)]'
            : 'text-[var(--text-secondary)] hover:bg-white/80 hover:text-[var(--text)]'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
      {label}
    </NavLink>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  const isRegister = pathname === '/';
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [lowStock, setLowStock] = useState(0);
  const [dayClosed, setDayClosed] = useState(false);
  const [menuQuery, setMenuQuery] = useState('');
  const [pinRequired, setPinRequired] = useState(false);

  useEffect(() => {
    void api.get<{ pin_required: boolean }>('/api/health').then((h) => setPinRequired(h.pin_required));
    void api.get<ShopSettings>('/api/settings').then(setSettings);
    void api.get<{ count: number }>('/api/products/alerts/low-stock').then((d) => setLowStock(d.count));
    void api.get<{ closed: boolean }>('/api/day-close/status').then((d) => setDayClosed(d.closed));
  }, [pathname]);

  const dateLabel = new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const q = menuQuery.trim().toLowerCase();
  const navMatch = (label: string) => !q || label.toLowerCase().includes(q);
  const showMain = mainNav.some((i) => navMatch(i.label));
  const showInv = inventoryNav.some((i) => navMatch(i.label));
  const showOther = otherNav.some((i) => navMatch(i.label));

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden">
      <aside className="hidden w-[var(--sidebar-w)] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-surface)]/90 p-4 backdrop-blur-sm lg:flex">
        <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-3.5 shadow-sm">
          <p className="text-sm font-semibold">{settings?.shop_name ?? 'Barcode'}</p>
          <p className="text-xs text-[var(--text-muted)]">Till 1 · Cashier</p>
        </div>
        <div className="mb-4">
          <SearchField
            compact
            placeholder="Search menu…"
            aria-label="Search menu"
            value={menuQuery}
            onChange={(e) => setMenuQuery(e.target.value)}
          />
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {showMain
            ? mainNav.filter((item) => navMatch(item.label)).map((item) => <NavItem key={item.to} {...item} />)
            : null}
          {showInv ? (
            <>
              <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Inventory</p>
              {inventoryNav.filter((item) => navMatch(item.label)).map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </>
          ) : null}
          {showOther ? (
            <>
              <p className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">More</p>
              {otherNav.filter((item) => navMatch(item.label)).map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </>
          ) : null}
          {q && !showMain && !showInv && !showOther ? (
            <p className="px-3 py-2 text-xs text-[var(--text-muted)]">No menu items match</p>
          ) : null}
        </nav>
        <div className="mt-4 space-y-2">
          {pinRequired ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              onClick={() => void api.post('/api/auth/logout').then(() => window.location.reload())}
            >
              <LogOut className="h-4 w-4" />
              Lock screen
            </button>
          ) : null}
          <p className="text-[10px] leading-relaxed text-[var(--text-muted)]">Barcode POS · Offline</p>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!isRegister ? (
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold tracking-tight">{titles[pathname] ?? 'Barcode POS'}</h1>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-[var(--text-muted)] md:inline">{dateLabel}</span>
              {dayClosed ? <Badge tone="danger">Day closed</Badge> : <Badge tone="success">Open order</Badge>}
              {lowStock > 0 ? <Badge tone="warning">{lowStock} low</Badge> : null}
            </div>
          </header>
        ) : null}

        <main
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${
            isRegister ? 'overflow-hidden p-3 pb-20 lg:p-4 lg:pb-4' : 'w-full overflow-auto p-4 sm:p-6 lg:px-8 lg:py-6'
          }`}
        >
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-[var(--border)] bg-[var(--bg-surface)]/95 px-2 py-1 backdrop-blur lg:hidden">
        {[mainNav[0], mainNav[1], mainNav[2], inventoryNav[0], otherNav[3]].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : undefined}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center py-2 text-[10px] font-medium ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
