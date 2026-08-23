import { Outlet, Link, useLocation } from 'react-router-dom';
import { Gavel, LayoutDashboard, LogOut, Users, CarFront, ExternalLink, PackageCheck, Tag, MessageSquareWarning, ClipboardList, FileUp, CreditCard, Activity } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

const links = [
  { name: 'Vue d’ensemble', path: '/admin', icon: LayoutDashboard, roles: ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'INSPECTOR'] },
  { name: 'Véhicules', path: '/admin/vehicules', icon: CarFront, roles: ['ADMIN', 'OPERATIONS'] },
  { name: 'Import CSV', path: '/admin/import', icon: FileUp, roles: ['ADMIN', 'OPERATIONS'] },
  { name: 'Enchères', path: '/admin/encheres', icon: Gavel, roles: ['ADMIN', 'OPERATIONS'] },
  { name: 'Offres', path: '/admin/offres', icon: Tag, roles: ['ADMIN', 'OPERATIONS'] },
  { name: 'Commandes', path: '/admin/commandes', icon: PackageCheck, roles: ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT'] },
  { name: 'Cautions & paiements', path: '/admin/paiements', icon: CreditCard, roles: ['ADMIN', 'OPERATIONS', 'FINANCE'] },
  { name: 'Centre opérations', path: '/admin/operations', icon: Activity, roles: ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT'] },
  { name: 'Utilisateurs & KYC', path: '/admin/utilisateurs', icon: Users, roles: ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'INSPECTOR'] },
  { name: 'Litiges', path: '/admin/litiges', icon: MessageSquareWarning, roles: ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'INSPECTOR'] },
  { name: 'Journal d’audit', path: '/admin/audit', icon: ClipboardList, roles: ['ADMIN', 'OPERATIONS', 'FINANCE'] },
];

export default function AdminLayout() {
  const { logout, user } = useAuthStore(); const location = useLocation(); const visibleLinks = links.filter((link) => link.roles.includes(user?.role || 'CLIENT'));
  return <div className="min-h-screen bg-[#F3F5F8] text-primary"><div className="flex min-h-screen"><aside className="hidden w-72 shrink-0 flex-col bg-primary px-4 py-6 text-white lg:flex"><Link to="/admin" className="flex items-center gap-3 px-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent font-black">AB</span><span><strong className="block text-sm tracking-wide">AUTOBROKER QC</strong><small className="text-xs text-slate-400">Espace équipe</small></span></Link><nav className="mt-10 space-y-1">{visibleLinks.map(({ name, path, icon: Icon }) => { const active = location.pathname === path; return <Link key={path} to={path} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-white/12 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon className={`h-4 w-4 ${active ? 'text-[#F6A252]' : ''}`} />{name}</Link>; })}</nav><div className="mt-auto border-t border-white/10 pt-5"><p className="px-3 text-sm font-semibold">{user?.firstName} {user?.lastName}</p><p className="px-3 text-xs text-slate-400">{user?.role || 'Équipe'}</p><Link to="/" className="mt-5 flex items-center gap-2 px-3 text-sm text-slate-400 hover:text-white"><ExternalLink className="h-4 w-4" /> Voir le site</Link><button onClick={logout} className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Déconnexion</button></div></aside><div className="flex min-w-0 flex-1 flex-col"><header className="flex h-[72px] items-center justify-between border-b bg-white px-5 sm:px-8"><div><p className="text-xs font-bold tracking-[.16em] text-accent">ESPACE ÉQUIPE</p><h1 className="mt-1 text-lg font-extrabold text-primary">Pilotage de la plateforme</h1></div><Link to="/" className="text-sm font-bold text-slate-600 hover:text-primary lg:hidden">Retour au site</Link></header><main className="flex-1 p-5 sm:p-8"><Outlet /></main></div></div></div>;
}
