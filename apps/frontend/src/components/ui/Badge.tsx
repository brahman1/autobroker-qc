import { cn } from './Button';

export const Badge = ({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'danger' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-success/20 text-success border border-success/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    danger: 'bg-danger/20 text-danger border border-danger/30',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors', variants[variant], className)}>
      {children}
    </span>
  );
};
