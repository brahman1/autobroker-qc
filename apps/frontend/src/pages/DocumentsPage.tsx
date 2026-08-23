import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/documents/my').then((response: any) => setDocuments(response.data || [])).catch(() => toast.error('Impossible de charger vos documents.')).finally(() => setLoading(false)); }, []);
  const download = async (document: any) => { try { const response = await api.get(`/documents/${document.id}/download`, { responseType: 'blob' }); const url = URL.createObjectURL(response.data); const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = document.fileName; anchor.click(); URL.revokeObjectURL(url); } catch { toast.error('Téléchargement impossible.'); } };
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-bold tracking-[.16em] text-accent">ESPACE CLIENT</p><h1 className="mt-2 text-3xl font-extrabold text-primary">Mes documents</h1><p className="mt-2 text-sm text-slate-600">Téléchargez vos factures et contrats en PDF simulé.</p><div className="mt-8 space-y-3">{loading ? <Card className="p-8 text-center text-slate-600">Chargement…</Card> : documents.length ? documents.map((document) => <Card key={document.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FDF0E3] text-accent"><FileText className="h-5 w-5" /></span><div><p className="font-extrabold text-primary">{document.fileName}</p><p className="mt-1 text-xs text-slate-600">{document.order?.orderNumber || 'Document de compte'} · {document.type}</p></div></div><Button size="sm" className="gap-2" onClick={() => download(document)}><Download className="h-4 w-4" />Télécharger</Button></Card>) : <Card className="p-8 text-center text-slate-600">Aucun document disponible.</Card>}</div></div>;
}
