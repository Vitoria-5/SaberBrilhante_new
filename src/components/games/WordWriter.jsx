import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, ArrowRight, Delete } from 'lucide-react';
import { useExerciseErrors, recordDifficulty } from '@/lib/gameUtils';
import { WORDS } from '@/lib/literacyWords';
import GameComplete from '@/components/games/GameComplete';
import HintButton from '@/components/games/HintButton';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

const ROUNDS = 6;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function buildRounds(phase) {
  const pool = phase === 'alfabetica' ? WORDS.filter((w) => w.word.length >= 5) : WORDS.filter((w) => w.word.length <= 4);
  return shuffle(pool).slice(0, ROUNDS);
}

export default function WordWriter({ onFinish, onPlayAgain }) {
  const { student, speak, audioBlocked } = useStudent();
  const [rounds] = useState(() => buildRounds(student?.phase));
  const [idx, setIdx] = useState(0);
  const [built, setBuilt] = useState([]);
  const [wrong, setWrong] = useState(new Set());
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { errors, revealed, reset, registerWrong } = useExerciseErrors();
  const r = rounds[idx];

  useEffect(() => { setBuilt([]); setWrong(new Set()); setSolved(false); reset(); if (r) speak(`Escreva a palavra ${r.word}.`); /* eslint-disable-next-line */ }, [idx]);

  if (done) return <GameComplete onFinish={onFinish} onPlayAgain={onPlayAgain} score={score} total={rounds.length} />;
  if (!r) return null;

  const type = (letter) => {
    if (revealed || solved) return;
    if (letter === r.word[built.length]) {
      const nb = [...built, letter];
      setBuilt(nb);
      speak(letter);
      if (nb.length === r.word.length) { setSolved(true); setScore((s) => s + 1); speak(r.word); }
    } else {
      setWrong((w) => new Set(w).add(letter));
      const justRevealed = registerWrong();
      if (justRevealed) { speak(`A palavra é ${r.word}.`); recordDifficulty(student, 'escrever-palavras', r.word, 3); }
      else speak('Não é essa letra. Tente de novo!');
    }
  };
  const backspace = () => { if (revealed || solved) return; setBuilt((b) => b.slice(0, -1)); };
  const next = () => { if (idx + 1 >= rounds.length) setDone(true); else setIdx(idx + 1); };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Escrever Palavras</h2>
          <p className="text-sm text-muted-foreground">Escute a palavra e digite as letras no teclado.</p>
        </div>
        <button onClick={() => speak(`Escreva a palavra ${r.word}.`)} disabled={audioBlocked} className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 flex items-center justify-center"><Volume2 className="w-5 h-5" /></button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100">
        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="w-32 h-32 mx-auto">
            <Image src={r.image} alt={r.word} fittingType="contain" className="w-full h-full" />
          </div>
          <button onClick={() => speak(r.word)} disabled={audioBlocked} className="px-4 py-2 rounded-full bg-violet-600 text-white font-semibold text-sm shadow hover:bg-violet-700">Ouvir a palavra (ditado)</button>
        </div>

        <div className="flex justify-center gap-1.5 mb-5 flex-wrap">
          {r.word.split('').map((_, i) => (
            <span key={i} className="w-10 h-12 flex items-center justify-center text-2xl font-extrabold rounded-lg border-2 border-violet-200 bg-violet-50 text-violet-800">{built[i] || ''}</span>
          ))}
        </div>

        {errors >= 1 && !revealed && !solved && (
          <HintButton hint={`Escute a palavra devagar: ${r.word}. Quantas letras você ouve?`} />
        )}

        <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 mt-4">
          {LETTERS.map((letter) => (
            <button key={letter} onClick={() => type(letter)} disabled={revealed || solved} className={cn('h-11 rounded-lg border-2 text-lg font-extrabold transition', wrong.has(letter) ? 'border-red-300 bg-red-50 text-red-600' : 'border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100')}>
              {letter}
            </button>
          ))}
          <button onClick={backspace} disabled={revealed || solved} className="h-11 rounded-lg border-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center">
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {(solved || revealed) && (
          <div className="mt-5 space-y-3">
            <div className={cn('rounded-2xl p-3 text-center font-semibold', solved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
              {solved ? `Isso mesmo! ${r.word}!` : `A palavra era ${r.word}.`}
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={next}>{idx + 1 >= rounds.length ? 'Terminar' : 'Próximo'} <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        )}
      </div>
    </div>
  );
}