import { useState, useEffect } from 'react';
import { Volume2, Square, ArrowRight, Heart } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WRITING_PHASES = ['silabico_alfabetica', 'alfabetica'];

export default function EmotionGame({ questions, onFinish, onPlayAgain, phase }) {
  const { speak, stop, isSpeaking, audioBlocked } = useStudent();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const canWrite = WRITING_PHASES.includes(phase);

  const q = questions[idx];

  useEffect(() => {
    setPicked(null);
    setReason('');
    if (q) speak(`${q.prompt}. Escolha a carinha que combina com você.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">💛</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Obrigada por compartilhar!</h2>
        <p className="text-muted-foreground">Todos os sentimentos são importantes. Você arrasou!</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {onPlayAgain && <Button variant="outline" onClick={onPlayAgain}>Jogar de novo 🎲</Button>}
          <Button onClick={onFinish} className="bg-violet-600 hover:bg-violet-700">Voltar aos jogos</Button>
        </div>
      </div>
    );
  }
  if (!q) return null;

  const pick = (o) => {
    setPicked(o);
    speak(`Você escolheu ${o.label}. ${canWrite ? 'Por que você escolheu essa carinha?' : 'Você pode contar para um adulto por que escolheu essa carinha.'}`);
  };

  const next = () => {
    speak('Que legal você compartilhar como se sente!');
    if (idx + 1 >= questions.length) setDone(true);
    else setIdx(idx + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Carinhas e Sentimentos 💛</h2>
          <p className="text-sm text-muted-foreground">Não existe sentimento certo ou errado!</p>
        </div>
        <button onClick={() => (isSpeaking ? stop() : speak(`${q.prompt}. Escolha a carinha que combina com você.`))} disabled={audioBlocked} className={cn('w-11 h-11 rounded-full flex items-center justify-center', audioBlocked ? 'bg-gray-100 text-gray-300' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200')}>
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-1.5 mb-4">
        {questions.map((_, i) => (
          <div key={i} className={cn('h-2 flex-1 rounded-full', i < idx ? 'bg-violet-400' : i === idx ? 'bg-violet-600' : 'bg-violet-100')} />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100">
        <div className="flex items-center gap-3 mb-5">
          {q.emoji && <span className="text-4xl">{q.emoji}</span>}
          <h3 className="text-lg font-bold text-slate-800">{q.prompt}</h3>
        </div>

        {!picked && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {q.options.map((o) => (
              <button
                key={o.label}
                onClick={() => pick(o)}
                className="flex flex-col items-center gap-1 p-4 rounded-2xl border-2 border-violet-100 bg-violet-50 hover:bg-violet-100 hover:border-violet-300 transition"
              >
                <span className="text-4xl">{o.emoji}</span>
                <span className="font-semibold text-slate-700">{o.label}</span>
              </button>
            ))}
          </div>
        )}

        {picked && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-violet-50 border-2 border-violet-200">
              <span className="text-4xl">{picked.emoji}</span>
              <span className="font-bold text-violet-800 text-lg">Você está: {picked.label}</span>
            </div>
            {canWrite ? (
              <div>
                <p className="font-semibold text-violet-800 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" /> Por que você escolheu essa carinha?
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Pode contar com suas palavras..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none resize-none"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-100">
                <Heart className="w-5 h-5 text-pink-400 shrink-0" />
                <p className="text-sm text-amber-800 flex-1">Você pode contar para um adulto por que escolheu essa carinha. 💛</p>
                <button onClick={() => speak(`Eu estou ${picked.label}.`)} disabled={audioBlocked} className="px-3 py-2 rounded-full bg-violet-600 text-white text-xs font-semibold shrink-0">Ouvir</button>
              </div>
            )}
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={next}>
              {idx + 1 >= questions.length ? 'Terminar' : 'Próximo'} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}