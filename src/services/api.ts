import { Classroom, Student, Quiz, QuizAttempt, QuizQuestion } from '../types/academy';
import { initialClassrooms, initialStudents } from '../data/initialStudents';

const API_BASE = '/api';

// Local storage fallback keys
const LS_KEYS = {
  CLASSROOMS: 'fa_classrooms',
  STUDENTS: 'fa_students',
  QUIZZES: 'fa_quizzes',
  ATTEMPTS: 'fa_attempts',
  TEACHER_CODES: 'fa_teacher_codes',
};

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota
  }
}

export const api = {
  // Authentication
  async verifyTeacher(name: string, phone: string, secretCode: string): Promise<{ success: boolean; teacher?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/teacher-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, secretCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to verify secret code' };
      }
      return data;
    } catch {
      // Local fallback: verify against local codes or default 'FAWAD2025'
      const codes = getLocal<string[]>(LS_KEYS.TEACHER_CODES, ['FAWAD2025', 'ACADEMY786', 'FAWAD-ADMIN']);
      const normalized = secretCode.trim().toUpperCase();
      if (codes.map(c => c.toUpperCase()).includes(normalized)) {
        return {
          success: true,
          teacher: { name, phone, role: 'teacher', verifiedAt: new Date().toISOString() },
        };
      }
      return { success: false, error: 'Invalid Secret Code. Access denied.' };
    }
  },

  async verifyStudent(id: string, name: string, classId: string, className?: string): Promise<{ success: boolean; student?: Student; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/student-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, classId, className }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Student verification failed' };
      }
      return data;
    } catch {
      const students = getLocal<Student[]>(LS_KEYS.STUDENTS, initialStudents);
      let matched = students.find(s => s.id.toLowerCase() === id.trim().toLowerCase());
      if (!matched) {
        matched = {
          id: id.trim(),
          name: name.trim(),
          classId,
          className: className || 'Assigned Class',
          registeredAt: new Date().toISOString(),
        };
        students.push(matched);
        setLocal(LS_KEYS.STUDENTS, students);
      }
      return { success: true, student: matched };
    }
  },

  async getTeacherCodes(): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE}/auth/teacher-codes`);
      const data = await res.json();
      return data.codes || [];
    } catch {
      return getLocal<string[]>(LS_KEYS.TEACHER_CODES, ['FAWAD2025', 'ACADEMY786']);
    }
  },

  async addTeacherCode(code: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/teacher-codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      return res.ok;
    } catch {
      const codes = getLocal<string[]>(LS_KEYS.TEACHER_CODES, ['FAWAD2025']);
      if (!codes.includes(code.toUpperCase())) {
        codes.push(code.toUpperCase());
        setLocal(LS_KEYS.TEACHER_CODES, codes);
      }
      return true;
    }
  },

  // Classrooms
  async getClassrooms(): Promise<Classroom[]> {
    try {
      const res = await fetch(`${API_BASE}/classrooms`);
      if (res.ok) {
        const data = await res.json();
        setLocal(LS_KEYS.CLASSROOMS, data);
        return data;
      }
    } catch (e) {
      console.warn('Network error fetching classrooms, using local store', e);
    }
    return getLocal<Classroom[]>(LS_KEYS.CLASSROOMS, initialClassrooms);
  },

  async createClassroom(name: string, description?: string): Promise<Classroom> {
    try {
      const res = await fetch(`${API_BASE}/classrooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        const created = await res.json();
        const existing = getLocal<Classroom[]>(LS_KEYS.CLASSROOMS, initialClassrooms);
        setLocal(LS_KEYS.CLASSROOMS, [...existing, created]);
        return created;
      }
    } catch (e) {
      console.warn('Network error creating classroom, fallback to local', e);
    }
    const fallback: Classroom = {
      id: 'cls_' + Date.now(),
      name: name.trim(),
      description: description?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    const list = getLocal<Classroom[]>(LS_KEYS.CLASSROOMS, initialClassrooms);
    list.push(fallback);
    setLocal(LS_KEYS.CLASSROOMS, list);
    return fallback;
  },

  async deleteClassroom(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/classrooms/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const list = getLocal<Classroom[]>(LS_KEYS.CLASSROOMS, initialClassrooms).filter(c => c.id !== id);
    setLocal(LS_KEYS.CLASSROOMS, list);
    return true;
  },

  // Students
  async getStudents(classId?: string): Promise<Student[]> {
    try {
      const url = classId ? `${API_BASE}/students?classId=${encodeURIComponent(classId)}` : `${API_BASE}/students`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (!classId) setLocal(LS_KEYS.STUDENTS, data);
        return data;
      }
    } catch (e) {
      console.warn('Network error fetching students, fallback to local', e);
    }
    const all = getLocal<Student[]>(LS_KEYS.STUDENTS, initialStudents);
    return classId ? all.filter(s => s.classId === classId) : all;
  },

  async registerStudent(id: string, name: string, classId: string, className?: string): Promise<Student> {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, classId, className }),
      });
      if (res.ok) {
        const student = await res.json();
        const all = getLocal<Student[]>(LS_KEYS.STUDENTS, []).filter(s => s.id !== student.id);
        setLocal(LS_KEYS.STUDENTS, [...all, student]);
        return student;
      }
    } catch (e) {
      console.warn('Network error registering student, fallback to local', e);
    }
    const fallback: Student = {
      id: id.trim(),
      name: name.trim(),
      classId,
      className: className || 'Assigned Class',
      registeredAt: new Date().toISOString(),
    };
    const all = getLocal<Student[]>(LS_KEYS.STUDENTS, []).filter(s => s.id !== fallback.id);
    all.push(fallback);
    setLocal(LS_KEYS.STUDENTS, all);
    return fallback;
  },

  async deleteStudent(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const all = getLocal<Student[]>(LS_KEYS.STUDENTS, []).filter(s => s.id !== id);
    setLocal(LS_KEYS.STUDENTS, all);
    return true;
  },

  // Quizzes
  async getQuizzes(classId?: string): Promise<Quiz[]> {
    try {
      const url = classId ? `${API_BASE}/quizzes?classId=${encodeURIComponent(classId)}` : `${API_BASE}/quizzes`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (!classId) setLocal(LS_KEYS.QUIZZES, data);
        return data;
      }
    } catch (e) {
      console.warn('Network error fetching quizzes, fallback to local', e);
    }
    const all = getLocal<Quiz[]>(LS_KEYS.QUIZZES, []);
    return classId ? all.filter(q => q.classId === classId) : all;
  },

  async createQuiz(quizData: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz> {
    try {
      const res = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });
      if (res.ok) {
        const newQuiz = await res.json();
        const all = getLocal<Quiz[]>(LS_KEYS.QUIZZES, []);
        setLocal(LS_KEYS.QUIZZES, [newQuiz, ...all]);
        return newQuiz;
      }
    } catch (e) {
      console.warn('Network error creating quiz, fallback to local', e);
    }
    const fallback: Quiz = {
      ...quizData,
      id: 'quiz_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const all = getLocal<Quiz[]>(LS_KEYS.QUIZZES, []);
    setLocal(LS_KEYS.QUIZZES, [fallback, ...all]);
    return fallback;
  },

  async deleteQuiz(id: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE}/quizzes/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    const all = getLocal<Quiz[]>(LS_KEYS.QUIZZES, []).filter(q => q.id !== id);
    setLocal(LS_KEYS.QUIZZES, all);
    return true;
  },

  // Attempts
  async getAttempts(filters?: { quizId?: string; studentId?: string; classId?: string }): Promise<QuizAttempt[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.quizId) params.append('quizId', filters.quizId);
      if (filters?.studentId) params.append('studentId', filters.studentId);
      if (filters?.classId) params.append('classId', filters.classId);

      const res = await fetch(`${API_BASE}/attempts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (!filters || Object.keys(filters).length === 0) {
          setLocal(LS_KEYS.ATTEMPTS, data);
        }
        return data;
      }
    } catch (e) {
      console.warn('Network error fetching attempts, fallback to local', e);
    }
    let all = getLocal<QuizAttempt[]>(LS_KEYS.ATTEMPTS, []);
    if (filters?.quizId) all = all.filter(a => a.quizId === filters.quizId);
    if (filters?.studentId) all = all.filter(a => a.studentId === filters.studentId);
    if (filters?.classId) all = all.filter(a => a.classId === filters.classId);
    return all;
  },

  async submitAttempt(attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'>): Promise<QuizAttempt> {
    try {
      const res = await fetch(`${API_BASE}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attemptData),
      });
      if (res.ok) {
        const saved = await res.json();
        const all = getLocal<QuizAttempt[]>(LS_KEYS.ATTEMPTS, []);
        setLocal(LS_KEYS.ATTEMPTS, [saved, ...all]);
        return saved;
      }
    } catch (e) {
      console.warn('Network error submitting attempt, fallback to local', e);
    }
    const fallback: QuizAttempt = {
      ...attemptData,
      id: 'att_' + Date.now(),
      submittedAt: new Date().toISOString(),
    };
    const all = getLocal<QuizAttempt[]>(LS_KEYS.ATTEMPTS, []);
    setLocal(LS_KEYS.ATTEMPTS, [fallback, ...all]);
    return fallback;
  },

  // AI Quiz Generation via server
  async generateAIQuiz(payload: {
    topic: string;
    className: string;
    difficulty: string;
    numberOfQuestions: number;
    fileContent?: string;
    contextNotes?: string;
  }): Promise<QuizQuestion[]> {
    const res = await fetch(`${API_BASE}/ai/generate-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to generate quiz with AI');
    }
    const data = await res.json();
    return data.questions || [];
  },

  // AI Error Explanation via server
  async explainError(payload: {
    question: string;
    selectedOption: string;
    correctOption: string;
    allOptions: string[];
    topic?: string;
    className?: string;
  }): Promise<string> {
    const res = await fetch(`${API_BASE}/ai/explain-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to generate AI explanation');
    }
    const data = await res.json();
    return data.explanation;
  },
};
