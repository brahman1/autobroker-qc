import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    make: '', model: '', year: new Date().getFullYear(), vin: '',
    saaqStatus: 'CLEAN', mileage: 0, condition: '', fuelType: 'ESSENCE',
    primaryDamage: '', estimatedRetailValue: 0, location: ''
  });

  const fetchVehicles = () => {
    setLoading(true);
    api.get('/vehicles').then((res: any) => {
      setVehicles(res.data?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', {
        ...formData,
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        estimatedRetailValue: Number(formData.estimatedRetailValue)
      });
      toast.success("Véhicule ajouté avec succès");
      setShowForm(false);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Véhicules</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : 'Ajouter un véhicule'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-slate-900 border-slate-800">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-slate-400">Marque</label>
              <Input required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Modèle</label>
              <Input required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Année</label>
              <Input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">VIN</label>
              <Input required value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Statut SAAQ</label>
              <select 
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={formData.saaqStatus} 
                onChange={e => setFormData({...formData, saaqStatus: e.target.value})}
              >
                <option value="CLEAN">Propre</option>
                <option value="VGA">VGA</option>
                <option value="SCRAP">Irrécupérable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Kilométrage</label>
              <Input type="number" required value={formData.mileage} onChange={e => setFormData({...formData, mileage: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Condition</label>
              <Input value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Carburant</label>
              <select 
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={formData.fuelType} 
                onChange={e => setFormData({...formData, fuelType: e.target.value})}
              >
                <option value="ESSENCE">Essence</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIQUE">Électrique</option>
                <option value="HYBRIDE">Hybride</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Dommage Primaire</label>
              <Input value={formData.primaryDamage} onChange={e => setFormData({...formData, primaryDamage: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Valeur estimée ($)</label>
              <Input type="number" required value={formData.estimatedRetailValue} onChange={e => setFormData({...formData, estimatedRetailValue: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Emplacement</label>
              <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            
            <div className="md:col-span-2 pt-4">
              <Button type="submit" className="w-full">Enregistrer le véhicule</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="bg-slate-900 border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Véhicule</th>
              <th className="px-4 py-3 font-medium">VIN</th>
              <th className="px-4 py-3 font-medium">Statut SAAQ</th>
              <th className="px-4 py-3 font-medium">Valeur</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Aucun véhicule trouvé</td></tr>
            ) : (
              vehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3">{v.year} {v.make} {v.model}</td>
                  <td className="px-4 py-3 font-mono text-xs">{v.vin}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      v.saaqStatus === 'CLEAN' ? 'bg-green-500/10 text-green-400' :
                      v.saaqStatus === 'VGA' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {v.saaqStatus === 'CLEAN' ? 'Propre' : v.saaqStatus === 'SCRAP' ? 'Irrécupérable' : v.saaqStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">{v.estimatedRetailValue} $</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="outline" size="sm" className="h-8 px-2">Modifier</Button>
                    <Button variant="danger" size="sm" className="h-8 px-2">Supprimer</Button>
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
