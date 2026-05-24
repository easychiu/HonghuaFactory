import React, { useState } from 'react';
import { useGame, ACTIVITIES } from '../contexts/GameContext';
import { COURSES } from '../data/courses';
import type { Activity } from '../types';
import { Calendar, AlertCircle, Coins, BookOpen, Smile, Sparkles } from 'lucide-react';

export const Scheduler: React.FC = () => {
  const { state, setSchedule, startScheduleExecution, setScreen } = useGame();
  const { daughter } = state;
  const slotLabels = ['上旬', '中旬', '下旬'] as const;

  const availableActivities = ACTIVITIES.filter(act => {
    if (act.id === 'street_performance') {
      return daughter.fatherBackground === 'bard';
    }
    return true;
  });

  const allList = [...availableActivities, ...COURSES];

  const [selected, setSelected] = useState<[string, string, string]>(['', '', '']);
  const [activeSlot, setActiveSlot] = useState<0 | 1 | 2>(0);
  const [selectedTypeBySlot, setSelectedTypeBySlot] = useState<[
    Activity['type'] | null,
    Activity['type'] | null,
    Activity['type'] | null
  ]>([null, null, null]);

  const resolveActivity = (id: string) => allList.find(a => a.id === id);
  const getActivityType = (id: string): Activity['type'] | null => resolveActivity(id)?.type ?? null;

  const handleSelectType = (activityType: Activity['type']) => {
    setSelectedTypeBySlot(prev => {
      const copy = [...prev] as [Activity['type'] | null, Activity['type'] | null, Activity['type'] | null];
      copy[activeSlot] = activityType;
      return copy;
    });

    setSelected(prev => {
      const copy = [...prev] as [string, string, string];
      const currentType = getActivityType(copy[activeSlot]);
      if (currentType !== activityType) {
        copy[activeSlot] = '';
      }
      return copy;
    });
  };

  const handleSelectActivity = (activityId: string) => {
    setSelected(prev => {
      const copy = [...prev] as [string, string, string];
      copy[activeSlot] = activityId;
      return copy;
    });

    if (activeSlot < 2) {
      setActiveSlot((activeSlot + 1) as 0 | 1 | 2);
    }
  };

  const handleCopyPreviousSlot = () => {
    if (activeSlot === 0) return;

    const previousActivityId = selected[activeSlot - 1];
    if (!previousActivityId) return;

    const previousType = selectedTypeBySlot[activeSlot - 1] ?? getActivityType(previousActivityId);

    setSelected(prev => {
      const copy = [...prev] as [string, string, string];
      copy[activeSlot] = previousActivityId;
      return copy;
    });

    setSelectedTypeBySlot(prev => {
      const copy = [...prev] as [Activity['type'] | null, Activity['type'] | null, Activity['type'] | null];
      copy[activeSlot] = previousType;
      return copy;
    });

    if (activeSlot < 2) {
      setActiveSlot((activeSlot + 1) as 0 | 1 | 2);
    }
  };

  const isScheduleComplete = selected.every(id => id !== '');

  const handleConfirm = () => {
    if (!isScheduleComplete) return;
    setSchedule(selected[0], selected[1], selected[2]);
    startScheduleExecution();
  };

  const totalCost = selected.reduce((sum, id) => {
    const act = allList.find(a => a.id === id);
    if (!act) return sum;
    let cost = act.cost;
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
    if (daughter.fatherBackground === 'merchant' && act.type === 'work') {
      reward = Math.round(reward * 1.2);
    }
    if (act.id === 'street_performance') {
      reward += Math.round(daughter.attributes.art * 0.15);
    }
    return sum + reward;
  }, 0);

  const netGold = totalReward - totalCost;
  const activeType = selectedTypeBySlot[activeSlot];
  const canCopyPreviousSlot = activeSlot > 0 && selected[activeSlot - 1] !== '';
  const staminaPercent = Math.max(0, Math.min(100, (daughter.attributes.stamina / 999) * 100));
  const stressPercentByStamina = daughter.attributes.stamina > 0
    ? Math.max(0, Math.min(100, (daughter.attributes.stress / daughter.attributes.stamina) * 100))
    : 0;
  const visibleActivities = activeType
    ? activeType === 'study'
      ? COURSES
      : availableActivities.filter(a => a.type === activeType)
    : [];

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 w-full max-w-5xl mx-auto animate-slide-up">
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar size={22} className="text-[#ffd700]" /> 制定本月日程
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            先選上旬/中旬/下旬，再選類型，最後選課程、打工或休息內容。
          </p>
        </div>
        <button
          onClick={() => setScreen('main')}
          className="btn-fantasy-sec text-xs"
        >
          返回起居室
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 grid grid-cols-3 gap-4 text-center">
            {slotLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveSlot(index as 0 | 1 | 2)}
                aria-pressed={activeSlot === index}
                className={`schedule-slot-button ${activeSlot === index ? 'is-active' : ''}`}
              >
                <div className="schedule-slot-label">{label}</div>
                <div className="schedule-slot-title">
                  {resolveActivity(selected[index])?.name || '未選擇'}
                </div>
                <div className="schedule-slot-meta">
                  {selectedTypeBySlot[index] === 'work' ? '打工' : selectedTypeBySlot[index] === 'study' ? '學習' : selectedTypeBySlot[index] === 'rest' ? '休息' : '尚未設定'}
                </div>
              </button>
            ))}
          </div>

          <div className="glass-panel overflow-hidden flex flex-col p-4 gap-4">
            <div className="text-xs text-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  目前設定：
                  <span className="text-[#ffd700] font-bold ml-1">
                    {activeSlot === 0 ? '上旬' : activeSlot === 1 ? '中旬' : '下旬'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPreviousSlot}
                  disabled={!canCopyPreviousSlot}
                  title="把目前旬別設成與前一旬相同"
                  className={`px-3 py-1.5 rounded-md border text-[11px] transition-all ${
                    canCopyPreviousSlot
                      ? 'border-slate-600 bg-slate-900/80 text-slate-100 hover:border-[#d4af37] hover:text-[#ffd700]'
                      : 'border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  同上周
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleSelectType('work')}
                className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${
                  activeType === 'work'
                    ? 'bg-[rgba(212,175,55,0.08)] border-[#d4af37] text-[#ffd700] shadow-[0_0_0_1px_rgba(212,175,55,0.25)]'
                    : 'bg-[rgba(255,255,255,0.02)] border-slate-700 hover:border-slate-500 text-slate-300'
                }`}
              >
                <span className="font-bold flex items-center gap-1.5"><Coins size={14} /> 打工</span>
              </button>
              <button
                onClick={() => handleSelectType('study')}
                className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${
                  activeType === 'study'
                    ? 'bg-[rgba(212,175,55,0.08)] border-[#d4af37] text-[#ffd700] shadow-[0_0_0_1px_rgba(212,175,55,0.25)]'
                    : 'bg-[rgba(255,255,255,0.02)] border-slate-700 hover:border-slate-500 text-slate-300'
                }`}
              >
                <span className="font-bold flex items-center gap-1.5"><BookOpen size={14} /> 學習</span>
              </button>
              <button
                onClick={() => handleSelectType('rest')}
                className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${
                  activeType === 'rest'
                    ? 'bg-[rgba(212,175,55,0.08)] border-[#d4af37] text-[#ffd700] shadow-[0_0_0_1px_rgba(212,175,55,0.25)]'
                    : 'bg-[rgba(255,255,255,0.02)] border-slate-700 hover:border-slate-500 text-slate-300'
                }`}
              >
                <span className="font-bold flex items-center gap-1.5"><Smile size={14} /> 休息</span>
              </button>
            </div>

            {activeType ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleActivities.map((act, index) => (
                  <ActivityCard
                    key={act.id}
                    act={act}
                    index={index + 1}
                    onSelect={handleSelectActivity}
                    active={selected[activeSlot] === act.id}
                    fatherBackground={daughter.fatherBackground}
                  />
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 text-xs text-slate-400">
                請先為目前旬別選擇類型，才會顯示對應的課程、打工或休息內容。
              </div>
            )}
          </div>
        </div>

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
              disabled={!isScheduleComplete}
              className={`btn-fantasy w-full py-4 text-base mt-2 flex items-center justify-center gap-2 ${
                !isScheduleComplete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Sparkles size={18} /> 開始執行日程
            </button>
            {!isScheduleComplete && (
              <div className="text-[11px] text-amber-300">請先完成上旬、中旬、下旬三個時段的類型與內容選擇。</div>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold border-b border-[rgba(212,175,55,0.15)] pb-2 mb-3">當前狀態提醒</h3>
            <div className="space-y-2 text-xs leading-normal">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">體力：</span>
                  <span className="font-bold text-slate-200">{daughter.attributes.stamina}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/40 p-[1px]">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-500 ease-out"
                    style={{ width: `${staminaPercent}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">疲勞度：</span>
                  <span className={`font-bold ${daughter.attributes.stress > daughter.attributes.stamina ? 'text-red-400' : 'text-slate-200'}`}>
                    {daughter.attributes.stress} / {daughter.attributes.stamina}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900/80 rounded-full overflow-hidden border border-slate-800/40 p-[1px]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${daughter.attributes.stress > daughter.attributes.stamina ? 'bg-red-500' : 'bg-slate-400'}`}
                    style={{ width: `${stressPercentByStamina}%` }}
                  />
                </div>
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
  index: number;
  onSelect: (id: string) => void;
  active: boolean;
  fatherBackground: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ act, index, onSelect, active, fatherBackground }) => {
  let cost = act.cost;
  if (fatherBackground === 'scholar' && act.type === 'study') {
    const isHumanities = ['rhetoric', 'history', 'music_poetry', 'theology_art', 'etiquette'].includes(act.id);
    if (isHumanities) {
      cost = Math.round(cost * 0.8);
    }
  }

  let reward = act.reward;
  if (fatherBackground === 'merchant' && act.type === 'work') {
    reward = Math.round(reward * 1.2);
  }

  return (
    <div
      onClick={() => onSelect(act.id)}
      className={`p-3.5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between min-h-[150px] ${
        active
          ? 'bg-[rgba(212,175,55,0.08)] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.18)]'
          : 'bg-[rgba(255,255,255,0.02)] border-slate-700/90 hover:border-slate-500 hover:bg-[rgba(255,255,255,0.04)]'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="mb-1.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
              active
                ? 'text-[#ffe58a] border-[#d4af37]/50 bg-[#d4af37]/15'
                : 'text-slate-300 border-slate-600/70 bg-slate-900/50'
            }`}>
              {act.type === 'work' ? '打工' : act.type === 'study' ? '學習' : '休息'} #{index}
            </span>
          </div>
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
