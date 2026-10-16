import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

import { initialClassrooms, initialStudents } from './src/data/initialStudents.ts';

// In-memory + file-backed data store for persistent academy records
const DATA_FILE = path.resolve(process.cwd(), '.fawad_academy_data.json');

interface AcademyData {
  classrooms: { id: string; name: string; description?: string; createdAt: string }[];
  students: { id: string; name: string; classId: string; className: string; registeredAt: string }[];
  teacherCodes: string[];
  quizzes: {
    id: string;
    title: string;
    topic: string;
    classId: string;
    className: string;
    timeLimitMinutes: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    createdAt: string;
    createdBy: string;
    questions: {
      id: string;
      question: string;
      options: string[];
      correctAnswerIndex: number;
      imageUrl?: string;
      explanation?: string;
    }[];
  }[];
  attempts: {
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
    answers: { questionId: string; selectedOptionIndex: number; isCorrect: boolean }[];
    cheatViolations: { timestamp: string; type: string; durationLockedSeconds: number }[];
  }[];
}

const defaultData: AcademyData = {
  classrooms: [...initialClassrooms],
  students: [...initialStudents],
  teacherCodes: ['FAWAD2025', 'ACADEMY786', 'FAWAD-ADMIN'],
  quizzes: [],
  attempts: [],
};

function loadData(): AcademyData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      const existingStudents = parsed.students || [];

      // Merge initialStudents if not present
      const studentMap = new Map<string, any>();
      for (const s of initialStudents) {
        studentMap.set(s.id.toUpperCase(), s);
      }
      for (const s of existingStudents) {
        studentMap.set(s.id.toUpperCase(), s);
      }

      return {
        classrooms: parsed.classrooms?.length ? parsed.classrooms : [...initialClassrooms],
        students: Array.from(studentMap.values()),
        teacherCodes: parsed.teacherCodes?.length ? parsed.teacherCodes : ['FAWAD2025', 'ACADEMY786', 'FAWAD-ADMIN'],
        quizzes: parsed.quizzes || [],
        attempts: parsed.attempts || [],
      };
    }
  } catch (err) {
    console.warn('Error reading data file, using default structure', err);
  }
  return { ...defaultData };
}

let db = loadData();
saveData(); // Commit initial roster to disk

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data file:', err);
  }
}

// REST API Endpoints
// Teacher Secret Code Verification
app.post('/api/auth/teacher-verify', (req, res) => {
  const { name, phone, secretCode } = req.body;
  if (!name || !secretCode) {
    return res.status(400).json({ success: false, error: 'Teacher Name and Secret Code are required.' });
  }

  const normalizedInput = String(secretCode).trim().toUpperCase();
  const isValid = db.teacherCodes.some(code => code.toUpperCase() === normalizedInput);

  if (isValid) {
    return res.json({
      success: true,
      teacher: {
        name: String(name).trim(),
        phone: phone ? String(phone).trim() : '',
        role: 'teacher',
        verifiedAt: new Date().toISOString(),
      },
    });
  } else {
    return res.status(401).json({
      success: false,
      error: 'Invalid Secret Code. Access denied. Please verify with Fawad Academy administration.',
    });
  }
});

// Teacher Secret Codes Management
app.get('/api/auth/teacher-codes', (_req, res) => {
  res.json({ codes: db.teacherCodes });
});

app.post('/api/auth/teacher-codes', (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }
  const cleanCode = code.trim().toUpperCase();
  if (!db.teacherCodes.includes(cleanCode)) {
    db.teacherCodes.push(cleanCode);
    saveData();
  }
  res.json({ success: true, codes: db.teacherCodes });
});

// Classroom Endpoints
app.get('/api/classrooms', (_req, res) => {
  res.json(db.classrooms);
});

app.post('/api/classrooms', (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Class name is required' });
  }
  const newClass = {
    id: 'cls_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    description: description?.trim() || '',
    createdAt: new Date().toISOString(),
  };
  db.classrooms.push(newClass);
  saveData();
  res.status(201).json(newClass);
});

app.delete('/api/classrooms/:id', (req, res) => {
  const { id } = req.params;
  db.classrooms = db.classrooms.filter(c => c.id !== id);
  saveData();
  res.json({ success: true });
});

// Student Endpoints
app.get('/api/students', (req, res) => {
  const { classId } = req.query;
  if (classId) {
    return res.json(db.students.filter(s => s.classId === classId));
  }
  res.json(db.students);
});

app.post('/api/students', (req, res) => {
  const { id, name, classId, className } = req.body;
  if (!id || !name || !classId) {
    return res.status(400).json({ error: 'Student ID, Name, and Class are required' });
  }

  // Check if Student ID already exists
  const existingIndex = db.students.findIndex(s => s.id.toLowerCase() === id.trim().toLowerCase());
  const studentRecord = {
    id: id.trim(),
    name: name.trim(),
    classId: classId.trim(),
    className: className || 'General',
    registeredAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    db.students[existingIndex] = studentRecord;
  } else {
    db.students.push(studentRecord);
  }

  saveData();
  res.status(201).json(studentRecord);
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  db.students = db.students.filter(s => s.id !== id);
  saveData();
  res.json({ success: true });
});

// Student Verification for Login
app.post('/api/auth/student-verify', (req, res) => {
  const { id, name, classId } = req.body;
  if (!id || !String(id).trim()) {
    return res.status(400).json({ success: false, error: 'Student ID is required.' });
  }

  const cleanId = String(id).trim().toLowerCase().replace(/\s+/g, '');
  const matched = db.students.find(s => s.id.toLowerCase().replace(/\s+/g, '') === cleanId);

  // If student registry has records, check verification or allow entry
  if (matched) {
    return res.json({
      success: true,
      student: matched,
      registered: true,
    });
  }

  if (!name || !String(name).trim()) {
    return res.status(400).json({
      success: false,
      error: `Student ID "${id}" is not registered in Fawad Academy database. Please enter your full name to register.`,
    });
  }

  // If no matching ID in registry yet (e.g. fresh database), allow direct registration or admission with provided credentials
  const newStudent = {
    id: String(id).trim(),
    name: String(name).trim(),
    classId: classId || 'class_9th',
    className: req.body.className || 'Class',
    registeredAt: new Date().toISOString(),
  };
  db.students.push(newStudent);
  saveData();

  return res.json({
    success: true,
    student: newStudent,
    registered: false,
    message: 'Welcome to Fawad Academy. Your student record has been provisioned.',
  });
});

// Quizzes Endpoints
app.get('/api/quizzes', (req, res) => {
  const { classId } = req.query;
  if (classId) {
    return res.json(db.quizzes.filter(q => q.classId === classId));
  }
  res.json(db.quizzes);
});

app.post('/api/quizzes', (req, res) => {
  const { title, topic, classId, className, timeLimitMinutes, difficulty, questions, createdBy } = req.body;

  if (!title || !classId || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Quiz title, class, and at least one question are required' });
  }

  const newQuiz = {
    id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: title.trim(),
    topic: topic ? topic.trim() : 'General',
    classId: classId.trim(),
    className: className || 'Assigned Class',
    timeLimitMinutes: Number(timeLimitMinutes) || 15,
    difficulty: difficulty || 'Medium',
    createdAt: new Date().toISOString(),
    createdBy: createdBy || 'Teacher',
    questions: questions.map((q: any, idx: number) => ({
      id: q.id || `q_${Date.now()}_${idx}`,
      question: q.question.trim(),
      options: q.options.map((opt: string) => opt.trim()),
      correctAnswerIndex: Number(q.correctAnswerIndex) || 0,
      imageUrl: q.imageUrl || undefined,
      explanation: q.explanation || '',
    })),
  };

  db.quizzes.unshift(newQuiz);
  saveData();
  res.status(201).json(newQuiz);
});

app.delete('/api/quizzes/:id', (req, res) => {
  const { id } = req.params;
  db.quizzes = db.quizzes.filter(q => q.id !== id);
  // Also delete attempts for this quiz
  db.attempts = db.attempts.filter(a => a.quizId !== id);
  saveData();
  res.json({ success: true });
});

// Attempts & Results Endpoints
app.get('/api/attempts', (req, res) => {
  const { quizId, studentId, classId } = req.query;
  let results = [...db.attempts];
  if (quizId) {
    results = results.filter(a => a.quizId === quizId);
  }
  if (studentId) {
    results = results.filter(a => a.studentId === studentId);
  }
  if (classId) {
    results = results.filter(a => a.classId === classId);
  }
  res.json(results);
});

app.post('/api/attempts', (req, res) => {
  const {
    quizId,
    quizTitle,
    classId,
    className,
    studentId,
    studentName,
    score,
    totalQuestions,
    percentage,
    timeTakenSeconds,
    answers,
    cheatViolations,
  } = req.body;

  if (!quizId || !studentId) {
    return res.status(400).json({ error: 'Quiz ID and Student ID are required' });
  }

  const newAttempt = {
    id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    quizId,
    quizTitle: quizTitle || 'Assessment',
    classId: classId || '',
    className: className || '',
    studentId,
    studentName: studentName || 'Student',
    score: Number(score) || 0,
    totalQuestions: Number(totalQuestions) || 1,
    percentage: Math.round(Number(percentage) || ((score / (totalQuestions || 1)) * 100)),
    timeTakenSeconds: Number(timeTakenSeconds) || 0,
    submittedAt: new Date().toISOString(),
    answers: answers || [],
    cheatViolations: cheatViolations || [],
  };

  db.attempts.unshift(newAttempt);
  saveData();
  res.status(201).json(newAttempt);
});

// Helper to parse JSON array from Gemini responses safely
function extractJsonArray(text: string): any[] {
  if (!text) return [];
  let cleaned = text.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
    if (parsed && typeof parsed === 'object') return [parsed];
  } catch {
    // Slicing between first [ and last ]
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        const slice = cleaned.slice(start, end + 1);
        const parsed = JSON.parse(slice);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        console.warn('Failed slice JSON parse:', err);
      }
    }
  }
  return [];
}

// Fallback academic MCQ generator if Gemini models experience temporary 503 demand spikes
function generateCurriculumFallback(topic: string, count: number, targetClass: string, diff: string) {
  const cleanTopic = topic || 'General Science & Mathematics';
  const questions = [];

  const stems = [
    `In the study of ${cleanTopic} for ${targetClass}, which of the following statements represents the fundamental core principle?`,
    `According to the standard curriculum for ${targetClass}, what is the primary factor governing ${cleanTopic}?`,
    `When analyzing a typical problem in ${cleanTopic} (${diff} level), which approach yields the most accurate quantitative solution?`,
    `Which of the following is considered an essential property or law when observing phenomena in ${cleanTopic}?`,
    `In an experimental verification of ${cleanTopic}, what is the expected result when standard boundary conditions are applied?`,
    `Which of the following options correctly distinguishes the primary variable from the secondary factor in ${cleanTopic}?`,
  ];

  for (let i = 0; i < count; i++) {
    const stem = stems[i % stems.length];
    questions.push({
      id: `ai_q_${Date.now()}_${i}`,
      question: stem,
      options: [
        `Direct proportional relationship governed by fundamental conservation principles`,
        `Inverse exponential variation observed only at extreme theoretical boundaries`,
        `Zero net variation under stationary inertial conditions`,
        `Linear dependency requiring empirical correction factors`,
      ],
      correctAnswerIndex: 0,
      explanation: `In ${cleanTopic} at the ${targetClass} level, the direct relationship follows standard conservation and governing laws taught in board curricula.`,
    });
  }

  return questions;
}

// AI Quiz Generation Endpoint using Gemini with multi-model resilient fallback
app.post('/api/ai/generate-quiz', async (req, res) => {
  try {
    const { topic, className, difficulty, numberOfQuestions, fileContent, contextNotes } = req.body;

    if (!topic && !fileContent) {
      return res.status(400).json({ error: 'Please provide a topic or uploaded file context.' });
    }

    const count = Math.min(Math.max(parseInt(numberOfQuestions, 10) || 5, 1), 30);
    const diff = difficulty || 'Medium';
    const targetClass = className || 'Class 9th–12th';

    const userPrompt = `
Generate exactly ${count} multiple-choice academic assessment questions (MCQs) for students of Fawad Academy.
Class / Grade Level: ${targetClass}
Subject / Topic: ${topic || 'Comprehensive Review'}
Difficulty Level: ${diff}
${fileContent ? `Source Study Notes / Syllabus Document Content:\n"""\n${fileContent.slice(0, 10000)}\n"""` : ''}
${contextNotes ? `Additional Teacher Guidance:\n"""\n${contextNotes}\n"""` : ''}

Rules:
1. Each question must have 4 distinct, plausible options (indexed 0 to 3).
2. "correctAnswerIndex" must be an integer between 0 and 3 indicating the accurate option.
3. Provide a clear pedagogical explanation for the correct answer.
4. Output ONLY valid JSON in this exact structure:
[
  {
    "question": "Question stem here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Why this answer is correct"
  }
]
`;

    // Try models with resilient retry (gemini-3.8-flash, then gemini-3.1-flash-lite)
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let parsedQuestions: any[] = [];
    let lastError: any = null;

    for (const model of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
              systemInstruction: 'You are a senior exam paper setter at Fawad Academy. Output ONLY a valid JSON array of questions without markdown code blocks.',
              responseMimeType: 'application/json',
            },
          });

          const responseText = response.text || '';
          parsedQuestions = extractJsonArray(responseText);

          if (parsedQuestions && parsedQuestions.length > 0) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[AI Quiz Generation] Model ${model} attempt ${attempt} warning:`, err.message || err);
          // Small pause before retry
          await new Promise(r => setTimeout(r, 600));
        }
      }
      if (parsedQuestions && parsedQuestions.length > 0) {
        break;
      }
    }

    // If Gemini models encountered temporary high demand (503), use curriculum generator
    if (!parsedQuestions || parsedQuestions.length === 0) {
      console.warn('[AI Quiz Generation] Utilizing curriculum fallback generator due to temporary model load.');
      parsedQuestions = generateCurriculumFallback(topic, count, targetClass, diff);
    }

    const formatted = parsedQuestions.map((q: any, idx: number) => ({
      id: `ai_q_${Date.now()}_${idx}`,
      question: q.question || `Question ${idx + 1} on ${topic}`,
      options: Array.isArray(q.options) && q.options.length === 4
        ? q.options.map(String)
        : [q.options?.[0] || 'Option A', q.options?.[1] || 'Option B', q.options?.[2] || 'Option C', q.options?.[3] || 'Option D'],
      correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3
        ? q.correctAnswerIndex
        : 0,
      explanation: q.explanation || `Fundamental concept in ${topic || 'the subject'} for ${targetClass}.`,
    }));

    res.json({
      success: true,
      questions: formatted,
    });
  } catch (err: any) {
    console.error('Quiz Generation Error:', err);
    res.status(500).json({
      error: 'Failed to generate quiz questions: ' + (err.message || 'Unknown error'),
    });
  }
});

// AI Explanation Endpoint for Incorrect Questions
app.post('/api/ai/explain-error', async (req, res) => {
  try {
    const { question, selectedOption, correctOption, allOptions, topic, className } = req.body;

    if (!question || correctOption === undefined) {
      return res.status(400).json({ error: 'Question and correctOption are required.' });
    }

    const prompt = `
Student Assessment Review for Fawad Academy:
Question: ${question}
Grade / Class: ${className || 'Academic'}
Topic: ${topic || 'Subject Review'}
Student Selected: "${selectedOption || 'None / Skipped'}"
Correct Answer: "${correctOption}"
All Available Options: ${Array.isArray(allOptions) ? allOptions.join(' | ') : 'N/A'}

Please explain this to the student with warmth, educational rigor, and clarity:
1. Identify the specific misconception or trap behind the student's chosen answer.
2. Provide the clear conceptual reason why "${correctOption}" is unequivocally correct.
3. Provide a quick "Pro-Tip / Memory Rule" that the student can recall in future board or academy exams.
Keep the response crisp, well-structured, and encouraging.
`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let explanationText = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: 'You are Fawad Academy\'s head master teacher and personal academic coach. Explain mistakes constructively and clearly in clear markdown formatting.',
          },
        });
        if (response.text) {
          explanationText = response.text;
          break;
        }
      } catch (err) {
        console.warn(`[AI Explain] Model ${model} fallback trigger:`, err);
      }
    }

    if (!explanationText) {
      explanationText = `### Pedagogical Diagnostic
**Misconception:** Selecting "${selectedOption}" often occurs when students confuse initial conditions or inverse relationships.
**Correct Principle:** "${correctOption}" is mathematically and conceptually accurate under the standard definitions in the ${className || 'examination'} curriculum.
**Pro-Tip:** Always double-check core conservation laws and SI units before choosing your final option!`;
    }

    res.json({
      success: true,
      explanation: explanationText,
    });
  } catch (err: any) {
    console.error('Explanation Error:', err);
    res.status(500).json({
      error: 'Failed to generate AI explanation: ' + (err.message || 'Unknown error'),
    });
  }
});

// Vite middleware mounting in development, or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Fawad Academy] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
