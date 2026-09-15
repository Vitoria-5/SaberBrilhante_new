export const PHASES = [
  { key: 'garatuja', order: 0, label: 'Garatuja / Psicomotora', short: 'Garatuja', emoji: '🖍️', minAge: 0, maxAge: 3, blurb: 'Cores, formas, sons e emoções.' },
  { key: 'pre_silabica', order: 1, label: 'Pré-silábica', short: 'Pré-silábica', emoji: '🔤', minAge: 4, maxAge: 5, blurb: 'Letras, sons iniciais e primeiras palavras.' },
  { key: 'silabica', order: 2, label: 'Silábica', short: 'Silábica', emoji: '🧩', minAge: 6, maxAge: 7, blurb: 'Monta sílabas e forma palavras pequenas.' },
  { key: 'silabico_alfabetica', order: 3, label: 'Silábico-alfabética', short: 'Silábico-alfabética', emoji: '📝', minAge: 8, maxAge: 9, blurb: 'Junta sílabas e escreve palavras maiores.' },
  { key: 'alfabetica', order: 4, label: 'Alfabética', short: 'Alfabética', emoji: '📚', minAge: 10, maxAge: 200, blurb: 'Lê, escreve e resolve desafios com autonomia.' },
];

export const PHASE_MAP = Object.fromEntries(PHASES.map((p) => [p.key, p]));

export function ageFromBirth(dateStr) {
  if (!dateStr) return 0;
  const b = new Date(dateStr);
  if (isNaN(b.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return Math.max(0, age);
}

export function expectedPhaseForAge(age) {
  for (const p of PHASES) {
    if (age >= p.minAge && age <= p.maxAge) return p;
  }
  return PHASES[PHASES.length - 1];
}

export function phaseByOrder(order) {
  const o = Math.max(0, Math.min(PHASES.length - 1, order));
  return PHASES[o];
}

export function phaseOrder(key) {
  return PHASE_MAP[key]?.order ?? 0;
}