import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] font-semibold shadow-md hover:shadow-[var(--primary-glow)] active:scale-[0.98]',
  secondary:
    'bg-white text-[var(--text)] border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border)]',
  ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border border-red-200',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  fullWidth,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}) {
  const sz =
    size === 'sm' ? 'px-3 py-1.5 text-sm rounded-lg' : size === 'lg' ? 'px-6 py-3.5 text-base rounded-xl' : 'px-4 py-2.5 text-sm rounded-xl';
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${sz} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
