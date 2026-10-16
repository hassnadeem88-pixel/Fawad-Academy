import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Clock, Lock, CheckCircle } from 'lucide-react';
import { FastLogo } from '../FastLogo';

interface AntiCheatLockoutProps {
  lockedUntil: number; // epoch ms
  onUnlock: () => void;
  examSecondsRemaining: number;
}

export const AntiCheatLockout: React.FC<AntiCheatLockoutProps> = ({
  lockedUntil,
  onUnlock,
  examSecondsRemaining,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  const formatLockoutTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isExpired = secondsLeft <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl select-none">
      <div className="w-full max-w-lg bg-[#121B2B] border-2 border-[#F5BA31] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#F5BA31]/20 text-center relative overflow-hidden">
        {/* Pulsing warning aura */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-[#F5BA31] to-red-600 animate-pulse" />

        <div className="flex justify-center mb-4">
          <FastLogo size={70} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/15 text-red-400 text-xs font-black uppercase tracking-wider border border-red-500/30 mb-3">
          <AlertTriangle className="w-4 h-4" />
          <span>Academic Integrity Violation Detected</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Session Frozen for 5 Minutes
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Tab switching, window minimization, or screen unfocus was detected by Fawad Academy proctoring.
        </p>

        {/* Big 5-Minute Timer Display */}
        <div className="my-6 p-5 rounded-2xl bg-[#0B111E] border border-[#F5BA31]/50 shadow-inner">
          <span className="text-[11px] font-black text-[#F5BA31] uppercase tracking-widest block mb-1">
            Mandatory Lockout Penalty
          </span>
          <div className="text-5xl sm:text-6xl font-black text-[#F5BA31] font-mono tracking-wider tabular-nums">
            {formatLockoutTimer(secondsLeft)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#F5BA31]" />
            <span>(Exam master timer continues running in background: {Math.max(0, Math.floor(examSecondsRemaining / 60))}m {examSecondsRemaining % 60}s)</span>
          </p>
        </div>

        <div className="space-y-2.5 text-left p-4 rounded-xl bg-[#0B111E]/80 border border-[#28364F] text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="text-[#F5BA31] font-bold">•</span>
            <span>Do not close or reload the browser. The freeze timer is cryptographically bound to your attempt.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#F5BA31] font-bold">•</span>
            <span>This security infraction is logged to your instructor&apos;s individual diagnostic report.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#F5BA31] font-bold">•</span>
            <span>Once the 5:00 cooldown elapses, you will be permitted to resume your test.</span>
          </div>
        </div>

        {/* Resume Button */}
        <div className="mt-6">
          <button
            type="button"
            disabled={!isExpired}
            onClick={onUnlock}
            className={`w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isExpired
                ? 'bg-gradient-to-r from-[#F5BA31] to-[#E5A820] hover:from-[#FBD561] hover:to-[#F5BA31] text-[#0B111E] shadow-xl shadow-[#F5BA31]/30 active:scale-[0.98]'
                : 'bg-[#1A263B] text-slate-500 border border-[#28364F] cursor-not-allowed'
            }`}
          >
            {isExpired ? (
              <>
                <CheckCircle className="w-5 h-5 text-[#0B111E]" />
                <span>Resume Examination</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Locked (Wait {secondsLeft}s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
