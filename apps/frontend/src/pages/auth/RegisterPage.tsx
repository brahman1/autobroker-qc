import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/auth/register', { ...formData, email: formData.email.trim().toLowerCase() });
      toast.success('Inscription réussie. Connectez-vous pour poursuivre.');
      navigate('/connexion');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l’inscription');
    }
  };

  return <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:px-8"><section><p className="text-sm font-bold tracking-[.16em] text-accent">PREMIÈRE ÉTAPE</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight text-primary">Créez votre accès aux encans.</h1><p className="mt-5 max-w-md text-sm leading-7 text-slate-600">Après la création, notre équipe vérifie votre identité. Vous pourrez ensuite réserver votre caution et placer vos mises.</p><div className="mt-8 space-y-4">{['Inventaire accessible immédiatement', 'Statut SAAQ affiché sur chaque lot', 'Caution et mises après validation KYC'].map((item) => <p key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="h-5 w-5 text-success" /> {item}</p>)}</div></section><Card className="p-7 sm:p-9"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FDF0E3] text-accent"><BadgeCheck className="h-5 w-5" /></span><div><h2 className="text-xl font-extrabold text-primary">Créer mon compte</h2><p className="text-sm text-slate-500">Toutes les communications sont en français.</p></div></div><form onSubmit={handleSubmit} className="mt-7 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Prénom<Input className="mt-2" required autoComplete="given-name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} /></label><label className="text-sm font-bold text-slate-700">Nom<Input className="mt-2" required autoComplete="family-name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} /></label></div><label className="block text-sm font-bold text-slate-700">Adresse courriel<Input className="mt-2" type="email" required autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} onBlur={() => setFormData({ ...formData, email: formData.email.trim().toLowerCase() })} /></label><label className="block text-sm font-bold text-slate-700">Mot de passe<Input className="mt-2" type="password" required minLength={8} autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /><span className="mt-1 block text-xs font-normal text-slate-500">Au moins 8 caractères.</span></label><label className="flex gap-3 text-xs leading-5 text-slate-600"><input type="checkbox" required className="mt-1 rounded border-slate-300 text-accent focus:ring-accent" /> J’accepte les conditions d’utilisation et confirme comprendre qu’AutoBroker QC agit comme courtier.</label><Button type="submit" className="w-full">Créer mon compte</Button></form><p className="mt-6 text-center text-sm text-slate-600">Déjà inscrit ? <Link to="/connexion" className="font-bold text-accent hover:underline">Se connecter</Link></p></Card></div>;
}
