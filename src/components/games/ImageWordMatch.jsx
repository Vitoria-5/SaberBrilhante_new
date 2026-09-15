import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, ArrowRight, Check, X } from 'lucide-react';
import { useExerciseErrors, recordDifficulty } from '@/lib/gameUtils';
import { WORDS } from '@/lib/literacyWords';
import GameComplete from '@/components/games/GameComplete';
import HintButton from '@/components/games/HintButton';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

const ROUNDS = 6;
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function buildRounds() {
  return shuffle(WORDS).slice(0, ROUNDS).map((w) => ({
    item: w,
    options: shuffle([w.word, ...shuffle(WORDS.filter((x) => x.word !== w.word)).slice(0, 3).map((x) => x.word)]),
  }));
}

export default function ImageWordMatch({ onFinish, onPlayAgain }) {
  const { student, speak, audioBlocked } = useStudent();
  const [rounds] = useState(buildRounds);
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const { errors, revealed, reset, registerWrong } = useExerciseErrors();
  const r = rounds[idx];

  useEffect(() => { setWrong([]); setSolved(false); reset(); if (r) speak('Qual é o nome disto?'); /* eslint-disable-next-line */ }, [idx]);

  if (done) return <GameComplete onFinish={onFinish} onPlayAgain={onPlayAgain} score={score} total={rounds.length} />;
  if (!r) return null;

  const pick = (word) => {
    if (revealed || solved) return;
    if (word === r.item.word) { setSolved(true); setScore((s) => s + 1); speak(`Isso! ${r.item.word}!`); return; }
    setWrong((w) => [...w, word]);
    const justRevealed = registerWrong();
    if (justRevealed) { speak(`A resposta é ${r.item.word}. Vamos aprender juntos!`); recordDifficulty(student, 'imagem-palavra', r.item.word, 3); }
    else speak(`Não é ${word}. Tente de novo!`);
  };
  const next = () => { if (idx + 1 >= rounds.length) setDone(true); else setIdx(idx + 1); };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Imagem e Palavra</h2>
          <p className="text-sm text-muted-foreground">Toque na palavra que combina com a figura.</p>
        </div>
        <button onClick={() => speak('Qual é o nome disto?')} disabled={audioBlocked} className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 flex items-center justify-center"><Volume2 className="w-5 h-5" /></button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-40 h-40 mx-auto">
            <Image src={r.item.image} alt={r.item.word} fittingType="contain" className="w-full h-full" />
          </div>
          <button onClick={() => speak(`${r.item.word}! ${r.item.sound || ''}`)} disabled={audioBlocked} className="px-4 py-2 rounded-full bg-violet-600 text-white font-semibold text-sm shadow hover:bg-violet-700">Ouvir o som</button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {r.options.map((word) => {
            const isWrong = wrong.includes(word);
            const isCorrect = (solved || revealed) && word === r.item.word;
            return (
              <div key={word} className="flex items-stretch gap-2">
                <button onClick={() => pick(word)} disabled={revealed || solved} className={cn('flex-1 px-4 py-4 rounded-2xl border-2 text-xl font-extrabold transition flex items-center justify-center gap-2', isCorrect ? 'border-green-400 bg-green-50 text-green-700' : isWrong ? 'border-red-300 bg-red-50 text-red-600' : 'border-violet-100 bg-violet-50 hover:bg-violet-100 text-slate-800')}>
                  {word}
                  {isCorrect && <Check className="w-5 h-5" />}
                  {isWrong && <X className="w-5 h-5" />}
                </button>
                <button onClick={() => speak(word)} disabled={audioBlocked} className="px-3 rounded-2xl bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center" title="Ouvir a palavra"><Volume2 className="w-5 h-5" /></button>
              </div>
            );
          })}
        </div>

        {errors >= 1 && !revealed && !solved && (
          <HintButton hint={`Escute de novo: ${r.item.sound || r.item.word}. A palavra começa com a letra ${r.item.word[0]}.`} />
        )}

        {(solved || revealed) && (
          <div className="mt-5 space-y-3">
            <div className={cn('rounded-2xl p-3 text-center font-semibold', solved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
              {solved ? `Isso mesmo! ${r.item.word}!` : `A resposta era ${r.item.word}.`}
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={next}>{idx + 1 >= rounds.length ? 'Terminar' : 'Próximo'} <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        )}
      </div>
    </div>
  );
}