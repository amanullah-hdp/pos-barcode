import type { LucideIcon } from 'lucide-react';

export type RegisterCategory = { name: string; count: number };

export function RegisterCategories({
  categories,
  active,
  onSelect,
  iconFor,
}: {
  categories: RegisterCategory[];
  active: string;
  onSelect: (name: string) => void;
  iconFor: (name: string) => LucideIcon;
}) {
  return (
    <div className="register-category-strip">
      {categories.map((c) => {
        const Icon = iconFor(c.name);
        const isActive = active === c.name;
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelect(c.name)}
            className={`register-category-chip ${isActive ? 'register-category-chip--active' : ''}`}
          >
            <Icon className="h-3 w-3 shrink-0" strokeWidth={2} />
            <span className="truncate">{c.name}</span>
            <span className="register-category-chip__count">{c.count}</span>
          </button>
        );
      })}
    </div>
  );
}
