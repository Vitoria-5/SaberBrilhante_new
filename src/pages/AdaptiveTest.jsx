import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '@/lib/StudentContext';
import { base44 } from '@/api/base44Client';
import { ageFromBirth, PHASE_MAP } from '@/lib/phases';
import { pickTestQuestions, evaluateTest } from '@/lib/testData';
import ChoiceGame from '@/components/games/ChoiceGame';
import { Button } from '@/components/ui/button';
import AudioButton from '@/components/AudioButton';
import { Gamepad2, Home } from 'lucide-react';

function buildSummary(name, resultPhase, catStats) {
  const label = PHASE_MAP[resultPhase].short.toLowerCase();
  const entries = Object.entries(catStats);
  const strong = entries.filter(([, v]) => v.right / v.total >= 0.6).map(([k]) => k.toLowerCase());
  const weak = entries.filter(([, v]) => v.right / v.total < 0.5).map(([k]) => k.toLowerCase());
  let s = `${name} está no nível ${label}`;
  const parts = [];
  if (strong.length) parts.push(`já vai bem em ${strong.join(', ')}`);
  if (weak.length) parts.push(`ainda está aprendendo ${weak.join(', ')}`);
  if (parts.length) s += `, pois ${parts.join(' e ')}.`;
  else s += '.';
  return s;
}

export default function AdaptiveTest() {
  const { student, setStudent } = useStudent();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!student) {
      navigate('/aluno');
      return;
    }
    const age = ageFromBirth(student.birth_date);
    setQuestions(pickTestQuestions(age));
  }, [student, navigate]);

  if (!student) return null;
  if (saving) return <div className="py-20 text-center text-muted-foreground">Salvando seu resultado... 💛</div>;
  if (!questions) return <div className="py-20 text-center text-muted-foreground">Preparando seu teste... ✨</div>;

  const handleFinish = async (firstTry) => {
    const padded = questions.map((_, i) => firstTry[i] === true);
    const ev = evaluateTest(questions, padded);
    const summary = buildSummary(student.name, ev.resultPhase, ev.catStats);
    const today = new Date().toISOString().slice(0, 10);
    setSaving(true);
    try {
      await base44.entities.TestResult.create({
        student_id: student.id,
        student_name: student.name,
        test_date: today,
        phase_result: ev.resultPhase,
        score: ev.pct,
        summary,
        details: JSON.stringify(ev.catStats),
      });
      const updated = await base44.entities.Student.update(student.id, {
        phase: ev.resultPhase,
        suggested_phase: ev.resultPhase,
        last_test_date: today,
      });
      setStudent(updated);
    } catch (e) {
      /* still show result */
    } finally {
      setSaving(false);
    }
    setResult({ ...ev, summary });
  };

  if (result) {
    const ph = PHASE_MAP[result.resultPhase];
    return (
      <div className="max-w-xl mx-auto text-center py-10">
        <div className="text-6xl mb-3 animate-bounce">{ph.emoji}</div>
        <h1 className="text-2xl font-extrabold text-violet-800">Descobrimos sua fase!</h1>
        <div className="mt-4 bg-white rounded-3xl shadow-lg p-6 border border-violet-100 text-left">
          <p className="text-lg font-bold text-violet-700">
            {student.name} está no nível <span className="text-violet-900">{ph.label}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">{result.summary}</p>
          <p className="text-sm mt-3 text-slate-700">
            Você acertou <b>{result.correct}</b> de <b>{result.total}</b> — {result.pct}% 🌟
          </p>
          <div className="flex items-center gap-2 mt-4">
            <AudioButton text={result.summary} size="sm" />
            <span className="text-sm text-muted-foreground">Ouça o resultado</span>
          </div>
        </div>
        <div className="flex gap-2 justify-center mt-6">
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => navigate('/jogos')}>
            <Gamepad2 className="w-4 h-4 mr-1" /> Ir jogar!
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-1" /> Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ChoiceGame
      title="Teste de Descoberta ✨"
      intro="Vamos descobrir sua fase do saber!"
      questions={questions}
      onFinish={handleFinish}
      finishLabel="Ver meu resultado 🌟"
    />
  );
}