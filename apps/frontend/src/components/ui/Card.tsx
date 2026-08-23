import { cn } from './Button';

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn('rounded-2xl border border-border bg-card text-slate-900 shadow-soft', className)}>
      {children}
    </div>
  );
};
