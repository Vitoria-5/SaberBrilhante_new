import { useState } from 'react';
import ChoiceGame from './ChoiceGame';

function buildCountQuestion(n, emoji) {
  const emojis = Array(n).fill(emoji).join('');
  const wrongs = [n - 1, n + 1, n + 2].filter((x) => x > 0 && x !== n);
  const opts = [n, wrongs[0], wrongs[1]];
  const correctValue = n;
  const shuffled = [...opts].sort(() => Math.random() - 0.5);
  return {
    category: 'Contagem',
    prompt: `Quantos ${emoji} tem aqui?`,
    emoji: emojis,
    options: shuffled.map((v) => ({ label: String(v), emoji: '🔢' })),
    correct: shuffled.indexOf(correctValue),
    explanation: 'Aponte e conte um de cada vez, bem devagar.',
    praise: 'Boa contagem! ⭐',
  };
}

export default function CountingGame({ phase, onFinish, onPlayAgain }) {
  const questions = useState(() => {
    let nums;
    if (phase === 'garatuja' || phase === 'pre_silabica') nums = [1, 2, 3, 4, 5];
    else if (phase === 'silabica') nums = [3, 4, 5, 6, 7];
    else nums = [5, 6, 7, 8, 9];
    const emojis = ['🍎', '⭐', '🎈', '🐟', '🍪'];
    return nums.map((n, i) => buildCountQuestion(n, emojis[i % emojis.length]));
  })[0];
  return <ChoiceGame title="Vamos Contar 🔢" intro="Conte com carinho!" questions={questions} onFinish={onFinish} onPlayAgain={onPlayAgain} />;
}