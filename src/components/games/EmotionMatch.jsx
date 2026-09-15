import { useState } from 'react';
import EmotionGame from './EmotionGame';

const OPTIONS = [
  { label: 'Feliz', emoji: '😄' },
  { label: 'Triste', emoji: '😢' },
  { label: 'Bravo', emoji: '😠' },
  { label: 'Com medo', emoji: '😱' },
  { label: 'Calmo', emoji: '😌' },
  { label: 'Cansado', emoji: '😴' },
];

const POOL = [
  { prompt: 'Se você ganhasse uma caixinha de surpresa agora, qual carinha você faria?', emoji: '🎁' },
  { prompt: 'Quando a professora diz que já pode ir brincar...', emoji: '🛝' },
  { prompt: 'Se um amiguinho não quis brincar com você hoje...', emoji: '🧍' },
  { prompt: 'Na hora de guardar todos os brinquedos...', emoji: '🧹' },
  { prompt: 'Quando chega a hora de dormir e apagam a luz...', emoji: '🌙' },
  { prompt: 'Se você ganhasse um abraço apertado de alguém especial...', emoji: '🤗' },
  { prompt: 'Quando a comida que você não gosta está no prato...', emoji: '🍽️' },
  { prompt: 'Se você visse um arco-íris lindo lá fora...', emoji: '🌈' },
  { prompt: 'Quando alguém divide o brinquedo favorito com você...', emoji: '🧸' },
  { prompt: 'Se você caísse e machucasse o joelhinho...', emoji: '🩹' },
].map((q) => ({ ...q, options: OPTIONS }));

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

export default function EmotionMatch({ phase, onFinish, onPlayAgain }) {
  const questions = useState(() => shuffle(POOL).slice(0, 4))[0];
  return <EmotionGame questions={questions} phase={phase} onFinish={onFinish} onPlayAgain={onPlayAgain} />;
}