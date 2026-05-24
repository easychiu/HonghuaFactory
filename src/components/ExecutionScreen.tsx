import React from 'react';
import { useGame, ACTIVITIES } from '../contexts/GameContext';
import { COURSES } from '../data/courses';
import { getAvatarPath } from '../utils/avatar';
import { Calendar, Zap, FastForward, Play, Pause, ChevronRight } from 'lucide-react';
import { useScheduleLoop } from '../hooks/useScheduleLoop';
import { audioManager } from '../utils/audio';

export const ExecutionScreen: React.FC = () => {
  const { state, finishExecution } = useGame();
  const { schedule, time, daughter } = state;

  const {
    currentSlot,
    statusText,
    isAutoPlay,
    setIsAutoPlay,
    isFinished,
    floatingStats,
    handleStep,
    handleSkip,
    getPeriodLabel,
    getAnimationProps,
  } = useScheduleLoop();

  const getBackgroundImage = () => {
    if (!schedule) return null;
    const actId = schedule[currentSlot];
    const isCourse = COURSES.some(c => c.id === actId);
    if (isCourse) {
      return '07. 皇家學院教室.jpg';
    }
    if (actId === 'woodshop') {
      return '08. 胡村姑的木工作坊.jpg';
    }
    if (actId === 'guesthouse_helper') {
      return '\u200b06. 提莫的民宿.jpg';
    }
    return null;
  };

  const bgImg = getBackgroundImage();
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const bgStyle = bgImg 
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65)), url("${prefix}${bgImg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid rgba(212,175,55,0.15)'
      }
    : {
        background: 'radial-gradient(circle at center, #1b1633 0%, #080612 100%)',
        border: '1px solid rgba(212,175,55,0.1)'
      };
  const anim = getAnimationProps();

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 min-h-[85vh]">
      <div className="glass-panel w-full max-w-2xl p-4 sm:p-6 md:p-8 animate-slide-up text-center flex flex-col gap-4 sm:gap-6">
        
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
          className="w-full h-48 sm:h-64 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-500"
          style={bgStyle}
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
                    height: '110px'
                  }}
                >
                  <img 
                    src={getAvatarPath(daughter.age, daughter.outfit, daughter.avatarUrl)} 
                    alt="Daughter" 
                    className={`h-24 sm:h-32 object-contain ${anim.className}`} 
                    style={{
                      filter: daughter.characterId === 'emilia' ? 'hue-rotate(330deg) saturate(0.8) sepia(0.5)' : undefined
                    }}
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
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {schedule?.map((actId, idx) => {
            let act = ACTIVITIES.find(a => a.id === actId);
            if (!act) {
              act = COURSES.find(c => c.id === actId);
            }
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
                  onClick={() => {
                    audioManager.playSfx('sfx_click.mp3');
                    setIsAutoPlay(!isAutoPlay);
                  }}
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
                onClick={() => {
                  audioManager.playSfx('sfx_click.mp3');
                  finishExecution();
                }}
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
