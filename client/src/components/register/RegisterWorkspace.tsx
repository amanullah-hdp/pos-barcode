import type { ReactNode } from 'react';

export function RegisterWorkspace({ catalog, cart }: { catalog: ReactNode; cart: ReactNode }) {
  return (
    <div className="register-workspace surface-elevated min-h-0 w-full flex-1">
      <div className="register-workspace__catalog">{catalog}</div>
      <aside className="register-workspace__cart hidden min-h-0 lg:block">{cart}</aside>
    </div>
  );
}
