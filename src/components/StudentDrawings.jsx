import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Sparkles, Save, Loader2 } from 'lucide-react';

export default function StudentDrawings({ student }) {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Drawing.filter({ student_id: student.id }, '-created_date', 30);
      setDrawings(list);
      const n = {};
      list.forEach((d) => {
        n[d.id] = d.teacher_note || '';
      });
      setNotes(n);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  const suggest = async (d) => {
    setBusyId(d.id);
    try {
      const res = await base44.functions.invoke('analyzeDrawing', { drawing_id: d.id });
      setDrawings((ls) => ls.map((x) => (x.id === d.id ? { ...x, ai_suggestion: res.data?.sugestao || x.ai_suggestion } : x)));
    } catch {
      /* ignore */
    }
    setBusyId(null);
  };

  const saveNote = async (d) => {
    try {
      await base44.entities.Drawing.update(d.id, { teacher_note: notes[d.id] || '' });
      setDrawings((ls) => ls.map((x) => (x.id === d.id ? { ...x, teacher_note: notes[d.id] || '' } : x)));
    } catch {
      /* ignore */
    }
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">Carregando desenhos...</div>;
  if (drawings.length === 0) return <div className="py-8 text-center text-muted-foreground">Nenhum desenho ainda.</div>;

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {drawings.map((d) => (
        <div key={d.id} className="rounded-2xl border border-violet-100 p-3 space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-violet-100 bg-white">
              <Image src={d.image_url} alt="Desenho" fittingType="contain" className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-xs text-muted-foreground">{new Date(d.created_date).toLocaleDateString('pt-BR')}</p>
              {d.student_comment && (
                <p className="text-xs text-slate-700 bg-amber-50 rounded-lg p-2">Criança: {d.student_comment}</p>
              )}
              <div className="rounded-lg bg-violet-50 p-2 text-xs text-violet-800">
                <p className="font-bold flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Sugestão do site</p>
                {d.ai_suggestion ? (
                  <p className="mt-1">{d.ai_suggestion}</p>
                ) : (
                  <button onClick={() => suggest(d)} disabled={busyId === d.id} className="mt-1 text-violet-700 font-semibold hover:underline inline-flex items-center gap-1">
                    {busyId === d.id ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Gerando...</> : 'Gerar sugestão'}
                  </button>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1">O que você entendeu (editável):</p>
                <textarea
                  value={notes[d.id] || ''}
                  onChange={(e) => setNotes((n) => ({ ...n, [d.id]: e.target.value }))}
                  placeholder="Escreva sua interpretação do desenho..."
                  rows={2}
                  className="w-full px-2 py-1.5 rounded-lg border border-violet-100 focus:border-violet-500 outline-none text-xs resize-none"
                />
                <Button size="sm" variant="outline" className="mt-1 h-7 text-xs" onClick={() => saveNote(d)}>
                  <Save className="w-3 h-3 mr-1" /> Salvar nota
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}