import { useState, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// Controla até 2 erros por exercício; no 3º erro, revela o gabarito.
export function useExerciseErrors() {
  const [errors, setErrors] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const errRef = useRef(0);

  const reset = useCallback(() => {
    errRef.current = 0;
    setErrors(0);
    setRevealed(false);
  }, []);

  const registerWrong = useCallback(() => {
    errRef.current += 1;
    setErrors(errRef.current);
    if (errRef.current >= 3) {
      setRevealed(true);
      return true;
    }
    return false;
  }, []);

  return { errors, revealed, reset, registerWrong };
}

// Registra a dificuldade do aluno para a professora acompanhar.
export async function recordDifficulty(student, game, exercise, errors) {
  if (!student?.id) return;
  try {
    await base44.entities.GameError.create({
      student_id: student.id,
      student_name: student.name,
      game,
      exercise,
      errors,
    });
  } catch {
    /* ignore */
  }
}