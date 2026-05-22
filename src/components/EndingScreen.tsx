import React from 'react';
import { useGame } from '../contexts/GameContext';
import { determineEnding } from '../data/endings';
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
  const { state, restartGame } = useGame();
  const { daughter } = state;

  // Calculate parameters for determineEnding
  const cluesCount = state.inventory.filter(i => i.includes('crest') || i.includes('saber')).length;
  const reunitedSisters: string[] = [];
  if (state.inventory.includes('erica_reunited')) reunitedSisters.push('erica');
  if (state.inventory.includes('emilia_reunited')) reunitedSisters.push('emilia');

  const matchedEnding = determineEnding(
    daughter,
    state.completedEndings.length,
    cluesCount,
    reunitedSisters
  );

  // Dynamic visual parameters for each ending (theme color, emoji badge, backdrop filter)
  const getEndingVisuals = (id: string) => {
    switch (id) {
      case 'infinite_observer':
        return { color: '#e0aaff', badge: '👁️🔮🌌', glow: 'rgba(224, 170, 255, 0.45)', bg: 'radial-gradient(circle, #240046 0%, #030008 100%)' };
      case 'binlang_monopoly':
        return { color: '#80ed99', badge: '🍃💰🏭', glow: 'rgba(128, 237, 153, 0.45)', bg: 'radial-gradient(circle, #132a13 0%, #020802 100%)' };
      case 'lucky_lay_flat':
        return { color: '#ffb703', badge: '🛌🍀👑', glow: 'rgba(255, 183, 3, 0.45)', bg: 'radial-gradient(circle, #3a2e05 0%, #0d0a01 100%)' };
      case 'shadow_cabinet':
        return { color: '#1d3557', badge: '👥🕶️🏛️', glow: 'rgba(29, 53, 87, 0.45)', bg: 'radial-gradient(circle, #0b132b 0%, #010204 100%)' };
      case 'phantom_thief_triplets':
        return { color: '#f72585', badge: '💎🎩🎵', glow: 'rgba(247, 37, 133, 0.45)', bg: 'radial-gradient(circle, #3c0c27 0%, #0f0209 100%)' };
      case 'clover_mercenary':
        return { color: '#22c55e', badge: '🍀⚔️🛡️', glow: 'rgba(34, 197, 94, 0.45)', bg: 'radial-gradient(circle, #11311f 0%, #030b05 100%)' };
      case 'shanshan_court_aide':
        return { color: '#f472b6', badge: '🌸📜🏛️', glow: 'rgba(244, 114, 182, 0.45)', bg: 'radial-gradient(circle, #371125 0%, #10030a 100%)' };
      case 'xuewu_magic_tower':
        return { color: '#38bdf8', badge: '❄️🔮🗼', glow: 'rgba(56, 189, 248, 0.45)', bg: 'radial-gradient(circle, #102d3f 0%, #030b11 100%)' };
      case 'royal_return':
        return { color: '#ffd700', badge: '👑👸✨', glow: 'rgba(255, 215, 0, 0.45)', bg: 'radial-gradient(circle, #3a2e05 0%, #0d0a01 100%)' };
      case 'three_revolution':
        return { color: '#d90429', badge: '✊🏴🚩', glow: 'rgba(217, 4, 41, 0.45)', bg: 'radial-gradient(circle, #38040e 0%, #0d0103 100%)' };
      case 'three_shelter':
        return { color: '#4ea8de', badge: '🏡🤝❤️', glow: 'rgba(78, 168, 222, 0.45)', bg: 'radial-gradient(circle, #0c2b3a 0%, #010a0f 100%)' };
      case 'duet_adventurers':
        return { color: '#48cae4', badge: '🎒⚔️🗺️', glow: 'rgba(72, 202, 228, 0.45)', bg: 'radial-gradient(circle, #072a33 0%, #010a0d 100%)' };
      case 'prince_marriage':
        return { color: '#ffb7b2', badge: '💍🤴✨', glow: 'rgba(255, 183, 178, 0.45)', bg: 'radial-gradient(circle, #3a1518 0%, #0d0304 100%)' };
      case 'court_official':
        return { color: '#06d6a0', badge: '📜🎓🏛️', glow: 'rgba(6, 214, 160, 0.35)', bg: 'radial-gradient(circle, #023326 0%, #000a07 100%)' };
      case 'valkyrie_hero':
        return { color: '#ef476f', badge: '🛡️⚔️🌟', glow: 'rgba(239, 71, 111, 0.45)', bg: 'radial-gradient(circle, #380c16 0%, #0d0104 100%)' };
      case 'holy_nun':
        return { color: '#b5e2fa', badge: '⛪🤍🙏', glow: 'rgba(181, 226, 250, 0.35)', bg: 'radial-gradient(circle, #10253c 0%, #020a12 100%)' };
      case 'bounty_hunter':
        return { color: '#f77f00', badge: '🤠🐺🪙', glow: 'rgba(247, 127, 0, 0.45)', bg: 'radial-gradient(circle, #3c2005 0%, #0f0701 100%)' };
      case 'famous_painter':
        return { color: '#ffc6ff', badge: '🎨🖌️🖼️', glow: 'rgba(255, 198, 255, 0.45)', bg: 'radial-gradient(circle, #2d162f 0%, #0d040e 100%)' };
      case 'mob_boss':
        return { color: '#343a40', badge: '😈🥃⛓️', glow: 'rgba(52, 58, 64, 0.45)', bg: 'radial-gradient(circle, #1c1f22 0%, #070809 100%)' };
      case 'courtesan':
        return { color: '#ff70a6', badge: '💋🌸🍷', glow: 'rgba(255, 112, 166, 0.45)', bg: 'radial-gradient(circle, #3a1523 0%, #0f0509 100%)' };
      case 'beggar':
        return { color: '#a3a1bc', badge: '🥖📦🌧️', glow: 'rgba(163, 161, 188, 0.35)', bg: 'radial-gradient(circle, #1f1b2c 0%, #0a0812 100%)' };
      case 'housewife':
        return { color: '#e9c46a', badge: '🍳🍞🏡', glow: 'rgba(233, 196, 106, 0.35)', bg: 'radial-gradient(circle, #32250d 0%, #0a0702 100%)' };
      default:
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
              style={{
                filter: daughter.characterId === 'emilia' ? 'hue-rotate(330deg) saturate(0.8) sepia(0.5)' : undefined
              }}
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
            onClick={restartGame}
            className="btn-fantasy py-4 px-8 text-sm flex items-center gap-2"
          >
            <RefreshCw size={16} /> 重新開啟新一輪養育
          </button>
        </div>

      </div>
    </div>
  );
};
