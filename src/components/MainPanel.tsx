import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { StatPanel } from './StatPanel';
import { SaveLoadPanel } from './SaveLoadPanel';
import { getAvatarPath } from '../utils/avatar';
import { getPersonalityType, PERSONALITY_INFO } from '../utils/personality';
import { 
  Sparkles, Calendar, Coins, Save, RefreshCw, 
  ShoppingCart, Compass, ToggleLeft, ToggleRight, 
  History, Crown, Lock, Check, ChevronDown, ChevronUp, Heart, Award
} from 'lucide-react';

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

// All ending titles - mirror EndingGallery's ALL_ENDINGS list
const ENDING_TITLE_MAP: Record<string, string> = {
  infinite_observer: '命運之神',
  binlang_monopoly: '歐陸提神產業帝國總裁',
  lucky_lay_flat: '強運登基者',
  shadow_cabinet: '幕後支配者',
  phantom_thief_triplets: '義賊怪盜三胞胎',
  clover_mercenary: '蔚藍傭兵團雙劍團長',
  shanshan_court_aide: '王都智囊院首席策士',
  xuewu_magic_tower: '星海塔隱居魔導師',
  royal_return: '蔚藍海岸王國女王',
  three_revolution: '蔚藍共和國執政官',
  three_shelter: '蔚藍庇護所創始人',
  duet_adventurers: '流浪雙子冒險者',
  prince_marriage: '帝國王妃',
  court_official: '內宮大管家',
  valkyrie_hero: '傳奇勇者',
  holy_nun: '神之代言人',
  bounty_hunter: '荒野孤狼',
  famous_painter: '藝術巨匠',
  mob_boss: '地下教父',
  courtesan: '蔚藍海岸交際花',
  beggar: '街頭乞討者',
  housewife: '普通市民',
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
    performStreetPerformance
  } = useGame();

  const { daughter, time, logs, cheatMode } = state;
  const [isClosetOpen, setIsClosetOpen] = useState(false);
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [isStatPanelOpen, setIsStatPanelOpen] = useState(false);

  const personality = getPersonalityType(daughter);
  const personalityInfo = PERSONALITY_INFO[personality];
  const isRebellious = daughter.attributes.morality < 50 && daughter.attributes.stress > 80;
  const isSick = !!daughter.isSick;
  const hasInteractedThisMonth = state.lastFatherInteractionMonth === time.month;

  // Earned titles from completed endings
  const earnedTitles = (state.completedEndings || [])
    .map(id => ENDING_TITLE_MAP[id])
    .filter(Boolean);

  const getAvatarStyle = (charId: string) => {
    if (charId === 'emilia') {
      return { filter: 'hue-rotate(330deg) saturate(0.8) sepia(0.5)' };
    }
    return {};
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
              onClick={() => setIsSavePanelOpen(true)} 
              title="存檔管理" 
              className="px-3 py-2 rounded bg-[rgba(255,255,255,0.05)] border border-slate-700 hover:border-[#d4af37] hover:text-[#d4af37] transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              <Save size={16} />
              <span>存/讀檔紀錄</span>
            </button>
            <button 
              onClick={() => {
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
          onClick={() => setIsStatPanelOpen(prev => !prev)}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Center: Character Chamber Display */}
        <div className="glass-panel p-6 lg:col-span-7 order-1 flex flex-col gap-4 items-center">
          <h2 className="text-lg font-bold border-b border-[rgba(212,175,55,0.2)] pb-2 w-full text-center text-slate-200">
            {daughter.name} 的起居室
          </h2>

          {/* Portrait Container */}
          <div 
            className="w-full max-w-[280px] h-[340px] rounded-xl relative overflow-hidden flex flex-col items-center justify-end p-4"
            style={{
              background: isRebellious
                ? 'radial-gradient(circle at center, #2d1111 0%, #0f0404 100%)'
                : isSick
                ? 'radial-gradient(circle at center, #111a28 0%, #060a10 100%)'
                : 'radial-gradient(circle at center, #1b1633 0%, #0d0a1b 100%)',
              border: `2px solid ${isRebellious ? 'rgba(239,68,68,0.6)' : isSick ? 'rgba(96,165,250,0.5)' : (OUTFIT_BORDER_COLORS[daughter.outfit] || 'rgba(255,255,255,0.1)')}`,
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
                ...getAvatarStyle(daughter.characterId),
                filter: isSick
                  ? `${getAvatarStyle(daughter.characterId).filter || ''} brightness(0.7) saturate(0.4) hue-rotate(200deg)`.trim()
                  : isRebellious
                  ? `${getAvatarStyle(daughter.characterId).filter || ''} brightness(0.8) saturate(0.6) hue-rotate(340deg)`.trim()
                  : getAvatarStyle(daughter.characterId).filter
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
            
            {/* Rebellious Overlay */}
            {isRebellious && (
              <div className="absolute inset-0 bg-red-950/50 backdrop-blur-[1px] flex items-center justify-center z-20">
                <span className="px-3 py-1.5 bg-red-700 text-white font-bold rounded-lg border border-red-400 text-xs animate-bounce shadow-lg">
                  😤 叛逆狀態 (道德低落)
                </span>
              </div>
            )}

            {/* Sickness Overlay */}
            {isSick && !isRebellious && (
              <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                <span className="px-3 py-1.5 bg-blue-800 text-white font-bold rounded-lg border border-blue-400 text-xs animate-bounce shadow-lg">
                  🤒 生病中 (活動效果↓)
                </span>
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

            {/* Personality badge */}
            <div
              className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold z-20 border backdrop-blur"
              style={{
                background: 'rgba(0,0,0,0.65)',
                borderColor: personalityInfo.color + '80',
                color: personalityInfo.color
              }}
            >
              {personalityInfo.emoji} {personality}
            </div>
          </div>

          {/* Quick info bar */}
          <div className="w-full grid grid-cols-2 gap-4 text-center mt-2">
            <div className="bg-[rgba(255,255,255,0.02)] border border-slate-800 p-2.5 rounded-lg">
              <p className="text-xs text-slate-400">父親親密度</p>
              <p className="text-lg font-bold text-[#ffd700]">{daughter.relationship} / 100</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.02)] border border-slate-800 p-2.5 rounded-lg">
              <p className="text-xs text-slate-400">性格傾向</p>
              <p className="text-xs font-bold mt-1" style={{ color: personalityInfo.color }}>
                {personalityInfo.emoji} {personality}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{personalityInfo.desc}</p>
            </div>
          </div>

          {/* Earned Titles Display */}
          {earnedTitles.length > 0 && (
            <div className="w-full bg-[rgba(212,175,55,0.04)] border border-[rgba(212,175,55,0.2)] rounded-lg p-3">
              <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award size={12} /> 已獲封號
              </p>
              <div className="flex flex-wrap gap-1.5">
                {earnedTitles.map((title, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] rounded text-[10px] text-[#f3e5ab] font-semibold"
                  >
                    【{title}】
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Father-Daughter Interactivity */}
          <div className="w-full mt-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-[#ffd700] uppercase tracking-wider flex items-center gap-1.5">
                <Heart size={14} /> 父女互動（每月一次）
              </p>
              {hasInteractedThisMonth && !cheatMode && (
                <span className="text-[10px] text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
                  本月已互動
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button 
                onClick={() => talkToDaughter('gentle')} 
                disabled={hasInteractedThisMonth && !cheatMode}
                className="py-2 text-xs bg-[rgba(255,255,255,0.03)] border border-slate-700 hover:border-pink-500 hover:text-pink-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                💬 溫柔談心
              </button>
              <button 
                onClick={() => talkToDaughter('praise')} 
                disabled={hasInteractedThisMonth && !cheatMode}
                className="py-2 text-xs bg-[rgba(255,255,255,0.03)] border border-slate-700 hover:border-[#ffd700] hover:text-[#ffd700] rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                👍 誇獎表揚
              </button>
              <button 
                onClick={() => talkToDaughter('scold')} 
                disabled={hasInteractedThisMonth && !cheatMode}
                className={`py-2 text-xs bg-[rgba(255,255,255,0.03)] border rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isRebellious
                    ? 'border-red-500 text-red-400 hover:bg-red-950/20 animate-pulse'
                    : 'border-slate-700 hover:border-red-500 hover:text-red-400'
                }`}
              >
                ⚠️ 嚴厲訓導{isRebellious ? ' !' : ''}
              </button>
              <button 
                onClick={() => talkToDaughter('headpat')} 
                disabled={hasInteractedThisMonth && !cheatMode}
                className="py-2 text-xs bg-[rgba(255,255,255,0.03)] border border-slate-700 hover:border-amber-400 hover:text-amber-400 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🤲 溫柔摸頭
              </button>
            </div>
            <button
              onClick={() => talkToDaughter('allowance')}
              disabled={hasInteractedThisMonth && !cheatMode}
              className="w-full py-2 text-xs bg-[rgba(255,215,0,0.05)] border border-[rgba(212,175,55,0.3)] hover:border-[#ffd700] hover:text-[#ffd700] rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              💰 給零用錢（+80G+, 關係+6）
            </button>
            {isRebellious && (
              <p className="text-[10px] text-red-400/80 mt-1.5 text-center">
                ⚠️ 叛逆中：道德過低，日程活動有機率被拒絕。請使用「嚴厲訓導」提升道德！
              </p>
            )}
            {isSick && (
              <p className="text-[10px] text-blue-400/80 mt-1 text-center">
                🤒 生病中：活動效果大幅下降，請前往商店購買【聖水】或多次選擇休息恢復！
              </p>
            )}
          </div>

          {/* Closet Button */}
          <div className="w-full border-t border-slate-800/80 pt-3 mt-1">
            <button
              onClick={() => setIsClosetOpen(true)}
              className="btn-fantasy w-full py-3.5 text-sm flex items-center justify-center gap-2 hover:border-[#ffd700] hover:text-[#ffd700]"
            >
              裙 開啟女兒的衣櫃 (Closet)
            </button>
          </div>
        </div>

        {/* Right Side: Command Center / Actions Panel */}
        <div className="glass-panel p-6 lg:col-span-5 order-2 flex flex-col gap-4">
          <h2 className="text-lg font-bold border-b border-[rgba(212,175,55,0.2)] pb-2 mb-2 flex items-center gap-2 text-slate-200">
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

            {/* Bard specific street selling command */}
            {daughter.fatherBackground === 'bard' && (
              <button 
                onClick={performStreetPerformance} 
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
          {logs.length > 0 && (
            <span className="text-[10px] text-slate-500 font-normal ml-auto">共 {logs.length} 筆紀錄</span>
          )}
        </h3>
        
        <div className="h-48 overflow-y-scroll bg-slate-950/80 border border-slate-900/60 rounded-lg p-3 space-y-2 text-xs font-mono scrollbar-visible">
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
                onClick={() => setIsClosetOpen(false)}
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
                            onClick={() => changeOutfit(item.id)}
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
              onClick={() => setIsClosetOpen(false)}
              className="btn-fantasy py-2.5 px-6 text-xs w-full mt-2"
            >
              關閉衣櫃
            </button>
          </div>
        </div>
      )}

      {/* Save/Load Panel Modal */}
      {isSavePanelOpen && <SaveLoadPanel onClose={() => setIsSavePanelOpen(false)} />}
    </div>
  );
};
