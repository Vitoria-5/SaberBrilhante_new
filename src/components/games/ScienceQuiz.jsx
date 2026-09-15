import { useState } from 'react';
import ChoiceGame from './ChoiceGame';

const POOL = [
  { category: 'Ciência', prompt: 'Em qual planeta nós vivemos?', emoji: '🌍', options: [{ label: 'Terra', emoji: '🌍' }, { label: 'Marte', emoji: '🔴' }, { label: 'Lua', emoji: '🌙' }], correct: 0, explanation: 'Pense no planeta azul onde tem água e vida.', praise: 'Cientista esperta!' },
  { category: 'Ciência', prompt: 'Do que as plantas precisam para crescer?', emoji: '🌱', options: [{ label: 'Água e sol', emoji: '💧☀️' }, { label: 'Chocolate', emoji: '🍫' }, { label: 'Gelo', emoji: '🧊' }], correct: 0, explanation: 'Lembre do que as plantinhas precisam para crescer bonitas.' },
  { category: 'Ciência', prompt: 'Onde os peixes vivem?', emoji: '🐟', options: [{ label: 'Na água', emoji: '🌊' }, { label: 'No deserto', emoji: '🏜️' }, { label: 'No céu', emoji: '☁️' }], correct: 0, explanation: 'Pense onde os peixinhos nadam felizes.' },
  { category: 'Ciência', prompt: 'O que o sol nos dá de dia?', emoji: '☀️', options: [{ label: 'Luz e calor', emoji: '🌞' }, { label: 'Frio', emoji: '🥶' }, { label: 'Chuva', emoji: '🌧️' }], correct: 0, explanation: 'Lembre o que o sol nos dá durante o dia.' },
  { category: 'Ciência', prompt: 'Qual animal põe ovos?', emoji: '🥚', options: [{ label: 'Galinha', emoji: '🐔' }, { label: 'Cachorro', emoji: '🐶' }, { label: 'Vaca', emoji: '🐮' }], correct: 0, explanation: 'Pense qual animal botou o ovinho.' },
  { category: 'Ciência', prompt: 'Com o que a gente enxuga as mãos?', emoji: '🧼', options: [{ label: 'Toalha', emoji: '🧻' }, { label: 'Pé', emoji: '🦶' }, { label: 'Parede', emoji: '🧱' }], correct: 0, explanation: 'Lembre com o que a gente seca as mãos depois de lavar.' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

export default function ScienceQuiz({ phase, onFinish, onPlayAgain }) {
  const questions = useState(() => shuffle(POOL).slice(0, 5))[0];
  return <ChoiceGame title="Pequena Cientista 🔬" intro="Descobertas divertidas sobre o mundo!" questions={questions} onFinish={onFinish} onPlayAgain={onPlayAgain} />;
}