import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, ShieldAlert, CheckCircle, XCircle, Clock, Calendar, Search, User, Filter, ArrowLeft, Printer, Eye, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Classroom, Quiz, QuizAttempt } from '../../types/academy';

export const PerformanceTracking: React.FC = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedQuizFilter, setSelectedQuizFilter] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Detailed modal/drilldown
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attList, qList, cList] = await Promise.all([
          api.getAttempts(),
          api.getQuizzes(),
          api.getClassrooms(),
        ]);
        setAttempts(attList);
        setQuizzes(qList);
        setClassrooms(cList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered attempts
  const filteredAttempts = attempts.filter((att) => {
    const matchQuiz = selectedQuizFilter === 'all' || att.quizId === selectedQuizFilter;
    const matchClass = selectedClassFilter === 'all' || att.classId === selectedClassFilter;
    return matchQuiz && matchClass;
  });

  // Sort by score desc, then by time taken asc
  const sortedLeaderboard = [...filteredAttempts].sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return a.timeTakenSeconds - b.timeTakenSeconds;
  });

  const firstPlace = sortedLeaderboard[0] || null;
  const secondPlace = sortedLeaderboard[1] || null;
  const thirdPlace = sortedLeaderboard[2] || null;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121B2B] border border-[#28364F] shadow-xl">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F5BA31]" />
            Academic Performance & Leaderboard
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Track student rankings (1st, 2nd, 3rd), assessment percentiles, and anti-cheating audit trails.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quiz Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Quiz:</span>
            <select
              value={selectedQuizFilter}
              onChange={(e) => setSelectedQuizFilter(e.target.value)}
              className="bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">All Quizzes</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">All Classes</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading performance data...</div>
      ) : sortedLeaderboard.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#121B2B] border border-[#28364F] text-slate-400 shadow-xl">
          <Trophy className="w-12 h-12 text-[#F5BA31]/40 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Assessment Attempts Recorded Yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            The database is initialized as empty. When students complete assessments, rankings, podium scores, and anti-cheating records will appear here in real-time.
          </p>
        </div>
      ) : (
        <>
          {/* Podium (1st, 2nd, 3rd) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 pb-2">
            {/* 2nd Place */}
            {secondPlace ? (
              <div className="order-2 md:order-1 p-5 rounded-2xl bg-[#121B2B] border border-slate-400/40 shadow-xl flex flex-col items-center text-center relative hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-full bg-slate-400/10 border-2 border-slate-300 flex items-center justify-center text-slate-200 font-bold text-lg mb-3 shadow-inner">
                  2
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-400/10 text-slate-300 text-[10px] font-bold border border-slate-400/30 mb-2">
                  <Medal className="w-3 h-3 text-slate-300" />
                  <span>Silver Rank</span>
                </div>
                <h4 className="font-bold text-white text-base">{secondPlace.studentName}</h4>
                <p className="text-[11px] text-[#F5BA31] font-mono mt-0.5">ID: {secondPlace.studentId}</p>
                <div className="mt-3 w-full pt-3 border-t border-[#1F2D44] flex items-center justify-around text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Score</span>
                    <span className="font-bold text-slate-200">{secondPlace.score}/{secondPlace.totalQuestions} ({secondPlace.percentage}%)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Time</span>
                    <span className="font-mono text-slate-300">{formatSeconds(secondPlace.timeTakenSeconds)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="order-2 md:order-1 p-5 rounded-2xl bg-[#121B2B]/40 border border-[#28364F] text-center text-slate-500 text-xs">
                Awaiting 2nd Place Contender
              </div>
            )}

            {/* 1st Place (Champion) - FAST Gold Accents */}
            {firstPlace && (
              <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-[#1A263B] to-[#121B2B] border-2 border-[#F5BA31] shadow-2xl shadow-[#F5BA31]/15 flex flex-col items-center text-center relative -translate-y-2 hover:scale-[1.02] transition-transform">
                <div className="absolute -top-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#F5BA31] to-[#E5A820] text-[#0B111E] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Trophy className="w-3 h-3" />
                  <span>Gold Champion</span>
                </div>
                <div className="w-16 h-16 rounded-full bg-[#F5BA31]/20 border-2 border-[#F5BA31] flex items-center justify-center text-[#F5BA31] font-extrabold text-2xl my-3 shadow-lg shadow-[#F5BA31]/20">
                  1
                </div>
                <h4 className="font-black text-white text-lg tracking-tight">{firstPlace.studentName}</h4>
                <p className="text-xs text-[#F5BA31] font-mono font-bold mt-0.5">ID: {firstPlace.studentId}</p>
                <div className="mt-4 w-full pt-3 border-t border-[#F5BA31]/30 flex items-center justify-around text-xs">
                  <div>
                    <span className="text-[10px] text-slate-300 block">Score</span>
                    <span className="font-black text-[#F5BA31] text-sm">{firstPlace.score}/{firstPlace.totalQuestions} ({firstPlace.percentage}%)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block">Time</span>
                    <span className="font-mono text-white font-bold">{formatSeconds(firstPlace.timeTakenSeconds)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {thirdPlace ? (
              <div className="order-3 p-5 rounded-2xl bg-[#121B2B] border border-amber-700/50 shadow-xl flex flex-col items-center text-center relative hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-full bg-amber-900/20 border-2 border-amber-600 flex items-center justify-center text-amber-500 font-bold text-lg mb-3 shadow-inner">
                  3
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-900/20 text-amber-400 text-[10px] font-bold border border-amber-700/30 mb-2">
                  <Medal className="w-3 h-3 text-amber-500" />
                  <span>Bronze Rank</span>
                </div>
                <h4 className="font-bold text-white text-base">{thirdPlace.studentName}</h4>
                <p className="text-[11px] text-[#F5BA31] font-mono mt-0.5">ID: {thirdPlace.studentId}</p>
                <div className="mt-3 w-full pt-3 border-t border-[#1F2D44] flex items-center justify-around text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Score</span>
                    <span className="font-bold text-slate-200">{thirdPlace.score}/{thirdPlace.totalQuestions} ({thirdPlace.percentage}%)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Time</span>
                    <span className="font-mono text-slate-300">{formatSeconds(thirdPlace.timeTakenSeconds)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="order-3 p-5 rounded-2xl bg-[#121B2B]/40 border border-[#28364F] text-center text-slate-500 text-xs">
                Awaiting 3rd Place Contender
              </div>
            )}
          </div>

          {/* Detailed All Attempts Table */}
          <div className="space-y-3 pt-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#F5BA31]" />
              <span>Full Candidate Performance Register</span>
              <span className="text-xs text-slate-400 font-normal">({sortedLeaderboard.length} Attempts)</span>
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-[#28364F] bg-[#121B2B] shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#16233B] text-slate-300 font-bold border-b border-[#28364F]">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Assessment</th>
                    <th className="py-3 px-4">Score & %</th>
                    <th className="py-3 px-4">Time Taken</th>
                    <th className="py-3 px-4">Anti-Cheat Flags</th>
                    <th className="py-3 px-4 text-right">Diagnostic Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2D44]">
                  {sortedLeaderboard.map((att, idx) => {
                    const hasViolations = att.cheatViolations && att.cheatViolations.length > 0;
                    return (
                      <tr key={att.id} className="hover:bg-[#1A263B]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold">
                          {idx === 0 ? (
                            <span className="text-[#F5BA31] font-black flex items-center gap-1">🥇 #1</span>
                          ) : idx === 1 ? (
                            <span className="text-slate-300 font-black flex items-center gap-1">🥈 #2</span>
                          ) : idx === 2 ? (
                            <span className="text-amber-500 font-black flex items-center gap-1">🥉 #3</span>
                          ) : (
                            <span className="text-slate-400">#{idx + 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-white">{att.studentName}</p>
                          <span className="text-[10px] text-[#F5BA31] font-mono">ID: {att.studentId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-200">{att.quizTitle}</p>
                          <span className="text-[10px] text-blue-400 font-semibold">{att.className}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-md font-bold text-xs ${
                            att.percentage >= 80
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : att.percentage >= 50
                              ? 'bg-[#F5BA31]/15 text-[#F5BA31] border border-[#F5BA31]/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {att.score}/{att.totalQuestions} ({att.percentage}%)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {formatSeconds(att.timeTakenSeconds)}
                        </td>
                        <td className="py-3 px-4">
                          {hasViolations ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 font-semibold text-[11px]">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>{att.cheatViolations.length} Lockout(s)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px]">
                              <CheckCircle className="w-3 h-3" />
                              <span>Clean</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedAttempt(att)}
                            className="px-3 py-1.5 rounded-xl bg-[#1A263B] hover:bg-[#F5BA31] hover:text-[#0B111E] text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 border border-[#28364F] transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Report</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Individual Report Diagnostic Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[90vh] bg-[#121B2B] border border-[#28364F] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1F2D44] flex items-center justify-between bg-[#16233B]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Candidate Performance Report</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#F5BA31]/20 text-[#F5BA31] border border-[#F5BA31]/40 font-bold">
                    {selectedAttempt.className}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Fawad Academy Official Proctoring & Assessment Audit
                </p>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1F2D44] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scorecard Summary */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#28364F]">
                  <span className="text-[11px] text-slate-400 block">Candidate</span>
                  <span className="text-sm font-bold text-white block mt-0.5">{selectedAttempt.studentName}</span>
                  <span className="text-[10px] text-[#F5BA31] font-mono">ID: {selectedAttempt.studentId}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#28364F]">
                  <span className="text-[11px] text-slate-400 block">Score & Accuracy</span>
                  <span className="text-sm font-black text-emerald-400 block mt-0.5">
                    {selectedAttempt.score} / {selectedAttempt.totalQuestions}
                  </span>
                  <span className="text-[10px] text-slate-300 font-semibold">{selectedAttempt.percentage}% Total Marks</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#28364F]">
                  <span className="text-[11px] text-slate-400 block">Duration Taken</span>
                  <span className="text-sm font-bold text-white block mt-0.5">
                    {formatSeconds(selectedAttempt.timeTakenSeconds)}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(selectedAttempt.submittedAt).toLocaleDateString()}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B111E] border border-[#28364F]">
                  <span className="text-[11px] text-slate-400 block">Integrity Status</span>
                  {selectedAttempt.cheatViolations?.length ? (
                    <span className="text-sm font-bold text-red-400 block mt-0.5">
                      ⚠️ {selectedAttempt.cheatViolations.length} Violations
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                      ✓ Clean Exam
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">Tab-Switch Monitor</span>
                </div>
              </div>

              {/* Anti-Cheating Violation Logs */}
              {selectedAttempt.cheatViolations && selectedAttempt.cheatViolations.length > 0 && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Proctoring Incident Log (Anti-Cheating Triggered)
                  </h4>
                  <div className="space-y-1.5 text-xs text-red-300">
                    {selectedAttempt.cheatViolations.map((v, vIdx) => (
                      <div key={vIdx} className="flex items-center justify-between bg-red-950/40 p-2.5 rounded-lg border border-red-500/20">
                        <span>Incident #{vIdx + 1}: {v.type || 'Tab Switch Detected'}</span>
                        <span className="font-mono text-[10px] text-red-300/80">
                          {new Date(v.timestamp).toLocaleTimeString()} • 5-Min Lockout Enforced
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakdown Answers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Itemized Question Performance
                </h4>

                <div className="space-y-2">
                  {selectedAttempt.answers.map((ans, aIdx) => (
                    <div
                      key={ans.questionId || aIdx}
                      className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                        ans.isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-red-500/10 border-red-500/30 text-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {ans.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span className="font-semibold text-white">
                          Question #{aIdx + 1}: Selected Option {ans.selectedOptionIndex >= 0 ? String.fromCharCode(65 + ans.selectedOptionIndex) : 'Skipped'}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        ans.isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {ans.isCorrect ? '+1 Mark (Correct)' : '0 Marks (Incorrect)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#1F2D44] flex justify-end gap-2 bg-[#16233B]">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#121B2B] hover:bg-[#1A263B] text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-[#28364F] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#F5BA31]" />
                <span>Print Diagnostic Record</span>
              </button>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="px-4 py-2 bg-[#F5BA31] hover:bg-[#E5A820] text-[#0B111E] text-xs font-black rounded-xl cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
