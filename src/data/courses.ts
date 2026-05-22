import type { Activity } from '../types';

export const COURSES: Activity[] = [
  {
    id: 'swordplay',
    name: '劍術課',
    type: 'study',
    cost: 35,
    reward: 0,
    description: '跟隨老軍官修練雙手劍術與力量，提升攻擊力，但會讓舉止變得粗魯。',
    statChanges: { combatSkill: 5, strength: 4, art: -2, stress: 2 },
    effectDescription: '戰鬥技術+5, 力量+4, 氣質-2, 疲勞+2, 金幣-35'
  },
  {
    id: 'combat_training',
    name: '體能格鬥',
    type: 'study',
    cost: 30,
    reward: 0,
    description: '進行高強度的體能拉伸與肉搏練習，增強耐力與防禦，但有損文雅氣息。',
    statChanges: { stamina: 6, combatSkill: 3, elegance: -2, stress: 2 },
    effectDescription: '體力+6, 戰鬥技術+3, 禮儀-2, 疲勞+2, 金幣-30'
  },
  {
    id: 'tactics',
    name: '戰術指揮',
    type: 'study',
    cost: 45,
    reward: 0,
    description: '研讀歷代軍事會戰與陣型編排，提升指揮統率力與智力。',
    statChanges: { intelligence: 5, reputation: 3, stress: 3 },
    effectDescription: '智力+5, 名望+3, 疲勞+3, 金幣-45'
  },
  {
    id: 'rhetoric',
    name: '修辭與法學',
    type: 'study',
    cost: 40,
    reward: 0,
    description: '練習宮廷演說與王國法典辯論，提高言談與思辨，但會稍微降低感性。',
    statChanges: { intelligence: 4, elegance: 3, sensitivity: -2, stress: 2 },
    effectDescription: '智力+4, 禮儀+3, 感受-2, 疲勞+2, 金幣-40'
  },
  {
    id: 'history',
    name: '帝王學與歷史',
    type: 'study',
    cost: 50,
    reward: 0,
    description: '探尋蔚藍海岸王國的興衰，培養帝王氣質與治國智力，並搜集復國線索。',
    statChanges: { intelligence: 5, art: 3, reputation: 2, stress: 2 },
    effectDescription: '智力+5, 氣質+3, 名望+2, 疲勞+2, 金幣-50'
  },
  {
    id: 'science_class',
    name: '自然科學',
    type: 'study',
    cost: 40,
    reward: 0,
    description: '研究數學、物理與天體運行，增強知性與法術抗性，但容易質疑神學。',
    statChanges: { intelligence: 6, magicSkill: 3, piety: -2, stress: 2 },
    effectDescription: '智力+6, 魔法技術+3, 信仰-2, 疲勞+2, 金幣-40'
  },
  {
    id: 'etiquette',
    name: '宮廷禮儀',
    type: 'study',
    cost: 60,
    reward: 0,
    description: '學習貴族社交、站姿與用餐禮儀，極大提升社交能力與淑女風範。',
    statChanges: { elegance: 6, art: 4, stamina: -2, stress: 3 },
    effectDescription: '禮儀+6, 氣質+4, 體力-2, 疲勞+3, 金幣-60'
  },
  {
    id: 'music_poetry',
    name: '詩歌與音律',
    type: 'study',
    cost: 35,
    reward: 0,
    description: '彈奏豎琴、吟誦浪漫主義詩歌，培養優雅藝術感性與魅力。',
    statChanges: { sensitivity: 5, charisma: 3, art: 4, stress: 2 },
    effectDescription: '感受+5, 魅力+3, 氣質+4, 疲勞+2, 金幣-35'
  },
  {
    id: 'theology_art',
    name: '神學與繪畫',
    type: 'study',
    cost: 40,
    reward: 0,
    description: '虔誠描摹聖像畫，感悟神聖秩序，增加道德與感性，稍微削弱戰鬥戾氣。',
    statChanges: { sensitivity: 4, morality: 4, combatSkill: -2, stress: 2 },
    effectDescription: '感受+4, 道德+4, 戰鬥技術-2, 疲勞+2, 金幣-40'
  }
];

// 同窗亂入事件觸發判定與效果
export interface ClassmateEvent {
  classmateName: string;
  triggerChance: number;
  effect: (daughter: any) => { log: string; changes: any };
}

export const CLASSMATE_EVENTS: Record<string, ClassmateEvent> = {
  clover: {
    classmateName: '四葉草',
    triggerChance: 0.25, // 25% 觸發率
    effect: (daughter) => {
      // 依據主角的戰鬥技術或禮儀進行判定
      const success = (daughter.attributes.combatSkill + daughter.attributes.elegance) / 2 > 80;
      if (success) {
        return {
          log: `同窗「四葉草」與女兒進行劍術較勁，被女兒輕易化解！女兒名望增加 15，戰技提升 5。`,
          changes: { reputation: 15, combatSkill: 5 }
        };
      } else {
        return {
          log: `同窗「四葉草」強勢切磋，女兒手忙腳亂，十分疲倦。疲勞增加 10。`,
          changes: { stress: 10 }
        };
      }
    }
  },
  shanshan: {
    classmateName: '珊珊',
    triggerChance: 0.3,
    effect: (daughter) => {
      // 智力達標且為文臣開局時透露情報
      const success = daughter.attributes.intelligence >= 120;
      if (success) {
        return {
          log: `修辭法學課助教「珊珊」對女兒的聰慧大加讚賞，透露了有關歷史禁區的情報（解鎖隱藏地圖【地下皇家圖書館】通行線索）！智力外加 10。`,
          changes: { intelligence: 10 }
        };
      }
      return {
        log: `助教「珊珊」在課後悉心指導了女兒法學論述的要點，智力提升 5。`,
        changes: { intelligence: 5 }
      };
    }
  },
  xuewu: {
    classmateName: '雪舞',
    triggerChance: 0.25,
    effect: (_daughter) => {
      // 隨機贈送特殊道具【桶仔米糕】或免除上課疲勞
      const giftChance = Math.random() < 0.4;
      if (giftChance) {
        return {
          log: `留級生「雪舞」在課堂上偷偷打瞌睡，還分給了女兒一個熱騰騰的【桶仔米糕】！女兒的疲勞降低了 10。`,
          changes: { stress: -10, addInventory: 'barrel_rice_cake' } // 會在 Context 中特殊解析
        };
      }
      return {
        log: `留級生「雪舞」拉著女兒課堂開小差，聊天十分愉快，這節課毫無負擔！疲勞降低了 12。`,
        changes: { stress: -12 }
      };
    }
  }
};
