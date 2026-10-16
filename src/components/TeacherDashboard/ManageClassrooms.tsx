import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, BookOpen, Layers, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Classroom } from '../../types/academy';

export const ManageClassrooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await api.getClassrooms();
      setClassrooms(data);
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to load classrooms' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createClassroom(name.trim(), description.trim());
      setName('');
      setDescription('');
      setShowAddForm(false);
      setActionMsg({ type: 'success', text: `Classroom "${name}" added successfully.` });
      fetchClasses();
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to create classroom.' });
    }
  };

  const handleDelete = async (id: string, className: string) => {
    if (!window.confirm(`Are you sure you want to remove ${className}?`)) return;

    try {
      await api.deleteClassroom(id);
      setActionMsg({ type: 'success', text: `Classroom removed.` });
      fetchClasses();
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to delete classroom.' });
    }
  };

  const handleQuickSetupStandard = async () => {
    const standardClasses = [
      { name: 'Class 9th', desc: 'Matric-I Science Division' },
      { name: 'Class 10th', desc: 'Matric-II Board Examination Stream' },
      { name: 'Class 11th', desc: 'Intermediate Part-1 Science Stream' },
      { name: 'Class 12th', desc: 'Intermediate Part-2 & Board Preparations' },
    ];

    try {
      for (const item of standardClasses) {
        await api.createClassroom(item.name, item.desc);
      }
      setActionMsg({ type: 'success', text: 'Standard 9th–12th classes initialized!' });
      fetchClasses();
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to initialize classes.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Action banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121B2B] border border-[#28364F]">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F5BA31]" />
            <span>Classroom & Division Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Organize cohorts (9th–12th) and bind targeted assessments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {classrooms.length === 0 && (
            <button
              onClick={handleQuickSetupStandard}
              className="px-4 py-2 rounded-xl bg-[#F5BA31]/15 hover:bg-[#F5BA31]/25 text-[#F5BA31] border border-[#F5BA31]/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F5BA31]" />
              <span>Quick 9th–12th Setup</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl bg-[#F5BA31] hover:bg-[#E5A820] text-[#0B111E] text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#F5BA31]/20 transition-all cursor-pointer"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'Cancel' : 'Add New Class'}</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Add New Class Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-[#1A263B] border border-[#F5BA31]/50 shadow-xl space-y-4">
          <h4 className="text-sm font-black text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#F5BA31]" />
            Create Classroom Division
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Class Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Class 11th Pre-Medical"
                className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description / Curriculum Focus (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Physics & Chemistry Intensive Batch"
                className="w-full bg-[#0B111E] border border-[#28364F] focus:border-[#F5BA31] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-[#28364F] text-xs text-slate-300 hover:bg-[#121B2B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#F5BA31] hover:bg-[#E5A820] text-xs font-black text-[#0B111E] shadow-md"
            >
              Save Classroom
            </button>
          </div>
        </form>
      )}

      {/* Classroom Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          Loading classroom directory...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classrooms.map((cls) => (
            <div
              key={cls.id}
              className="p-5 rounded-2xl bg-[#121B2B] border border-[#28364F] hover:border-[#F5BA31]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F5BA31]/15 border border-[#F5BA31]/40 flex items-center justify-center text-[#F5BA31]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white">{cls.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Class ID: {cls.id}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(cls.id, cls.name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {cls.description && (
                  <p className="mt-3 text-xs text-slate-300 bg-[#0B111E] p-3 rounded-xl border border-[#1F2D44]">
                    {cls.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F2D44] flex items-center justify-between text-[11px] text-slate-500">
                <span>FAST Academic Division</span>
                <span className="text-[#F5BA31] font-bold">● Active Cohort</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
