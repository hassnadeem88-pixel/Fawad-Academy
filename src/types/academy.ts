export type Role = 'student' | 'teacher';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Student {
  id: string; // e.g. FA-2025-001
  name: string;
  classId: string;
  className: string;
  registeredAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 options
  correctAnswerIndex: number; // 0 to 3
  imageUrl?: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  classId: string;
  className: string;
  timeLimitMinutes: number;
  difficulty: DifficultyLevel;
  createdAt: string;
  createdBy: string;
  questions: QuizQuestion[];
}

export interface QuestionAnswer {
  questionId: string;
  selectedOptionIndex: number; // -1 if skipped
  isCorrect: boolean;
}

export interface CheatViolation {
  timestamp: string;
  type: string;
  durationLockedSeconds: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  submittedAt: string;
  answers: QuestionAnswer[];
  cheatViolations: CheatViolation[];
}

export interface CurrentUser {
  role: Role;
  name: string;
  studentId?: string;
  classId?: string;
  className?: string;
  phone?: string;
}
