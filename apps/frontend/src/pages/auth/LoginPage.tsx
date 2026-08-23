import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';

const staffRoles = ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'INSPECTOR'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', { email: email.trim().toLowerCase(), password }) as any;
      login(response.data.accessToken, response.data.user);
      navigate(staffRoles.includes(response.data.user.role) ? '/admin' : '/tableau-de-bord');
    } catch {
      toast.error('Identifiants invalides');
    }
  };

  return <div className="grid min-h-[calc(100vh-72px)] bg-white lg:grid-cols-2"><section className="hidden bg-primary p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-accent font-black">AB</span><span className="font-extrabold tracking-wide">AUTOBROKER QC</span></div><div className="max-w-md"><p className="text-sm font-bold tracking-[.16em] text-[#F6A252]">BON RETOUR</p><h1 className="mt-4 text-4xl font-extrabold leading-tight">Votre espace pour suivre chaque encan.</h1><p className="mt-5 leading-7 text-slate-300">Vos mises, votre caution et votre statut d’identité sont toujours accessibles.</p></div><p className="flex items-center gap-2 text-sm text-slate-400"><ShieldCheck className="h-4 w-4 text-[#F6A252]" /> Connexion sécurisée</p></section><section className="flex items-center justify-center px-4 py-12"><Card className="w-full max-w-md p-8 sm:p-10"><div><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FDF0E3] text-accent"><KeyRound className="h-5 w-5" /></span><h2 className="mt-6 text-2xl font-extrabold text-primary">Connexion</h2><p className="mt-2 text-sm text-slate-600">Accédez à votre espace AutoBroker QC.</p></div><form onSubmit={handleSubmit} className="mt-8 space-y-5"><label className="block text-sm font-bold text-slate-700">Adresse courriel<Input className="mt-2" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmail((value) => value.trim().toLowerCase())} required /></label><label className="block text-sm font-bold text-slate-700">Mot de passe<Input className="mt-2" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><Button type="submit" className="w-full">Se connecter</Button></form><p className="mt-7 text-center text-sm text-slate-600">Nouveau sur AutoBroker QC ? <Link to="/inscription" className="font-bold text-accent hover:underline">Créer un compte</Link></p></Card></section></div>;
}
