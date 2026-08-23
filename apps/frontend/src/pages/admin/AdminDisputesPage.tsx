import { formatLocale } from '../../i18n';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquareWarning } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';

const statuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const role = useAuthStore((state) => state.user?.role);
  const canUpdate = ['ADMIN', 'OPERATIONS', 'SUPPORT'].includes(role || '');
  const load = () => { setLoading(true); api.get('/disputes').then((response: any) => setDisputes(response.data || [])).catch(() => toast.error('Impossible de charger les demandes.')).finally(() => setLoading(false)); };
  useEffect(load, []);
  const update = async (dispute: any, status: string) => { setSaving(dispute.id); try { await api.patch(`/disputes/${dispute.id}`, { status, resolution: dispute.resolution || '' }); toast.success('Demande mise à jour.'); load(); } catch (error: any) { toast.error(error.response?.data?.message || 'Mise à jour impossible.'); } finally { setSaving(null); } };
  return <div className="space-y-6"><div><p className="text-sm font-bold tracking-[.16em] text-accent">SOUTIEN CLIENT</p><h2 className="mt-1 text-2xl font-extrabold text-primary">Litiges et demandes</h2><p className="mt-1 text-sm text-slate-600">Centralisez le traitement et conservez une trace de chaque décision.</p></div><div className="space-y-4">{loading ? <Card className="p-8 text-center text-slate-600">Chargement…</Card> : disputes.length ? disputes.map((dispute) => <Card key={dispute.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><MessageSquareWarning className="h-5 w-5 shrink-0 text-accent" /><h3 className="font-extrabold text-primary">{dispute.subject}</h3></div><p className="mt-2 text-sm leading-6 text-slate-700">{dispute.description}</p><p className="mt-3 text-xs text-slate-500">{dispute.user?.firstName} {dispute.user?.lastName} · {dispute.user?.email} · {new Date(dispute.createdAt).toLocaleString(formatLocale())}</p></div>{canUpdate ? <div className="w-full space-y-2 lg:w-64"><select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" value={dispute.status} onChange={(event) => setDisputes((items) => items.map((item) => item.id === dispute.id ? { ...item, status: event.target.value } : item))}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select><input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" placeholder="Résolution communiquée au client" value={dispute.resolution || ''} onChange={(event) => setDisputes((items) => items.map((item) => item.id === dispute.id ? { ...item, resolution: event.target.value } : item))} /><Button className="w-full" size="sm" disabled={saving === dispute.id} onClick={() => update(dispute, dispute.status)}>Enregistrer</Button></div> : <span className="text-xs font-semibold text-slate-500">Lecture seule</span>}</div></Card>) : <Card className="p-8 text-center text-slate-600">Aucun litige ouvert.</Card>}</div></div>;
}
