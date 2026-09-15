import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '@/lib/StudentContext';
import { base44 } from '@/api/base44Client';
import { PHASE_MAP } from '@/lib/phases';
import { Button } from '@/components/ui/button';
import AudioButton from '@/components/AudioButton';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import ColorMatch from '@/components/games/ColorMatch';
import EmotionMatch from '@/components/games/EmotionMatch';
import CountingGame from '@/components/games/CountingGame';
import WordBuilder from '@/components/games/WordBuilder';
import Maze from '@/components/games/Maze';
import WordSearch from '@/components/games/WordSearch';
import Crossword from '@/components/games/Crossword';
import ScienceQuiz from '@/components/games/ScienceQuiz';
import SyllableGame from '@/components/games/SyllableGame';
import ImageWordMatch from '@/components/games/ImageWordMatch';
import SyllableSplit from '@/components/games/SyllableSplit';
import SyllableBuilder from '@/components/games/SyllableBuilder';
import WordWriter from '@/components/games/WordWriter';
import DrawingGame from '@/components/games/DrawingGame';
import { cn } from '@/lib/utils';

const GAMES = [
  { key: 'cores', name: 'Cores Mágicas', emoji: '🌈', desc: 'Combine as cores certas!', phases: ['garatuja', 'pre_silabica', 'silabica'], Comp: ColorMatch, color: 'from-pink-100 to-rose-100' },
  { key: 'emocoes', name: 'Carinhas e Sentimentos', emoji: '💛', desc: 'Descubra os sentimentos.', phases: ['garatuja', 'pre_silabica', 'silabica', 'silabico_alfabetica', 'alfabetica'], Comp: EmotionMatch, color: 'from-amber-100 to-yellow-100' },
  { key: 'contagem', name: 'Vamos Contar', emoji: '🔢', desc: 'Conte com carinho.', phases: ['garatuja', 'pre_silabica', 'silabica', 'silabico_alfabetica'], Comp: CountingGame, color: 'from-sky-100 to-blue-100' },
  { key: 'palavras', name: 'Monta Palavras', emoji: '🧩', desc: 'Junte as pecinhas e forme palavras.', phases: ['pre_silabica', 'silabica', 'silabico_alfabetica', 'alfabetica'], Comp: WordBuilder, color: 'from-violet-100 to-purple-100' },
  { key: 'labirinto', name: 'Labirinto Mágico', emoji: '🌀', desc: 'Leve o ouricinho até a estrelinha.', phases: ['garatuja', 'pre_silabica', 'silabica', 'silabico_alfabetica', 'alfabetica'], Comp: Maze, color: 'from-emerald-100 to-teal-100' },
  { key: 'caca', name: 'Caça-Palavras', emoji: '🔍', desc: 'Encontre as palavras escondidas.', phases: ['silabica', 'silabico_alfabetica', 'alfabetica'], Comp: WordSearch, color: 'from-indigo-100 to-blue-100' },
  { key: 'cruzadinha', name: 'Cruzadinha', emoji: '✏️', desc: 'Escreva as letras certas.', phases: ['silabico_alfabetica', 'alfabetica'], Comp: Crossword, color: 'from-fuchsia-100 to-pink-100' },
  { key: 'ciencia', name: 'Pequena Cientista', emoji: '🔬', desc: 'Descobertas sobre o mundo.', phases: ['silabico_alfabetica', 'alfabetica'], Comp: ScienceQuiz, color: 'from-cyan-100 to-sky-100' },
  { key: 'silabas', name: 'Brincando com Sílabas', emoji: '🔤', desc: 'Qual começa com a letra ou sílaba?', phases: ['silabica', 'silabico_alfabetica', 'alfabetica'], Comp: SyllableGame, section: 'silabas', color: 'from-lime-100 to-green-100' },
  { key: 'imagem-palavra', name: 'Imagem e Palavra', emoji: '🖼️', desc: 'Toque a palavra certa da figura.', phases: ['pre_silabica', 'silabica', 'silabico_alfabetica', 'alfabetica'], Comp: ImageWordMatch, section: 'silabas', color: 'from-orange-100 to-amber-100' },
  { key: 'separar-silabas', name: 'Separar Sílabas', emoji: '✂️', desc: 'Divida a palavra em sílabas.', phases: ['silabica', 'silabico_alfabetica', 'alfabetica'], Comp: SyllableSplit, section: 'silabas', color: 'from-teal-100 to-cyan-100' },
  { key: 'montar-silabas', name: 'Montar Sílabas', emoji: '🧱', desc: 'Junte as letras na ordem certa.', phases: ['silabica', 'silabico_alfabetica', 'alfabetica'], Comp: SyllableBuilder, section: 'silabas', color: 'from-rose-100 to-pink-100' },
  { key: 'escrever-palavras', name: 'Escrever Palavras', emoji: '⌨️', desc: 'Escreva a palavra que você vê ou ouve.', phases: ['silabico_alfabetica', 'alfabetica'], Comp: WordWriter, section: 'silabas', color: 'from-indigo-100 to-violet-100' },
  { key: 'desenho', name: 'Desenho Livre', emoji: '🎨', desc: 'Desenhe o que você quiser!', phases: ['garatuja', 'pre_silabica', 'silabica', 'silabico_alfabetica', 'alfabetica'], Comp: DrawingGame, color: 'from-rose-100 to-pink-100' },
];

export default function GamesHub() {
  const { student, setStudent } = useStudent();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!student) navigate('/aluno');
  }, [student, navigate]);

  if (!student) return null;
  const ph = PHASE_MAP[student.phase] || PHASE_MAP.garatuja;
  const available = GAMES.filter((g) => g.phases.includes(student.phase));
  const geral = available.filter((g) => g.section !== 'silabas');
  const silabas = available.filter((g) => g.section === 'silabas');

  const startRequestedTest = async () => {
    try {
      await base44.entities.Student.update(student.id, { test_requested: false });
      setStudent({ ...student, test_requested: false });
    } catch {
      /* ignore */
    }
    navigate('/teste');
  };

  if (active) {
    const Comp = active.Comp;
    return (
      <div className="space-y-4">
        <button onClick={() => setActive(null)} className="inline-flex items-center gap-1.5 text-violet-700 font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Voltar aos jogos
        </button>
        <Comp key={`${active.key}-${round}`} phase={student.phase} onPlayAgain={() => setRound((r) => r + 1)} onFinish={() => { setActive(null); setRound(0); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-violet-100 to-amber-100 p-6 border border-violet-100">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-5xl">{ph.emoji}</div>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-extrabold text-violet-800">Oi, {student.name}! 🧸</h1>
            <p className="text-violet-700">Sua fase agora é: <b>{ph.label}</b></p>
            <p className="text-sm text-muted-foreground mt-1">{ph.blurb}</p>
          </div>
          <div className="flex items-center gap-2">
            <AudioButton text={`Oi ${student.name}! Sua fase é ${ph.label}. Escolha um jogo para brincar.`} />
          </div>
        </div>
      </div>

      {student.test_requested && (
        <div className="rounded-3xl bg-sky-50 border-2 border-sky-300 p-5 flex items-center gap-4 flex-wrap">
          <div className="text-4xl">📝</div>
          <div className="flex-1 min-w-[200px]">
            <p className="font-extrabold text-sky-800">A professora solicitou um novo teste! 🌟</p>
            <p className="text-sky-700 text-sm">Vamos ver como você está indo? É rápido e divertido!</p>
          </div>
          <button onClick={startRequestedTest} className="px-4 py-2 rounded-full bg-sky-500 text-white font-semibold text-sm shadow hover:bg-sky-600">
            Fazer o teste
          </button>
        </div>
      )}

      {student.reforco_message && (
        <div className="rounded-3xl bg-amber-50 border-2 border-amber-200 p-5 flex items-center gap-4 flex-wrap">
          <div className="text-4xl">💌</div>
          <div className="flex-1 min-w-[200px]">
            <p className="font-extrabold text-amber-800">Recadinho da professora 💛</p>
            <p className="text-amber-700 text-sm">{student.reforco_message}</p>
          </div>
          {student.reforco_game &&
            (() => {
              const g = GAMES.find((x) => x.key === student.reforco_game);
              if (!g) return null;
              return (
                <button onClick={() => { setRound(0); setActive(g); }} className="px-4 py-2 rounded-full bg-amber-500 text-white font-semibold text-sm shadow hover:bg-amber-600">
                  {g.emoji} Jogar {g.name}
                </button>
              );
            })()}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {geral.map((g) => (
          <button
            key={g.key}
            onClick={() => { setRound(0); setActive(g); }}
            className={cn('text-left rounded-3xl p-5 border border-white shadow-md hover:shadow-xl transition bg-gradient-to-br', g.color)}
          >
            <div className="text-4xl mb-2">{g.emoji}</div>
            <h3 className="font-extrabold text-slate-800">{g.name}</h3>
            <p className="text-sm text-slate-600">{g.desc}</p>
            <span className="inline-flex items-center gap-1 mt-3 text-violet-700 font-semibold text-sm">
              <Gamepad2 className="w-4 h-4" /> Jogar
            </span>
          </button>
        ))}
      </div>

      {silabas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔤</span>
            <h2 className="text-lg font-extrabold text-violet-800">Jogos de Sílabas e Letras</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {silabas.map((g) => (
              <button
                key={g.key}
                onClick={() => { setRound(0); setActive(g); }}
                className={cn('text-left rounded-3xl p-5 border border-white shadow-md hover:shadow-xl transition bg-gradient-to-br', g.color)}
              >
                <div className="text-4xl mb-2">{g.emoji}</div>
                <h3 className="font-extrabold text-slate-800">{g.name}</h3>
                <p className="text-sm text-slate-600">{g.desc}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-violet-700 font-semibold text-sm">
                  <Gamepad2 className="w-4 h-4" /> Jogar
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {available.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          Nenhum jogo disponível para esta fase ainda. Faça o teste para descobrir sua fase!
        </div>
      )}
    </div>
  );
}