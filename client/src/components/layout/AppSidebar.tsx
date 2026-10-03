import { LogOut, PanelLeft, PanelLeftClose, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { api, type Settings as ShopSettings } from '../../lib/api';
import { useLayout } from './LayoutProvider';
import { inventoryNav, mainNav, otherNav } from './navConfig';
import { SearchField } from '../ui/SearchField';

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  collapsed,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        `nav-item-compact flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-[var(--primary)] text-white shadow-[var(--primary-glow)]'
            : 'text-[var(--text-secondary)] hover:bg-white/80 hover:text-[var(--text)]'
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
      <span className="sidebar-nav-label truncate">{label}</span>
    </NavLink>
  );
}

export function AppSidebar({ settings, pinRequired }: { settings: ShopSettings | null; pinRequired: boolean }) {
  const { sidebarCollapsed, toggleSidebar } = useLayout();
  const [menuQuery, setMenuQuery] = useState('');

  const q = menuQuery.trim().toLowerCase();
  const navMatch = (label: string) => !q || label.toLowerCase().includes(q);
  const showMain = mainNav.some((i) => navMatch(i.label));
  const showInv = inventoryNav.some((i) => navMatch(i.label));
  const showOther = otherNav.some((i) => navMatch(i.label));
  const shopName = settings?.shop_name ?? 'Barcode';
  const shopInitial = shopName.trim().charAt(0).toUpperCase() || 'B';

  return (
    <aside className="app-sidebar hidden shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-surface)]/90 p-2 backdrop-blur-sm lg:flex">
      <div className="mb-3 shrink-0">
        <div
          className={`sidebar-brand-mark mx-auto mb-2 h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-sm font-bold text-[var(--primary)]`}
        >
          {shopInitial}
        </div>
        <div className="sidebar-expand-only rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 shadow-sm">
          <p className="truncate text-sm font-semibold">{shopName}</p>
          <p className="text-xs text-[var(--text-muted)]">Till 1 · Cashier</p>
        </div>
      </div>

      <div className="sidebar-expand-only mb-3 shrink-0">
        <SearchField
          compact
          placeholder="Search menu…"
          aria-label="Search menu"
          value={menuQuery}
          onChange={(e) => setMenuQuery(e.target.value)}
        />
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {showMain
          ? mainNav.filter((item) => navMatch(item.label)).map((item) => (
              <NavItem key={item.to} collapsed={sidebarCollapsed} {...item} />
            ))
          : null}
        {showInv ? (
          <>
            <p className="sidebar-expand-only mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Inventory
            </p>
            {sidebarCollapsed ? <div className="mt-2" aria-hidden /> : null}
            {inventoryNav.filter((item) => navMatch(item.label)).map((item) => (
              <NavItem key={item.to} collapsed={sidebarCollapsed} {...item} />
            ))}
          </>
        ) : null}
        {showOther ? (
          <>
            <p className="sidebar-expand-only mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              More
            </p>
            {sidebarCollapsed ? <div className="mt-2" aria-hidden /> : null}
            {otherNav.filter((item) => navMatch(item.label)).map((item) => (
              <NavItem key={item.to} collapsed={sidebarCollapsed} {...item} />
            ))}
          </>
        ) : null}
        {q && !showMain && !showInv && !showOther ? (
          <p className="sidebar-expand-only px-2 py-2 text-xs text-[var(--text-muted)]">No menu items match</p>
        ) : null}
      </nav>

      <div className="mt-2 shrink-0 space-y-1 border-t border-[var(--border)] pt-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="sidebar-collapse-btn flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          )}
          <span className="sidebar-nav-label">Collapse sidebar</span>
        </button>
        {pinRequired ? (
          <button
            type="button"
            title={sidebarCollapsed ? 'Lock screen' : undefined}
            className="sidebar-lock-btn flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
            onClick={() => void api.post('/api/auth/logout').then(() => window.location.reload())}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="sidebar-nav-label">Lock screen</span>
          </button>
        ) : null}
        <p className="sidebar-footer-text px-2 text-[10px] leading-relaxed text-[var(--text-muted)]">Barcode POS · Offline</p>
      </div>
    </aside>
  );
}
