import { Link } from 'react-router-dom';
import { BadgeCheck, LockKeyhole, MapPin } from 'lucide-react';
import { useLocaleStore } from '../../store/locale.store';
import { useAuthStore } from '../../store/auth.store';

export default function Footer() {
  const { locale, setLocale } = useLocaleStore();
  const { isAuthenticated, user } = useAuthStore();
  const isStaff = ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'INSPECTOR'].includes(user?.role || 'CLIENT');
  return <footer className="mt-auto bg-primary text-slate-300">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
      <div className="lg:col-span-2"><div className="flex items-center gap-3 text-white"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent font-black">AB</span><div><p className="font-extrabold tracking-tight">AUTOBROKER QC</p><p className="text-xs text-slate-400">Votre accès aux encans réservés</p></div></div><p className="mt-5 max-w-md text-sm leading-6 text-slate-400">Nous agissons comme intermédiaire pour vous donner accès aux encans automobiles réservés aux concessionnaires.</p></div>
      <div><h2 className="text-sm font-bold text-white">{locale === 'fr' ? 'Explorer' : 'Explore'}</h2><div className="mt-4 space-y-3 text-sm"><Link className="block hover:text-white" to="/vehicules">{locale === 'fr' ? 'Inventaire' : 'Inventory'}</Link>{isAuthenticated ? <Link className="block hover:text-white" to={isStaff ? '/admin' : '/tableau-de-bord'}>{locale === 'fr' ? (isStaff ? 'Administration' : 'Mon espace') : (isStaff ? 'Administration' : 'My account')}</Link> : <><Link className="block hover:text-white" to="/inscription">{locale === 'fr' ? 'Créer un compte' : 'Create account'}</Link><Link className="block hover:text-white" to="/connexion">{locale === 'fr' ? 'Connexion' : 'Sign in'}</Link></>}<button data-no-translate onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')} className="rounded border border-white/20 px-2 py-1 text-xs font-bold text-white hover:bg-white/10">{locale === 'fr' ? 'English' : 'Français'}</button></div></div>
      <div><h2 className="text-sm font-bold text-white">Nos engagements</h2><div className="mt-4 space-y-3 text-sm text-slate-400"><p className="flex gap-2"><BadgeCheck className="h-4 w-4 shrink-0 text-accent" /> Statuts SAAQ visibles</p><p className="flex gap-2"><LockKeyhole className="h-4 w-4 shrink-0 text-accent" /> Paiement sécurisé par Stripe</p><p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-accent" /> Service au Québec</p></div></div>
    </div>
    <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8"><p>© {new Date().getFullYear()} AutoBroker QC. Tous droits réservés.</p><p>Commerçant de véhicules — informations et conditions à confirmer avant toute enchère.</p></div></div>
  </footer>;
}
