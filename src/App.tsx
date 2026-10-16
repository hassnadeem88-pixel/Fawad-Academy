/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CurrentUser, Quiz, QuizAttempt } from './types/academy';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { StudentLogin } from './components/StudentLogin';
import { TeacherLogin } from './components/TeacherLogin';
import { TeacherDashboard } from './components/TeacherDashboard/TeacherDashboard';
import { StudentDashboard } from './components/StudentFlow/StudentDashboard';
import { ActiveQuiz } from './components/StudentFlow/ActiveQuiz';
import { ResultScreen } from './components/StudentFlow/ResultScreen';

type AppView =
  | 'landing'
  | 'student-login'
  | 'teacher-login'
  | 'teacher-dashboard'
  | 'student-dashboard'
  | 'active-quiz'
  | 'result-screen';

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    try {
      const saved = localStorage.getItem('fa_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [view, setView] = useState<AppView>(() => {
    try {
      const saved = localStorage.getItem('fa_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'teacher') return 'teacher-dashboard';
        if (u.role === 'student') return 'student-dashboard';
      }
    } catch {}
    return 'landing';
  });

  // Active quiz context
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);

  // Sync current user to local storage
  const handleUserLogin = (user: CurrentUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('fa_current_user', JSON.stringify(user));
    } catch {}

    if (user.role === 'teacher') {
      setView('teacher-dashboard');
    } else {
      setView('student-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveQuiz(null);
    setLatestAttempt(null);
    try {
      localStorage.removeItem('fa_current_user');
    } catch {}
    setView('landing');
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('active-quiz');
  };

  const handleFinishQuiz = (attempt: QuizAttempt) => {
    setLatestAttempt(attempt);
    setView('result-screen');
  };

  const handleViewResultDirect = (quiz: Quiz, attempt: QuizAttempt) => {
    setActiveQuiz(quiz);
    setLatestAttempt(attempt);
    setView('result-screen');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col font-sans">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onHomeClick={() => {
          if (currentUser?.role === 'teacher') setView('teacher-dashboard');
          else if (currentUser?.role === 'student') setView('student-dashboard');
          else setView('landing');
        }}
        inExamMode={view === 'active-quiz'}
      />

      <main className="flex-1">
        {/* Landing Page with Centered Title & Two Buttons */}
        {view === 'landing' && (
          <LandingPage
            onSelectStudent={() => setView('student-login')}
            onSelectTeacher={() => setView('teacher-login')}
          />
        )}

        {/* Student Login */}
        {view === 'student-login' && (
          <StudentLogin
            onBack={() => setView('landing')}
            onSuccess={handleUserLogin}
          />
        )}

        {/* Teacher Login */}
        {view === 'teacher-login' && (
          <TeacherLogin
            onBack={() => setView('landing')}
            onSuccess={handleUserLogin}
          />
        )}

        {/* Teacher Dashboard */}
        {view === 'teacher-dashboard' && currentUser?.role === 'teacher' && (
          <TeacherDashboard user={currentUser} />
        )}

        {/* Student Dashboard */}
        {view === 'student-dashboard' && currentUser?.role === 'student' && (
          <StudentDashboard
            student={currentUser}
            onStartQuiz={handleStartQuiz}
            onViewResult={handleViewResultDirect}
          />
        )}

        {/* Active Quiz with Anti-Cheating Lockout */}
        {view === 'active-quiz' && activeQuiz && currentUser && (
          <ActiveQuiz
            quiz={activeQuiz}
            student={currentUser}
            onFinish={handleFinishQuiz}
            onCancel={() => setView('student-dashboard')}
          />
        )}

        {/* Result Screen with Marks and AI Explanation for Errors */}
        {view === 'result-screen' && activeQuiz && latestAttempt && (
          <ResultScreen
            quiz={activeQuiz}
            attempt={latestAttempt}
            onBackToDashboard={() => {
              if (currentUser?.role === 'teacher') setView('teacher-dashboard');
              else setView('student-dashboard');
            }}
          />
        )}
      </main>

      {/* Footer */}
      {view !== 'active-quiz' && (
        <footer className="border-t border-[#1E293B] py-6 px-4 bg-[#090D16] text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Fawad Academy</span>
              <span>•</span>
              <span>Class 9th–12th Digital Assessment System</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Proctored Lockout Engine</span>
              <span>•</span>
              <span>Gemini 3.8 Flash AI Integration</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
