import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AudioButton({ text, size = 'md' }) {
  const [playing, setPlaying] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      // Se já estiver falando, para a voz
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR'; // Força a falar em português do Brasil!
      utterance.rate = 1.0;     // Velocidade normal da fala

      utterance.onstart = () => setPlaying(true);
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Seu navegador não suporta áudio de leitura automática. 😢");
    }
  };

  return (
    <button
      type="button"
      onClick={speak}
      className={`p-2 rounded-full transition shadow-sm ${
        playing ? 'bg-amber-500 text-white animate-pulse' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
      } ${size === 'sm' ? 'p-1.5' : 'p-2'}`}
      title="Ouvir áudio"
    >
      {playing ? (
        <VolumeX className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      ) : (
        <Volume2 className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      )}
    </button>
  );
}
