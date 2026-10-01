import { useState, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lista oficial de perguntas sobre emoções extraídas do seu projeto
const EMOTION_QUESTIONS = [
  { prompt: 'Mostre a carinha feliz!', emoji: '😄', options: [{ label: 'Feliz', emoji: '😄' }, { label: 'Triste', emoji: '😢' }, { label: 'Bravo', emoji: '😠' }], correct: 0 },
  { prompt: 'Quando a gente leva um susto, como fica?', emoji: '😱', options: [{ label: 'Com medo', emoji: '😱' }, { label: 'Feliz', emoji: '😄' }, { label: 'Com sono', emoji: '😴' }], correct: 0 },
  { prompt: 'Se a criança ganha um presente, como ela fica?', emoji: '🎁', options: [{ label: 'Feliz', emoji: '😄' }, { label: 'Brava', emoji: '😠' }, { label: 'Com medo', emoji: '😱' }], correct: 0 }
];

export default function EmotionsGame({ onFinish }) {
  const { student, speak } = useStudent();
  const [currentStep, setCurrentStep] = useState(0); // Controla qual pergunta está passando
  const [textFeeling, setTextFeeling] = useState(''); // Guarda o texto digitado pela criança
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState([]); // Guarda as respostas das carinhas

  const isAudioBlocked = student?.audio_blocked || false;

  useEffect(() => {
    if (!isAudioBlocked) {
      speak('Como você está hoje? Digite na caixinha e responda às perguntas sobre as carinhas.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Guarda a resposta da pergunta atual e passa para a próxima ou vai para a escrita
  const handleSelectOption = (option) => {
    const updatedAnswers = [...answers, `${EMOTION_QUESTIONS[currentStep].emoji} ${option.label}`];
    setAnswers(updatedAnswers);

    if (!isAudioBlocked) {
      if (option.label === 'Feliz' || option.label === 'Com medo') {
        speak('Muito bem! Você acertou!');
      } else {
        speak('Obrigado por responder!');
      }
    }

    // Avança para o próximo passo (pergunta ou escrita de texto)
    setCurrentStep((prev) => prev + 1);
  };

  // Junta as respostas das carinhas com o texto digitado e manda para a professora
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const currentData = localStorage.getItem('saber_brilhante_alunos');
      let list = currentData ? JSON.parse(currentData) : [];

      // Monta o resumo detalhado do humor e respostas da criança
      const carinhasRespondidas = answers.join(', ');
      const textoDigitado = textFeeling.trim() ? `• Relato: "${textFeeling.trim()}"` : '';
      const resumoFinal = `Respostas: [${carinhasRespondidas}] ${textoDigitado}`;

      list = list.map((s) => {
        if (s.id === student.id) {
          return {
            ...s,
            feeling: resumoFinal
          };
        }
        return s;
      });

      localStorage.setItem('saber_brilhante_alunos', JSON.stringify(list));
      setDone(true);

      if (!isAudioBlocked) {
        speak('Que maravilhoso! Tudo o que você escreveu e respondeu já foi enviado para a sua professora!');
      }
    } catch (error) {
      console.error("Erro ao salvar sentimentos completos:", error);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">🌟</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Atividade Concluída!</h2>
        <p className="text-muted-foreground">Suas carinhas e seu texto foram enviados para o painel da professora.</p>
        <Button onClick={onFinish} className="bg-violet-600 hover:bg-violet-700 mt-2">
          Voltar aos jogos
        </Button>
      </div>
    );
  }
  // Se ainda houver perguntas na lista, mostra o jogo de carinhas
  if (currentStep < EMOTION_QUESTIONS.length) {
    const question = EMOTION_QUESTIONS[currentStep];
    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-violet-800">Carinhas e Sentimentos {question.emoji}</h2>
            <p className="text-sm text-muted-foreground">{question.prompt}</p>
          </div>
          <button 
            onClick={() => { if (!isAudioBlocked) speak(question.prompt); }}
            disabled={isAudioBlocked}
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition",
              isAudioBlocked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-violet-100 text-violet-700 hover:bg-violet-200"
            )}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                className="p-4 rounded-2xl border-2 border-violet-100 hover:border-violet-500 font-bold transition transform hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center gap-4 text-left text-slate-700 hover:bg-violet-50"
              >
                <span className="text-4xl">{option.emoji}</span>
                <span className="text-lg">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tela final após as perguntas: Caixa de texto para digitação da criança
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Agora conte para mim 📝</h2>
          <p className="text-sm text-muted-foreground">Escreva na caixinha como você está se sentindo hoje!</p>
        </div>
        <button 
          onClick={() => { if (!isAudioBlocked) speak('Escreva na caixinha como você está se sentindo hoje!'); }}
          disabled={isAudioBlocked}
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition",
            isAudioBlocked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-violet-100 text-violet-700 hover:bg-violet-200"
          )}
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 border border-violet-100 space-y-4">
        <textarea
          value={textFeeling}
          onChange={(e) => setTextFeeling(e.target.value)}
          placeholder="Estou muito feliz hoje porque ganhei um jogo novo e brinquei na escola..."
          rows={4}
          className="w-full px-4 py-3 rounded-2xl border-2 border-violet-100 focus:border-violet-500 outline-none text-slate-700 resize-none"
        />

        <Button 
          onClick={handleSaveAll} 
          disabled={saving} 
          className="w-full bg-violet-600 hover:bg-violet-700 font-bold h-12 rounded-2xl text-base"
        >
          <Send className="w-4 h-4 mr-2" /> {saving ? 'Enviando...' : 'Enviar para a Professora'}
        </Button>
      </div>
    </div>
  );
}
