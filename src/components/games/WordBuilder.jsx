import { useState, useEffect } from 'react';
import { Volume2, Square, RotateCcw, Check, HelpCircle, ArrowRight } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WORDS_BY_PHASE = {
  pre_silabica: [
    { word: 'BOLA', parts: ['BO', 'LA'], emoji: '⚽' },
    { word: 'GATO', parts: ['GA', 'TO'], emoji: '🐱' },
    { word: 'SOL', parts: ['S', 'OL'], emoji: '☀️' },
  ],
  silabica: [
    { word: 'CASA', parts: ['CA', 'SA'], emoji: '🏠' },
    { word: 'LOBO', parts: ['LO', 'BO'], emoji: '🐺' },
    { word: 'SAPO', parts: ['SA', 'PO'], emoji: '🐸' },
    { word: 'BOLA', parts: ['BO', 'LA'], emoji: '⚽' },
  ],
  silabico_alfabetica: [
    { word: 'BANANA', parts: ['BA', 'NA', 'NA'], emoji: '🍌' },
    { word: 'LÁPIS', parts: ['LÁ', 'PIS'], emoji: '✏️' },
    { word: 'MACACO', parts: ['MA', 'CA', 'CO'], emoji: '🐵' },
    { word: 'GALINHA', parts: ['GA', 'LI', 'NHA'], emoji: '🐔' },
  ],
  alfabetica: [
    { word: 'ELEFANTE', parts: ['E', 'L', 'E', 'F', 'A', 'N', 'T', 'E'], emoji: '🐘', letters: true },
    { word: 'JANELA', parts: ['J', 'A', 'N', 'E', 'L', 'A'], emoji: '🪟', letters: true },
    { word: 'BICICLETA', parts: ['B', 'I', 'C', 'I', 'C', 'L', 'E', 'T', 'A'], emoji: '🚲', letters: true },
  ],
};

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

export default function WordBuilder({ phase, onFinish, onPlayAgain }) {
  const { speak, stop, isSpeaking, audioBlocked } = useStudent();
  const pool = WORDS_BY_PHASE[phase] || WORDS_BY_PHASE.silabica;
  const [words] = useState(() => shuffle(pool).slice(0, 4));
  const [wi, setWi] = useState(0);
  const [selected, setSelected] = useState([]);
  const [tiles, setTiles] = useState(() => shuffle(words[0].parts));
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState(null);
  const [showWhy, setShowWhy] = useState(false);
  const [done, setDone] = useState(false);
  const [stars, setStars] = useState(0);

  const w = words[wi];

  useEffect(() => {
    if (w) {
      setSelected([]);
      setTiles(shuffle(w.parts));
      setAttempts(0);
      setStatus(null);
      setShowWhy(false);
      speak(`Monte a palavra ${w.word}.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wi]);

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Você montou tudo! ⭐</h2>
        <p className="text-muted-foreground">{stars} estrelinhas!</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {onPlayAgain && <Button variant="outline" onClick={onPlayAgain}>Jogar de novo 🎲</Button>}
          <Button onClick={onFinish} className="bg-violet-600 hover:bg-violet-700">Voltar aos jogos</Button>
        </div>
      </div>
    );
  }
  if (!w) return null;

  const toggleAudio = () => {
    if (audioBlocked) return;
    if (isSpeaking) stop();
    else speak(`Monte a palavra ${w.word}.`);
  };

  const pick = (part, i) => {
    if (status === 'right' || status === 'revealed') return;
    setSelected((s) => [...s, part]);
    setTiles((t) => t.filter((_, idx) => idx !== i));
  };
  const undo = () => {
    if (status === 'right' || status === 'revealed') return;
    if (selected.length === 0) return;
    const last = selected[selected.length - 1];
    setSelected((s) => s.slice(0, -1));
    setTiles((t) => [...t, last]);
  };

  const check = () => {
    if (selected.join('') === w.word) {
      setStatus('right');
      const gained = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
      setStars((s) => s + gained);
      speak('Muito bem! Você montou a palavra!');
      return;
    }
    const a = attempts + 1;
    setAttempts(a);
    setStatus('wrong');
    setShowWhy(false);
    speak('Quase! Tente de novo.');
    if (a >= 3) {
      setStatus('revealed');
    }
  };

  const nextWord = () => {
    if (wi + 1 >= words.length) setDone(true);
    else setWi(wi + 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Monta Palavras 🧩</h2>
          <p className="text-sm text-muted-foreground">Toque nas pecinhas na ordem certa!</p>
        </div>
        <button onClick={toggleAudio} disabled={audioBlocked} className={cn('w-11 h-11 rounded-full flex items-center justify-center', audioBlocked ? 'bg-gray-100 text-gray-300' : isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200')}>
          {isSpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-1.5 mb-4">
        {words.map((_, i) => (
          <div key={i} className={cn('h-2 flex-1 rounded-full', i < wi ? 'bg-violet-400' : i === wi ? 'bg-violet-600' : 'bg-violet-100')} />
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100">
        <div className="flex flex-col items-center gap-3 mb-5">
          <span className="text-6xl">{w.emoji}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: w.parts.length }).map((_, i) => (
              <div key={i} className={cn('w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-extrabold', selected[i] ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-dashed border-violet-200 bg-violet-50/40 text-violet-300')}>
                {selected[i] || '•'}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {tiles.map((t, i) => (
            <button key={`${t}-${i}`} onClick={() => pick(t, i)} disabled={status === 'right' || status === 'revealed'} className="px-4 py-3 rounded-2xl bg-amber-100 text-amber-900 font-extrabold text-lg shadow hover:bg-amber-200 active:scale-95 transition">
              {t}
            </button>
          ))}
          {tiles.length === 0 && <span className="text-sm text-muted-foreground">Toque em Verificar ✨</span>}
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={undo} disabled={status === 'right' || status === 'revealed'}>
            <RotateCcw className="w-4 h-4 mr-1" /> Desfazer
          </Button>
          {status !== 'right' && status !== 'revealed' && (
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={check}>
              <Check className="w-4 h-4 mr-1" /> Verificar
            </Button>
          )}
        </div>

        {(status === 'wrong' || status === 'revealed') && (
          <div className="mt-2">
            <button onClick={() => { setShowWhy((s) => !s); speak('Olhe para o desenho, pense no nome dele e monte as pecinhas na ordem certa.'); }} className="flex items-center gap-2 text-violet-700 font-semibold text-sm hover:underline mx-auto">
              <HelpCircle className="w-4 h-4" /> Por que eu errei?
            </button>
            {showWhy && <p className="mt-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-800 border border-amber-100 text-center">Olhe para o desenho, pense no nome dele e monte as pecinhas na ordem certa. 💛</p>}
            {status === 'wrong' && <p className="text-xs text-muted-foreground text-center mt-2">Tentativas restantes: {3 - attempts}</p>}
          </div>
        )}
        {status === 'right' && <p className="mt-2 text-green-600 font-bold text-center flex items-center justify-center gap-2"><Check className="w-5 h-5" /> Muito bem! Você montou {w.word}!</p>}
        {status === 'revealed' && <p className="mt-2 text-amber-600 text-sm text-center">Você tentou direitinho! Vamos para a próxima? 💛</p>}

        {(status === 'right' || status === 'revealed') && (
          <Button className="mt-4 bg-violet-600 hover:bg-violet-700 mx-auto block" onClick={nextWord}>
            {wi + 1 >= words.length ? 'Ver resultado' : 'Próxima palavra'} <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}