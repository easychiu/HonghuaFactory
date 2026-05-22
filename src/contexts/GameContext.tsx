import React, { createContext, useContext, useState, useEffect } from 'react';
import type { GameState, Daughter, CharacterId, FatherBackground, Activity, Item, AdventureMapNode, PeriodType, Monster } from '../types';
import { COURSES } from '../data/courses';
import { AVG_EVENTS } from '../data/events';
import { determineEnding } from '../data/endings';

// 定義商店道具庫
export const ITEMS: Item[] = [
  {
    id: 'steel_sword',
    name: '古雅十字鐵劍',
    description: '增加戰鬥技術與力量。騎士爸爸開局配備。',
    price: 200,
    type: 'weapon',
    statChanges: { combatSkill: 20, strength: 10 }
  },
  {
    id: 'silver_armor',
    name: '亮銀女武神胸甲',
    description: '防禦力極高的胸鎧，附贈立繪外觀切換。騎士爸爸開局配備。',
    price: 350,
    type: 'armor',
    statChanges: { stamina: 40, combatSkill: 15 },
    outfitChange: 'armor'
  },
  {
    id: 'royal_dress',
    name: '皇家絲綢華麗洋裝',
    description: '名門閨秀的洋裝，極大提升魅力與禮儀，解鎖皇家立繪外觀。',
    price: 450,
    type: 'dress',
    statChanges: { charisma: 60, elegance: 40, art: 10 },
    outfitChange: 'dress'
  },
  {
    id: 'summer_dress',
    name: '盛夏微風連身裙',
    description: '輕便涼爽的長洋裝，消暑降壓，解鎖夏日立繪外觀。',
    price: 150,
    type: 'dress',
    statChanges: { stress: -30, charisma: 20 },
    outfitChange: 'summer'
  },
  {
    id: 'royal_letter',
    name: '宮廷推薦信',
    description: '文臣爸爸開局配備。持有可提前解鎖政務打工。',
    price: 800,
    type: 'book',
    statChanges: { intelligence: 30 }
  },
  {
    id: 'old_lute',
    name: '古舊的魯特琴',
    description: '詩人爸爸開局配備。大幅增加感受。',
    price: 250,
    type: 'book',
    statChanges: { sensitivity: 100 }
  },
  {
    id: 'future_gp125',
    name: '未來摩托車 Gp125',
    description: '行商老爸開局載具，或百萬售價神裝。使野外修行移動消耗僅需 1 專注度！',
    price: 1000000,
    type: 'food',
    statChanges: { stamina: 10 }
  },
  {
    id: 'giant_hammer',
    name: '三十公分的錘子',
    description: '木工作坊滿 10 次贈送的限定武器。加強攻擊 30，增加暴擊率 15%。若為艾蜜莉亞由 jumbo 裝備。',
    price: 999999,
    type: 'weapon',
    statChanges: {}
  },
  // 檳榔與藥物
  {
    id: 'binlang_ice',
    name: '結冰檳榔',
    description: '戰鬥消耗品。使怪物凍結 2 回合無法反擊。紅花特化武器。',
    price: 80,
    type: 'food',
    statChanges: { stress: 10 }
  },
  {
    id: 'binlang_twin',
    name: '雙子星檳榔',
    description: '戰鬥消耗品。暴發潛能使攻擊力翻倍持續 3 回合。',
    price: 100,
    type: 'food',
    statChanges: { stress: 15 }
  },
  {
    id: 'binlang_normal',
    name: '包葉檳榔',
    description: '戰鬥消耗品。戰鬥中回復 40 HP。',
    price: 40,
    type: 'food',
    statChanges: { stress: -5 }
  },
  {
    id: 'barrel_rice_cake',
    name: '桶仔米糕',
    description: '補給美食。野外可用於回血與大拔罐交換。',
    price: 120,
    type: 'food',
    statChanges: { stress: -25 }
  },
  {
    id: 'holy_water',
    name: '塞特的私房聖水',
    description: '消除女兒所有負面狀態（如過度勞累生病）。',
    price: 200,
    type: 'food',
    statChanges: { stress: -40 }
  },
  // 黑市走私道具
  {
    id: 'bm_dark_armor',
    name: '【黑市】夜行密探半身甲',
    description: '【黑市】夜行密探半身甲 (600金，+60 體力，+30 戰技，-15 禮儀)',
    price: 600,
    type: 'armor',
    statChanges: { stamina: 60, combatSkill: 30, elegance: -15 },
    outfitChange: 'armor'
  },
  {
    id: 'bm_poison_dagger',
    name: '【黑市】暗影淬毒雙短刃',
    description: '【黑市】暗影淬毒雙短刃 (500金，+40 戰技，+20 罪孽)',
    price: 500,
    type: 'weapon',
    statChanges: { combatSkill: 40, sin: 20 }
  },
  {
    id: 'bm_cheap_gp125',
    name: '【黑市】二手未來摩托車 Gp125',
    description: '【黑市】二手未來摩托車 Gp125 (1500金，+10 體力，移動消耗減至 1)',
    price: 1500,
    type: 'food',
    statChanges: { stamina: 10 }
  }
];

// 全新打工/休息活動定義
export const ACTIVITIES: Activity[] = [
  // --- 打工 (Jobs) ---
  {
    id: 'farm',
    name: '農場打工',
    type: 'work',
    cost: 0,
    reward: 12,
    description: '在烈日下協助耕作，磨練耐力，但有損文雅氣息。',
    statChanges: { stamina: 4, strength: 3, intelligence: -1, stress: 3 },
    effectDescription: '體力+4, 力量+3, 智力-1, 疲勞+3, 金幣+12'
  },
  {
    id: 'church_clean',
    name: '教堂清潔',
    type: 'work',
    cost: 0,
    reward: 5,
    description: '擦拭聖像、打掃教堂，洗滌罪孽，增加信仰道德，報酬微薄。',
    statChanges: { piety: 4, morality: 3, sin: -3, stress: 1 },
    effectDescription: '信仰+4, 道德+3, 罪孽-3, 疲勞+1, 金幣+5'
  },
  {
    id: 'maid_mansion',
    name: '豪宅女僕',
    type: 'work',
    cost: 0,
    reward: 18,
    description: '打理大商人家務，學習基礎禮儀，提升魅力與禮儀。',
    statChanges: { charisma: 2, elegance: 3, stamina: -1, stress: 4 },
    effectDescription: '魅力+2, 禮儀+3, 體力-1, 疲勞+4, 金幣+18'
  },
  {
    id: 'graveyard_guard',
    name: '墓地守衛',
    type: 'work',
    cost: 0,
    reward: 25,
    description: '看守深夜墓園，增加感受與魔法天分，但沾染深重罪孽。',
    statChanges: { sensitivity: 3, magicSkill: 2, sin: 3, charisma: -2, stress: 5 },
    effectDescription: '感受+3, 魔法技術+2, 罪孽+3, 魅力-2, 疲勞+5, 金幣+25'
  },
  {
    id: 'guesthouse_helper',
    name: '民宿打雜',
    type: 'work',
    cost: 0,
    reward: 15,
    description: '民宿老闆提莫經營的小旅館。招待過路客，提升言談與家事。',
    statChanges: { elegance: 2, piety: 2, art: -2, stress: 3 },
    effectDescription: '禮儀+2, 道德+2, 氣質-2, 疲勞+3, 金幣+15'
  },
  {
    id: 'woodshop',
    name: '木工作坊',
    type: 'work',
    cost: 0,
    reward: 20,
    description: '跟隨師傅胡村姑拉鋸、搬運原木，能鍛鍊力量防禦。',
    statChanges: { strength: 4, stamina: 2, elegance: -2, stress: 4 },
    effectDescription: '力量+4, 體力+2, 禮儀-2, 疲勞+4, 金幣+20'
  },
  {
    id: 'government_office',
    name: '政務打雜',
    type: 'work',
    cost: 0,
    reward: 45,
    description: '進入王國內政廳協助抄寫法案。需要持有宮廷推薦信。',
    statChanges: { intelligence: 4, elegance: 2, stamina: -2, stress: 4 },
    effectDescription: '智力+4, 禮儀+2, 體力-2, 疲勞+4, 金幣+45'
  },
  // --- 學習 (COURSES 由 courses.ts 匯入) ---
  // --- 休息 (Rests) ---
  {
    id: 'rest_home',
    name: '在家休息',
    type: 'rest',
    cost: 0,
    reward: 0,
    description: '在家睡覺休息，恢復疲勞。',
    statChanges: { stress: -20 },
    effectDescription: '疲勞-20'
  },
  {
    id: 'rest_vacation',
    name: '野外度假',
    type: 'rest',
    cost: 30,
    reward: 0,
    description: '帶女兒去溫泉度假，增進父女感情並極大消解壓力。',
    statChanges: { stress: -60, sensitivity: 1 },
    effectDescription: '疲勞-60, 感受+1, 父親親密度+4, 金幣-30'
  },
  // 詩人老爸專屬
  {
    id: 'street_performance',
    name: '街頭賣藝',
    type: 'work',
    cost: 0,
    reward: 35,
    description: '詩人爸爸開局解鎖。彈奏魯特琴賣藝，獲得魅力、氣質與高額打賞。',
    statChanges: { charisma: 4, art: 3, stress: 3 },
    effectDescription: '魅力+4, 氣質+3, 疲勞+3, 金幣+35（氣質有額外加成）'
  }
];

// Slay the Spire 風格地圖生成器
export const generateAdventureMap = (dad: FatherBackground, _charId: CharacterId, inventory: string[] = []): AdventureMapNode[] => {
  const nodes: AdventureMapNode[] = [];
  
  // Layer 0: 起點
  nodes.push({
    id: '0_0',
    layer: 0,
    index: 0,
    type: 'start',
    name: '林地起點',
    cleared: true,
    connectedTo: ['1_0', '1_1', '1_2']
  });

  // Layer 1: 分支
  nodes.push({
    id: '1_0',
    layer: 1,
    index: 0,
    type: 'battle',
    name: '史萊姆聚落',
    cleared: false,
    connectedTo: ['2_0', '2_1'],
    monster: { name: '林地史萊姆', hp: 60, maxHp: 60, attack: 10, defense: 4, goldReward: 50, expReward: 15 }
  });
  nodes.push({
    id: '1_1',
    layer: 1,
    index: 1,
    type: 'event',
    name: '林間小徑',
    cleared: false,
    connectedTo: ['2_1', '2_2']
  });
  nodes.push({
    id: '1_2',
    layer: 1,
    index: 2,
    type: 'shop',
    name: '修行驛站',
    cleared: false,
    connectedTo: ['2_2']
  });

  // Layer 2: 注入隱藏節點
  let layer2HiddenType: AdventureMapNode['type'] = 'event';
  let layer2HiddenName = '幽靜古木';
  if (dad === 'knight') {
    layer2HiddenType = 'hidden';
    layer2HiddenName = '🛡️ 隱密要塞';
  } else if (dad === 'scholar' || inventory.includes('royal_library_clue')) {
    layer2HiddenType = 'hidden';
    layer2HiddenName = '📚 地下皇家圖書館';
  } else if (dad === 'merchant') {
    layer2HiddenType = 'hidden';
    layer2HiddenName = '💰 黑市走私營地';
  } else if (dad === 'bard') {
    layer2HiddenType = 'hidden';
    layer2HiddenName = '🎵 精靈的妖精之環';
  }

  nodes.push({
    id: '2_0',
    layer: 2,
    index: 0,
    type: 'battle',
    name: '哥布林哨所',
    cleared: false,
    connectedTo: ['3_0'],
    monster: { name: '哥布林斥候', hp: 90, maxHp: 90, attack: 16, defense: 6, goldReward: 80, expReward: 25 }
  });
  nodes.push({
    id: '2_1',
    layer: 2,
    index: 1,
    type: layer2HiddenType,
    name: layer2HiddenName,
    cleared: false,
    connectedTo: ['3_0', '3_1', '3_2']
  });
  nodes.push({
    id: '2_2',
    layer: 2,
    index: 2,
    type: 'rest',
    name: '篝火宿營',
    cleared: false,
    connectedTo: ['3_2']
  });

  // 根據當前主角 _charId 動態判定中層 Boss
  let sisterAId: CharacterId = 'erica';
  let sisterBId: CharacterId = 'emilia';
  if (_charId === 'erica') {
    sisterAId = 'honghua';
    sisterBId = 'emilia';
  } else if (_charId === 'emilia') {
    sisterAId = 'honghua';
    sisterBId = 'erica';
  }

  const getSisterMonster = (sisterId: CharacterId, layer: number): Monster => {
    const isL3 = layer === 3;
    const name = sisterId === 'erica' ? '遺失的王女 艾莉卡' : sisterId === 'emilia' ? '遺失的王女 艾蜜莉亞' : '遺失的王女 紅花';
    return {
      name,
      hp: isL3 ? 150 : 230,
      maxHp: isL3 ? 150 : 230,
      attack: isL3 ? 24 : 32,
      defense: isL3 ? 10 : 16,
      goldReward: isL3 ? 150 : 250,
      expReward: isL3 ? 50 : 90,
      sisterId
    };
  };

  const sisterAMonster = getSisterMonster(sisterAId, 3);
  const sisterBMonster = getSisterMonster(sisterBId, 4);

  // Layer 3:
  nodes.push({
    id: '3_0',
    layer: 3,
    index: 0,
    type: 'battle',
    name: sisterAMonster.name,
    cleared: false,
    connectedTo: ['4_0'],
    monster: sisterAMonster
  });
  nodes.push({
    id: '3_1',
    layer: 3,
    index: 1,
    type: 'event',
    name: '遠古遺跡石碑',
    cleared: false,
    connectedTo: ['4_0', '4_1']
  });
  nodes.push({
    id: '3_2',
    layer: 3,
    index: 2,
    type: 'shop',
    name: '荒野流浪黑市',
    cleared: false,
    connectedTo: ['4_1']
  });

  // Layer 4:
  nodes.push({
    id: '4_0',
    layer: 4,
    index: 0,
    type: 'rest',
    name: '守夜營火',
    cleared: false,
    connectedTo: ['5_0']
  });
  nodes.push({
    id: '4_1',
    layer: 4,
    index: 1,
    type: 'battle',
    name: sisterBMonster.name,
    cleared: false,
    connectedTo: ['5_0'],
    monster: sisterBMonster
  });

  // Layer 5: Boss Jaks
  nodes.push({
    id: '5_0',
    layer: 5,
    index: 0,
    type: 'boss',
    name: '👑 海軍少校 傑克斯',
    cleared: false,
    connectedTo: [],
    monster: {
      name: '海軍少校 傑克斯',
      hp: 420,
      maxHp: 420,
      attack: 38,
      defense: 20,
      goldReward: 600,
      expReward: 150,
      behaviorPattern: 'boss'
    }
  });

  return nodes;
};

// 初始屬性範本
const DEFAULT_ATTRIBUTES = {
  stamina: 80,
  strength: 40,
  intelligence: 50,
  charisma: 40,
  morality: 40,
  piety: 30,
  sensitivity: 30,
  stress: 0,
  combatSkill: 30,
  magicSkill: 20,
  reputation: 10,
  sin: 0,
  elegance: 30,
  art: 30
};

interface GameContextProps {
  state: GameState;
  setScreen: (screen: GameState['activeScreen']) => void;
  initGame: (name: string, birthMonth: number, birthDay: number, characterId: CharacterId, fatherBackground: FatherBackground) => void;
  setSchedule: (early: string, mid: string, late: string) => void;
  startScheduleExecution: () => void;
  executeNextPeriod: () => boolean;
  finishExecution: () => void;
  buyItem: (itemId: string) => { success: boolean; message: string };
  talkToDaughter: (type: 'gentle' | 'scold' | 'praise') => void;
  changeOutfit: (outfit: Daughter['outfit']) => void;
  startAdventure: () => void;
  stepAdventure: (nodeId: string) => void;
  endAdventure: (isDefeat: boolean) => void;
  triggerAVGEvent: (eventId: string) => void;
  executeAVGChoice: (choiceIndex: number) => void;
  toggleCheatMode: () => void;
  restartGame: () => void;
  saveGame: () => void;
  loadGame: () => void;
  loadGameFromData: (data: Partial<GameState>) => void;
  performStreetPerformance: () => void;
  resolveCombatVictory: (remainingHp: number, goldReward: number) => void;
  resolveCombatDefeat: () => void;
  unlockAllProtagonists: () => void;
  eatRiceCake: () => void;
  resolveFestival: (victory: boolean, goldPrize: number, repPrize: number, logText: string, consumedItems?: string[]) => void;
  consumeItem: (itemId: string) => void;
  resolveCombatReunion: (sisterId: string) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(() => {
    // 嘗試從 LocalStorage 還原週目存檔
    const local = localStorage.getItem('honghua_factory_ng');
    const unlocked = local ? JSON.parse(local).unlockedCharacters : ['honghua'];
    const completed = local ? JSON.parse(local).completedEndings : [];
    const achievements = local ? (JSON.parse(local).unlockedAchievements || []) : [];
    
    return {
      daughter: {
        name: '紅花',
        age: 10,
        birthMonth: 5,
        birthDay: 20,
        attributes: { ...DEFAULT_ATTRIBUTES },
        gold: 1500,
        relationship: 50,
        outfit: 'default',
        combatHp: 80,
        combatMp: 50,
        focus: 100,
        maxFocus: 100,
        avatarUrl: '',
        characterId: 'honghua',
        fatherBackground: 'knight',
        bonds: {
          clover: 0,
          shanshan: 0,
          xuewu: 0
        }
      },
      time: { year: 1, month: 5, period: 'early' },
      schedule: null,
      inventory: [],
      activeScreen: 'main',
      logs: [],
      currentEvent: null,
      currentEventStep: null,
      adventure: null,
      cheatMode: false,
      unlockedCharacters: unlocked,
      completedEndings: completed,
      unlockedAchievements: achievements
    };
  });

  // 當週目解鎖與成就更新時寫入 LocalStorage
  useEffect(() => {
    localStorage.setItem('honghua_factory_ng', JSON.stringify({
      unlockedCharacters: state.unlockedCharacters,
      completedEndings: state.completedEndings,
      unlockedAchievements: state.unlockedAchievements
    }));
  }, [state.unlockedCharacters, state.completedEndings, state.unlockedAchievements]);

  const setScreen = (screen: GameState['activeScreen']) => {
    setState((prev) => ({ ...prev, activeScreen: screen }));
  };

  // 初始化遊戲（分配老爸開局資源）
  const initGame = (
    name: string,
    birthMonth: number,
    birthDay: number,
    characterId: CharacterId,
    fatherBackground: FatherBackground
  ) => {
    const base = import.meta.env.BASE_URL || '/';
    const prefix = base.endsWith('/') ? base : `${base}/`;
    const defaultAvatar = `${prefix}sprites/daughter_10_default.png`;

    const freshDaughter: Daughter = {
      name: name || (characterId === 'honghua' ? '紅花' : characterId === 'erica' ? '艾莉卡' : '艾蜜莉亞'),
      age: 10,
      birthMonth: birthMonth || 5,
      birthDay: birthDay || 20,
      attributes: { ...DEFAULT_ATTRIBUTES },
      gold: 1500,
      relationship: 50,
      outfit: 'default',
      combatHp: 80,
      combatMp: 50,
      focus: 100,
      maxFocus: 100,
      avatarUrl: defaultAvatar,
      characterId,
      fatherBackground,
      bonds: {
        clover: 0,
        shanshan: 0,
        xuewu: 0
      }
    };

    const startingInventory: string[] = [];

    // 老爸職業開局加成
    if (fatherBackground === 'knight') {
      freshDaughter.gold = 1500;
      startingInventory.push('steel_sword', 'silver_armor');
      freshDaughter.attributes.strength += 20;
      freshDaughter.attributes.combatSkill += 20;
      freshDaughter.attributes.stamina += 20;
    } else if (fatherBackground === 'scholar') {
      freshDaughter.gold = 2500;
      startingInventory.push('royal_letter');
      freshDaughter.attributes.intelligence += 20;
      freshDaughter.attributes.elegance += 20;
    } else if (fatherBackground === 'merchant') {
      freshDaughter.gold = 5000;
      startingInventory.push('future_gp125');
      // 隨機贈送 3 件商品
      const pool = ['barrel_rice_cake', 'holy_water', 'steel_sword'];
      pool.forEach(p => startingInventory.push(p));
      freshDaughter.attributes.reputation += 20;
    } else if (fatherBackground === 'bard') {
      freshDaughter.gold = 500;
      startingInventory.push('old_lute');
      freshDaughter.attributes.sensitivity += 100;
    }

    freshDaughter.combatHp = freshDaughter.attributes.stamina;
    freshDaughter.combatMp = freshDaughter.attributes.magicSkill * 2 + 10;

    setState((prev) => ({
      ...prev,
      daughter: freshDaughter,
      time: { year: 1, month: birthMonth, period: 'early' },
      schedule: null,
      inventory: startingInventory,
      activeScreen: 'main',
      logs: [
        {
          id: Math.random().toString(),
          year: 1,
          month: birthMonth,
          period: 'early',
          text: `收養了可愛的女兒 ${freshDaughter.name}。起點年齡：10歲。父親職業為【${
            fatherBackground === 'knight' ? '失落的騎士' : fatherBackground === 'scholar' ? '失落的文臣' : fatherBackground === 'merchant' ? '行商人' : '吟遊詩人'
          }】。開始培育妳的王女吧！`,
          type: 'info'
        }
      ],
      currentEvent: null,
      currentEventStep: null,
      adventure: null,
      cheatMode: false,
      unlockedAchievements: prev.unlockedAchievements || []
    }));
  };

  const setSchedule = (early: string, mid: string, late: string) => {
    setState((prev) => ({ ...prev, schedule: [early, mid, late] }));
  };

  const startScheduleExecution = () => {
    if (!state.schedule) return;
    setState((prev) => ({
      ...prev,
      activeScreen: 'execution',
      time: { ...prev.time, period: 'early' }
    }));
  };

  // 執行下一旬日程
  const executeNextPeriod = (): boolean => {
    if (state.currentEvent) return false;
    if (!state.schedule) return true;
    let triggeredAVGEvent: string | null = null;
    const currentPeriod = state.time.period;
    let activityId = '';
    
    if (currentPeriod === 'early') activityId = state.schedule[0];
    else if (currentPeriod === 'mid') activityId = state.schedule[1];
    else if (currentPeriod === 'late') activityId = state.schedule[2];

    // 尋找活動（可以是課程或打工）
    let activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity) {
      // 或者是課程
      const course = COURSES.find(c => c.id === activityId);
      if (course) {
        activity = course;
      }
    }

    if (!activity) return true;

    const newDaughter = { ...state.daughter };
    const newLogs = [...state.logs];
    const newInventory = [...state.inventory];
    const logId = Math.random().toString();
    let restGain = 0;

    // 1. 檢驗金幣
    let cost = activity.cost;
    // 文臣老爸學習文藝打8折
    if (newDaughter.fatherBackground === 'scholar' && activity.type === 'study') {
      const isHumanities = ['rhetoric', 'history', 'music_poetry', 'theology_art', 'etiquette'].includes(activity.id);
      if (isHumanities) {
        cost = Math.round(cost * 0.8);
      }
    }

    if (cost > newDaughter.gold) {
      newLogs.push({
        id: logId,
        year: state.time.year,
        month: state.time.month,
        period: currentPeriod,
        text: `【${activity.name}】因金幣不足（需要 ${cost} G，持有 ${newDaughter.gold} G），改為在家休息。`,
        type: 'info'
      });
      const rest = ACTIVITIES.find(a => a.id === 'rest_home')!;
      newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + (rest.statChanges.stress || 0));
      restGain = 5;
    } else {
      // 扣除學費，給予工作獎勵
      let finalGoldReward = activity.reward;
      
      // 行商老爸打工收入 +20%
      if (newDaughter.fatherBackground === 'merchant' && activity.type === 'work') {
        finalGoldReward = Math.round(finalGoldReward * 1.2);
      }
      
      // 詩人老爸賣藝有氣質額外打賞
      if (activity.id === 'street_performance') {
        finalGoldReward += Math.round(newDaughter.attributes.art * 0.15);
      }

      // 檢查是否沒有宮廷推薦信卻做政務打雜
      if (activity.id === 'government_office' && !state.inventory.includes('royal_letter')) {
        newLogs.push({
          id: logId,
          year: state.time.year,
          month: state.time.month,
          period: currentPeriod,
          text: `【政務打雜】需要【宮廷推薦信】才可以進入，打工遭到拒絕，被迫在家躺平休息。`,
          type: 'info'
        });
        const rest = ACTIVITIES.find(a => a.id === 'rest_home')!;
        newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + (rest.statChanges.stress || 0));
        restGain = 5;
      } else {
        // --- 判定成敗 ---
        // 大成功判定：艾莉卡基礎 30%，四葉草滿級 (clover >= 100) 額外 +20%
        const isErica = newDaughter.characterId === 'erica';
        let luckyChance = isErica ? 0.30 : 0.00;
        if (newDaughter.bonds && newDaughter.bonds.clover >= 100) {
          luckyChance += 0.20;
        }
        const isLuckySuccess = Math.random() < luckyChance;
        
        let finalStatChanges = { ...activity.statChanges };
        let isSuccess = true;
        let logText = '';
        
        if (isLuckySuccess) {
          // 強運大成功
          isSuccess = true;
          // 屬性獲得兩倍，且不增加疲勞！
          Object.entries(activity.statChanges).forEach(([key, val]) => {
            const attrKey = key as keyof typeof activity.statChanges;
            if (attrKey === 'stress') {
              finalStatChanges.stress = 0; // 不增加疲勞
            } else if ((val || 0) > 0) {
              (finalStatChanges as any)[attrKey] = (val || 0) * 2;
            }
          });
          logText = `✨【艾莉卡強運爆發！】在${activity.name}中大成功！獲得兩倍數值加成，且毫無壓力！`;
        } else if (activity.type !== 'rest') {
          // 常規成敗率
          const successChance = Math.max(30, Math.round(100 - (newDaughter.attributes.stress / Math.max(1, newDaughter.attributes.stamina)) * 60));
          isSuccess = Math.random() * 100 < successChance;
          
          if (!isSuccess) {
            if (activity.type === 'work') {
              finalGoldReward = Math.round(finalGoldReward * 0.3);
              finalStatChanges = { stress: Math.round((activity.statChanges.stress || 3) * 1.5) };
              logText = `❌【${activity.name}】工作失誤被嚴厲責備！工作失敗！僅獲得 ${finalGoldReward} G，疲勞+${finalStatChanges.stress || 0}。`;
            } else {
              // 學習失敗
              const modifiedChanges: any = {};
              Object.entries(activity.statChanges).forEach(([key, val]) => {
                if (key === 'stress') modifiedChanges.stress = val;
                else if ((val || 0) > 0) modifiedChanges[key] = 1; // 混水摸魚微增
                else modifiedChanges[key] = val;
              });
              finalStatChanges = modifiedChanges;
              logText = `❌【${activity.name}】上課時心不在焉、打瞌睡。雖然扣了學費，但近乎沒有學到東西。`;
            }
          }
        }

        if (isSuccess && !isLuckySuccess) {
          logText = `完成 ${activity.name}：${activity.effectDescription}`;
        }

        if (activity.type === 'rest') {
          restGain = activity.id === 'rest_vacation' ? 10 : 5;
        }

        newDaughter.gold = Math.max(0, newDaughter.gold - cost + finalGoldReward);
        
        // 增減屬性
        Object.entries(finalStatChanges).forEach(([key, val]) => {
          const attrKey = key as keyof typeof DEFAULT_ATTRIBUTES;
          if (attrKey === 'stress') {
            newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + (val || 0));
          } else {
            let increment = val || 0;
            // 雪舞滿級加成：上課所獲得的正面屬性增長率永久 +15%
            if (activity.type === 'study' && increment > 0 && newDaughter.bonds && newDaughter.bonds.xuewu >= 100) {
              increment = Math.round(increment * 1.15);
            }
            newDaughter.attributes[attrKey] = Math.max(0, newDaughter.attributes[attrKey] + increment);
          }
        });

        newLogs.push({
          id: logId,
          year: state.time.year,
          month: state.time.month,
          period: currentPeriod,
          text: logText,
          type: isSuccess ? 'stat_up' : 'stat_down'
        });

        // --- 同窗亂入事件 (上課限定，非大成功時 25% 機率觸發 AVG 事件) ---
        if (activity.type === 'study' && isSuccess && !isLuckySuccess && Math.random() < 0.25) {
          if (['swordplay', 'etiquette'].includes(activity.id)) {
            triggeredAVGEvent = 'clover_encounter';
          }
          else if (['rhetoric', 'history'].includes(activity.id)) {
            triggeredAVGEvent = 'shanshan_encounter';
          }
          else if (activity.id === 'science_class') {
            triggeredAVGEvent = 'xuewu_encounter';
          }
        }

        // --- 打工隨機事件 ---
        if (activity.type === 'work' && isSuccess) {
          // 民宿打雜 -> 奧客凱文
          if (activity.id === 'guesthouse_helper' && Math.random() < 0.25) {
            const success = newDaughter.attributes.elegance >= 80 || newDaughter.attributes.intelligence >= 80;
            if (success) {
              newDaughter.gold += 80;
              newLogs.push({
                id: Math.random().toString(),
                year: state.time.year,
                month: state.time.month,
                period: currentPeriod,
                text: `宿客「凱文 (Kerwin)」無理取鬧。女兒用過人口才和禮儀完美安撫！獲得額外打賞金幣 80。`,
                type: 'event'
              });
            } else {
              newDaughter.attributes.stress += 25;
              newLogs.push({
                id: Math.random().toString(),
                year: state.time.year,
                month: state.time.month,
                period: currentPeriod,
                text: `宿客「凱文 (Kerwin)」大聲咆哮進行精神污染！女兒委屈哭泣，疲勞大幅增加 25。`,
                type: 'event'
              });
            }
          }
          // 教堂清潔 -> 塞特私房聖水
          if (activity.id === 'church_clean' && Math.random() < 0.20) {
            newInventory.push('holy_water');
            newLogs.push({
              id: Math.random().toString(),
              year: state.time.year,
              month: state.time.month,
              period: currentPeriod,
              text: `教堂管理員「塞特」看女兒認真，特別贈送了神奇的【塞特的私房聖水】！`,
              type: 'event'
            });
          }
          // 木工作坊 -> 累積次數送大鐵錘
          if (activity.id === 'woodshop') {
            const woodJobsCount = state.logs.filter(l => l.text.includes('木工作坊') && !l.text.includes('金幣不足')).length + 1;
            if (woodJobsCount === 10) {
              newInventory.push('giant_hammer');
              newLogs.push({
                id: Math.random().toString(),
                year: state.time.year,
                month: state.time.month,
                period: currentPeriod,
                text: `🔨 胡村姑大讚女兒幹活踏實，高興地贈送了極重的大兵器【三十公分的錘子】！`,
                type: 'event'
              });
            }
          }
        }
      }
    }

    // 雪舞好感度累積 (休息/度假)
    if (restGain > 0) {
      if (!newDaughter.bonds) {
        newDaughter.bonds = { clover: 0, shanshan: 0, xuewu: 0 };
      }
      newDaughter.bonds.xuewu = Math.min(100, (newDaughter.bonds.xuewu || 0) + restGain);
    }

    // 2. 壓力生病檢查
    if (newDaughter.attributes.stress > newDaughter.attributes.stamina) {
      newDaughter.attributes.stress = Math.round(newDaughter.attributes.stress * 0.4);
      newDaughter.attributes.stamina = Math.max(40, newDaughter.attributes.stamina - 15);
      newDaughter.gold = Math.max(0, newDaughter.gold - 60);
      newLogs.push({
        id: Math.random().toString(),
        year: state.time.year,
        month: state.time.month,
        period: currentPeriod,
        text: `⚠️ 女兒積勞成疾生病住院！體力衰退，自動扣除 60 金幣醫藥費，壓力減半。`,
        type: 'stat_down'
      });
    }

    // 時間切換
    let nextPeriod: PeriodType = 'early';
    let monthFinished = false;

    if (currentPeriod === 'early') nextPeriod = 'mid';
    else if (currentPeriod === 'mid') nextPeriod = 'late';
    else if (currentPeriod === 'late') monthFinished = true;

    newDaughter.combatHp = newDaughter.attributes.stamina;
    newDaughter.combatMp = newDaughter.attributes.magicSkill * 2 + 10;

    setState(prev => {
      const newUnlocked = [...(prev.unlockedAchievements || [])];
      if (newDaughter.bonds && newDaughter.bonds.xuewu >= 100 && !newUnlocked.includes('永遠的學院生')) {
        newUnlocked.push('永遠的學院生');
        newLogs.push({
          id: Math.random().toString(),
          year: prev.time.year,
          month: prev.time.month,
          period: currentPeriod,
          text: `🏆 解鎖成就：【永遠的學院生】（與雪舞好感度達到 100）！`,
          type: 'event'
        });
      }
      return {
        ...prev,
        daughter: newDaughter,
        logs: newLogs,
        inventory: newInventory,
        time: { ...prev.time, period: nextPeriod },
        currentEvent: triggeredAVGEvent ? AVG_EVENTS[triggeredAVGEvent] : prev.currentEvent,
        currentEventStep: triggeredAVGEvent ? 'start' : prev.currentEventStep,
        unlockedAchievements: newUnlocked
      };
    });

    return monthFinished;
  };



  // 結束一月日程
  const finishExecution = () => {
    setState((prev) => {
      let nextMonth = prev.time.month + 1;
      let nextYear = prev.time.year;
      let newAge = prev.daughter.age;
      const newLogs = [...prev.logs];

      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }

      // 生日加歲
      if (nextMonth === prev.daughter.birthMonth) {
        newAge += 1;
        newLogs.push({
          id: Math.random().toString(),
          year: nextYear,
          month: nextMonth,
          period: 'early',
          text: `🎂 生日快樂！女兒 ${prev.daughter.name} 成長為 ${newAge} 歲了！`,
          type: 'info'
        });
      }

      const currentMonth = prev.time.month;
      const isQuarterEnd = [3, 6, 9, 12].includes(currentMonth);
      const newInventory = [...prev.inventory];
      const updatedDaughter = {
        ...prev.daughter,
        age: newAge,
        combatHp: prev.daughter.attributes.stamina,
        combatMp: prev.daughter.attributes.magicSkill * 2 + 10
      };

      if (isQuarterEnd) {
        const fundIndex = newInventory.findIndex(item => item.startsWith('fortress_fund_'));
        if (fundIndex > -1) {
          const fundItem = newInventory[fundIndex];
          const remainingQuarters = parseInt(fundItem.split('_')[2], 10);
          updatedDaughter.gold += 500;
          newInventory.splice(fundIndex, 1);
          if (remainingQuarters > 1) {
            newInventory.push(`fortress_fund_${remainingQuarters - 1}`);
            newLogs.push({
              id: Math.random().toString(),
              year: prev.time.year,
              month: currentMonth,
              period: 'late',
              text: `🪙 女兒收到了來自隱密要塞的本季軍餉資助 500 金幣！(剩餘 ${remainingQuarters - 1} 季)`,
              type: 'info'
            });
          } else {
            newLogs.push({
              id: Math.random().toString(),
              year: prev.time.year,
              month: currentMonth,
              period: 'late',
              text: `🪙 女兒收到了來自隱密要塞的最後一季軍餉資助 500 金幣！資助合約已滿。`,
              type: 'info'
            });
          }
        }
        
        if (newInventory.includes('casino_property')) {
          updatedDaughter.gold += 1000;
          newLogs.push({
            id: Math.random().toString(),
            year: prev.time.year,
            month: currentMonth,
            period: 'late',
            text: `🪙 女兒收到了來自黑鑽賭場的本季股權分紅 1000 金幣！`,
            type: 'info'
          });
        }
      }

      // 18歲大結局
      if (newAge >= 18) {
        // 計算結局
        const finalClues = newInventory.filter(i => i.includes('crest') || i.includes('saber')).length;
        
        // 收集認親姊妹
        const sisters: string[] = [];
        if (newInventory.includes('erica_reunited')) sisters.push('erica');
        if (newInventory.includes('emilia_reunited')) sisters.push('emilia');
        if (newInventory.includes('honghua_reunited')) sisters.push('honghua');

        const end = determineEnding(updatedDaughter, prev.completedEndings.length, finalClues, sisters);
        
        // 保存解鎖與結局
        const newCompleted = [...prev.completedEndings];
        if (!newCompleted.includes(end.id)) newCompleted.push(end.id);
        
        const newUnlocked = [...prev.unlockedCharacters];
        // 任何結局解鎖艾莉卡
        if (!newUnlocked.includes('erica')) newUnlocked.push('erica');
        // 特定認親或主線大革命結局解鎖艾蜜莉亞
        if ((sisters.length >= 2 || end.id === 'three_revolution' || end.id === 'royal_return') && !newUnlocked.includes('emilia')) {
          newUnlocked.push('emilia');
        }

        // 回傳大結局狀態
        return {
          ...prev,
          daughter: updatedDaughter,
          inventory: newInventory,
          time: { year: nextYear, month: nextMonth, period: 'early' },
          activeScreen: 'ending',
          schedule: null,
          logs: newLogs,
          completedEndings: newCompleted,
          unlockedCharacters: newUnlocked
        };
      }

      // 隨機 AVG 事件觸發 (25% 機率)
      let triggeredEvent: any = null;
      let eventStep: string | null = null;
      
      if (Math.random() < 0.25) {
        // 從隨機庫隨機挑選
        const eventKeys = Object.keys(AVG_EVENTS);
        const randomKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
        const rawEvent = AVG_EVENTS[randomKey];
        if (rawEvent) {
          triggeredEvent = rawEvent;
          eventStep = rawEvent.startNodeId;
        }
      }

      return {
        ...prev,
        daughter: updatedDaughter,
        inventory: newInventory,
        time: { year: nextYear, month: nextMonth, period: 'early' },
        currentEvent: nextMonth === 10 ? null : triggeredEvent,
        currentEventStep: nextMonth === 10 ? null : eventStep,
        schedule: null,
        activeScreen: nextMonth === 10 ? 'festival' : 'main',
        logs: newLogs
      };
    });
  };

  // 購買商店物品
  const buyItem = (itemId: string): { success: boolean; message: string } => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: '找不到商品' };
    
    // 行商老爸享 8 折優惠；黑市解鎖後檳榔 5 折
    let discount = state.daughter.fatherBackground === 'merchant' ? 0.8 : 1;
    if (itemId.startsWith('binlang_') && state.inventory.includes('black_market_unlocked')) {
      discount = 0.5;
    }
    const finalPrice = Math.round(item.price * discount);

    if (state.daughter.gold < finalPrice) return { success: false, message: '金幣不足' };

    let newDaughter = { ...state.daughter };
    newDaughter.gold -= finalPrice;

    // 應用屬性增減
    Object.entries(item.statChanges).forEach(([key, val]) => {
      const attrKey = key as keyof typeof newDaughter.attributes;
      if (attrKey === 'stress') {
        newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + val);
      } else {
        newDaughter.attributes[attrKey] = Math.max(0, newDaughter.attributes[attrKey] + val);
      }
    });

    if (item.outfitChange) {
      newDaughter.outfit = item.outfitChange;
    }

    newDaughter.combatHp = newDaughter.attributes.stamina;
    newDaughter.combatMp = newDaughter.attributes.magicSkill * 2 + 10;

    const newLogs = [...state.logs, {
      id: Math.random().toString(),
      year: state.time.year,
      month: state.time.month,
      period: state.time.period,
      text: `購買道具【${item.name}】：價格 ${finalPrice} G，${item.description}`,
      type: 'info' as const
    }];

    setState((prev) => ({
      ...prev,
      daughter: newDaughter,
      inventory: [...prev.inventory, item.id],
      logs: newLogs
    }));

    return { success: true, message: `成功購買 ${item.name}！` };
  };

  // 與女兒對話互動
  const talkToDaughter = (type: 'gentle' | 'scold' | 'praise') => {
    let text = '';
    let newDaughter = { ...state.daughter };
    const updatedAttributes = { ...newDaughter.attributes };

    if (type === 'gentle') {
      text = `父親溫柔地與女兒聊天。她非常開心，壓力顯著消除。`;
      newDaughter.relationship = Math.min(100, newDaughter.relationship + 5);
      updatedAttributes.stress = Math.max(0, updatedAttributes.stress - 20);
    } else if (type === 'scold') {
      text = `父親嚴肅地訓誡了女兒。女兒感到委屈，但更懂得自我約束了。`;
      newDaughter.relationship = Math.max(0, newDaughter.relationship - 5);
      updatedAttributes.morality += 10;
      updatedAttributes.stress += 8;
    } else if (type === 'praise') {
      text = `父親誇獎了女兒，女兒的小臉上洋溢著驕傲的神采！`;
      newDaughter.relationship = Math.min(100, newDaughter.relationship + 4);
      updatedAttributes.charisma += 5;
      updatedAttributes.stress = Math.max(0, updatedAttributes.stress - 10);
    }

    newDaughter.attributes = updatedAttributes;
    const newLogs = [...state.logs, {
      id: Math.random().toString(),
      year: state.time.year,
      month: state.time.month,
      period: state.time.period,
      text,
      type: 'dialogue' as const
    }];

    setState((prev) => ({
      ...prev,
      daughter: newDaughter,
      logs: newLogs
    }));
  };

  // 更換裝備服飾
  const changeOutfit = (outfit: Daughter['outfit']) => {
    setState((prev) => ({
      ...prev,
      daughter: { ...prev.daughter, outfit }
    }));
  };

  // --- 冒險修行核心方法 ---
  const startAdventure = () => {
    const isEmilia = state.daughter.characterId === 'emilia';
    
    // 初始化 Slay the Spire 地圖
    const mapNodes = generateAdventureMap(state.daughter.fatherBackground, state.daughter.characterId, state.inventory);
    
    let partyData = undefined;
    if (isEmilia) {
      partyData = {
        yv: { name: 'yv', hp: 90, maxHp: 90, mp: 60, maxMp: 60 },
        jumbo: { name: 'jumbo', hp: 160, maxHp: 160, mp: 30, maxMp: 30 }
      };
    }

    setState((prev) => ({
      ...prev,
      activeScreen: 'adventure',
      adventure: {
        areaName: '蔚藍邊境森林',
        nodes: mapNodes,
        currentNodeId: '0_0',
        daughterHp: prev.daughter.combatHp,
        daughterMaxHp: prev.daughter.attributes.stamina,
        party: partyData,
        combatLog: ['進入森林，林間清新的海風撲面而來，開始探索吧！'],
        status: 'exploring'
      }
    }));
  };

  const stepAdventure = (nodeId: string) => {
    if (!state.adventure) return;
    const nextAdv = { ...state.adventure };
    const targetNode = nextAdv.nodes.find(n => n.id === nodeId);
    if (!targetNode) return;

    // 計算專注度扣除。未來摩托車 / 黑市摩托車使基礎消耗為 1；精靈祝福使非摩托車的消耗減半為 2。
    const hasMotorcycle = state.inventory.includes('future_gp125') || state.inventory.includes('bm_cheap_gp125');
    const hasBlessing = state.inventory.includes('fairy_blessing');
    const focusCost = hasMotorcycle ? 1 : (hasBlessing ? 2 : 4);
    
    const newDaughter = { ...state.daughter };
    newDaughter.focus = Math.max(0, newDaughter.focus - focusCost);

    nextAdv.currentNodeId = nodeId;
    targetNode.cleared = true;
    nextAdv.combatLog.push(`🐾 前往 [${targetNode.name}] 耗費了 ${focusCost} 點專注度。`);

    // 處理節點類型
    if (targetNode.type === 'boss' && targetNode.name.includes('少校')) {
      // 攔截傑克斯少校，不直接戰鬥，而是開啟 AVG 事件
      const rawEvent = AVG_EVENTS.jaks_patrol;
      setState(prev => ({
        ...prev,
        daughter: newDaughter,
        adventure: nextAdv,
        currentEvent: rawEvent,
        currentEventStep: rawEvent.startNodeId
      }));
      return;
    }
    
    else if (targetNode.type === 'battle' || targetNode.type === 'boss') {
      nextAdv.status = 'fighting';
    } 
    
    else if (targetNode.type === 'rest') {
      nextAdv.status = 'exploring';
      // 休息回復
      nextAdv.daughterHp = Math.min(nextAdv.daughterMaxHp, nextAdv.daughterHp + 50);
      if (nextAdv.party) {
        nextAdv.party.yv.hp = Math.min(nextAdv.party.yv.maxHp, nextAdv.party.yv.hp + 30);
        nextAdv.party.jumbo.hp = Math.min(nextAdv.party.jumbo.maxHp, nextAdv.party.jumbo.hp + 50);
      }
      newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress - 25);
      nextAdv.combatLog.push(`⛺ 在營地篝火旁烤火休息。回復 50 點生命值，壓力大幅釋放。`);
    } 
    
    else if (targetNode.type === 'shop') {
      if (state.daughter.characterId === 'erica' && state.daughter.focus < 15 && !state.inventory.includes('casino_property')) {
        const rawEvent = AVG_EVENTS.casino_event;
        setState(prev => ({
          ...prev,
          daughter: newDaughter,
          adventure: nextAdv,
          currentEvent: rawEvent,
          currentEventStep: rawEvent.startNodeId
        }));
        return;
      }
      // 驛站，直接跳轉 store 面板
      setState(prev => ({
        ...prev,
        daughter: newDaughter,
        adventure: nextAdv,
        activeScreen: 'store'
      }));
      return;
    } 
    
    else if (targetNode.type === 'hidden') {
      let evKey = 'hidden_fortress';
      if (targetNode.name.includes('要塞')) evKey = 'hidden_fortress';
      else if (targetNode.name.includes('圖書館')) evKey = 'hidden_library';
      else if (targetNode.name.includes('黑市')) evKey = 'hidden_blackmarket';
      else if (targetNode.name.includes('妖精') || targetNode.name.includes('精靈')) evKey = 'hidden_fairy';
      
      const rawEvent = AVG_EVENTS[evKey] || AVG_EVENTS.hidden_fortress;
      setState(prev => ({
        ...prev,
        daughter: newDaughter,
        adventure: nextAdv,
        currentEvent: rawEvent,
        currentEventStep: rawEvent.startNodeId
      }));
      return;
    }
    
    else if (targetNode.type === 'event') {
      let evKey = '';
      if (targetNode.name.includes('診所')) {
        evKey = 'doctor_axxia';
      } else if (targetNode.name.includes('盲盒')) {
        evKey = 'blackmarket_box';
      } else if (targetNode.name.includes('少校')) {
        evKey = 'jaks_patrol';
      } else {
        // 一般隨機事件節點
        const isHonghua = state.daughter.characterId === 'honghua';
        const hasBinlang = state.inventory.some(item => item.startsWith('binlang_'));
        if (isHonghua && hasBinlang && Math.random() < 0.5) {
          evKey = 'temple_event';
        } else {
          const sum = nodeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const choices = ['noble_crest', 'mist_forest', 'tactics_test'];
          evKey = choices[sum % 3];
        }
      }
      
      const rawEvent = AVG_EVENTS[evKey] || AVG_EVENTS.noble_crest;
      
      setState(prev => ({
        ...prev,
        daughter: newDaughter,
        adventure: nextAdv,
        currentEvent: rawEvent,
        currentEventStep: rawEvent.startNodeId
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      daughter: newDaughter,
      adventure: nextAdv
    }));
  };

  const endAdventure = (isDefeat: boolean) => {
    if (!state.adventure) return;
    const rewardGold = isDefeat ? 0 : 200;
    
    const newLogs = [...state.logs, {
      id: Math.random().toString(),
      year: state.time.year,
      month: state.time.month,
      period: state.time.period,
      text: isDefeat 
        ? `☠️ 冒險失敗！女兒在蔚藍林地中受傷被送回家中，修行強制終止。`
        : `🏆 冒險結束！女兒成功探索蔚藍林地歸來，獲得金幣獎勵 200。`,
      type: 'info' as const
    }];

    setState((prev) => {
      const newDaughter = { ...prev.daughter };
      newDaughter.gold += rewardGold;
      newDaughter.focus = 100; // 回復滿行動力
      newDaughter.combatHp = newDaughter.attributes.stamina;

      return {
        ...prev,
        daughter: newDaughter,
        activeScreen: 'main',
        adventure: null,
        logs: newLogs
      };
    });
  };

  // --- AVG 事件觸發與執行 ---
  const triggerAVGEvent = (eventId: string) => {
    const ev = AVG_EVENTS[eventId];
    if (ev) {
      setState(prev => ({ ...prev, currentEvent: ev, currentEventStep: ev.startNodeId }));
    }
  };

  const executeAVGChoice = (choiceIndex: number) => {
    if (!state.currentEvent || !state.currentEventStep) return;
    const currentNode = state.currentEvent.nodes[state.currentEventStep];
    if (!currentNode) return;

    if (!currentNode.choices || currentNode.choices.length === 0) {
      setState(prev => ({
        ...prev,
        currentEvent: null,
        currentEventStep: null
      }));
      return;
    }

    const choice = currentNode.choices[choiceIndex];
    if (!choice) return;

    // 執行選擇效果
    const result = choice.effect(state);
    
    setState(prev => {
      const newDaughter = { ...prev.daughter };
      const newInventory = [...prev.inventory];
      let newScreen = prev.activeScreen;
      let nextStep: string | null = choice.nextId || null;
      let updatedAdventure = prev.adventure ? { ...prev.adventure } : null;

      if (result.rewards) {
        const rew = result.rewards;
        if (rew.gold) newDaughter.gold = Math.max(0, newDaughter.gold + rew.gold);
        if (rew.focus) newDaughter.focus = Math.max(0, newDaughter.focus + rew.focus);
        
        // 增減屬性
        Object.entries(rew).forEach(([key, val]) => {
          if (key in newDaughter.attributes && typeof val === 'number') {
            const attrKey = key as keyof typeof newDaughter.attributes;
            if (attrKey === 'stress') {
              newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + val);
            } else {
              newDaughter.attributes[attrKey] = Math.max(0, newDaughter.attributes[attrKey] + val);
            }
          }
        });

        // 增減好感度
        if (!newDaughter.bonds) {
          newDaughter.bonds = { clover: 0, shanshan: 0, xuewu: 0 };
        }
        if (rew.cloverBond) {
          newDaughter.bonds.clover = Math.min(100, Math.max(0, (newDaughter.bonds.clover || 0) + rew.cloverBond));
        }
        if (rew.shanshanBond) {
          newDaughter.bonds.shanshan = Math.min(100, Math.max(0, (newDaughter.bonds.shanshan || 0) + rew.shanshanBond));
        }
        if (rew.xuewuBond) {
          newDaughter.bonds.xuewu = Math.min(100, Math.max(0, (newDaughter.bonds.xuewu || 0) + rew.xuewuBond));
        }

        if (rew.hp) {
          newDaughter.combatHp = Math.max(0, newDaughter.combatHp + rew.hp);
          if (updatedAdventure) {
            updatedAdventure.daughterHp = Math.max(0, updatedAdventure.daughterHp + rew.hp);
          }
        }
        if (rew.addInventory) newInventory.push(rew.addInventory);
        if (rew.addInventories) {
          rew.addInventories.forEach((item: string) => newInventory.push(item));
        }
        if (rew.removeInventory) {
          const idx = newInventory.indexOf(rew.removeInventory);
          if (idx > -1) newInventory.splice(idx, 1);
        }
        if (rew.hpRestoreMax) {
          newDaughter.combatHp = newDaughter.attributes.stamina;
          if (updatedAdventure) {
            updatedAdventure.daughterHp = updatedAdventure.daughterMaxHp;
          }
        }
        if (rew.magicSkill) newDaughter.attributes.magicSkill += rew.magicSkill;
        if (rew.addTacticsUnlock) {
          newInventory.push('jumbo_combo_unlocked');
        }

        // 觸發戰鬥
        if (rew.triggerCombat && updatedAdventure) {
          // 將當前戰鬥載入 AdventureState 狀態
          updatedAdventure.status = 'fighting';
          updatedAdventure.nodes.find(n => n.id === updatedAdventure!.currentNodeId)!.monster = rew.triggerCombat;
          newScreen = 'adventure';
        }
      }

      const updatedLogs = [...prev.logs];
      if (result.log) {
        updatedLogs.push({
          id: Math.random().toString(),
          year: prev.time.year,
          month: prev.time.month,
          period: prev.time.period,
          text: `【事件選擇】${result.log}`,
          type: 'event'
        });
      }

      // 如果有 nextDialogId，導航至該節點
      if (result.nextDialogId) {
        nextStep = result.nextDialogId;
      }

      // 檢查是否結束對話
      const isEnd = !nextStep || !prev.currentEvent!.nodes[nextStep];

      if (isEnd && prev.currentEvent && prev.currentEvent.id === 'jaks_patrol' && updatedAdventure && updatedAdventure.status === 'exploring') {
        newDaughter.gold += 300;
        newDaughter.focus = 100;
        newDaughter.combatHp = newDaughter.attributes.stamina;
        newScreen = 'main';
        updatedAdventure = null;
        updatedLogs.push({
          id: Math.random().toString(),
          year: prev.time.year,
          month: prev.time.month,
          period: prev.time.period,
          text: `🏆 冒險成功！藉由智慧與高雅氣質說服了傑克斯少校，成功探索蔚藍林地，獲得獎勵金幣 300！`,
          type: 'info' as const
        });
      }

      // 檢查並解鎖好感度成就
      const newUnlockedAchievements = [...(prev.unlockedAchievements || [])];
      if (newDaughter.bonds) {
        if (newDaughter.bonds.clover >= 100 && !newUnlockedAchievements.includes('良師友誼')) {
          newUnlockedAchievements.push('良師友誼');
          updatedLogs.push({
            id: Math.random().toString(),
            year: prev.time.year,
            month: prev.time.month,
            period: prev.time.period,
            text: `🏆 解鎖成就：【良師友誼】（與四葉草好感度達到 100）！`,
            type: 'event'
          });
        }
        if (newDaughter.bonds.xuewu >= 100 && !newUnlockedAchievements.includes('永遠的學院生')) {
          newUnlockedAchievements.push('永遠的學院生');
          updatedLogs.push({
            id: Math.random().toString(),
            year: prev.time.year,
            month: prev.time.month,
            period: prev.time.period,
            text: `🏆 解鎖成就：【永遠的學院生】（與雪舞好感度達到 100）！`,
            type: 'event'
          });
        }
      }

      return {
        ...prev,
        daughter: newDaughter,
        inventory: newInventory,
        activeScreen: newScreen,
        logs: updatedLogs,
        currentEvent: isEnd ? null : prev.currentEvent,
        currentEventStep: isEnd ? null : nextStep,
        unlockedAchievements: newUnlockedAchievements,
        adventure: updatedAdventure
      };
    });
  };

  const toggleCheatMode = () => {
    setState((prev) => {
      const mode = !prev.cheatMode;
      const updatedDaughter = { ...prev.daughter };
      if (mode) {
        updatedDaughter.gold = 99999;
        updatedDaughter.attributes.stamina = 999;
        updatedDaughter.attributes.strength = 999;
        updatedDaughter.attributes.intelligence = 999;
        updatedDaughter.attributes.charisma = 999;
        updatedDaughter.attributes.morality = 999;
        updatedDaughter.attributes.piety = 999;
        updatedDaughter.attributes.sensitivity = 999;
        updatedDaughter.attributes.combatSkill = 999;
        updatedDaughter.attributes.magicSkill = 999;
        updatedDaughter.attributes.reputation = 999;
        updatedDaughter.attributes.sin = 0;
        updatedDaughter.attributes.elegance = 999;
        updatedDaughter.attributes.art = 999;
        updatedDaughter.focus = 999;
        updatedDaughter.maxFocus = 999;
        updatedDaughter.combatHp = 999;
      }
      return {
        ...prev,
        cheatMode: mode,
        daughter: updatedDaughter
      };
    });
  };

  const unlockAllProtagonists = () => {
    setState((prev) => ({
      ...prev,
      unlockedCharacters: ['honghua', 'erica', 'emilia']
    }));
  };

  const eatRiceCake = () => {
    setState((prev) => {
      if (!prev.inventory.includes('barrel_rice_cake')) return prev;
      
      const newDaughter = { ...prev.daughter };
      const hpRecover = Math.round(newDaughter.attributes.stamina * 0.5);
      newDaughter.combatHp = Math.min(newDaughter.attributes.stamina, newDaughter.combatHp + hpRecover);
      newDaughter.focus = Math.min(newDaughter.maxFocus, newDaughter.focus + 50);

      const newInventory = [...prev.inventory];
      const idx = newInventory.indexOf('barrel_rice_cake');
      if (idx > -1) {
        newInventory.splice(idx, 1);
      }

      let updatedAdventure = null;
      if (prev.adventure) {
        updatedAdventure = {
          ...prev.adventure,
          daughterHp: Math.min(prev.adventure.daughterMaxHp, prev.adventure.daughterHp + hpRecover),
          satiated: true,
          combatLog: [...prev.adventure.combatLog, `🍱 女兒食用了「特級桶仔米糕」，回復了 ${hpRecover} 點 HP 與 50 點專注度，並獲得飽腹 Buff（防禦 +10，受擊傷害減免）！`]
        };
      }

      const newLogs = [...prev.logs, {
        id: Math.random().toString(),
        year: prev.time.year,
        month: prev.time.month,
        period: prev.time.period,
        text: `🍱 女兒食用了「特級桶仔米糕」，感覺體力充沛。`,
        type: 'info' as const
      }];

      return {
        ...prev,
        daughter: newDaughter,
        inventory: newInventory,
        adventure: updatedAdventure,
        logs: newLogs
      };
    });
  };

  // 重玩 / 重啟週目 (NG+)
  const restartGame = () => {
    setState(prev => ({
      ...prev,
      activeScreen: 'main',
      logs: [],
      currentEvent: null,
      currentEventStep: null,
      adventure: null,
      schedule: null,
      inventory: []
    }));
  };

  const saveGame = () => {
    localStorage.setItem('honghua_factory_save', JSON.stringify({
      daughter: state.daughter,
      time: state.time,
      schedule: state.schedule,
      inventory: state.inventory,
      activeScreen: state.activeScreen,
      logs: state.logs,
      currentEvent: state.currentEvent,
      currentEventStep: state.currentEventStep,
      adventure: state.adventure
    }));
    alert('遊戲存檔成功！');
  };

  const loadGame = () => {
    const raw = localStorage.getItem('honghua_factory_save');
    if (!raw) {
      alert('沒有找到任何存檔！');
      return;
    }
    const data = JSON.parse(raw);
    setState(prev => ({
      ...prev,
      ...data
    }));
    alert('讀取存檔成功！');
  };

  const loadGameFromData = (data: Partial<GameState>) => {
    setState(prev => ({
      ...prev,
      ...data
    }));
  };

  const performStreetPerformance = () => {
    if (state.daughter.fatherBackground !== 'bard') return;
    const newDaughter = { ...state.daughter };
    const bonus = Math.round(newDaughter.attributes.art * 0.15);
    const goldEarned = 35 + bonus;
    newDaughter.gold += goldEarned;
    newDaughter.attributes.charisma = Math.min(999, newDaughter.attributes.charisma + 4);
    newDaughter.attributes.art = Math.min(999, newDaughter.attributes.art + 3);
    newDaughter.attributes.stress = Math.min(999, newDaughter.attributes.stress + 3);

    const logId = Math.random().toString();
    const newLogs = [...state.logs, {
      id: logId,
      year: state.time.year,
      month: state.time.month,
      period: state.time.period,
      text: `🎸 女兒進行街頭賣藝：獲得魅力+4, 氣質+3, 疲勞+3, 獲得打賞 ${goldEarned} G (包含氣質加成 ${bonus} G)！`,
      type: 'stat_up' as const
    }];

    setState(prev => ({
      ...prev,
      daughter: newDaughter,
      logs: newLogs
    }));
  };

  const resolveCombatVictory = (remainingHp: number, goldReward: number) => {
    setState((prev) => {
      if (!prev.adventure) return prev;
      const nextAdv = { ...prev.adventure };
      nextAdv.status = 'exploring';
      nextAdv.daughterHp = remainingHp;
      nextAdv.combatLog = [...nextAdv.combatLog, `🎉 戰鬥勝利！獲得金幣 ${goldReward} G。女兒剩餘 HP: ${remainingHp}。`];
      
      const newDaughter = { ...prev.daughter };
      newDaughter.gold += goldReward;
      newDaughter.combatHp = remainingHp;
      
      const currentNode = prev.adventure.nodes.find(n => n.id === prev.adventure!.currentNodeId);
      const isBoss = currentNode?.type === 'boss';

      let newScreen = prev.activeScreen;
      let logs = [...prev.logs];
      let updatedAdventure: any = nextAdv;

      if (isBoss) {
        logs.push({
          id: Math.random().toString(),
          year: prev.time.year,
          month: prev.time.month,
          period: prev.time.period,
          text: `👑 討伐首領成功！順利完成「蔚藍邊境森林」修行！獲得金幣 300！`,
          type: 'info'
        });
        newDaughter.gold += 300;
        newDaughter.focus = 100;
        newDaughter.combatHp = newDaughter.attributes.stamina;
        newScreen = 'main';
        updatedAdventure = null;
      }

      return {
        ...prev,
        daughter: newDaughter,
        adventure: updatedAdventure,
        activeScreen: newScreen,
        logs
      };
    });
  };

  const resolveCombatDefeat = () => {
    setState((prev) => {
      if (!prev.adventure) return prev;
      const newLogs = [...prev.logs, {
        id: Math.random().toString(),
        year: prev.time.year,
        month: prev.time.month,
        period: prev.time.period,
        text: `☠️ 戰鬥力竭！被魔物擊倒送回王城，修行強制結束。`,
        type: 'info' as const
      }];

      const newDaughter = { ...prev.daughter };
      newDaughter.focus = 100;
      newDaughter.combatHp = Math.round(newDaughter.attributes.stamina * 0.2);

      return {
        ...prev,
        daughter: newDaughter,
        activeScreen: 'main',
        adventure: null,
        logs: newLogs
      };
    });
  };

  const resolveFestival = (_victory: boolean, goldPrize: number, repPrize: number, logText: string, consumedItems?: string[]) => {
    setState((prev) => {
      const newDaughter = { ...prev.daughter };
      newDaughter.gold = Math.max(0, newDaughter.gold + goldPrize);
      newDaughter.attributes.reputation = Math.max(0, newDaughter.attributes.reputation + repPrize);

      let newInventory = [...prev.inventory];
      if (consumedItems && consumedItems.length > 0) {
        consumedItems.forEach((itemId) => {
          const idx = newInventory.indexOf(itemId);
          if (idx > -1) {
            newInventory.splice(idx, 1);
          }
        });
      }

      const logId = Math.random().toString();
      const nextMonth = 11;
      const nextYear = prev.time.year;
      
      const newLogs = [...prev.logs, {
        id: logId,
        year: prev.time.year,
        month: prev.time.month,
        period: 'late' as const,
        text: logText,
        type: 'event' as const
      }];

      return {
        ...prev,
        daughter: newDaughter,
        inventory: newInventory,
        time: { year: nextYear, month: nextMonth, period: 'early' as const },
        activeScreen: 'main' as const,
        logs: newLogs
      };
    });
  };

  const consumeItem = (itemId: string) => {
    setState((prev) => {
      const idx = prev.inventory.indexOf(itemId);
      if (idx === -1) return prev;
      const newInventory = [...prev.inventory];
      newInventory.splice(idx, 1);
      return {
        ...prev,
        inventory: newInventory
      };
    });
  };

  const resolveCombatReunion = (sisterId: string) => {
    setState((prev) => {
      const reunionItem = `${sisterId}_reunited`;
      const newInventory = [...prev.inventory];
      if (!newInventory.includes(reunionItem)) {
        newInventory.push(reunionItem);
      }

      const newUnlocked = [...prev.unlockedCharacters];
      if (!newUnlocked.includes(sisterId as CharacterId)) {
        newUnlocked.push(sisterId as CharacterId);
      }

      const sisterName = sisterId === 'erica' ? '艾莉卡' : sisterId === 'emilia' ? '艾蜜莉亞' : '紅花';
      const logId = Math.random().toString();
      const newLogs = [...prev.logs, {
        id: logId,
        year: prev.time.year,
        month: prev.time.month,
        period: prev.time.period,
        text: `✨ 命運的相逢：與遺失的王女【${sisterName}】在修行中成功相認！`,
        type: 'event' as const
      }];

      const eventId = `${sisterId}_reunion_avg`;
      const ev = AVG_EVENTS[eventId];

      return {
        ...prev,
        inventory: newInventory,
        unlockedCharacters: newUnlocked,
        logs: newLogs,
        adventure: null,
        activeScreen: 'main' as const,
        currentEvent: ev || null,
        currentEventStep: ev ? ev.startNodeId : null
      };
    });
  };

  return (
    <GameContext.Provider
      value={{
        state,
        setScreen,
        initGame,
        setSchedule,
        startScheduleExecution,
        executeNextPeriod,
        finishExecution,
        buyItem,
        talkToDaughter,
        changeOutfit,
        startAdventure,
        stepAdventure,
        endAdventure,
        triggerAVGEvent,
        executeAVGChoice,
        toggleCheatMode,
        restartGame,
        saveGame,
        loadGame,
        loadGameFromData,
        performStreetPerformance,
        resolveCombatVictory,
        resolveCombatDefeat,
        unlockAllProtagonists,
        eatRiceCake,
        resolveFestival,
        consumeItem,
        resolveCombatReunion
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
