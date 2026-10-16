import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Search, IdCard, Copy, Check, Sparkles, Filter, X } from 'lucide-react';
import { api } from '../../services/api';
import { Classroom, Student } from '../../types/academy';

export const StudentIDMaker: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('class_9th');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clsList, stuList] = await Promise.all([
        api.getClassrooms(),
        api.getStudents(),
      ]);
      setClassrooms(clsList);
      setStudents(stuList);
      if (clsList.length > 0 && !selectedClassId) {
        setSelectedClassId(clsList[0].id);
      }
    } catch {
      setMessage({ type: 'error', text: 'Error loading student records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateRandomID = () => {
    const classObj = classrooms.find(c => c.id === selectedClassId);
    let classSuffix = '001';
    const randomNum = Math.floor(10 + Math.random() * 90);
    setStudentId(`FA2019-${randomNum}`);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim() || !selectedClassId) {
      setMessage({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }

    try {
      const classObj = classrooms.find(c => c.id === selectedClassId);
      const className = classObj ? classObj.name : 'Class 9th';

      await api.registerStudent(studentId.trim(), name.trim(), selectedClassId, className);
      setMessage({
        type: 'success',
        text: `Student "${name}" registered with ID: ${studentId}`,
      });
      setName('');
      setStudentId('');
      setShowAddModal(false);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to register student record.' });
    }
  };

  const handleDelete = async (id: string, stuName: string) => {
    if (!window.confirm(`Delete record for student ${stuName} (${id})?`)) return;
    try {
      await api.deleteStudent(id);
      setMessage({ type: 'success', text: `Student record deleted.` });
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete student.' });
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format short class name like the screenshot ('9th', '10th', '11th', '12th')
  const formatShortClass = (clsName: string) => {
    if (clsName.includes('9')) return '9th';
    if (clsName.includes('10')) return '10th';
    if (clsName.includes('11')) return '11th';
    if (clsName.includes('12')) return '12th';
    return clsName.replace(/Class\s*/i, '');
  };

  const filteredStudents = students.filter(s => {
    const shortCls = formatShortClass(s.className);
    const matchClass = selectedClassFilter === 'all' ||
      s.classId === selectedClassFilter ||
      shortCls === selectedClassFilter;
    const matchSearch = !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121B2B] border border-[#28364F]">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <IdCard className="w-5 h-5 text-[#F5BA31]" />
            <span>Enrolled Students Registry</span>
            <span className="text-xs font-bold text-[#F5BA31] px-2.5 py-0.5 rounded-full bg-[#F5BA31]/10 border border-[#F5BA31]/30">
              {students.length} Enrolled
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Fawad Academy Samaro Town (FAST) active student directory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#F5BA31] hover:bg-[#E5A820] text-[#0B111E] text-xs font-extrabold rounded-xl shadow-lg shadow-[#F5BA31]/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Student ID</span>
          </button>
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
            ✕
          </button>
        </div>
      )}

      {/* Class Cohort Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedClassFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedClassFilter === 'all'
                ? 'bg-[#F5BA31] text-[#0B111E]'
                : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
            }`}
          >
            All Classes ({students.length})
          </button>
          {['9th', '10th', '11th', '12th'].map((c) => {
            const count = students.filter(s => formatShortClass(s.className) === c).length;
            return (
              <button
                key={c}
                onClick={() => setSelectedClassFilter(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedClassFilter === c
                    ? 'bg-[#F5BA31] text-[#0B111E]'
                    : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
                }`}
              >
                {c} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full bg-[#121B2B] border border-[#28364F] focus:border-[#F5BA31] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
          />
        </div>
      </div>

      {/* Student List View (Matching the exact mobile screenshot) */}
      <div className="rounded-2xl border border-[#28364F] bg-[#121B2B] overflow-hidden shadow-2xl">
        {/* Table Column Header */}
        <div className="grid grid-cols-12 py-3.5 px-4 sm:px-6 bg-[#0B111E]/80 border-b border-[#28364F] text-[11px] font-black uppercase tracking-wider text-slate-400">
          <div className="col-span-4 sm:col-span-4">NAME</div>
          <div className="col-span-4 sm:col-span-4 text-center sm:text-left">STUDENT ID</div>
          <div className="col-span-2 sm:col-span-2 text-center sm:text-left">CLASS</div>
          <div className="col-span-2 sm:col-span-2 text-right">ACTION</div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading registered roster...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400 text-xs">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-[#1F2D44]/70">
            {filteredStudents.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-12 items-center py-3.5 px-4 sm:px-6 hover:bg-[#1A263B]/60 transition-colors"
              >
                {/* Student Name */}
                <div className="col-span-4 sm:col-span-4 font-bold text-white text-xs sm:text-sm truncate">
                  {s.name}
                </div>

                {/* Student ID (Matching screenshot layout: FA2019-XXX) */}
                <div className="col-span-4 sm:col-span-4 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-semibold text-slate-300">
                    <span>{s.id}</span>
                    <button
                      onClick={() => handleCopyId(s.id)}
                      title="Copy Student ID"
                      className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                    >
                      {copiedId === s.id ? (
                        <Check className="w-3.5 h-3.5 text-[#F5BA31]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Class (e.g. 9th, 10th, 11th, 12th) */}
                <div className="col-span-2 sm:col-span-2 text-center sm:text-left">
                  <span className="font-semibold text-xs sm:text-sm text-slate-300">
                    {formatShortClass(s.className)}
                  </span>
                </div>

                {/* Delete Icon (Red trash bin matching user screenshot) */}
                <div className="col-span-2 sm:col-span-2 text-right">
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="p-2 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer inline-flex"
                    title="Remove Student"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121B2B] border border-[#28364F] rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2D44] pb-3 mb-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#F5BA31]" />
                <span>Issue New Student Credential</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Farhan Ali"
                  className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Class <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2.5 text-xs text-white cursor-pointer"
                >
                  <option value="class_9th">Class 9th</option>
                  <option value="class_10th">Class 10th</option>
                  <option value="class_11th">Class 11th</option>
                  <option value="class_12th">Class 12th</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Student ID <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomID}
                    className="text-[10px] text-[#F5BA31] hover:underline font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. FA2019-99"
                  className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2D44]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#0B111E] text-slate-300 text-xs font-semibold rounded-xl border border-[#28364F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F5BA31] hover:bg-[#E5A820] text-[#0B111E] text-xs font-black rounded-xl shadow-md cursor-pointer"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
