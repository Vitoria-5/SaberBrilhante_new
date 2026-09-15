import { useState, useEffect, useMemo } from 'react';
import { Volume2, Square, HelpCircle, RotateCcw, Trophy } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SIZE = { garatuja: 4, pre_silabica: 5, silabica: 5, silabico_alfabetica: 6, alfabetica: 7 };

function generateGrid(n) {
  // build a solvable maze: 0 = path, 1 = wall
  let grid, attempts = 0;
  do {
    grid = Array.from({ length: n }, () => Array.from({ length: n }, () => (Math.random() < 0.25 ? 1 : 0)));
    grid[0][0] = 0;
    grid[n - 1][n - 1] = 0;
    attempts++;
  } while (!isSolvable(grid, n) && attempts < 50);
  return grid;
}

function isSolvable(grid, n) {
  const visited = Array.from({ length: n }, () => Array(n).fill(false));
  const queue = [[0, 0]];
  visited[0][0] = true;
  while (queue.length) {
    const [r, c] = queue.shift();
    if (r === n - 1 && c === n - 1) return true;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr][nc] && grid[nr][nc] === 0) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }
  return false;
}

export default function Maze({ phase, onFinish, onPlayAgain }) {
  const { speak, stop, isSpeaking, audioBlocked } = useStudent();
  const n = SIZE[phase] || 5;
  const [grid] = useState(() => generateGrid(n));
  const [pos, setPos] = useState([0, 0]);
  const [chances, setChances] = useState(3);
  const [wrong, setWrong] = useState(null);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    speak('Ajude o ouricinho a chegar na estrelinha! Toque no caminho ao lado dele.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (r, c) => {
    if (won || lost) return;
    const [pr, pc] = pos;
    const adjacent = Math.abs(pr - r) + Math.abs(pc - c) === 1;
    if (!adjacent) {
      setWrong('Toque em um quadradinho ao lado do ouricinho! 🦔');
      speak('Toque pertinho do ouricinho!');
      setTimeout(() => setWrong(null), 1500);
      return;
    }
    if (grid[r][c] === 1) {
      const left = chances - 1;
      setChances(left);
      setWrong('Tem uma pedra no caminho! 🪨 Tente outro lado.');
      speak('Opa, tem uma pedra! Tente outro caminho.');
      if (left <= 0) setLost(true);
      setTimeout(() => setWrong(null), 1500);
      return;
    }
    setPos([r, c]);
    if (r === n - 1 && c === n - 1) {
      setWon(true);
      speak('Você conseguiu! O ouricinho chegou na estrelinha!');
    }
  };

  const reset = () => {
    setPos([0, 0]);
    setChances(3);
    setWon(false);
    setLost(false);
    setWrong(null);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Labirinto Mágico 🌀</h2>
          <p className="text-sm text-muted-foreground">Leve o ouricinho 🦔 até a estrelinha ⭐</p>
        </div>
        <button onClick={() => (isSpeaking ? stop() : speak('Ajude o ouricinho a chegar na estrelinha!'))} disabled={audioBlocked} className={cn('w-11 h-11 rounded-full flex items-center justify-center', audioBlocked ? 'bg-gray-100 text-gray-300' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200')}>
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-5 border border-violet-100">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="font-semibold text-violet-700">💛 Chances: {chances}</span>
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="w-4 h-4 mr-1" /> Recomeçar</Button>
        </div>

        <div className="grid gap-1 mx-auto" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, maxWidth: n * 64 }}>
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isPos = pos[0] === r && pos[1] === c;
              const isGoal = r === n - 1 && c === n - 1;
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => move(r, c)}
                  className={cn(
                    'aspect-square rounded-xl flex items-center justify-center text-2xl transition',
                    cell === 1 ? 'bg-stone-300 cursor-pointer' : 'bg-violet-50 hover:bg-violet-100',
                    isGoal && cell === 0 && 'bg-amber-100'
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
            <p className="text-amber-600 text-sm text-center">{wrong}</p>
            <button onClick={() => speak('Tem uma pedra no caminho, tente outro lado.')} className="flex items-center gap-2 text-violet-700 font-semibold text-sm hover:underline mx-auto mt-1">
              <HelpCircle className="w-4 h-4" /> Por que não deu?
            </button>
          </div>
        )}

        {won && (
          <div className="mt-4 text-center">
            <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
            <p className="font-bold text-green-600 mt-1">Você conseguiu! 🎉</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {onPlayAgain && <Button variant="outline" onClick={onPlayAgain}>Jogar de novo 🎲</Button>}
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={onFinish}>Voltar aos jogos</Button>
            </div>
          </div>
        )}
        {lost && (
          <div className="mt-4 text-center">
            <p className="font-bold text-amber-600">Não foi dessa vez, mas você se saiu super bem! 💛</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {onPlayAgain && <Button variant="outline" onClick={onPlayAgain}>Jogar de novo 🎲</Button>}
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={onFinish}>Voltar aos jogos</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}