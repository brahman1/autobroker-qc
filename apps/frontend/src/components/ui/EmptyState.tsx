import { ReactNode } from 'react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export function EmptyState({ title, description, icon, action }: { title: string, description: string, icon?: ReactNode, action?: { label: string, href: string } }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-card/50">
      {icon && <div className="text-4xl mb-4 text-slate-500">{icon}</div>}
      <h3 className="mb-2 text-xl font-bold text-primary">{title}</h3>
      <p className="mb-6 max-w-sm text-slate-600">{description}</p>
      {action && (
        <Link to={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
