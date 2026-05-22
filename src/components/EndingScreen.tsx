import React from 'react';
import { useGame } from '../contexts/GameContext';
import { ENDINGS } from '../data/gameData';
import { RefreshCw, Trophy } from 'lucide-react';
import type { AttributeKey } from '../types';
import { getAvatarPath } from '../utils/avatar';

const STAT_LABELS: Record<AttributeKey, string> = {
  stamina: '體力 (Stamina)',
  strength: '力量 (Strength)',
  intelligence: '智力 (Intelligence)',
  charisma: '魅力 (Charisma)',
  morality: '道德 (Morality)',
  piety: '信仰 (Piety)',
  sensitivity: '感受 (Sensitivity)',
  stress: '疲勞 (Stress)',
  combatSkill: '戰鬥技術 (Combat)',
  magicSkill: '魔法技術 (Magic)',
  reputation: '王國名望 (Reputation)',
  sin: '罪孽 (Sin)',
  elegance: '禮儀 (Elegance)',
  art: '氣質 (Art)'
};

export const EndingScreen: React.FC = () => {
  const { state, resetGame } = useGame();
  const { daughter } = state;

  // Find matching ending
  const matchedEnding = ENDINGS.find(e => 
    e.evaluator(daughter.attributes, daughter.gold, daughter.relationship)
  ) || ENDINGS[ENDINGS.length - 1]; // fallback to wanderer

  // Dynamic visual parameters for each ending (theme color, emoji badge, backdrop filter)
  const getEndingVisuals = (id: string) => {
    switch (id) {
      case 'queen':
        return { color: '#ffd700', badge: '👑👸✨', glow: 'rgba(255, 215, 0, 0.45)', bg: 'radial-gradient(circle, #3a2e05 0%, #0d0a01 100%)' };
      case 'hero':
        return { color: '#ef476f', badge: '⚔️🛡️🌟', glow: 'rgba(239, 71, 111, 0.45)', bg: 'radial-gradient(circle, #380c16 0%, #0d0104 100%)' };
      case 'dark_lord':
        return { color: '#8338ec', badge: '😈😈🔥', glow: 'rgba(131, 56, 236, 0.45)', bg: 'radial-gradient(circle, #1f0742 0%, #060112 100%)' };
      case 'archmage':
        return { color: '#00b4d8', badge: '🔮🧙‍♀️🪄', glow: 'rgba(0, 180, 216, 0.45)', bg: 'radial-gradient(circle, #052c3c 0%, #000a12 100%)' };
      case 'nun':
        return { color: '#a2d2ff', badge: '⛪🤍🙏', glow: 'rgba(162, 210, 255, 0.35)', bg: 'radial-gradient(circle, #10253c 0%, #020a12 100%)' };
      case 'prime_minister':
        return { color: '#06d6a0', badge: '📜🎓🏛️', glow: 'rgba(6, 214, 160, 0.35)', bg: 'radial-gradient(circle, #023326 0%, #000a07 100%)' };
      case 'rich_merchant':
        return { color: '#ffd166', badge: '💰🪙🚢', glow: 'rgba(255, 209, 102, 0.45)', bg: 'radial-gradient(circle, #382d09 0%, #0d0a01 100%)' };
      case 'general':
        return { color: '#f77f00', badge: '🏇📯🛡️', glow: 'rgba(247, 127, 0, 0.45)', bg: 'radial-gradient(circle, #3c2005 0%, #0f0701 100%)' };
      case 'rebel_leader':
        return { color: '#d62828', badge: '✊🏴🚩', glow: 'rgba(214, 40, 40, 0.45)', bg: 'radial-gradient(circle, #3c0c0c 0%, #0f0202 100%)' };
      case 'royal_maid':
        return { color: '#ffafcc', badge: '🧹🍵🎀', glow: 'rgba(255, 175, 204, 0.35)', bg: 'radial-gradient(circle, #361723 0%, #0f0509 100%)' };
      case 'ordinary_marriage':
        return { color: '#ffb703', badge: '🏡🌻🍞', glow: 'rgba(255, 183, 3, 0.35)', bg: 'radial-gradient(circle, #3c2805 0%, #0f0a01 100%)' };
      default: // wanderer
        return { color: '#a3a1bc', badge: '🧳⛺🦅', glow: 'rgba(163, 161, 188, 0.35)', bg: 'radial-gradient(circle, #1f1b2c 0%, #0a0812 100%)' };
    }
  };

  const vis = getEndingVisuals(matchedEnding.id);

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-6 min-h-[90vh]">
      <div className="glass-panel w-full max-w-4xl p-6 md:p-8 animate-slide-up flex flex-col gap-8 text-center pulse-border">
        
        {/* Title */}
        <div>
          <span className="text-xs font-bold text-[#ffd700] uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-center">
            <Trophy size={14} /> 育女養成期滿 - 結局解鎖
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: vis.color }}>
            {matchedEnding.name}
          </h1>
        </div>

        {/* Chamber and Ending Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side: Portrait with dynamic filters */}
          <div 
            className="w-full max-w-[280px] h-[340px] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-4 mx-auto"
            style={{
              background: vis.bg,
              border: `2.5px solid ${vis.color}`,
              boxShadow: `0 0 25px ${vis.glow}`
            }}
          >
            {/* Ending Badge overlays */}
            <div className="absolute top-4 text-2xl z-20 tracking-wider">
              {vis.badge}
            </div>

            {/* Daughter Image */}
            <img 
              src={getAvatarPath(18, daughter.outfit, daughter.avatarUrl)} 
              alt={daughter.name} 
              className="h-[240px] w-auto object-contain float-animation z-10"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            <div className="absolute inset-3 border border-[rgba(255,255,255,0.05)] pointer-events-none rounded-lg" />
            
            {/* Age overlay */}
            <div className="absolute bottom-4 bg-black/60 border border-slate-700/50 backdrop-blur px-3 py-1 rounded-lg text-xs text-white font-bold z-20">
              {daughter.name} (18歲 成人)
            </div>
          </div>

          {/* Right Side: Narrative and Stats Summary */}
          <div className="flex flex-col gap-6 text-left">
            <div className="bg-[rgba(255,255,255,0.02)] border border-slate-900/80 p-5 rounded-xl leading-relaxed">
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">養育生涯總結</h3>
              <p className="text-sm text-slate-300 text-justify">{matchedEnding.description}</p>
            </div>

            {/* Stats Sheet Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[rgba(255,255,255,0.01)] border border-slate-900 p-2 rounded-lg flex justify-between">
                <span className="text-slate-500">最後持有金幣:</span>
                <span className="font-bold text-[#ffd700]">{daughter.gold} G</span>
              </div>
              <div className="bg-[rgba(255,255,255,0.01)] border border-slate-900 p-2 rounded-lg flex justify-between">
                <span className="text-slate-500">父親親密度:</span>
                <span className="font-bold text-pink-400">{daughter.relationship} / 100</span>
              </div>
              
              {/* Highlight best stats */}
              {Object.entries(daughter.attributes)
                .filter(([k]) => k !== 'stress')
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([key, val]) => (
                  <div key={key} className="bg-[rgba(255,255,255,0.01)] border border-slate-900 p-2 rounded-lg flex justify-between">
                    <span className="text-slate-400">{STAT_LABELS[key as AttributeKey] || key}:</span>
                    <span className="font-bold text-white">{val}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="border-t border-slate-900 pt-6 mt-2 flex justify-center">
          <button 
            onClick={resetGame}
            className="btn-fantasy py-4 px-8 text-sm flex items-center gap-2"
          >
            <RefreshCw size={16} /> 重新開啟新一輪養育
          </button>
        </div>

      </div>
    </div>
  );
};
