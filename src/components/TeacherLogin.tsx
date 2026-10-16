import React, { useState } from 'react';
import { ArrowLeft, Briefcase, KeyRound, AlertCircle, Loader2, Phone, User, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { CurrentUser } from '../types/academy';
import { FastLogo } from './FastLogo';

interface TeacherLoginProps {
  onBack: () => void;
  onSuccess: (user: CurrentUser) => void;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({ onBack, onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [secretCode, setSecretCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanSecret = secretCode.trim();

    if (!cleanName) {
      setError('Please enter your full Instructor/Teacher Name.');
      return;
    }
    if (!cleanPhone) {
      setError('Please enter your contact phone number.');
      return;
    }
    if (!cleanSecret) {
      setError('Please enter your Unique Teacher Secret Code.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyTeacher(cleanName, cleanPhone, cleanSecret);
      if (res.success && res.teacher) {
        onSuccess({
          role: 'teacher',
          name: res.teacher.name || cleanName,
          phone: res.teacher.phone || cleanPhone,
        });
      } else {
        setError(res.error || 'Access Denied: Invalid Teacher Secret Code.');
      }
    } catch {
      setError('Verification service unavailable. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-[#0B111E]">
      <div className="w-full max-w-md bg-[#121B2B] border border-[#28364F] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle top gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#F5BA31]/10 rounded-full blur-2xl pointer-events-none" />

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
              Faculty Access
            </span>
            <h2 className="text-xl font-black text-white tracking-tight mt-1">Teacher Admin Login</h2>
            <p className="text-xs text-slate-300">Restricted administrative access for Fawad Academy faculty</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-bold">{error}</p>
              <p className="mt-1 text-[11px] text-red-300">
                Hint: Authorized academy master code is <code className="bg-red-950/80 px-1.5 py-0.5 rounded text-[#F5BA31] font-mono font-bold">FAWAD2025</code>
              </p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Teacher Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Teacher / Instructor Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Professor Fawad / Instructor Ali"
                className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +92 300 1234567"
                className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Unique Secret Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Unique Secret Code <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-[#F5BA31] font-mono font-bold">
                Verified against database
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="Enter Academy Secret Security Code"
                className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono transition-colors tracking-wider outline-none"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <div className="mt-2 p-2.5 rounded-xl bg-[#0B111E] border border-[#28364F] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Default Academy Code:</span>
              <button
                type="button"
                onClick={() => setSecretCode('FAWAD2025')}
                className="text-xs font-mono text-[#F5BA31] font-black bg-[#F5BA31]/15 px-2 py-0.5 rounded border border-[#F5BA31]/30 hover:bg-[#F5BA31] hover:text-[#0B111E] transition-colors cursor-pointer"
              >
                FAWAD2025 (Click to fill)
              </button>
            </div>
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
                <>
                  <ShieldCheck className="w-4 h-4 text-[#0B111E]" />
                  <span>Authenticate & Open Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-[#1F2D44] text-center">
          <p className="text-[11px] text-slate-400">
            Fawad Academy Internal Control System • Confidential Access
          </p>
        </div>
      </div>
    </div>
  );
};
