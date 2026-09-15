import { Button } from '@/components/ui/button';
import { Star, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GameComplete({ onFinish, onPlayAgain, score, total, stars }) {
  const showScore = typeof score === 'number' && typeof total === 'number';
  const showStars = typeof stars === 'number';
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
      <Star className="w-14 h-14 text-amber-400" />
      <h2 className="text-2xl font-extrabold text-violet-700">Muito bem!</h2>
      {showScore && (
        <p className="text-lg font-bold text-violet-800">
          Você acertou {score} de {total}! 🌟
        </p>
      )}
      {showStars && (
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star key={i} className={cn('w-8 h-8', i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')} />
          ))}
        </div>
      )}
      {!showScore && !showStars && <p className="text-muted-foreground">Você concluiu todas as atividades.</p>}
      <div className="flex flex-wrap gap-2 justify-center">
        {onPlayAgain && (
          <Button variant="outline" onClick={onPlayAgain}>
            <RefreshCw className="w-4 h-4 mr-1" /> Jogar de novo
          </Button>
        )}
        <Button onClick={onFinish} className="bg-violet-600 hover:bg-violet-700">
          Voltar aos jogos
        </Button>
      </div>
    </div>
  );
}