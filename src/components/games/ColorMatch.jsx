import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, Square, ArrowRight, Check, X, RefreshCw } from 'lucide-react';
import { useExerciseErrors, recordDifficulty } from '@/lib/gameUtils';
import HintButton from '@/components/games/HintButton';
import { cn } from '@/lib/utils';

// BANCO DE DADOS CORRIGIDO E AMPLIADO COM 10 ITENS PARA VARIAR AS PARTIDAS
const ALL_COLOR_ITEMS = [
  { question: 'QUAL COR É O SOL?', emoji: '☀️', correct: 'AMARELO', pool: ['AMARELO', 'VERMELHO', 'AZUL', 'VERDE'] },
  { question: 'QUAL COR É O MORANGO?', emoji: '🍓', correct: 'VERMELHO', pool: ['VERMELHO', 'AMARELO', 'ROXO', 'VERDE'] },
  { question: 'QUAL COR É A BANANA?', emoji: '🍌', correct: 'AMARELO', pool: ['VERMELHO', 'AMARELO', 'AZUL', 'ROSA'] },
  { question: 'QUAL COR É A FOLHA DA ÁRVORE?', emoji: '🍃', correct: 'VERDE', pool: ['ROXO', 'VERDE', 'AMARELO', 'VERMELHO'] },
  { question: 'QUAL COR É A UVINHA?', emoji: '🍇', correct: 'ROXO', pool: ['ROXO', 'BRANCO', 'AZUL', 'MARROM'] },
  { question: 'QUAL COR É O CÉU NO DIA?', emoji: '☁️', correct: 'AZUL', pool: ['AZUL', 'PRETO', 'ROSA', 'CINZA'] },
  { question: 'QUAL COR É A CENOURA?', emoji: '🥕', correct: 'LARANJA', pool: ['LARANJA', 'AZUL', 'VERDE', 'ROXO'] },
  { question: 'QUAL COR É O CHOCOLATE?', emoji: '🍫', correct: 'MARROM', pool: ['MARROM', 'BRANCO', 'PRETO', 'VERMELHO'] },
  { question: 'QUAL COR É O CARVÃO?', emoji: '⚫', correct: 'PRETO', pool: ['PRETO', 'AZUL', 'BRANCO', 'AMARELO'] },
  { question: 'QUAL COR É O TOMATE?', emoji: '🍅', correct: 'VERMELHO', pool: ['VERMELHO', 'VERDE', 'LARANJA', 'ROSA'] }
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
function generateColorGame() {
  const chosenItems = shuffleArray(ALL_COLOR_ITEMS).slice(0, 5);
  return chosenItems.map(item => ({
    ...item,
    options: shuffleArray(item.pool)
  }));
}
export default function ColorMatch({ onFinish, onPlayAgain }) {
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
    setRounds(generateColorGame());
  }, []);

  const r = rounds[idx];

  useEffect(() => {
    setPicked(null);
    setSolved(false);
    reset();
    if (r && !isAudioBlocked) {
      speak(r.question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, rounds]);

  const pick = (option) => {
    if (revealed || solved) return;
    if (option === r.correct) {
      setPicked(option);
      setSolved(true);
      setScore((s) => s + 1);
      if (!isAudioBlocked) speak(`Muito bem! É ${option}!`);
      return;
    }
    setPicked(option);
    const justRevealed = registerWrong();
    if (justRevealed) {
      if (!isAudioBlocked) speak(`A resposta certa é ${r.correct}.`);
      recordDifficulty(student, 'cores', r.question, 3);
    } else {
      if (!isAudioBlocked) speak('Não é esse. Tente de novo!');
    }
  };

  const next = () => {
    if (idx + 1 >= rounds.length) setDone(true);
    else setIdx(idx + 1);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">🌈</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Parabéns!</h2>
        <p className="text-muted-foreground">Você completou o jogo das cores mágicas e acertou {score} de {rounds.length}.</p>
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

  if (!r) return <div className="py-8 text-center text-muted-foreground">Preparando cores...</div>;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Cores Mágicas 🌈</h2>
          <p className="text-sm text-muted-foreground">Vamos brincar com as cores!</p>
        </div>
        <button
          onClick={() => (isSpeaking ? stop() : speak(r.question))}
          disabled={isAudioBlocked}
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center transition',
            isAudioBlocked ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
          )}
        >
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* BARRA DE PROGRESSO DINÂMICA PARA AS 5 FASES */}
      <div className="flex gap-1.5 mb-4">
        {rounds.map((_, i) => (
          <div key={i} className={cn('h-2 flex-1 rounded-full', i < idx ? 'bg-violet-400' : i === idx ? 'bg-violet-600' : 'bg-violet-100')} />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100 space-y-5">
        <div className="flex items-center justify-center gap-3 bg-violet-50/50 rounded-2xl p-4 border border-violet-100/50">
          <span className="text-5xl">{r.emoji}</span>
          <p className="text-2xl font-extrabold text-violet-800 tracking-wide text-center">{r.question}</p>
        </div>

        {/* ALTERNATIVAS TOTALMENTE EMBARALHADAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {r.options.map((option) => {
            const showCorrect = (solved || revealed) && option === r.correct;
            const showWrong = picked && option === picked && picked !== r.correct;
            
            const dotColors = {
              'VERMELHO': 'bg-red-500',
              'AMARELO': 'bg-yellow-400',
              'AZUL': 'bg-blue-500',
              'VERDE': 'bg-green-500',
              'ROXO': 'bg-purple-500',
              'ROSA': 'bg-pink-400',
              'PRETO': 'bg-black',
              'LARANJA': 'bg-orange-500',
              'BRANCO': 'bg-slate-100 border border-slate-300',
              'MARROM': 'bg-amber-800',
              'CINZA': 'bg-slate-400'
            };

            return (
              <button
                key={option}
                onClick={() => pick(option)}
                disabled={solved || revealed}
                className={cn(
                  'p-5 rounded-2xl font-extrabold text-lg transition flex items-center gap-4 border-2 text-left shadow-sm',
                  showCorrect
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : showWrong
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-violet-100 bg-violet-50/50 text-slate-700 hover:bg-violet-50 hover:border-violet-300',
                  (solved || revealed) && !showCorrect && !showWrong && 'opacity-50'
                )}
              >
                <div className={cn("w-6 h-6 rounded-full shrink-0 shadow-sm", dotColors[option] || "bg-slate-300")} />
                <span className="flex-1 tracking-wider text-sm sm:text-base">{option}</span>
                {showCorrect && <Check className="w-5 h-5 text-green-600 shrink-0" />}
                {showWrong && <X className="w-5 h-5 text-red-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {errors >= 1 && !revealed && !solved && (
          <HintButton hint={`Escute com atenção: o elemento na tela combina com qual das 4 cores?`} />
        )}

        {(solved || revealed) && (
          <div className="mt-5 space-y-3">
            <div className={cn('rounded-2xl p-4 text-center font-bold tracking-wide shadow-sm', solved ? 'bg-green-100/70 text-green-800 border border-green-200' : 'bg-amber-100/70 text-amber-800 border border-amber-200')}>
              {solved
                ? `Sensacional! A resposta certa é ${r.correct}! 🎉`
                : `Ah! A resposta correta era ${r.correct}. Vamos tentar a próxima?`}
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
