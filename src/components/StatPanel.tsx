import React from 'react';
import type { Daughter, AttributeKey } from '../types';
import { 
  Heart, Shield, Brain, Sparkles, Compass, HelpCircle, 
  Trophy, Skull, Crown, Palette, Swords, Award
} from 'lucide-react';

interface StatPanelProps {
  daughter: Daughter;
}

const ATTRIBUTE_LABELS: Record<AttributeKey, { label: string; color: string; icon: any; max: number }> = {
  stamina: { label: '體力 (Stamina)', color: '#f72585', icon: Heart, max: 999 },
  strength: { label: '力量 (Strength)', color: '#4361ee', icon: Shield, max: 999 },
  intelligence: { label: '智力 (Intelligence)', color: '#7209b7', icon: Brain, max: 999 },
  charisma: { label: '魅力 (Charisma)', color: '#ff006e', icon: Sparkles, max: 999 },
  morality: { label: '道德 (Morality)', color: '#3a0ca3', icon: Compass, max: 999 },
  piety: { label: '信仰 (Piety)', color: '#4cc9f0', icon: HelpCircle, max: 999 },
  sensitivity: { label: '感受 (Sensitivity)', color: '#fb8500', icon: Sparkles, max: 999 },
  stress: { label: '疲勞 (Stress)', color: '#8d99ae', icon: Shield, max: 999 },
  combatSkill: { label: '戰術 (Combat)', color: '#e63946', icon: Swords, max: 999 },
  magicSkill: { label: '魔法 (Magic)', color: '#06d6a0', icon: Brain, max: 999 },
  reputation: { label: '名望 (Reputation)', color: '#ffd700', icon: Trophy, max: 999 },
  sin: { label: '罪孽 (Sin)', color: '#ef476f', icon: Skull, max: 999 },
  elegance: { label: '禮儀 (Elegance)', color: '#ffb703', icon: Crown, max: 999 },
  art: { label: '氣質 (Art)', color: '#a855f7', icon: Palette, max: 999 }
};

export const StatPanel: React.FC<StatPanelProps> = ({ daughter }) => {
  const getCharacterName = (id: string) => {
    if (id === 'honghua') return '紅花 (銀髮冒險特化)';
    if (id === 'erica') return '艾莉卡 (銀髮雙馬尾強運)';
    if (id === 'emilia') return '艾蜜莉亞 (咖啡髮小隊流)';
    return id;
  };

  const getFatherLabel = (bg: string) => {
    if (bg === 'knight') return '失落的騎士';
    if (bg === 'scholar') return '失落的文臣';
    if (bg === 'merchant') return '行商人';
    if (bg === 'bard') return '吟遊詩人';
    return bg;
  };

  const focusPercent = Math.min(100, (daughter.focus / daughter.maxFocus) * 100);

  return (
    <div className="glass-panel p-6 flex flex-col gap-5 w-full">
      {/* Profile Header */}
      <div className="border-b border-[rgba(255,255,255,0.08)] pb-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-white tracking-wide">{daughter.name}</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.3)] text-[#ffd700]">
            {daughter.age} 歲
          </span>
        </div>
        <div className="flex flex-col gap-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">王女身份:</span>
            <span>{getCharacterName(daughter.characterId)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">養父背景:</span>
            <span>{getFatherLabel(daughter.fatherBackground)}</span>
          </div>
        </div>
      </div>

      {/* Focus Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-300 font-semibold">
            <Award size={13} className="text-[#ffd700]" />
            修行專注度 (Focus)
          </span>
          <span className="font-bold text-[#ffd700]">{daughter.focus} / {daughter.maxFocus}</span>
        </div>
        <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden border border-slate-900/60 p-[1px]">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500 ease-out" 
            style={{ 
              width: `${focusPercent}%`,
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)'
            }}
          />
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="flex flex-col gap-3.5 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 border-l-2 border-[#d4af37] pl-2 mb-1">
          基礎屬性面板
        </span>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-2.5">
          {Object.entries(ATTRIBUTE_LABELS).map(([key, item]) => {
            const val = daughter.attributes[key as AttributeKey] || 0;
            const max = item.max;
            const percent = Math.min(100, (val / max) * 100);
            const Icon = item.icon;

            return (
              <div key={key} className="space-y-1 group">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="flex items-center gap-1.5 text-slate-300 group-hover:text-white transition-colors">
                    <Icon size={13} style={{ color: item.color }} />
                    {item.label}
                  </span>
                  <span className="font-bold" style={{ color: key === 'stress' && val > daughter.attributes.stamina ? '#ef476f' : '#fff' }}>
                    {val}
                  </span>
                </div>
                {/* Progress Bar Container */}
                <div className="w-full h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/40 p-[1px]">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out" 
                    style={{ 
                      width: `${percent}%`, 
                      backgroundColor: item.color,
                      boxShadow: `0 0 8px ${item.color}80`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 同窗好友羈絆 Section */}
      <div className="flex flex-col gap-3.5 pt-4 border-t border-[rgba(255,255,255,0.08)] mt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 border-l-2 border-[#d4af37] pl-2 mb-1">
          同窗好友羈絆
        </span>
        
        <div className="flex flex-col gap-3">
          {/* Clover (四葉草) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="text-emerald-400 font-bold">🍀 四葉草</span>
                <span className="text-[10px] text-slate-500">
                  {daughter.bonds?.clover >= 100 ? '【幸運被動解鎖】' : '滿級加成: 大成功率 +20%'}
                </span>
              </span>
              <span className="font-bold text-slate-300">{daughter.bonds?.clover || 0} / 100</span>
            </div>
            <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/40 p-[1px]">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-emerald-500" 
                style={{ 
                  width: `${Math.min(100, daughter.bonds?.clover || 0)}%`,
                  boxShadow: (daughter.bonds?.clover || 0) >= 100 ? '0 0 8px rgba(16, 185, 129, 0.6)' : 'none'
                }}
              />
            </div>
          </div>

          {/* Shanshan (珊珊) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="text-pink-400 font-bold">🌸 珊珊</span>
                <span className="text-[10px] text-slate-500">
                  {daughter.bonds?.shanshan >= 100 ? '【極致默契】' : '大於 120 智力解鎖圖書館線索'}
                </span>
              </span>
              <span className="font-bold text-slate-300">{daughter.bonds?.shanshan || 0} / 100</span>
            </div>
            <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/40 p-[1px]">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-pink-500" 
                style={{ 
                  width: `${Math.min(100, daughter.bonds?.shanshan || 0)}%`,
                  boxShadow: (daughter.bonds?.shanshan || 0) >= 100 ? '0 0 8px rgba(236, 72, 153, 0.6)' : 'none'
                }}
              />
            </div>
          </div>

          {/* Xuewu (雪舞) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="text-cyan-400 font-bold">❄️ 雪舞</span>
                <span className="text-[10px] text-slate-500">
                  {daughter.bonds?.xuewu >= 100 ? '【天才指引解鎖】' : '滿級加成: 屬性成長 +15%'}
                </span>
              </span>
              <span className="font-bold text-slate-300">{daughter.bonds?.xuewu || 0} / 100</span>
            </div>
            <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/40 p-[1px]">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-cyan-500" 
                style={{ 
                  width: `${Math.min(100, daughter.bonds?.xuewu || 0)}%`,
                  boxShadow: (daughter.bonds?.xuewu || 0) >= 100 ? '0 0 8px rgba(6, 182, 212, 0.6)' : 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
