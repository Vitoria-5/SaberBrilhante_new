import { useState, useRef, useEffect } from 'react';
import { useStudent } from '@/lib/StudentContext';
import { Button } from '@/components/ui/button';
import { Volume2, Trash2, Save, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const WRITING_PHASES = ['silabico_alfabetica', 'alfabetica'];
const COLORS = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#000000', '#6d4c41', '#8e24aa', '#fb8c00'];

export default function DrawingGame({ phase, onFinish, onPlayAgain }) {
  const { student, speak, audioBlocked } = useStudent();
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const canWrite = WRITING_PHASES.includes(phase);

  useEffect(() => {
    speak('Que legal! Vamos desenhar? Desenhe o que você quiser.');
    initCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const pos = (e) => {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (c.width / rect.width),
      y: (e.clientY - rect.top) * (c.height / rect.height),
    };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    initCanvas();
  };

  const save = async () => {
    setSaving(true);
    try {
      const blob = await new Promise((res) => canvasRef.current.toBlob(res, 'image/png'));
      const file = new File([blob], 'desenho.png', { type: 'image/png' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const rec = await base44.entities.Drawing.create({
        student_id: student.id,
        student_name: student.name,
        image_url: file_url,
        student_comment: canWrite ? comment.trim() : '',
      });
      try {
        await base44.functions.invoke('analyzeDrawing', { drawing_id: rec.id });
      } catch {
        /* ignore */
      }
      setDone(true);
      speak('Que desenho lindo! Obrigada por desenhar!');
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="text-6xl">🎨</div>
        <h2 className="text-2xl font-extrabold text-violet-700">Que desenho lindo!</h2>
        <p className="text-muted-foreground">Sua professora vai adorar ver sua arte.</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {onPlayAgain && (
            <Button variant="outline" onClick={onPlayAgain}>
              <RefreshCw className="w-4 h-4 mr-1" /> Desenhar de novo
            </Button>
          )}
          <Button onClick={onFinish} className="bg-violet-600 hover:bg-violet-700">Voltar aos jogos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-extrabold text-violet-800">Desenho Livre 🎨</h2>
          <p className="text-sm text-muted-foreground">Desenhe o que você quiser!</p>
        </div>
        <button onClick={() => speak('Desenhe o que você quiser. Use as cores e divirta-se!')} disabled={audioBlocked} className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 flex items-center justify-center">
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-4 border border-violet-100 space-y-3">
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn('w-9 h-9 rounded-full border-2 transition', color === c ? 'border-violet-700 scale-110' : 'border-white shadow')}
              style={{ background: c }}
              title="Escolher cor"
            />
          ))}
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={520}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="w-full rounded-2xl border-2 border-violet-100 bg-white touch-none"
          style={{ touchAction: 'none' }}
        />

        {canWrite && (
          <div>
            <p className="text-sm font-semibold text-violet-800 mb-1">Quer contar sobre seu desenho? (opcional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Pode escrever sobre o que você desenhou..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border-2 border-violet-100 focus:border-violet-500 outline-none resize-none"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={clear} className="flex-1">
            <Trash2 className="w-4 h-4 mr-1" /> Limpar
          </Button>
          <Button onClick={save} disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700">
            <Save className="w-4 h-4 mr-1" /> {saving ? 'Salvando...' : 'Salvar desenho'}
          </Button>
        </div>
      </div>
    </div>
  );
}