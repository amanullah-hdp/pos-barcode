import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { api, type Settings as ShopSettings } from '../../lib/api';
import { AppSidebar } from './AppSidebar';
import { mainNav, inventoryNav, otherNav, pageTitles } from './navConfig';
import { Badge } from '../ui/Badge';

export function AppShell() {
  const { pathname } = useLocation();
  const isRegister = pathname === '/';
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [lowStock, setLowStock] = useState(0);
  const [dayClosed, setDayClosed] = useState(false);
  const [pinRequired, setPinRequired] = useState(false);

  useEffect(() => {
    void api.get<{ pin_required: boolean }>('/api/health').then((h) => setPinRequired(h.pin_required));
    void api.get<ShopSettings>('/api/settings').then(setSettings);
    void api.get<{ count: number }>('/api/products/alerts/low-stock').then((d) => setLowStock(d.count));
    void api.get<{ closed: boolean }>('/api/day-close/status').then((d) => setDayClosed(d.closed));
  }, [pathname]);

  const dateLabel = new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden">
      <AppSidebar settings={settings} pinRequired={pinRequired} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!isRegister ? (
          <header className="app-page-header flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--bg-surface)]/95 px-3 backdrop-blur-sm sm:gap-3 sm:px-4 lg:px-5">
            <h1 className="min-w-0 truncate text-base font-semibold tracking-tight sm:text-lg">{pageTitles[pathname] ?? 'Barcode POS'}</h1>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
              <span className="hidden text-xs text-[var(--text-muted)] md:inline">{dateLabel}</span>
              {dayClosed ? <Badge tone="danger">Day closed</Badge> : <Badge tone="success">Open order</Badge>}
              {lowStock > 0 ? <Badge tone="warning">{lowStock} low</Badge> : null}
            </div>
          </header>
        ) : null}

        <main
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${
            isRegister ? 'register-shell overflow-hidden pb-20 lg:pb-0' : 'w-full overflow-auto p-3 sm:p-4 lg:p-5'
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
              `flex min-w-0 flex-1 flex-col items-center py-2 text-[10px] font-medium ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="max-w-full truncate">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
