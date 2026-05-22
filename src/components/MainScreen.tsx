import React from 'react';
import { useGame } from '../contexts/GameContext';
import type { AttributeKey } from '../types';
import { 
  Heart, Shield, Brain, Sparkles, Compass, HelpCircle, 
  MessageSquare, ShoppingCart, Calendar, Coins, History, 
  ToggleLeft, ToggleRight, Save, FolderOpen, RefreshCw, Trophy, Swords,
  Upload
} from 'lucide-react';

const ATTRIBUTE_LABELS: Record<AttributeKey, { label: string; color: string; icon: any; max: number }> = {
  stamina: { label: '體力 (Stamina)', color: 'var(--color-stamina)', icon: Heart, max: 999 },
  strength: { label: '力量 (Strength)', color: 'var(--color-strength)', icon: Shield, max: 999 },
  intelligence: { label: '智力 (Intelligence)', color: 'var(--color-intelligence)', icon: Brain, max: 999 },
  charisma: { label: '魅力 (Charisma)', color: 'var(--color-charisma)', icon: Sparkles, max: 999 },
  morality: { label: '道德 (Morality)', color: 'var(--color-morality)', icon: Compass, max: 999 },
  piety: { label: '信仰 (Piety)', color: 'var(--color-piety)', icon: HelpCircle, max: 999 },
  sensitivity: { label: '感受 (Sensitivity)', color: 'var(--color-sensitivity)', icon: Sparkles, max: 999 },
  stress: { label: '疲勞 (Stress)', color: 'var(--color-stress)', icon: Shield, max: 999 },
  combatSkill: { label: '戰術 (Combat)', color: 'var(--color-combat)', icon: Swords, max: 999 },
  magicSkill: { label: '魔法 (Magic)', color: 'var(--color-magic)', icon: Brain, max: 999 },
  reputation: { label: '名望 (Reputation)', color: 'var(--color-reputation)', icon: Trophy, max: 999 }
};

const OUTFIT_NAMES = {
  default: '日常便服',
  dress: '皇家絲綢華麗洋裝',
  armor: '銀白女武神胸甲',
  summer: '盛夏微風連身裙'
};

const OUTFIT_BORDER_COLORS = {
  default: 'border-slate-500 rgba(255,255,255,0.15)',
  dress: 'rgba(212, 175, 55, 0.6)',
  armor: 'rgba(192, 192, 192, 0.6)',
  summer: 'rgba(0, 180, 216, 0.6)'
};

export const MainScreen: React.FC = () => {
  const { 
    state, 
    setScreen,
    talkToDaughter,
    startAdventure,
    toggleCheatMode,
    saveGame,
    loadGame,
    resetGame,
    updateAvatarUrl
  } = useGame();

  const { daughter, time, logs, cheatMode } = state;

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 w-full max-w-7xl mx-auto animate-slide-up">
      {/* Header Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(212,175,55,0.15)] rounded-lg text-[#d4af37] border border-[rgba(212,175,55,0.3)]">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">美少女夢工廠</h1>
            <p className="text-xs text-slate-400">養育女兒的成長軌跡 ({daughter.name})</p>
          </div>
        </div>

        {/* Date and Gold Display */}
        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          {/* Time Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,255,255,0.03)] border border-slate-700/50 rounded-lg text-sm">
            <Calendar className="text-[#d4af37]" size={16} />
            <span className="font-semibold text-[#f3e5ab]">
              第 {time.year} 年 {time.month} 月
            </span>
          </div>

          {/* Gold Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.25)] rounded-lg text-sm">
            <Coins className="text-[#d4af37] float-animation" size={16} />
            <span className="font-bold text-[#ffd700]">{daughter.gold} G</span>
          </div>

          {/* Save/Load / Reset Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={saveGame} 
              title="儲存進度" 
              className="p-2 rounded bg-[rgba(255,255,255,0.05)] border border-slate-700 hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
            >
              <Save size={16} />
            </button>
            <button 
              onClick={loadGame} 
              title="讀取進度" 
              className="p-2 rounded bg-[rgba(255,255,255,0.05)] border border-slate-700 hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
            >
              <FolderOpen size={16} />
            </button>
            <button 
              onClick={() => {
                if (window.confirm('確定要重新開始遊戲嗎？這會清除所有進度。')) {
                  resetGame();
                }
              }} 
              title="重新開始" 
              className="p-2 rounded bg-[rgba(255,255,255,0.05)] border border-slate-700 hover:border-red-500 hover:text-red-500 transition-all"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Attributes Panel (lg:col-span-4) */}
        <div className="glass-panel p-6 lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-lg font-bold border-b border-[rgba(212,175,55,0.2)] pb-2 mb-2 flex items-center gap-2">
            <Trophy size={18} /> 女兒屬性面板
          </h2>
          
          <div className="flex flex-col gap-3">
            {Object.entries(ATTRIBUTE_LABELS).map(([key, item]) => {
              const val = daughter.attributes[key as AttributeKey] || 0;
              const max = item.max;
              const percent = Math.min(100, (val / max) * 100);
              const Icon = item.icon;

              return (
                <div key={key} className="space-y-1 group">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-300 group-hover:text-white transition-colors">
                      <Icon size={14} style={{ color: item.color }} />
                      {item.label}
                    </span>
                    <span className="font-bold" style={{ color: key === 'stress' && val > daughter.attributes.stamina ? '#ef476f' : '#fff' }}>
                      {val}
                    </span>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="w-full h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/40">
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

        {/* Center: Character Chamber Display (lg:col-span-5) */}
        <div className="glass-panel p-6 lg:col-span-5 flex flex-col gap-4 items-center">
          <h2 className="text-lg font-bold border-b border-[rgba(212,175,55,0.2)] pb-2 w-full text-center">
            {daughter.name} 的起居室
          </h2>

          {/* Portrait Container */}
          <div 
            className="w-full max-w-[280px] h-[340px] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-4"
            style={{
              background: 'radial-gradient(circle at center, #1b1633 0%, #0d0a1b 100%)',
              border: `2px solid ${OUTFIT_BORDER_COLORS[daughter.outfit] || 'rgba(255,255,255,0.1)'}`,
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}
          >
            {/* Sprite Overlay */}
            <img 
              src={daughter.avatarUrl} 
              alt={daughter.name} 
              className="h-[250px] w-auto object-contain float-animation z-10 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Quick Upload Button */}
            <label 
              title="上傳自訂頭像"
              className="absolute top-3 left-3 bg-black/60 border border-slate-700/50 backdrop-blur p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer transition-all z-20 hover:scale-105"
            >
              <Upload size={14} />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (uploadEvent) => {
                      const base64 = uploadEvent.target?.result as string;
                      updateAvatarUrl(base64);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            {/* Decorative frame inside */}
            <div className="absolute inset-2 border border-[rgba(212,175,55,0.08)] pointer-events-none rounded-lg" />
            
            {/* Sickness Overlay */}
            {daughter.attributes.stress > daughter.attributes.stamina && (
              <div className="absolute inset-0 bg-red-950/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                <span className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg border border-red-400 text-xs animate-bounce shadow-lg">
                  🤒 疲勞過度 (生病危險)
                </span>
              </div>
            )}

            {/* Custom outfit label */}
            <div className="absolute bottom-3 left-3 bg-black/60 border border-slate-700/50 backdrop-blur px-2.5 py-1 rounded text-xs text-[#f3e5ab] font-bold z-20">
              👕 {OUTFIT_NAMES[daughter.outfit]}
            </div>
            
            {/* Age/Relationship overlay */}
            <div className="absolute top-3 right-3 bg-black/60 border border-slate-700/50 backdrop-blur px-2.5 py-1 rounded text-xs text-white font-bold z-20">
              🎂 {daughter.age} 歲
            </div>
          </div>

          {/* Quick info bar */}
          <div className="w-full grid grid-cols-2 gap-4 text-center mt-2">
            <div className="bg-[rgba(255,255,255,0.02)] border border-slate-800 p-2.5 rounded-lg">
              <p className="text-xs text-slate-400">父親親密度</p>
              <p className="text-lg font-bold text-[#ffd700]">{daughter.relationship} / 100</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.02)] border border-slate-800 p-2.5 rounded-lg">
              <p className="text-xs text-slate-400">持有裝備</p>
              <p className="text-sm font-bold text-slate-200 mt-1 truncate">
                {daughter.outfit === 'default' ? '無戰術裝備' : OUTFIT_NAMES[daughter.outfit]}
              </p>
            </div>
          </div>

          {/* Father-Daughter Interactivity */}
          {/* Father-Daughter Interactivity */}
          <div className="w-full mt-2">
            <p className="text-xs font-bold text-[#ffd700] uppercase tracking-wider mb-2 flex items-center gap-1.5 justify-center">
              <MessageSquare size={14} /> 與女兒互動對話
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button 
                onClick={() => talkToDaughter('gentle')} 
                className="py-2 text-xs bg-[rgba(255,255,255,0.03)] border border-slate-700 hover:border-pink-500 hover:text-pink-400 rounded-lg transition-all"
              >
                💬 溫柔談心
              </button>
              <button 
                onClick={() => talkToDaughter('praise')} 
                className="py-2 text-xs bg-[rgba(255,255,255,0.03)] border border-slate-700 hover:border-[#ffd700] hover:text-[#ffd700] rounded-lg transition-all"
              >
                👍 誇獎表揚
              </button>
              <button 
                onClick={() => talkToDaughter('scold')} 
                className="py-2 text-xs bg-[rgba(255,255,255,0.03)] border border-slate-700 hover:border-red-500 hover:text-red-400 rounded-lg transition-all"
              >
                ⚠️ 嚴厲訓導
              </button>
            </div>
          </div>

          {/* Protagonist Avatar Switcher */}
          <div className="w-full border-t border-slate-800/80 pt-3 mt-1">
            <p className="text-xs font-bold text-[#ffd700] uppercase tracking-wider mb-2 flex items-center gap-1.5 justify-center">
              <Upload size={14} /> 更換主角形象風格
            </p>
            <div className="flex items-center justify-center gap-2">
              {[
                { name: '主體', url: '/8719.png' },
                { name: '公主', url: '/avatar_princess.png' },
                { name: '武士', url: '/avatar_warrior.png' },
                { name: '術士', url: '/avatar_mage.png' }
              ].map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => updateAvatarUrl(p.url)}
                  title={p.name}
                  className={`w-9 h-9 rounded-full overflow-hidden border transition-all ${
                    daughter.avatarUrl === p.url 
                      ? 'border-[#d4af37] scale-105 shadow-[0_0_6px_rgba(212,175,55,0.4)]' 
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
              {/* Custom upload button inside chamber */}
              <label 
                title="上傳自訂頭像"
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-all bg-slate-900/60 ${
                  daughter.avatarUrl.startsWith('data:')
                    ? 'border-[#00b4d8] scale-105 shadow-[0_0_6px_rgba(0,180,216,0.4)] text-[#00b4d8]'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <Upload size={14} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        const base64 = uploadEvent.target?.result as string;
                        updateAvatarUrl(base64);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Command Center / Actions Panel (lg:col-span-3) */}
        <div className="glass-panel p-6 lg:col-span-3 flex flex-col gap-4">
          <h2 className="text-lg font-bold border-b border-[rgba(212,175,55,0.2)] pb-2 mb-2 flex items-center gap-2">
            <Coins size={18} /> 行動指揮中心
          </h2>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setScreen('scheduler')} 
              className="btn-fantasy w-full py-4 text-sm flex items-center justify-center gap-2"
            >
              <Calendar size={18} /> 制定本月日程
            </button>

            <button 
              onClick={() => setScreen('store')} 
              className="btn-fantasy-sec w-full py-3.5 text-sm flex items-center justify-center gap-2 hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              <ShoppingCart size={18} /> 拜訪武器禮品店
            </button>

            <button 
              onClick={startAdventure} 
              className="btn-fantasy-sec w-full py-3.5 text-sm flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-400"
            >
              <Compass size={18} /> 前往幽暗森林修行
            </button>
          </div>

          <div className="border-t border-slate-800/80 pt-4 mt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>開發者作弊模式</span>
              <button 
                onClick={toggleCheatMode} 
                className="text-[#d4af37] focus:outline-none"
              >
                {cheatMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              啟用後金幣拉滿，各項屬性突飛猛進，方便快速測試所有不同結局。
            </p>
          </div>
        </div>
      </div>

      {/* Log Feed Display */}
      <div className="glass-panel p-5 flex flex-col gap-3">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-300">
          <History size={16} /> 養育事件日誌
        </h3>
        
        <div className="h-40 overflow-y-auto bg-slate-950/80 border border-slate-900/60 rounded-lg p-3 space-y-2 text-xs font-mono">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-center italic mt-12">尚無養育日誌，請開始制定日程運作遊戲。</p>
          ) : (
            logs.slice().reverse().map((log) => {
              let color = 'text-slate-400';
              if (log.type === 'stat_up') color = 'text-emerald-400';
              if (log.type === 'stat_down') color = 'text-red-400 font-semibold';
              if (log.type === 'event') color = 'text-[#ffd700] font-bold';
              if (log.type === 'dialogue') color = 'text-pink-400';

              return (
                <div key={log.id} className="flex items-start gap-1">
                  <span className="text-slate-500 shrink-0">
                    [{log.year}年{log.month}月{log.period === 'early' ? '上' : log.period === 'mid' ? '中' : '下'}旬]
                  </span>
                  <span className={color}>{log.text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
