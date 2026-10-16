import React, { useState, useEffect } from 'react';
import { Trash2, Clock, BookOpen, Layers, Eye, Sparkles, AlertCircle, X, CheckCircle, Check } from 'lucide-react';
import { api } from '../../services/api';
import { Classroom, Quiz } from '../../types/academy';

interface ManageQuizzesProps {
  onAttemptQuiz?: (quiz: Quiz) => void;
}

export const ManageQuizzes: React.FC<ManageQuizzesProps> = ({ onAttemptQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qList, cList] = await Promise.all([
        api.getQuizzes(),
        api.getClassrooms(),
      ]);
      setQuizzes(qList);
      setClassrooms(cList);
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch quizzes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete and remove quiz: "${title}"?`)) return;

    try {
      await api.deleteQuiz(id);
      setMessage({ type: 'success', text: `Quiz "${title}" removed successfully.` });
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete quiz.' });
    }
  };

  const filteredQuizzes = selectedClassFilter === 'all'
    ? quizzes
    : quizzes.filter(q => q.classId === selectedClassFilter);

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121B2B] border border-[#28364F]">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#F5BA31]" />
            <span>Active Assessments Repository</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage, review, or delete active examinations assigned to students.
          </p>
        </div>

        {/* Filter by class */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#F5BA31]">Class:</label>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer"
          >
            <option value="all">All Classes ({quizzes.length})</option>
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quizzes List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading assessment repository...</div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-[#121B2B] border border-[#28364F] text-slate-400">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-white">No Quizzes Available</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {quizzes.length === 0
              ? 'Use the AI Quiz Builder or Manual Quiz Builder to create your first assessment.'
              : 'No quizzes found for the selected class filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-5 rounded-2xl bg-[#121B2B] border border-[#28364F] hover:border-[#F5BA31]/60 transition-all flex flex-col justify-between shadow-md group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F5BA31]/15 text-[#F5BA31] border border-[#F5BA31]/30 text-[10px] font-black font-mono">
                    {quiz.className}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    quiz.difficulty === 'Hard'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : quiz.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-[#F5BA31] transition-colors leading-snug">
                  {quiz.title}
                </h4>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Topic: {quiz.topic}
                </p>

                {/* Metadata */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300 bg-[#0B111E] p-2.5 rounded-xl border border-[#1F2D44]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F5BA31]" />
                    <span>{quiz.timeLimitMinutes} Mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>{quiz.questions.length} Questions</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-[#1F2D44] flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewQuiz(quiz)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1A263B] hover:bg-[#25354F] text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#F5BA31]" />
                  <span>Preview</span>
                </button>

                {/* Delete / Remove Button */}
                <button
                  onClick={() => handleDelete(quiz.id, quiz.title)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Delete/Remove Quiz"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Preview Modal */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] bg-[#0F172A] border border-[#334155] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{previewQuiz.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {previewQuiz.className} • {previewQuiz.questions.length} MCQs • {previewQuiz.timeLimitMinutes} Minutes
                </p>
              </div>
              <button
                onClick={() => setPreviewQuiz(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions preview content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {previewQuiz.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-xl bg-[#090D16] border border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      Q{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Correct Key: Option {String.fromCharCode(65 + q.correctAnswerIndex)}
                    </span>
                  </div>

                  <p className="text-xs text-white font-medium">{q.question}</p>

                  {q.imageUrl && (
                    <img src={q.imageUrl} alt="Diagram" className="max-h-40 rounded-lg border border-[#334155]" />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswerIndex;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-lg text-xs flex items-center gap-2 border ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium'
                              : 'bg-[#0F172A] border-[#334155] text-slate-400'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isCorrect ? 'bg-emerald-500 text-black' : 'bg-[#1E293B] text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <p className="text-[11px] text-slate-400 pt-1">
                      <span className="text-emerald-400 font-semibold">Explanation: </span>
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#1E293B] flex justify-end">
              <button
                onClick={() => setPreviewQuiz(null)}
                className="px-4 py-2 bg-[#1E293B] hover:bg-[#2A374A] text-white text-xs font-semibold rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
