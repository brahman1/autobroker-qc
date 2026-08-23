import { formatLocale } from '../../i18n';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Dates for the form
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    startingBid: 0,
    scheduledStartAt: now.toISOString().slice(0, 16),
    scheduledEndAt: nextWeek.toISOString().slice(0, 16),
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/auctions').catch(() => ({ data: [] })),
      api.get('/vehicles').catch(() => ({ data: { data: [] } }))
    ]).then(([resAuctions, resVehicles]: any) => {
      setAuctions(Array.isArray(resAuctions.data) ? resAuctions.data : (resAuctions.data || []));
      setVehicles(resVehicles.data?.data || (Array.isArray(resVehicles.data) ? resVehicles.data : []));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error("Veuillez sélectionner un véhicule");
      return;
    }
    
    try {
      await api.post('/auctions', {
        vehicleId: formData.vehicleId,
        startingBid: Number(formData.startingBid),
        scheduledStartAt: new Date(formData.scheduledStartAt).toISOString(),
        scheduledEndAt: new Date(formData.scheduledEndAt).toISOString(),
      });
      toast.success("Enchère créée avec succès");
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la création");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Enchères</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : 'Créer une enchère'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-slate-900 border-slate-800">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1 text-slate-400">Véhicule</label>
              <select 
                required
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={formData.vehicleId} 
                onChange={e => setFormData({...formData, vehicleId: e.target.value})}
              >
                <option value="">Sélectionner un véhicule...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model} (VIN: {v.vin})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-slate-400">Mise de départ ($ CAD)</label>
              <Input type="number" required value={formData.startingBid} onChange={e => setFormData({...formData, startingBid: Number(e.target.value)})} />
            </div>
            
            <div></div>
            
            <div>
              <label className="block text-sm mb-1 text-slate-400">Date de début</label>
              <Input type="datetime-local" required value={formData.scheduledStartAt} onChange={e => setFormData({...formData, scheduledStartAt: e.target.value})} />
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-slate-400">Date de fin</label>
              <Input type="datetime-local" required value={formData.scheduledEndAt} onChange={e => setFormData({...formData, scheduledEndAt: e.target.value})} />
            </div>
            
            <div className="md:col-span-2 pt-4">
              <Button type="submit" className="w-full">Créer l'enchère</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="bg-slate-900 border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Véhicule</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Mise actuelle</th>
              <th className="px-4 py-3 font-medium">Dates</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
            ) : auctions.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Aucune enchère trouvée</td></tr>
            ) : (
              auctions.map(a => (
                <tr key={a.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    {a.vehicle ? `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}` : 'Véhicule inconnu'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      a.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                      a.status === 'ENDED' ? 'bg-slate-500/10 text-slate-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {a.status === 'ACTIVE' ? 'Active' : a.status === 'ENDED' ? 'Terminée' : 'Planifiée'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{a.currentBid} $</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    <div>Début: {new Date(a.scheduledStartAt).toLocaleString(formatLocale())}</div>
                    <div>Fin: {new Date(a.scheduledEndAt).toLocaleString(formatLocale())}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
