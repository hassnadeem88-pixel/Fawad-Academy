import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Layers, Award, ShieldCheck, ChevronRight, CheckCircle, AlertCircle, History, Trophy, Sparkles } from 'lucide-react';
import { CurrentUser, Quiz, QuizAttempt } from '../../types/academy';
import { api } from '../../services/api';
import { FastLogo } from '../FastLogo';

interface StudentDashboardProps {
  student: CurrentUser;
  onStartQuiz: (quiz: Quiz) => void;
  onViewResult: (quiz: Quiz, attempt: QuizAttempt) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onStartQuiz,
  onViewResult,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      // Fetch ONLY quizzes for the student's assigned class!
      const [classQuizzes, studentAttempts] = await Promise.all([
        api.getQuizzes(student.classId),
        api.getAttempts({ studentId: student.studentId }),
      ]);
      setQuizzes(classQuizzes);
      setAttempts(studentAttempts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [student.classId, student.studentId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Student Profile Card - FAST Academy Navy & Gold Theme */}
      <div className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#121B2B] via-[#162238] to-[#121B2B] border border-[#28364F] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        {/* Ambient gold glow */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-[#F5BA31]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <FastLogo size={64} className="shrink-0 drop-shadow-lg" />
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5BA31]/15 text-[#F5BA31] border border-[#F5BA31]/30">
                Student Assessment Desk
              </span>
              <span className="text-xs text-slate-400">Class Cohort:</span>
              <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded-md bg-[#2563EB] border border-blue-400/40 shadow-sm">
                {student.className || 'Assigned Class'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {student.name}
            </h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
              <span>Student ID: <strong className="font-mono text-[#F5BA31] font-bold">{student.studentId}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Anti-Cheat Proctoring Enabled
              </span>
            </p>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-[#0B111E]/90 border border-[#28364F] text-center min-w-[105px] shadow-inner">
            <span className="text-2xl font-black text-[#F5BA31] block tabular-numbers">{quizzes.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Assigned</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B111E]/90 border border-[#28364F] text-center min-w-[105px] shadow-inner">
            <span className="text-2xl font-black text-emerald-400 block tabular-numbers">{attempts.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Completed</span>
          </div>
        </div>
      </div>

      {/* Tabs: Available Assessments vs Completed Record */}
      <div className="flex items-center gap-2 border-b border-[#28364F] pb-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'available'
              ? 'bg-[#F5BA31] text-[#0B111E] shadow-lg shadow-[#F5BA31]/20 font-black'
              : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Assigned Class Quizzes ({quizzes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#F5BA31] text-[#0B111E] shadow-lg shadow-[#F5BA31]/20 font-black'
              : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Completed Exams ({attempts.length})</span>
        </button>
      </div>

      {/* Tab: Available Quizzes */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5BA31]" />
              <span>Examinations Scheduled for {student.className}</span>
            </h3>
            <span className="text-xs text-amber-300/80 font-medium">Classroom Filter Locked</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading class assessments...</div>
          ) : quizzes.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#121B2B] border border-[#28364F] text-slate-400 shadow-xl">
              <BookOpen className="w-12 h-12 text-[#F5BA31]/40 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">No Quizzes Assigned for {student.className}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Your instructor has not yet published exams for this class cohort. Assessments will appear here immediately once scheduled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-6 rounded-2xl bg-[#121B2B] border border-[#28364F] hover:border-[#F5BA31]/60 shadow-xl transition-all duration-200 flex flex-col justify-between group hover:shadow-2xl hover:shadow-[#F5BA31]/5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#F5BA31]/15 text-[#F5BA31] border border-[#F5BA31]/30">
                        {quiz.className}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        quiz.difficulty === 'Hard'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : quiz.difficulty === 'Medium'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {quiz.difficulty || 'Standard'}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white group-hover:text-[#F5BA31] transition-colors leading-snug">
                      {quiz.title}
                    </h4>
                    
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                      <span className="text-slate-500">Topic:</span>
                      <span className="text-slate-300 font-medium truncate">{quiz.topic}</span>
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#1F2D44] flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#F5BA31]" />
                        <span>{quiz.timeLimitMinutes || 15} Mins</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span>{quiz.questions.length} MCQs</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => onStartQuiz(quiz)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F5BA31] to-[#E5A820] hover:from-[#FBD561] hover:to-[#F5BA31] text-[#0B111E] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#F5BA31]/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>Start Assessment</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-2">
                      ⚠️ 5-Min lockout applies on tab switch
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Completed Exams History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F5BA31]" />
              <span>Assessment Performance Record</span>
            </h3>
            <span className="text-xs text-slate-400">{attempts.length} Finished</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading exam history...</div>
          ) : attempts.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#121B2B] border border-[#28364F] text-slate-400">
              <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white">No Completed Assessments</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                You haven't attempted any exams yet. Start an assigned quiz to see detailed score breakdowns and AI diagnostics.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => {
                const targetQuiz = quizzes.find((q) => q.id === attempt.quizId) || {
                  id: attempt.quizId,
                  title: attempt.quizTitle,
                  className: attempt.className,
                  topic: 'Assessment',
                  timeLimitMinutes: 15,
                  questions: [],
                  createdAt: attempt.submittedAt,
                  difficulty: 'Medium' as const,
                };

                const isPassing = attempt.percentage >= 50;

                return (
                  <div
                    key={attempt.id}
                    className="p-5 rounded-2xl bg-[#121B2B] border border-[#28364F] hover:border-[#F5BA31]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{attempt.quizTitle}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          isPassing ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}>
                          {isPassing ? 'PASSED' : 'NEEDS REVIEW'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Class: {attempt.className}</span>
                        <span>•</span>
                        <span>Completed: {new Date(attempt.submittedAt).toLocaleDateString()}</span>
                        {attempt.cheatViolations?.length ? (
                          <>
                            <span>•</span>
                            <span className="text-red-400 font-semibold">
                              ⚠️ {attempt.cheatViolations.length} Tab-Switch Lockouts
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-2xl font-black ${isPassing ? 'text-[#F5BA31]' : 'text-red-400'}`}>
                          {attempt.percentage}%
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {attempt.score} / {attempt.totalQuestions} Marks
                        </span>
                      </div>

                      <button
                        onClick={() => onViewResult(targetQuiz as Quiz, attempt)}
                        className="px-4 py-2 rounded-xl bg-[#1A263B] hover:bg-[#F5BA31] hover:text-[#0B111E] border border-[#28364F] text-xs font-bold text-white transition-all cursor-pointer shrink-0"
                      >
                        View AI Diagnostics
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
