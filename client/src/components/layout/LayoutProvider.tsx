import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';

const SIDEBAR_STORAGE_KEY = 'barcode-pos-sidebar-collapsed';

const COMPACT_MQ = '(max-width: 1366px), (max-height: 820px)';

type LayoutContextValue = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebar: () => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function applyDocumentLayout(sidebarCollapsed: boolean, densityCompact: boolean): void {
  const root = document.documentElement;
  root.dataset.sidebar = sidebarCollapsed ? 'collapsed' : 'expanded';
  root.dataset.density = densityCompact ? 'compact' : 'comfortable';
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(readSidebarCollapsed);
  const [densityCompact, setDensityCompact] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(COMPACT_MQ).matches : false,
  );

  const setSidebarCollapsed = useCallback((value: boolean) => {
    setSidebarCollapsedState(value);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState((c) => !c);
  }, []);

  useLayoutEffect(() => {
    applyDocumentLayout(sidebarCollapsed, densityCompact);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [sidebarCollapsed, densityCompact]);

  useLayoutEffect(() => {
    const mq = window.matchMedia(COMPACT_MQ);
    const onChange = () => setDensityCompact(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <LayoutContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed, toggleSidebar }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return ctx;
}

/** @deprecated Use useLayout().toggleSidebar */
export function useSidebarLayout() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useLayout();
  return {
    collapsed: sidebarCollapsed,
    toggle: toggleSidebar,
    setCollapsed: setSidebarCollapsed,
  };
}
