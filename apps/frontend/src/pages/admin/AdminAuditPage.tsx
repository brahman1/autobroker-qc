import { formatLocale } from '../../i18n';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/audit-logs').then((response: any) => setLogs(response.data || [])).catch(() => toast.error('Impossible de charger le journal d’audit.')).finally(() => setLoading(false)); }, []);
  return <div className="space-y-6"><div><p className="text-sm font-bold tracking-[.16em] text-accent">CONFORMITÉ</p><h2 className="mt-1 text-2xl font-extrabold text-primary">Journal d’audit</h2><p className="mt-1 text-sm text-slate-600">Historique des actions sensibles réalisées sur les offres, commandes et litiges.</p></div><Card className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Action</th><th className="px-5 py-4">Élément</th><th className="px-5 py-4">Intervenant</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-600">Chargement…</td></tr> : logs.length ? logs.map((log) => <tr key={log.id} className="text-slate-700"><td className="px-5 py-4 text-xs">{new Date(log.createdAt).toLocaleString(formatLocale())}</td><td className="px-5 py-4 font-bold text-primary"><ClipboardList className="mr-2 inline h-4 w-4 text-accent" />{log.action}</td><td className="px-5 py-4">{log.entityType} <span className="font-mono text-xs text-slate-500">{log.entityId.slice(0, 8)}</span></td><td className="px-5 py-4">{log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'Système'}</td></tr>) : <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-600">Aucune action journalisée pour le moment.</td></tr>}</tbody></table></Card></div>;
}
