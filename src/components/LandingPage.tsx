import React from 'react';
import { GraduationCap, Briefcase, ShieldCheck, Sparkles, BookOpen, ChevronRight, Award, Star } from 'lucide-react';
import { FastLogo } from './FastLogo';

interface LandingPageProps {
  onSelectStudent: () => void;
  onSelectTeacher: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectStudent,
  onSelectTeacher,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden bg-[#0B111E]">
      {/* Background ambient gold & slate illumination */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#F5BA31]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[250px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* FAST Logo Emblem */}
        <div className="mb-6 relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#F5BA31]/30 to-[#D99B16]/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
          <FastLogo size={120} className="relative transform group-hover:scale-105 transition-transform duration-300" />
        </div>

        {/* Brand Insignia Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121B2B] border border-[#F5BA31]/40 text-xs font-bold text-[#F5BA31] mb-5 shadow-lg shadow-black/40">
          <Star className="w-3.5 h-3.5 fill-[#F5BA31] text-[#F5BA31]" />
          <span>Fawad Academy Samaro Town (FAST) Official Portal</span>
          <Star className="w-3.5 h-3.5 fill-[#F5BA31] text-[#F5BA31]" />
        </div>

        {/* Centered Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Fawad Academy
        </h1>
        
        {/* Banner with Samaro Town (FAST) */}
        <div className="mt-3 inline-block px-5 py-1.5 rounded-xl bg-[#F5BA31] text-[#0B111E] font-extrabold text-lg sm:text-2xl tracking-wide shadow-xl shadow-[#F5BA31]/20">
          SAMARO TOWN (FAST)
        </div>

        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
          Premium Digital Assessment & Learning Management System
        </p>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
          Classes 9th–12th exam division with AI quiz synthesis, strict anti-cheating lockout, and performance analytics.
        </p>

        {/* Two Large Main Buttons */}
        <div className="mt-10 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* I am a Student */}
          <button
            onClick={onSelectStudent}
            className="group relative flex flex-col items-start text-left p-6 sm:p-7 rounded-2xl bg-[#121B2B] hover:bg-[#1A263B] border border-[#28364F] hover:border-[#F5BA31] shadow-2xl shadow-black/60 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#F5BA31]/15 border border-[#F5BA31]/40 flex items-center justify-center text-[#F5BA31] mb-5 group-hover:scale-105 group-hover:bg-[#F5BA31] group-hover:text-[#0B111E] transition-all">
              <GraduationCap className="w-7 h-7" />
            </div>
            
            <div className="flex items-center justify-between w-full">
              <h2 className="text-2xl font-extrabold text-white group-hover:text-[#F5BA31] transition-colors">
                I am a Student
              </h2>
              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-[#F5BA31] group-hover:translate-x-1 transition-all" />
            </div>

            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Enter your Student ID and assigned Class to attempt timed assessments, monitor scores, and receive AI error diagnostics.
            </p>

            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#F5BA31] group-hover:underline">
              <span>Access Student Desk</span>
              <span className="text-base leading-none">→</span>
            </div>
          </button>

          {/* I am a Teacher */}
          <button
            onClick={onSelectTeacher}
            className="group relative flex flex-col items-start text-left p-6 sm:p-7 rounded-2xl bg-[#121B2B] hover:bg-[#1A263B] border border-[#28364F] hover:border-[#F5BA31] shadow-2xl shadow-black/60 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#F5BA31]/15 border border-[#F5BA31]/40 flex items-center justify-center text-[#F5BA31] mb-5 group-hover:scale-105 group-hover:bg-[#F5BA31] group-hover:text-[#0B111E] transition-all">
              <Briefcase className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-between w-full">
              <h2 className="text-2xl font-extrabold text-white group-hover:text-[#F5BA31] transition-colors">
                I am a Teacher
              </h2>
              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-[#F5BA31] group-hover:translate-x-1 transition-all" />
            </div>

            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Instructor portal to manage class rosters, 58 enrolled students, build AI/manual quizzes, and view live podium rankings.
            </p>

            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#F5BA31] group-hover:underline">
              <span>Enter Faculty Portal</span>
              <span className="text-base leading-none">→</span>
            </div>
          </button>
        </div>

        {/* Feature Badges Footer */}
        <div className="mt-12 pt-8 border-t border-[#1F2D44] w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#121B2B]/60 border border-[#28364F]">
            <ShieldCheck className="w-5 h-5 text-[#F5BA31] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">5-Min Anti-Cheat</p>
              <p className="text-[11px] text-slate-400">Tab-switch detection</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#121B2B]/60 border border-[#28364F]">
            <Sparkles className="w-5 h-5 text-[#F5BA31] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Gemini 3.8 Flash AI</p>
              <p className="text-[11px] text-slate-400">MCQs & error analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#121B2B]/60 border border-[#28364F]">
            <BookOpen className="w-5 h-5 text-[#F5BA31] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">58 Enrolled Students</p>
              <p className="text-[11px] text-slate-400">Classes 9th, 10th, 11th, 12th</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
