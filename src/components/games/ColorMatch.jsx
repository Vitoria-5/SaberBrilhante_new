import { useState } from 'react';
import ChoiceGame from './ChoiceGame';

const POOL = [
  { category: 'Cores', prompt: 'Qual cor é o sol?', emoji: '☀️', options: [{ label: 'Amarelo', color: '#FCD34D' }, { label: 'Vermelho', color: '#EF4444' }, { label: 'Azul', color: '#3B82F6' }], correct: 0, explanation: 'Olhe para o céu num dia de sol. Qual cor você vê brilhando lá em cima?', praise: 'Lindo! Você acertou!' },
  { category: 'Cores', prompt: 'Qual cor é a grama?', emoji: '🌱', options: [{ label: 'Verde', color: '#22C55E' }, { label: 'Rosa', color: '#EC4899' }, { label: 'Preto', color: '#111827' }], correct: 0, explanation: 'Olhe para o jardim. Que cor tem as plantinhas?' },
  { category: 'Cores', prompt: 'Qual cor é o céu de dia?', emoji: '🌤️', options: [{ label: 'Azul', color: '#3B82F6' }, { label: 'Verde', color: '#22C55E' }, { label: 'Laranja', color: '#F97316' }], correct: 0, explanation: 'Olhe para cima num dia limpo. Que cor você vê?' },
  { category: 'Cores', prompt: 'Qual cor é o morango?', emoji: '🍓', options: [{ label: 'Vermelho', color: '#EF4444' }, { label: 'Amarelo', color: '#FCD34D' }, { label: 'Roxo', color: '#8B5CF6' }], correct: 0, explanation: 'Pense no morango bem maduro. Que cor ele tem?' },
  { category: 'Cores', prompt: 'Qual cor é a uva?', emoji: '🍇', options: [{ label: 'Roxo', color: '#8B5CF6' }, { label: 'Verde', color: '#22C55E' }, { label: 'Azul', color: '#3B82F6' }], correct: 0, explanation: 'Lembre da uva. Que cor ela tem?' },
  { category: 'Cores', prompt: 'Qual cor é a cenoura?', emoji: '🥕', options: [{ label: 'Laranja', color: '#F97316' }, { label: 'Vermelho', color: '#EF4444' }, { label: 'Branco', color: '#F9FAFB' }], correct: 0, explanation: 'Lembre da cenoura. Que cor ela tem?' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

export default function ColorMatch({ phase, onFinish, onPlayAgain }) {
  const questions = useState(() => shuffle(POOL).slice(0, 5))[0];
  return <ChoiceGame title="Cores Mágicas 🌈" intro="Vamos brincar com as cores!" questions={questions} onFinish={onFinish} onPlayAgain={onPlayAgain} />;
}