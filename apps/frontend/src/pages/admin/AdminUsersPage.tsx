import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';

const platformRoles = ['CLIENT', 'PARTNER', 'INSPECTOR', 'SUPPORT', 'FINANCE', 'OPERATIONS', 'ADMIN'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.user);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users').then((res: any) => {
      setUsers(Array.isArray(res.data) ? res.data : (res.data || []));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleKycStatus = async (userId: string, status: string) => {
    try {
      await api.patch(`/users/${userId}/kyc`, { status });
      toast.success(`Statut KYC mis à jour : ${status === 'VERIFIED' ? 'Approuvé' : 'Rejeté'}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const handleRole = async (userId: string, role: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role });
      toast.success('Rôle utilisateur mis à jour.');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour du rôle');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><p className="text-sm font-bold tracking-[.16em] text-accent">IDENTITÉ ET ACCÈS</p><h2 className="mt-1 text-2xl font-extrabold text-primary">Utilisateurs et KYC</h2></div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm text-slate-700">
          <thead className="border-b bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Statut KYC</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-600">Chargement...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-600">Aucun utilisateur trouvé</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-primary">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    {currentUser?.role === 'ADMIN' && u.id !== currentUser.id ? <select aria-label={`Rôle de ${u.email}`} className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-900" value={u.role} onChange={(event) => handleRole(u.id, event.target.value)}>{platformRoles.map((role) => <option value={role} key={role}>{role}</option>)}</select> : <span className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{u.role}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      u.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                      u.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {u.kycStatus === 'VERIFIED' ? 'Vérifié' : 
                       u.kycStatus === 'REJECTED' ? 'Rejeté' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.kycStatus === 'PENDING' && ['ADMIN', 'OPERATIONS'].includes(currentUser?.role || '') && (
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 border-green-500/50 text-green-700 hover:bg-green-50"
                          onClick={() => handleKycStatus(u.id, 'VERIFIED')}
                        >
                          Approuver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 border-red-500/50 text-red-700 hover:bg-red-50"
                          onClick={() => handleKycStatus(u.id, 'REJECTED')}
                        >
                          Rejeter
                        </Button>
                      </div>
                    )}
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
