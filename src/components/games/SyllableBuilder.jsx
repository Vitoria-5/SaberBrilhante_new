import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, ArrowRight } from 'lucide-react';
import { useExerciseErrors, recordDifficulty } from '@/lib/gameUtils';
import GameComplete from '@/components/games/GameComplete';
import HintButton from '@/components/games/HintButton';
import { cn } from '@/lib/utils';

const SYLLABLES = ['BA', 'BO', 'CA', 'GA', 'MA', 'PA', 'SA', 'VA', 'DA', 'LA', 'CO', 'NA', 'TA', 'PO', 'FO'];
const ROUNDS = 6;
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function buildRounds(phase) {
  const distractors = phase === 'silabica' ? 1 : phase === 'alfabetica' ? 3 : 2;
  return shuffle(SYLLABLES).slice(0, ROUNDS).map((syl) => {
    const letters = syl.split('');
    const dist = shuffle('BMPGCDFT'.split('').filter((l) => !syl.includes(l))).slice(0, distractors);
    return { syllable: syl, bank: shuffle([...letters, ...dist]) };
  });
}

export default function SyllableBuilder({ onFinish, onPlayAgain }) {
  const { student, speak, audioBlocked } = useStudent();
  const [rounds] = useState(() => buildRounds(student?.phase));
  const [idx, setIdx] = useState(0);
  const [built, setBuilt] = useState([]);
  const [used, setUsed] = useState(new Set());
  const [wrong, setWrong] = useState(new Set());
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const { errors, revealed, reset, registerWrong } = useExerciseErrors();
  const r = rounds[idx];

  useEffect(() => { setBuilt([]); setUsed(new Set()); setWrong(new Set()); setSolved(false); reset(); if (r) speak(`Monte a sílaba ${r.syllable}.`); /* eslint-disable-next-line */ }, [idx]);

  if (done) return <GameComplete onFinish={onFinish} onPlayAgain={onPlayAgain} score={score} total={rounds.length} />;
  if (!r) return null;

  const click = (i, letter) => {
    if (revealed || solved || used.has(i)) return;
    speak(letter);
    if (letter === r.syllable[built.length]) {
      const nb = [...built, letter];
      setBuilt(nb);
      setUsed((u) => new Set(u).add(i));
      if (nb.length === r.syllable.length) { setSolved(true); setScore((s) => s + 1); speak(r.syllable); }
    } else {
      setWrong((w) => new Set(w).add(i));
      const justRevealed = registerWrong();
      if (justRevealed) { speak(`A sílaba certa é ${r.syllable}.`); recordDifficulty(student, 'montar-silabas', r.syllable, 3); }
      else speak('Não é essa letra. Tente de novo!');
    }
  };
  const next = () => { if (idx + 1 >= rounds.length) setDone(true); else setIdx(idx + 1); };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Montar Sílabas</h2>
          <p className="text-sm text-muted-foreground">Toque as letras na ordem certa.</p>
        </div>
        <button onClick={() => speak(`Monte a sílaba ${r.syllable}.`)} disabled={audioBlocked} className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 flex items-center justify-center"><Volume2 className="w-5 h-5" /></button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Monte a sílaba</p>
          <p className="text-4xl font-extrabold text-violet-700">{r.syllable}</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {r.syllable.split('').map((_, i) => (
            <span key={i} className="w-14 h-16 flex items-center justify-center text-3xl font-extrabold rounded-xl border-2 border-violet-200 bg-violet-50 text-violet-800">{built[i] || ''}</span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {r.bank.map((letter, i) => {
            const isWrong = wrong.has(i);
            const isUsed = used.has(i);
            return (
              <button key={i} onClick={() => click(i, letter)} disabled={revealed || solved || isUsed} className={cn('w-16 h-20 rounded-2xl border-2 text-3xl font-extrabold transition flex items-center justify-center', isUsed ? 'border-green-300 bg-green-50 text-green-600 opacity-50' : isWrong ? 'border-red-300 bg-red-50 text-red-600' : 'border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100')}>
                {letter}
              </button>
            );
          })}
        </div>

        {errors >= 1 && !revealed && !solved && (
          <HintButton hint={`Escute a sílaba devagar: ${r.syllable}. As letras ficam na ordem em que falamos.`} />
        )}

        {(solved || revealed) && (
          <div className="mt-5 space-y-3">
            <div className={cn('rounded-2xl p-3 text-center font-semibold', solved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
              {solved ? `Isso! ${r.syllable}!` : `A sílaba era ${r.syllable}.`}
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={next}>{idx + 1 >= rounds.length ? 'Terminar' : 'Próximo'} <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        )}
      </div>
    </div>
  );
}