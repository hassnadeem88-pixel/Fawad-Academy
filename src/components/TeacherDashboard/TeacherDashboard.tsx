import React, { useState, useEffect } from 'react';
import { Layers, IdCard, BookOpen, Trophy, Plus, Sparkles, Key, Check, Users, HelpCircle } from 'lucide-react';
import { CurrentUser } from '../../types/academy';
import { api } from '../../services/api';
import { ManageClassrooms } from './ManageClassrooms';
import { StudentIDMaker } from './StudentIDMaker';
import { ManualQuizBuilder } from './ManualQuizBuilder';
import { AIQuizBuilder } from './AIQuizBuilder';
import { ManageQuizzes } from './ManageQuizzes';
import { PerformanceTracking } from './PerformanceTracking';
import { FastLogo } from '../FastLogo';

interface TeacherDashboardProps {
  user: CurrentUser;
}

type TabKey = 'students' | 'classes' | 'quizzes' | 'builder' | 'results' | 'security';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('students');
  const [builderMode, setBuilderMode] = useState<'ai' | 'manual'>('ai');
  
  // Quick stats
  const [counts, setCounts] = useState({
    classes: 4,
    students: 58,
    quizzes: 0,
    attempts: 0,
  });

  // Secret codes management
  const [codes, setCodes] = useState<string[]>([]);
  const [newCode, setNewCode] = useState('');
  const [codeMsg, setCodeMsg] = useState<string | null>(null);

  const loadCounts = async () => {
    try {
      const [cls, std, qz, att] = await Promise.all([
        api.getClassrooms(),
        api.getStudents(),
        api.getQuizzes(),
        api.getAttempts(),
      ]);
      setCounts({
        classes: cls.length,
        students: std.length,
        quizzes: qz.length,
        attempts: att.length,
      });
      const currentCodes = await api.getTeacherCodes();
      setCodes(currentCodes);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    loadCounts();
  }, [activeTab]);

  const handleAddCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    await api.addTeacherCode(newCode.trim());
    setNewCode('');
    setCodeMsg('New teacher secret code added to authorized database.');
    loadCounts();
    setTimeout(() => setCodeMsg(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Mobile-style App Bar Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121B2B] border border-[#28364F] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <FastLogo size={52} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Fawad Academy
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#F5BA31] text-[#0B111E]">
                FAST
              </span>
            </div>
            <p className="text-xs text-[#F5BA31] font-semibold tracking-wide">
              Teacher • Admin <span className="text-slate-400 font-normal">({user.name})</span>
            </p>
          </div>
        </div>

        {/* Quick Stats Badges with Gold & Slate Styling */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#0B111E] border border-[#28364F] text-center">
            <span className="text-base font-extrabold text-[#F5BA31] block">{counts.students}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Students</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0B111E] border border-[#28364F] text-center">
            <span className="text-base font-extrabold text-white block">{counts.classes}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Classes</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0B111E] border border-[#28364F] text-center">
            <span className="text-base font-extrabold text-[#F5BA31] block">{counts.quizzes}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Quizzes</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0B111E] border border-[#28364F] text-center">
            <span className="text-base font-extrabold text-white block">{counts.attempts}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Submissions</span>
          </div>
        </div>
      </div>

      {/* Pill Navigation Tabs (Recreated directly from user's app screenshot) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-[#F5BA31] text-[#0B111E] shadow-lg shadow-[#F5BA31]/20 scale-[1.02]'
              : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
          }`}
        >
          <IdCard className="w-4 h-4" />
          <span>Students</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'students' ? 'bg-[#0B111E] text-[#F5BA31]' : 'bg-[#0B111E] text-slate-400'
          }`}>
            {counts.students}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-[#F5BA31] text-[#0B111E] shadow-lg shadow-[#F5BA31]/20 scale-[1.02]'
              : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Classes</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'classes' ? 'bg-[#0B111E] text-[#F5BA31]' : 'bg-[#0B111E] text-slate-400'
          }`}>
            {counts.classes}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'results'
              ? 'bg-[#F5BA31] text-[#0B111E] shadow-lg shadow-[#F5BA31]/20 scale-[1.02]'
              : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Results & Ranks</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'results' ? 'bg-[#0B111E] text-[#F5BA31]' : 'bg-[#0B111E] text-slate-400'
          }`}>
            1st, 2nd, 3rd
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'quizzes'
              ? 'bg-[#F5BA31] text-[#0B111E] shadow-lg shadow-[#F5BA31]/20 scale-[1.02]'
              : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Quizzes</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'quizzes' ? 'bg-[#0B111E] text-[#F5BA31]' : 'bg-[#0B111E] text-slate-400'
          }`}>
            {counts.quizzes}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'builder'
              ? 'bg-[#F5BA31] text-[#0B111E] shadow-lg shadow-[#F5BA31]/20 scale-[1.02]'
              : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI & Manual Quiz Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#F5BA31] text-[#0B111E] shadow-lg shadow-[#F5BA31]/20 scale-[1.02]'
              : 'bg-[#121B2B] text-slate-300 hover:text-white border border-[#28364F]'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Secret Codes</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'students' && (
        <StudentIDMaker />
      )}

      {activeTab === 'classes' && (
        <ManageClassrooms />
      )}

      {activeTab === 'quizzes' && (
        <ManageQuizzes />
      )}

      {activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Sub-toggle: Manual vs AI */}
          <div className="flex items-center justify-center">
            <div className="p-1.5 rounded-2xl bg-[#121B2B] border border-[#28364F] inline-flex items-center gap-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setBuilderMode('ai')}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  builderMode === 'ai'
                    ? 'bg-[#F5BA31] text-[#0B111E] shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Quiz Builder (Gemini 3.8 Flash)</span>
              </button>

              <button
                type="button"
                onClick={() => setBuilderMode('manual')}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  builderMode === 'manual'
                    ? 'bg-[#F5BA31] text-[#0B111E] shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Manual Quiz Builder</span>
              </button>
            </div>
          </div>

          {builderMode === 'ai' ? (
            <AIQuizBuilder onQuizCreated={() => {
              loadCounts();
              setActiveTab('quizzes');
            }} />
          ) : (
            <ManualQuizBuilder onQuizCreated={() => {
              loadCounts();
              setActiveTab('quizzes');
            }} />
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <PerformanceTracking />
      )}

      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-[#121B2B] border border-[#28364F] shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#1F2D44] pb-3">
            <Key className="w-5 h-5 text-[#F5BA31]" />
            <div>
              <h3 className="text-base font-bold text-white">Teacher Secret Access Codes</h3>
              <p className="text-xs text-slate-400">
                Codes verified against database during Teacher Login.
              </p>
            </div>
          </div>

          {codeMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              {codeMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Active Authorized Security Codes:
            </label>
            <div className="flex flex-wrap gap-2">
              {codes.map((c) => (
                <div key={c} className="px-3.5 py-1.5 rounded-xl bg-[#0B111E] border border-[#28364F] font-mono text-xs text-[#F5BA31] font-bold flex items-center gap-2">
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddCode} className="pt-3 border-t border-[#1F2D44] flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. FAWAD-MATH-2025"
              className="bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono uppercase"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-[#F5BA31] hover:bg-[#E5A820] text-[#0B111E] text-xs font-black rounded-xl shadow-md cursor-pointer transition-colors"
            >
              Authorize New Secret Code
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
