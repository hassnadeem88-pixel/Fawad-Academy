import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, CheckCircle, Clock, BookOpen, AlertCircle, Save, X } from 'lucide-react';
import { api } from '../../services/api';
import { Classroom, QuizQuestion } from '../../types/academy';

interface ManualQuizBuilderProps {
  onQuizCreated: () => void;
}

export const ManualQuizBuilder: React.FC<ManualQuizBuilderProps> = ({ onQuizCreated }) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('class_9th');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q_1',
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.getClassrooms().then((cls) => {
      setClassrooms(cls);
      if (cls.length > 0) {
        setSelectedClassId(cls[0].id);
      }
    });
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}_${questions.length + 1}`,
        question: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      setError('A quiz must contain at least one question.');
      return;
    }
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question = text;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = val;
    setQuestions(updated);
  };

  const setCorrectAnswer = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswerIndex = optIndex;
    setQuestions(updated);
  };

  const updateExplanation = (qIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].explanation = val;
    setQuestions(updated);
  };

  const handleImageUpload = (qIndex: number, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const updated = [...questions];
      updated[qIndex].imageUrl = result;
      setQuestions(updated);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (qIndex: number) => {
    const updated = [...questions];
    delete updated[qIndex].imageUrl;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('Please provide a quiz title.');
      return;
    }

    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question #${i + 1} stem cannot be empty.`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          setError(`Question #${i + 1} Option ${String.fromCharCode(65 + j)} cannot be empty.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const classObj = classrooms.find((c) => c.id === selectedClassId);
      const className = classObj ? classObj.name : 'Class 9th';

      await api.createQuiz({
        title: title.trim(),
        topic: topic.trim() || 'General Subject Assessment',
        classId: selectedClassId || 'class_9th',
        className,
        timeLimitMinutes: Number(timeLimitMinutes) || 15,
        difficulty,
        createdBy: 'FAST Faculty',
        questions,
      });

      setSuccess(`Quiz "${title}" published successfully for ${className}!`);
      setTimeout(() => {
        onQuizCreated();
      }, 1200);
    } catch {
      setError('Failed to save quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Settings Header */}
      <div className="p-6 rounded-2xl bg-[#121B2B] border border-[#28364F] shadow-xl space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-[#1F2D44] pb-3">
          <BookOpen className="w-5 h-5 text-[#F5BA31]" />
          <span>Manual Quiz Builder</span>
        </h3>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quiz Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Quiz Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physics Mid-Term Exam"
              className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Select Class */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Class <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2 text-xs text-white cursor-pointer"
            >
              <option value="class_9th">Class 9th</option>
              <option value="class_10th">Class 10th</option>
              <option value="class_11th">Class 11th</option>
              <option value="class_12th">Class 12th</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Set Timer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Set Timer (Minutes) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="180"
                required
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value, 10) || 10)}
                className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl pl-8 pr-3 py-2 text-xs text-white"
              />
              <Clock className="w-3.5 h-3.5 text-[#F5BA31] absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Topic / Chapter
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Thermodynamics / Cell Structure"
              className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <span>Questions & Answer Key</span>
            <span className="text-xs font-bold text-[#F5BA31]">({questions.length} Questions)</span>
          </h4>

          <button
            type="button"
            onClick={addQuestion}
            className="px-3.5 py-1.5 bg-[#F5BA31]/15 hover:bg-[#F5BA31]/25 text-[#F5BA31] border border-[#F5BA31]/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Next Question</span>
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={q.id || qIndex}
            className="p-5 rounded-2xl bg-[#121B2B] border border-[#28364F] space-y-4 shadow-md relative"
          >
            {/* Question Header */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-0.5 rounded-full bg-[#F5BA31] text-[#0B111E] text-xs font-black font-mono">
                Question #{qIndex + 1}
              </span>

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Question Stem */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Question Text <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={q.question}
                onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                placeholder="Enter the question stem..."
                className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl p-3 text-xs text-white placeholder-slate-500"
              />
            </div>

            {/* Image Upload */}
            <div className="p-3 rounded-xl bg-[#0B111E] border border-[#1F2D44]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    Question Diagram / Image (Optional)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1 bg-[#1A263B] hover:bg-[#25354F] border border-[#28364F] rounded-lg text-[11px] text-slate-300 font-medium cursor-pointer transition-colors">
                    <span>{q.imageUrl ? 'Replace Image' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(qIndex, e.target.files?.[0] || null)}
                    />
                  </label>

                  {q.imageUrl && (
                    <button
                      type="button"
                      onClick={() => removeImage(qIndex)}
                      className="text-red-400 hover:text-red-300 text-[11px] font-medium p-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {q.imageUrl && (
                <div className="mt-3 relative w-fit max-w-sm rounded-xl overflow-hidden border border-[#28364F]">
                  <img src={q.imageUrl} alt="Diagram preview" className="max-h-48 object-contain bg-black/40" />
                </div>
              )}
            </div>

            {/* Options A, B, C, D */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Options & Select Correct Answer <span className="text-red-400">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map((letter, optIndex) => {
                  const isCorrect = q.correctAnswerIndex === optIndex;
                  return (
                    <div
                      key={letter}
                      onClick={() => setCorrectAnswer(qIndex, optIndex)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                        isCorrect
                          ? 'bg-[#F5BA31]/15 border-[#F5BA31] ring-1 ring-[#F5BA31]/40'
                          : 'bg-[#0B111E] border-[#28364F] hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct_q_${qIndex}`}
                        checked={isCorrect}
                        onChange={() => setCorrectAnswer(qIndex, optIndex)}
                        className="text-[#F5BA31] focus:ring-[#F5BA31] cursor-pointer"
                      />
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCorrect ? 'bg-[#F5BA31] text-[#0B111E]' : 'bg-[#1A263B] text-slate-400'
                      }`}>
                        {letter}
                      </span>
                      <input
                        type="text"
                        required
                        value={q.options[optIndex] || ''}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${letter} text...`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent border-0 focus:ring-0 p-1 text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Pedagogical Explanation (Shown to student after completion)
              </label>
              <input
                type="text"
                value={q.explanation || ''}
                onChange={(e) => updateExplanation(qIndex, e.target.value)}
                placeholder="Why is this option correct? (Optional guidance)"
                className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2.5 bg-[#1A263B] hover:bg-[#25354F] text-slate-300 border border-[#28364F] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F5BA31]" />
            <span>Add Another Question</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="h-11 px-7 bg-[#F5BA31] hover:bg-[#E5A820] text-[#0B111E] text-xs font-black rounded-xl shadow-lg shadow-[#F5BA31]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Assessment...' : 'Publish Assessment'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
