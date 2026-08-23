import { formatLocale } from '../../i18n';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';

const labels: Record<string, string> = { PENDING: 'En attente', HOLD: 'Préautorisation active', CAPTURED: 'Débitée', RELEASED: 'Libérée', REFUNDED: 'Remboursée' };

export default function AdminPaymentsPage() {
  const [deposits, setDeposits] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState<string | null>(null);
  const role = useAuthStore((state) => state.user?.role); const canCapture = ['ADMIN', 'OPERATIONS', 'FINANCE'].includes(role || ''); const canRefund = ['ADMIN', 'FINANCE'].includes(role || '');
  const load = () => { setLoading(true); api.get('/deposits').then((response: any) => setDeposits(response.data || [])).catch(() => toast.error('Impossible de charger les cautions.')).finally(() => setLoading(false)); };
  useEffect(load, []);
  const action = async (id: string, type: 'capture' | 'refund') => { setSaving(id); try { await api.post(`/deposits/${id}/${type}`); toast.success(type === 'capture' ? 'Caution capturée.' : 'Remboursement demandé.'); load(); } catch (error: any) { toast.error(error.response?.data?.message || 'Action impossible.'); } finally { setSaving(null); } };
  return <div className="space-y-6"><div><p className="text-sm font-bold tracking-[.16em] text-accent">FINANCE</p><h2 className="mt-1 text-2xl font-extrabold text-primary">Cautions et paiements</h2><p className="mt-1 text-sm text-slate-600">Historique local des préautorisations, captures, libérations et remboursements Stripe test.</p></div><Card className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Client</th><th className="px-5 py-4">Montant</th><th className="px-5 py-4">Statut</th><th className="px-5 py-4">Créée</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-600">Chargement…</td></tr> : deposits.length ? deposits.map((deposit) => <tr key={deposit.id} className="text-slate-700"><td className="px-5 py-4"><p className="font-semibold text-primary">{deposit.user?.firstName} {deposit.user?.lastName}</p><p className="text-xs text-slate-500">{deposit.user?.email}</p></td><td className="px-5 py-4 font-extrabold text-primary">{(deposit.amount / 100).toLocaleString(formatLocale())} $ CAD</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{labels[deposit.status] || deposit.status}</span></td><td className="px-5 py-4 text-xs">{new Date(deposit.createdAt).toLocaleString(formatLocale())}</td><td className="px-5 py-4 text-right">{deposit.status === 'HOLD' && canCapture ? <Button size="sm" disabled={saving === deposit.id} onClick={() => action(deposit.id, 'capture')}><CreditCard className="mr-1 h-3.5 w-3.5" />Capturer</Button> : deposit.status === 'CAPTURED' && canRefund ? <Button size="sm" variant="outline" disabled={saving === deposit.id} onClick={() => action(deposit.id, 'refund')}>Rembourser</Button> : <span className="text-xs text-slate-500">—</span>}</td></tr>) : <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-600">Aucune caution.</td></tr>}</tbody></table></Card></div>;
}
