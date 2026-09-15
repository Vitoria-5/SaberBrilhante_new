import { Volume2, VolumeX, Square } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';
import { cn } from '@/lib/utils';

export default function AudioButton({ text, className, size = 'md' }) {
  const { speak, stop, isSpeaking, audioBlocked, muted, toggleMute } = useStudent();
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const stopSize = size === 'sm' ? 'w-3 h-3 fill-current' : 'w-4 h-4 fill-current';

  const play = () => {
    if (audioBlocked || muted) return;
    if (isSpeaking) stop();
    else speak(text);
  };

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={play}
        disabled={audioBlocked || muted}
        title={muted ? 'Som desligado' : isSpeaking ? 'Parar' : 'Ouvir novamente'}
        aria-label="Ouvir"
        className={cn(
          'inline-flex items-center justify-center rounded-full transition shadow-sm',
          size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
          audioBlocked
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : muted
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isSpeaking
            ? 'bg-red-100 text-red-600 hover:bg-red-200 active:scale-95'
            : 'bg-violet-100 text-violet-700 hover:bg-violet-200 active:scale-95'
        )}
      >
        {audioBlocked ? (
          <VolumeX className={iconSize} />
        ) : isSpeaking ? (
          <Square className={stopSize} />
        ) : (
          <Volume2 className={iconSize} />
        )}
      </button>
      <button
        type="button"
        onClick={toggleMute}
        disabled={audioBlocked}
        title={muted ? 'Ligar o som' : 'Desligar o som'}
        aria-label="Ligar ou desligar o som"
        className={cn(
          'inline-flex items-center justify-center rounded-full transition',
          size === 'sm' ? 'w-7 h-7' : 'w-8 h-8',
          audioBlocked
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : muted
            ? 'bg-red-100 text-red-600 hover:bg-red-200 active:scale-95'
            : 'bg-violet-50 text-violet-500 hover:bg-violet-100 active:scale-95'
        )}
      >
        {muted ? <Volume2 className={iconSize} /> : <VolumeX className={iconSize} />}
      </button>
    </div>
  );
}