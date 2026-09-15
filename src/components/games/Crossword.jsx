import { useState, useEffect } from 'react';
import { Volume2, Square, Check, HelpCircle, ArrowRight, Trophy } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// layout: rows of cells. null = black. letter = answer.
const LAYOUTS = {
  silabico_alfabetica: {
    rows: 4, cols: 5,
    cells: [
      ['C', 'A', 'S', 'A', null],
      [null, 'M', null, null, null],
      [null, 'O', null, null, null],
      [null, 'R', 'A', 'T', 'O'],
    ],
    clues: [
      { n: 1, dir: 'across', r: 0, c: 0, len: 4, text: 'Lugar onde a gente mora' },
      { n: 2, dir: 'down', r: 0, c: 1, len: 4, text: 'Sentimento que une as pessoas' },
      { n: 3, dir: 'across', r: 3, c: 1, len: 4, text: 'Bichinho que gosta de queijo' },
    ],
  },
  alfabetica: {
    rows: 4, cols: 6,
    cells: [
      ['J', 'A', 'N', 'E', 'L', 'A'],
      [null, 'M', null, null, null, null],
      [null, 'O', null, null, null, null],
      [null, 'R', 'A', 'T', 'O', null],
    ],
    clues: [
      { n: 1, dir: 'across', r: 0, c: 0, len: 6, text: 'Abertura na parede para ver lá fora' },
      { n: 2, dir: 'down', r: 0, c: 1, len: 4, text: 'Sentimento que une as pessoas' },
      { n: 3, dir: 'across', r: 3, c: 1, len: 4, text: 'Bichinho que gosta de queijo' },
    ],
  },
};

export default function Crossword({ phase, onFinish, onPlayAgain }) {
  const { speak, stop, isSpeaking, audioBlocked } = useStudent();
  const layout = LAYOUTS[phase] || LAYOUTS.silabico_alfabetica;
  const [answers, setAnswers] = useState(() =>
    layout.cells.map((row) => row.map((c) => (c === null ? null : '')))
  );
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState(null); // 'wrong' | 'right' | 'revealed'
  const [wrongCells, setWrongCells] = useState([]);

  useEffect(() => {
    speak('Preencha a cruzadinha com as letras certas!');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCell = (r, c, v) => {
    setAnswers((a) => {
      const na = a.map((row) => [...row]);
      na[r][c] = v.toUpperCase().slice(0, 1);
      return na;
    });
  };

  const check = () => {
    const wrongs = [];
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        const correct = layout.cells[r][c];
        if (correct === null) continue;
        if (answers[r][c] !== correct) wrongs.push([r, c]);
      }
    }
    if (wrongs.length === 0) {
      setStatus('right');
      speak('Parabéns! Você completou a cruzadinha!');
      return;
    }
    const a = attempts + 1;
    setAttempts(a);
    setWrongCells(wrongs);
    setStatus('wrong');
    speak('Algumas letras estão erradas. Tente de novo!');
    if (a >= 3) {
      setStatus('revealed');
      // fill correct
      setAnswers(layout.cells.map((row) => row.map((c) => (c === null ? null : c))));
      setTimeout(() => speak('Aí estão as respostas certas. Você se saiu bem!'), 500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Cruzadinha ✏️</h2>
          <p className="text-sm text-muted-foreground">Escreva as letras nos quadradinhos.</p>
        </div>
        <button onClick={() => (isSpeaking ? stop() : speak('Preencha a cruzadinha com as letras certas!'))} disabled={audioBlocked} className={cn('w-11 h-11 rounded-full flex items-center justify-center', audioBlocked ? 'bg-gray-100 text-gray-300' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200')}>
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-5 border border-violet-100">
        <div className="mb-4 space-y-1 text-sm">
          {layout.clues.map((cl) => (
            <div key={`${cl.n}-${cl.dir}`} className="flex gap-2">
              <span className="font-bold text-violet-700">{cl.n}{cl.dir === 'across' ? '→' : '↓'}.</span>
              <span className="text-slate-700">{cl.text}</span>
              <button onClick={() => speak(cl.text)} className="text-violet-500"><Volume2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="grid gap-1 mx-auto" style={{ gridTemplateColumns: `repeat(${layout.cols}, 2.2rem)` }}>
            {layout.cells.map((row, r) =>
              row.map((cell, c) => {
                if (cell === null) return <div key={`${r}-${c}`} className="w-9 h-9 bg-stone-800 rounded-sm" />;
                const wrong = wrongCells.some(([wr, wc]) => wr === r && wc === c);
                return (
                  <input
                    key={`${r}-${c}`}
                    value={answers[r][c] || ''}
                    onChange={(e) => setCell(r, c, e.target.value)}
                    maxLength={1}
                    disabled={status === 'right' || status === 'revealed'}
                    className={cn(
                      'w-9 h-9 text-center font-bold uppercase rounded-sm border-2 outline-none',
                      wrong ? 'border-red-400 bg-red-50' : 'border-violet-200 bg-violet-50 focus:border-violet-500'
                    )}
                  />
                );
              })
            )}
          </div>
        </div>

        {status === 'wrong' && (
          <div className="mt-3">
            <p className="text-amber-600 text-sm text-center">Algumas letras estão erradas (em vermelho). Tente de novo! 💛</p>
            <button onClick={() => speak('Olhe as dicas e tente de novo, você consegue!')} className="flex items-center gap-2 text-violet-700 font-semibold text-sm hover:underline mx-auto mt-1">
              <HelpCircle className="w-4 h-4" /> Por que errei?
            </button>
          </div>
        )}
        {status === 'right' && <p className="mt-3 text-green-600 font-bold text-center">Parabéns! Você completou! 🎉</p>}
        {status === 'revealed' && <p className="mt-3 text-amber-600 text-sm text-center">Veja as respostas certas acima. Você se saiu bem! 💛</p>}

        {status !== 'right' && status !== 'revealed' && (
          <Button className="mt-4 bg-violet-600 hover:bg-violet-700 mx-auto block" onClick={check}>
            <Check className="w-4 h-4 mr-1" /> Verificar
          </Button>
        )}
        {(status === 'right' || status === 'revealed') && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {onPlayAgain && <Button variant="outline" onClick={onPlayAgain}>Jogar de novo 🎲</Button>}
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={onFinish}>
              Voltar aos jogos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}