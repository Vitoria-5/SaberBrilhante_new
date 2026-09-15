import { useState, useEffect } from 'react';
import { Volume2, Square, HelpCircle, ArrowRight, Star, CheckCircle2, XCircle } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ChoiceGame({ title, intro, questions, onFinish, onPlayAgain, accent = 'violet', finishLabel }) {
  const { speak, stop, isSpeaking, audioBlocked } = useStudent();
  const [idx, setIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [status, setStatus] = useState(null); // 'right' | 'wrong' | 'revealed'
  const [showWhy, setShowWhy] = useState(false);
  const [stars, setStars] = useState(0);
  const [done, setDone] = useState(false);
  const [firstTry, setFirstTry] = useState([]);

  const q = questions[idx];
  const fullAudio = () => `${q.prompt}. ${q.options.map((o) => o.label).join(', ')}`;

  useEffect(() => {
    setAttempts(0);
    setChosen(null);
    setStatus(null);
    setShowWhy(false);
    if (q) speak(fullAudio());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (done) {
    const avg = Math.max(1, Math.round((stars / Math.max(1, questions.length)) * 2)) / 2;
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl animate-bounce">🎉</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Você arrasou!</h2>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star key={i} className={cn('w-8 h-8', i < Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')} />
          ))}
        </div>
        <p className="text-muted-foreground">Você conquistou {stars} estrelinhas! ⭐</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {onPlayAgain && (
            <Button variant="outline" onClick={onPlayAgain}>Jogar de novo 🎲</Button>
          )}
          <Button onClick={() => onFinish(firstTry)} className="bg-violet-600 hover:bg-violet-700">{finishLabel || 'Voltar aos jogos'}</Button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const next = () => {
    if (idx + 1 >= questions.length) setDone(true);
    else setIdx(idx + 1);
  };

  const toggleAudio = () => {
    if (audioBlocked) return;
    if (isSpeaking) stop();
    else speak(fullAudio());
  };

  const choose = (i) => {
    if (status === 'right' || status === 'revealed') return;
    if (i === q.correct) {
      setChosen(i);
      setStatus('right');
      const gained = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      setStars((s) => s + gained);
      setFirstTry((f) => {
        const nf = [...f];
        nf[idx] = attempts === 0;
        return nf;
      });
      speak(q.praise || 'Muito bem! Você conseguiu!');
      return;
    }
    const a = attempts + 1;
    setAttempts(a);
    setChosen(i);
    setStatus('wrong');
    setShowWhy(false);
    speak('Quase lá! Tente de novo.');
    if (a >= 3) {
      setStatus('revealed');
      setFirstTry((f) => {
        const nf = [...f];
        nf[idx] = false;
        return nf;
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">{title}</h2>
          <p className="text-sm text-muted-foreground">{intro}</p>
        </div>
        <button
          onClick={toggleAudio}
          disabled={audioBlocked}
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center shadow-sm transition',
            audioBlocked ? 'bg-gray-100 text-gray-300' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
          )}
        >
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-1.5 mb-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className={cn('h-2 flex-1 rounded-full transition', i < idx ? 'bg-violet-400' : i === idx ? 'bg-violet-600' : 'bg-violet-100')}
          />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100">
        <div className="flex items-center gap-3 mb-5">
          {q.emoji && <span className="text-4xl">{q.emoji}</span>}
          <h3 className="text-lg font-bold text-slate-800">{q.prompt}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options.map((o, i) => {
            const isCorrect = i === q.correct;
            const isChosen = i === chosen;
            let cls = 'border-violet-100 bg-violet-50 hover:bg-violet-100 hover:border-violet-300';
            if (status === 'right' && isCorrect) cls = 'border-green-400 bg-green-50';
            else if (status === 'revealed' && isCorrect) cls = 'border-green-400 bg-green-50';
            else if (isChosen && (status === 'wrong' || status === 'revealed')) cls = 'border-red-300 bg-red-50';
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={status === 'right' || status === 'revealed'}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border-2 transition text-left font-semibold text-slate-700',
                  cls,
                  (status === 'right' || status === 'revealed') && 'cursor-default'
                )}
              >
                {o.color && <span className="w-9 h-9 rounded-full border border-black/10" style={{ background: o.color }} />}
                {o.emoji && <span className="text-3xl">{o.emoji}</span>}
                <span className="flex-1">{o.label}</span>
                {status === 'right' && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {isChosen && status === 'wrong' && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {(status === 'wrong' || status === 'revealed') && (
          <div className="mt-4">
            <button
              onClick={() => {
                setShowWhy((s) => !s);
                speak(q.explanation);
              }}
              className="flex items-center gap-2 text-violet-700 font-semibold text-sm hover:underline"
            >
              <HelpCircle className="w-4 h-4" /> Quer uma dica?
            </button>
            {showWhy && <p className="mt-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-800 border border-amber-100">{q.explanation}</p>}
            {status === 'wrong' && <p className="text-xs text-muted-foreground mt-2">Tentativas restantes: {3 - attempts} 💛</p>}
          </div>
        )}

        {status === 'right' && (
          <p className="mt-4 text-green-600 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {q.praise || 'Muito bem!'}
          </p>
        )}
        {status === 'revealed' && (
          <p className="mt-4 text-amber-600 text-sm">Você tentou direitinho! Vamos para a próxima? 💛</p>
        )}

        {(status === 'right' || status === 'revealed') && (
          <Button className="mt-5 bg-violet-600 hover:bg-violet-700" onClick={next}>
            {idx + 1 >= questions.length ? 'Ver resultado' : 'Próximo'} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}