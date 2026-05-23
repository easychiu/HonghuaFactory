import React, { useState } from 'react';
import { useGame, ACTIVITIES } from '../contexts/GameContext';
import { COURSES } from '../data/courses';
import type { Activity } from '../types';
import { Calendar, AlertCircle, Coins, BookOpen, Smile, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export const Scheduler: React.FC = () => {
  const { state, setSchedule, startScheduleExecution, setScreen } = useGame();
  const { daughter } = state;

  // Filter activities: only show street_performance if the father is a bard
  const availableActivities = ACTIVITIES.filter(act => {
    if (act.id === 'street_performance') {
      return daughter.fatherBackground === 'bard';
    }
    return true;
  });

  const allList = [...availableActivities, ...COURSES];

  // Selected activities for [early, mid, late]
  const [selected, setSelected] = useState<[string, string, string]>([
    allList.find(a => a.type === 'work')?.id || 'farm',
    COURSES[0].id,
    allList.find(a => a.id === 'rest_home')?.id || 'rest_home'
  ]);

  // Which period we are currently choosing for (0: early, 1: mid, 2: late)
  const [activeSlot, setActiveSlot] = useState<0 | 1 | 2>(0);

  // Which category accordion is open (null = all collapsed)
  const [openCategory, setOpenCategory] = useState<'work' | 'study' | 'rest' | null>(null);

  const toggleCategory = (cat: 'work' | 'study' | 'rest') => {
    setOpenCategory(prev => (prev === cat ? null : cat));
  };

  const handleSelectActivity = (activityId: string) => {
    setSelected(prev => {
      const copy = [...prev] as [string, string, string];
      copy[activeSlot] = activityId;
      return copy;
    });
    // Auto advance slot to make selection fluid
    if (activeSlot < 2) {
      setActiveSlot((activeSlot + 1) as 0 | 1 | 2);
    }
  };

  const handleConfirm = () => {
    setSchedule(selected[0], selected[1], selected[2]);
    startScheduleExecution();
  };

  // Calculate total Gold cost vs reward for the month
  const totalCost = selected.reduce((sum, id) => {
    const act = allList.find(a => a.id === id);
    if (!act) return sum;
    let cost = act.cost;
    // Scholar discount on humanities courses
    if (daughter.fatherBackground === 'scholar' && act.type === 'study') {
      const isHumanities = ['rhetoric', 'history', 'music_poetry', 'theology_art', 'etiquette'].includes(act.id);
      if (isHumanities) {
        cost = Math.round(cost * 0.8);
      }
    }
    return sum + cost;
  }, 0);

  const totalReward = selected.reduce((sum, id) => {
    const act = allList.find(a => a.id === id);
    if (!act) return sum;
    let reward = act.reward;
    // Merchant bonus on work
    if (daughter.fatherBackground === 'merchant' && act.type === 'work') {
      reward = Math.round(reward * 1.2);
    }
    // Lute performance base reward is 35, plus art bonus (calculated in context)
    // Here we give a preview of the performance reward
    if (act.id === 'street_performance') {
      reward += Math.round(daughter.attributes.art * 0.15);
    }
    return sum + reward;
  }, 0);

  const netGold = totalReward - totalCost;

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 w-full max-w-5xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar size={22} className="text-[#ffd700]" /> 制定本月日程
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            為女兒規劃上旬、中旬及下旬的活動，以培育不同的心智與體魄。
          </p>
        </div>
        <button 
          onClick={() => setScreen('main')} 
          className="btn-fantasy-sec text-xs"
        >
          返回起居室
        </button>
      </div>

      {/* Grid: Slots + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Slot Selection Panel (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Timeline Slots */}
          <div className="glass-panel p-6 grid grid-cols-3 gap-4 text-center">
            {/* Early Slot */}
            <div 
              onClick={() => setActiveSlot(0)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeSlot === 0 
                  ? 'bg-[rgba(212,175,55,0.1)] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                  : 'bg-[rgba(255,255,255,0.02)] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider mb-1">上旬</div>
              <div className="text-sm font-bold text-white truncate">
                {allList.find(a => a.id === selected[0])?.name || '未選擇'}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 truncate">
                {allList.find(a => a.id === selected[0])?.type === 'work' ? '打工' : 
                 allList.find(a => a.id === selected[0])?.type === 'study' ? '學習' : '休息'}
              </div>
            </div>

            {/* Mid Slot */}
            <div 
              onClick={() => setActiveSlot(1)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeSlot === 1 
                  ? 'bg-[rgba(212,175,55,0.1)] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                  : 'bg-[rgba(255,255,255,0.02)] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider mb-1">中旬</div>
              <div className="text-sm font-bold text-white truncate">
                {allList.find(a => a.id === selected[1])?.name || '未選擇'}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 truncate">
                {allList.find(a => a.id === selected[1])?.type === 'work' ? '打工' : 
                 allList.find(a => a.id === selected[1])?.type === 'study' ? '學習' : '休息'}
              </div>
            </div>

            {/* Late Slot */}
            <div 
              onClick={() => setActiveSlot(2)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeSlot === 2 
                  ? 'bg-[rgba(212,175,55,0.1)] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                  : 'bg-[rgba(255,255,255,0.02)] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider mb-1">下旬</div>
              <div className="text-sm font-bold text-white truncate">
                {allList.find(a => a.id === selected[2])?.name || '未選擇'}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 truncate">
                {allList.find(a => a.id === selected[2])?.type === 'work' ? '打工' : 
                 allList.find(a => a.id === selected[2])?.type === 'study' ? '學習' : '休息'}
              </div>
            </div>
          </div>

          {/* Activity Category Accordion */}
          <div className="glass-panel overflow-hidden flex flex-col">
            {/* Jobs Group */}
            <div className="border-b border-slate-800/60">
              <button
                onClick={() => toggleCategory('work')}
                className="w-full flex items-center justify-between p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors text-left"
              >
                <span className="text-sm font-bold text-[#d4af37] flex items-center gap-1.5 uppercase tracking-wider">
                  <Coins size={14} /> Part-time Jobs / 打工賺錢
                </span>
                {openCategory === 'work' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {openCategory === 'work' && (
                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableActivities.filter(a => a.type === 'work').map(act => (
                    <ActivityCard 
                      key={act.id} 
                      act={act} 
                      onSelect={handleSelectActivity}
                      active={selected[activeSlot] === act.id}
                      fatherBackground={daughter.fatherBackground}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Studies Group */}
            <div className="border-b border-slate-800/60">
              <button
                onClick={() => toggleCategory('study')}
                className="w-full flex items-center justify-between p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors text-left"
              >
                <span className="text-sm font-bold text-[#d4af37] flex items-center gap-1.5 uppercase tracking-wider">
                  <BookOpen size={14} /> Study Classes / 學習課程
                </span>
                {openCategory === 'study' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {openCategory === 'study' && (
                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COURSES.map(act => (
                    <ActivityCard 
                      key={act.id} 
                      act={act} 
                      onSelect={handleSelectActivity}
                      active={selected[activeSlot] === act.id}
                      fatherBackground={daughter.fatherBackground}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Rest Group */}
            <div>
              <button
                onClick={() => toggleCategory('rest')}
                className="w-full flex items-center justify-between p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors text-left"
              >
                <span className="text-sm font-bold text-[#d4af37] flex items-center gap-1.5 uppercase tracking-wider">
                  <Smile size={14} /> Leisure Rest / 休息度假
                </span>
                {openCategory === 'rest' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {openCategory === 'rest' && (
                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableActivities.filter(a => a.type === 'rest').map(act => (
                    <ActivityCard 
                      key={act.id} 
                      act={act} 
                      onSelect={handleSelectActivity}
                      active={selected[activeSlot] === act.id}
                      fatherBackground={daughter.fatherBackground}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Financial & Confirmation Panel (lg:col-span-1) */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold border-b border-[rgba(212,175,55,0.2)] pb-2 text-[#ffd700]">本月預算清算</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">目前持有金幣</span>
                <span className="font-bold text-[#ffd700]">{daughter.gold} G</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">預計總花費</span>
                <span className="font-bold text-red-400">-{totalCost} G</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">預計總收入</span>
                <span className="font-bold text-emerald-400">+{totalReward} G</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-base">
                <span>收支淨值</span>
                <span className={netGold >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {netGold >= 0 ? `+${netGold}` : netGold} G
                </span>
              </div>
            </div>

            {daughter.gold < totalCost && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="shrink-0 text-red-400" size={16} />
                <span>
                  警告：金幣不足！如果執行到需要繳費的課程時金幣不夠，該日程會自動取消，並改為「在家休息」。
                </span>
              </div>
            )}
            
            <button 
              onClick={handleConfirm}
              className="btn-fantasy w-full py-4 text-base mt-2 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} /> 開始執行日程
            </button>
          </div>
          
          {/* Quick Daughter Status info */}
          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold border-b border-[rgba(212,175,55,0.15)] pb-2 mb-3">當前狀態提醒</h3>
            <div className="space-y-2 text-xs leading-normal">
              <div className="flex justify-between">
                <span className="text-slate-400">體力限制：</span>
                <span className="font-bold text-slate-200">{daughter.attributes.stamina}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">當前疲勞值：</span>
                <span className={`font-bold ${daughter.attributes.stress > daughter.attributes.stamina ? 'text-red-400' : 'text-slate-200'}`}>
                  {daughter.attributes.stress}
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                ※ 提示：如果疲勞值（Stress）超過了體力（Stamina），女兒下個月有機率生病住院，將額外扣除 60 G 醫療費且減少體力！請適度安排休息。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActivityCardProps {
  act: Activity;
  onSelect: (id: string) => void;
  active: boolean;
  fatherBackground: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ act, onSelect, active, fatherBackground }) => {
  let cost = act.cost;
  // Apply Scholar discount on humanities courses in budget display
  if (fatherBackground === 'scholar' && act.type === 'study') {
    const isHumanities = ['rhetoric', 'history', 'music_poetry', 'theology_art', 'etiquette'].includes(act.id);
    if (isHumanities) {
      cost = Math.round(cost * 0.8);
    }
  }

  let reward = act.reward;
  // Apply Merchant bonus on work in budget display
  if (fatherBackground === 'merchant' && act.type === 'work') {
    reward = Math.round(reward * 1.2);
  }

  return (
    <div 
      onClick={() => onSelect(act.id)}
      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
        active 
          ? 'bg-[rgba(212,175,55,0.06)] border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.08)]' 
          : 'bg-[rgba(255,255,255,0.01)] border-slate-800/80 hover:border-slate-700 hover:bg-[rgba(255,255,255,0.03)]'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className={`text-sm font-bold ${active ? 'text-[#ffd700]' : 'text-slate-200'}`}>
            {act.name}
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-normal">
            {act.description}
          </p>
        </div>
        <div className="shrink-0 text-right text-xs">
          {cost > 0 && <span className="text-red-400 font-bold">-{cost} G</span>}
          {reward > 0 && <span className="text-emerald-400 font-bold">+{reward} G</span>}
          {cost === 0 && reward === 0 && <span className="text-slate-400">免費</span>}
        </div>
      </div>
      <div className="text-[10px] text-slate-400 border-t border-slate-900/60 pt-2 mt-2 leading-relaxed">
        {act.effectDescription}
      </div>
    </div>
  );
};
