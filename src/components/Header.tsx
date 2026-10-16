import React from 'react';
import { ShieldCheck, LogOut, GraduationCap, School } from 'lucide-react';
import { CurrentUser } from '../types/academy';
import { FastLogo } from './FastLogo';

interface HeaderProps {
  user: CurrentUser | null;
  onLogout: () => void;
  onHomeClick?: () => void;
  inExamMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onHomeClick,
  inExamMode = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B111E]/95 backdrop-blur-md border-b border-[#28364F] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand with FAST Official Logo */}
        <div 
          onClick={inExamMode ? undefined : onHomeClick}
          className={`flex items-center gap-3 select-none ${inExamMode ? 'cursor-default' : 'cursor-pointer group'}`}
        >
          <FastLogo size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-[#F5BA31] transition-colors">
                Fawad Academy
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-[#F5BA31] text-[#0B111E] shadow-sm">
                FAST
              </span>
            </div>
            <p className="text-[11px] text-[#F5BA31] font-semibold tracking-wide hidden sm:block">
              Samaro Town • Examination Portal
            </p>
          </div>
        </div>

        {/* Right Status / User info */}
        <div className="flex items-center gap-3">
          {inExamMode ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-[#F5BA31] text-[#F5BA31] text-xs font-bold animate-pulse shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#F5BA31]" />
              <span>Anti-Cheat Proctoring Engaged</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-100 flex items-center justify-end gap-1.5">
                  {user.role === 'teacher' ? (
                    <span className="text-[#0B111E] text-xs font-black px-2 py-0.5 rounded bg-[#F5BA31] shadow-sm">
                      Teacher • Admin
                    </span>
                  ) : (
                    <span className="text-amber-300 text-xs font-bold px-2 py-0.5 rounded bg-[#F5BA31]/15 border border-[#F5BA31]/30">
                      {user.className || 'Student'}
                    </span>
                  )}
                  {user.name}
                </span>
                {user.studentId && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {user.studentId}
                  </span>
                )}
              </div>

              <button
                onClick={onLogout}
                title="Log Out"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-[#28364F] hover:border-red-500/40 px-3 py-2 rounded-lg transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold bg-[#121B2B] border border-[#28364F] px-3.5 py-1.5 rounded-full">
              <GraduationCap className="w-4 h-4 text-[#F5BA31]" />
              <span>FAST Academy Portal</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
