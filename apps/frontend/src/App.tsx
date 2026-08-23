import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import VehiclesPage from './pages/VehiclesPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import AuctionLivePage from './pages/AuctionLivePage';
import DashboardPage from './pages/DashboardPage';
import DepositPage from './pages/DepositPage';
import PurchasesPage from './pages/PurchasesPage';
import ComparePage from './pages/ComparePage';
import DocumentsPage from './pages/DocumentsPage';
import PaymentsPage from './pages/PaymentsPage';
import CommunicationsPage from './pages/CommunicationsPage';
import SeoInventoryPage from './pages/SeoInventoryPage';
import AdminOperationsPage from './pages/admin/AdminOperationsPage';
import OrderPaymentPage from './pages/OrderPaymentPage';
import PrivacyPage from './pages/PrivacyPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { useAuthStore } from './store/auth.store';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './components/ui/Button';
import { connectSocket } from './lib/socket';
import toast from 'react-hot-toast';

// Admin imports
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage';
import AdminAuctionsPage from './pages/admin/AdminAuctionsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminDisputesPage from './pages/admin/AdminDisputesPage';
import AdminAuditPage from './pages/admin/AdminAuditPage';
import AdminImportPage from './pages/admin/AdminImportPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';

const staffRoles = ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'INSPECTOR'];
const accountPath = (role?: string) => staffRoles.includes(role || 'CLIENT') ? '/admin' : '/tableau-de-bord';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div>Chargement...</div>;
  if (!user || !staffRoles.includes(user.role || 'CLIENT')) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const ClientRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div>Chargement...</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (staffRoles.includes(user.role || 'CLIENT')) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div>Chargement...</div>;
  if (isAuthenticated && user) return <Navigate to={accountPath(user.role)} replace />;
  return <>{children}</>;
};

const RoleRoute = ({ roles, children }: { roles: string[]; children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div>Chargement...</div>;
  if (!user || !roles.includes(user.role || 'CLIENT')) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-white bg-slate-950">
    <h1 className="text-6xl font-bold mb-4">404</h1>
    <p className="text-xl mb-8">Oups ! La page que vous cherchez n'existe pas.</p>
    <Link to="/">
      <Button>Retour à l'accueil</Button>
    </Link>
  </div>
);

function App() {
  const { fetchMe, user, accessToken } = useAuthStore();
  

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user) {
      const s = connectSocket(accessToken || undefined);
      s.on('notification:outbid', (data: { userId: string, auctionId: string, vehicleName: string }) => {
        if (data.userId === user.id) {
          toast.error(`Alerte : vous avez été surenchéri !`, {
             duration: 8000,
             icon: '⚠️',
          });
        }
      });
      return () => {
        s.off('notification:outbid');
      };
    }
  }, [user, accessToken]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="vehicules" element={<VehiclesPage />} />
        <Route path="vehicule" element={<Navigate to="/vehicules" replace />} />
        <Route path="vehicules/:id" element={<VehicleDetailPage />} />
        <Route path="comparer" element={<ComparePage />} />
        <Route path="categorie/:category" element={<SeoInventoryPage />} />
        <Route path="marque/:make" element={<SeoInventoryPage />} />
        <Route path="modele/:make/:model" element={<SeoInventoryPage />} />
        <Route path="encheres/:id" element={<AuctionLivePage />} />
        
        <Route path="connexion" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="inscription" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        <Route path="tableau-de-bord" element={
          <ClientRoute>
            <DashboardPage />
          </ClientRoute>
        } />
        <Route path="depot" element={
          <ClientRoute>
            <DepositPage />
          </ClientRoute>
        } />
        <Route path="mes-achats" element={<ClientRoute><PurchasesPage /></ClientRoute>} />
        <Route path="mes-documents" element={<ClientRoute><DocumentsPage /></ClientRoute>} />
        <Route path="mes-paiements" element={<ClientRoute><PaymentsPage /></ClientRoute>} />
        <Route path="communications" element={<ClientRoute><CommunicationsPage /></ClientRoute>} />
        <Route path="confidentialite" element={<PrivacyPage />} />
        <Route path="paiement/:id" element={<ClientRoute><OrderPaymentPage /></ClientRoute>} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="vehicules" element={<RoleRoute roles={['ADMIN', 'OPERATIONS']}><AdminVehiclesPage /></RoleRoute>} />
        <Route path="encheres" element={<RoleRoute roles={['ADMIN', 'OPERATIONS']}><AdminAuctionsPage /></RoleRoute>} />
        <Route path="utilisateurs" element={<RoleRoute roles={staffRoles}><AdminUsersPage /></RoleRoute>} />
        <Route path="offres" element={<RoleRoute roles={['ADMIN', 'OPERATIONS']}><AdminOffersPage /></RoleRoute>} />
        <Route path="commandes" element={<RoleRoute roles={['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT']}><AdminOrdersPage /></RoleRoute>} />
        <Route path="litiges" element={<RoleRoute roles={staffRoles}><AdminDisputesPage /></RoleRoute>} />
        <Route path="audit" element={<RoleRoute roles={['ADMIN', 'OPERATIONS', 'FINANCE']}><AdminAuditPage /></RoleRoute>} />
        <Route path="import" element={<RoleRoute roles={['ADMIN', 'OPERATIONS']}><AdminImportPage /></RoleRoute>} />
        <Route path="paiements" element={<RoleRoute roles={['ADMIN', 'OPERATIONS', 'FINANCE']}><AdminPaymentsPage /></RoleRoute>} />
        <Route path="operations" element={<RoleRoute roles={['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT']}><AdminOperationsPage /></RoleRoute>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
