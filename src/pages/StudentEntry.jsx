import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStudent } from '@/lib/StudentContext';
import { ageFromBirth, expectedPhaseForAge } from '@/lib/phases'; // Reativado as funções de idade!
import { Button } from '@/components/ui/button';
import BirthDateInput from '@/components/BirthDateInput';
import AudioButton from '@/components/AudioButton';
import { User, Lock, Calendar, GraduationCap, Sparkles, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const getLocalStudents = () => {
  const data = localStorage.getItem('saber_brilhante_alunos');
  return data ? JSON.parse(data) : [];
};

const saveLocalStudents = (students) => {
  localStorage.setItem('saber_brilhante_alunos', JSON.stringify(students));
};

export default function StudentEntry() {
  const { setStudent, setChildMode } = useStudent();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [birth, setBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const enter = (s) => {
    setStudent(s);
    if (typeof setChildMode === 'function') setChildMode(true);
    navigate('/jogos');
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    const formattedName = name.trim().toUpperCase();

    if (!formattedName || !password) {
      setErr('Preencha seu nome e sua senha.');
      return;
    }

    setLoading(true);
    const studentsList = getLocalStudents();

    if (mode === 'register') {
      if (!birth) {
        setErr('Escolha o dia, o mês e o ano do seu nascimento.');
        setLoading(false);
        return;
      }
      if (password.length < 3) {
        setErr('A senha precisa ter pelo menos 3 letras ou números.');
        setLoading(false);
        return;
      }
      if (password !== confirm) {
        setErr('As senhas não estão iguais.');
        setLoading(false);
        return;
      }

      const existing = studentsList.find(s => s.name === formattedName);
      if (existing) {
        setErr('Esse nome já existe. Faça login com sua senha.');
        setLoading(false);
        return;
      }

      // CONTA DA IDADE LOCAL:
      // O sistema lê o aniversário escolhido no calendário, calcula a idade e puxa a fase esperada
      const age = ageFromBirth(birth);
      const expectedPhase = expectedPhaseForAge(age);
      const definida = expectedPhase?.key || 'garatuja';

      const newStudent = {
        id: 'aluno-' + Date.now(),
        name: formattedName,
        password: password,
        birth_date: birth,
        phase: definida // Salva a fase exata correspondente à idade!
      };

      studentsList.push(newStudent);
      saveLocalStudents(studentsList);
      
      setTimeout(() => {
        setLoading(false);
        enter(newStudent);
      }, 500);
      return;
    }

    // Fluxo de LOGIN Local
    const foundStudent = studentsList.find(s => s.name === formattedName);

    setTimeout(() => {
      setLoading(false);
      if (!foundStudent) {
        setErr('Nome não encontrado. Cadastre-se no primeiro acesso.');
        return;
      }

      if (foundStudent.password === password) {
        enter(foundStudent);
      } else {
        setErr('Senha incorreta. Tente de novo.');
      }
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🧸</div>
        <h1 className="text-2xl font-extrabold text-violet-800">Oi! Vamos brincar?</h1>
        <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center gap-2">
          Entre com seu nome e sua senha.
          <AudioButton text="Oi! Vamos brincar? Entre com seu nome e sua senha. Se for seu primeiro acesso, cadastre-se." size="sm" />
        </p>
      </div>

      <div className="flex gap-2 mb-4 bg-violet-50 p-1 rounded-full">
        <button type="button" onClick={() => { setMode('login'); setErr(null); }} className={cn('flex-1 py-2 rounded-full text-sm font-bold transition', mode === 'login' ? 'bg-white text-violet-700 shadow' : 'text-violet-500')}>Entrar</button>
        <button type="button" onClick={() => { setMode('register'); setErr(null); }} className={cn('flex-1 py-2 rounded-full text-sm font-bold transition', mode === 'register' ? 'bg-white text-violet-700 shadow' : 'text-violet-500')}>Cadastrar</button>
      </div>

      <form onSubmit={submit} className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100 space-y-4">
        <div>
          <label className="text-sm font-semibold text-violet-800 flex items-center gap-1.5 mb-1.5"><User className="w-4 h-4" /> Seu nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria" className="w-full px-4 py-3 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none" />
        </div>
        <div>
          <label className="text-sm font-semibold text-violet-800 flex items-center gap-1.5 mb-1.5"><Lock className="w-4 h-4" /> Sua senha</label>
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha secreta" className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none" />
            <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-500 hover:text-violet-700" tabIndex={-1}>{showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
          </div>
        </div>

        {mode === 'register' && (
          <>
            <div>
              <label className="text-sm font-semibold text-violet-800 flex items-center gap-1.5 mb-1.5"><Lock className="w-4 h-4" /> Repita a senha</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a senha" className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none" />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-500 hover:text-violet-700" tabIndex={-1}>{showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-violet-800 flex items-center gap-1.5 mb-1.5"><Calendar className="w-4 h-4" /> Quando você nasceu?</label>
              <BirthDateInput value={birth} onChange={setBirth} />
            </div>
          </>
        )}

        {err && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-2">{err}</p>}
        <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-lg py-6">{loading ? 'Preparando...' : mode === 'login' ? <span className="flex items-center justify-center gap-1.5"><Sparkles className="w-5 h-5" /> Entrar</span> : 'Cadastrar e brincar! ✨'}</Button>
      </form>
      <div className="text-center mt-4"><Link to="/professora" className="inline-flex items-center gap-1.5 text-sm text-violet-600 font-semibold hover:underline"><GraduationCap className="w-4 h-4" /> Sou professora</Link></div>
    </div>
  );
}
