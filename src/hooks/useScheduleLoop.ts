import { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { ACTIVITIES } from '../contexts/GameContext';
import { COURSES } from '../data/courses';

export interface FloatingStat {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

export const useScheduleLoop = () => {
  const { state, executeNextPeriod } = useGame();
  const { schedule, daughter } = state;

  const [currentSlot, setCurrentSlot] = useState<0 | 1 | 2>(0);
  const [statusText, setStatusText] = useState('準備開始本月日程...');
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [floatingStats, setFloatingStats] = useState<FloatingStat[]>([]);

  const timerRef = useRef<any>(null);

  const activeActivityId = schedule ? schedule[currentSlot] : '';
  
  // Find activity from activities or courses
  let activity = ACTIVITIES.find(a => a.id === activeActivityId);
  if (!activity) {
    activity = COURSES.find(c => c.id === activeActivityId);
  }

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
  }, [currentSlot, activeActivityId, activity]);

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
  }, [isAutoPlay, currentSlot, isFinished, activity]);

  // Spawn floating stat indicator texts
  const spawnFloatingStats = (changes: Record<string, number>) => {
    const list: FloatingStat[] = [];
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
      else if (key === 'elegance') { label = '禮儀'; color = '#ffb703'; }
      else if (key === 'art') { label = '氣質'; color = '#a855f7'; }

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

  const getPeriodLabel = (slot: number) => {
    if (slot === 0) return '上旬';
    if (slot === 1) return '中旬';
    return '下旬';
  };

  const getAnimationProps = () => {
    if (!activity) return { emote: '🌸', className: 'bounce-char' };
    
    if (activity.type === 'work') {
      if (activity.id === 'farm') return { emote: '🧑‍🌾🌾', className: 'bounce-char' };
      if (activity.id === 'church_clean') return { emote: '⛪🙏', className: 'bounce-char' };
      if (activity.id === 'maid_mansion') return { emote: '🧹🧹', className: 'bounce-char' };
      if (activity.id === 'graveyard_guard') return { emote: '🪦🕯️', className: 'bounce-char' };
      if (activity.id === 'woodshop') return { emote: '🪚🛠️', className: 'bounce-char' };
      if (activity.id === 'government_office') return { emote: '📄🏛️', className: 'bounce-char' };
      if (activity.id === 'street_performance') return { emote: '🎵🎸', className: 'bounce-char' };
      return { emote: '🛠️', className: 'bounce-char' };
    } else if (activity.type === 'study') {
      if (activity.id === 'swordplay') return { emote: '⚔️🥋', className: 'bounce-char' };
      if (activity.id === 'combat_training') return { emote: '🥊💪', className: 'bounce-char' };
      if (activity.id === 'tactics') return { emote: '🗺️🧠', className: 'read-char' };
      if (activity.id === 'rhetoric') return { emote: '📖⚖️', className: 'read-char' };
      if (activity.id === 'history') return { emote: '📚👑', className: 'read-char' };
      if (activity.id === 'science_class') return { emote: '🧪🧬', className: 'read-char' };
      if (activity.id === 'etiquette') return { emote: '👗👑', className: 'read-char' };
      if (activity.id === 'music_poetry') return { emote: '✍️🎻', className: 'read-char' };
      if (activity.id === 'theology_art') return { emote: '🎨⛪', className: 'read-char' };
      return { emote: '📖', className: 'read-char' };
    } else {
      // rest
      if (activity.id === 'rest_vacation') return { emote: '♨️🏕️', className: 'sleep-char' };
      return { emote: '💤🛏️', className: 'sleep-char' };
    }
  };

  return {
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
    activity
  };
};
