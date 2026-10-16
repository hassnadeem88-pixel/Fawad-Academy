import React, { useState, useEffect } from 'react';
import { ArrowLeft, GraduationCap, AlertCircle, CheckCircle, Loader2, Users, Search, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';
import { Classroom, CurrentUser, Student } from '../types/academy';
import { FastLogo } from './FastLogo';

interface StudentLoginProps {
  onBack: () => void;
  onSuccess: (user: CurrentUser) => void;
}

const DEFAULT_CLASSES = [
  { id: 'class_9th', name: 'Class 9th' },
  { id: 'class_10th', name: 'Class 10th' },
  { id: 'class_11th', name: 'Class 11th' },
  { id: 'class_12th', name: 'Class 12th' },
];

export const StudentLogin: React.FC<StudentLoginProps> = ({ onBack, onSuccess }) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('class_9th');
  const [availableClasses, setAvailableClasses] = useState<{ id: string; name: string }[]>(DEFAULT_CLASSES);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  
  const [showRoster, setShowRoster] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterClassFilter, setRosterClassFilter] = useState('all');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);

  useEffect(() => {
    // Load classrooms and students
    api.getClassrooms().then(customClasses => {
      if (customClasses && customClasses.length > 0) {
        setAvailableClasses(customClasses.map(c => ({ id: c.id, name: c.name })));
      }
    }).catch(() => {});

    api.getStudents().then(students => {
      if (students && students.length > 0) {
        setAllStudents(students);
      }
    }).catch(() => {});
  }, []);

  // When student ID changes, check for auto-recognition
  const handleIdChange = (val: string) => {
    setStudentId(val);
    setError(null);
    const clean = val.trim().toLowerCase().replace(/\s+/g, '');
    if (!clean) {
      setRecognizedStudent(null);
      return;
    }
    const match = allStudents.find(s => s.id.toLowerCase().replace(/\s+/g, '') === clean);
    if (match) {
      setRecognizedStudent(match);
      if (!name || name === recognizedStudent?.name) {
        setName(match.name);
      }
      if (match.classId) {
        setSelectedClassId(match.classId);
      }
    } else {
      setRecognizedStudent(null);
    }
  };

  const handleSelectFromRoster = (student: Student) => {
    setStudentId(student.id);
    setName(student.name);
    setSelectedClassId(student.classId);
    setRecognizedStudent(student);
    setShowRoster(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanId = studentId.trim();

    if (!cleanId) {
      setError('Please enter your unique Student ID (e.g. FA2019-00001).');
      return;
    }
    if (!cleanName && !recognizedStudent) {
      setError('Please enter your full student name.');
      return;
    }

    setLoading(true);
    try {
      const selectedClassObj = availableClasses.find(c => c.id === selectedClassId);
      const chosenClassName = selectedClassObj ? selectedClassObj.name : 'Class 9th';

      const res = await api.verifyStudent(cleanId, cleanName || recognizedStudent?.name || 'Student', selectedClassId, chosenClassName);
      
      if (res.success && res.student) {
        const currentUser: CurrentUser = {
          role: 'student',
          name: res.student.name || cleanName,
          studentId: res.student.id,
          classId: res.student.classId || selectedClassId,
          className: res.student.className || chosenClassName,
        };
        onSuccess(currentUser);
      } else {
        setError(res.error || 'Failed to authenticate student.');
      }
    } catch {
      setError('Authentication failed. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoster = allStudents.filter(s => {
    const matchClass = rosterClassFilter === 'all' || s.classId === rosterClassFilter || s.className.toLowerCase().includes(rosterClassFilter);
    const matchQuery = !rosterSearch.trim() ||
      s.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(rosterSearch.toLowerCase());
    return matchClass && matchQuery;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-[#0B111E]">
      <div className="w-full max-w-md bg-[#121B2B] border border-[#28364F] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient gold glow */}
        <div className="absolute top-0 right-0 w-48 h-20 bg-[#F5BA31]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#F5BA31] transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Portal Home</span>
        </button>

        {/* Header with FAST Logo */}
        <div className="flex items-center gap-3.5 mb-6">
          <FastLogo size={52} className="shrink-0" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5BA31]/15 text-[#F5BA31] border border-[#F5BA31]/30">
              Student Assessment
            </span>
            <h2 className="text-xl font-black text-white tracking-tight mt-1">Student Portal Login</h2>
            <p className="text-xs text-slate-300">Enter your credentials to access class quizzes</p>
          </div>
        </div>

        {/* Quick Directory Toggle */}
        {allStudents.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowRoster(!showRoster)}
              className="w-full p-3 rounded-xl bg-[#0B111E] border border-[#F5BA31]/40 hover:border-[#F5BA31] text-xs text-[#F5BA31] font-bold flex items-center justify-between transition-colors cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F5BA31]" />
                <span>Quick Student Roster ({allStudents.length} Enrolled)</span>
              </div>
              {showRoster ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Collapsible Roster Picker */}
            {showRoster && (
              <div className="mt-2 p-3.5 rounded-2xl bg-[#0B111E] border border-[#28364F] space-y-2.5 shadow-2xl">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      placeholder="Search name or ID..."
                      className="w-full bg-[#121B2B] border border-[#28364F] focus:border-[#F5BA31] rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                  <select
                    value={rosterClassFilter}
                    onChange={(e) => setRosterClassFilter(e.target.value)}
                    className="bg-[#121B2B] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-2.5 py-1.5 text-xs text-[#F5BA31] font-bold outline-none cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="class_9th">9th</option>
                    <option value="class_10th">10th</option>
                    <option value="class_11th">11th</option>
                    <option value="class_12th">12th</option>
                  </select>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-[#1F2D44]/60 pr-1">
                  {filteredRoster.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => handleSelectFromRoster(s)}
                      className="w-full text-left py-2 px-2.5 rounded-xl hover:bg-[#1A263B] flex items-center justify-between text-xs text-slate-300 transition-colors group cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-white group-hover:text-[#F5BA31]">{s.name}</span>
                        <span className="text-[10px] text-[#F5BA31] font-mono ml-2 font-bold">{s.id}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F5BA31]/15 text-[#F5BA31] border border-[#F5BA31]/30">
                        {s.className}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {recognizedStudent && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Verified Record: <strong className="text-white">{recognizedStudent.name}</strong> enrolled in <strong className="text-[#F5BA31]">{recognizedStudent.className}</strong>
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field: Student ID */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Student ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => handleIdChange(e.target.value)}
              placeholder="e.g. FA2019-00001, FA2019-21, etc."
              className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono uppercase tracking-wider outline-none transition-colors"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Matches your official Fawad Academy student code
            </p>
          </div>

          {/* Field: Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Full Student Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ayesha / Rafay / Ali"
              className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Field: Class Selection (9th-12th) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Class Selection (9th–12th) <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors cursor-pointer"
            >
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Assessments will be strictly isolated to your class
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#F5BA31] to-[#E5A820] hover:from-[#FBD561] hover:to-[#F5BA31] text-[#0B111E] font-black text-sm rounded-xl shadow-xl shadow-[#F5BA31]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#0B111E]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Student Dashboard</span>
              )}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-4 border-t border-[#1F2D44] text-center">
          <p className="text-[11px] text-slate-400">
            🔒 Proctored examination session. Anti-cheating algorithms actively monitor tab focus.
          </p>
        </div>
      </div>
    </div>
  );
};
