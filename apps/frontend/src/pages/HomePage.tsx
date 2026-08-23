import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Gavel, ShieldCheck, WalletCards } from 'lucide-react';
import { Button } from '../components/ui/Button';

const steps = [
  { icon: BadgeCheck, title: 'Créez votre compte', text: 'Inscrivez-vous, puis faites vérifier votre identité.' },
  { icon: WalletCards, title: 'Réservez votre caution', text: 'Une préautorisation de 600 $ vous donne accès aux enchères.' },
  { icon: Gavel, title: 'Placez votre maximum', text: 'Notre système d’auto-enchère mise juste assez, jusqu’à votre limite.' },
];

export default function HomePage() {
  return <div>
    <section className="relative isolate overflow-hidden bg-primary">
      <img className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25" src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=2000&q=85" alt="" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/50" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:py-28">
        <div className="max-w-3xl"><p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-[#FFE2C0]"><ShieldCheck className="h-4 w-4" /> ACCÈS AUX ENCHÈRES RÉSERVÉES</p><h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">L’encan automobile, <span className="text-[#F6A252]">accessible au Québec.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">Trouvez votre prochain véhicule parmi des milliers de lots. AutoBroker QC vous accompagne à chaque étape, de la vérification à l’enchère.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link to="/vehicules"><Button size="lg" className="w-full bg-accent hover:bg-[#bd5f0a] sm:w-auto">Voir l’inventaire <ArrowRight className="ml-2 h-4 w-4" /></Button></Link><Link to="/inscription"><Button size="lg" variant="outline" className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto">Créer mon compte</Button></Link></div></div>
        <div className="self-end rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-sm"><p className="text-xs font-bold tracking-[0.18em] text-[#F6A252]">LA TRANSPARENCE D’ABORD</p><div className="mt-5 space-y-5"><div><p className="text-3xl font-extrabold">SAAQ</p><p className="text-sm text-slate-300">Le statut de chaque véhicule est affiché avant que vous misiez.</p></div><div className="border-t border-white/10 pt-5"><p className="text-3xl font-extrabold">600 $</p><p className="text-sm text-slate-300">Caution préautorisée, non débitée tant que vous ne remportez pas un lot.</p></div></div></div>
      </div>
    </section>
    <section className="border-b bg-white"><div className="mx-auto grid max-w-7xl grid-cols-1 divide-y px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8"><div className="py-7 sm:px-8"><p className="text-2xl font-extrabold text-primary">Proxy bidding</p><p className="mt-1 text-sm text-slate-500">Votre maximum reste confidentiel.</p></div><div className="py-7 sm:px-8"><p className="text-2xl font-extrabold text-primary">Temps réel</p><p className="mt-1 text-sm text-slate-500">Suivez chaque enchère seconde par seconde.</p></div><div className="py-7 sm:px-8"><p className="text-2xl font-extrabold text-primary">100 % français</p><p className="mt-1 text-sm text-slate-500">Une expérience pensée pour le Québec.</p></div></div></section>
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-bold tracking-[.16em] text-accent">COMMENT ÇA FONCTIONNE</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-primary">Une façon simple et encadrée d’acheter à l’encan.</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{steps.map((step, index) => <article key={step.title} className="rounded-2xl border bg-white p-7 shadow-soft"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FDF0E3] text-accent"><step.icon className="h-5 w-5" /></span><span className="text-sm font-extrabold text-slate-300">0{index + 1}</span></div><h3 className="mt-7 text-lg font-bold text-primary">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></article>)}</div></section>
  </div>;
}
