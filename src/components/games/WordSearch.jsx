import { useState, useEffect } from 'react';
import { Volume2, Square, Eraser, Trophy, HelpCircle } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function buildGrid(size, words) {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const placements = [];
  for (const w of words) {
    const dirs = [[0, 1], [1, 0]];
    let placed = false;
    for (let attempt = 0; attempt < 80 && !placed; attempt++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (r + dr * (w.length - 1) >= size || c + dc * (w.length - 1) >= size) continue;
      let ok = true;
      for (let i = 0; i < w.length; i++) {
        const rr = r + dr * i, cc = c + dc * i;
        if (grid[rr][cc] && grid[rr][cc] !== w[i]) { ok = false; break; }
      }
      if (!ok) continue;
      for (let i = 0; i < w.length; i++) grid[r + dr * i][c + dc * i] = w[i];
      placements.push({ word: w, r, c, dr, dc });
      placed = true;
    }
  }
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return { grid, placements };
}

const WORDS_BY_PHASE = {
  pre_silabica: ['SOL', 'BOLA', 'GATO'],
  silabica: ['CASA', 'SAPO', 'LOBO', 'BOLA'],
  silabico_alfabetica: ['BANANA', 'LÁPIS', 'GATO', 'FACA'],
  alfabetica: ['ELEFANTE', 'JANELA', 'FLORESTA', 'GATO'],
};

export default function WordSearch({ phase, onFinish, onPlayAgain }) {
  const { speak, stop, isSpeaking, audioBlocked } = useStudent();
  const words = WORDS_BY_PHASE[phase] || WORDS_BY_PHASE.silabica;
  const size = phase === 'alfabetica' ? 10 : phase === 'silabico_alfabetica' ? 9 : 7;
  const [{ grid, placements }] = useState(() => buildGrid(size, words));
  const [selected, setSelected] = useState([]);
  const [found, setFound] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    speak('Encontre as palavras escondidas! Toque nas letrinhas, uma ao lado da outra, na ordem da palavra.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adjacentStraight = (a, b) => {
    if (!a) return true;
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
  };

  const isPrefix = (s) =>
    words.some((w) => !found.includes(w) && (w.startsWith(s) || w.startsWith(s.split('').reverse().join(''))));

  const click = (r, c) => {
    if (found.length === words.length) return;
    const last = selected[selected.length - 1];
    // tap last selected to undo
    if (last && last[0] === r && last[1] === c) {
      setSelected(selected.slice(0, -1));
      return;
    }
    if (selected.some((s) => s[0] === r && s[1] === c)) return;
    if (selected.length === 0 || adjacentStraight(last, [r, c])) {
      const ns = [...selected, [r, c]];
      const str = ns.map(([rr, cc]) => grid[rr][cc]).join('');
      const rev = str.split('').reverse().join('');
      const match = words.find((w) => (w === str || w === rev) && !found.includes(w));
      if (match) {
        const nf = [...found, match];
        setFound(nf);
        setSelected([]);
        setMsg(null);
        speak(`Encontrou ${match}!`);
        if (nf.length === words.length) setTimeout(() => speak('Você achou todas as palavras! Parabéns!'), 500);
        return;
      }
      if (!isPrefix(str)) {
        setMsg('Por aqui não! Tente outro caminho. 💛');
        speak('Por aqui não. Tente outro caminho.');
        setTimeout(() => setMsg(null), 1500);
        setSelected([]);
        return;
      }
      setSelected(ns);
    } else {
      // not in line: start a new word from here
      setSelected([[r, c]]);
    }
  };

  const clear = () => setSelected([]);

  const inFoundLine = (r, c) => {
    for (const f of found) {
      const p = placements.find((pl) => pl.word === f);
      if (!p) continue;
      for (let i = 0; i < p.word.length; i++) {
        if (p.r + p.dr * i === r && p.c + p.dc * i === c) return true;
      }
    }
    return false;
  };

  const isSelected = (r, c) => selected.some((s) => s[0] === r && s[1] === c);

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Caça-Palavras 🔍</h2>
          <p className="text-sm text-muted-foreground">Toque nas letrinhas, uma ao lado da outra.</p>
        </div>
        <button onClick={() => (isSpeaking ? stop() : speak(`Encontre as palavras: ${words.join(', ')}`))} disabled={audioBlocked} className={cn('w-11 h-11 rounded-full flex items-center justify-center', audioBlocked ? 'bg-gray-100 text-gray-300' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200')}>
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-4 border border-violet-100">
        <div className="flex flex-wrap gap-2 mb-3 justify-center">
          {words.map((w) => (
            <span key={w} className={cn('px-2.5 py-1 rounded-full text-sm font-bold', found.includes(w) ? 'bg-green-100 text-green-700 line-through' : 'bg-violet-100 text-violet-700')}>
              {w}
            </span>
          ))}
        </div>

        <div className="grid gap-1 mx-auto" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, maxWidth: size * 36 }}>
          {grid.map((row, r) =>
            row.map((ch, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => click(r, c)}
                className={cn(
                  'aspect-square rounded-md flex items-center justify-center text-sm font-bold transition',
                  inFoundLine(r, c) ? 'bg-green-200 text-green-800' : isSelected(r, c) ? 'bg-amber-200 text-amber-800 scale-105' : 'bg-violet-50 hover:bg-violet-100 text-violet-800'
                )}
              >
                {ch}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={clear} disabled={selected.length === 0}>
            <Eraser className="w-4 h-4 mr-1" /> Limpar
          </Button>
        </div>

        {msg && (
          <div className="mt-2">
            <p className="text-amber-600 text-sm text-center">{msg}</p>
            <button onClick={() => speak('Toque na primeira letrinha da palavra e vá tocando as letrinhas ao lado, na ordem.')} className="flex items-center gap-2 text-violet-700 font-semibold text-sm hover:underline mx-auto mt-1">
              <HelpCircle className="w-4 h-4" /> Como jogar?
            </button>
          </div>
        )}

        {found.length === words.length && (
          <div className="mt-4 text-center">
            <Trophy className="w-10 h-10 text-yellow-500 mx-auto" />
            <p className="font-bold text-green-600 mt-1">Você achou todas! 🎉</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {onPlayAgain && <Button variant="outline" onClick={onPlayAgain}>Jogar de novo 🎲</Button>}
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={onFinish}>Voltar aos jogos</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}