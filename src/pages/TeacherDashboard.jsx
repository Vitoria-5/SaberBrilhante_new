import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PHASES, PHASE_MAP, ageFromBirth } from '@/lib/phases';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { GraduationCap, RefreshCw, Volume2, VolumeX, Heart, Mail, Pencil, Users, Lock, LogOut, Send, Trash2, AlertTriangle, Key, Eye, EyeOff, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stripEmojis } from '@/lib/sanitize';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import StudentDrawings from '@/components/StudentDrawings';

const TEACHER_PASSWORD = '1234';
const GATE_KEY = 'teacher_unlocked';

const GAME_OPTIONS = [
  { key: 'cores', name: 'Cores Mágicas' },
  { key: 'emocoes', name: 'Carinhas e Sentimentos' },
  { key: 'contagem', name: 'Vamos Contar' },
  { key: 'palavras', name: 'Monta Palavras' },
  { key: 'labirinto', name: 'Labirinto Mágico' },
  { key: 'caca', name: 'Caça-Palavras' },
  { key: 'cruzadinha', name: 'Cruzadinha' },
  { key: 'ciencia', name: 'Pequena Cientista' },
];

const GAME_LABELS = {
  'silabas': 'Brincando com Sílabas',
  'imagem-palavra': 'Imagem e Palavra',
  'separar-silabas': 'Separar Sílabas',
  'montar-silabas': 'Montar Sílabas',
  'escrever-palavras': 'Escrever Palavras',
};

export default function TeacherDashboard() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(GATE_KEY) === '1');
  const [gate, setGate] = useState('');
  const [gateErr, setGateErr] = useState(null);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [reforcoId, setReforcoId] = useState(null);
  const [reforcoMsg, setReforcoMsg] = useState('');
  const [reforcoGame, setReforcoGame] = useState('');
  const [notice, setNotice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [pwdTarget, setPwdTarget] = useState(null);
  const [pwdInput, setPwdInput] = useState('');
  const [pwdErr, setPwdErr] = useState(null);
  const [revealedPwdId, setRevealedPwdId] = useState(null);
  const [showPwdEye, setShowPwdEye] = useState(false);
  const [drawingsTarget, setDrawingsTarget] = useState(null);

  useEffect(() => {
    if (unlocked) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  const load = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const list = await base44.entities.Student.filter({ created_by_id: me.id });
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setStudents(list);
      const res = {};
      for (const s of list) {
        try {
          const tr = await base44.entities.TestResult.filter({ student_id: s.id }, '-test_date', 1);
          if (tr && tr[0]) res[s.id] = tr[0];
        } catch {
          /* ignore */
        }
      }
      setResults(res);
      try {
        const errs = await base44.entities.GameError.filter({ created_by_id: me.id }, '-created_date', 50);
        const errMap = {};
        for (const e of errs || []) (errMap[e.student_id] = errMap[e.student_id] || []).push(e);
        setErrors(errMap);
      } catch {
        /* ignore */
      }
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id, data) => {
    try {
      await base44.entities.Student.update(id, data);
      setStudents((ls) => ls.map((s) => (s.id === id ? { ...s, ...data } : s)));
    } catch (e) {
      /* ignore */
    }
  };

  const requestTest = async (s) => {
    const today = new Date().toISOString().slice(0, 10);
    await updateStudent(s.id, { test_requested: true, test_request_date: today });
    setNotice(`Solicitação de teste enviada para ${s.name}! 📝`);
    setTimeout(() => setNotice(null), 3000);
  };

  const sendReforco = async (id) => {
    if (!reforcoMsg.trim()) return;
    await updateStudent(id, { reforco_message: reforcoMsg.trim(), reforco_game: reforcoGame || '' });
    setReforcoId(null);
    setReforcoMsg('');
    setReforcoGame('');
    setNotice('Recadinho de reforço enviado! 💛');
    setTimeout(() => setNotice(null), 3000);
  };

  const clearReforco = async (id) => {
    await updateStudent(id, { reforco_message: '', reforco_game: '' });
  };

  const confirmDelete = async (s) => {
    try {
      await base44.entities.TestResult.deleteMany({ student_id: s.id });
    } catch {
      /* ignore */
    }
    try {
      await base44.entities.Student.delete(s.id);
    } catch {
      /* ignore */
    }
    setStudents((ls) => ls.filter((x) => x.id !== s.id));
    setResults((r) => {
      const c = { ...r };
      delete c[s.id];
      return c;
    });
    setDeleteTarget(null);
    setNotice(`${s.name} foi excluído. A conta foi revogada.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const lock = () => {
    sessionStorage.removeItem(GATE_KEY);
    setUnlocked(false);
    setGate('');
  };

  const tryUnlock = (e) => {
    e.preventDefault();
    if (gate === TEACHER_PASSWORD) {
      sessionStorage.setItem(GATE_KEY, '1');
      setUnlocked(true);
      setGateErr(null);
    } else {
      setGateErr('Senha incorreta.');
    }
  };

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto py-16">
        <form onSubmit={tryUnlock} className="bg-white rounded-3xl border border-violet-100 shadow-lg p-6 space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-violet-800">Área da Professora</h1>
          <p className="text-sm text-muted-foreground">Digite a senha de acesso para continuar.</p>
          <input
            type="password"
            value={gate}
            onChange={(e) => setGate(e.target.value)}
            placeholder="Senha"
            className="w-full px-4 py-3 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none text-center text-lg tracking-widest"
          />
          {gateErr && <p className="text-sm text-red-600">{gateErr}</p>}
          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">Entrar</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-violet-800">Área da Professora</h1>
            <p className="text-sm text-muted-foreground">Acompanhe a fase de cada aluno.</p>
          </div>
        </div>
        <Button variant="outline" onClick={lock}>
          <LogOut className="w-4 h-4 mr-1" /> Sair da área
        </Button>
      </div>

      {notice && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-3 text-sm text-green-700 font-semibold text-center">{notice}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Carregando alunos... 💛</div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-violet-100 shadow">
          <Users className="w-10 h-10 text-violet-300 mx-auto" />
          <p className="mt-2 font-semibold text-slate-700">Nenhum aluno cadastrado ainda.</p>
          <p className="text-sm text-muted-foreground">Os alunos se cadastram sozinhos na área deles, com nome e senha. Assim que cadastrarem, aparecem aqui.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {students.map((s) => {
            const age = ageFromBirth(s.birth_date);
            const ph = PHASE_MAP[s.phase] || PHASE_MAP.garatuja;
            const sug = PHASE_MAP[s.suggested_phase] || ph;
            const last = results[s.id];
            return (
              <div key={s.id} className="bg-white rounded-3xl border border-violet-100 shadow p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{ph.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-slate-800 truncate">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{age} anos • nascimento {s.birth_date ? new Date(s.birth_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', ph.order >= 3 ? 'bg-emerald-100 text-emerald-700' : ph.order === 2 ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700')}>
                      {ph.short}
                    </span>
                    <button onClick={() => setDrawingsTarget(s)} title="Ver desenhos do aluno" className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center transition">
                      <Palette className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setPwdTarget(s); setPwdInput(''); setPwdErr(null); }} title="Ver senha do aluno" className="w-8 h-8 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100 flex items-center justify-center transition">
                      <Key className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(s)} title="Excluir aluno" className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {revealedPwdId === s.id && (
                  <div className="rounded-xl bg-violet-50 p-2 text-xs flex items-center gap-2">
                    <span className="text-muted-foreground">Senha do aluno:</span>
                    <span className="font-bold text-violet-800 tracking-widest">{showPwdEye ? (s.password || '—') : '•••••'}</span>
                    <button onClick={() => setShowPwdEye((v) => !v)} className="text-violet-600 hover:underline inline-flex items-center gap-1">
                      {showPwdEye ? <><EyeOff className="w-3.5 h-3.5" /> ocultar</> : <><Eye className="w-3.5 h-3.5" /> ver</>}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-violet-50 p-2">
                    <p className="text-muted-foreground">Fase sugerida pelo app</p>
                    <p className="font-bold text-violet-700">{sug.short}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-2">
                    <p className="text-muted-foreground">Último teste</p>
                    <p className="font-bold text-amber-700">{s.last_test_date ? new Date(s.last_test_date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</p>
                  </div>
                </div>

                {last && (
                  <div className="rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
                    <b>Resultado:</b> {last.summary}
                  </div>
                )}

                {s.test_requested && (
                  <div className="rounded-xl bg-sky-50 p-2 text-xs text-sky-700 flex items-start gap-1.5">
                    <Send className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Teste solicitado — aguardando o aluno fazer.
                  </div>
                )}

                {s.reforco_message && (
                  <div className="rounded-xl bg-amber-50 p-2 text-xs text-amber-800 flex items-start gap-1.5">
                    <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="flex-1">Reforço: {s.reforco_message}{s.reforco_game ? ` (${GAME_OPTIONS.find((g) => g.key === s.reforco_game)?.name || ''})` : ''}</span>
                    <button onClick={() => clearReforco(s.id)} className="text-amber-600 hover:underline">limpar</button>
                  </div>
                )}

                {s.feeling && (
                  <div className="rounded-xl bg-pink-50 p-2 text-xs text-pink-700 flex items-start gap-1.5">
                    <Heart className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {stripEmojis(s.feeling)}
                  </div>
                )}

                {errors[s.id]?.length > 0 && (
                  <div className="rounded-xl bg-rose-50 p-2 text-xs text-rose-700 space-y-1">
                    <p className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Dificuldades recentes</p>
                    {errors[s.id].slice(0, 3).map((e) => (
                      <div key={e.id}>{GAME_LABELS[e.game] || e.game} • {e.exercise} • {e.errors} erros • {new Date(e.created_date).toLocaleDateString('pt-BR')}</div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-violet-50">
                  <div className="flex items-center gap-2">
                    {editingId === s.id ? (
                      <Select value={s.phase} onValueChange={(v) => { updateStudent(s.id, { phase: v }); setEditingId(null); }}>
                        <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PHASES.map((p) => (
                            <SelectItem key={p.key} value={p.key}>{p.short}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <button onClick={() => setEditingId(s.id)} className="inline-flex items-center gap-1 text-xs text-violet-700 font-semibold hover:underline">
                        <Pencil className="w-3 h-3" /> Editar fase
                      </button>
                    )}
                    <button onClick={() => { setReforcoId(reforcoId === s.id ? null : s.id); setReforcoMsg(s.reforco_message || ''); setReforcoGame(s.reforco_game || ''); }} className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold hover:underline">
                      <Mail className="w-3 h-3" /> Reforço
                    </button>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    {s.audio_blocked ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-violet-600" />}
                    <span>Áudio</span>
                    <Switch checked={!s.audio_blocked} onCheckedChange={(chk) => updateStudent(s.id, { audio_blocked: !chk })} />
                  </label>
                </div>

                {reforcoId === s.id && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 space-y-2">
                    <p className="text-xs font-bold text-amber-800">Enviar recadinho de reforço para {s.name}:</p>
                    <textarea value={reforcoMsg} onChange={(e) => setReforcoMsg(e.target.value)} placeholder="Ex: Vamos praticar um pouquinho mais as sílabas, você está indo muito bem!" rows={2} className="w-full px-3 py-2 rounded-lg border-2 border-amber-100 focus:border-amber-400 outline-none text-sm resize-none" />
                    <Select value={reforcoGame} onValueChange={setReforcoGame}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Sugerir um jogo (opcional)" /></SelectTrigger>
                      <SelectContent>
                        {GAME_OPTIONS.map((g) => (
                          <SelectItem key={g.key} value={g.key}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => sendReforco(s.id)}>Enviar</Button>
                      <Button size="sm" variant="outline" onClick={() => setReforcoId(null)}>Cancelar</Button>
                    </div>
                  </div>
                )}

                <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700" onClick={() => requestTest(s)}>
                  <RefreshCw className="w-4 h-4 mr-1" /> Iniciar novo teste
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aluno?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {deleteTarget?.name}? Esta ação não poderá ser desfeita. A conta será revogada e o aluno perderá o acesso a todas as atividades e ao histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteTarget && confirmDelete(deleteTarget)}>
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pwdTarget} onOpenChange={(o) => { if (!o) { setPwdTarget(null); setPwdErr(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ver a senha do aluno</AlertDialogTitle>
            <AlertDialogDescription>Para ver a senha, digite a senha da professora.</AlertDialogDescription>
          </AlertDialogHeader>
          <input type="password" value={pwdInput} onChange={(e) => setPwdInput(e.target.value)} placeholder="Senha da professora" className="w-full px-4 py-3 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none text-center text-lg tracking-widest" />
          {pwdErr && <p className="text-sm text-red-600 text-center">{pwdErr}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                if (pwdInput === TEACHER_PASSWORD) {
                  setRevealedPwdId(pwdTarget.id);
                  setPwdTarget(null);
                  setPwdInput('');
                  setPwdErr(null);
                } else {
                  e.preventDefault();
                  setPwdErr('Senha incorreta.');
                }
              }}
            >
              Ver senha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!drawingsTarget} onOpenChange={(o) => { if (!o) setDrawingsTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desenhos de {drawingsTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription>Veja os desenhos, a sugestão do site e escreva o que você entendeu.</AlertDialogDescription>
          </AlertDialogHeader>
          {drawingsTarget && <StudentDrawings student={drawingsTarget} />}
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}