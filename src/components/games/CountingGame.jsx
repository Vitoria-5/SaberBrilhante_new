import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, Square, ArrowRight, Check, X, RefreshCw } from 'lucide-react';
import { useExerciseErrors, recordDifficulty } from '@/lib/gameUtils';
import HintButton from '@/components/games/HintButton';
import { cn } from '@/lib/utils';

// BANCO DE DADOS AMPLIADO COM 10 ITENS PARA VARIAR AS PARTIDAS
const ALL_COUNT_ITEMS = [
  { question: 'QUANTOS 🍎 TEM AQUI?', emoji: '🍎', count: 1, pool: [1, 2, 3, 4] },
  { question: 'QUANTOS 🎈 TEM AQUI?', emoji: '🎈🎈🎈', count: 3, pool: [3, 2, 4, 1] },
  { question: 'QUANTOS 🌟 TEM AQUI?', emoji: '🌟🌟', count: 2, pool: [2, 1, 3, 4] },
  { question: 'QUANTOS 🍦 TEM AQUI?', emoji: '🍦🍦🍦🍦', count: 4, pool: [4, 3, 2, 5] },
  { question: 'QUANTOS 🦋 TEM AQUI?', emoji: '🦋🦋🦋', count: 3, pool: [3, 4, 2, 5] },
  { question: 'QUANTOS 🚗 TEM AQUI?', emoji: '🚗🚗🚗🚗🚗', count: 5, pool: [5, 4, 3, 6] },
  { question: 'QUANTOS 🧸 TEM AQUI?', emoji: '🧸🧸', count: 2, pool: [2, 3, 1, 4] },
  { question: 'QUANTOS 🐱 TEM AQUI?', emoji: '🐱', count: 1, pool: [1, 2, 3, 4] },
  { question: 'QUANTOS 🐠 TEM AQUI?', emoji: '🐠🐠🐠🐠', count: 4, pool: [4, 2, 3, 5] },
  { question: 'QUANTOS 🌸 TEM AQUI?', emoji: '🌸🌸🌸🌸🌸', count: 5, pool: [5, 6, 4, 3] }
];

// Função auxiliar para misturar arrays de forma totalmente aleatória
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Função que monta uma partida inédita com 5 fases e botões embaralhados
function generateCountingGame() {
  const chosenItems = shuffleArray(ALL_COUNT_ITEMS).slice(0, 5);
  return chosenItems.map(item => ({
    ...item,
    options: shuffleArray(item.pool) // Embaralha as posições dos botões
  }));
}
export default function CountingGame({ onFinish, onPlayAgain }) {
  const { student, speak, stop, isSpeaking } = useStudent();
  const [rounds, setRounds] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { errors, revealed, reset, registerWrong } = useExerciseErrors();

  const isAudioBlocked = student?.audio_blocked || false;

  useEffect(() => {
    setRounds(generateCountingGame());
  }, []);

  const r = rounds[idx];

  useEffect(() => {
    setPicked(null);
    setSolved(false);
    reset();
    if (r && !isAudioBlocked) {
      speak(r.question.replace('🍎', 'maçãs').replace('🎈', 'balões').replace('🌟', 'estrelas').replace('🍦', 'sorvetes').replace('🦋', 'borboletas').replace('🚗', 'carros').replace('🧸', 'ursos').replace('🐱', 'gatos').replace('🐠', 'peixes').replace('🌸', 'flores'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, rounds]);

  const pick = (option) => {
    if (revealed || solved) return;
    if (option === r.count) {
      setPicked(option);
      setSolved(true);
      setScore((s) => s + 1);
      if (!isAudioBlocked) speak(`Muito bem! A resposta é ${option}!`);
      return;
    }
    setPicked(option);
    const justRevealed = registerWrong();
    if (justRevealed) {
      if (!isAudioBlocked) speak(`A resposta certa é ${r.count}.`);
      recordDifficulty(student, 'contagem', r.question, 3);
    } else {
      if (!isAudioBlocked) speak('Não é esse. Tente contar de novo!');
    }
  };

  const next = () => {
    if (idx + 1 >= rounds.length) setDone(true);
    else setIdx(idx + 1);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">🔢</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Parabéns!</h2>
        <p className="text-muted-foreground">Você completou o jogo e acertou {score} de {rounds.length}.</p>
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

  if (!r) return <div className="py-8 text-center text-muted-foreground">Preparando números...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Vamos Contar 🔢</h2>
          <p className="text-sm text-muted-foreground">Conte as figuras com carinho!</p>
        </div>
        <button
          onClick={() => (isSpeaking ? stop() : speak(r.question.replace('🍎', 'maçãs').replace('🎈', 'balões').replace('🌟', 'estrelas').replace('🍦', 'sorvetes').replace('🦋', 'borboletas').replace('🚗', 'carros').replace('🧸', 'ursos').replace('🐱', 'gatos').replace('🐠', 'peixes').replace('🌸', 'flores')))}
          disabled={isAudioBlocked}
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center transition',
            isAudioBlocked ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
          )}
        >
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* PROGRESSO DAS 5 FASES */}
      <div className="flex gap-1.5 mb-4">
        {rounds.map((_, i) => (
          <div key={i} className={cn('h-2 flex-1 rounded-full', i < idx ? 'bg-violet-400' : i === idx ? 'bg-violet-600' : 'bg-violet-100')} />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100 space-y-5">
        <div className="flex flex-col items-center justify-center gap-3 bg-violet-50/50 rounded-2xl p-6 border border-violet-100/50">
          <span className="text-6xl select-none tracking-widest">{r.emoji}</span>
          <p className="text-2xl font-extrabold text-violet-800 tracking-wide text-center mt-2">QUANTOS TEM AQUI?</p>
        </div>

        {/* 4 BOTÕES NUMÉRICOS TOTALMENTE EMBARALHADOS */}
        <div className="grid grid-cols-2 gap-4">
          {r.options.map((option) => {
            const showCorrect = (solved || revealed) && option === r.count;
            const showWrong = picked && option === picked && picked !== r.count;

            return (
              <button
                key={option}
                onClick={() => pick(option)}
                disabled={solved || revealed}
                className={cn(
                  'p-5 rounded-2xl font-extrabold text-xl transition flex items-center justify-center gap-3 border-2 shadow-sm h-16',
                  showCorrect
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : showWrong
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-violet-100 bg-violet-50/50 text-slate-700 hover:bg-violet-50 hover:border-violet-300',
                  (solved || revealed) && !showCorrect && !showWrong && 'opacity-50'
                )}
              >
                <span className="text-2xl">{option}</span>
                {showCorrect && <Check className="w-5 h-5 text-green-600 shrink-0" />}
                {showWrong && <X className="w-5 h-5 text-red-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {errors >= 1 && !revealed && !solved && (
          <HintButton hint={`Conte devagar colocando o dedinho em cada figura na tela. Qual é o número total?`} />
        )}

        {(solved || revealed) && (
          <div className="mt-5 space-y-3">
            <div className={cn('rounded-2xl p-4 text-center font-bold tracking-wide shadow-sm', solved ? 'bg-green-100/70 text-green-800 border border-green-200' : 'bg-amber-100/70 text-amber-800 border border-amber-200')}>
              {solved
                ? `Parabéns! A quantidade correta é ${r.count}! 🌟`
                : `Quase lá! O total correto era ${r.count}.`}
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 font-bold h-12 rounded-2xl text-base shadow" onClick={next}>
              {idx + 1 >= rounds.length ? 'Finalizar Atividade' : 'Avançar para Próxima'} <ArrowRight className="w-5 h-5 ml-1.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
