import { PHASES, expectedPhaseForAge, phaseByOrder } from './phases';

export const TEST_QUESTIONS = [
  // ---------- GARATUJA ----------
  { phase: 'garatuja', category: 'Cores', prompt: 'Qual cor é o sol?', emoji: '☀️',
    options: [{ label: 'Amarelo', emoji: '🟡' }, { label: 'Vermelho', emoji: '🔴' }, { label: 'Azul', emoji: '🔵' }],
    correct: 0, explanation: 'Olhe para o céu num dia de sol. Qual cor você vê brilhando lá em cima?', praise: 'Que lindo! Você acertou!' },
  { phase: 'garatuja', category: 'Cores', prompt: 'Qual cor é a grama?', emoji: '🌱',
    options: [{ label: 'Verde', emoji: '🟢' }, { label: 'Rosa', emoji: '🩷' }, { label: 'Preto', emoji: '⚫' }],
    correct: 0, explanation: 'Olhe para o jardim. Que cor tem as plantinhas?' },
  { phase: 'garatuja', category: 'Emoções', prompt: 'Mostre a carinha feliz!', emoji: '😄',
    options: [{ label: 'Feliz', emoji: '😄' }, { label: 'Triste', emoji: '😢' }, { label: 'Bravo', emoji: '😠' }],
    correct: 0, explanation: 'Lembre de um momento muito legal. Qual carinha combina com isso?' },
  { phase: 'garatuja', category: 'Formas', prompt: 'Qual é o círculo?', emoji: '⭕',
    options: [{ label: 'Círculo', emoji: '⭕' }, { label: 'Quadrado', emoji: '🟦' }, { label: 'Triângulo', emoji: '🔺' }],
    correct: 0, explanation: 'Procure a forma que é toda redondinha, sem pontas.' },
  { phase: 'garatuja', category: 'Sons', prompt: 'Que som o cachorrinho faz?', emoji: '🐶',
    options: [{ label: 'Au au', emoji: '🐶' }, { label: 'Miau', emoji: '🐱' }, { label: 'Muu', emoji: '🐮' }],
    correct: 0, explanation: 'Pense num cachorrinho latindo. Que som ele faz?' },
  { phase: 'garatuja', category: 'Emoções', prompt: 'Quando a gente leva um susto, como fica?', emoji: '😱',
    options: [{ label: 'Com medo', emoji: '😱' }, { label: 'Feliz', emoji: '😄' }, { label: 'Com sono', emoji: '😴' }],
    correct: 0, explanation: 'Lembre de quando você levou um susto. Como você ficou?' },

  // ---------- PRÉ-SILÁBICA ----------
  { phase: 'pre_silabica', category: 'Letras', prompt: 'Qual letra começa a palavra BOLA?', emoji: '⚽',
    options: [{ label: 'B', emoji: '🅱️' }, { label: 'M', emoji: '🅼' }, { label: 'P', emoji: '🅿️' }],
    correct: 0, explanation: 'Fale a palavra bem devagar. Qual som você ouve no comecinho?' },
  { phase: 'pre_silabica', category: 'Letras', prompt: 'Qual dessas é uma vogal?', emoji: '🔤',
    options: [{ label: 'A', emoji: '🅰️' }, { label: 'B', emoji: '🅱️' }, { label: 'T', emoji: '🆃' }],
    correct: 0, explanation: 'Lembre: tem cinco letrinhas especiais que são as vogais: A, E, I, O, U.' },
  { phase: 'pre_silabica', category: 'Rimas', prompt: 'Qual palavra rima com GATO?', emoji: '🐱',
    options: [{ label: 'PATO', emoji: '🦆' }, { label: 'CASA', emoji: '🏠' }, { label: 'FOCO', emoji: '🔦' }],
    correct: 0, explanation: 'Fale as palavras em voz alta. Qual termina com o mesmo somzinho?' },
  { phase: 'pre_silabica', category: 'Contagem', prompt: 'Quantas maçãs tem aqui?', emoji: '🍎🍎🍎',
    options: [{ label: '3', emoji: '3️⃣' }, { label: '2', emoji: '2️⃣' }, { label: '5', emoji: '5️⃣' }],
    correct: 0, explanation: 'Aponte e conte uma de cada vez, bem devagar.' },
  { phase: 'pre_silabica', category: 'Letras', prompt: 'Qual palavra começa com A?', emoji: '🐝',
    options: [{ label: 'ABELHA', emoji: '🐝' }, { label: 'SOL', emoji: '☀️' }, { label: 'BOLA', emoji: '⚽' }],
    correct: 0, explanation: 'Fale cada palavra. Qual começa com o som de A?' },

  // ---------- SILÁBICA ----------
  { phase: 'silabica', category: 'Sílabas', prompt: 'Quantas sílabas tem CA-SA?', emoji: '🏠',
    options: [{ label: '2', emoji: '2️⃣' }, { label: '1', emoji: '1️⃣' }, { label: '3', emoji: '3️⃣' }],
    correct: 0, explanation: 'Bata palmas enquanto fala a palavra. Quantas palmas você deu?' },
  { phase: 'silabica', category: 'Montar palavras', prompt: 'Junte as sílabas: CA + SA = ?', emoji: '🧩',
    options: [{ label: 'CASA', emoji: '🏠' }, { label: 'COSA', emoji: '❓' }, { label: 'CUSA', emoji: '❓' }],
    correct: 0, explanation: 'Fale as duas partes e junte. Que palavra se forma?' },
  { phase: 'silabica', category: 'Sílabas', prompt: 'Qual sílaba completa BO-___?', emoji: '⚽',
    options: [{ label: 'LA', emoji: '🟣' }, { label: 'PI', emoji: '🔵' }, { label: 'TE', emoji: '🟢' }],
    correct: 0, explanation: 'Fale a palavra BOLA devagar. Qual parte está faltando no fim?' },
  { phase: 'silabica', category: 'Montar palavras', prompt: 'Junte LA + PI + S = ?', emoji: '✏️',
    options: [{ label: 'LÁPIS', emoji: '✏️' }, { label: 'LIPAS', emoji: '❓' }, { label: 'PILAS', emoji: '❓' }],
    correct: 0, explanation: 'Junte as partes na ordem, uma depois da outra. Que palavra forma?' },
  { phase: 'silabica', category: 'Emoções', prompt: 'Se a criança ganha um presente, como fica?', emoji: '🎁',
    options: [{ label: 'Feliz', emoji: '😄' }, { label: 'Brava', emoji: '😠' }, { label: 'Com medo', emoji: '😱' }],
    correct: 0, explanation: 'Lembre de quando você ganha um presente. Como você fica?' },

  // ---------- SILÁBICO-ALFABÉTICA ----------
  { phase: 'silabico_alfabetica', category: 'Montar palavras', prompt: 'Junte as sílabas: BA + NA + NA = ?', emoji: '🍌',
    options: [{ label: 'BANANA', emoji: '🍌' }, { label: 'BANINA', emoji: '❓' }, { label: 'NABANA', emoji: '❓' }],
    correct: 0, explanation: 'Junte as partes na ordem. Que frutinha se forma?' },
  { phase: 'silabico_alfabetica', category: 'Letras', prompt: 'Quantas letras tem a palavra GATO?', emoji: '🐱',
    options: [{ label: '4', emoji: '4️⃣' }, { label: '3', emoji: '3️⃣' }, { label: '5', emoji: '5️⃣' }],
    correct: 0, explanation: 'Aponte e conte cada letrinha, uma por uma.' },
  { phase: 'silabico_alfabetica', category: 'Gramática', prompt: 'Complete: ___ ELA (CA / MO)', emoji: '🧩',
    options: [{ label: 'CA', emoji: '🅾️' }, { label: 'MO', emoji: '🅼' }, { label: 'BO', emoji: '🅱️' }],
    correct: 0, explanation: 'Fale a palavra devagar. Qual parte vem antes de ELA?' },
  { phase: 'silabico_alfabetica', category: 'Gramática', prompt: 'Qual é o plural de FLOR?', emoji: '🌸',
    options: [{ label: 'FLORES', emoji: '💐' }, { label: 'FLORS', emoji: '❓' }, { label: 'FLORÃO', emoji: '❓' }],
    correct: 0, explanation: 'Pense em mais de uma flor. Como fica a palavra quando são muitas?' },
  { phase: 'silabico_alfabetica', category: 'Raciocínio', prompt: 'O que vem depois? 🌙 ➡️ ☀️ ➡️ ?', emoji: '🔄',
    options: [{ label: '🌙', emoji: '🌙' }, { label: '🌧️', emoji: '🌧️' }, { label: '⭐', emoji: '⭐' }],
    correct: 0, explanation: 'Pense no dia e na noite que se repetem, um depois do outro.' },

  // ---------- ALFABÉTICA ----------
  { phase: 'alfabetica', category: 'Vocabulário', prompt: 'Qual palavra é sinônimo de FELIZ?', emoji: '😄',
    options: [{ label: 'CONTENTE', emoji: '😊' }, { label: 'TRISTE', emoji: '😢' }, { label: 'CANSADO', emoji: '😴' }],
    correct: 0, explanation: 'Pense em outra palavra que quer dizer a mesma coisa que feliz.' },
  { phase: 'alfabetica', category: 'Gramática', prompt: 'Complete a frase: Eu ___ para a escola.', emoji: '🏫',
    options: [{ label: 'vou', emoji: '🚶' }, { label: 'vai', emoji: '🚶‍♀️' }, { label: 'fui', emoji: '🏃' }],
    correct: 0, explanation: 'Pense em quem está fazendo a ação. A frase começa com "Eu".' },
  { phase: 'alfabetica', category: 'Ciência', prompt: 'Em qual planeta nós vivemos?', emoji: '🌍',
    options: [{ label: 'Terra', emoji: '🌍' }, { label: 'Marte', emoji: '🔴' }, { label: 'Júpiter', emoji: '🟠' }],
    correct: 0, explanation: 'Pense no planeta azul onde tem água e vida.' },
  { phase: 'alfabetica', category: 'Matemática', prompt: 'Quanto é 2 + 3?', emoji: '➕',
    options: [{ label: '5', emoji: '5️⃣' }, { label: '6', emoji: '6️⃣' }, { label: '4', emoji: '4️⃣' }],
    correct: 0, explanation: 'Use os dedinhos para contar, primeiro 2, depois mais 3.' },
  { phase: 'alfabetica', category: 'Ortografia', prompt: 'Qual palavra está escrita certa?', emoji: '✍️',
    options: [{ label: 'CASA', emoji: '🏠' }, { label: 'KAZA', emoji: '❓' }, { label: 'SAZA', emoji: '❓' }],
    correct: 0, explanation: 'Fale cada palavra em voz alta. Qual soa certinha?' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickTestQuestions(age) {
  const exp = expectedPhaseForAge(age);
  const keys = [exp.order - 1, exp.order, exp.order + 1]
    .filter((o) => o >= 0 && o < PHASES.length)
    .map((o) => PHASES[o].key);

  const byPhase = {};
  keys.forEach((k) => {
    byPhase[k] = shuffle(TEST_QUESTIONS.filter((t) => t.phase === k));
  });

  const result = [];
  const expectedKey = exp.key;
  const take = (key, n) => {
    result.push(...(byPhase[key] || []).splice(0, n));
  };

  if (keys.length === 3) {
    take(keys[0], 2);
    take(expectedKey, 4);
    take(keys[2], 2);
  } else if (keys.length === 2) {
    take(keys[0], 3);
    take(keys[1], 5);
  } else {
    take(expectedKey, 8);
  }

  return shuffle(result).slice(0, 8);
}

export function evaluateTest(questions, firstTryResults) {
  const total = questions.length;
  const correct = firstTryResults.filter(Boolean).length;
  const pct = Math.round((correct / total) * 100);

  const expOrders = questions.map((q) => PHASES.findIndex((p) => p.key === q.phase));
  const maxOrder = Math.max(...expOrders);
  const minOrder = Math.min(...expOrders);

  let resultOrder;
  if (pct >= 75) resultOrder = Math.min(PHASES.length - 1, maxOrder);
  else if (pct >= 40) resultOrder = Math.max(minOrder, Math.min(maxOrder, Math.round((minOrder + maxOrder) / 2)));
  else resultOrder = Math.max(0, minOrder);

  const resultPhase = phaseByOrder(resultOrder).key;

  const catStats = {};
  questions.forEach((q, i) => {
    const c = q.category;
    if (!catStats[c]) catStats[c] = { right: 0, total: 0 };
    catStats[c].total++;
    if (firstTryResults[i]) catStats[c].right++;
  });

  return { pct, correct, total, resultPhase, catStats };
}