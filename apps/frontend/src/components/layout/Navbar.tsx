import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Globe2, LayoutDashboard, Menu, PackageCheck, Scale, ShieldCheck, X } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useLocaleStore } from '../../store/locale.store';
import { Button } from '../ui/Button';

const staffRoles = ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'INSPECTOR'];
const discoveryLinks = [
  { to: '/vehicules', label: 'Inventaire' },
  { to: '/vehicules?status=live', label: 'Enchères en direct' },
];

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { locale, setLocale } = useLocaleStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setMobileOpen(false);
  const isStaff = staffRoles.includes(user?.role || 'CLIENT');
  const accountPath = isStaff ? '/admin' : '/tableau-de-bord';

  const signOut = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={close} className="flex items-center gap-3" aria-label="Accueil AutoBroker QC">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-black text-white shadow-sm">AB</span>
          <span className="leading-none"><span className="block text-base font-extrabold tracking-tight text-primary">AUTOBROKER</span><span className="block pt-1 text-[10px] font-bold tracking-[0.22em] text-accent">QUÉBEC</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
          {discoveryLinks.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm font-semibold transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}>{item.label}</NavLink>)}
          <NavLink to="/comparer" className={({ isActive }) => `flex items-center gap-1 text-sm font-semibold transition-colors ${isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'}`}><Scale className="h-3.5 w-3.5" /> Comparer</NavLink>
          <span className="h-5 w-px bg-slate-200" />
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><ShieldCheck className="h-4 w-4 text-success" /> Courtier québécois</span>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button data-no-translate type="button" onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-bold text-primary hover:bg-slate-50" aria-label={locale === 'fr' ? 'Switch to English' : 'Passer au français'}><Globe2 className="h-3.5 w-3.5" />{locale === 'fr' ? 'EN' : 'FR'}</button>
          {isLoading ? <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-100" aria-label="Chargement de la session" /> : isAuthenticated ? <>
            {!isStaff && <Link to="/mes-achats"><Button variant="outline" size="sm" className="gap-2"><PackageCheck className="h-4 w-4" /> Mes achats</Button></Link>}
            <Link to={accountPath}><Button variant="outline" size="sm" className="gap-2"><LayoutDashboard className="h-4 w-4" /> {isStaff ? 'Administration' : 'Mon espace'}</Button></Link>
            <Button variant="primary" size="sm" onClick={signOut}>Déconnexion</Button>
          </> : <><Link to="/connexion"><Button variant="outline" size="sm">Connexion</Button></Link><Link to="/inscription"><Button size="sm">Créer un compte</Button></Link></>}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-lg text-primary hover:bg-slate-100 md:hidden" aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>

      {mobileOpen && <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-soft md:hidden"><nav className="space-y-1" aria-label="Navigation mobile">
        {discoveryLinks.map((item) => <NavLink key={item.to} to={item.to} onClick={close} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{item.label}</NavLink>)}
        <NavLink to="/comparer" onClick={close} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Comparer</NavLink>
        {!isLoading && isAuthenticated && <>
          {!isStaff && <><Link to="/mes-achats" onClick={close} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Mes achats</Link><Link to="/mes-documents" onClick={close} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Mes documents</Link><Link to="/mes-paiements" onClick={close} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Mes paiements</Link><Link to="/communications" onClick={close} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Mes alertes</Link></>}
          <Link to={accountPath} onClick={close} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{isStaff ? 'Administration' : 'Mon espace'}</Link>
        </>}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-4"><button data-no-translate type="button" onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')} className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 text-xs font-bold text-primary hover:bg-slate-50"><Globe2 className="h-4 w-4" />{locale === 'fr' ? 'English' : 'Français'}</button>{isLoading ? <div className="col-span-2 h-10 animate-pulse rounded-lg bg-slate-100" /> : isAuthenticated ? <Button className="col-span-2" onClick={signOut}>Déconnexion</Button> : <><Link to="/connexion" onClick={close}><Button variant="outline" className="w-full">Connexion</Button></Link><Link to="/inscription" onClick={close}><Button className="w-full">Créer un compte</Button></Link></>}</div>
      </nav></div>}
    </header>
  );
}
