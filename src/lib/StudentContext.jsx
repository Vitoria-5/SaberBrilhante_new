import { createContext, useContext, useState, useCallback } from 'react';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [student, setStudentState] = useState(() => {
    try {
      const s = localStorage.getItem('current_student');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [childMode, setChildModeState] = useState(() => {
    try {
      return localStorage.getItem('child_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);

  const setStudent = useCallback((s) => {
    setStudentState(s);
    try {
      if (s) localStorage.setItem('current_student', JSON.stringify(s));
      else localStorage.removeItem('current_student');
    } catch {
      /* ignore */
    }
  }, []);

  const setChildMode = useCallback((v) => {
    setChildModeState(v);
    try {
      localStorage.setItem('child_mode', v ? 'true' : 'false');
    } catch {
      /* ignore */
    }
  }, []);

  const exitChildMode = useCallback(() => {
    setStudentState(null);
    setChildModeState(false);
    try {
      localStorage.removeItem('current_student');
      localStorage.removeItem('child_mode');
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (next && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  }, []);

  const audioBlocked = student?.audio_blocked === true;

  const speak = useCallback(
    (text) => {
      if (audioBlocked || muted) return;
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        u.rate = 0.92;
        u.pitch = 1.05;
        u.onstart = () => setIsSpeaking(true);
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
      } catch {
        /* ignore */
      }
    },
    [audioBlocked, muted]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return (
    <StudentContext.Provider
      value={{ student, setStudent, audioBlocked, speak, stop, isSpeaking, muted, toggleMute, childMode, setChildMode, exitChildMode }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx)
    return {
      student: null,
      setStudent: () => {},
      audioBlocked: false,
      speak: () => {},
      stop: () => {},
      isSpeaking: false,
      muted: false,
      toggleMute: () => {},
      childMode: false,
      setChildMode: () => {},
      exitChildMode: () => {},
    };
  return ctx;
}