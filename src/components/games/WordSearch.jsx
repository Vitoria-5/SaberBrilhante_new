import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, Square, ArrowRight, Check, RefreshCw } from 'lucide-react';
import { useExerciseErrors, recordDifficulty } from '@/lib/gameUtils';
import HintButton from '@/components/games/HintButton';
import { cn } from '@/lib/utils';

const ALL_WORD_SEARCH_ITEMS = [
  { word: 'BOLA', emoji: '⚽', hint: 'Procure as letras B-O-L-A grudadinhas em linha deitada ou em pé.' },
  { word: 'CASA', emoji: '🏠', hint: 'Procure as letras C-A-S-A grudadinhas em linha deitada ou em pé.' },
  { word: 'GATO', emoji: '🐱', hint: 'Procure as letras G-A-T-O grudadinhas em linha deitada ou em pé.' },
  { word: 'PATO', emoji: '🦆', hint: 'Procure as letras P-A-T-O grudadinhas em linha deitada ou em pé.' },
  { word: 'MALA', emoji: '🧳', hint: 'Procure as letras M-A-L-A grudadinhas em linha deitada ou em pé.' },
  { word: 'SAPO', emoji: '🐸', hint: 'Procure as letras S-A-P-O grudadinhas em linha deitada ou em pé.' },
  { word: 'VACA', emoji: '🐮', hint: 'Procure as letras V-A-C-A grudadinhas em linha deitada ou em pé.' },
  { word: 'BOLO', emoji: '🎂', hint: 'Procure as letras B-O-L-O grudadinhas em linha deitada ou em pé.' },
  { word: 'UVA', emoji: '🍇', hint: 'Procure as letras U-V-A grudadinhas em linha deitada ou em pé.' },
  { word: 'LUA', emoji: '🌙', hint: 'Procure as letras L-U-A grudadinhas em linha deitada ou em pé.' }
];

const GRID_SIZE = 8;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// INJEÇÃO DA PALAVRA EM LINHA RETA INDIVISÍVEL
function generateWordSearchGrid(wordItem) {
  const size = GRID_SIZE;
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const word = wordItem.word;
  
  const isHorizontal = Math.random() < 0.5;
  let startRow, startCol;
  let wordCoords = [];

  if (isHorizontal) {
    startRow = Math.floor(Math.random() * size);
    startCol = Math.floor(Math.random() * (size - word.length + 1));
    for (let i = 0; i < word.length; i++) {
      grid[startRow][startCol + i] = word[i];
      wordCoords.push({ row: startRow, col: startCol + i });
    }
  } else {
    startRow = Math.floor(Math.random() * (size - word.length + 1));
    startCol = Math.floor(Math.random() * size);
    for (let i = 0; i < word.length; i++) {
      grid[startRow + i][startCol] = word[i];
      wordCoords.push({ row: startRow + i, col: startCol });
    }
  }

  // Preenche o resto com letras aleatórias SEM repetir letras da própria palavra por perto
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        let randomChar;
        do {
          randomChar = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        } while (word.includes(randomChar) && Math.random() < 0.7); // Evita duplicar letras da resposta de forma solta
        grid[r][c] = randomChar;
      }
    }
  }

  return { grid, wordCoords };
}

function generateSearchGame() {
  const chosenItems = shuffleArray(ALL_WORD_SEARCH_ITEMS).slice(0, 5);
  return chosenItems.map(item => {
    const data = generateWordSearchGrid(item);
    return { ...item, grid: data.grid, wordCoords: data.wordCoords };
  });
}
export default function WordSearch({ onFinish, onPlayAgain }) {
  const { student, speak, stop, isSpeaking } = useStudent();
  const [rounds, setRounds] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selectedCells, setSelectedCells] = useState([]);
  const [solved, setSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { errors, revealed, reset, registerWrong } = useExerciseErrors();

  const isAudioBlocked = student?.audio_blocked || false;

  useEffect(() => {
    setRounds(generateSearchGame());
  }, []);

  const r = rounds[idx];
  const promptText = r ? `Encontre a palavra ${r.word} no caça-palavras!` : '';

  useEffect(() => {
    setSelectedCells([]);
    setSolved(false);
    reset();
    if (r && !isAudioBlocked) {
      speak(promptText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, rounds]);

  const handleCellClick = (row, col) => {
    if (solved || revealed) return;

    // Se já estiver selecionado, remove o clique (desmarca)
    const exists = selectedCells.find((c) => c.row === row && c.col === col);
    if (exists) {
      setSelectedCells(selectedCells.filter((c) => !(c.row === row && c.col === col)));
      return;
    }

    const newSelection = [...selectedCells, { row, col, char: r.grid[row][col] }];
    setSelectedCells(newSelection);

    // VALIDAÇÃO EM LINHA RETA REAL: Só aceita se as células clicadas forem exatamente as coordenadas reais da palavra
    if (newSelection.length === r.word.length) {
      // Verifica se todas as células selecionadas pertencem às coordenadas geradas da palavra oculta
      const isCorrectSequence = r.wordCoords.every(coord => 
        newSelection.some(sel => sel.row === coord.row && sel.col === coord.col)
      );

      if (isCorrectSequence) {
        setSolved(true);
        setScore((s) => s + 1);
        if (!isAudioBlocked) speak(`Sensacional! Você caçou a palavra certa: ${r.word}! 🎉`);
      } else {
        const justRevealed = registerWrong();
        if (justRevealed) {
          if (!isAudioBlocked) speak(`A palavra correta era ${r.word}.`);
          recordDifficulty(student, 'caca', r.word, 3);
          
          // Revela as células corretas na tela automaticamente
          setSelectedCells(r.wordCoords);
        } else {
          if (!isAudioBlocked) speak('Não formou a palavra certa em linha reta. Tente clicar na sequência grudadinha das letras!');
          setTimeout(() => setSelectedCells([]), 1200);
        }
      }
    }
  };

  const next = () => {
    if (idx + 1 >= rounds.length) setDone(true);
    else setIdx(idx + 1);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Explorador de Palavras!</h2>
        <p className="text-muted-foreground">Você passou pelas 5 fases e achou {score} de {rounds.length} palavras escondidas.</p>
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

  if (!r) return <div className="py-8 text-center text-muted-foreground">Escondendo letrinhas mágicas...</div>;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Caça-Palavras 🔍</h2>
          <p className="text-sm text-muted-foreground">Encontre as letras escondidas na sequência certa!</p>
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

      {/* BARRA DE PROGRESSO PEDAGÓGICA DAS 5 FASES */}
      <div className="flex gap-1.5 mb-4">
        {rounds.map((_, i) => (
          <div key={i} className={cn('h-2 flex-1 rounded-full', i < idx ? 'bg-violet-400' : i === idx ? 'bg-violet-600' : 'bg-violet-100')} />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100 space-y-5">
        <div className="flex flex-col items-center justify-center gap-2 bg-violet-50/50 rounded-2xl p-4 border border-violet-100/50">
          <span className="text-6xl select-none">{r.emoji}</span>
          <p className="text-2xl font-extrabold text-violet-800 tracking-wide text-center">
            PROCURE POR: <span className="underline decoration-violet-400">{r.word}</span>
          </p>
        </div>

        {/* TABULEIRO QUADRICULADO CORRIGIDO */}
        <div 
          className="grid gap-2 mx-auto p-3 bg-slate-50 border-2 border-violet-100 rounded-2xl max-w-sm" 
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {r.grid.map((row, rowIdx) =>
            row.map((char, colIdx) => {
              const isSelected = !!selectedCells.find((c) => c.row === rowIdx && c.col === colIdx);
              
              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                  disabled={solved || revealed}
                  className={cn(
                    "aspect-square rounded-xl font-extrabold text-lg transition shadow-sm transform active:scale-95 flex items-center justify-center border-2",
                    isSelected
                      ? (solved || revealed ? "bg-green-500 text-white border-green-600 animate-bounce" : "bg-violet-600 text-white border-violet-700")
                      : "bg-white border-slate-100 text-slate-700 hover:bg-violet-50 hover:border-violet-300"
                  )}
                >
                  {char}
                </button>
              );
            })
          )}
        </div>

        {errors >= 1 && !revealed && !solved && (
          <HintButton hint={r.hint} />
        )}

        {(solved || revealed) && (
          <div className="mt-5 space-y-3">
            <div className={cn('rounded-2xl p-4 text-center font-bold tracking-wide shadow-sm', solved ? 'bg-green-100/70 text-green-800 border border-green-200' : 'bg-amber-100/70 text-amber-800 border border-amber-200')}>
              {solved
                ? `Sensacional! Você caçou a palavra certa: ${r.word}! 🕵️‍♂️🌟`
                : `A palavra correta estava escondida na linha destacada: ${r.word}.`}
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 font-bold h-12 rounded-2xl text-base shadow" onClick={next}>
              {idx + 1 >= rounds.length ? 'Finalizar Caça' : 'Avançar para Próxima'} <ArrowRight className="w-5 h-5 ml-1.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
