import { useState, useEffect } from 'react';
import { useStudent } from '../../main.jsx';
import { Button } from '@/components/ui/button';
import { Sparkles, LogIn } from 'lucide-react';

export default function StudentEntry() {
  const { loginStudent, speak } = useStudent() || {};
  const [studentsList, setStudentsList] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('saber_brilhante_alunos');
    if (stored) {
      setStudentsList(JSON.parse(stored));
    }
    if (speak) {
      speak('Olá! Escolha o seu nome na lista e digite a sua senha para começar a jogar!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedName) {
      setError('Por favor, selecione o seu nome na lista.');
      return;
    }

    const found = studentsList.find(
      (s) => s.name === selectedName && s.password === password.trim()
    );

    if (found) {
      setError(null);
      const fullStudentData = {
        ...found,
        audio_blocked: false,
        feeling: '',
        drawings: [],
        difficulties: []
      };
      if (loginStudent) loginStudent(fullStudentData);
      if (speak) speak(`Bem-vindo, ${found.name}! Vamos brincar!`);
    } else {
      setError('Senha incorreta para este aluno.');
      if (speak) speak('Ops, a senha está incorreta. Tente de novo!');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl border border-violet-100 shadow-xl p-8 space-y-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400" />
        
        <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-violet-800 tracking-wide">Portal do Aluno 🧸</h1>
          <p className="text-sm text-muted-foreground mt-1">Selecione seu nome e digite sua senha de acesso</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-violet-700 tracking-wider uppercase block ml-1">Seu Nome</label>
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none text-slate-700 bg-white font-medium text-sm sm:text-base cursor-pointer"
            >
              <option value="">-- Clique para escolher seu nome --</option>
              {studentsList.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-violet-700 tracking-wider uppercase block ml-1">Sua Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none text-center font-bold tracking-widest text-lg transition"
            />
          </div>

          {error && (
            <p className="text-sm text-center font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 font-extrabold h-12 rounded-xl text-base shadow flex items-center justify-center gap-2 mt-2">
            <LogIn className="w-5 h-5" /> Entrar no Jogo
          </Button>
        </form>
      </div>
    </div>
  );
}
