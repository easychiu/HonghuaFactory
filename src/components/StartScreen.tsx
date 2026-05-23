import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { EndingGallery } from './EndingGallery';
import { AchievementPanel } from './AchievementPanel';
import {
  Sparkles, Calendar, User, Shield, BookOpen, Coins, Music, Lock, Trophy,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { CharacterId, FatherBackground } from '../types';

type StartStep = 'prologue' | 'father' | 'daughter';

interface FatherData {
  id: FatherBackground;
  name: string;
  Icon: React.ElementType;
  badge: string;
  badgeClass: string;
  bgImage: string;
  description: string;
  gold: number;
}

interface CharData {
  id: CharacterId;
  name: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  description: string;
  getSprite: (prefix: string) => string;
  spriteStyle?: React.CSSProperties;
  getLockText: (isFirst: boolean) => string;
}

const FATHERS: FatherData[] = [
  {
    id: 'knight',
    name: '失落的騎士',
    Icon: Shield,
    badge: '小康開局',
    badgeClass: 'text-slate-300 border-slate-500/40 bg-slate-800/60',
    bgImage: '02. 騎士老爸專屬：隱密要塞.jpg',
    description: '給予女兒傳家鐵劍、女武神胸甲。初始戰技與力量提高。武者修行解鎖【隱密要塞】節點。',
    gold: 1500,
  },
  {
    id: 'scholar',
    name: '失落的文臣',
    Icon: BookOpen,
    badge: '中產開局',
    badgeClass: 'text-blue-300 border-blue-500/40 bg-blue-950/50',
    bgImage: '03. 文臣老爸專屬：地下皇家圖書館.jpg',
    description: '自帶宮廷推薦信（提早高薪打工）。提升初始智力，文科課程享 8 折。修行解鎖【地下皇家圖書館】。',
    gold: 2500,
  },
  {
    id: 'merchant',
    name: '行商人',
    Icon: Coins,
    badge: '富裕開局',
    badgeClass: 'text-yellow-300 border-yellow-500/40 bg-yellow-950/50',
    bgImage: '04. 商人老爸專屬：黑市走私營地.jpg',
    description: '自帶載具【未來摩托車 Gp125】，打工收入增加，道具店全品項 8 折。修行解鎖【黑市走私營地】。',
    gold: 5000,
  },
  {
    id: 'bard',
    name: '吟遊詩人',
    Icon: Music,
    badge: '赤貧開局',
    badgeClass: 'text-purple-300 border-purple-500/40 bg-purple-950/50',
    bgImage: '05. 詩人老爸專屬：精靈的妖精之環.jpg',
    description: '配備舊魯特琴。藝術課程效果 +20%，日常解鎖「街頭賣藝」指令。修行解鎖【精靈的妖精之環】。',
    gold: 500,
  },
];

const CHARS: CharData[] = [
  {
    id: 'honghua',
    name: '紅花',
    subtitle: '首週目主角',
    badge: '專屬：檳榔流',
    badgeClass: 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/20',
    description: '銀色短髮。道具店販售各式檳榔 Buff，野外修行可採集檳榔原物料。',
    getSprite: (p) => `${p}sprites/daughter_10_default.png`,
    getLockText: () => '',
  },
  {
    id: 'erica',
    name: '艾莉卡',
    subtitle: '成就主角',
    badge: '專屬：機率流',
    badgeClass: 'text-amber-400 bg-amber-950/20 border border-amber-900/20',
    description: '銀色雙馬尾。天生強運，日常學習、打工極高機率觸發大成功 (雙倍收益且無疲勞)。',
    getSprite: (p) => `${p}sprites/daughter_10_dress.png`,
    getLockText: (isFirst) => isFirst ? '首週目固定紅花' : '達成任意結局解鎖',
  },
  {
    id: 'emilia',
    name: '艾蜜莉亞',
    subtitle: '成就主角',
    badge: '專屬：三人小隊',
    badgeClass: 'text-indigo-400 bg-indigo-950/20 border border-indigo-900/20',
    description: '咖啡色雙馬尾。武者修行時青梅竹馬 yv、jumbo 全程陪同，解鎖三人聯擊奧義。',
    getSprite: (p) => `${p}sprites/daughter_10_summer.png`,
    spriteStyle: { filter: 'hue-rotate(330deg) saturate(0.8) sepia(0.5)' },
    getLockText: (isFirst) => isFirst ? '首週目固定紅花' : '達成認親或主線結局解鎖',
  },
];

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
  const [step, setStep] = useState<StartStep>('prologue');
  const [fatherIdx, setFatherIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  const isFirstPlaythrough = completedEndings.length === 0;

  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const prologueVideo = `${prefix}${encodeURIComponent('01. 序章：蔚藍崩裂之夜.mp4')}`;
  const prologueImage = `${prefix}${encodeURIComponent('01. 序章：蔚藍崩裂之夜.jpg')}`;

  const currentFather = FATHERS[fatherIdx];
  const currentChar = CHARS[charIdx];
  const FatherIcon = currentFather.Icon;
  const isCharLocked = isFirstPlaythrough
    ? currentChar.id !== 'honghua'
    : !unlockedCharacters.includes(currentChar.id);

  const goToFather = (idx: number) => {
    setFatherIdx(idx);
    setSelectedFather(FATHERS[idx].id);
  };
  const prevFather = () => goToFather((fatherIdx - 1 + FATHERS.length) % FATHERS.length);
  const nextFather = () => goToFather((fatherIdx + 1) % FATHERS.length);

  const goToChar = (idx: number) => {
    setCharIdx(idx);
    const char = CHARS[idx];
    const locked = isFirstPlaythrough ? char.id !== 'honghua' : !unlockedCharacters.includes(char.id);
    if (!locked) {
      setSelectedChar(char.id);
      if (char.id === 'honghua') setName('紅花');
      else if (char.id === 'erica') setName('艾莉卡');
      else if (char.id === 'emilia') setName('艾蜜莉亞');
    }
  };
  const prevChar = () => goToChar((charIdx - 1 + CHARS.length) % CHARS.length);
  const nextChar = () => goToChar((charIdx + 1) % CHARS.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCharLocked) return;
    const finalCharacterId: CharacterId = isFirstPlaythrough ? 'honghua' : selectedChar;
    const finalName = name || (finalCharacterId === 'honghua' ? '紅花' : finalCharacterId === 'erica' ? '艾莉卡' : '艾蜜莉亞');
    initGame(finalName, birthMonth, birthDay, finalCharacterId, selectedFather);
  };

  const navArrowClass =
    'absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-[#d4af37]/30 hover:border-[#d4af37]/60 transition-all backdrop-blur-sm shadow-lg';

  const dotActiveClass = 'w-6 h-2.5 rounded-full bg-[#ffd700] shadow-[0_0_8px_rgba(212,175,55,0.7)] transition-all';
  const dotInactiveClass = 'w-2.5 h-2.5 rounded-full bg-slate-600 hover:bg-slate-400 transition-all';

  return (
    <div className="flex items-start justify-center p-3 sm:p-4 md:p-8 w-full max-w-5xl mx-auto min-h-screen py-6 sm:py-10">
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

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ═══ Step 1: Prologue ═══ */}
          {step === 'prologue' && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-[#ffd700] border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase">
                <Sparkles size={14} /> 開始故事
              </h2>

              {/* aspect-video keeps the container in 16:9 so the video never clips or overflows */}
              <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video">
                <video
                  className="w-full h-full object-contain"
                  controls
                  preload="metadata"
                  poster={prologueImage}
                >
                  <source src={prologueVideo} type="video/mp4" />
                </video>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 border border-slate-800 rounded-lg p-4">
                先看完序章，再決定你的父親身份與王女培育方向。
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep('father')}
                  className="w-full max-w-sm btn-fantasy py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg mx-auto"
                >
                  <Shield size={20} /> 下一步：選擇父親身份
                </button>
              </div>
            </div>
          )}

          {/* ═══ Step 2: Father Carousel ═══ */}
          {step === 'father' && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-[#ffd700] border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase">
                <Shield size={14} /> 選擇父親的身份背景
                <span className="text-[10px] text-slate-500 normal-case ml-2 font-normal">決定初始資源與修行隱藏節點</span>
              </h2>

              {/* Full-width immersive carousel */}
              <div
                className="relative w-full overflow-hidden rounded-xl border border-slate-700/50"
                style={{ height: 'min(440px, 60vh)' }}
              >
                {/* Background scene image */}
                <img
                  key={currentFather.bgImage}
                  src={`${prefix}${encodeURIComponent(currentFather.bgImage)}`}
                  alt={currentFather.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.75 }}
                />

                {/* Gradient overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0914] via-[#0b0914]/25 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b0914]/55 via-transparent to-[#0b0914]/55" />

                {/* Left arrow */}
                <button type="button" onClick={prevFather} className={`${navArrowClass} left-3`}>
                  <ChevronLeft size={22} />
                </button>

                {/* Right arrow */}
                <button type="button" onClick={nextFather} className={`${navArrowClass} right-3`}>
                  <ChevronRight size={22} />
                </button>

                {/* Father info overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 px-14 sm:px-20 py-5 sm:py-7 text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <FatherIcon size={20} className="text-[#ffd700]" />
                    <h3
                      className="text-xl sm:text-2xl font-bold text-white tracking-wide"
                      style={{ textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}
                    >
                      {currentFather.name}
                    </h3>
                    <span className={`text-[10px] border rounded px-2 py-0.5 font-semibold ${currentFather.badgeClass}`}>
                      {currentFather.badge}
                    </span>
                  </div>
                  <p
                    className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg mx-auto mb-3"
                    style={{ textShadow: '0 1px 8px rgba(0,0,0,0.95)' }}
                  >
                    {currentFather.description}
                  </p>
                  <div
                    className="text-[#ffd700] font-bold text-base sm:text-lg"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}
                  >
                    💰 初始資金：{currentFather.gold.toLocaleString()} 金幣
                  </div>
                </div>
              </div>

              {/* Dot indicators */}
              <div className="flex justify-center items-center gap-2">
                {FATHERS.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => goToFather(i)}
                    className={i === fatherIdx ? dotActiveClass : dotInactiveClass}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="pt-1 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setStep('prologue')}
                  className="w-full sm:w-auto btn-fantasy-sec text-sm px-6 py-3"
                >
                  返回序章
                </button>
                <button
                  type="button"
                  onClick={() => setStep('daughter')}
                  className="w-full sm:w-auto btn-fantasy text-sm px-6 py-3"
                >
                  下一步：選擇女兒
                </button>
              </div>
            </div>
          )}

          {/* ═══ Step 3: Daughter Carousel + Setup ═══ */}
          {step === 'daughter' && (
            <>
              {/* Compact name + birthdate row */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-[#ffd700] border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase">
                  <User size={14} /> 基礎身份設定
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-300">女兒姓名</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value.slice(0, 10))}
                      placeholder={selectedChar === 'honghua' ? '紅花' : selectedChar === 'erica' ? '艾莉卡' : '艾蜜莉亞'}
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-[#ffd700] text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1 text-left">
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
                  <div className="space-y-1 text-left">
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

              {/* Character carousel */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-[#ffd700] border-b border-slate-800 pb-2 flex items-center gap-1.5 uppercase">
                  <Sparkles size={14} /> 選擇扮演王女 (NG+ 解鎖)
                </h2>

                {isFirstPlaythrough && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 text-amber-200 text-xs px-3 py-2">
                    首週目固定為【紅花】，完成任意結局後可自由選擇其他王女。
                  </div>
                )}

                {/* Full-width character carousel */}
                <div
                  className="relative w-full overflow-hidden rounded-xl border border-slate-700/50 bg-slate-950"
                  style={{ height: 'min(400px, 58vh)' }}
                >
                  {/* Character sprite */}
                  <img
                    key={currentChar.id}
                    src={currentChar.getSprite(prefix)}
                    alt={currentChar.name}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[88%] object-contain"
                    style={currentChar.spriteStyle}
                  />

                  {/* Top vignette */}
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950 to-transparent" />
                  {/* Bottom info gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

                  {/* Lock overlay */}
                  {isCharLocked && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-20">
                      <span className="text-sm text-red-400 font-bold flex items-center gap-2 bg-red-950/80 border border-red-900/30 px-4 py-2 rounded shadow-sm">
                        <Lock size={14} /> {currentChar.getLockText(isFirstPlaythrough)}
                      </span>
                    </div>
                  )}

                  {/* Left arrow */}
                  <button type="button" onClick={prevChar} className={`${navArrowClass} left-3`}>
                    <ChevronLeft size={22} />
                  </button>

                  {/* Right arrow */}
                  <button type="button" onClick={nextChar} className={`${navArrowClass} right-3`}>
                    <ChevronRight size={22} />
                  </button>

                  {/* Character info at bottom */}
                  <div className="absolute bottom-0 inset-x-0 px-14 sm:px-20 py-4 sm:py-5 text-center z-10">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                        {currentChar.name}
                      </h3>
                      <span className="text-[10px] text-slate-400">({currentChar.subtitle})</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${currentChar.badgeClass}`}>
                      {currentChar.badge}
                    </span>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md mx-auto">
                      {currentChar.description}
                    </p>
                  </div>
                </div>

                {/* Dot indicators */}
                <div className="flex justify-center items-center gap-2">
                  {CHARS.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => goToChar(i)}
                      className={i === charIdx ? dotActiveClass : dotInactiveClass}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setStep('father')}
                  className="w-full sm:w-auto btn-fantasy-sec text-sm px-6 py-3"
                >
                  返回父親選擇
                </button>
                <button
                  type="submit"
                  disabled={isCharLocked}
                  className={`w-full sm:w-auto btn-fantasy py-3 text-base font-bold flex items-center justify-center gap-2 shadow-lg px-6 ${isCharLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Sparkles size={20} /> 展開王女養育之旅
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {showGallery && <EndingGallery onClose={() => setShowGallery(false)} />}
      {showAchievements && <AchievementPanel onClose={() => setShowAchievements(false)} />}
    </div>
  );
};
