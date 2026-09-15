import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '@/lib/StudentContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import AudioButton from '@/components/AudioButton';
import { cn } from '@/lib/utils';
import { stripEmojis } from '@/lib/sanitize';
import { Heart, Save } from 'lucide-react';

const FEELINGS = [
  { key: 'feliz', emoji: '😄', label: 'Feliz' },
  { key: 'triste', emoji: '😢', label: 'Triste' },
  { key: 'bravo', emoji: '😠', label: 'Bravo' },
  { key: 'medo', emoji: '😱', label: 'Com medo' },
  { key: 'calmo', emoji: '😌', label: 'Calmo' },
  { key: 'cansado', emoji: '😴', label: 'Cansado' },
];

export default function SobreMim() {
  const { student, setStudent, speak } = useStudent();
  const navigate = useNavigate();
  const [feeling, setFeeling] = useState(null);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!student) navigate('/aluno');
  }, [student, navigate]);

  if (!student) return null;

  const save = async () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const feelingLabel = feeling ? FEELINGS.find((f) => f.key === feeling).label : '';
    const full = stripEmojis(`${feelingLabel}. ${text}`);
    try {
      const updated = await base44.entities.Student.update(student.id, { feeling: full, feeling_date: todayIso });
      setStudent(updated);
      setSaved(true);
      speak('Prontinho! Seu sentimento foi guardado com carinho.');
    } catch (e) {
      speak('Algo deu errado. Tente de novo.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 space-y-5">
      <div className="text-center">
        <div className="text-5xl mb-2">💛</div>
        <h1 className="text-2xl font-extrabold text-violet-800">Sobre Mim</h1>
        <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center gap-2">
          Como você está se sentindo hoje? Conte para a gente.
          <AudioButton text="Sobre mim. Como você está se sentindo hoje? Conte para a gente." size="sm" />
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100 space-y-5">
        <div>
          <p className="font-semibold text-violet-800 mb-3">Escolha a carinha que combina com você:</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FEELINGS.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFeeling(f.key); speak(`Você está ${f.label.toLowerCase()}.`); }}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition',
                  feeling === f.key ? 'border-violet-500 bg-violet-50 scale-105' : 'border-violet-100 hover:bg-violet-50'
                )}
              >
                <span className="text-3xl">{f.emoji}</span>
                <span className="text-xs font-semibold text-slate-700">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-violet-800 mb-2">Como foi o seu dia? Escreva ou peça para ouvir:</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Hoje eu brinquei, comi... e me senti..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none resize-none"
          />
          <div className="flex items-center gap-2 mt-2">
            <AudioButton text="Escreva como foi o seu dia. Se quiser, aperte para ouvir." size="sm" />
            <span className="text-xs text-muted-foreground">O áudio lê para você.</span>
          </div>
        </div>

        <Button onClick={save} className="w-full bg-violet-600 hover:bg-violet-700 py-6 text-lg">
          <Save className="w-5 h-5 mr-2" /> Guardar meu sentimento
        </Button>

        {saved && (
          <p className="text-center text-green-600 font-semibold flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4" /> Guardado com carinho!
          </p>
        )}

        {student.feeling && (
          <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800">
            <b>Último registro:</b> {stripEmojis(student.feeling)}
          </div>
        )}
      </div>
    </div>
  );
}