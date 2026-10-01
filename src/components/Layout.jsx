import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Home, GraduationCap, Gamepad2, Heart, LogOut } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';
import { PHASE_MAP } from '@/lib/phases';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

export default function Layout() {
  const { student, setStudent, childMode, exitChildMode } = useStudent();
  const loc = useLocation();
  const navigate = useNavigate();
  const [confirmExit, setConfirmExit] = useState(false);

  useEffect(() => {
    if (!student?.id) return;
    try {
      const data = localStorage.getItem('saber_brilhante_alunos');
      if (data) {
        const list = JSON.parse(data);
        const fresh = list.find((x) => x.id === student.id);
        if (fresh) {
          setStudent(fresh);
        }
      }
    } catch (e) {
      console.error("Erro ao sincronizar dados locais no Layout:", e);
    }
  }, [loc.pathname]);

  const nav = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/professora', label: 'Professora', icon: GraduationCap },
    { to: '/jogos', label: 'Jogar', icon: Gamepad2 },
    { to: '/sobre-mim', label: 'Sobre Mim', icon: Heart },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-violet-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-violet-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-violet-700">
            <Sparkles className="w-5 h-5" />
            <span>Aventura do Saber</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            {nav.map((n) => {
              const active = loc.pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition',
                    active ? 'bg-violet-600 text-white shadow' : 'text-violet-700 hover:bg-violet-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{n.label}</span>
                </Link>
              );
            })}
            {childMode && (
              <button
                onClick={() => setConfirmExit(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition"
                title="Sair do modo criança"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
          </nav>
          {student && (
            <span className="ml-2 hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
              {PHASE_MAP[student.phase]?.emoji || '🧸'} {student.name}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <AlertDialog open={confirmExit} onOpenChange={setConfirmExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription>Você vai voltar para a tela de entrada e precisar colocar seu nome e senha de novo. Tem certeza?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { if (typeof exitChildMode === 'function') exitChildMode(); navigate('/aluno'); }}>Sim, sair</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
