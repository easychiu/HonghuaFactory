import React, { useState } from 'react';
import { useGame, ITEMS } from '../contexts/GameContext';
import { StatPanel } from './StatPanel';
import { SaveLoadPanel } from './SaveLoadPanel';
import { getAvatarPath, getDaughterPersonality } from '../utils/avatar';
import { audioManager } from '../utils/audio';
import { LogHistoryPanel } from './LogHistoryPanel';
import { 
  Sparkles, Calendar, Coins, Save, RefreshCw, 
  MessageSquare, ShoppingCart, Compass, ToggleLeft, ToggleRight, 
  History, Crown, Lock, Check, ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';
import { DiaryPanel } from './DiaryPanel';

const OUTFIT_NAMES = {
  default: '日常便服',
  dress: '皇家絲綢華麗洋裝',
  armor: '銀白女武神胸甲',
  summer: '盛夏微風連身裙'
};

const OUTFIT_BORDER_COLORS = {
  default: 'rgba(255,255,255,0.1)',
  dress: 'rgba(212, 175, 55, 0.6)',
  armor: 'rgba(192, 192, 192, 0.6)',
  summer: 'rgba(0, 180, 216, 0.6)'
};

export const MainPanel: React.FC = () => {
  const { 
    state, 
    setScreen,
    talkToDaughter,
    startAdventure,
    toggleCheatMode,
    restartGame,
    changeOutfit,
    performStreetPerformance,
    useItem,
    selectTitle
  } = useGame();

  const { daughter, time, logs, cheatMode } = state;
  const [isClosetOpen, setIsClosetOpen] = useState(false);
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [isStatPanelOpen, setIsStatPanelOpen] = useState(false);
  const [useItemMessage, setUseItemMessage] = useState<string | null>(null);
  const [showDiary, setShowDiary] = useState(false);

  const handleUseItem = (itemId: string) => {
    const res = useItem(itemId);
    if (res.success) {
      audioManager.playSfx('sfx_heal.mp3');
      setUseItemMessage(res.message);
      setTimeout(() => setUseItemMessage(null), 3000);
    } else {
      audioManager.playSfx('sfx_click.mp3');
      alert(res.message);
    }
  };

  const getAvatarStyle = (charId: string) => {
    let filter = '';
    if (charId === 'emilia') {
      filter += 'hue-rotate(330deg) saturate(0.8) sepia(0.5) ';
    }
    if (daughter.isSick) {
      filter += 'grayscale(0.45) sepia(0.25) contrast(0.9) ';
    } else if (daughter.isRebellious) {
      filter += 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.7)) ';
    }
    return filter ? { filter: filter.trim() } : {};
  };

  const scaleFactor = 
    daughter.age <= 11 ? 0.82 :
    daughter.age <= 13 ? 0.88 :
    daughter.age <= 15 ? 0.94 : 1.0;

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 w-full max-w-7xl mx-auto animate-slide-up">
      {/* Header Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(212,175,55,0.15)] rounded-lg text-[#d4af37] border border-[rgba(212,175,55,0.3)]">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-[#d4af37] bg-clip-text text-transparent">
              蔚藍海岸的王女們
            </h1>
            <p className="text-xs text-slate-400">養育王女的成長軌跡 ({daughter.name})</p>
          </div>
        </div>

        {/* Date and Gold Display */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
          {/* Time Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,255,255,0.03)] border border-slate-700/50 rounded-lg text-sm">
            <Calendar className="text-[#d4af37]" size={16} />
            <span className="font-semibold text-[#f3e5ab]">
              第 {time.year} 年 {time.month} 月
            </span>
          </div>

          {/* Gold Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.25)] rounded-lg text-sm">
            <Coins className="text-[#ffd700] float-animation" size={16} />
            <span className="font-bold text-[#ffd700]">{daughter.gold} G</span>
          </div>

          {/* Save/Load / Reset Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                audioManager.playSfx('sfx_click.mp3');
                setIsSavePanelOpen(true);
              }} 
              title="存檔管理" 
              className="p-2 rounded bg-[rgba(255,255,255,0.05)] border border-slate-700 hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
            >
              <Save size={16} />
            </button>
            <button 
              onClick={() => {
                audioManager.playSfx('sfx_click.mp3');
                if (window.confirm('確定要重新開始遊戲嗎？這會清除所有進度。')) {
                  restartGame();
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

      {/* Collapsible Stats Panel */}
      <div className="glass-panel overflow-hidden">
        <button
          onClick={() => {
            audioManager.playSfx('sfx_click.mp3');
            setIsStatPanelOpen(prev => !prev);
          }}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        >
          <span className="text-sm font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={14} /> 能力與屬性資訊
          </span>
          {isStatPanelOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>
        {isStatPanelOpen && (
          <div className="border-t border-[rgba(255,255,255,0.06)]">
            <StatPanel daughter={daughter} />
          </div>
        )}
      </div>

      {/* Seasonal Event Banner */}
      {state.seasonalEvent && (
        <div className="w-full p-3 sm:p-4 rounded-xl border animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg bg-indigo-950/20 border-indigo-500/30">
          <div className="flex items-center gap-3 text-left">
            <span className="text-2xl">
              {state.seasonalEvent === 'cold_wave' ? '❄️' :
               state.seasonalEvent === 'caravan' ? '🐫' :
               state.seasonalEvent === 'tax' ? '📜' :
               state.seasonalEvent === 'harvest_blessing' ? '🌾' : '🏰'}
            </span>
            <div>
              <h4 className="text-sm font-bold text-indigo-300">
                {state.seasonalEvent === 'cold_wave' ? '大寒流襲來' :
                 state.seasonalEvent === 'caravan' ? '流浪商旅到訪' :
                 state.seasonalEvent === 'tax' ? '王國臨時徵稅' :
                 state.seasonalEvent === 'harvest_blessing' ? '豐收女神的祝福' : '皇家特使巡視'}
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                {state.seasonalEvent === 'cold_wave' && '本月異常寒冷！女兒學習課程疲勞額外 +3，但在家靜養的減壓效果增加 5 點。'}
                {state.seasonalEvent === 'caravan' && '異國商旅抵達！本月皇家武器與禮品商會以及黑市所有商品享有 8 折特惠特價！'}
                {state.seasonalEvent === 'tax' && '王國徵稅法案！本月所有商店商品漲價 20%，且月底將自動扣除 80 G 稅金（不足扣則壓力+25）。'}
                {state.seasonalEvent === 'harvest_blessing' && '大地豐饒恩賜！本月女兒進行所有打工活動的薪資回報大幅增加 30%！'}
                {state.seasonalEvent === 'royal_inspection' && '皇家特使來臨！本月學院課程正面屬性額外 +2，且額外獲得道德感 +3！'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Center: Character Chamber Display */}
        <div className="glass-panel p-4 sm:p-6 lg:col-span-7 order-1 flex flex-col gap-4 items-center">
          <h2 className="text-lg font-bold border-b border-[rgba(212,175,55,0.2)] pb-2 w-full text-center text-slate-200 flex flex-col items-center justify-center gap-1">
            {daughter.selectedTitle && (
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 bg-amber-950/70 border border-amber-500/40 text-[#ffd700] rounded-full font-extrabold tracking-wider animate-pulse shadow-md">
                🏆 稱號：{daughter.selectedTitle}
              </span>
            )}
            <span>{daughter.name} 的起居室</span>
          </h2>

          {/* Use item message toast */}
          {useItemMessage && (
            <div className="w-full p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs font-semibold text-center animate-pulse">
              {useItemMessage}
            </div>
          )}

          {/* Portrait Container */}
          <div 
            className="w-full max-w-[280px] h-[340px] rounded-xl relative overflow-hidden flex flex-col items-center justify-end p-4"
            style={{
              background: 'radial-gradient(circle at center, #1b1633 0%, #0d0a1b 100%)',
              border: `2px solid ${OUTFIT_BORDER_COLORS[daughter.outfit] || 'rgba(255,255,255,0.1)'}`,
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}
          >
            {/* Sprite Overlay Container with Age Scale and CSS Filters */}
            <div 
              style={{
                transform: `scale(${scaleFactor})`,
                transformOrigin: 'bottom center',
                transition: 'transform 0.5s ease-in-out',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'center',
                height: '200px',
                width: '100%',
                position: 'absolute',
                bottom: '16px',
                left: 0,
                right: 0,
                ...getAvatarStyle(daughter.characterId)
              }}
            >
              <img 
                src={getAvatarPath(daughter.age, daughter.outfit, daughter.avatarUrl)} 
                alt={daughter.name} 
                className="h-[250px] w-auto object-contain float-animation"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            
            {/* Decorative frame inside */}
            <div className="absolute inset-2 border border-[rgba(212,175,55,0.08)] pointer-events-none rounded-lg" />
            
            {/* Sickness Overlay */}
            {daughter.isSick && (
              <div className="absolute inset-0 bg-[rgba(15,23,42,0.4)] backdrop-blur-[0.5px] flex items-center justify-center z-20">
                <span className="px-3 py-1.5 bg-sky-950/90 text-sky-300 font-bold rounded-lg border border-sky-500/50 text-xs animate-pulse shadow-lg flex items-center gap-1.5">
                  🤢 生病中 (氣色蒼白)
                </span>
              </div>
            )}

            {/* Sickness Danger (Warning if stress > stamina but not sick yet) */}
            {!daughter.isSick && daughter.attributes.stress > daughter.attributes.stamina && (
              <div className="absolute inset-0 bg-red-950/30 backdrop-blur-[0.5px] flex items-center justify-center z-20">
                <span className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-lg border border-red-400 text-xs animate-bounce shadow-lg">
                  🤒 疲勞過度 (生病警告)
                </span>
              </div>
            )}

            {/* Personality overlay */}
            <div className="absolute top-3 left-3 bg-indigo-950/80 border border-indigo-500/50 backdrop-blur px-2.5 py-1 rounded text-[10px] sm:text-xs text-[#c7d2fe] font-bold z-20 shadow-md flex items-center gap-1">
              ✨ {getDaughterPersonality(daughter.attributes)}
            </div>

            {/* Rebellion Overlay/Badge */}
            {daughter.isRebellious && (
              <div className="absolute top-12 left-3 bg-red-950/90 border border-red-500/50 backdrop-blur px-2.5 py-1 rounded-md text-[10px] text-red-400 font-bold z-20 animate-pulse flex items-center gap-1 shadow-lg">
                ⚡ 叛逆期 (不服管教)
              </div>
            )}

            {/* Custom outfit label */}
            <div className="absolute bottom-3 left-3 bg-black/60 border border-slate-700/50 backdrop-blur px-2.5 py-1 rounded text-xs text-[#f3e5ab] font-bold z-20">
              👕 {OUTFIT_NAMES[daughter.outfit]}
            </div>
            
            {/* Age overlay */}
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

          {/* Personality-specific speech bubble */}
          {(() => {
            const personality = getDaughterPersonality(daughter.attributes);
            const quotes = {
              '元氣女漢子': '「老爸！今天也要打起精神，熱血地揮劍一千次！」',
              '高冷學霸': '「這本古書很有意思……父親，請保持安靜，我在思考。」',
              '多愁善感藝術家': '「風拂過荖葉的聲音，聽起來像是王國失落的哀歌……」',
              '溫柔乖乖女': '「爸爸，今天我幫你泡了茶，要注意身體，不要太累了喔。」',
              '社交名媛': '「優雅是王女必備的武裝。不論身處何境，都不能失了禮儀。」',
              '天真少女': '「老爸！今天可以帶我去吃草莓千層蛋糕嗎？」'
            };
            return (
              <div className="w-full bg-[rgba(255,255,255,0.02)] border border-slate-800/80 p-3 rounded-lg text-center relative mt-3 shadow-inner">
                {/* Little triangle pointing up */}
                <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 border-t border-l border-slate-800/60 rotate-45" />
                <p className="text-xs text-indigo-200 italic font-medium leading-relaxed">
                  {daughter.isRebellious ? '「別管我，我想自己待著……」' : quotes[personality] || '「老爸，今天有什麼安排嗎？」'}
                </p>
              </div>
            );
          })()}

          {/* Father-Daughter Interactivity */}
          <div className="w-full mt-2">
            <p className="text-xs font-bold text-[#ffd700] uppercase tracking-wider mb-2 flex items-center gap-1.5 justify-center">
              <MessageSquare size={14} /> 與女兒互動對話
            </p>
            <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4">
              <button 
                onClick={() => {
                  audioManager.playSfx('sfx_click.mp3');
                  talkToDaughter('gentle');
                }} 
                className="py-2 px-1 text-[10px] sm:text-xs bg-[rgba(255,255,255,0.03)] border border-slate-700 hover:border-pink-500 hover:text-pink-400 rounded-lg transition-all"
              >
                💬 溫柔談心
              </button>
              <button 
                onClick={() => {
                  audioManager.playSfx('sfx_click.mp3');
                  talkToDaughter('praise');
                }} 
                className="py-2 px-1 text-[10px] sm:text-xs bg-[rgba(255,255,255,0.03)] border border-slate-700 hover:border-[#ffd700] hover:text-[#ffd700] rounded-lg transition-all"
              >
                👍 誇獎表揚
              </button>
              <button 
                onClick={() => {
                  audioManager.playSfx('sfx_click.mp3');
                  talkToDaughter('scold');
                }} 
                className="py-2 px-1 text-[10px] sm:text-xs bg-[rgba(255,255,255,0.03)] border border-slate-700 hover:border-red-500 hover:text-red-400 rounded-lg transition-all"
              >
                ⚠️ 嚴厲訓導
              </button>
            </div>
          </div>

          {/* Closet Button */}
          <div className="w-full border-t border-slate-800/80 pt-3 mt-1">
            <button
              onClick={() => {
                audioManager.playSfx('sfx_click.mp3');
                setIsClosetOpen(true);
              }}
              className="btn-fantasy w-full py-3.5 text-sm flex items-center justify-center gap-2 hover:border-[#ffd700] hover:text-[#ffd700]"
            >
              裙 開啟女兒的衣櫃 (Closet)
            </button>
          </div>

          {/* Title Selector Section */}
          {(() => {
            const unlocked = state.unlockedAchievements || [];
            const titleMap = [
              { ach: '第一次當爸爸', title: '乖巧女兒' },
              { ach: '海路放行者', title: '外交特使' },
              { ach: '三王女重聚', title: '血脈繼承者' },
              { ach: '蔚藍大富翁', title: '檳榔大亨' },
              { ach: '良師友誼', title: '同窗焦點' },
              { ach: '永遠的學院生', title: '萬年留級生' },
              { ach: '皇家圖書館學伴', title: '皇家學霸' },
              { ach: '逆天改命', title: '幸運之神' },
              { ach: '收穫祭之霸', title: '競技之王' }
            ];
            
            const availableTitles = titleMap.filter(item => unlocked.includes(item.ach));
            if (availableTitles.length === 0) return null;

            return (
              <div className="w-full border-t border-slate-800/80 pt-3 mt-2 flex flex-col gap-1.5 items-center justify-center">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  👑 配戴成就稱號
                </label>
                <select
                  value={daughter.selectedTitle || ''}
                  onChange={(e) => {
                    audioManager.playSfx('sfx_coin.mp3');
                    selectTitle(e.target.value || null);
                  }}
                  className="w-full max-w-[220px] text-xs bg-slate-950/80 text-[#ffd700] border border-slate-850 hover:border-[#d4af37] px-3 py-1.5 rounded-lg focus:outline-none focus:border-[#d4af37] transition-all cursor-pointer font-bold text-center"
                >
                  <option value="" className="text-slate-400">--- 無稱號 ---</option>
                  {availableTitles.map(item => (
                    <option key={item.title} value={item.title} className="text-[#ffd700] bg-slate-950 font-bold">
                      🏆 {item.title}
                    </option>
                  ))}
                </select>
              </div>
            );
          })()}

          {/* Backpack Section */}
          <div className="w-full border-t border-slate-800/60 pt-4 mt-2">
            <p className="text-xs font-bold text-[#ffd700] uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center">
              🎒 隨身背包 (Backpack)
            </p>
            {state.inventory.filter(id => ITEMS.find(item => item.id === id)?.type === 'food').length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center italic py-3 bg-slate-950/40 border border-slate-900/60 rounded-xl">
                背包目前無可用食品或藥水，可拜訪商店購買。
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {state.inventory.map((itemId, idx) => {
                  const item = ITEMS.find(i => i.id === itemId);
                  if (!item || item.type !== 'food') return null;
                  
                  return (
                    <div 
                      key={`${itemId}-${idx}`}
                      className="flex items-center justify-between p-2 bg-slate-950/60 border border-slate-900 hover:border-slate-800 rounded-xl text-xs"
                    >
                      <div className="flex flex-col min-w-0 pr-1.5">
                        <span className="font-semibold text-slate-200 truncate" title={item.name}>{item.name}</span>
                        <span className="text-[10px] text-slate-400 truncate mt-0.5" title={item.description}>{item.description}</span>
                      </div>
                      <button
                        onClick={() => handleUseItem(itemId)}
                        className="shrink-0 px-2.5 py-1 bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/50 hover:border-emerald-400 text-white rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
                      >
                        使用
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Command Center / Actions Panel */}
        <div className="glass-panel p-6 lg:col-span-5 order-2 flex flex-col gap-4">
          <h2 className="text-lg font-bold border-b border-[rgba(212,175,55,0.2)] pb-2 mb-2 flex items-center gap-2 text-slate-200">
            <Coins size={18} /> 行動指揮中心
          </h2>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                audioManager.playSfx('sfx_click.mp3');
                setScreen('scheduler');
              }} 
              className="btn-fantasy w-full py-4 text-sm flex items-center justify-center gap-2"
            >
              <Calendar size={18} /> 制定本月日程
            </button>

            <button 
              onClick={() => {
                audioManager.playSfx('sfx_click.mp3');
                setScreen('store');
              }} 
              className="btn-fantasy-sec w-full py-3.5 text-sm flex items-center justify-center gap-2 hover:border-[#d4af37] hover:text-[#d4af37]"
            >
              <ShoppingCart size={18} /> 拜訪武器禮品店
            </button>

            <button 
              onClick={() => {
                audioManager.playSfx('sfx_click.mp3');
                startAdventure();
              }} 
              className="btn-fantasy-sec w-full py-3.5 text-sm flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-400"
            >
              <Compass size={18} /> 前往幽暗森林修行
            </button>

            <button 
              onClick={() => {
                audioManager.playSfx('sfx_click.mp3');
                setShowDiary(true);
              }} 
              className="btn-fantasy-sec w-full py-3.5 text-sm flex items-center justify-center gap-2 border-pink-500/40 text-pink-300 hover:bg-pink-950/20 hover:border-pink-400 hover:text-pink-200"
            >
              <BookOpen size={18} /> 女兒成長回憶日記
            </button>

            {/* Bard specific street selling command */}
            {daughter.fatherBackground === 'bard' && (
              <button 
                onClick={() => {
                  audioManager.playSfx('sfx_click.mp3');
                  performStreetPerformance();
                }} 
                className="btn-fantasy-sec w-full py-3.5 text-sm flex items-center justify-center gap-2 border-purple-500/40 text-purple-300 hover:bg-purple-950/20 hover:border-purple-400"
              >
                🎸 街頭琴藝賣藝
              </button>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-4 mt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>開發者作弊模式</span>
              <button 
                onClick={() => {
                  audioManager.playSfx('sfx_click.mp3');
                  toggleCheatMode();
                }} 
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
      {(() => {
        // 1. 將平鋪的 logs 按「年 — 月」進行高階聚合分組
        const groupedLogs = logs.reduce((acc, log) => {
          const key = `第 ${log.year} 年 — ${log.month} 月`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(log);
          return acc;
        }, {} as Record<string, typeof logs>);

        // 2. 將分組改為陣列並逆序排列（讓最新的年份月份排在最上面）
        const sortedGroupEntries = Object.entries(groupedLogs).reverse();

        return (
          <div className="brass-panel p-5 flex flex-col gap-3 rounded-lg">
            <h3 className="text-sm font-bold flex items-center gap-2 text-[#e5c483] uppercase tracking-widest">
              <History size={16} className="text-[#c5a059]" /> 
              王女養育事件編年史
              {logs.length > 0 && (
                <span className="text-[10px] text-slate-500 font-normal ml-auto font-mono">共 {logs.length} 筆紀錄</span>
              )}
            </h3>
            
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 v-scrollbar">
              {logs.length === 0 ? (
                <div className="bg-slate-950/80 border border-slate-900/60 rounded-lg h-48 flex items-center justify-center">
                  <p className="text-slate-500 text-center italic font-serif">尚無養育日誌，請開始制定日程運作遊戲。</p>
                </div>
              ) : (
                sortedGroupEntries.map(([monthKey, monthLogs], index) => {
                  // 只有最新的一個月 (index === 0) 預設展開 open，其餘舊月份自動摺疊
                  const isLatestMonth = index === 0;

                  return (
                    <details 
                      key={monthKey} 
                      className="group border border-[#c5a059]/35 bg-black-dark/40 rounded overflow-hidden transition-all"
                      open={isLatestMonth}
                    >
                      {/* 手風琴摺疊大標題 */}
                      <summary className="p-2.5 cursor-pointer text-xs font-bold text-[#e5c483] bg-[#161412] hover:bg-[#231f1b] flex justify-between items-center select-none pointer-events-auto transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span>{monthKey}</span>
                          {isLatestMonth && (
                            <span className="text-[9px] bg-[#6b1d2f] text-white px-1.5 py-0.5 rounded border border-[#c5a059]/45 scale-90 origin-left">
                              最新旬
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-normal group-open:hidden">
                          展開 ({monthLogs.length} 條)
                        </span>
                        <span className="text-[10px] text-[#c5a059] font-normal hidden group-open:inline">
                          收起
                        </span>
                      </summary>

                      {/* 月份內部日誌細項 */}
                      <div className="p-2.5 space-y-1.5 border-t border-[#c5a059]/20 bg-black-dark/20 text-left divide-y divide-[#c5a059]/5">
                        {monthLogs.slice().reverse().map((log) => {
                          let color = 'text-slate-400';
                          if (log.type === 'stat_up') color = 'text-emerald-400';
                          if (log.type === 'stat_down') color = 'text-red-400 font-semibold';
                          if (log.type === 'event') color = 'text-[#ffd700] font-bold';
                          if (log.type === 'dialogue') color = 'text-pink-400';

                          return (
                            <div key={log.id} className="flex items-start gap-2 text-xs pt-1.5 first:pt-0 leading-relaxed">
                              <span className="text-slate-500 font-mono shrink-0 bg-black-dark/40 px-1 rounded text-[10px]">
                                {log.period === 'early' ? '上旬' : log.period === 'mid' ? '中旬' : '下旬'}
                              </span>
                              <span className={color}>{log.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* Closet Modal */}
      {isClosetOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-xl p-6 md:p-8 animate-slide-up border-2 border-[#d4af37]/45 shadow-[0_0_30px_rgba(212,175,55,0.25)] flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 text-[#d4af37]">
              <div className="flex items-center gap-2 font-bold text-sm md:text-base tracking-wide">
                <Crown size={18} />
                <span>👗 女兒的更衣室 (Closet)</span>
              </div>
              <button 
                onClick={() => {
                  audioManager.playSfx('sfx_click.mp3');
                  setIsClosetOpen(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400">
              隨時更換女兒的服飾裝扮。已在武器商店購買的特殊服飾會在此解鎖，更換服飾會即時呈現在起居室、日程執行動畫與結局中。
            </p>

            {/* Closet Items list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
              {[
                { 
                  id: 'default' as const, 
                  name: OUTFIT_NAMES.default, 
                  desc: '初始日常便服，舒適而樸素。', 
                  itemId: null, 
                  image: getAvatarPath(daughter.age, 'default', daughter.avatarUrl) 
                },
                { 
                  id: 'dress' as const, 
                  name: OUTFIT_NAMES.dress, 
                  desc: '皇家絲綢華麗洋裝，極大提升魅力與名望。', 
                  itemId: 'royal_dress', 
                  image: getAvatarPath(daughter.age, 'dress', daughter.avatarUrl) 
                },
                { 
                  id: 'armor' as const, 
                  name: OUTFIT_NAMES.armor, 
                  desc: '銀白女武神胸甲，防禦力驚人並提升戰技。', 
                  itemId: 'silver_armor', 
                  image: getAvatarPath(daughter.age, 'armor', daughter.avatarUrl) 
                },
                { 
                  id: 'summer' as const, 
                  name: OUTFIT_NAMES.summer, 
                  desc: '盛夏微風連身裙，清涼舒適，洋溢青春氣息。', 
                  itemId: 'summer_dress', 
                  image: getAvatarPath(daughter.age, 'summer', daughter.avatarUrl) 
                }
              ].map((item) => {
                const isOwned = !item.itemId || state.inventory.includes(item.itemId);
                const isEquipped = daughter.outfit === item.id;
                
                return (
                  <div 
                    key={item.id} 
                    className={`flex flex-col gap-3 p-3 bg-slate-950/60 border rounded-xl transition-all ${
                      isEquipped 
                        ? 'border-[#d4af37] bg-[rgba(212,175,55,0.04)] shadow-[0_0_10px_rgba(212,175,55,0.15)]' 
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Item header with Preview */}
                    <div className="flex gap-3 items-center">
                      <div 
                        className="w-14 h-14 bg-slate-900 rounded-lg overflow-hidden border border-slate-800/80 flex items-center justify-center shrink-0"
                        style={getAvatarStyle(daughter.characterId)}
                      >
                        <img 
                           src={item.image} 
                           alt={item.name} 
                           className="h-full w-auto object-contain" 
                           onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal line-clamp-2">{item.desc}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      {!isOwned ? (
                        <>
                          <span className="text-[10px] text-red-400/80 flex items-center gap-1">
                            <Lock size={12} /> 未擁有
                          </span>
                          <button
                            onClick={() => {
                              audioManager.playSfx('sfx_click.mp3');
                              setIsClosetOpen(false);
                              setScreen('store');
                            }}
                            className="px-3 py-1 bg-slate-900 hover:bg-[#d4af37] hover:text-black border border-slate-700 hover:border-transparent text-[10px] font-bold rounded transition-all"
                          >
                            前往商店購買
                          </button>
                        </>
                      ) : isEquipped ? (
                        <>
                          <span className="text-[10px] text-[#ffd700] flex items-center gap-1 font-semibold">
                            <Check size={12} /> 穿戴中
                          </span>
                          <button
                            disabled
                            className="px-3 py-1 bg-[rgba(255,255,255,0.03)] border border-slate-800 text-[10px] text-slate-500 rounded cursor-not-allowed"
                          >
                            已裝備
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            已擁有
                          </span>
                          <button
                            onClick={() => {
                              audioManager.playSfx('sfx_click.mp3');
                              changeOutfit(item.id);
                            }}
                            className="px-3 py-1 bg-[#d4af37]/80 hover:bg-[#d4af37] text-slate-950 text-[10px] font-bold rounded transition-all"
                          >
                            換上服飾
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer close */}
            <button
              onClick={() => {
                audioManager.playSfx('sfx_click.mp3');
                setIsClosetOpen(false);
              }}
              className="btn-fantasy py-2.5 px-6 text-xs w-full mt-2"
            >
              關閉衣櫃
            </button>
          </div>
        </div>
      )}

      {/* Save/Load Panel Modal */}
      {isSavePanelOpen && <SaveLoadPanel onClose={() => setIsSavePanelOpen(false)} />}
      
      {/* Daughter Growth Diary Modal */}
      {showDiary && <DiaryPanel onClose={() => setShowDiary(false)} />}
    </div>
  );
};
