import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, Square, ArrowRight, Check, X, RefreshCw } from 'lucide-react';
import { useExerciseErrors, recordDifficulty } from '@/lib/gameUtils';
import HintButton from '@/components/games/HintButton';
import { cn } from '@/lib/utils';

const ITEMS = [
  { name: 'Bola', emoji: '⚽', firstLetter: 'B', firstSyllable: 'BO', sound: 'quica quica' },
  { name: 'Banco', emoji: '🪑', firstLetter: 'B', firstSyllable: 'BAN' },
  { name: 'Banana', emoji: '🍌', firstLetter: 'B', firstSyllable: 'BA' },
  { name: 'Batata', emoji: '🥔', firstLetter: 'B', firstSyllable: 'BA' },
  { name: 'Balão', emoji: '🎈', firstLetter: 'B', firstSyllable: 'BA' },
  { name: 'Cachorro', emoji: '🐶', firstLetter: 'C', firstSyllable: 'CA', sound: 'Au au!' },
  { name: 'Casa', emoji: '🏠', firstLetter: 'C', firstSyllable: 'CA' },
  { name: 'Cavalo', emoji: '🐴', firstLetter: 'C', firstSyllable: 'CA', sound: 'Pocotó pocotó!' },
  { name: 'Gato', emoji: '🐱', firstLetter: 'G', firstSyllable: 'GA', sound: 'Miau!' },
  { name: 'Galinha', emoji: '🐔', firstLetter: 'G', firstSyllable: 'GA', sound: 'Cococó!' },
  { name: 'Macaco', emoji: '🐵', firstLetter: 'M', firstSyllable: 'MA', sound: 'Uga uga!' },
  { name: 'Mala', emoji: '🧳', firstLetter: 'M', firstSyllable: 'MA' },
  { name: 'Pato', emoji: '🦆', firstLetter: 'P', firstSyllable: 'PA', sound: 'Quá quá!' },
  { name: 'Pão', emoji: '🍞', firstLetter: 'P', firstSyllable: 'PÃO' },
  { name: 'Vaca', emoji: '🐮', firstLetter: 'V', firstSyllable: 'VA', sound: 'Muu!' },
  { name: 'Sapo', emoji: '🐸', firstLetter: 'S', firstSyllable: 'SA', sound: 'O sapo coaxa!' },
];

const ROUNDS = 6;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRounds() {
  const rounds = [];
  for (let i = 0; i < ROUNDS; i++) {
    const mode = i % 2 === 0 ? 'letra' : 'silaba';
    let target;
    let correctPool;
    if (mode === 'letra') {
      const letters = [...new Set(ITEMS.map((x) => x.firstLetter))];
      target = letters[Math.floor(Math.random() * letters.length)];
      correctPool = ITEMS.filter((x) => x.firstLetter === target);
    } else {
      const syls = [...new Set(ITEMS.map((x) => x.firstSyllable))];
      target = syls[Math.floor(Math.random() * syls.length)];
      correctPool = ITEMS.filter((x) => x.firstSyllable === target);
    }
    if (correctPool.length === 0) continue;
    const correct = correctPool[Math.floor(Math.random() * correctPool.length)];
    const distractors = shuffle(
      ITEMS.filter((x) => x.name !== correct.name && (mode === 'letra' ? x.firstLetter !== target : x.firstSyllable !== target))
    ).slice(0, 2);
    if (distractors.length < 2) continue;
    const options = shuffle([correct, ...distractors]);
    rounds.push({ mode, target, correct, options });
  }
  return rounds;
}

export default function SyllableGame({ onFinish, onPlayAgain }) {
  const { student, speak, stop, isSpeaking, audioBlocked } = useStudent();
  const [rounds] = useState(buildRounds);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { errors, revealed, reset, registerWrong } = useExerciseErrors();

  const r = rounds[idx];
  const promptText = r ? (r.mode === 'letra' ? `Qual começa com a letra ${r.target}?` : `Qual começa com a sílaba ${r.target}?`) : '';

  useEffect(() => {
    setPicked(null);
    setSolved(false);
    reset();
    if (r) speak(promptText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Você arrasou!</h2>
        <p className="text-muted-foreground">Você acertou {score} de {rounds.length}.</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {onPlayAgain && (
            <Button variant="outline" onClick={onPlayAgain}>
              <RefreshCw className="w-4 h-4 mr-1" /> Jogar de novo
            </Button>
          )}
          <Button onClick={onFinish} className="bg-violet-600 hover:bg-violet-700">Voltar aos jogos</Button>
        </div>
      </div>
    );
  }
  if (!r) return null;

  const pick = (item) => {
    if (revealed || solved) return;
    if (item.name === r.correct.name) {
      setPicked(item);
      setSolved(true);
      setScore((s) => s + 1);
      const soundPart = item.sound ? ` ${item.sound}` : '';
      speak(`${item.name}!${soundPart}`);
      return;
    }
    setPicked(item);
    const justRevealed = registerWrong();
    if (justRevealed) {
      speak(`A resposta é ${r.correct.name}.`);
      recordDifficulty(student, 'silabas', r.correct.name, 3);
    } else {
      speak('Não é esse. Tente de novo!');
    }
  };

  const next = () => {
    if (idx + 1 >= rounds.length) setDone(true);
    else setIdx(idx + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Brincando com Sílabas 🔤</h2>
          <p className="text-sm text-muted-foreground">Toque na figura certa e ouça o som!</p>
        </div>
        <button
          onClick={() => (isSpeaking ? stop() : speak(promptText))}
          disabled={audioBlocked}
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center',
            audioBlocked ? 'bg-gray-100 text-gray-300' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
          )}
        >
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-1.5 mb-4">
        {rounds.map((_, i) => (
          <div key={i} className={cn('h-2 flex-1 rounded-full', i < idx ? 'bg-violet-400' : i === idx ? 'bg-violet-600' : 'bg-violet-100')} />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100">
        <div className="text-center mb-5">
          <p className="text-sm text-muted-foreground">{r.mode === 'letra' ? 'Letra' : 'Sílaba'}</p>
          <p className="text-3xl font-extrabold text-violet-700">{promptText}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {r.options.map((o) => {
            const showCorrect = (solved || revealed) && o.name === r.correct.name;
            const showWrong = picked && o.name === picked.name && picked.name !== r.correct.name;
            return (
              <button
                key={o.name}
                onClick={() => pick(o)}
                disabled={solved || revealed}
                className={cn(
                  'flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition',
                  showCorrect
                    ? 'border-green-400 bg-green-50'
                    : showWrong
                    ? 'border-red-400 bg-red-50'
                    : 'border-violet-100 bg-violet-50 hover:bg-violet-100 hover:border-violet-300',
                  (solved || revealed) && !showCorrect && !showWrong && 'opacity-60'
                )}
              >
                <span className="text-5xl">{o.emoji}</span>
                <span className="font-semibold text-slate-700">{o.name}</span>
                {showCorrect && <Check className="w-4 h-4 text-green-600" />}
                {showWrong && <X className="w-4 h-4 text-red-600" />}
              </button>
            );
          })}
        </div>

        {errors >= 1 && !revealed && !solved && (
          <HintButton hint={`Escute de novo: qual começa com ${r.mode === 'letra' ? 'a letra' : 'a sílaba'} ${r.target}?`} />
        )}

        {(solved || revealed) && (
          <div className="mt-5 space-y-3">
            <div className={cn('rounded-2xl p-3 text-center font-semibold', solved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700')}>
              {solved
                ? `Isso mesmo! ${r.correct.name} começa com ${r.mode === 'letra' ? 'a letra' : 'a sílaba'} ${r.target}. 🌟`
                : `Quase! ${r.correct.name} começa com ${r.mode === 'letra' ? 'a letra' : 'a sílaba'} ${r.target}.`}
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={next}>
              {idx + 1 >= rounds.length ? 'Terminar' : 'Próximo'} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}