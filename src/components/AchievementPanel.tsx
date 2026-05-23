import React from 'react';
import { useGame } from '../contexts/GameContext';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { Trophy, Lock, X, Award, CheckCircle } from 'lucide-react';

export const AchievementPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state } = useGame();
  const { unlockedAchievements = [] } = state;

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ALL_ACHIEVEMENTS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-4xl p-4 sm:p-6 animate-slide-up border-2 border-[#d4af37]/35 shadow-[0_0_35px_rgba(212,175,55,0.2)] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-[#d4af37] bg-clip-text text-transparent flex items-center gap-2">
              <Trophy size={20} className="text-[#ffd700]" /> 榮譽成就系統
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              已達成 {unlockedCount} / {totalCount} 個成就（解鎖成就可獲得多週目繼承屬性與金幣加成！）
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 transition-all text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ffd700] to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedAchievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`relative p-4 rounded-xl border transition-all text-left flex gap-4 ${
                  isUnlocked
                    ? 'border-[#d4af37]/40 bg-[rgba(212,175,55,0.04)] shadow-[0_0_15px_rgba(212,175,55,0.05)]'
                    : 'border-slate-800 bg-slate-950/40 opacity-50'
                }`}
              >
                {/* Badge Column */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-md border ${
                      isUnlocked
                        ? 'bg-[radial-gradient(circle_at_center,_#3a2e05_0%,_#0d0a01_100%)] border-[#ffd700]/30'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {isUnlocked ? ach.badge : <Lock size={20} className="text-slate-600" />}
                  </div>
                  {isUnlocked && (
                    <span className="text-[9px] text-[#ffd700] bg-[#ffd700]/10 border border-[#ffd700]/20 px-1.5 py-0.5 rounded-full mt-2 font-bold uppercase flex items-center gap-0.5">
                      <CheckCircle size={8} /> 已達成
                    </span>
                  )}
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3
                      className={`text-sm font-bold truncate ${
                        isUnlocked ? 'text-[#ffd700]' : 'text-slate-500'
                      }`}
                    >
                      {ach.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed text-justify">
                      {ach.description}
                    </p>
                  </div>

                  {/* Bonus Reward Info */}
                  <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">🔥 NG+ 開局傳承加成：</span>
                    <span
                      className={`text-[10px] font-bold ${
                        isUnlocked ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {ach.bonusText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note / Guide */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-850 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Award size={14} className="text-[#d4af37]" /> 所有解鎖成就的加成效果均可**完全疊加**，並自動套用於下一次創角時的初始狀態！
          </p>
        </div>
      </div>
    </div>
  );
};
