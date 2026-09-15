import { useState, useEffect, Fragment } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, ArrowRight, Check } from 'lucide-react';
import { useExerciseErrors, recordDifficulty } from '@/lib/gameUtils';
import { WORDS } from '@/lib/literacyWords';
import GameComplete from '@/components/games/GameComplete';
import HintButton from '@/components/games/HintButton';
import { cn } from '@/lib/utils';

const ROUNDS = 6;
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function correctGaps(syllables) {
  const gaps = [];
  let acc = 0;
  for (let i = 0; i < syllables.length - 1; i++) { acc += syllables[i].length; gaps.push(acc - 1); }
  return gaps;
}

function buildRounds(phase) {
  const pool = phase === 'alfabetica'
    ? WORDS.filter((w) => w.syllables.length >= 3)
    : phase === 'silabico_alfabetica'
    ? WORDS.filter((w) => w.syllables.length >= 2)
    : WORDS.filter((w) => w.syllables.length === 2);
  return shuffle(pool).slice(0, ROUNDS);
}

export default function SyllableSplit({ onFinish, onPlayAgain }) {
  const { student, speak, audioBlocked } = useStudent();
  const [rounds] = useState(() => buildRounds(student?.phase));
  const [idx, setIdx] = useState(0);
  const [dividers, setDividers] = useState(new Set());
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const { errors, revealed, reset, registerWrong } = useExerciseErrors();
  const r = rounds[idx];
  const letters = r ? r.word.split('') : [];
  const cg = r ? correctGaps(r.syllables) : [];

  useEffect(() => { setDividers(new Set()); setSolved(false); reset(); if (r) speak(`Divida a palavra ${r.word} em sílabas.`); /* eslint-disable-next-line */ }, [idx]);

  if (done) return <GameComplete onFinish={onFinish} onPlayAgain={onPlayAgain} score={score} total={rounds.length} />;
  if (!r) return null;

  const toggle = (g) => {
    if (revealed || solved) return;
    setDividers((d) => { const n = new Set(d); n.has(g) ? n.delete(g) : n.add(g); return n; });
  };
  const check = () => {
    if (revealed || solved) return;
    const ok = cg.every((g) => dividers.has(g)) && [...dividers].every((g) => cg.includes(g));
    if (ok) { setSolved(true); setScore((s) => s + 1); speak(`Isso! ${r.syllables.join(' - ')}.`); }
    else {
      const justRevealed = registerWrong();
      if (justRevealed) { speak(`A divisão certa é ${r.syllables.join(' - ')}.`); recordDifficulty(student, 'separar-silabas', r.word, 3); }
      else speak('Não foi assim. Tente de novo!');
    }
  };
  const next = () => { if (idx + 1 >= rounds.length) setDone(true); else setIdx(idx + 1); };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Separar Sílabas</h2>
          <p className="text-sm text-muted-foreground">Toque entre as letras para marcar a divisão.</p>
        </div>
        <button onClick={() => speak(`Divida a palavra ${r.word} em sílabas.`)} disabled={audioBlocked} className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 flex items-center justify-center"><Volume2 className="w-5 h-5" /></button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-5xl">{r.emoji}</span>
          <button onClick={() => speak(r.word)} disabled={audioBlocked} className="px-3 py-2 rounded-full bg-violet-600 text-white text-sm font-semibold">Ouvir</button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1 my-6">
          {letters.map((l, i) => (
            <Fragment key={i}>
              <span className="w-11 h-14 flex items-center justify-center text-3xl font-extrabold rounded-xl bg-violet-100 text-violet-800">{l}</span>
              {i < letters.length - 1 && (
                <button onClick={() => toggle(i)} disabled={revealed || solved} className={cn('w-7 h-14 flex items-center justify-center text-xl font-bold rounded-lg', dividers.has(i) ? 'bg-violet-500 text-white' : 'bg-violet-50 text-violet-300 hover:bg-violet-100', revealed && cg.includes(i) && !dividers.has(i) && 'bg-green-400 text-white')}>
                  {dividers.has(i) || (revealed && cg.includes(i)) ? '|' : '+'}
                </button>
              )}
            </Fragment>
          ))}
        </div>

        {errors >= 1 && !revealed && !solved && (
          <HintButton hint={`Escute a palavra devagar: ${r.word}. Ela tem ${r.syllables.length} sílabas.`} />
        )}

        {revealed && (
          <div className="flex justify-center gap-2 mb-4">
            {r.syllables.map((s, i) => (
              <button key={i} onClick={() => speak(s)} disabled={audioBlocked} className="px-4 py-3 rounded-xl bg-green-100 text-green-700 font-extrabold text-xl hover:bg-green-200">{s}</button>
            ))}
          </div>
        )}

        {(solved || revealed) ? (
          <div className="space-y-3">
            <div className={cn('rounded-2xl p-3 text-center font-semibold', solved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
              {solved ? `Perfeito! ${r.syllables.join(' - ')}` : `A divisão era ${r.syllables.join(' - ')}.`}
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={next}>{idx + 1 >= rounds.length ? 'Terminar' : 'Próximo'} <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        ) : (
          <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={check}><Check className="w-4 h-4 mr-1" /> Conferir</Button>
        )}
      </div>
    </div>
  );
}