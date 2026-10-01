import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Sparkles, LogIn } from 'lucide-react';

// BANCO DE DADOS FIXO DE LOGIN DE REDE - TODOS CONFIGURADOS EM PRÉ-SILÁBICA POR PADRÃO
const NETWORK_STUDENTS = [
  { id: 'aluno-1', name: 'Amaya Santos Sepulveda', password: '123', phase: 'pre_silabica', birth_date: '2019-03-15' },
  { id: 'aluno-2', name: 'Angelo Ciccillo Gomes Cogliatti', password: '123', phase: 'pre_silabica', birth_date: '2019-06-22' },
  { id: 'aluno-3', name: 'Anna Alice Pereira Sena', password: '123', phase: 'pre_silabica', birth_date: '2019-01-10' },
  { id: 'aluno-4', name: 'Anthony Rezende Sant Anna', password: '123', phase: 'pre_silabica', birth_date: '2019-08-05' },
  { id: 'aluno-5', name: 'Anthony Zaia Carvelli', password: '123', phase: 'pre_silabica', birth_date: '2019-09-12' },
  { id: 'aluno-6', name: 'Arthur Miguel Cáceres dos Santos', password: '123', phase: 'pre_silabica', birth_date: '2019-04-18' },
  { id: 'aluno-7', name: 'Benício Maia Ferreira', password: '123', phase: 'pre_silabica', birth_date: '2019-11-25' },
  { id: 'aluno-8', name: 'Benício Zaia Carvelli', password: '123', phase: 'pre_silabica', birth_date: '2019-02-14' },
  { id: 'aluno-9', name: 'Benjamim Sales Cabral', password: '123', phase: 'pre_silabica', birth_date: '2019-07-30' },
  { id: 'aluno-10', name: 'Benjamin Luz Araujo', password: '123', phase: 'pre_silabica', birth_date: '2019-05-02' },
  { id: 'aluno-11', name: 'Bernardo Alves Mathias de Oliveira', password: '123', phase: 'pre_silabica', birth_date: '2019-10-09' },
  { id: 'aluno-12', name: 'Brendha Araujo Marcondes', password: '123', phase: 'pre_silabica', birth_date: '2019-12-01' },
  { id: 'aluno-13', name: 'Cecília Gomes Bezerra', password: '123', phase: 'pre_silabica', birth_date: '2019-03-24' },
  { id: 'aluno-14', name: 'Cecília Raiol Selbach', password: '123', phase: 'pre_silabica', birth_date: '2019-05-14' },
  { id: 'aluno-15', name: 'Cecília Ziemba Vera Sarraipa Brescancin', password: '123', phase: 'pre_silabica', birth_date: '2019-07-19' },
  { id: 'aluno-16', name: 'Davi de Souza Belentani Teixeira', password: '123', phase: 'pre_silabica', birth_date: '2019-01-28' },
  { id: 'aluno-17', name: 'Davi Souza Ventura', password: '123', phase: 'pre_silabica', birth_date: '2019-08-11' },
  { id: 'aluno-18', name: 'Emanuelly Gomes Correia', password: '123', phase: 'pre_silabica', birth_date: '2019-11-03' },
  { id: 'aluno-19', name: 'Gabriel Henrique da Silva Barros', password: '123', phase: 'pre_silabica', birth_date: '2019-09-27' },
  { id: 'aluno-20', name: 'Helena Ferreira Serra', password: '123', phase: 'pre_silabica', birth_date: '2019-04-05' },
  { id: 'aluno-21', name: 'Heloísa Troiani Costa', password: '123', phase: 'pre_silabica', birth_date: '2019-06-15' },
  { id: 'aluno-22', name: 'Henrique Fernandes Inoue Hamada', password: '123', phase: 'pre_silabica', birth_date: '2019-10-21' },
  { id: 'aluno-23', name: 'Isaque Ferreira Sansão', password: '123', phase: 'pre_silabica', birth_date: '2019-02-09' },
  { id: 'aluno-24', name: 'Liz Farina Dias', password: '123', phase: 'pre_silabica', birth_date: '2019-03-31' },
  { id: 'aluno-25', name: 'Lorena Vitoria Bispo Sales Pereira', password: '123', phase: 'pre_silabica', birth_date: '2019-07-04' },
  { id: 'aluno-26', name: 'Maria Alice Lima de Souza', password: '123', phase: 'pre_silabica', birth_date: '2019-05-20' },
  { id: 'aluno-27', name: 'Maria Clara Vilhalba Lima Ferreira', password: '123', phase: 'pre_silabica', birth_date: '2019-08-29' },
  { id: 'aluno-28', name: 'Mariah Zinezzi Albuquerque Alves', password: '123', phase: 'pre_silabica', birth_date: '2019-12-14' },
  { id: 'aluno-29', name: 'Paola Bezerra de Oliveira', password: '123', phase: 'pre_silabica', birth_date: '2019-01-05' },
  { id: 'aluno-30', name: 'Pedro Henrique Lopes da Silva', password: '123', phase: 'pre_silabica', birth_date: '2019-10-12' },
  { id: 'aluno-31', name: 'Sofia Cochi Oliveira', password: '123', phase: 'pre_silabica', birth_date: '2019-04-23' },
  { id: 'aluno-32', name: 'Tainá Cochi Oliveira', password: '123', phase: 'pre_silabica', birth_date: '2019-04-23' },
  { id: 'aluno-33', name: 'Helena Oliveira Marques', password: '123', phase: 'pre_silabica', birth_date: '2019-09-02' },
  { id: 'aluno-34', name: 'Lunna Catarina dos Santos', password: '123', phase: 'pre_silabica', birth_date: '2019-06-08' }
];

export default function StudentEntry() {
  const { loginStudent, speak } = useStudent();
  const [selectedName, setSelectedName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    speak('Olá! Escolha o seu nome na lista e digite a sua senha para começar a jogar!');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedName) {
      setError('Por favor, selecione o seu nome na lista.');
      return;
    }

    const found = NETWORK_STUDENTS.find(
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
      loginStudent(fullStudentData);
      speak(`Bem-vindo, ${found.name}! Vamos brincar!`);
    } else {
      setError('Senha incorreta para este aluno.');
      speak('Ops, a senha está incorreta. Tente de novo!');
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
              {NETWORK_STUDENTS.map((s) => (
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
