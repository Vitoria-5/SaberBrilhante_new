import { useState, useEffect } from 'react';
import { Volume2, Square, HelpCircle, RotateCcw, Trophy, ArrowRight, RefreshCw } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Função para gerar um número aleatório entre um intervalo
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Constrói um labirinto dinâmico onde a saída (Estrela) muda de lugar aleatoriamente
function generateDynamicMaze(n) {
  let grid = Array.from({ length: n }, () => Array.from({ length: n }, () => (Math.random() < 0.22 ? 1 : 0)));
  
  // O ouricinho sempre começa em [0,0]
  grid[0][0] = 0; 
  
  // SORTEIA A POSIÇÃO DA ESTRELA: Garante que ela mude de lugar a cada fase e não fique presa no canto
  let goalR, goalC;
  do {
    goalR = getRandomInt(Math.floor(n / 2), n - 1);
    goalC = getRandomInt(Math.floor(n / 2), n - 1);
  } while (goalR === 0 && goalC === 0); // Não deixa a estrela nascer em cima do jogador

  grid[goalR][goalC] = 0; // Garante que o chão da estrela seja livre

  // Se o caminho ficar trancado por pedras, essa função limpa uma linha reta para garantir que o mapa tenha solução
  for (let i = 0; i <= goalR; i++) grid[i][0] = 0;
  for (let j = 0; j <= goalC; j++) grid[goalR][j] = 0;

  return { grid, goal: [goalR, goalC] };
}

export default function Maze({ phase, onFinish, onPlayAgain }) {
  const { student, speak, stop, isSpeaking } = useStudent();
  
  // DIFICULDADE PROGRESSIVA: O tamanho do mapa (n) aumenta a cada fase da criança!
  const baseN = phase === 'garatuja' ? 4 : phase === 'pre_silabica' ? 5 : phase === 'silabica' ? 5 : phase === 'silabico_alfabetica' ? 6 : 7;

  const [currentLevel, setCurrentLevel] = useState(0); 
  const [mazeData, setMazeData] = useState(() => generateDynamicMaze(baseN));
  const [pos, setPos] = useState([0, 0]);
  const [chances, setChances] = useState(3);
  const [wrong, setWrong] = useState(null);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const isAudioBlocked = student?.audio_blocked || false;
  const { grid, goal } = mazeData;
  const n = grid.length;

  useEffect(() => {
    if (!isAudioBlocked) {
      speak('Ajude o ouricinho a chegar na estrelinha! Toque no caminho ao lado dele.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);
  const move = (r, c) => {
    if (won || lost || done) return;
    const [pr, pc] = pos;
    const adjacent = Math.abs(pr - r) + Math.abs(pc - c) === 1;
    if (!adjacent) {
      setWrong('Toque em um quadradinho ao lado do ouricinho! 🦔');
      if (!isAudioBlocked) speak('Toque pertinho do ouricinho!');
      return;
    }
    if (grid[r][c] === 1) {
      const left = chances - 1;
      setChances(left);
      setWrong('Tem uma pedra no caminho! 🪨 Tente outro lado.');
      if (!isAudioBlocked) speak('Opa, tem uma pedra! Tente outro caminho.');
      if (left <= 0) setLost(true);
      return;
    }
    setPos([r, c]);
    setWrong(null);
    
    // VERIFICA SE CHEGOU NA ESTRELA USANDO AS COORDENADAS DINÂMICAS SORTEADAS
    if (r === goal[0] && c === goal[1]) {
      setWon(true);
      setScore((s) => s + 1);
      if (!isAudioBlocked) speak('Você conseguiu! O ouricinho chegou na estrelinha!');
    }
  };

  const nextLevel = () => {
    if (currentLevel + 1 >= 5) {
      setDone(true);
    } else {
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);
      
      // AUMENTA A DIFICULDADE DE VERDADE: O tamanho do mapa cresce +1 a cada fase avançada!
      const dynamicN = baseN + Math.floor(nextLvl / 2);
      
      setMazeData(generateDynamicMaze(dynamicN));
      setPos([0, 0]);
      setChances(3);
      setWon(false);
      setLost(false);
      setWrong(null);
    }
  };

  const resetCurrent = () => {
    setPos([0, 0]);
    setChances(3);
    setWon(false);
    setLost(false);
    setWrong(null);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Você completou o Labirinto!</h2>
        <p className="text-muted-foreground">Você ajudou o ouricinho em todas as 5 fases e venceu {score} labirintos dinâmicos.</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={onFinish} className="bg-violet-600 hover:bg-violet-700">Voltar aos jogos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Labirinto Mágico 🌀</h2>
          <p className="text-sm text-muted-foreground">Leve o ouricinho 🦔 até a estrelinha ⭐</p>
        </div>
        <button 
          onClick={() => (isSpeaking ? stop() : speak('Ajude o ouricinho a chegar na estrelinha!'))} 
          disabled={isAudioBlocked} 
          className={cn('w-11 h-11 rounded-full flex items-center justify-center', isAudioBlocked ? 'bg-gray-100 text-gray-300' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200')}
        >
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* BARRA DE PROGRESSO PEDAGÓGICA PARA AS 5 FASES */}
      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn('h-2 flex-1 rounded-full', i < currentLevel ? 'bg-violet-400' : i === currentLevel ? 'bg-violet-600' : 'bg-violet-100')} />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-5 border border-violet-100">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="font-semibold text-violet-700">💛 Chances: {chances} (Nível {currentLevel + 1})</span>
          <Button variant="outline" size="sm" onClick={resetCurrent}><RotateCcw className="w-4 h-4 mr-1" /> Recomeçar</Button>
        </div>

        {/* MALHA QUADRICULADA ADAPTÁVEL: Muda de tamanho e posiciona os emojis dinamicamente */}
        <div className="grid gap-1 mx-auto border-4 border-violet-100 p-2 rounded-2xl bg-white" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, maxWidth: n * 64 }}>
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isPos = pos[0] === r && pos[1] === c;
              const isGoal = goal[0] === r && goal[1] === c;
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => move(r, c)}
                  disabled={won || lost}
                  className={cn(
                    'aspect-square rounded-xl flex items-center justify-center text-2xl transition',
                    cell === 1 ? 'bg-stone-300' : 'bg-violet-50 hover:bg-violet-100',
                    isGoal && cell === 0 && 'bg-amber-100',
                    isPos && 'bg-violet-200'
                  )}
                >
                  {cell === 1 ? '🪨' : isGoal ? '⭐' : isPos ? '🦔' : ''}
                </button>
              );
            })
          )}
        </div>

        {wrong && (
          <div className="mt-3">
            <p className="text-amber-600 text-sm text-center font-semibold">{wrong}</p>
            <button 
              onClick={() => { if (!isAudioBlocked) speak('Tem uma pedra no caminho, tente outro lado.'); }} 
              className="flex items-center gap-2 text-violet-700 font-semibold text-sm hover:underline mx-auto mt-1"
            >
              <HelpCircle className="w-4 h-4" /> Por que não deu?
            </button>
          </div>
        )}

        {won && (
          <div className="mt-4 text-center space-y-2">
            <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
            <p className="font-bold text-green-600 mt-1">Você conseguiu o nível {currentLevel + 1}! 🎉</p>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 font-bold mt-2 flex items-center justify-center gap-2" onClick={nextLevel}>
              {currentLevel + 1 >= 5 ? 'Ver Resultado Final' : 'Avançar para Próxima'} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {lost && (
          <div className="mt-4 text-center">
            <p className="font-bold text-amber-600">Não foi dessa vez, mas você se saiu super bem! 💛</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <Button className="bg-violet-600 hover:bg-violet-700 font-bold" onClick={resetCurrent}>
                Tentar Esse Nível de Novo
              </Button>
              <Button variant="outline" onClick={onFinish}>Voltar aos jogos</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
