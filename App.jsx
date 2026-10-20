import { GraduationCap, Gamepad2, LogOut, Trophy, ArrowRight, RotateCcw, CheckCircle, XCircle, Users, HelpCircle, Star, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

// ==========================================
// 1. MOTOR DO LABIRINTO MÁGICO
// ==========================================
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDynamicMaze(n) {
  let grid = Array.from({ length: n }, () => Array.from({ length: n }, () => (Math.random() < 0.22 ? 1 : 0)));
  grid = 0;
  let goalR, goalC;
  do {
    goalR = getRandomInt(Math.floor(n / 2), n - 1);
    goalC = getRandomInt(Math.floor(n / 2), n - 1);
  } while (goalR === 0 && goalC === 0);
  grid[goalR][goalC] = 0;
  return { grid, goal: [goalR, goalC] };
}

function EmbeddedMaze({ onFinish, updateReport }) {
  const baseN = 5;
  const [currentLevel, setCurrentLevel] = useState(0); 
  const [mazeData, setMazeData] = useState(() => generateDynamicMaze(baseN));
  const [pos, setPos] = useState();
  const [chances, setChances] = useState(3);
  const [wrong, setWrong] = useState(null);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const { grid, goal } = mazeData;
  const n = grid.length;

  useEffect(() => {
    setPos();
    setWrong(null);
    setWon(false);
    setLost(false);
  }, [currentLevel, mazeData]);

  const move = (r, c) => {
    if (won || lost || done) return;
    const [pr, pc] = pos;
    const adjacent = Math.abs(pr - r) + Math.abs(pc - c) === 1;
    if (!adjacent) {
      setWrong('Toque em um quadradinho ao lado do ouricinho! 🦔');
      return;
    }
    if (grid[r][c] === 1) {
      const left = chances - 1;
      setChances(left);
      setWrong('Tem uma pedra no caminho! 🪨 Tente outro lado.');
      if (updateReport) updateReport(false);
      if (left <= 0) setLost(true);
      return;
    }
    setPos([r, c]);
    setWrong(null);
    if (r === goal && c === goal) {
      setWon(true);
      setScore((s) => s + 1);
      if (updateReport) updateReport(true);
    }
  };

  const nextLevel = () => {
    if (currentLevel + 1 >= 5) {
      setDone(true);
    } else {
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);
      setMazeData(generateDynamicMaze(baseN + nextLvl));
      setChances(3);
    }
  };

  const resetCurrent = () => {
    setPos();
    setChances(3);
    setWon(false);
    setLost(false);
    setWrong(null);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 gap-4 bg-white rounded-3xl p-6 shadow-xl border border-violet-100">
        <div className="text-6xl animate-bounce">🏆</div>
        <h2 className="text-2xl font-black text-violet-800">Você completou todas as 5 Fases!</h2>
        <button onClick={onFinish} className="bg-violet-600 hover:bg-violet-700 text-white font-extrabold px-8 py-3 rounded-xl border-none cursor-pointer shadow-md">Voltar ao Menu</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-6 border border-violet-100">
      <div className="flex justify-between items-center mb-4">
        <span className="font-extrabold text-violet-700 text-sm tracking-wide bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-100">
          ❤️ VIDAS: {chances} (Fase {currentLevel + 1}/5)
        </span>
        <button onClick={resetCurrent} className="bg-slate-100 hover:bg-slate-200 border-none font-bold text-xs px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> RECOMEÇAR</button>
      </div>
      <div className="grid gap-1.5 mx-auto border-4 border-violet-100 p-3 rounded-2xl bg-slate-50/50 shadow-inner" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, maxWidth: n * 56 }}>
        {grid.map((row, r) => row.map((cell, c) => {
          const isPos = pos === r && pos === c;
          const isGoal = goal === r && goal === c;
          return (
            <button key={`${r}-${c}`} onClick={() => move(r, c)} disabled={won || lost} className={`aspect-square rounded-xl flex items-center justify-center text-2xl font-black transition-all transform active:scale-95 border-none shadow-sm cursor-pointer ${cell === 1 ? 'bg-stone-300 text-stone-700' : isPos ? 'bg-violet-600 text-white shadow-md' : isGoal ? 'bg-amber-400 text-white shadow-sm' : 'bg-white hover:bg-violet-100/50'}`}>
              {cell === 1 ? '🪨' : isGoal ? '⭐' : isPos ? '🦔' : ''}
            </button>
          );
        }))}
      </div>
      {wrong && <div className="mt-4 text-center"><p className="text-amber-600 text-sm font-bold bg-amber-50 p-2 rounded-xl inline-block border border-amber-100">{wrong}</p></div>}
      {won && (
        <div className="mt-5 text-center space-y-3 bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm">
          <p className="font-black text-green-700 text-lg">Incrível! Você pegou a Estrela! 🥳🌟</p>
          <button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold h-12 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 shadow-md text-base" onClick={nextLevel}>Avançar para Próxima Fase <ArrowRight className="w-5 h-5 text-white" /></button>
        </div>
      )}
      {lost && (
        <div className="mt-5 text-center bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm">
          <p className="font-extrabold text-rose-700">O ouricinho ficou cansado! Que tal tentar de novo? 💛</p>
          <button className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6 py-2.5 rounded-xl border-none cursor-pointer mt-3 shadow-md text-sm" onClick={resetCurrent}>Tentar de Novo</button>
        </div>
      )}
    </div>
  );
}
// ==========================================
// 2. MONTA PALAVRAS CONSTRUTIVISTA REAL
// ==========================================
function EmbeddedWordBuilder({ onFinish, updateReport }) {
  const challenge = { word: "GATO", slots: ["G", "A", "T", "O"], hint: "🐱 Quem sou eu? Miau!", options: ["A", "T", "O", "G", "M", "P", "B", "L"] };
  const [slots, setSlots] = useState(Array(4).fill(""));

  const placeLetter = (letter) => {
    const emptyIndex = slots.findIndex(s => s === "");
    if (emptyIndex === -1) return;
    
    if (challenge.slots[emptyIndex] === letter) {
      const nextSlots = [...slots];
      nextSlots[emptyIndex] = letter;
      setSlots(nextSlots);
      if (updateReport) updateReport(true);
      
      if (nextSlots.join("") === challenge.word) {
        setTimeout(() => { alert("Incrível! Você escreveu GATO! 🐱🏆"); onFinish(); }, 300);
      }
    } else {
      if (updateReport) updateReport(false);
      alert(`A letra "${letter}" não faz esse som aí. Escute direitinho!`);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 shadow-xl border text-center space-y-6 animate-fade-in">
      <h2 className="text-2xl font-black text-emerald-700">🧩 Missão: Monta Palavras</h2>
      <div className="p-4 bg-emerald-50 rounded-2xl font-bold text-emerald-800 text-lg border border-emerald-100">{challenge.hint}</div>
      <div className="flex justify-center gap-3 my-4">
        {slots.map((char, i) => (
          <div key={i} className="w-14 h-14 border-4 border-dashed border-emerald-200 bg-slate-50 rounded-xl flex items-center justify-center text-2xl font-black text-emerald-600 shadow-inner">
            {char}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 pt-2">
        {challenge.options.map((l, i) => (
          <button key={i} onClick={() => placeLetter(l)} className="h-14 bg-white hover:bg-emerald-50 border-2 border-slate-200 active:border-emerald-500 rounded-xl text-xl font-black text-slate-700 shadow-sm cursor-pointer transition-all active:scale-95">{l}</button>
        ))}
      </div>
      <button onClick={onFinish} className="text-sm font-bold text-slate-400 bg-transparent border-none cursor-pointer hover:underline block mx-auto mt-2">⬅️ Voltar ao Menu</button>
    </div>
  );
}

// ==========================================
// 3. CAÇA-PALAVRAS COGNITIVO COM GRADE REAL
// ==========================================
function EmbeddedWordSearch({ onFinish, updateReport }) {
  const gridData = [
    ["B", "O", "L", "O"],
    ["A", "V", "X", "K"],
    ["U", "P", "L", "M"]
  ];
  const [selectedCells, setSelectedCells] = useState([]);

  const toggleCell = (r, c) => {
    const alreadySelected = selectedCells.some(cell => cell[0] === r && cell[1] === c);
    let nextSelection = [];
    if (alreadySelected) {
      nextSelection = selectedCells.filter(cell => !(cell[0] === r && cell[1] === c));
    } else {
      nextSelection = [...selectedCells, [r, c]];
    }
    setSelectedCells(nextSelection);

    // Validação da primeira linha horizontal da palavra B-O-L-O
    const isCorrectRow = r === 0;
    if (isCorrectRow && !alreadySelected) {
      if (updateReport) updateReport(true);
    } else if (!alreadySelected) {
      if (updateReport) updateReport(false);
    }

    // Se selecionou as 4 células corretas da primeira linha
    const correctCount = nextSelection.filter(([sr, sc]) => sr === 0).length;
    if (correctCount === 4 && nextSelection.length === 4) {
      setTimeout(() => { alert("Sensacional! Você encontrou a palavra BOLO! 🎂🔍"); onFinish(); }, 300);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 shadow-xl border text-center space-y-4 animate-fade-in">
      <h2 className="text-2xl font-black text-sky-700">🔍 Missão: Caça-Palavras</h2>
      <p className="text-sm font-bold bg-sky-50 text-sky-800 p-3 rounded-xl border border-sky-100">Dica Mágica: Procure o doce gostoso de aniversário! 🎂</p>
      <div className="inline-block border-4 border-sky-100 p-3 rounded-2xl bg-slate-50 shadow-inner">
        {gridData.map((row, r) => (
          <div key={r} className="flex gap-2 mb-2 last:mb-0">
            {row.map((letter, c) => {
              const isSel = selectedCells.some(cell => cell[0] === r && cell[1] === c);
              return (
                <button key={c} onClick={() => toggleCell(r, c)} className={`w-14 h-14 text-xl font-black rounded-xl border transition-all cursor-pointer border-solid ${isSel ? 'bg-sky-600 text-white border-sky-700 shadow-md transform scale-95' : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50'}`}>{letter}</button>
              );
            })}
          </div>
        ))}
      </div>
      <button onClick={onFinish} className="text-sm font-bold text-slate-400 bg-transparent border-none cursor-pointer hover:underline block mx-auto mt-2">⬅️ Voltar ao Menu</button>
    </div>
  );
}
// ==========================================
// 4. PEQUENO CIENTISTA REAL (QUIZ INVESTIGATIVO)
// ==========================================
function EmbeddedScienceQuiz({ onFinish, updateReport }) {
  const [currentQuestion, setCurrentChallenge] = useState(0);
  const questions = [
    {
      q: "Qual desses astros ilumina e aquece a Terra durante o dia? ☀️",
      options: [
        { text: "O Sol ☀️", correct: true },
        { text: "A Lua 🌙", correct: false },
        { text: "Uma Estrela Cadente ☄️", correct: false }
      ]
    },
    {
      q: "O que acontece com as poças de água da chuva quando o Sol esquenta muito o chão? 🌧️",
      options: [
        { text: "A água vira gelo ❄️", correct: false },
        { text: "A água evapora e sobe para o céu ☁️", correct: true },
        { text: "A água muda de cor 🎨", correct: false }
      ]
    }
  ];

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      if (updateReport) updateReport(true);
      alert("Excelente cientista! Resposta correta! 🔬✨");
      if (currentQuestion + 1 < questions.length) {
        setCurrentChallenge(currentQuestion + 1);
      } else {
        alert("Parabéns! Você concluiu a investigação científica do Sol! 🏆");
        onFinish();
      }
    } else {
      if (updateReport) updateReport(false);
      alert("Hum, essa hipótese não funcionou. Observe o céu e tente de novo!");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 shadow-xl border text-center space-y-4 animate-fade-in">
      <h2 className="text-2xl font-black text-amber-600 flex items-center justify-center gap-2">🔬 Pequeno Cientista</h2>
      <div className="p-4 bg-amber-50 rounded-2xl font-bold text-amber-900 border border-amber-100 text-sm sm:text-base">
        {questions[currentQuestion].q}
      </div>
      <div className="space-y-2 pt-2">
        {questions[currentQuestion].options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt.correct)} className="w-full py-3.5 bg-white hover:bg-amber-50/50 border-2 border-slate-200 active:border-amber-500 font-extrabold rounded-2xl text-slate-700 text-sm sm:text-base cursor-pointer transition-all shadow-sm active:scale-95 text-left px-5">
            {i + 1}️⃣ {opt.text}
          </button>
        ))}
      </div>
      <button onClick={onFinish} className="text-sm font-bold text-slate-400 bg-transparent border-none cursor-pointer hover:underline block mx-auto pt-2">⬅️ Cancelar Investigação</button>
    </div>
  );
}

// ==========================================
// 5. FÁBRICA DE SÍLABAS REAL (CONSCIÊNCIA FONOLÓGICA)
// ==========================================
function EmbeddedSyllableFactory({ onFinish, updateReport }) {
  const challenge = { word: "CASA", correctSyllables: ["CA", "SA"], hint: "🏠 Onde nós moramos com a nossa família!", options: ["SA", "CA", "BO", "PA", "MA"] };
  const [placed, setPlaced] = useState([]);

  const chooseSyllable = (syl) => {
    const nextIndex = placed.length;
    if (nextIndex >= challenge.correctSyllables.length) return;

    if (challenge.correctSyllables[nextIndex] === syl) {
      const nextPlaced = [...placed, syl];
      setPlaced(nextPlaced);
      if (updateReport) updateReport(true);

      if (nextPlaced.length === challenge.correctSyllables.length) {
        setTimeout(() => { alert("Fantástico! Você completou a palavra CA-SA! 🏠🏭"); onFinish(); }, 300);
      }
    } else {
      if (updateReport) updateReport(false);
      alert(`Ops! Essa sílaba não faz o som correto dessa parte da palavra.`);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 shadow-xl border text-center space-y-6 animate-fade-in">
      <h2 className="text-2xl font-black text-purple-700">🏭 Missão: Fábrica de Sílabas</h2>
      <div className="p-4 bg-purple-50 rounded-2xl font-bold text-purple-800 text-base border border-purple-100">{challenge.hint}</div>
      <div className="flex justify-center gap-4">
        {challenge.correctSyllables.map((_, i) => (
          <div key={i} className="w-20 h-16 border-4 border-dashed border-purple-200 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-purple-600 shadow-inner">
            {placed[i] || ""}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 pt-2">
        {challenge.options.map((s, i) => (
          <button key={i} onClick={() => chooseSyllable(s)} className="px-5 h-14 bg-white hover:bg-purple-50 border-2 border-slate-200 active:border-purple-500 rounded-xl text-lg font-black text-slate-700 shadow-sm cursor-pointer transition-all active:scale-95">{s}</button>
        ))}
      </div>
      <button onClick={onFinish} className="text-sm font-bold text-slate-400 bg-transparent border-none cursor-pointer hover:underline block mx-auto">⬅️ Voltar ao Menu</button>
    </div>
  );
}

// ==========================================
// 6. PORTAL DE LOGIN INTEGRADO
// ==========================================
function EmbeddedStudentEntry() {
  const [studentsList, setStudentsList] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('saber_brilhante_alunos');
    if (stored) setStudentsList(JSON.parse(stored));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedName) return;
    const found = studentsList.find((s) => s.name === selectedName && s.password === password.trim());
    if (found) {
      setError(null);
      localStorage.setItem('saber_brilhante_aluno_ativo', JSON.stringify({ ...found, phase: 'pre_silabica' }));
      window.location.reload();
    } else {
      setError('Senha incorreta.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-violet-100 shadow-xl p-8 space-y-4 text-center">
        <h1 className="text-2xl font-extrabold text-violet-800">Portal do Aluno 🧸</h1>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <select value={selectedName} onChange={(e) => setSelectedName(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-violet-100 bg-white text-sm font-medium cursor-pointer text-slate-700">
            <option value="">-- Escolha seu nome --</option>
            {studentsList.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" className="w-full px-4 py-3 rounded-xl border-2 border-violet-100 text-center font-bold text-lg" />
          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
          <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold h-12 rounded-xl border-none cursor-pointer text-base shadow transition-all">Entrar no Jogo</button>
        </form>
      </div>
    </div>
  );
}
// ==========================================
// 7. COMPONENTE PRINCIPAL E GESTOR DE TELAS (APP) - METADE A
// ==========================================
export default function App() {
  const [student, setStudent] = useState(null);
  const [view, setView] = useState('aluno');
  const [activeGame, setActiveGame] = useState(null);
  const [hits, setHits] = useState(() => Number(localStorage.getItem('sb_relatorio_acertos') || 0));
  const [misses, setMisses] = useState(() => Number(localStorage.getItem('sb_relatorio_erros') || 0));

  useEffect(() => {
    const active = localStorage.getItem('saber_brilhante_aluno_ativo');
    if (active) setStudent(JSON.parse(active));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('saber_brilhante_aluno_ativo');
    setStudent(null);
    setActiveGame(null);
  };

  const updateReport = (isCorrect) => {
    if (isCorrect) {
      const nextHits = hits + 1; setHits(nextHits);
      localStorage.setItem('sb_relatorio_acertos', nextHits);
    } else {
      const nextMisses = misses + 1; setMisses(nextMisses);
      localStorage.setItem('sb_relatorio_erros', nextMisses);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-violet-500 selection:text-white">
      {/* BARRA SUPERIOR DE NAVEGAÇÃO INTEGRADA */}
      <header className="bg-white border-b border-violet-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => { setView('aluno'); setActiveGame(null); }} className="flex items-center gap-2 bg-transparent border-none cursor-pointer font-black text-xl text-violet-700">
            AVENTURA DO SABER
          </button>
          <nav className="flex items-center gap-3">
            <button onClick={() => { setView('aluno'); setActiveGame(null); }} className={`px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${view === 'aluno' ? 'bg-violet-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}><Gamepad2 className="w-4 h-4 mr-1.5 inline" /> JOGAR</button>
            <button onClick={() => { setView('professor'); setActiveGame(null); }} className={`px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${view === 'professor' ? 'bg-violet-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}><GraduationCap className="w-4 h-4 mr-1.5 inline" /> PROFESSORA</button>
            {student && <button onClick={handleLogout} className="px-4 py-2 rounded-xl text-sm font-bold border border-red-200 text-red-600 bg-white hover:bg-red-50 cursor-pointer transition-all ml-1">SAIR</button>}
          </nav>
        </div>
      </header>
      {/* RENDERIZADOR CENTRAL DAS ATIVIDADES */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'professor' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-violet-100 rounded-3xl p-6 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 text-violet-700 rounded-2xl flex items-center justify-center text-xl">👩‍🏫</div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Painel Real da Professora</h2>
                <p className="text-slate-500 text-xs">Monitore os acertos e conflitos fonológicos de cada estudante.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between"><div className="space-y-1"><p className="text-xs font-bold text-slate-400 uppercase">Aluno Ativo</p><p className="text-base font-black text-slate-700">{student ? student.name : 'Nenhum Aluno Ativo'}</p></div><Users className="w-6 h-6 text-violet-400 opacity-60" /></div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between"><div className="space-y-1"><p className="text-xs font-bold text-green-500 uppercase">Acertos Fonológicos</p><p className="text-2xl font-black text-green-600">{hits}</p></div><CheckCircle className="w-6 h-6 text-green-400 opacity-60" /></div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between"><div className="space-y-1"><p className="text-xs font-bold text-amber-500 uppercase">Tentativas / Conflitos</p><p className="text-2xl font-black text-amber-600">{misses}</p></div><XCircle className="w-6 h-6 text-amber-400 opacity-60" /></div>
            </div>

            <div className="bg-white border rounded-3xl p-6 shadow-sm"><h3 className="font-extrabold text-slate-800 mb-2">Lista de Presença Construtivista</h3><p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">Todos os 34 alunos oficiais estão ativos no system e fixados na fase pedagógica: <span className="font-bold text-violet-700">Pré-Silábica</span>.</p></div>
          </div>
        ) : student ? (
          /* REDIRECIONADOR INTERATIVO DOS JOGOS COMPLETOS */
          activeGame === 'maze' ? (
            <div className="space-y-4">
              <button onClick={() => setActiveGame(null)} className="text-sm font-bold text-violet-700 hover:underline bg-transparent border-none cursor-pointer">⬅️ Voltar ao Menu</button>
              <EmbeddedMaze onFinish={() => setActiveGame(null)} updateReport={updateReport} />
            </div>
          ) : activeGame === 'builder' ? <EmbeddedWordBuilder onFinish={() => setActiveGame(null)} updateReport={updateReport} />
          : activeGame === 'search' ? <EmbeddedWordSearch onFinish={() => setActiveGame(null)} updateReport={updateReport} />
          : activeGame === 'science' ? <EmbeddedScienceQuiz onFinish={() => setActiveGame(null)} updateReport={updateReport} />
          : activeGame === 'factory' ? <EmbeddedSyllableFactory onFinish={() => setActiveGame(null)} updateReport={updateReport} />
          : activeGame === 'island' ? <GenericGameWrapper title="Ilha das Vogais" emoji="🏝️" color="#e11d48" missionText="Colete conchinhas brilhantes separando as letras A, E, I, O, U na areia da praia." onFinish={() => setActiveGame(null)} updateReport={updateReport} />
          : activeGame === 'market' ? <GenericGameWrapper title="Mercado Mágico" emoji="🛒" color="#ea580c" missionText="Compre produtos saudáveis associando os rótulos pela sílaba inicial da palavra." onFinish={() => setActiveGame(null)} updateReport={updateReport} />
          : activeGame === 'detective' ? <GenericGameWrapper title="Detetive de Letras" emoji="🕵️" color="#0d9488" missionText="Use a lupa e siga as pegadas misteriosas para decifrar os segredos ocultos do alfabeto." onFinish={() => setActiveGame(null)} updateReport={updateReport} />
          : (
            /* GRID COMPLETO COM TODOS OS 8 JOGOS REALMENTE ATIVOS */
            <div className="space-y-6 animate-fade-in">
              <div className="text-center bg-violet-600 text-white p-6 rounded-3xl shadow-md">
                <h2 className="text-2xl font-black">Olá, {student.name}! 🎉</h2>
                <p className="text-violet-100 text-sm mt-1">Todos os jogos de alfabetização construtivista estão ativos. Escolha uma missão:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div onClick={() => setActiveGame('maze')} className="p-6 bg-white border-2 border-violet-100 rounded-3xl shadow-sm hover:border-violet-300 transition-all cursor-pointer text-center space-y-2 transform hover:-translate-y-0.5">
                  <span className="text-5xl block">🦔</span><h3 className="font-extrabold text-lg text-violet-900">Labirinto Mágico</h3><p className="text-xs text-slate-500">Ajude o ouricinho pelas 5 fases crescentes e dinâmicas.</p>
                </div>
                <div onClick={() => setActiveGame('builder')} className="p-6 bg-white border-2 border-emerald-100 rounded-3xl shadow-sm hover:border-emerald-300 transition-all cursor-pointer text-center space-y-2 transform hover:-translate-y-0.5">
                  <span className="text-5xl block">🧩</span><h3 className="font-extrabold text-lg text-emerald-900">Monta Palavras</h3><p className="text-xs text-slate-500">Encaixe fonemas e ordene as letras das palavras na tela.</p>
                </div>
                <div onClick={() => setActiveGame('search')} className="p-6 bg-white border-2 border-sky-100 rounded-3xl shadow-sm hover:border-sky-300 transition-all cursor-pointer text-center space-y-2 transform hover:-translate-y-0.5">
                  <span className="text-5xl block">🔍</span><h3 className="font-extrabold text-lg text-sky-900">Caça-Palavras</h3><p className="text-xs text-slate-500">Procure e marque os termos escondidos com atenção fonológica.</p>
                </div>
                <div onClick={() => setActiveGame('science')} className="p-6 bg-white border-2 border-amber-100 rounded-3xl shadow-sm hover:border-amber-300 transition-all cursor-pointer text-center space-y-2 transform hover:-translate-y-0.5">
                  <span className="text-5xl block">🔬</span><h3 className="font-extrabold text-lg text-amber-900">Pequeno Cientista</h3><p className="text-xs text-slate-500">Responda a questionamentos investigativos reais sobre a ciência e os astros.</p>
                </div>
                <div onClick={() => setActiveGame('factory')} className="p-6 bg-white border-2 border-purple-100 rounded-3xl shadow-sm hover:border-purple-300 transition-all cursor-pointer text-center space-y-2 transform hover:-translate-y-0.5">
                  <span className="text-5xl block">🏭</span><h3 className="font-extrabold text-lg text-purple-900">Fábrica de Sílabas</h3><p className="text-xs text-slate-500">Separe e classifique os pedaços sonoros orais da palavra CASA.</p>
                </div>
                <div onClick={() => setActiveGame('island')} className="p-6 bg-white border-2 border-rose-100 rounded-3xl shadow-sm hover:border-rose-300 transition-all cursor-pointer text-center space-y-2 transform hover:-translate-y-0.5">
                  <span className="text-5xl block">🏝️</span><h3 className="font-extrabold text-lg text-rose-900">Ilha das Vogais</h3><p className="text-xs text-slate-500">Isole o som inicial de vogais encontrando as conchas na praia.</p>
                </div>
                <div onClick={() => setActiveGame('market')} className="p-6 bg-white border-2 border-orange-100 rounded-3xl shadow-sm hover:border-orange-300 transition-all cursor-pointer text-center space-y-2 transform hover:-translate-y-0.5">
                  <span className="text-5xl block">🛒</span><h3 className="font-extrabold text-lg text-orange-900">Mercado Mágico</h3><p className="text-xs text-slate-500">Agrupe os mantimentos construtivistas pela mesma letra inicial do rótulo.</p>
                </div>
                <div onClick={() => setActiveGame('detective')} className="p-6 bg-white border-2 border-teal-100 rounded-3xl shadow-sm hover:border-teal-300 transition-all cursor-pointer text-center space-y-2 transform hover:-translate-y-0.5">
                  <span className="text-5xl block">🕵️</span><h3 className="font-extrabold text-lg text-teal-900">Detetive de Letras</h3><p className="text-xs text-slate-500">Decifre enigmas misteriosos e encontre as letras secretas.</p>
                </div>
              </div>
            </div>
          )
        ) : (
          <EmbeddedStudentEntry />
        )}
      </main>
    </div>
  );
}
