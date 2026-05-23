import type { Daughter } from '../types';

export type PersonalityType = '元氣女漢子' | '高冷學霸' | '溫柔乖乖女' | '多愁善感藝術家';

/**
 * 根據女兒的屬性比例判定當前性格傾向。
 * - 元氣女漢子：力量/體力/戰技為主
 * - 高冷學霸：智力/名望為主
 * - 溫柔乖乖女：道德/信仰/禮儀為主
 * - 多愁善感藝術家：感受/氣質/魅力為主
 */
export const getPersonalityType = (daughter: Daughter): PersonalityType => {
  const { strength, stamina, intelligence, charisma, morality, piety, sensitivity, combatSkill, reputation, elegance, art } = daughter.attributes;

  const scores: Record<PersonalityType, number> = {
    '元氣女漢子': strength + stamina + combatSkill,
    '高冷學霸': intelligence * 1.3 + reputation,
    '溫柔乖乖女': morality + piety + elegance,
    '多愁善感藝術家': sensitivity + art + charisma * 0.6,
  };

  let best: PersonalityType = '元氣女漢子';
  let bestScore = -Infinity;
  for (const [type, score] of Object.entries(scores) as [PersonalityType, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = type;
    }
  }
  return best;
};

export const PERSONALITY_INFO: Record<PersonalityType, { emoji: string; color: string; desc: string }> = {
  '元氣女漢子': {
    emoji: '💪',
    color: '#f97316',
    desc: '開朗直率、精力充沛，戰鬥與體力領域表現出色。',
  },
  '高冷學霸': {
    emoji: '📚',
    color: '#818cf8',
    desc: '冷靜理智、思維縝密，在學術與謀略上發揮驚人才能。',
  },
  '溫柔乖乖女': {
    emoji: '🌸',
    color: '#f9a8d4',
    desc: '善良溫順、道德高尚，深受周遭之人的喜愛與信賴。',
  },
  '多愁善感藝術家': {
    emoji: '🎭',
    color: '#a78bfa',
    desc: '感性豐富、充滿藝術氣息，對美與情感有獨特的感知力。',
  },
};

/** 根據性格傾向與對話類型，回傳個性化的對話文字。 */
export const getPersonalityDialogue = (
  personality: PersonalityType,
  type: 'gentle' | 'scold' | 'praise' | 'headpat' | 'allowance',
  daughterName: string
): string => {
  const dialogues: Record<PersonalityType, Record<string, string>> = {
    '元氣女漢子': {
      gentle: `${daughterName} 豪爽地笑了笑：「老爸，你太囉嗦了！不過……謝謝啦！」她用力抱了你一下，壓力瞬間消散。`,
      scold: `${daughterName} 大聲頂嘴：「我知道了啦！」但看著老爸嚴肅的表情，她還是低下頭，悶悶地認了錯。`,
      praise: `${daughterName} 一臉得意地展示自己的訓練成果：「當然！我就知道我最厲害！」`,
      headpat: `${daughterName} 假裝不在意地別開頭：「幹嘛啦！」但耳根悄悄紅了，嘴角忍不住翹起。`,
      allowance: `${daughterName} 眼睛一亮，把零用錢握得牢牢的：「太好了！我要去買最帥的劍！」`,
    },
    '高冷學霸': {
      gentle: `${daughterName} 抬起眼皮淡淡道：「……嗯。」然後若無其事地翻書，但緊繃的肩膀悄悄鬆開了。`,
      scold: `${daughterName} 面無表情地聽完訓誡，之後認真地說：「我會記在心裡的。」說完便回頭繼續讀書。`,
      praise: `${daughterName} 微微點頭：「這只是理所當然的結果。」面龐雖冷，眼底卻有一絲得意。`,
      headpat: `${daughterName} 僵了一下，然後沉默著推開你的手：「不、不要這樣……」臉卻紅了。`,
      allowance: `${daughterName} 收下零用錢，一本正經地說：「我會用在購買圖書館的珍本典籍上。」`,
    },
    '溫柔乖乖女': {
      gentle: `${daughterName} 含笑道：「爸爸……謝謝你陪著我說話。」她輕輕靠在你肩上，身心都舒暢了許多。`,
      scold: `${daughterName} 委屈地低下頭，眼眶微紅：「我……我知道了，對不起，我會改的……」`,
      praise: `${daughterName} 漲紅了臉，手足無措地說：「爸爸，不要這樣嘛……但是、謝謝你。」`,
      headpat: `${daughterName} 幸福地瞇起眼睛，像小貓一樣蹭了蹭你的手：「爸爸最好了！」`,
      allowance: `${daughterName} 雙手捧著零用錢，感激道：「謝謝爸爸！我會好好存起來的！」`,
    },
    '多愁善感藝術家': {
      gentle: `${daughterName} 若有所思地嘆了口氣：「爸爸……今天的夕陽，真的好美……」她靠在你身旁，憂愁似乎消散了一些。`,
      scold: `${daughterName} 默默點頭，眼中閃過複雜的情緒：「我知道……其實我也覺得自己太敏感了。」`,
      praise: `${daughterName} 呢喃道：「真的……嗎？也許，這就是我存在的意義……」她看起來感動到快要哭泣。`,
      headpat: `${daughterName} 閉上眼睛感受著，輕聲說：「……像是春風一樣。我要把這個感覺畫下來。」`,
      allowance: `${daughterName} 靜靜收下，低聲說：「謝謝爸爸……我想買一盒新的水彩顏料，把這份心情留下來。」`,
    },
  };

  return dialogues[personality][type] ?? `父親與${daughterName}進行了深情的互動。`;
};
