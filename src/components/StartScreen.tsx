import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { EndingGallery } from './EndingGallery';
import { AchievementPanel } from './AchievementPanel';
import { Sparkles, Calendar, User, Shield, BookOpen, Coins, Music, Lock, Trophy } from 'lucide-react';
import type { CharacterId, FatherBackground } from '../types';

export const StartScreen: React.FC = () => {
  const { state, initGame, unlockAllProtagonists } = useGame();
  const { unlockedCharacters = ['honghua'], completedEndings = [] } = state;

  const [name, setName] = useState('');
  const [showGallery, setShowGallery] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [birthMonth, setBirthMonth] = useState(5);
  const [birthDay, setBirthDay] = useState(20);
  const [selectedChar, setSelectedChar] = useState<CharacterId>('honghua');
  const [selectedFather, setSelectedFather] = useState<FatherBackground>('knight');

  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const defaultAvatar = `${prefix}sprites/daughter_10_default.png`;

  // Autocomplete default name when selecting character
  const handleCharSelect = (charId: CharacterId) => {
    if (!unlockedCharacters.includes(charId)) return; // Locked
    setSelectedChar(charId);
    if (charId === 'honghua') setName('紅花');
    else if (charId === 'erica') setName('艾莉卡');
    else if (charId === 'emilia') setName('艾蜜莉亞');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name || (selectedChar === 'honghua' ? '紅花' : selectedChar === 'erica' ? '艾莉卡' : '艾蜜莉亞');
    initGame(finalName, birthMonth, birthDay, selectedChar, selectedFather);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-8 min-h-[95vh] w-full max-w-5xl mx-auto">
      <div className="glass-panel w-full p-4 sm:p-6 md:p-10 animate-slide-up border-2 border-[#d4af37]/35 shadow-[0_0_35px_rgba(212,175,55,0.2)]">
        
        {/* Game Title & Top Buttons Bar */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8 pb-6 border-b border-slate-900/60 relative">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            {/* Left Button Group (Gallery & Achievements) */}
            <div className="flex flex-wrap items-center justify-center gap-2 order-2 md:order-1">
              {completedEndings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowGallery(true)}
                  className="text-[10px] text-[#ffd700] hover:text-[#ffe566] border border-[#d4af37]/30 hover:border-[#ffd700]/50 bg-[#d4af37]/5 hover:bg-[#d4af37]/10 px-2.5 py-1.5 rounded transition-all flex items-center gap-1.5 uppercase font-semibold"
                >
                  <Trophy size={12} /> 結局圖鑑 ({completedEndings.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowAchievements(true)}
                className="text-[10px] text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-400/50 bg-purple-500/5 hover:bg-purple-500/10 px-2.5 py-1.5 rounded transition-all flex items-center gap-1.5 uppercase font-semibold"
              >
                <Trophy size={12} /> 榮譽成就 ({state.unlockedAchievements?.length || 0})
              </button>
            </div>

            {/* Title Center */}
            <div className="text-center order-1 md:order-2 flex-1">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-[#ffd700] via-[#ffb703] to-[#e9c46a] bg-clip-text text-transparent drop-shadow-md tracking-wide">
                《蔚藍海岸的王女們》
              </h1>
              <p className="text-[10px] font-semibold tracking-widest text-[#a855f7] uppercase mt-1">
                Multi-Protagonist (NG+) Princess Maker Web Simulation
              </p>
            </div>

            {/* Right Button Group (Debug Unlock) */}
            <div className="flex items-center order-3">
              <button
                type="button"
                onClick={() => {
                  unlockAllProtagonists();
                  alert('已解鎖全部王女！現在可以點選艾莉卡或艾蜜莉亞進行遊戲！');
                }}
                className="text-[10px] text-[#a855f7] hover:text-[#c084fc] border border-[#a855f7]/30 hover:border-[#c084fc]/50 bg-[#a855f7]/5 hover:bg-[#a855f7]/10 px-2.5 py-1.5 rounded transition-all flex items-center gap-1.5 font-mono uppercase font-semibold"
              >
                🔓 Debug Unlock
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Grid: 1. Basic Setup & Daughter selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-900 pb-8">
            
            {/* Left: Basic Info */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-[#ffd700] border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase">
                <User size={14} /> 基礎身份設定
              </h2>
              
              {/* Name */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-300">女兒姓名</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value.slice(0, 10))}
                  placeholder={selectedChar === 'honghua' ? '紅花' : selectedChar === 'erica' ? '艾莉卡' : '艾蜜莉亞'}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-[#ffd700] text-sm transition-all"
                />
              </div>

              {/* Birthday */}
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Calendar size={12} /> 月份
                  </label>
                  <select 
                    value={birthMonth} 
                    onChange={(e) => setBirthMonth(Number(e.target.value))}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-[#ffd700] text-sm transition-all"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{m} 月</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Calendar size={12} /> 日期
                  </label>
                  <select 
                    value={birthDay} 
                    onChange={(e) => setBirthDay(Number(e.target.value))}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-[#ffd700] text-sm transition-all"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d} 日</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Protagonist Selector */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#ffd700] border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase">
                <Sparkles size={14} /> 選擇扮演王女 (NG+ 解鎖)
              </h2>
              
              <div className="flex flex-col gap-3">
                {/* 1. Honghua */}
                <div 
                  onClick={() => handleCharSelect('honghua')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${
                    selectedChar === 'honghua' 
                      ? 'bg-[rgba(212,175,55,0.06)] border-[#ffd700] shadow-[0_0_12px_rgba(212,175,55,0.08)]' 
                      : 'bg-slate-950/30 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <img 
                    src={defaultAvatar} 
                    alt="紅花" 
                    className="w-12 h-12 rounded-full border border-slate-800 bg-slate-950 object-cover" 
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">紅花 (首週目主角)</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-1.5 rounded">專屬：檳榔流</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">銀色短髮。道具店販售各式檳榔 Buff，野外修行可採集檳榔原物料。</p>
                  </div>
                </div>

                {/* 2. Erica */}
                <div 
                  onClick={() => handleCharSelect('erica')}
                  className={`p-3.5 rounded-xl border transition-all flex items-center gap-4 relative ${
                    !unlockedCharacters.includes('erica') 
                      ? 'border-slate-950' 
                      : selectedChar === 'erica'
                      ? 'bg-[rgba(212,175,55,0.06)] border-[#ffd700] shadow-[0_0_12px_rgba(212,175,55,0.08)] cursor-pointer' 
                      : 'bg-slate-950/30 border-slate-900 hover:border-slate-800 cursor-pointer'
                  }`}
                >
                  {!unlockedCharacters.includes('erica') && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1.5px] rounded-xl flex items-center justify-center z-10">
                      <span className="text-[10px] text-red-400 font-bold flex items-center gap-1 bg-red-950/80 border border-red-900/30 px-3 py-1 rounded shadow-sm">
                        <Lock size={10} /> 達成任意結局解鎖
                      </span>
                    </div>
                  )}
                  <img 
                    src={`${prefix}sprites/daughter_10_dress.png`} 
                    alt="艾莉卡" 
                    className="w-12 h-12 rounded-full border border-slate-800 bg-slate-950 object-cover" 
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">艾莉卡 (成就主角)</span>
                      <span className="text-[10px] text-amber-400 bg-amber-950/20 border border-amber-900/20 px-1.5 rounded">專屬：機率流</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">銀色雙馬尾。天生強運，日常學習、打工極高機率觸發大成功 (雙倍收益且無疲勞)。</p>
                  </div>
                </div>

                {/* 3. Emilia */}
                <div 
                  onClick={() => handleCharSelect('emilia')}
                  className={`p-3.5 rounded-xl border transition-all flex items-center gap-4 relative ${
                    !unlockedCharacters.includes('emilia') 
                      ? 'border-slate-950' 
                      : selectedChar === 'emilia'
                      ? 'bg-[rgba(212,175,55,0.06)] border-[#ffd700] shadow-[0_0_12px_rgba(212,175,55,0.08)] cursor-pointer' 
                      : 'bg-slate-950/30 border-slate-900 hover:border-slate-800 cursor-pointer'
                  }`}
                >
                  {!unlockedCharacters.includes('emilia') && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1.5px] rounded-xl flex items-center justify-center z-10">
                      <span className="text-[10px] text-red-400 font-bold flex items-center gap-1 bg-red-950/80 border border-red-900/30 px-3 py-1 rounded shadow-sm">
                        <Lock size={10} /> 達成認親或主線結局解鎖
                      </span>
                    </div>
                  )}
                  <img 
                    src={`${prefix}sprites/daughter_10_summer.png`} 
                    alt="艾蜜莉亞" 
                    className="w-12 h-12 rounded-full border border-slate-800 bg-slate-950 object-cover" 
                    style={{ filter: 'hue-rotate(330deg) saturate(0.8) sepia(0.5)' }} // Coffee hair filter
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">艾蜜莉亞 (成就主角)</span>
                      <span className="text-[10px] text-indigo-400 bg-indigo-950/20 border border-indigo-900/20 px-1.5 rounded">專屬：三人小隊</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">咖啡色雙馬尾。武者修行時青梅竹馬 yv、jumbo 全程陪同，解鎖三人聯擊奧義。</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 2. Father Identity selector */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#ffd700] border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase">
              <Shield size={14} /> 選擇父親的身份背景 (決定初始資源與修行隱藏節點)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* Lost Knight */}
              <div 
                onClick={() => setSelectedFather('knight')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  selectedFather === 'knight'
                    ? 'bg-[rgba(212,175,55,0.06)] border-[#ffd700] shadow-[0_0_12px_rgba(212,175,55,0.08)]' 
                    : 'bg-slate-950/30 border-slate-900 hover:border-slate-850 hover:bg-slate-950/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm text-white flex items-center gap-1">
                      <Shield size={14} className="text-slate-300" /> 失落的騎士
                    </h3>
                    <span className="text-[9px] text-slate-400">小康開局</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    給予女兒傳家鐵劍、女武神胸甲。初始戰技與力量提高。武者修行解鎖【隱密要塞】節點。
                  </p>
                </div>
                <div className="text-[10px] text-[#ffd700] border-t border-slate-900 mt-3 pt-2">
                  💰 初始資金：1,500 金幣
                </div>
              </div>

              {/* Scholar */}
              <div 
                onClick={() => setSelectedFather('scholar')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  selectedFather === 'scholar'
                    ? 'bg-[rgba(212,175,55,0.06)] border-[#ffd700] shadow-[0_0_12px_rgba(212,175,55,0.08)]' 
                    : 'bg-slate-950/30 border-slate-900 hover:border-slate-850 hover:bg-slate-950/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm text-white flex items-center gap-1">
                      <BookOpen size={14} className="text-slate-300" /> 失落的文臣
                    </h3>
                    <span className="text-[9px] text-slate-400">中產開局</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    自帶宮廷推薦信（提早高薪打工）。提升初始智力，文科課程享 8 折。修行解鎖【地下皇家圖書館】。
                  </p>
                </div>
                <div className="text-[10px] text-[#ffd700] border-t border-slate-900 mt-3 pt-2">
                  💰 初始資金：2,500 金幣
                </div>
              </div>

              {/* Merchant */}
              <div 
                onClick={() => setSelectedFather('merchant')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  selectedFather === 'merchant'
                    ? 'bg-[rgba(212,175,55,0.06)] border-[#ffd700] shadow-[0_0_12px_rgba(212,175,55,0.08)]' 
                    : 'bg-slate-950/30 border-slate-900 hover:border-slate-850 hover:bg-slate-950/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm text-white flex items-center gap-1">
                      <Coins size={14} className="text-slate-300" /> 行商人
                    </h3>
                    <span className="text-[9px] text-slate-400">富裕開局</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    自帶載具【未來摩托車 Gp125】，打工收入增加，道具店全品項 8 折。修行解鎖【黑市走私營地】。
                  </p>
                </div>
                <div className="text-[10px] text-[#ffd700] border-t border-slate-900 mt-3 pt-2">
                  💰 初始資金：5,000 金幣
                </div>
              </div>

              {/* Bard */}
              <div 
                onClick={() => setSelectedFather('bard')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  selectedFather === 'bard'
                    ? 'bg-[rgba(212,175,55,0.06)] border-[#ffd700] shadow-[0_0_12px_rgba(212,175,55,0.08)]' 
                    : 'bg-slate-950/30 border-slate-900 hover:border-slate-850 hover:bg-slate-950/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm text-white flex items-center gap-1">
                      <Music size={14} className="text-slate-300" /> 吟遊詩人
                    </h3>
                    <span className="text-[9px] text-slate-400">赤貧開局</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    配備舊魯特琴。藝術課程效果 +20%，日常解鎖「街頭賣藝」指令。修行解鎖【精靈的妖精之環】。
                  </p>
                </div>
                <div className="text-[10px] text-[#ffd700] border-t border-slate-900 mt-3 pt-2">
                  💰 初始資金：500 金幣
                </div>
              </div>

            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 text-center">
            <button 
              type="submit" 
              className="w-full max-w-sm btn-fantasy py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles size={20} /> 展開王女養育之旅
            </button>
          </div>

        </form>

      </div>

      {/* Ending Gallery Modal */}
      {showGallery && <EndingGallery onClose={() => setShowGallery(false)} />}

      {/* Achievement Panel Modal */}
      {showAchievements && <AchievementPanel onClose={() => setShowAchievements(false)} />}
    </div>
  );
};
