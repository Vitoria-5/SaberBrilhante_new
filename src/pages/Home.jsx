import { Link, Navigate } from 'react-router-dom';
import { useStudent } from '@/lib/StudentContext';
import { GraduationCap, Gamepad2, Heart } from 'lucide-react';

export default function Home() {
  const { childMode, student } = useStudent();
  if (childMode && student) return <Navigate to="/jogos" replace />;
  return (
    <div className="space-y-10">
      <section className="text-center py-10">
        <div className="text-5xl mb-3">🧸✨</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-violet-800">Aventura do Saber</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Brincando, a criança aprende e cresce no ritmo dela — com carinho e do jeitinho dela.
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Link to="/professora" className="group rounded-3xl bg-white border border-violet-100 shadow-lg p-6 hover:shadow-xl transition flex flex-col gap-2">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Sou Professora</h2>
          <p className="text-sm text-muted-foreground">Acompanhe os alunos, envie reforços e solicite testes.</p>
          <span className="mt-2 text-violet-700 font-semibold text-sm group-hover:underline">Entrar →</span>
        </Link>

        <Link to="/aluno" className="group rounded-3xl bg-white border border-amber-100 shadow-lg p-6 hover:shadow-xl transition flex flex-col gap-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Sou Aluno</h2>
          <p className="text-sm text-muted-foreground">Entre com seu nome e senha para brincar e aprender.</p>
          <span className="mt-2 text-amber-700 font-semibold text-sm group-hover:underline">Entrar →</span>
        </Link>
      </div>

      <section className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
        <Heart className="w-4 h-4 text-pink-400" /> Feito com carinho para cada fase do aprendizado.
      </section>
    </div>
  );
}