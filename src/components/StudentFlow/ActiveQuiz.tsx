import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, ShieldAlert, Flag, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { Quiz, QuizAttempt, CurrentUser, CheatViolation } from '../../types/academy';
import { AntiCheatLockout } from './AntiCheatLockout';
import { api } from '../../services/api';
import { FastLogo } from '../FastLogo';

interface ActiveQuizProps {
  quiz: Quiz;
  student: CurrentUser;
  onFinish: (attempt: QuizAttempt) => void;
  onCancel: () => void;
}

const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes (300 seconds)

export const ActiveQuiz: React.FC<ActiveQuizProps> = ({
  quiz,
  student,
  onFinish,
  onCancel,
}) => {
  // Pre-briefing confirmation screen
  const [briefingAccepted, setBriefingAccepted] = useState(false);

  // Question navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});

  // Timers
  const totalSeconds = (quiz.timeLimitMinutes || 15) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const startTimeRef = useRef<number>(Date.now());

  // Anti-cheating Lockout state
  const lockoutStorageKey = `fa_lockout_${student.studentId || 'std'}_${quiz.id}`;
  const [isLockedOut, setIsLockedOut] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(lockoutStorageKey);
      if (stored) {
        const until = parseInt(stored, 10);
        return Date.now() < until;
      }
    } catch {}
    return false;
  });

  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(lockoutStorageKey);
      if (stored) {
        const until = parseInt(stored, 10);
        if (Date.now() < until) return until;
      }
    } catch {}
    return 0;
  });

  const [cheatViolations, setCheatViolations] = useState<CheatViolation[]>([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger Anti-Cheating Lockout
  const triggerTabSwitchLockout = useCallback((reason: string) => {
    if (!briefingAccepted || isSubmitting) return;

    const now = Date.now();
    const until = now + LOCKOUT_DURATION_MS;

    try {
      localStorage.setItem(lockoutStorageKey, until.toString());
    } catch {}

    setLockoutUntil(until);
    setIsLockedOut(true);

    const violation: CheatViolation = {
      timestamp: new Date().toISOString(),
      type: reason,
      durationLockedSeconds: 300,
    };

    setCheatViolations(prev => [...prev, violation]);
  }, [briefingAccepted, isSubmitting, lockoutStorageKey]);

  // Handle Unlocking when 5-min penalty ends
  const handleUnlock = () => {
    try {
      localStorage.removeItem(lockoutStorageKey);
    } catch {}
    setIsLockedOut(false);
    setLockoutUntil(0);
  };

  // Exam Countdown Timer (Timer runs during lockout as well!)
  useEffect(() => {
    if (!briefingAccepted || isSubmitting) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [briefingAccepted, isSubmitting]);

  // Anti-Cheating Event Listeners: Tab switching & focus loss
  useEffect(() => {
    if (!briefingAccepted || isSubmitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerTabSwitchLockout('Tab Switch: Assessment window minimized or tab backgrounded');
      }
    };

    const handleWindowBlur = () => {
      triggerTabSwitchLockout('Focus Lost: Candidate switched away from active exam window');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Assessment in progress. Tab switching triggers a 5-minute penalty lockout.';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [briefingAccepted, isSubmitting, triggerTabSwitchLockout]);

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex],
    }));
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      localStorage.removeItem(lockoutStorageKey);
    } catch {}

    const timeTaken = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    let score = 0;
    const answerAudit = quiz.questions.map((q, idx) => {
      const selected = selectedAnswers[idx];
      const isCorrect = selected !== undefined && selected === q.correctAnswerIndex;
      if (isCorrect) score += 1;

      return {
        questionId: q.id || `q_${idx}`,
        selectedOptionIndex: selected !== undefined ? selected : -1,
        isCorrect,
      };
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);

    const attemptPayload = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentId: student.studentId || 'FA-GUEST',
      studentName: student.name,
      classId: quiz.classId,
      className: quiz.className,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      timeTakenSeconds: timeTaken,
      cheatViolations,
      answers: answerAudit,
    };

    try {
      const savedAttempt = await api.submitAttempt(attemptPayload);
      onFinish(savedAttempt);
    } catch {
      const fallbackAttempt: QuizAttempt = {
        ...attemptPayload,
        id: 'att_' + Date.now(),
        submittedAt: new Date().toISOString(),
      };
      onFinish(fallbackAttempt);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQ = quiz.questions[currentQuestionIndex];
  const isFlagged = !!flaggedQuestions[currentQuestionIndex];

  // If not started yet, show Pre-Exam Anti-Cheating Protocol Briefing
  if (!briefingAccepted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121B2B] border border-[#28364F] shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle gold glow */}
          <div className="absolute top-0 right-0 w-64 h-32 bg-[#F5BA31]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4 border-b border-[#1F2D44] pb-5">
            <FastLogo size={56} className="shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-black text-[#F5BA31] tracking-wider px-2 py-0.5 rounded bg-[#F5BA31]/15 border border-[#F5BA31]/30">
                Fawad Academy Proctoring Protocol
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">{quiz.title}</h2>
              <p className="text-xs text-slate-300">Class: <strong className="text-white">{quiz.className}</strong> • Duration: <strong className="text-[#F5BA31]">{quiz.timeLimitMinutes} Minutes</strong></p>
            </div>
          </div>

          <div className="relative z-10 space-y-3.5 text-xs text-slate-300 leading-relaxed bg-[#0B111E] p-5 rounded-2xl border border-[#28364F]">
            <h4 className="font-black text-[#F5BA31] uppercase tracking-wide text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#F5BA31]" />
              Anti-Cheating Rules & Strict Lockout Warning:
            </h4>
            <ul className="space-y-2 list-disc list-inside text-slate-300">
              <li>
                <strong className="text-white">Tab-Switch Freeze:</strong> If you switch tabs, minimize the browser, or click outside the assessment window, <span className="text-[#F5BA31] font-bold">your session will instantly freeze for 5 minutes</span>.
              </li>
              <li>
                <strong className="text-white">Continuous Timer:</strong> During the 5-minute lockout freeze, your examination master countdown continues to run.
              </li>
              <li>
                <strong className="text-white">Persistent Integrity:</strong> Refreshing or reopening the page will not remove the lockout penalty.
              </li>
              <li>
                <strong className="text-white">Audit Log:</strong> All focus incidents are permanently attached to your score report reviewed by your instructor.
              </li>
            </ul>
          </div>

          <div className="relative z-10 p-3.5 rounded-xl bg-[#F5BA31]/10 border border-[#F5BA31]/30 text-xs text-slate-200 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#F5BA31] shrink-0" />
            <span>Candidate: <strong className="text-white">{student.name}</strong> (ID: <strong className="font-mono text-[#F5BA31]">{student.studentId || 'FA-STD'}</strong>)</span>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel & Exit
            </button>
            <button
              onClick={() => {
                startTimeRef.current = Date.now();
                setBriefingAccepted(true);
              }}
              className="h-12 px-7 rounded-xl bg-gradient-to-r from-[#F5BA31] to-[#E5A820] hover:from-[#FBD561] hover:to-[#F5BA31] text-[#0B111E] font-black text-xs shadow-xl shadow-[#F5BA31]/20 flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>I Acknowledge & Begin Exam</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-24 relative select-none">
      {/* Active Lockout Overlay if triggered */}
      {isLockedOut && (
        <AntiCheatLockout
          lockedUntil={lockoutUntil}
          onUnlock={handleUnlock}
          examSecondsRemaining={secondsRemaining}
        />
      )}

      {/* Top Fixed Exam Status Bar */}
      <div className="sticky top-16 z-30 bg-[#0B111E]/95 backdrop-blur-md border-b border-[#28364F] px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Question Index */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-[#F5BA31] bg-[#F5BA31]/15 border border-[#F5BA31]/30 px-3 py-1 rounded-lg">
              Question {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
            <span className="text-xs text-slate-300 hidden sm:inline">
              Answered: <strong className="text-white">{answeredCount}</strong> of {quiz.questions.length}
            </span>
          </div>

          {/* Anti-cheat proctoring indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-Cheat Proctor Active</span>
          </div>

          {/* Exam Timer */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-black text-xs tabular-nums border ${
            secondsRemaining < 120
              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
              : 'bg-[#121B2B] text-[#F5BA31] border-[#28364F]'
          }`}>
            <Clock className="w-4 h-4 text-[#F5BA31]" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="max-w-4xl mx-auto mt-2 h-1.5 bg-[#121B2B] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F5BA31] transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Stem & Options */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#121B2B] border border-[#28364F] shadow-2xl space-y-6">
          {/* Stem header */}
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-mono uppercase font-black text-[#F5BA31] tracking-wider px-2 py-0.5 rounded bg-[#F5BA31]/10 border border-[#F5BA31]/30">
              {quiz.topic} • Multiple Choice
            </span>
            <button
              onClick={toggleFlag}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFlagged
                  ? 'bg-amber-500/20 text-[#F5BA31] border border-[#F5BA31]/50'
                  : 'bg-[#0B111E] text-slate-400 hover:text-white border border-[#28364F]'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-[#F5BA31] text-[#F5BA31]' : ''}`} />
              <span className="hidden sm:inline">{isFlagged ? 'Flagged' : 'Flag Question'}</span>
            </button>
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.question}
          </h3>

          {/* Question Image (if any) */}
          {currentQ.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-[#28364F] bg-black/40 p-2">
              <img
                src={currentQ.imageUrl}
                alt="Exam diagram"
                className="max-h-64 mx-auto object-contain rounded-lg"
              />
            </div>
          )}

          {/* Options (A, B, C, D) Large Touch Targets */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt, optIndex) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === optIndex;
              const letter = String.fromCharCode(65 + optIndex);

              return (
                <button
                  type="button"
                  key={optIndex}
                  onClick={() => handleSelectOption(optIndex)}
                  className={`w-full min-h-[56px] p-4 rounded-xl text-left border flex items-center gap-3.5 transition-all cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'bg-[#1A263B] border-[#F5BA31] ring-2 ring-[#F5BA31]/40 text-white shadow-lg'
                      : 'bg-[#0B111E] border-[#28364F] hover:border-[#F5BA31]/50 text-slate-300 hover:bg-[#16233B]/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                    isSelected ? 'bg-[#F5BA31] text-[#0B111E]' : 'bg-[#1A263B] text-slate-300'
                  }`}>
                    {letter}
                  </div>
                  <span className="text-sm font-semibold leading-snug flex-1">
                    {opt}
                  </span>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-[#F5BA31] shrink-0 shadow-sm shadow-[#F5BA31]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick jump question numbers palette */}
        <div className="p-5 rounded-2xl bg-[#121B2B] border border-[#28364F]">
          <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-3">
            Question Palette
          </span>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isCurr = currentQuestionIndex === idx;
              const flagged = !!flaggedQuestions[idx];

              let bg = 'bg-[#0B111E] border-[#28364F] text-slate-400';
              if (isCurr) {
                bg = 'bg-[#F5BA31] text-[#0B111E] border-[#F5BA31] font-black shadow-lg shadow-[#F5BA31]/20';
              } else if (flagged) {
                bg = 'bg-amber-500/20 text-[#F5BA31] border-[#F5BA31]/50';
              } else if (isAnswered) {
                bg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-xl border text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${bg}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0B111E]/95 backdrop-blur-md border-t border-[#28364F] p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            className="h-11 px-5 rounded-xl bg-[#121B2B] hover:bg-[#1A263B] border border-[#28364F] text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="h-11 px-6 rounded-xl bg-[#F5BA31] hover:bg-[#E5A820] text-[#0B111E] text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-[#F5BA31]/20 cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="h-11 px-7 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/30 cursor-pointer animate-pulse"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Finish & Submit</span>
            </button>
          )}
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121B2B] border border-[#28364F] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#F5BA31]" />
              Confirm Final Submission
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to conclude your assessment for <strong>{quiz.title}</strong>? Once submitted, your score and AI diagnostics will be computed instantly.
            </p>

            <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#28364F] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Questions:</span>
                <span className="font-bold text-white">{quiz.questions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Questions Answered:</span>
                <span>{answeredCount} of {quiz.questions.length}</span>
              </div>
              {quiz.questions.length - answeredCount > 0 && (
                <div className="flex justify-between text-[#F5BA31] font-semibold">
                  <span>Unanswered Questions:</span>
                  <span>{quiz.questions.length - answeredCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 bg-[#0B111E] text-slate-300 text-xs font-bold rounded-xl border border-[#28364F] hover:bg-[#1A263B] cursor-pointer"
              >
                Review More
              </button>
              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-5 py-2 bg-[#F5BA31] hover:bg-[#E5A820] text-[#0B111E] text-xs font-black rounded-xl shadow-lg shadow-[#F5BA31]/20 cursor-pointer"
              >
                Yes, Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
