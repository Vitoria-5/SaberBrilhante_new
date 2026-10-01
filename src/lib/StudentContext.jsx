import { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext();

// BANCO DE DADOS DE FÁBRICA: Todos os 34 alunos na fase Pré-Silábica!
const DEFAULT_STUDENTS = [
  { id: 'aluno-1', name: 'Amaya Santos Sepulveda', birth_date: '2019-03-15', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-2', name: 'Angelo Ciccillo Gomes Cogliatti', birth_date: '2019-06-22', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-3', name: 'Anna Alice Pereira Sena', birth_date: '2019-01-10', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-4', name: 'Anthony Rezende Sant Anna', birth_date: '2019-08-05', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-5', name: 'Anthony Zaia Carvelli', birth_date: '2019-09-12', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-6', name: 'Arthur Miguel Cáceres dos Santos', birth_date: '2019-04-18', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-7', name: 'Benício Maia Ferreira', birth_date: '2019-11-25', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-8', name: 'Benício Zaia Carvelli', birth_date: '2019-02-14', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-9', name: 'Benjamim Sales Cabral', birth_date: '2019-07-30', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-10', name: 'Benjamin Luz Araujo', birth_date: '2019-05-02', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-11', name: 'Bernardo Alves Mathias de Oliveira', birth_date: '2019-10-09', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-12', name: 'Brendha Araujo Marcondes', birth_date: '2019-12-01', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-13', name: 'Cecília Gomes Bezerra', birth_date: '2019-03-24', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-14', name: 'Cecília Raiol Selbach', birth_date: '2019-05-14', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-15', name: 'Cecília Ziemba Vera Sarraipa Brescancin', birth_date: '2019-07-19', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-16', name: 'Davi de Souza Belentani Teixeira', birth_date: '2019-01-28', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-17', name: 'Davi Souza Ventura', birth_date: '2019-08-11', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-18', name: 'Emanuelly Gomes Correia', birth_date: '2019-11-03', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-19', name: 'Gabriel Henrique da Silva Barros', birth_date: '2019-09-27', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-20', name: 'Helena Ferreira Serra', birth_date: '2019-04-05', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-21', name: 'Heloísa Troiani Costa', birth_date: '2019-06-15', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-22', name: 'Henrique Fernandes Inoue Hamada', birth_date: '2019-10-21', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-23', name: 'Isaque Ferreira Sansão', birth_date: '2019-02-09', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-24', name: 'Liz Farina Dias', birth_date: '2019-03-31', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-25', name: 'Lorena Vitoria Bispo Sales Pereira', birth_date: '2019-07-04', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-26', name: 'Maria Alice Lima de Souza', birth_date: '2019-05-20', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-27', name: 'Maria Clara Vilhalba Lima Ferreira', birth_date: '2019-08-29', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-28', name: 'Mariah Zinezzi Albuquerque Alves', birth_date: '2019-12-14', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-29', name: 'Paola Bezerra de Oliveira', birth_date: '2019-01-05', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-30', name: 'Pedro Henrique Lopes da Silva', birth_date: '2019-10-12', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-31', name: 'Sofia Cochi Oliveira', birth_date: '2019-04-23', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-32', name: 'Tainá Cochi Oliveira', birth_date: '2019-04-23', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-33', name: 'Helena Oliveira Marques', birth_date: '2019-09-02', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] },
  { id: 'aluno-34', name: 'Lunna Catarina dos Santos', birth_date: '2019-06-08', phase: 'pre_silabica', suggested_phase: 'pre_silabica', password: '123', drawings: [], difficulties: [] }
];

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [childMode, setChildMode] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('saber_brilhante_alunos', JSON.stringify(DEFAULT_STUDENTS));
      
      const activeStudent = localStorage.getItem('saber_brilhante_aluno_ativo');
      if (activeStudent) {
        setStudent(JSON.parse(activeStudent));
        setChildMode(true);
      }
    } catch (error) {
      console.error("Erro ao inicializar o banco de alunos:", error);
    }
  }, []);

  const loginStudent = (selectedStudent) => {
    setStudent(selectedStudent);
    setChildMode(true);
    localStorage.setItem('saber_brilhante_aluno_ativo', JSON.stringify(selectedStudent));
  };

  const exitChildMode = () => {
    setStudent(null);
    setChildMode(false);
    localStorage.removeItem('saber_brilhante_aluno_ativo');
  };

  const speak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
  };

  return (
    <StudentContext.Provider value={{ student, setStudent, childMode, loginStudent, exitChildMode, speak, stop }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent deve ser usado dentro de um StudentProvider');
  }
  return context;
}

