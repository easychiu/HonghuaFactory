import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { ACTIVITIES } from '../data/gameData';
import { getAvatarPath } from '../utils/avatar';
import { Calendar, Zap, FastForward, Play, Pause, ChevronRight } from 'lucide-react';

export const ExecutionScreen: React.FC = () => {
  const { state, executeNextPeriod, finishExecution } = useGame();
  const { schedule, time, daughter } = state;

  // Track simulation state
  const [currentSlot, setCurrentSlot] = useState<0 | 1 | 2>(0);
  const [statusText, setStatusText] = useState('準備開始本月日程...');
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  
  // Floating notifications of stat increases
  const [floatingStats, setFloatingStats] = useState<{ id: string; text: string; color: string; x: number; y: number }[]>([]);

  // Simulation timer ref
  const timerRef = useRef<any>(null);

  const activeActivityId = schedule ? schedule[currentSlot] : '';
  const activity = ACTIVITIES.find(a => a.id === activeActivityId);

  // Set description text depending on activity progress
  useEffect(() => {
    if (!activity) return;
    
    if (currentSlot === 0) {
      setStatusText(`【上旬】女兒前往「${activity.name}」進行活動。`);
    } else if (currentSlot === 1) {
      setStatusText(`【中旬】女兒正在認真地進行「${activity.name}」中。`);
    } else if (currentSlot === 2) {
      setStatusText(`【下旬】進入月底，「${activity.name}」日程進入收尾階段。`);
    }
  }, [currentSlot, activeActivityId]);

  // Handle Autoplay timer
  useEffect(() => {
    if (isAutoPlay && !isFinished) {
      timerRef.current = setInterval(() => {
        handleStep();
      }, 2000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlay, currentSlot, isFinished]);

  // Spawn floating stat indicator texts
  const spawnFloatingStats = (changes: Record<string, number>) => {
    const list: typeof floatingStats = [];
    let delayY = 0;
    
    Object.entries(changes).forEach(([key, val]) => {
      if (val === 0) return;
      let label = '';
      let color = '#fff';
      
      if (key === 'stamina') { label = '體力'; color = 'var(--color-stamina)'; }
      else if (key === 'strength') { label = '力量'; color = 'var(--color-strength)'; }
      else if (key === 'intelligence') { label = '智力'; color = 'var(--color-intelligence)'; }
      else if (key === 'charisma') { label = '魅力'; color = 'var(--color-charisma)'; }
      else if (key === 'morality') { label = '道德'; color = 'var(--color-morality)'; }
      else if (key === 'piety') { label = '信仰'; color = 'var(--color-piety)'; }
      else if (key === 'sensitivity') { label = '感受'; color = 'var(--color-sensitivity)'; }
      else if (key === 'stress') { label = '疲勞'; color = 'var(--color-stress)'; }
      else if (key === 'combatSkill') { label = '戰術'; color = 'var(--color-combat)'; }
      else if (key === 'magicSkill') { label = '魔法'; color = 'var(--color-magic)'; }
      else if (key === 'reputation') { label = '名望'; color = 'var(--color-reputation)'; }

      const sign = val > 0 ? '+' : '';
      list.push({
        id: Math.random().toString(),
        text: `${label} ${sign}${val}`,
        color,
        x: 40 + Math.random() * 20, // offset positions slightly
        y: 35 + delayY
      });
      delayY += 8; // stack vertically
    });

    setFloatingStats(list);
    
    // Clear them after animation completes
    setTimeout(() => {
      setFloatingStats([]);
    }, 1200);
  };

  const handleStep = () => {
    if (!activity) return;

    // Trigger stat updates in context
    const monthDone = executeNextPeriod();
    
    // Spawn floaters
    if (activity.cost <= daughter.gold) {
      spawnFloatingStats(activity.statChanges);
    } else {
      // Fallback Rest Home
      const fallbackRest = ACTIVITIES.find(a => a.id === 'rest_home')!;
      spawnFloatingStats(fallbackRest.statChanges);
    }

    if (monthDone) {
      setIsFinished(true);
      setIsAutoPlay(false);
      setStatusText('本月所有日程已執行完畢！女兒回到了家中。');
    } else {
      setCurrentSlot(prev => (prev + 1) as 0 | 1 | 2);
    }
  };

  const handleSkip = () => {
    setIsAutoPlay(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Call executeNextPeriod for remaining slots
    let done = false;
    while (!done) {
      done = executeNextPeriod();
    }
    
    setIsFinished(true);
    setStatusText('已快速跳過本月排程動畫！女兒順利完成了所有日程。');
  };

  // Get current Period label
  const getPeriodLabel = (slot: number) => {
    if (slot === 0) return '上旬';
    if (slot === 1) return '中旬';
    return '下旬';
  };

  // Animation character CSS classes & avatar based on activity type
  const getAnimationProps = () => {
    if (!activity) return { emote: '🌸', className: 'bounce-char' };
    
    if (activity.type === 'work') {
      if (activity.id === 'farm') return { emote: '🧑‍🌾🌾', className: 'bounce-char' };
      if (activity.id === 'church') return { emote: '⛪🙏', className: 'bounce-char' };
      if (activity.id === 'maid') return { emote: '🧹🧹', className: 'bounce-char' };
      if (activity.id === 'graveyard') return { emote: '🪦🕯️', className: 'bounce-char' };
      return { emote: '🛠️', className: 'bounce-char' };
    } else if (activity.type === 'study') {
      if (activity.id === 'martial_arts') return { emote: '⚔️🥋', className: 'bounce-char' };
      if (activity.id === 'magic_class') return { emote: '🔮💫', className: 'read-char' };
      if (activity.id === 'science') return { emote: '📚🧬', className: 'read-char' };
      if (activity.id === 'theology') return { emote: '📖⛪', className: 'read-char' };
      if (activity.id === 'poetry') return { emote: '✍️📜', className: 'read-char' };
      return { emote: '📖', className: 'read-char' };
    } else {
      // rest
      if (activity.id === 'rest_vacation') return { emote: '♨️🏕️', className: 'sleep-char' };
      return { emote: '💤🛏️', className: 'sleep-char' };
    }
  };

  const anim = getAnimationProps();

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-6 min-h-[85vh]">
      <div className="glass-panel w-full max-w-2xl p-6 md:p-8 animate-slide-up text-center flex flex-col gap-6">
        
        {/* Date Timeline */}
        <div className="flex items-center justify-between border-b border-[rgba(212,175,55,0.2)] pb-4">
          <span className="flex items-center gap-1.5 text-sm text-[#ffd700] font-bold">
            <Calendar size={18} /> 第 {time.year} 年 {time.month} 月 - 日程執行中
          </span>
          <span className="px-3 py-1 bg-[rgba(255,255,255,0.04)] border border-slate-700 rounded-lg text-xs font-semibold">
            當前階段：{getPeriodLabel(currentSlot)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-[#d4af37] transition-all duration-300"
            style={{ width: isFinished ? '100%' : `${(currentSlot + 1) * 33.3}%` }}
          />
        </div>

        {/* Animation Chamber */}
        <div 
          className="w-full h-64 rounded-xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: 'radial-gradient(circle at center, #1b1633 0%, #080612 100%)',
            border: '1px solid rgba(212,175,55,0.1)'
          }}
        >
          {/* Decorative fantasy rings background */}
          <div className="absolute w-48 h-48 rounded-full border border-[rgba(212,175,55,0.03)] border-dashed animate-spin duration-10000" />
          
          {/* Animated Sprite */}
          <div className="flex flex-col items-center justify-center z-10 relative">
            {/* Emotes */}
            <div className="text-4xl mb-4 float-animation">{anim.emote}</div>
            
            {/* Sprite character image (re-use same png with animations) */}
            {(() => {
              const scaleFactor = 
                daughter.age <= 11 ? 0.82 :
                daughter.age <= 13 ? 0.88 :
                daughter.age <= 15 ? 0.94 : 1.0;
              return (
                <div
                  style={{
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: 'bottom center',
                    transition: 'transform 0.5s ease-in-out',
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'center',
                    height: '140px'
                  }}
                >
                  <img 
                    src={getAvatarPath(daughter.age, daughter.outfit, daughter.avatarUrl)} 
                    alt="Daughter" 
                    className={`h-32 object-contain ${anim.className}`} 
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Floating stat modifications overlay */}
          {floatingStats.map(stat => (
            <span 
              key={stat.id} 
              className="floating-stat"
              style={{
                color: stat.color,
                left: `${stat.x}%`,
                top: `${stat.y}%`
              }}
            >
              {stat.text}
            </span>
          ))}

          {/* Bottom ticker banner */}
          <div className="absolute bottom-0 left-0 w-full bg-black/60 border-t border-slate-900 py-2.5 px-4 text-xs font-semibold text-center text-[#f3e5ab]">
            {statusText}
          </div>
        </div>

        {/* Activity Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          {schedule?.map((actId, idx) => {
            const act = ACTIVITIES.find(a => a.id === actId);
            const isActive = idx === currentSlot && !isFinished;
            return (
              <div 
                key={idx}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isActive 
                    ? 'bg-[rgba(212,175,55,0.1)] border-[#d4af37]' 
                    : idx < currentSlot || isFinished
                    ? 'bg-[rgba(0,0,0,0.2)] border-slate-900 opacity-50'
                    : 'bg-[rgba(255,255,255,0.01)] border-slate-900'
                }`}
              >
                <div className="text-[10px] text-slate-400 mb-1">{getPeriodLabel(idx)}</div>
                <div className="text-xs font-bold text-white truncate">{act?.name}</div>
              </div>
            );
          })}
        </div>

        {/* Ticker Action Controls */}
        <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-2">
          <div className="flex items-center gap-2">
            {!isFinished && (
              <>
                <button 
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className="btn-fantasy-sec text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  {isAutoPlay ? <Pause size={14} /> : <Play size={14} />}
                  {isAutoPlay ? '暫停自動' : '自動播放'}
                </button>

                <button 
                  onClick={handleStep}
                  disabled={isAutoPlay}
                  className="btn-fantasy-sec text-xs py-2 px-3 flex items-center gap-1.5 hover:border-[#d4af37]"
                >
                  <ChevronRight size={14} />
                  手動單步
                </button>
              </>
            )}
          </div>
          
          <div>
            {!isFinished ? (
              <button 
                onClick={handleSkip}
                className="btn-fantasy-sec text-xs py-2 px-3 flex items-center gap-1.5 hover:text-red-400 hover:border-red-500/40"
              >
                <FastForward size={14} />
                跳過動畫
              </button>
            ) : (
              <button 
                onClick={finishExecution}
                className="btn-fantasy text-xs py-2 px-5 flex items-center gap-1.5"
              >
                <Zap size={14} />
                完成回到首頁
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
