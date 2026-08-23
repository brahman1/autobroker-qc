import { formatLocale } from '../../i18n';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PackageCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';

const statuses = ['RESERVED', 'AWAITING_PAYMENT', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const role = useAuthStore((state) => state.user?.role);
  const canUpdate = ['ADMIN', 'OPERATIONS'].includes(role || '');
  const load = () => { setLoading(true); api.get('/orders').then((response: any) => setOrders(response.data || [])).catch(() => toast.error('Impossible de charger les commandes.')).finally(() => setLoading(false)); };
  useEffect(load, []);
  const update = async (id: string, status: string) => { setSaving(id); try { await api.patch(`/orders/${id}/status`, { status }); toast.success('Statut de commande mis à jour.'); load(); } catch { toast.error('Mise à jour impossible.'); } finally { setSaving(null); } };
  return <div className="space-y-6"><div><p className="text-sm font-bold tracking-[.16em] text-accent">OPÉRATIONS</p><h2 className="mt-1 text-2xl font-extrabold text-primary">Commandes et livraison</h2><p className="mt-1 text-sm text-slate-600">{canUpdate ? 'Gérez les réservations, paiements et étapes de traitement client.' : 'Consultez les réservations, paiements et étapes de traitement client.'}</p></div><Card className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Commande</th><th className="px-5 py-4">Client</th><th className="px-5 py-4">Véhicule</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Statut</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-600">Chargement…</td></tr> : orders.length ? orders.map((order) => <tr key={order.id} className="text-slate-700"><td className="px-5 py-4 font-bold text-primary">{order.orderNumber}</td><td className="px-5 py-4"><p>{order.user?.firstName} {order.user?.lastName}</p><p className="text-xs text-slate-500">{order.user?.email}</p></td><td className="px-5 py-4 font-medium">{order.vehicle?.year} {order.vehicle?.make} {order.vehicle?.model}</td><td className="px-5 py-4 font-bold text-primary">{order.totalAmount?.toLocaleString(formatLocale())} $</td><td className="px-5 py-4">{canUpdate ? <select className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900" defaultValue={order.status} onChange={(event) => update(order.id, event.target.value)}>{statuses.map((status) => <option value={status} key={status}>{status}</option>)}</select> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{order.status}</span>}</td><td className="px-5 py-4 text-right">{canUpdate ? <Button variant="outline" size="sm" disabled={saving === order.id} onClick={() => update(order.id, order.status)} className="gap-2"><PackageCheck className="h-4 w-4" /> Confirmer</Button> : <span className="text-xs text-slate-500">Lecture seule</span>}</td></tr>) : <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-600">Aucune commande.</td></tr>}</tbody></table></Card></div>;
}
