import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, Square, ArrowRight, Check, X, RefreshCw } from 'lucide-react';
import { useExerciseErrors, recordDifficulty } from '@/lib/gameUtils';
import HintButton from '@/components/games/HintButton';
import { cn } from '@/lib/utils';

// BANCO DE DADOS AMPLIADO COM 10 PALAVRAS PARA VARIAR AS PARTIDAS
const ALL_WORD_ITEMS = [
  { word: 'BOLA', emoji: '⚽', hint: 'Brinquedo redondo que quica.' },
  { word: 'CASA', emoji: '🏠', hint: 'Lugar onde a gente mora.' },
  { word: 'GATO', emoji: '🐱', hint: 'Animalzinho que faz miau.' },
  { word: 'PATO', emoji: '🦆', hint: 'Ave que nada e faz quá-quá.' },
  { word: 'MALA', emoji: '🧳', hint: 'Usada para guardar roupas em viagens.' },
  { word: 'SAPO', emoji: '🐸', hint: 'Animalzinho verde que pula na lagoa.' },
  { word: 'VACA', emoji: '🐮', hint: 'Animal que nos dá o leite.' },
  { word: 'LEÃO', emoji: '🦁', hint: 'O rei da floresta com uma juba grande.' },
  { word: 'BOLO', emoji: '🎂', hint: 'Doce gostoso de festa de aniversário.' },
  { word: 'FOCO', emoji: '💡', hint: 'Ilumina o quarto quando está escuro.' }
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

// Função que monta uma partida inédita com exatamente 5 fases e letras misturadas
function generateWordGame() {
  const chosenItems = shuffleArray(ALL_WORD_ITEMS).slice(0, 5);
  return chosenItems.map(item => {
    const letters = item.word.split('');
    return {
      ...item,
      // Embaralha as letras que a criança vai clicar para montar
      shuffledLetters: shuffleArray(letters.map((char, index) => ({ char, id: `${char}-${index}` })))
    };
  });
}
export default function WordBuilder({ onFinish, onPlayAgain }) {
  const { student, speak, stop, isSpeaking } = useStudent();
  const [rounds, setRounds] = useState([]); // Guarda as 5 rodadas da partida
  const [idx, setIdx] = useState(0); // Controla qual das 5 fases está ativa
  const [selected, setSelected] = useState([]); // Letras selecionadas pela criança
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { errors, revealed, reset, registerWrong } = useExerciseErrors();

  const isAudioBlocked = student?.audio_blocked || false;

  // Inicializa o jogo sorteando 5 palavras inéditas e embaralhando as letras
  useEffect(() => {
    setRounds(generateWordGame());
  }, []);

  const r = rounds[idx];
  const promptText = r ? `Monte a palavra ${r.word}!` : '';

  useEffect(() => {
    setSelected([]);
    setSolved(false);
    reset();
    if (r && !isAudioBlocked) {
      speak(promptText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, rounds]);

  // Gerencia o clique da criança nas letras embaralhadas
  const handleLetterClick = (letterObj) => {
    if (solved || revealed) return;
    
    // Se a letra já foi clicada, ignora ou remove
    if (selected.find((item) => item.id === letterObj.id)) return;

    const newSelected = [...selected, letterObj];
    setSelected(newSelected);

    // Fala a letra que a criança tocou para ajudar na alfabetização
    if (!isAudioBlocked) speak(letterObj.char);

    // Se já escolheu a quantidade total de letras da palavra, faz a validação
    if (newSelected.length === r.word.length) {
      const formedWord = newSelected.map((item) => item.char).join('');
      
      if (formedWord === r.word) {
        setSolved(true);
        setScore((s) => s + 1);
        if (!isAudioBlocked) speak(`Parabéns! Você montou a palavra ${r.word}! 🌟`);
      } else {
        const justRevealed = registerWrong();
        if (justRevealed) {
          if (!isAudioBlocked) speak(`A palavra correta é ${r.word}.`);
          recordDifficulty(student, 'palavras', r.word, 3);
        } else {
          if (!isAudioBlocked) speak('Ficou um pouquinho diferente. Vamos limpar e tentar de novo!');
          // Limpa as pecinhas automaticamente para dar mais uma chance
          setTimeout(() => setSelected([]), 1500);
        }
      }
    }
  };

  const next = () => {
    if (idx + 1 >= rounds.length) setDone(true);
    else setIdx(idx + 1);
  };

  const clearSelection = () => {
    if (solved || revealed) return;
    setSelected([]);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">🧩</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Incrível! Palavras Montadas!</h2>
        <p className="text-muted-foreground">Você completou todas as 5 fases e acertou {score} de {rounds.length} palavras.</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {onPlayAgain && (
            <Button variant="outline" onClick={onPlayAgain}>
              <RefreshCw className="w-4 h-4 mr-1" /> Jogar de novo 🎲
            </Button>
          )}
          <Button onClick={onFinish} className="bg-violet-600 hover:bg-violet-700">Voltar aos jogos</Button>
        </div>
      </div>
    );
  }

  if (!r) return <div className="py-8 text-center text-muted-foreground">Preparando pecinhas mágicas...</div>;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Monta Palavras 🧩</h2>
          <p className="text-sm text-muted-foreground">Junte as pecinhas e forme as palavras certas!</p>
        </div>
        <button
          onClick={() => (isSpeaking ? stop() : speak(promptText))}
          disabled={isAudioBlocked}
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center transition',
            isAudioBlocked ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
          )}
        >
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* BARRA DE PROGRESSO DAS 5 FASES */}
      <div className="flex gap-1.5 mb-4">
        {rounds.map((_, i) => (
          <div key={i} className={cn('h-2 flex-1 rounded-full', i < idx ? 'bg-violet-400' : i === idx ? 'bg-violet-600' : 'bg-violet-100')} />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100 space-y-6">
        <div className="flex flex-col items-center justify-center gap-2 bg-violet-50/50 rounded-2xl p-4 border border-violet-100/50">
          <span className="text-6xl select-none">{r.emoji}</span>
          <p className="text-2xl font-extrabold text-violet-800 tracking-wide text-center">{promptText}</p>
        </div>

        {/* ESPAÇO ONDE AS LETRAS SELECIONADAS APARECEM FORMANDO A PALAVRA */}
        <div className="flex justify-center gap-2 min-h-[64px] items-center border-2 border-dashed border-violet-200 bg-slate-50/50 p-3 rounded-2xl">
          {Array.from({ length: r.word.length }).map((_, slotIdx) => {
            const letterObj = selected[slotIdx];
            return (
              <div
                key={slotIdx}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-extrabold border-2 transition shadow-sm",
                  letterObj 
                    ? (solved || revealed ? 'bg-green-500 text-white border-green-600' : 'bg-violet-600 text-white border-violet-700')
                    : 'bg-white border-slate-200 text-transparent'
                )}
              >
                {letterObj ? letterObj.char : ''}
              </div>
            );
          })}
        </div>

        {/* PECINHAS COM AS LETRAS EMBARALHADAS DO JOGO */}
        <div className="flex flex-wrap justify-center gap-3 py-2">
          {r.shuffledLetters.map((letterObj) => {
            const isUsed = selected.find((item) => item.id === letterObj.id);
            return (
              <button
                key={letterObj.id}
                disabled={isUsed || solved || revealed}
                onClick={() => handleLetterClick(letterObj)}
                className={cn(
                  "w-14 h-14 rounded-2xl border-2 text-xl font-extrabold transition shadow transform active:scale-95 flex items-center justify-center",
                  isUsed
                    ? 'bg-slate-100 border-slate-200 text-slate-300 opacity-40 scale-95'
                    : 'bg-white border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-400'
                )}
              >
                {letterObj.char}
              </button>
            );
          })}
        </div>

        {/* BOTÃO AUXILIAR DE LIMPAR O FLUXO DE PECINHAS DE CLIQUE */}
        {!solved && !revealed && selected.length > 0 && (
          <div className="text-center">
            <button 
              onClick={clearSelection}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition"
            >
              🔄 Limpar e começar de novo
            </button>
          </div>
        )}

        {errors >= 1 && !revealed && !solved && (
          <HintButton hint={`Dica pedagógica: ${r.hint}`} />
        )}

        {(solved || revealed) && (
          <div className="mt-5 space-y-3">
            <div className={cn('rounded-2xl p-4 text-center font-bold tracking-wide shadow-sm', solved ? 'bg-green-100/70 text-green-800 border border-green-200' : 'bg-amber-100/70 text-amber-800 border border-amber-200')}>
              {solved
                ? `Espetacular! Você montou direitinho: ${r.word}! 🥳`
                : `Quase! A palavra certa que queríamos montar era ${r.word}.`}
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
