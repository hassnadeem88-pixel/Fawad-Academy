import React, { useState } from 'react';
import { Award, CheckCircle, XCircle, ArrowLeft, Clock, ShieldAlert, Sparkles, Loader2, BookOpen, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Quiz, QuizAttempt } from '../../types/academy';
import { api } from '../../services/api';
import { FastLogo } from '../FastLogo';

interface ResultScreenProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onBackToDashboard: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  quiz,
  attempt,
  onBackToDashboard,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleFetchAiExplanation = async (questionId: string, qIndex: number) => {
    const questionObj = quiz.questions[qIndex];
    const answerObj = attempt.answers[qIndex];
    if (!questionObj || !answerObj) return;

    setLoadingAi(prev => ({ ...prev, [questionId]: true }));
    try {
      const selectedText = answerObj.selectedOptionIndex >= 0
        ? questionObj.options[answerObj.selectedOptionIndex]
        : 'Skipped';
      const correctText = questionObj.options[questionObj.correctAnswerIndex];

      const explanation = await api.explainError({
        question: questionObj.question,
        selectedOption: selectedText,
        correctOption: correctText,
        allOptions: questionObj.options,
        topic: quiz.topic,
        className: quiz.className,
      });

      setAiExplanations(prev => ({ ...prev, [questionId]: explanation }));
      setExpandedQuestions(prev => ({ ...prev, [questionId]: true }));
    } catch {
      setAiExplanations(prev => ({
        ...prev,
        [questionId]: questionObj.explanation || 'The selected option was conceptually inaccurate. Review the core definitions in your textbook.',
      }));
      setExpandedQuestions(prev => ({ ...prev, [questionId]: true }));
    } finally {
      setLoadingAi(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const toggleExpand = (qId: string) => {
    setExpandedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Grade badge
  const getGradeInfo = (pct: number) => {
    if (pct >= 90) return { title: 'Outstanding Distinction (A+)', color: 'text-[#F5BA31] bg-[#F5BA31]/15 border-[#F5BA31]/40' };
    if (pct >= 80) return { title: 'First Division (A)', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
    if (pct >= 70) return { title: 'Higher Secondary (B)', color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' };
    if (pct >= 50) return { title: 'Satisfactory Pass (C)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
    return { title: 'Academic Review Required', color: 'text-red-400 bg-red-500/15 border-red-500/30' };
  };

  const grade = getGradeInfo(attempt.percentage);

  const filteredQuestions = quiz.questions.map((q, idx) => ({
    question: q,
    answer: attempt.answers[idx],
    index: idx,
  })).filter(item => {
    if (filterMode === 'correct') return item.answer?.isCorrect;
    if (filterMode === 'incorrect') return !item.answer?.isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Navigation */}
      <button
        onClick={onBackToDashboard}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-[#F5BA31] transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Return to Student Dashboard</span>
      </button>

      {/* Main Scorecard Banner - FAST Gold & Deep Navy */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#121B2B] via-[#16233B] to-[#121B2B] border border-[#28364F] shadow-2xl relative overflow-hidden">
        {/* Ambient gold glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-[#F5BA31]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${grade.color}`}>
                {grade.title}
              </span>
              <span className="text-xs text-[#F5BA31] font-mono font-bold px-2.5 py-0.5 rounded bg-[#F5BA31]/10 border border-[#F5BA31]/30">
                {quiz.className}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Assessment Results: {quiz.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-2 flex-wrap">
              <span>Candidate: <strong className="text-white">{attempt.studentName}</strong></span>
              <span>•</span>
              <span>ID: <strong className="font-mono text-[#F5BA31]">{attempt.studentId}</strong></span>
            </p>
          </div>

          {/* Big Score Dial */}
          <div className="flex items-center gap-4 bg-[#0B111E]/95 p-4 rounded-2xl border border-[#28364F] shrink-0 shadow-inner">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
                Total Marks
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#F5BA31] tracking-tight">
                {attempt.score} <span className="text-lg text-slate-500 font-medium">/ {attempt.totalQuestions}</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-[#F5BA31]/15 border-2 border-[#F5BA31] flex items-center justify-center font-black text-xl text-[#F5BA31] shadow-lg shadow-[#F5BA31]/10">
              {attempt.percentage}%
            </div>
          </div>
        </div>

        {/* Diagnostic Stat Pills */}
        <div className="mt-6 pt-5 border-t border-[#1F2D44] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-[#0B111E]/80 border border-[#28364F]">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Correct Answers</span>
            <span className="text-sm font-extrabold text-emerald-400 flex items-center justify-center gap-1.5 mt-1">
              <CheckCircle className="w-4 h-4" />
              {attempt.score}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B111E]/80 border border-[#28364F]">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Incorrect / Skipped</span>
            <span className="text-sm font-extrabold text-red-400 flex items-center justify-center gap-1.5 mt-1">
              <XCircle className="w-4 h-4" />
              {attempt.totalQuestions - attempt.score}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B111E]/80 border border-[#28364F]">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Time Elapsed</span>
            <span className="text-sm font-bold text-slate-200 flex items-center justify-center gap-1.5 mt-1 font-mono">
              <Clock className="w-4 h-4 text-[#F5BA31]" />
              {formatSeconds(attempt.timeTakenSeconds)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B111E]/80 border border-[#28364F]">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Anti-Cheat Proctoring</span>
            <span className={`text-sm font-bold flex items-center justify-center gap-1.5 mt-1 ${
              attempt.cheatViolations?.length ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {attempt.cheatViolations?.length ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  {attempt.cheatViolations.length} Strike(s)
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Clean Record
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#28364F] pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#F5BA31]" />
          <span>Question-by-Question Diagnostic Review</span>
        </h3>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121B2B] border border-[#28364F] text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterMode === 'all' ? 'bg-[#F5BA31] text-[#0B111E] shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({quiz.questions.length})
          </button>
          <button
            onClick={() => setFilterMode('incorrect')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterMode === 'incorrect' ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Incorrect ({attempt.totalQuestions - attempt.score})
          </button>
          <button
            onClick={() => setFilterMode('correct')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterMode === 'correct' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Correct ({attempt.score})
          </button>
        </div>
      </div>

      {/* Questions Review List */}
      <div className="space-y-4">
        {filteredQuestions.map(({ question, answer, index }) => {
          const isCorrect = answer?.isCorrect;
          const selectedIdx = answer?.selectedOptionIndex ?? -1;
          const correctIdx = question.correctAnswerIndex;
          const qId = question.id || `q_${index}`;
          const hasAiExp = !!aiExplanations[qId];
          const isLoadingAi = !!loadingAi[qId];
          const isExpanded = expandedQuestions[qId];

          return (
            <div
              key={qId}
              className={`p-6 rounded-2xl border transition-all ${
                isCorrect
                  ? 'bg-[#121B2B] border-emerald-500/30'
                  : 'bg-[#121B2B] border-red-500/30 shadow-xl shadow-red-950/20'
              }`}
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#F5BA31]">
                    Question #{index + 1}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isCorrect
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {isCorrect ? 'Correct (+1 Mark)' : 'Incorrect (0 Marks)'}
                  </span>
                </div>

                {/* AI Explanation Trigger for Incorrect Questions */}
                {!isCorrect && (
                  <button
                    onClick={() => handleFetchAiExplanation(qId, index)}
                    disabled={isLoadingAi}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F5BA31]/20 to-amber-500/20 hover:from-[#F5BA31]/30 hover:to-amber-500/30 border border-[#F5BA31]/50 text-[#F5BA31] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5BA31]" />
                        <span>Generating AI Diagnostic...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#F5BA31]" />
                        <span>{hasAiExp ? 'Re-explain with AI' : 'AI Explanation for Error'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Question Stem */}
              <p className="text-sm font-bold text-white leading-relaxed mb-4">
                {question.question}
              </p>

              {/* Diagram */}
              {question.imageUrl && (
                <div className="mb-4">
                  <img src={question.imageUrl} alt="Exam diagram" className="max-h-48 rounded-xl border border-[#28364F]" />
                </div>
              )}

              {/* Options Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {question.options.map((opt, optIdx) => {
                  const wasChosen = selectedIdx === optIdx;
                  const isTheCorrectOne = correctIdx === optIdx;

                  let borderClass = 'border-[#28364F] bg-[#0B111E] text-slate-400';
                  let icon = null;

                  if (isTheCorrectOne) {
                    borderClass = 'border-emerald-500 bg-emerald-500/15 text-emerald-200 font-bold ring-1 ring-emerald-500/40';
                    icon = <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-auto" />;
                  } else if (wasChosen && !isTheCorrectOne) {
                    borderClass = 'border-red-500 bg-red-500/15 text-red-200 font-bold ring-1 ring-red-500/40';
                    icon = <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-auto" />;
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${borderClass}`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isTheCorrectOne
                          ? 'bg-emerald-500 text-black'
                          : wasChosen
                          ? 'bg-red-500 text-white'
                          : 'bg-[#1A263B] text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                      {icon}
                    </div>
                  );
                })}
              </div>

              {/* Static Teacher Explanation */}
              {question.explanation && !hasAiExp && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-[#0B111E] border border-[#1F2D44] text-xs text-slate-300">
                  <span className="font-bold text-[#F5BA31]">Instructor Rationale: </span>
                  {question.explanation}
                </div>
              )}

              {/* Dynamic Gemini AI Explanation Card */}
              {hasAiExp && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#121B2B] to-[#1A263B] border border-[#F5BA31]/40 text-xs text-slate-200 shadow-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-[#F5BA31]/20 pb-2">
                    <span className="font-black text-[#F5BA31] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#F5BA31]" />
                      Gemini AI Diagnostic Explanation
                    </span>
                    <button
                      onClick={() => toggleExpand(qId)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pt-1 whitespace-pre-line leading-relaxed text-slate-300">
                      {aiExplanations[qId]}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Return to Dashboard Footer */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={onBackToDashboard}
          className="h-12 px-8 bg-gradient-to-r from-[#F5BA31] to-[#E5A820] hover:from-[#FBD561] hover:to-[#F5BA31] text-[#0B111E] font-black text-sm rounded-xl shadow-xl shadow-[#F5BA31]/20 flex items-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Portal</span>
        </button>
      </div>
    </div>
  );
};
