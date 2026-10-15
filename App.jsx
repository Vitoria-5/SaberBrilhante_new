import { useStudent } from './main.jsx';
import StudentEntry from './src/Pages/StudentEntry.jsx';
import GamesHub from './src/Pages/GamesHub.jsx';
import TeacherDashboard from './src/Pages/TeacherDashboard.jsx';
import { GraduationCap, Gamepad2, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function App() {
  const { student, exitChildMode } = useStudent() || {};
  const [view, setView] = useState('aluno');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* BARRA SUPERIOR DE NAVEGAÇÃO INTEGRADA */}
      <header className="bg-white border-b border-violet-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => setView('aluno')} 
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black text-lg">
              A
            </div>
            <span className="font-black text-xl tracking-tight text-violet-700">
              AVENTURA DO SABER
            </span>
          </button>

          <nav className="flex items-center gap-3">
            <button
              onClick={() => setView('aluno')}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer border-none transition ${
                view === 'aluno' ? 'bg-violet-600 text-white shadow-sm' : 'bg-transparent text-slate-600'
              }`}
            >
              <Gamepad2 className="w-4 h-4" /> JOGAR
            </button>

            <button
              onClick={() => setView('professor')}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer border-none transition ${
                view === 'professor' ? 'bg-violet-600 text-white shadow-sm' : 'bg-transparent text-slate-600'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> PROFESSORA
            </button>

            {student && (
              <button 
                onClick={exitChildMode}
                className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer border border-red-200 text-red-600 bg-white ml-1"
              >
                <LogOut className="w-4 h-4" /> SAIR ({student.name})
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* CHAVEADOR DE TELAS INDESTRUTÍVEL */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'professor' ? (
          <TeacherDashboard />
        ) : student ? (
          <GamesHub />
        ) : (
          <StudentEntry />
        )}
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t bg-white">
        &copy; {new Date().getFullYear()} Aventura do Saber
      </footer>
    </div>
  );
}
