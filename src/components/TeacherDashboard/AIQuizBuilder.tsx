import React, { useState, useEffect } from 'react';
import { Sparkles, Upload, FileText, Clock, BookOpen, AlertCircle, CheckCircle, Loader2, Save, Trash2, Edit3, X, Zap } from 'lucide-react';
import { api } from '../../services/api';
import { Classroom, QuizQuestion } from '../../types/academy';

interface AIQuizBuilderProps {
  onQuizCreated: () => void;
}

const DEFAULT_COHORTS = [
  { id: 'class_9th', name: 'Class 9th (Matric-I)' },
  { id: 'class_10th', name: 'Class 10th (Matric-II)' },
  { id: 'class_11th', name: 'Class 11th (FSc-I / Inter)' },
  { id: 'class_12th', name: 'Class 12th (FSc-II / Inter)' },
];

const QUICK_TOPICS = [
  { label: 'Newton\'s Laws of Motion', classId: 'class_9th', diff: 'Medium' as const },
  { label: 'Chemical Bonding & Molecular Shapes', classId: 'class_9th', diff: 'Medium' as const },
  { label: 'Quadratic Equations & Matrices', classId: 'class_10th', diff: 'Hard' as const },
  { label: 'Cell Division, Mitosis & Meiosis', classId: 'class_11th', diff: 'Medium' as const },
  { label: 'Current Electricity & Ohm\'s Law', classId: 'class_12th', diff: 'Medium' as const },
];

export const AIQuizBuilder: React.FC<AIQuizBuilderProps> = ({ onQuizCreated }) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('class_9th');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [numberOfMCQs, setNumberOfMCQs] = useState(5);

  // File Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [contextNotes, setContextNotes] = useState<string>('');

  // Generated Questions state
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.getClassrooms().then((cls) => {
      if (cls && cls.length > 0) {
        setClassrooms(cls);
        setSelectedClassId(cls[0].id);
      } else {
        setSelectedClassId('class_9th');
      }
    }).catch(() => {
      setSelectedClassId('class_9th');
    });
  }, []);

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    setUploadedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
      if (!title) {
        setTitle(`${file.name.replace(/\.[^/.]+$/, '')} Assessment`);
      }
    };
    reader.onerror = () => {
      setError('Unable to read selected file.');
    };
    reader.readAsText(file);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setFileContent('');
  };

  const handleSelectQuickTopic = (item: typeof QUICK_TOPICS[0]) => {
    setTopic(item.label);
    setTitle(`${item.label} Examination`);
    setDifficulty(item.diff);
    const match = classrooms.find(c => c.id === item.classId);
    if (match) setSelectedClassId(match.id);
    else setSelectedClassId(item.classId);
  };

  const getActiveClassName = () => {
    const classObj = classrooms.find((c) => c.id === selectedClassId);
    if (classObj) return classObj.name;
    const defaultObj = DEFAULT_COHORTS.find((c) => c.id === selectedClassId);
    if (defaultObj) return defaultObj.name;
    return 'Class 9th';
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!topic.trim() && !fileContent.trim()) {
      setError('Please provide a Topic or Upload a file/syllabus to generate questions.');
      return;
    }

    setGenerating(true);
    setGenerationStep('Connecting to Gemini AI Engine...');

    try {
      const className = getActiveClassName();

      setGenerationStep(`Formulating ${numberOfMCQs} ${difficulty} questions for ${className}...`);

      const questions = await api.generateAIQuiz({
        topic: topic.trim() || 'Academic Assessment',
        className,
        difficulty,
        numberOfQuestions: numberOfMCQs,
        fileContent: fileContent ? fileContent.slice(0, 10000) : undefined,
        contextNotes: contextNotes.trim() || undefined,
      });

      if (!questions || questions.length === 0) {
        throw new Error('No questions returned by Gemini.');
      }

      setGeneratedQuestions(questions);
      if (!title) {
        setTitle(`${topic || 'Comprehensive'} Examination`);
      }
      setSuccess(`Generated ${questions.length} questions successfully with Gemini! Review options and answer keys below.`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Please check your topic and try again.');
    } finally {
      setGenerating(false);
      setGenerationStep('');
    }
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...generatedQuestions];
    updated[index].question = text;
    setGeneratedQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...generatedQuestions];
    updated[qIndex].options[optIndex] = text;
    setGeneratedQuestions(updated);
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    const updated = [...generatedQuestions];
    updated[qIndex].correctAnswerIndex = optIndex;
    setGeneratedQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = [...generatedQuestions];
    updated.splice(index, 1);
    setGeneratedQuestions(updated);
  };

  const handlePublish = async () => {
    if (generatedQuestions.length === 0) {
      setError('Generate or add questions before publishing.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a quiz title.');
      return;
    }

    setSaving(true);
    try {
      const className = getActiveClassName();

      const classExists = classrooms.some(c => c.id === selectedClassId);
      if (!classExists && selectedClassId.startsWith('class_')) {
        await api.createClassroom(className, 'Standard Academic Division').catch(() => {});
      }

      await api.createQuiz({
        title: title.trim(),
        topic: topic.trim() || 'AI Generated Assessment',
        classId: selectedClassId || 'class_9th',
        className,
        timeLimitMinutes: Number(timeLimitMinutes) || 15,
        difficulty,
        createdBy: 'Gemini AI',
        questions: generatedQuestions,
      });

      setSuccess(`Quiz "${title}" published successfully to ${className}!`);
      setTimeout(() => {
        onQuizCreated();
      }, 1200);
    } catch {
      setError('Failed to publish quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayClasses = classrooms.length > 0 ? classrooms : DEFAULT_COHORTS;

  return (
    <div className="space-y-6">
      {/* Parameter Form */}
      <form onSubmit={handleGenerate} className="p-6 sm:p-7 rounded-2xl bg-[#121B2B] border border-[#28364F] shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2D44] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5BA31]/15 border border-[#F5BA31]/30 flex items-center justify-center text-[#F5BA31] shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">AI Quiz Builder</h3>
              <p className="text-xs text-slate-300">High-grade syllabus-aligned MCQ generation with Gemini 3.8 Flash</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-[#F5BA31] bg-[#F5BA31]/15 border border-[#F5BA31]/30 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#F5BA31] animate-pulse" />
            Gemini AI Engine Connected
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => handleGenerate()}
              className="px-2.5 py-1 rounded bg-red-600/30 hover:bg-red-600/50 text-red-200 text-[11px] font-bold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Quick Topic Chips */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#F5BA31]" />
            <span>Quick Topic Presets (Click to autofill):</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((item, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectQuickTopic(item)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  topic === item.label
                    ? 'bg-[#F5BA31] border-[#F5BA31] text-[#0B111E] shadow-md shadow-[#F5BA31]/20'
                    : 'bg-[#0B111E] border-[#28364F] text-slate-300 hover:border-[#F5BA31]/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Select Class */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Select Class <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3 py-2 text-xs text-white cursor-pointer outline-none"
            >
              {displayClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Set Timer */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
              />
              <Clock className="w-3.5 h-3.5 text-[#F5BA31] absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Number of MCQs */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Number of MCQs <span className="text-red-400">*</span>
            </label>
            <select
              value={numberOfMCQs}
              onChange={(e) => setNumberOfMCQs(parseInt(e.target.value, 10))}
              className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3 py-2 text-xs text-white cursor-pointer outline-none"
            >
              <option value={3}>3 MCQs (Rapid Drill)</option>
              <option value={5}>5 MCQs (Standard Quiz)</option>
              <option value={10}>10 MCQs (Comprehensive)</option>
              <option value={15}>15 MCQs (Term Assessment)</option>
              <option value={20}>20 MCQs (Grand Mock Exam)</option>
            </select>
          </div>

          {/* Topic */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Topic / Subject Concept <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Newton's 3 Laws of Motion & Friction, or Trigonometric Ratios"
              className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    difficulty === lvl
                      ? 'bg-[#F5BA31] border-[#F5BA31] text-[#0B111E] shadow-sm font-black'
                      : 'bg-[#0B111E] border-[#28364F] text-slate-300 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Files & Context */}
        <div className="p-4 rounded-xl bg-[#0B111E] border border-[#28364F] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#F5BA31]" />
              <span>Upload Notes / Syllabus Text Files (Optional)</span>
            </label>
            {uploadedFile && (
              <button
                type="button"
                onClick={removeUploadedFile}
                className="text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1 font-semibold cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="w-full sm:w-auto px-4 py-2 bg-[#16233B] hover:bg-[#1A263B] border border-[#28364F] rounded-xl text-xs text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <FileText className="w-4 h-4 text-[#F5BA31]" />
              <span>{uploadedFile ? 'Replace Document' : 'Browse File (.txt, .md, notes)'}</span>
              <input
                type="file"
                accept=".txt,.md,.json,.csv"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              />
            </label>

            <span className="text-xs text-slate-400">
              {uploadedFile ? (
                <span className="text-[#F5BA31] font-mono font-bold">
                  {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB loaded)
                </span>
              ) : (
                'Attach textbook excerpts or notes to guide MCQ formulation'
              )}
            </span>
          </div>

          <div>
            <textarea
              rows={2}
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Or paste textbook excerpts, key formulas, or specific subtopics here..."
              className="w-full bg-[#121B2B] border border-[#28364F] focus:border-[#F5BA31] rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            {generating && (
              <span className="text-[#F5BA31] flex items-center gap-2 font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-[#F5BA31]" />
                <span>{generationStep || 'Synthesizing MCQs...'}</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-[#F5BA31] to-[#E5A820] hover:from-[#FBD561] hover:to-[#F5BA31] text-[#0B111E] text-xs font-black rounded-xl shadow-xl shadow-[#F5BA31]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98]"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0B111E]" />
                <span>Generating {numberOfMCQs} MCQs with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#0B111E]" />
                <span>Generate {numberOfMCQs} MCQs with AI</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Preview & Publish Section */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-[#121B2B] border border-[#F5BA31]/40 shadow-xl">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <span>AI Generated Questions</span>
                <span className="text-xs text-[#F5BA31] font-bold">({generatedQuestions.length} Questions Ready)</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Review, modify options, or correct answers before committing to the exam repository.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quiz Title..."
                className="bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="h-10 px-5 bg-gradient-to-r from-[#F5BA31] to-[#E5A820] hover:from-[#FBD561] hover:to-[#F5BA31] text-[#0B111E] text-xs font-black rounded-xl shadow-lg shadow-[#F5BA31]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Publishing...' : 'Publish to Students'}</span>
              </button>
            </div>
          </div>

          {generatedQuestions.map((q, qIndex) => (
            <div
              key={q.id || qIndex}
              className="p-6 rounded-2xl bg-[#121B2B] border border-[#28364F] space-y-3 relative shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#F5BA31]/15 text-[#F5BA31] border border-[#F5BA31]/30 text-xs font-black font-mono">
                  Question #{qIndex + 1}
                </span>

                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove this question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={q.question}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = q.correctAnswerIndex === optIndex;
                  return (
                    <div
                      key={optIndex}
                      onClick={() => setCorrectOption(qIndex, optIndex)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                        isCorrect
                          ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : 'bg-[#0B111E] border-[#28364F] hover:border-[#F5BA31]/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`ai_correct_${qIndex}`}
                        checked={isCorrect}
                        onChange={() => setCorrectOption(qIndex, optIndex)}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCorrect ? 'bg-emerald-500 text-black' : 'bg-[#1A263B] text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOptionText(qIndex, optIndex, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent border-0 focus:ring-0 p-0 text-xs text-white"
                      />
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="text-[11px] text-slate-300 bg-[#0B111E] p-3 rounded-xl border border-[#1F2D44]">
                  <span className="font-bold text-[#F5BA31]">Pedagogical Rationale: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving}
              className="h-12 px-8 bg-gradient-to-r from-[#F5BA31] to-[#E5A820] hover:from-[#FBD561] hover:to-[#F5BA31] text-[#0B111E] text-xs font-black rounded-xl shadow-xl shadow-[#F5BA31]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Assessment...' : `Publish Assessment (${generatedQuestions.length} Questions)`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
