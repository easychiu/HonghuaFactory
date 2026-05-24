import React, { createContext, useContext, useState, useEffect } from 'react';
import type { GameState, Daughter, CharacterId, FatherBackground, Activity, Item, AdventureMapNode, PeriodType, Monster, AdventureAreaId } from '../types';
import { COURSES } from '../data/courses';
import { AVG_EVENTS } from '../data/events';
import { determineEnding } from '../data/endings';
import { getDaughterPersonality } from '../utils/avatar';

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
  },
  {
    id: 'refine_ore',
    name: '精煉礦石',
    description: '在野外冒險修行中獲得的特殊礦石，可用於在胡村姑的木工作坊精煉升級武器與防具。',
    price: 300,
    type: 'book',
    statChanges: {}
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
const AREA_CONFIG: Record<AdventureAreaId, { name: string; debuffName: string; debuffDescription: string; battleMonstersL1: Monster[]; battleMonstersL2: Monster[]; bossScale: { hp: number; attack: number; defense: number } }> = {
  betel_forest: {
    name: '荖葉林',
    debuffName: '迷霧侵蝕',
    debuffDescription: '高層地帶的濕冷迷霧會侵蝕體力：進入第 4 層以上戰鬥節點時，HP -10。',
    battleMonstersL1: [
      { name: '迷霧幽靈', hp: 70, maxHp: 70, attack: 12, defense: 5, goldReward: 60, expReward: 18, behaviorPattern: 'aggressive' },
      { name: '林地史萊姆', hp: 60, maxHp: 60, attack: 10, defense: 4, goldReward: 50, expReward: 15, behaviorPattern: 'standard' },
      { name: '荖葉巨蛛', hp: 75, maxHp: 75, attack: 11, defense: 6, goldReward: 58, expReward: 18, behaviorPattern: 'standard' }
    ],
    battleMonstersL2: [
      { name: '迷霧幽靈群首', hp: 105, maxHp: 105, attack: 19, defense: 7, goldReward: 95, expReward: 30, behaviorPattern: 'aggressive' },
      { name: '荖葉林掠食獸', hp: 110, maxHp: 110, attack: 18, defense: 8, goldReward: 90, expReward: 30, behaviorPattern: 'standard' }
    ],
    bossScale: { hp: 0.95, attack: 1.0, defense: 0.95 }
  },
  naval_border: {
    name: '海軍邊境',
    debuffName: '砲火威壓',
    debuffDescription: '高層戰區砲火與海風壓制施法：進入第 4 層以上戰鬥節點時，MP -8。',
    battleMonstersL1: [
      { name: '黑市保鏢', hp: 68, maxHp: 68, attack: 13, defense: 5, goldReward: 62, expReward: 18, behaviorPattern: 'aggressive' },
      { name: '港灣巡邏兵', hp: 64, maxHp: 64, attack: 12, defense: 6, goldReward: 55, expReward: 16, behaviorPattern: 'standard' },
      { name: '走私刀手', hp: 72, maxHp: 72, attack: 14, defense: 4, goldReward: 64, expReward: 19, behaviorPattern: 'aggressive' }
    ],
    battleMonstersL2: [
      { name: '邊境砲兵隊長', hp: 108, maxHp: 108, attack: 20, defense: 7, goldReward: 96, expReward: 30, behaviorPattern: 'aggressive' },
      { name: '黑潮突擊隊', hp: 112, maxHp: 112, attack: 19, defense: 8, goldReward: 94, expReward: 30, behaviorPattern: 'standard' }
    ],
    bossScale: { hp: 1.0, attack: 1.08, defense: 1.0 }
  },
  royal_ruins: {
    name: '皇家遺跡',
    debuffName: '古咒纏身',
    debuffDescription: '遺跡高層殘留詛咒擾亂精神：進入第 4 層以上戰鬥節點時，疲勞 +10。',
    battleMonstersL1: [
      { name: '偽王親衛隊', hp: 72, maxHp: 72, attack: 13, defense: 6, goldReward: 64, expReward: 20, behaviorPattern: 'boss' },
      { name: '遺跡魔像', hp: 80, maxHp: 80, attack: 11, defense: 8, goldReward: 66, expReward: 20, behaviorPattern: 'standard' },
      { name: '詛咒學徒', hp: 66, maxHp: 66, attack: 14, defense: 5, goldReward: 60, expReward: 19, behaviorPattern: 'aggressive' }
    ],
    battleMonstersL2: [
      { name: '偽王禁衛長', hp: 116, maxHp: 116, attack: 20, defense: 9, goldReward: 98, expReward: 32, behaviorPattern: 'boss' },
      { name: '深層遺跡魔像', hp: 122, maxHp: 122, attack: 18, defense: 10, goldReward: 100, expReward: 32, behaviorPattern: 'standard' }
    ],
    bossScale: { hp: 1.08, attack: 1.03, defense: 1.08 }
  }
};

const pickRandom = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
const withLayerDifficulty = (monster: Monster, layerMultiplier: number): Monster => ({
  ...monster,
  hp: Math.round(monster.hp * layerMultiplier),
  maxHp: Math.round(monster.maxHp * layerMultiplier),
  attack: Math.round(monster.attack * layerMultiplier),
  defense: Math.round(monster.defense * layerMultiplier),
  goldReward: Math.round(monster.goldReward * (1 + (layerMultiplier - 1) * 0.6)),
  });

// 輔助函式：打亂陣列
const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// 輔助函式：取得修行區域主題化節點名稱
const getRandomNodeName = (type: 'chest' | 'spring' | 'shop' | 'rest' | 'event', areaId: AdventureAreaId): string => {
  const names: Record<AdventureAreaId, Record<typeof type, string[]>> = {
    betel_forest: {
      chest: ['林地寶箱', '遺忘寶箱', '老舊木箱'],
      spring: ['生命泉水', '遠古泉水', '林間清泉'],
      shop: ['旅行商販', '修行驛站', '林間補給點'],
      rest: ['營地營火', '林間宿營區', '安全避難所'],
      event: ['古木祭壇', '奇異巨石', '神秘花圈']
    },
    naval_border: {
      chest: ['軍用物資箱', '走私保險箱', '遺留補給箱'],
      spring: ['戰壕清泉', '海角甘泉', '峭壁水源'],
      shop: ['補給驛站', '軍需小販', '邊哨交易所'],
      rest: ['哨站營火', '臨時掩體', '避風港口'],
      event: ['廢棄碉堡', '海巡浮標', '擱淺走私船']
    },
    royal_ruins: {
      chest: ['遺跡寶藏', '王室密藏', '古老金箱'],
      spring: ['聖殿泉水', '魔能之源', '洗禮聖水'],
      shop: ['廢墟黑市', '古物商販', '殘垣補給點'],
      rest: ['遺跡避難所', '石殿篝火', '安全殘垣'],
      event: ['銘文石碑', '崩塌祭壇', '神秘石雕']
    }
  };
  const list = names[areaId][type];
  return list[Math.floor(Math.random() * list.length)];
};

export const generateAdventureMap = (
  areaId: AdventureAreaId,
  daughter: Daughter,
  inventory: string[] = []
): AdventureMapNode[] => {
  interface NodeContent {
    type: AdventureMapNode['type'];
    name: string;
    monster?: Monster;
  }

  const nodes: AdventureMapNode[] = [];
  const areaCfg = AREA_CONFIG[areaId];
  const dad = daughter.fatherBackground;
  const _charId = daughter.characterId;

  // 取得備選的普通魔物 (用於替代未觸發的姊妹戰鬥)
  const getReplacementMonster = (multiplier: number): Monster => {
    const baseMonster = pickRandom(areaCfg.battleMonstersL2);
    return withLayerDifficulty(baseMonster, multiplier);
  };

  // Layer 0: 起點
  nodes.push({
    id: '0_0',
    layer: 0,
    index: 0,
    type: 'start',
    name: `${areaCfg.name}起點`,
    cleared: true,
    connectedTo: ['1_0', '1_1', '1_2']
  });

  // Layer 1 Contents: 1 battle, 1 chest/spring/event, 1 shop/event
  const layer1Monster = withLayerDifficulty(pickRandom(areaCfg.battleMonstersL1), 1.0);
  const l1TypeChoices1: Array<'chest' | 'spring' | 'event'> = ['chest', 'spring', 'event'];
  const l1Type1 = pickRandom(l1TypeChoices1);
  const l1TypeChoices2: Array<'shop' | 'event'> = ['shop', 'event'];
  const l1Type2 = pickRandom(l1TypeChoices2);

  const l1Contents: NodeContent[] = [
    { type: 'battle', monster: layer1Monster, name: `${layer1Monster.name} 巢穴` },
    { type: l1Type1, name: getRandomNodeName(l1Type1, areaId) },
    { type: l1Type2, name: getRandomNodeName(l1Type2, areaId) }
  ];
  const shuffledL1 = shuffleArray(l1Contents);

  // Add Layer 1 nodes
  nodes.push({
    id: '1_0', layer: 1, index: 0,
    type: shuffledL1[0].type, name: shuffledL1[0].name, cleared: false,
    connectedTo: ['2_0', '2_1'], monster: shuffledL1[0].monster
  });
  nodes.push({
    id: '1_1', layer: 1, index: 1,
    type: shuffledL1[1].type, name: shuffledL1[1].name, cleared: false,
    connectedTo: ['2_1', '2_2'], monster: shuffledL1[1].monster
  });
  nodes.push({
    id: '1_2', layer: 1, index: 2,
    type: shuffledL1[2].type, name: shuffledL1[2].name, cleared: false,
    connectedTo: ['2_2'], monster: shuffledL1[2].monster
  });

  // Layer 2 Hidden Node configuration
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

  const layer2Monster = withLayerDifficulty(pickRandom(areaCfg.battleMonstersL2), 1.15);
  const l2TypeChoices2: Array<'rest' | 'event' | 'spring'> = ['rest', 'event', 'spring'];
  const l2Type2 = pickRandom(l2TypeChoices2);

  const l2Contents: NodeContent[] = [
    { type: 'battle', monster: layer2Monster, name: `${layer2Monster.name} 防線` },
    { type: layer2HiddenType, name: layer2HiddenName },
    { type: l2Type2, name: getRandomNodeName(l2Type2, areaId) }
  ];
  const shuffledL2 = shuffleArray(l2Contents);

  // Add Layer 2 nodes
  nodes.push({
    id: '2_0', layer: 2, index: 0,
    type: shuffledL2[0].type, name: shuffledL2[0].name, cleared: false,
    connectedTo: ['3_0'], monster: shuffledL2[0].monster
  });
  nodes.push({
    id: '2_1', layer: 2, index: 1,
    type: shuffledL2[1].type, name: shuffledL2[1].name, cleared: false,
    connectedTo: ['3_0', '3_1', '3_2'], monster: shuffledL2[1].monster
  });
  nodes.push({
    id: '2_2', layer: 2, index: 2,
    type: shuffledL2[2].type, name: shuffledL2[2].name, cleared: false,
    connectedTo: ['3_2'], monster: shuffledL2[2].monster
  });

  // 根據當前主角 _charId 動態判定姊妹
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

  // 檢查是否滿足重逢條件
  const elegance = daughter.attributes.elegance;
  const art = daughter.attributes.art;
  const hasClue = inventory.some(i => i.includes('royal') || i.includes('crest') || i.includes('saber') || i.includes('clue'));
  const canReunite = elegance >= 150 || art >= 150 || hasClue;

  const sisterAActive = canReunite && !inventory.includes(`${sisterAId}_reunited`);
  const sisterBActive = canReunite && !inventory.includes(`${sisterBId}_reunited`);

  // Define Sister A / replacement
  let l3SisterContent: NodeContent;
  if (sisterAActive) {
    const sisterAMonster = getSisterMonster(sisterAId, 3);
    l3SisterContent = { type: 'battle', monster: sisterAMonster, name: sisterAMonster.name };
  } else {
    const replacementMonster = getReplacementMonster(1.25);
    l3SisterContent = { type: 'battle', monster: replacementMonster, name: `${replacementMonster.name} 巢穴` };
  }

  const l3TypeChoices1: Array<'spring' | 'chest' | 'event'> = ['spring', 'chest', 'event'];
  const l3Type1 = pickRandom(l3TypeChoices1);
  const l3TypeChoices2: Array<'shop' | 'rest'> = ['shop', 'rest'];
  const l3Type2 = pickRandom(l3TypeChoices2);

  const l3Contents: NodeContent[] = [
    l3SisterContent,
    { type: l3Type1, name: getRandomNodeName(l3Type1, areaId) },
    { type: l3Type2, name: getRandomNodeName(l3Type2, areaId) }
  ];
  const shuffledL3 = shuffleArray(l3Contents);

  // Add Layer 3 nodes
  nodes.push({
    id: '3_0', layer: 3, index: 0,
    type: shuffledL3[0].type, name: shuffledL3[0].name, cleared: false,
    connectedTo: ['4_0'], monster: shuffledL3[0].monster
  });
  nodes.push({
    id: '3_1', layer: 3, index: 1,
    type: shuffledL3[1].type, name: shuffledL3[1].name, cleared: false,
    connectedTo: ['4_0', '4_1'], monster: shuffledL3[1].monster
  });
  nodes.push({
    id: '3_2', layer: 3, index: 2,
    type: shuffledL3[2].type, name: shuffledL3[2].name, cleared: false,
    connectedTo: ['4_1'], monster: shuffledL3[2].monster
  });

  // Sister B / replacement
  let l4SisterContent: NodeContent;
  if (sisterBActive) {
    const sisterBMonster = getSisterMonster(sisterBId, 4);
    l4SisterContent = { type: 'battle', monster: sisterBMonster, name: sisterBMonster.name };
  } else {
    const replacementMonster = getReplacementMonster(1.35);
    l4SisterContent = { type: 'battle', monster: replacementMonster, name: `${replacementMonster.name} 哨卡` };
  }

  const l4TypeChoices0: Array<'rest' | 'spring' | 'event'> = ['rest', 'spring', 'event'];
  const l4Type0 = pickRandom(l4TypeChoices0);

  const l4Contents: NodeContent[] = [
    { type: l4Type0, name: getRandomNodeName(l4Type0, areaId) },
    l4SisterContent
  ];
  const shuffledL4 = shuffleArray(l4Contents);

  // Add Layer 4 nodes
  nodes.push({
    id: '4_0', layer: 4, index: 0,
    type: shuffledL4[0].type, name: shuffledL4[0].name, cleared: false,
    connectedTo: ['5_0'], monster: shuffledL4[0].monster
  });
  nodes.push({
    id: '4_1', layer: 4, index: 1,
    type: shuffledL4[1].type, name: shuffledL4[1].name, cleared: false,
    connectedTo: ['5_0'], monster: shuffledL4[1].monster
  });

  // Layer 5 Boss: normal squad leader by default, Jaks randomly after multiple runs
  const runCount = daughter.adventureCount || 0;
  let spawnCaptain = false;
  if (runCount >= 2) {
    spawnCaptain = Math.random() < 0.35;
  }

  let bossMonster: Monster;
  let bossNodeName: string;

  if (spawnCaptain) {
    bossNodeName = '👑 海軍少校 傑克斯';
    bossMonster = {
      name: '海軍少校 傑克斯',
      hp: Math.round(420 * areaCfg.bossScale.hp),
      maxHp: Math.round(420 * areaCfg.bossScale.hp),
      attack: Math.round(38 * areaCfg.bossScale.attack),
      defense: Math.round(20 * areaCfg.bossScale.defense),
      goldReward: 600,
      expReward: 150,
      behaviorPattern: 'boss'
    };
  } else {
    let normalBossName = '海軍伍長';
    if (areaId === 'betel_forest') {
      normalBossName = '荖葉林狂暴巨獸';
    } else if (areaId === 'naval_border') {
      normalBossName = '邊境防線伍長';
    } else if (areaId === 'royal_ruins') {
      normalBossName = '遺跡守衛什長';
    }

    bossNodeName = `👑 ${normalBossName}`;
    bossMonster = {
      name: normalBossName,
      hp: Math.round(300 * areaCfg.bossScale.hp),
      maxHp: Math.round(300 * areaCfg.bossScale.hp),
      attack: Math.round(28 * areaCfg.bossScale.attack),
      defense: Math.round(14 * areaCfg.bossScale.defense),
      goldReward: 300,
      expReward: 80,
      behaviorPattern: 'boss'
    };
  }

  nodes.push({
    id: '5_0',
    layer: 5,
    index: 0,
    type: 'boss',
    name: bossNodeName,
    cleared: false,
    connectedTo: [],
    monster: bossMonster
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
  executeNextPeriod: () => { monthFinished: boolean; statChanges?: Record<string, number> } | boolean;
  finishExecution: () => void;
  buyItem: (itemId: string) => { success: boolean; message: string };
  useItem: (itemId: string) => { success: boolean; message: string };
  talkToDaughter: (type: 'gentle' | 'scold' | 'praise' | 'headpat' | 'allowance') => void;
  changeOutfit: (outfit: Daughter['outfit']) => void;
  selectTitle: (title: string | null) => void;
  startAdventure: () => void;
  stepAdventure: (nodeId: string) => void;
  endAdventure: (isDefeat: boolean) => void;
  equipMember: (memberId: 'yv' | 'jumbo', itemId: string) => void;
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
  leaveAdventureShop: () => void;
  buyHeritageUpgrade: (upgradeId: string, cost: number) => { success: boolean; message: string };
  refineEquipment: (itemId: string) => { success: boolean; message: string };
  addDiaryMilestone: (milestoneId: string) => void;
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
    const unlockedItems = local ? (JSON.parse(local).unlockedItems || []) : [];
    const stardust = local ? (JSON.parse(local).stardust || 0) : 0;
    const heritageUpgrades = local ? (JSON.parse(local).heritageUpgrades || {}) : {};
    
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
        isSick: false,
        isRebellious: false,
        bonds: {
          clover: 0,
          shanshan: 0,
          xuewu: 0
        },
        adventureCount: 0,
        selectedTitle: null,
        refineLevels: {},
        diaryMilestones: []
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
      unlockedAchievements: achievements,
      unlockedItems: unlockedItems,
      stardust: stardust,
      heritageUpgrades: heritageUpgrades,
      seasonalEvent: null
    };
  });

  // 當週目解鎖與成就更新時寫入 LocalStorage
  useEffect(() => {
    localStorage.setItem('honghua_factory_ng', JSON.stringify({
      unlockedCharacters: state.unlockedCharacters,
      completedEndings: state.completedEndings,
      unlockedAchievements: state.unlockedAchievements,
      unlockedItems: state.unlockedItems || [],
      stardust: state.stardust || 0,
      heritageUpgrades: state.heritageUpgrades || {}
    }));
  }, [
    state.unlockedCharacters,
    state.completedEndings,
    state.unlockedAchievements,
    state.unlockedItems,
    state.stardust,
    state.heritageUpgrades
  ]);

  const checkAchievements = (
    daughter: Daughter,
    inventory: string[],
    unlockedAchievements: string[],
    logs: any[],
    year: number,
    month: number,
    period: PeriodType
  ): { unlocked: string[]; logs: any[]; updated: boolean } => {
    let updated = false;
    const newUnlocked = [...unlockedAchievements];
    const newLogs = [...logs];

    const trigger = (id: string, nameText: string, desc: string, bonus: string) => {
      if (!newUnlocked.includes(id)) {
        newUnlocked.push(id);
        updated = true;
        newLogs.push({
          id: Math.random().toString(),
          year,
          month,
          period,
          text: `🏆 解鎖成就：【${nameText}】（${desc}）！下次開局將獲得加成效果：${bonus}！`,
          type: 'event' as const
        });
      }
    };

    // 1. 第一次當爸爸
    trigger('第一次當爸爸', '第一次當爸爸', '養育女兒的第一步！進入遊戲並完成角色初始化。', '開局金幣 +100');

    // 2. 海路放行者
    if (inventory.includes('royal_saber')) {
      trigger('海路放行者', '海路放行者', '在冒險中免戰說服傑克斯少校，或在正面戰鬥中將其擊敗。', '初始戰術/戰技 +10');
    }

    // 3. 三王王女重聚
    const sistersCount = 1 + (inventory.includes('erica_reunited') ? 1 : 0) + (inventory.includes('emilia_reunited') ? 1 : 0) + (inventory.includes('honghua_reunited') ? 1 : 0);
    if (sistersCount === 3) {
      trigger('三王女重聚', '三王女重聚', '在單次培育中將三胞胎姊妹全部認親重聚。', '開局全屬性 +10');
    }

    // 4. 蔚藍大富翁
    if (daughter.gold >= 8000) {
      trigger('蔚藍大富翁', '蔚藍大富翁', '在培育過程中，女兒的持有金幣達到 8,000 以上。', '開局金幣 +300');
    }

    // 5. 良師友誼
    if ((daughter.bonds?.clover || 0) >= 100) {
      trigger('良師友誼', '良師友誼', '與同窗好友「四葉草」的好感度達到 100。', '初始力量/體力 +15');
    }

    // 6. 永遠的學院生
    if ((daughter.bonds?.xuewu || 0) >= 100) {
      trigger('永遠的學院生', '永遠的學院生', '與同窗好友「雪舞」的好感度達到 100。', '初始感受/魔法技術 +15');
    }

    // 7. 皇家圖書館學伴
    if ((daughter.bonds?.shanshan || 0) >= 100) {
      trigger('皇家圖書館學伴', '皇家圖書館學伴', '與同窗好友「珊珊」的好感度達到 100。', '初始智力/氣質 +15');
    }

    // 8. 逆天改命
    if (inventory.includes('casino_property')) {
      trigger('逆天改命', '逆天改命', '艾莉卡在驛站觸發的「黑鑽賭局」中憑強運盲擲獲勝，贏得賭場產權。', '初始防禦 +10，大成功率額外 +5%');
    }

    return { unlocked: newUnlocked, logs: newLogs, updated };
  };

  const advanceOnePeriod = (
    currentState: GameState,
    logText: string,
    updatedDaughterProps: Partial<Daughter> = {},
    inventoryOverride?: string[]
  ): GameState => {
    let nextInventory = inventoryOverride ? [...inventoryOverride] : [...currentState.inventory];
    let nextDaughter = {
      ...currentState.daughter,
      ...updatedDaughterProps,
    };
    
    if (updatedDaughterProps.attributes?.stamina !== undefined) {
      nextDaughter.combatHp = updatedDaughterProps.attributes.stamina;
    } else if (updatedDaughterProps.combatHp !== undefined) {
      nextDaughter.combatHp = updatedDaughterProps.combatHp;
    }

    const currentPeriod = currentState.time.period;
    const newLogs = [...currentState.logs];
    
    if (logText) {
      newLogs.push({
        id: Math.random().toString(),
        year: currentState.time.year,
        month: currentState.time.month,
        period: currentPeriod,
        text: logText,
        type: 'info' as const
      });
    }

    let nextPeriod: PeriodType = 'early';
    let nextMonth = currentState.time.month;
    let nextYear = currentState.time.year;
    let newAge = nextDaughter.age;
    let newScreen: GameState['activeScreen'] = 'main';
    let nextEvent = currentState.currentEvent;
    let nextEventStep = currentState.currentEventStep;
    let nextSeasonalEvent = currentState.seasonalEvent !== undefined ? currentState.seasonalEvent : null;

    if (currentPeriod === 'early') {
      nextPeriod = 'mid';
    } else if (currentPeriod === 'mid') {
      nextPeriod = 'late';
    } else {
      // period is 'late', month wraps!
      nextPeriod = 'early';
      nextMonth += 1;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }

      // 月底稅收結算
      if (currentState.seasonalEvent === 'tax') {
        if (nextDaughter.gold >= 80) {
          nextDaughter.gold -= 80;
          newLogs.push({
            id: Math.random().toString(),
            year: currentState.time.year,
            month: currentState.time.month,
            period: 'late',
            text: `🪙 【王國稅收】月末稅務官上門，依法扣除女兒 80 G 臨時稅金。`,
            type: 'info' as const
          });
        } else {
          nextDaughter.attributes.stress = Math.min(999, nextDaughter.attributes.stress + 25);
          newLogs.push({
            id: Math.random().toString(),
            year: currentState.time.year,
            month: currentState.time.month,
            period: 'late',
            text: `⚠️ 【稅金不足】女兒持有的金幣不足以支付 80 G 稅款！遭到官員斥責警告，壓力增加 25 點！`,
            type: 'stat_down' as const
          });
        }
      }

      // 新月份季節事件隨機判定
      nextSeasonalEvent = null;
      if (nextMonth !== 10 && Math.random() < 0.20) {
        const events = ['cold_wave', 'caravan', 'tax', 'harvest_blessing', 'royal_inspection'];
        nextSeasonalEvent = events[Math.floor(Math.random() * events.length)];
        
        const eventNames: Record<string, string> = {
          cold_wave: '❄️【季節事件：大寒流襲來】這個月異常寒冷。女兒上課疲勞額外 +3，但在家休息的減壓效果增加 5 點。',
          caravan: '🐫【季節事件：流浪商旅到訪】神秘的異國商隊抵達了城鎮。這個月皇家商店與黑市的商品售價一律享有 8 折特惠！',
          tax: '📜【季節事件：王國臨時徵稅】王國頒布了緊急徵稅令。本月所有商店商品漲價 20%！且月底將自動扣除 80 G 稅金（若金幣不足則女兒壓力增加 25）。',
          harvest_blessing: '🌾【季節事件：豐收女神的祝福】大地迎來豐饒之月。本月女兒進行所有打工活動的薪資回報增加 30%！',
          royal_inspection: '🏰【季節事件：皇家特使巡視】國王特使親臨學院考察。本月安排學習課程的正面屬性額外 +2，且道德感提升 3 點！'
        };

        newLogs.push({
          id: Math.random().toString(),
          year: nextYear,
          month: nextMonth,
          period: 'early',
          text: eventNames[nextSeasonalEvent],
          type: 'event' as const
        });
      }

      // Birthday aging
      if (nextMonth === nextDaughter.birthMonth) {
        newAge += 1;
        newLogs.push({
          id: Math.random().toString(),
          year: nextYear,
          month: nextMonth,
          period: 'early',
          text: `🎂 生日快樂！女兒 ${nextDaughter.name} 成長為 ${newAge} 歲了！`,
          type: 'info' as const
        });
      }

      nextDaughter.age = newAge;
      nextDaughter.combatHp = nextDaughter.attributes.stamina;
      nextDaughter.combatMp = nextDaughter.attributes.magicSkill * 2 + 10;

      // Quarterly checks (months 3, 6, 9, 12 being completed)
      const completedMonth = currentState.time.month;
      const isQuarterEnd = [3, 6, 9, 12].includes(completedMonth);
      if (isQuarterEnd) {
        const fundIndex = nextInventory.findIndex(item => item.startsWith('fortress_fund_'));
        if (fundIndex > -1) {
          const fundItem = nextInventory[fundIndex];
          const remainingQuarters = parseInt(fundItem.split('_')[2], 10);
          nextDaughter.gold += 500;
          nextInventory.splice(fundIndex, 1);
          if (remainingQuarters > 1) {
            nextInventory.push(`fortress_fund_${remainingQuarters - 1}`);
            newLogs.push({
              id: Math.random().toString(),
              year: currentState.time.year,
              month: completedMonth,
              period: 'late',
              text: `🪙 女兒收到了來自隱密要塞的本季軍餉資助 500 金幣！(剩餘 ${remainingQuarters - 1} 季)`,
              type: 'info' as const
            });
          } else {
            newLogs.push({
              id: Math.random().toString(),
              year: currentState.time.year,
              month: completedMonth,
              period: 'late',
              text: `🪙 女兒收到了來自隱密要塞的最後一季軍餉資助 500 金幣！資助合約已滿。`,
              type: 'info' as const
            });
          }
        }
        
        if (nextInventory.includes('casino_property')) {
          nextDaughter.gold += 1000;
          newLogs.push({
            id: Math.random().toString(),
            year: currentState.time.year,
            month: completedMonth,
            period: 'late',
            text: `🪙 女兒收到了來自黑鑽賭場的本季股權分紅 1000 金幣！`,
            type: 'info' as const
          });
        }
      }

      // 18歲大結局
      if (newAge >= 18) {
        const finalClues = nextInventory.filter(i => i.includes('crest') || i.includes('saber')).length;
        const sisters: string[] = [];
        if (nextInventory.includes('erica_reunited')) sisters.push('erica');
        if (nextInventory.includes('emilia_reunited')) sisters.push('emilia');
        if (nextInventory.includes('honghua_reunited')) sisters.push('honghua');

        const end = determineEnding(nextDaughter, currentState.completedEndings.length, finalClues, sisters);
        
        const newCompleted = [...currentState.completedEndings];
        if (!newCompleted.includes(end.id)) newCompleted.push(end.id);
        
        const newUnlocked = [...currentState.unlockedCharacters];
        if (!newUnlocked.includes('erica')) newUnlocked.push('erica');
        if ((sisters.length >= 2 || end.id === 'three_revolution' || end.id === 'royal_return') && !newUnlocked.includes('emilia')) {
          newUnlocked.push('emilia');
        }

        const { unlocked: achUnlocked, logs: checkedLogs } = checkAchievements(
          nextDaughter,
          nextInventory,
          currentState.unlockedAchievements || [],
          newLogs,
          currentState.time.year,
          currentState.time.month,
          'late'
        );

        const finalUnlockedAchievements = [...achUnlocked];
        const sistersCount = 1 + (nextInventory.includes('erica_reunited') ? 1 : 0) + (nextInventory.includes('emilia_reunited') ? 1 : 0) + (nextInventory.includes('honghua_reunited') ? 1 : 0);
        if (sistersCount === 3 && !finalUnlockedAchievements.includes('三王女重聚')) {
          finalUnlockedAchievements.push('三王女重聚');
          checkedLogs.push({
            id: Math.random().toString(),
            year: currentState.time.year,
            month: currentState.time.month,
            period: 'late',
            text: `🏆 解鎖成就：【三王女重聚】（在單次培育中將三胞胎姊妹全部認親重聚）！`,
            type: 'event' as const
          });
        }

        // 獲得星塵
        const getEndingStardustReward = (id: string): number => {
          const rare = ['infinite_observer', 'royal_return', 'three_revolution', 'phantom_thief_triplets'];
          const special = ['binlang_monopoly', 'lucky_lay_flat', 'shadow_cabinet'];
          const friendship = ['clover_mercenary', 'shanshan_court_aide', 'xuewu_magic_tower'];
          const bad = ['beggar', 'mob_boss', 'courtesan', 'housewife'];
          if (rare.includes(id)) return 100;
          if (special.includes(id)) return 60;
          if (friendship.includes(id)) return 40;
          if (bad.includes(id)) return 15;
          return 30;
        };
        const earnedStardust = getEndingStardustReward(end.id);
        const nextStardust = (currentState.stardust || 0) + earnedStardust;

        checkedLogs.push({
          id: Math.random().toString(),
          year: currentState.time.year,
          month: currentState.time.month,
          period: 'late',
          text: `🌌 【回憶結算】本次培育達成結局【${end.name}】！獲得了 ${earnedStardust} 點回憶星塵。可用於下一週目繼承商店中購買永久加成！`,
          type: 'event' as const
        });

        return {
          ...currentState,
          daughter: nextDaughter,
          inventory: nextInventory,
          time: { year: nextYear, month: nextMonth, period: 'early' },
          activeScreen: 'ending',
          logs: checkedLogs,
          completedEndings: newCompleted,
          unlockedCharacters: newUnlocked,
          unlockedAchievements: finalUnlockedAchievements,
          stardust: nextStardust,
          adventure: null
        };
      }

      // 月結算優先觸發：同窗好感階段事件與社交來信
      let triggeredEvent: any = null;
      let eventStep: string | null = null;

      // 檢查特定月份是否有同學社交來信
      const letterSchedule: Record<string, string> = {
        '1_9': 'letter_clover_1',
        '2_3': 'letter_shanshan_1',
        '2_9': 'letter_xuewu_1',
        '3_3': 'letter_father_1',
        '3_9': 'letter_clover_2',
        '4_3': 'letter_shanshan_2',
        '4_9': 'letter_xuewu_2',
        '5_3': 'letter_father_2'
      };
      const letterKey = `${nextYear}_${nextMonth}`;
      
      if (letterSchedule[letterKey]) {
        triggeredEvent = AVG_EVENTS[letterSchedule[letterKey]];
        eventStep = triggeredEvent?.startNodeId || null;
        newLogs.push({
          id: Math.random().toString(),
          year: nextYear,
          month: nextMonth,
          period: 'early',
          text: `✉️ 收到了一封來信：【${triggeredEvent.title}】，女兒正準備閱讀並回覆。`,
          type: 'event' as const
        });
      } else {
        // 沒有社交來信，進行普通的同窗好感事件或隨機冒險事件
        const bondStoryCandidates = [
          {
            key: 'bond_story_clover_30',
            cond: (nextDaughter.bonds?.clover || 0) >= 30 && !nextInventory.includes('bond_story_clover_30_done')
          },
          {
            key: 'bond_story_clover_60',
            cond: (nextDaughter.bonds?.clover || 0) >= 60 && !nextInventory.includes('bond_story_clover_60_done')
          },
          {
            key: 'bond_story_shanshan_30',
            cond: (nextDaughter.bonds?.shanshan || 0) >= 30 && !nextInventory.includes('bond_story_shanshan_30_done')
          },
          {
            key: 'bond_story_shanshan_60',
            cond: (nextDaughter.bonds?.shanshan || 0) >= 60 && !nextInventory.includes('bond_story_shanshan_60_done')
          },
          {
            key: 'bond_story_xuewu_30',
            cond: (nextDaughter.bonds?.xuewu || 0) >= 30 && !nextInventory.includes('bond_story_xuewu_30_done')
          },
          {
            key: 'bond_story_xuewu_60',
            cond: (nextDaughter.bonds?.xuewu || 0) >= 60 && !nextInventory.includes('bond_story_xuewu_60_done')
          }
        ];
        const firstBondStory = bondStoryCandidates.find(candidate => candidate.cond);
        if (firstBondStory) {
          triggeredEvent = AVG_EVENTS[firstBondStory.key];
          eventStep = triggeredEvent?.startNodeId || null;
        } else if (Math.random() < 0.25) {
          const eventKeys = Object.keys(AVG_EVENTS).filter(key => !key.startsWith('bond_story_') && !key.startsWith('letter_'));
          const randomKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
          const rawEvent = AVG_EVENTS[randomKey];
          if (rawEvent) {
            triggeredEvent = rawEvent;
            eventStep = rawEvent.startNodeId;
          }
        }
      }

      nextEvent = nextMonth === 10 ? null : triggeredEvent;
      nextEventStep = nextMonth === 10 ? null : eventStep;
      newScreen = nextMonth === 10 ? 'festival' : 'main';
    }

    const { unlocked: achUnlocked, logs: checkedLogs } = checkAchievements(
      nextDaughter,
      nextInventory,
      currentState.unlockedAchievements || [],
      newLogs,
      currentState.time.year,
      currentState.time.month,
      currentState.time.period
    );

    return {
      ...currentState,
      daughter: nextDaughter,
      inventory: nextInventory,
      time: { year: nextYear, month: nextMonth, period: nextPeriod },
      activeScreen: newScreen,
      currentEvent: nextEvent,
      currentEventStep: nextEventStep,
      unlockedAchievements: achUnlocked,
      adventure: null,
      logs: checkedLogs,
      seasonalEvent: nextSeasonalEvent
    };
  };

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

    let goldBonus = 0;
    let statBonus = 0;
    let reputationBonus = 0;
    let combatSkillBonus = 0;
    let intelligenceBonus = 0;
    let magicSkillBonus = 0;
    let sensitivityBonus = 0;
    let strengthBonus = 0;
    let staminaBonus = 0;
    let eleganceBonus = 0;

    const unlocked = state.unlockedAchievements || [];

    if (unlocked.includes('第一次當爸爸')) {
      goldBonus += 100;
    }
    if (unlocked.includes('海路放行者')) {
      intelligenceBonus += 10;
      combatSkillBonus += 10;
    }
    if (unlocked.includes('三王女重聚')) {
      statBonus += 10;
    }
    if (unlocked.includes('蔚藍大富翁')) {
      goldBonus += 300;
    }
    if (unlocked.includes('良師友誼')) {
      strengthBonus += 15;
      staminaBonus += 15;
    }
    if (unlocked.includes('永遠的學院生')) {
      sensitivityBonus += 15;
      magicSkillBonus += 15;
    }
    if (unlocked.includes('皇家圖書館學伴')) {
      intelligenceBonus += 15;
      eleganceBonus += 15;
    }
    if (unlocked.includes('逆天改命')) {
      staminaBonus += 15;
      reputationBonus += 20;
    }
    if (unlocked.includes('收穫祭之霸')) {
      reputationBonus += 50;
    }

    // 星塵商店 permanent 屬性加成
    const upgrades = state.heritageUpgrades || {};
    const hGoldLevel = upgrades['gold_boost'] || 0;
    const hStaminaLevel = upgrades['stamina_boost'] || 0;
    const hAllStatsLevel = upgrades['all_stats_boost'] || 0;
    const hPotionLevel = upgrades['heirloom_potion'] || 0;
    const hDaggerLevel = upgrades['heirloom_dagger'] || 0;

    goldBonus += hGoldLevel * 200;
    staminaBonus += hStaminaLevel * 15;
    statBonus += hAllStatsLevel * 8;

    // 圖鑑收集加成 (unlockedItems count)
    const unlockedItems = state.unlockedItems || [];
    let codexGold = 0;
    let codexStamina = 0;
    let codexStrength = 0;
    let codexIntelligence = 0;
    let codexCharisma = 0;
    let codexSensitivity = 0;
    let codexPiety = 0;
    let codexCombatSkill = 0;
    let codexMagicSkill = 0;
    let codexStressDiff = 0;

    if (unlockedItems.includes('steel_sword')) codexStrength += 2;
    if (unlockedItems.includes('silver_armor')) codexStamina += 5;
    if (unlockedItems.includes('royal_dress')) codexCharisma += 5;
    if (unlockedItems.includes('summer_dress')) codexStressDiff -= 5;
    if (unlockedItems.includes('royal_letter')) codexIntelligence += 5;
    if (unlockedItems.includes('old_lute')) codexSensitivity += 5;
    if (unlockedItems.includes('future_gp125')) codexGold += 100;
    if (unlockedItems.includes('giant_hammer')) codexStrength += 5;
    if (unlockedItems.includes('binlang_ice')) codexCombatSkill += 2;
    if (unlockedItems.includes('binlang_twin')) codexMagicSkill += 2;
    if (unlockedItems.includes('binlang_normal')) codexStamina += 5;
    if (unlockedItems.includes('barrel_rice_cake')) codexStamina += 5;
    if (unlockedItems.includes('holy_water')) codexPiety += 5;
    if (unlockedItems.includes('bm_dark_armor')) codexStamina += 5;
    if (unlockedItems.includes('bm_poison_dagger')) codexCombatSkill += 5;
    if (unlockedItems.includes('bm_cheap_gp125')) codexGold += 50;

    goldBonus += codexGold;

    const freshDaughter: Daughter = {
      name: name || (characterId === 'honghua' ? '紅花' : characterId === 'erica' ? '艾莉卡' : '艾蜜莉亞'),
      age: 10,
      birthMonth: birthMonth || 5,
      birthDay: birthDay || 20,
      attributes: {
        stamina: DEFAULT_ATTRIBUTES.stamina + statBonus + staminaBonus + codexStamina,
        strength: DEFAULT_ATTRIBUTES.strength + statBonus + strengthBonus + codexStrength,
        intelligence: DEFAULT_ATTRIBUTES.intelligence + statBonus + intelligenceBonus + codexIntelligence,
        charisma: DEFAULT_ATTRIBUTES.charisma + statBonus + codexCharisma,
        morality: DEFAULT_ATTRIBUTES.morality + statBonus,
        piety: DEFAULT_ATTRIBUTES.piety + statBonus + codexPiety,
        sensitivity: DEFAULT_ATTRIBUTES.sensitivity + statBonus + sensitivityBonus + codexSensitivity,
        stress: Math.max(0, DEFAULT_ATTRIBUTES.stress + codexStressDiff),
        combatSkill: DEFAULT_ATTRIBUTES.combatSkill + statBonus + combatSkillBonus + codexCombatSkill,
        magicSkill: DEFAULT_ATTRIBUTES.magicSkill + statBonus + magicSkillBonus + codexMagicSkill,
        reputation: DEFAULT_ATTRIBUTES.reputation + reputationBonus,
        sin: DEFAULT_ATTRIBUTES.sin,
        elegance: DEFAULT_ATTRIBUTES.elegance + statBonus + eleganceBonus,
        art: DEFAULT_ATTRIBUTES.art + statBonus
      },
      gold: 1500,
      relationship: 50,
      outfit: 'default',
      combatHp: 80,
      combatMp: 50,
      focus: 100,
      maxFocus: 100,
      avatarUrl: characterId === 'honghua' ? 'honghua' : defaultAvatar,
      characterId,
      fatherBackground,
      isSick: false,
      isRebellious: false,
      bonds: {
        clover: 0,
        shanshan: 0,
        xuewu: 0
      },
      adventureCount: 0,
      selectedTitle: null,
      refineLevels: {},
      diaryMilestones: []
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

    // 傳家寶開局贈送
    if (hPotionLevel > 0) startingInventory.push('holy_water');
    if (hDaggerLevel > 0) startingInventory.push('bm_poison_dagger');

    // 套用成就解鎖金幣加成
    freshDaughter.gold += goldBonus;

    freshDaughter.combatHp = freshDaughter.attributes.stamina;
    freshDaughter.combatMp = freshDaughter.attributes.magicSkill * 2 + 10;

    // 將所有初始裝備加入解鎖列表
    const newUnlockedItems = [...unlockedItems];
    startingInventory.forEach(item => {
      if (!newUnlockedItems.includes(item) && ITEMS.some(i => i.id === item)) {
        newUnlockedItems.push(item);
      }
    });

    // 自動解鎖第一檔成就「第一次當爸爸」
    const nextAchievements = [...unlocked];
    if (!nextAchievements.includes('第一次當爸爸')) {
      nextAchievements.push('第一次當爸爸');
    }

    setState((prev) => ({
      ...prev,
      daughter: freshDaughter,
      time: { year: 1, month: birthMonth, period: 'early' },
      schedule: null,
      inventory: startingInventory,
      unlockedItems: newUnlockedItems,
      unlockedAchievements: nextAchievements,
      activeScreen: 'main',
      logs: [
        {
          id: Math.random().toString(),
          year: 1,
          month: birthMonth,
          period: 'early',
          text: `收養了可愛的女兒 ${freshDaughter.name}。起點年齡：10歲。父親職業為【${
            fatherBackground === 'knight' ? '失落的騎士' : fatherBackground === 'scholar' ? '失落的文臣' : fatherBackground === 'merchant' ? '行商人' : '吟遊詩人'
          }】。開始培育妳的王女吧！${
            goldBonus > 0 || statBonus > 0 || strengthBonus > 0 || staminaBonus > 0 || intelligenceBonus > 0 || eleganceBonus > 0 || magicSkillBonus > 0 || sensitivityBonus > 0
              ? `（已套用多週目與星塵繼承傳承加成！）`
              : ''
          }`,
          type: 'info'
        }
      ],
      currentEvent: AVG_EVENTS.prologue,
      currentEventStep: 'start',
      adventure: null,
      cheatMode: false,
      seasonalEvent: null
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
  const executeNextPeriod = (): { monthFinished: boolean; statChanges?: Record<string, number> } | boolean => {
    if (state.currentEvent) return { monthFinished: false };
    if (!state.schedule) return { monthFinished: true };
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

    if (!activity) return { monthFinished: true };

    const newDaughter = { ...state.daughter };
    const newLogs = [...state.logs];
    const newInventory = [...state.inventory];
    const logId = Math.random().toString();
    let restGain = 0;
    let finalStatChanges: Record<string, number> = {};

    // --- 1. 叛逆期翹課/罷工判定 ---
    let isStrike = false;
    let strikeStatChanges: Record<string, number> = {};
    if (newDaughter.isRebellious && (activity.type === 'work' || activity.type === 'study')) {
      const strikeChance = 0.40; // 40% 機率
      if (Math.random() < strikeChance) {
        isStrike = true;
        const rollPlay = Math.random() < 0.5;
        if (rollPlay) {
          // 出門玩耍
          strikeStatChanges = { stress: -10, morality: -5, sin: 2 };
          newDaughter.relationship = Math.max(0, newDaughter.relationship - 2);
          newLogs.push({
            id: logId,
            year: state.time.year,
            month: state.time.month,
            period: currentPeriod,
            text: `😈 【叛逆罷工】女兒發脾氣不肯去【${activity.name}】，擅自跑去大街上玩耍！親密度 -2，道德 -5，罪孽 +2，壓力 -10。`,
            type: 'event'
          });
        } else {
          // 睡懶覺
          strikeStatChanges = { stress: -15 };
          newDaughter.relationship = Math.max(0, newDaughter.relationship - 1);
          newLogs.push({
            id: logId,
            year: state.time.year,
            month: state.time.month,
            period: currentPeriod,
            text: `😈 【叛逆罷工】女兒把房門鎖上，拒絕去【${activity.name}】，在房間睡了一整天懶覺！親密度 -1，壓力 -15。`,
            type: 'event'
          });
        }

        // 應用罷工屬性異動
        Object.entries(strikeStatChanges).forEach(([key, val]) => {
          const attrKey = key as keyof typeof newDaughter.attributes;
          if (attrKey === 'stress') {
            newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + val);
          } else {
            newDaughter.attributes[attrKey] = Math.max(0, newDaughter.attributes[attrKey] + val);
          }
        });
      }
    }

    // --- 2. 生病判定 ---
    let isSickFail = false;
    if (!isStrike && newDaughter.isSick && (activity.type === 'work' || activity.type === 'study')) {
      const sickFailChance = 0.80; // 80% 失敗機率
      if (Math.random() < sickFailChance) {
        isSickFail = true;
        let cost = activity.cost;
        if (newDaughter.fatherBackground === 'scholar' && activity.type === 'study') {
          const isHumanities = ['rhetoric', 'history', 'music_poetry', 'theology_art', 'etiquette'].includes(activity.id);
          if (isHumanities) {
            cost = Math.round(cost * 0.8);
          }
        }
        
        // 扣除學費（如果是上課且學費充足）
        if (cost <= newDaughter.gold) {
          newDaughter.gold = Math.max(0, newDaughter.gold - cost);
        } else {
          cost = 0;
        }
        
        strikeStatChanges = { stress: 3 };
        newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + 3);
        
        newLogs.push({
          id: logId,
          year: state.time.year,
          month: state.time.month,
          period: currentPeriod,
          text: `🤢 【生病養病】女兒生病勉強執行【${activity.name}】，半途支撐不住，只能躺下養病。${cost > 0 ? `扣除學費 ${cost} G，` : ''}未獲得任何屬性提升，疲勞度 +3。`,
          type: 'stat_down'
        });
      } else {
        newLogs.push({
          id: Math.random().toString(),
          year: state.time.year,
          month: state.time.month,
          period: currentPeriod,
          text: `🤢 【病中堅持】雖然女兒正生著病，但她咬緊牙關堅持完成了【${activity.name}】！`,
          type: 'info'
        });
      }
    }

    // --- 3. 休息與療癒生病判定 ---
    if (!isStrike && !isSickFail && newDaughter.isSick && activity.type === 'rest') {
      if (activity.id === 'rest_home') {
        if (Math.random() < 0.30) {
          newDaughter.isSick = false;
          newLogs.push({
            id: Math.random().toString(),
            year: state.time.year,
            month: state.time.month,
            period: currentPeriod,
            text: `🌸 在家靜養後，女兒的氣色好了許多，生病痊癒了！`,
            type: 'event'
          });
        } else {
          newLogs.push({
            id: Math.random().toString(),
            year: state.time.year,
            month: state.time.month,
            period: currentPeriod,
            text: `🌸 女兒在家休息養病，疲勞度減少，但身體依然有些虛弱。`,
            type: 'info'
          });
        }
      } else if (activity.id === 'rest_vacation') {
        newDaughter.isSick = false;
        newLogs.push({
          id: Math.random().toString(),
          year: state.time.year,
          month: state.time.month,
          period: currentPeriod,
          text: `🌸 度假散心讓女兒身心舒暢，生病完全康復了！`,
          type: 'event'
        });
      }
    }

    if (isStrike || isSickFail) {
      finalStatChanges = strikeStatChanges;
    } else {
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
        finalStatChanges = { stress: rest.statChanges.stress || 0 };
      } else {
        // 扣除學費，給予工作獎勵
        let finalGoldReward = activity.reward;
        
        // 行商老爸打工收入 +20%
        if (newDaughter.fatherBackground === 'merchant' && activity.type === 'work') {
          finalGoldReward = Math.round(finalGoldReward * 1.2);
        }

        // 豐收女神祝福打工薪資額外 +30%
        if (state.seasonalEvent === 'harvest_blessing' && activity.type === 'work') {
          finalGoldReward = Math.round(finalGoldReward * 1.3);
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
          finalStatChanges = { stress: rest.statChanges.stress || 0 };
        } else {
          // --- 判定成敗 ---
          // 大成功判定：艾莉卡基礎 30%，四葉草滿級 (clover >= 100) 額外 +20%
          const isErica = newDaughter.characterId === 'erica';
          let luckyChance = isErica ? 0.30 : 0.00;
          if (newDaughter.bonds && newDaughter.bonds.clover >= 100) {
            luckyChance += 0.20;
          }

          let finalStatChangesLocal = { ...activity.statChanges };
          let isSuccess = true;
          let logText = '';

          // 性格對大成功率及打工收益的特殊影響
          const daughterPersonality = getDaughterPersonality(newDaughter.attributes);
          if (daughterPersonality === '高冷學霸') {
            if (activity.type === 'study') {
              luckyChance += 0.10;
            }
            if (activity.type === 'work') {
              finalGoldReward = Math.round(finalGoldReward * 0.9);
            }
          } else if (daughterPersonality === '元氣女漢子') {
            if (['farm', 'woodshop', 'graveyard_guard'].includes(activity.id)) {
              luckyChance += 0.15;
            }
            if (activity.type === 'study') {
              luckyChance = Math.max(0, luckyChance - 0.10);
            }
          } else if (daughterPersonality === '多愁善感藝術家') {
            if (['music_poetry', 'theology_art'].includes(activity.id)) {
              luckyChance += 0.20;
            }
            finalStatChangesLocal.stress = (finalStatChangesLocal.stress || 0) + 2;
          } else if (daughterPersonality === '溫柔乖乖女') {
            if (['church_clean', 'maid_mansion'].includes(activity.id)) {
              luckyChance += 0.15;
            }
          } else if (daughterPersonality === '社交名媛') {
            if (['etiquette', 'rhetoric'].includes(activity.id)) {
              luckyChance += 0.15;
            }
            if (['maid_mansion', 'street_performance'].includes(activity.id)) {
              luckyChance += 0.10;
            }
          }

          // 季節隨機事件影響
          if (state.seasonalEvent === 'cold_wave') {
            if (activity.type === 'study') {
              finalStatChangesLocal.stress = (finalStatChangesLocal.stress || 0) + 3;
            }
            if (activity.id === 'rest_home') {
              finalStatChangesLocal.stress = (finalStatChangesLocal.stress || 0) - 5;
            }
          } else if (state.seasonalEvent === 'royal_inspection') {
            if (activity.type === 'study') {
              Object.entries(finalStatChangesLocal).forEach(([key, val]) => {
                if (key !== 'stress' && (val || 0) > 0) {
                  (finalStatChangesLocal as any)[key] = (val || 0) + 2;
                }
              });
              finalStatChangesLocal.morality = (finalStatChangesLocal.morality || 0) + 3;
            }
          }

          const isLuckySuccess = Math.random() < luckyChance;
          
          if (isLuckySuccess) {
            // 強運大成功
            isSuccess = true;
            // 屬性獲得兩倍，且不增加疲勞！
            Object.entries(activity.statChanges).forEach(([key, val]) => {
              const attrKey = key as keyof typeof activity.statChanges;
              if (attrKey === 'stress') {
                finalStatChangesLocal.stress = 0; // 不增加疲勞
              } else if ((val || 0) > 0) {
                (finalStatChangesLocal as any)[attrKey] = (val || 0) * 2;
              }
            });
            logText = `✨【艾莉卡強運爆發！】在${activity.name}中大成功！獲得兩倍數值加成，且毫無壓力！`;

            // 記錄大成功回憶日記
            const currentDiary = newDaughter.diaryMilestones ? [...newDaughter.diaryMilestones] : [];
            if (activity.type === 'work' && !currentDiary.includes('first_work_success')) {
              currentDiary.push('first_work_success');
              newLogs.push({
                id: Math.random().toString(),
                year: state.time.year,
                month: state.time.month,
                period: currentPeriod,
                text: `📖 女兒在回憶日記中寫下了關於【首次打工大成功】的新頁面...`,
                type: 'info' as const
              });
            } else if (activity.type === 'study' && !currentDiary.includes('first_study_success')) {
              currentDiary.push('first_study_success');
              newLogs.push({
                id: Math.random().toString(),
                year: state.time.year,
                month: state.time.month,
                period: currentPeriod,
                text: `📖 女兒在回憶日記中寫下了關於【首次學習大成功】的新頁面...`,
                type: 'info' as const
              });
            }
            newDaughter.diaryMilestones = currentDiary;
          } else if (activity.type !== 'rest') {
            // 常規成敗率
            const successChance = Math.max(30, Math.round(100 - (newDaughter.attributes.stress / Math.max(1, newDaughter.attributes.stamina)) * 60));
            isSuccess = Math.random() * 100 < successChance;
            
            if (!isSuccess) {
              if (activity.type === 'work') {
                finalGoldReward = Math.round(finalGoldReward * 0.3);
                finalStatChangesLocal = { stress: Math.round((activity.statChanges.stress || 3) * 1.5) };
                logText = `❌【${activity.name}】工作失誤被嚴厲責備！工作失敗！僅獲得 ${finalGoldReward} G，疲勞+${finalStatChangesLocal.stress || 0}。`;
              } else {
                // 學習失敗
                const modifiedChanges: any = {};
                Object.entries(activity.statChanges).forEach(([key, val]) => {
                  if (key === 'stress') modifiedChanges.stress = val;
                  else if ((val || 0) > 0) modifiedChanges[key] = 1; // 混水摸魚微增
                  else modifiedChanges[key] = val;
                });
                finalStatChangesLocal = modifiedChanges;
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
          finalStatChanges = finalStatChangesLocal;
          
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
    }

    // 雪舞好感度累積 (休息/度假)
    if (restGain > 0) {
      if (!newDaughter.bonds) {
        newDaughter.bonds = { clover: 0, shanshan: 0, xuewu: 0 };
      }
      newDaughter.bonds.xuewu = Math.min(100, (newDaughter.bonds.xuewu || 0) + restGain);
    }

    // 2. 壓力生病與住院檢查
    if (newDaughter.attributes.stress > newDaughter.attributes.stamina) {
      // 觸發首次生病日記里程碑
      const currentDiary = newDaughter.diaryMilestones ? [...newDaughter.diaryMilestones] : [];
      if (!currentDiary.includes('first_sick')) {
        currentDiary.push('first_sick');
        newLogs.push({
          id: Math.random().toString(),
          year: state.time.year,
          month: state.time.month,
          period: currentPeriod,
          text: `📖 女兒在回憶日記中寫下了關於【首次生病住院】的新頁面...`,
          type: 'info' as const
        });
      }
      newDaughter.diaryMilestones = currentDiary;

      if (newDaughter.isSick) {
        // 已生病 -> 重病住院
        newDaughter.attributes.stress = Math.round(newDaughter.attributes.stress * 0.4);
        newDaughter.attributes.stamina = Math.max(40, newDaughter.attributes.stamina - 15);
        newDaughter.gold = Math.max(0, newDaughter.gold - 60);
        newDaughter.isSick = false;
        newLogs.push({
          id: Math.random().toString(),
          year: state.time.year,
          month: state.time.month,
          period: currentPeriod,
          text: `🏥 【住院治療】因病情加重且持續疲勞，女兒不得不住院治療！自動扣除 60 G 醫藥費，體力衰退，生病狀態解除，壓力減半。`,
          type: 'stat_down'
        });
      } else {
        // 未生病 -> 機率性生病
        if (Math.random() < 0.60) {
          newDaughter.isSick = true;
          newLogs.push({
            id: Math.random().toString(),
            year: state.time.year,
            month: state.time.month,
            period: currentPeriod,
            text: `⚠️ 【生病】女兒因疲勞過度（疲勞 ${newDaughter.attributes.stress} > 體力 ${newDaughter.attributes.stamina}）病倒了！此時打工或上課將有 80% 機率失敗。請讓她休息、前往度假或使用「塞特的私房聖水」治療。`,
            type: 'stat_down'
          });
        } else {
          // 40% 直接累倒送醫
          newDaughter.attributes.stress = Math.round(newDaughter.attributes.stress * 0.4);
          newDaughter.attributes.stamina = Math.max(40, newDaughter.attributes.stamina - 15);
          newDaughter.gold = Math.max(0, newDaughter.gold - 60);
          newLogs.push({
            id: Math.random().toString(),
            year: state.time.year,
            month: state.time.month,
            period: currentPeriod,
            text: `🏥 【緊急住院】女兒疲勞嚴重超標，體力不支直接被送往醫院！扣除 60 G，體力衰退，壓力減半。`,
            type: 'stat_down'
          });
        }
      }
    }

    // 3. 叛逆期判定檢查
    if (!newDaughter.isRebellious) {
      let rebelChance = 0;
      if (newDaughter.attributes.morality < 50) {
        rebelChance += (50 - newDaughter.attributes.morality) * 0.8;
      }
      if (newDaughter.attributes.stress > 80) {
        rebelChance += (newDaughter.attributes.stress - 80) * 1.0;
      }
      if (newDaughter.relationship < 40) {
        rebelChance += (40 - newDaughter.relationship) * 1.0;
      }
      rebelChance = Math.min(85, rebelChance);

      // 溫柔乖乖女叛逆機率減半
      const personality = getDaughterPersonality(newDaughter.attributes);
      if (personality === '溫柔乖乖女') {
        rebelChance = rebelChance / 2;
      }

      if (rebelChance > 0 && Math.random() * 100 < rebelChance) {
        newDaughter.isRebellious = true;
        // 觸發首次叛逆日記里程碑
        const currentDiary = newDaughter.diaryMilestones ? [...newDaughter.diaryMilestones] : [];
        if (!currentDiary.includes('first_rebellion')) {
          currentDiary.push('first_rebellion');
          newLogs.push({
            id: Math.random().toString(),
            year: state.time.year,
            month: state.time.month,
            period: currentPeriod,
            text: `📖 女兒在回憶日記中寫下了關於【首次叛逆翹課】的新頁面...`,
            type: 'info' as const
          });
        }
        newDaughter.diaryMilestones = currentDiary;

        newLogs.push({
          id: Math.random().toString(),
          year: state.time.year,
          month: state.time.month,
          period: currentPeriod,
          text: `⚡ 【叛逆期】女兒看你的眼神變得很不屑，進入了叛逆期！執行打工或課程時將有 40% 機率翹課/罷工。請透過日常互動進行對話管教。`,
          type: 'event'
        });
      }
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
      const { unlocked, logs: checkedLogs } = checkAchievements(
        newDaughter,
        newInventory,
        prev.unlockedAchievements || [],
        newLogs,
        prev.time.year,
        prev.time.month,
        currentPeriod
      );
      return {
        ...prev,
        daughter: newDaughter,
        logs: checkedLogs,
        inventory: newInventory,
        time: { ...prev.time, period: nextPeriod },
        currentEvent: triggeredAVGEvent ? AVG_EVENTS[triggeredAVGEvent] : prev.currentEvent,
        currentEventStep: triggeredAVGEvent ? 'start' : prev.currentEventStep,
        unlockedAchievements: unlocked
      };
    });

    return {
      monthFinished,
      statChanges: finalStatChanges
    };
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

        const { unlocked: achUnlocked, logs: checkedLogs } = checkAchievements(
          updatedDaughter,
          newInventory,
          prev.unlockedAchievements || [],
          newLogs,
          prev.time.year,
          prev.time.month,
          'late'
        );

        // 保存解鎖與主線結局成就
        const finalUnlockedAchievements = [...achUnlocked];
        const sistersCount = 1 + (newInventory.includes('erica_reunited') ? 1 : 0) + (newInventory.includes('emilia_reunited') ? 1 : 0) + (newInventory.includes('honghua_reunited') ? 1 : 0);
        if (sistersCount === 3 && !finalUnlockedAchievements.includes('三王女重聚')) {
          finalUnlockedAchievements.push('三王女重聚');
          checkedLogs.push({
            id: Math.random().toString(),
            year: prev.time.year,
            month: prev.time.month,
            period: 'late',
            text: `🏆 解鎖成就：【三王女重聚】（在單次培育中將三胞胎姊妹全部認親重聚）！`,
            type: 'event'
          });
        }

        // 回傳大結局狀態
        return {
          ...prev,
          daughter: updatedDaughter,
          inventory: newInventory,
          time: { year: nextYear, month: nextMonth, period: 'early' },
          activeScreen: 'ending',
          schedule: null,
          logs: checkedLogs,
          completedEndings: newCompleted,
          unlockedCharacters: newUnlocked,
          unlockedAchievements: finalUnlockedAchievements
        };
      }

      // 月結算優先觸發：同窗好感階段事件
      let triggeredEvent: (typeof AVG_EVENTS)[string] | null = null;
      let eventStep: string | null = null;

      const bondStoryCandidates: Array<{ key: string; cond: boolean }> = [
        {
          key: 'bond_story_clover_30',
          cond: (updatedDaughter.bonds?.clover || 0) >= 30 && !newInventory.includes('bond_story_clover_30_done')
        },
        {
          key: 'bond_story_clover_60',
          cond: (updatedDaughter.bonds?.clover || 0) >= 60 && !newInventory.includes('bond_story_clover_60_done')
        },
        {
          key: 'bond_story_shanshan_30',
          cond: (updatedDaughter.bonds?.shanshan || 0) >= 30 && !newInventory.includes('bond_story_shanshan_30_done')
        },
        {
          key: 'bond_story_shanshan_60',
          cond: (updatedDaughter.bonds?.shanshan || 0) >= 60 && !newInventory.includes('bond_story_shanshan_60_done')
        },
        {
          key: 'bond_story_xuewu_30',
          cond: (updatedDaughter.bonds?.xuewu || 0) >= 30 && !newInventory.includes('bond_story_xuewu_30_done')
        },
        {
          key: 'bond_story_xuewu_60',
          cond: (updatedDaughter.bonds?.xuewu || 0) >= 60 && !newInventory.includes('bond_story_xuewu_60_done')
        }
      ];
      const firstBondStory = bondStoryCandidates.find(candidate => candidate.cond);
      if (firstBondStory) {
        triggeredEvent = AVG_EVENTS[firstBondStory.key];
        eventStep = triggeredEvent?.startNodeId || null;
      }
      
      // 隨機 AVG 事件觸發 (25% 機率)
      if (!triggeredEvent && Math.random() < 0.25) {
        // 從隨機庫隨機挑選
        const eventKeys = Object.keys(AVG_EVENTS).filter(key => !key.startsWith('bond_story_'));
        const randomKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
        const rawEvent = AVG_EVENTS[randomKey];
        if (rawEvent) {
          triggeredEvent = rawEvent;
          eventStep = rawEvent.startNodeId;
        }
      }

      const { unlocked: achUnlocked, logs: checkedLogs } = checkAchievements(
        updatedDaughter,
        newInventory,
        prev.unlockedAchievements || [],
        newLogs,
        prev.time.year,
        prev.time.month,
        'late'
      );

      return {
        ...prev,
        daughter: updatedDaughter,
        inventory: newInventory,
        time: { year: nextYear, month: nextMonth, period: 'early' },
        currentEvent: nextMonth === 10 ? null : triggeredEvent,
        currentEventStep: nextMonth === 10 ? null : eventStep,
        schedule: null,
        activeScreen: nextMonth === 10 ? 'festival' : 'main',
        logs: checkedLogs,
        unlockedAchievements: achUnlocked
      };
    });
  };

  // 購買商店物品
  const buyItem = (itemId: string): { success: boolean; message: string } => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: '找不到商品' };

    // 黑市走私物品必須在武者修行/冒險地圖中才可購入
    if (itemId.startsWith('bm_') && state.adventure === null) {
      return { success: false, message: '此商品僅在黑市出售，必須在武者修行中進入。' };
    }
    
    // 行商老爸享 8 折優惠；黑市解鎖後檳榔 5 折
    let discount = state.daughter.fatherBackground === 'merchant' ? 0.8 : 1;
    if (itemId.startsWith('binlang_') && state.inventory.includes('black_market_unlocked')) {
      discount = 0.5;
    }
    // 季節隨機事件特惠或漲價
    if (state.seasonalEvent === 'caravan') {
      discount *= 0.8;
    } else if (state.seasonalEvent === 'tax') {
      discount *= 1.2;
    }
    const finalPrice = Math.round(item.price * discount);

    if (state.daughter.gold < finalPrice) return { success: false, message: '金幣不足' };

    let newDaughter = { ...state.daughter };
    newDaughter.gold -= finalPrice;

    // 應用屬性增減 (如果是 food/消耗品則留待使用時再加屬性，其餘裝備/書本購買時即刻增加屬性)
    if (item.type !== 'food') {
      Object.entries(item.statChanges).forEach(([key, val]) => {
        const attrKey = key as keyof typeof newDaughter.attributes;
        if (attrKey === 'stress') {
          newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + (val || 0));
        } else {
          newDaughter.attributes[attrKey] = Math.max(0, newDaughter.attributes[attrKey] + (val || 0));
        }
      });
    }

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
  const talkToDaughter = (type: 'gentle' | 'scold' | 'praise' | 'headpat' | 'allowance') => {
    // 每月限制互動一次
    if (state.lastFatherInteractionMonth === state.time.month && !state.cheatMode) {
      return;
    }

    let text = '';
    let newDaughter = { ...state.daughter };
    const updatedAttributes = { ...newDaughter.attributes };
    const personality = getDaughterPersonality(newDaughter.attributes);

    const gentleQuotes: Record<string, string> = {
      '元氣女漢子': `女兒有些害羞地撓撓頭說：「老爸，別突然這麼肉麻啦！走，我們去練劍！」`,
      '高冷學霸': `女兒推了推眼鏡，冷靜地回覆：「謝謝父親。不過，您有這時間，不如多看兩本書。」`,
      '多愁善感藝術家': `女兒輕聲嘆了口氣，眼中帶笑：「跟老爸聊天時，感覺風裡的歌聲都溫柔了許多……」`,
      '溫柔乖乖女': `女兒甜甜一笑，雙手抱住你的手臂：「最喜歡和老爸聊天了！我會一直當個乖女兒的。」`,
      '社交名媛': `女兒優雅地行了個禮，嫣然一笑：「父親的體貼總是如此恰到好處，真是紳士風範。」`,
      '天真少女': `女兒高興地蹦蹦跳跳：「耶！老爸最好了，我們今天晚上吃草莓蛋糕嗎？」`
    };

    const praiseQuotes: Record<string, string> = {
      '元氣女漢子': `女兒高興地拍拍胸脯：「那是當然！我可是要成為最強女戰士的！」`,
      '高冷學霸': `女兒微微點頭：「這在我的計算之中，但我會繼續保持優秀的。」`,
      '多愁善感藝術家': `女兒雙頰微紅，低聲呢喃：「老爸的誇獎，像春天第一朵綻放的花……」`,
      '溫柔乖乖女': `女兒開心地笑著：「謝謝爸爸，我會更加努力不讓您失望的！」`,
      '社交名媛': `女兒以摺扇半遮面，俏皮地笑著：「能得到父親的讚賞，是本名媛最大的榮幸～」`,
      '天真少女': `女兒高興地轉了個圈：「哈哈，老爸最疼我了！最喜歡被老爸誇了！」`
    };

    const scoldQuotes: Record<string, string> = {
      '元氣女漢子': `女兒不服氣地鼓起腮幫子：「我知道了啦！下次我會加倍練回來的！」`,
      '高冷學霸': `女兒低下頭，理智地分析：「您的指責有合理之處，我會修正我的行為偏差。」`,
      '多愁善感藝術家': `女兒眼眶微紅，低下頭不說話，淚水在眼眶裡打轉，顯得無比委屈。`,
      '溫柔乖乖女': `女兒眼含淚光，乖巧地認錯：「對不起，爸爸，我真的知道錯了，您別生氣……」`,
      '社交名媛': `女兒收起笑容，略顯嚴肅地回覆：「父親教訓得是，適當的自省也是淑女的必修課。」`,
      '天真少女': `女兒委屈地扁扁嘴，抱著頭叫道：「我知道錯了嘛！老爸不要兇我……」`
    };

    if (newDaughter.isRebellious) {
      if (type === 'gentle') {
        const cureRebel = Math.random() < 0.50; // 50% 機率
        if (cureRebel) {
          newDaughter.isRebellious = false;
          text = `父親溫柔地與女兒聊天開導。女兒在你的關愛之下，終於認識到了錯誤，【叛逆】狀態解除了！`;
          newDaughter.relationship = Math.min(100, newDaughter.relationship + 8);
          updatedAttributes.stress = Math.max(0, updatedAttributes.stress - 15);
        } else {
          text = `父親溫柔地試圖與女兒聊天。但叛逆的女兒只是扭過頭去哼了一聲，親密度微升。`;
          newDaughter.relationship = Math.min(100, newDaughter.relationship + 2);
        }
      } else if (type === 'scold') {
        const cureRebel = Math.random() < 0.80; // 80% 機率
        if (cureRebel) {
          newDaughter.isRebellious = false;
          text = `父親嚴厲地訓導了女兒。女兒眼泛淚光，但心服口服，收斂了脾氣，【叛逆】狀態解除了！`;
          updatedAttributes.morality += 15;
          newDaughter.relationship = Math.max(0, newDaughter.relationship - 10);
          updatedAttributes.stress += 10;
        } else {
          text = `父親嚴厲地訓誡女兒。女兒感到委屈與不滿，跟你大吵了一架！壓力暴增，親密感暴跌！`;
          updatedAttributes.stress += 15;
          newDaughter.relationship = Math.max(0, newDaughter.relationship - 12);
        }
      } else if (type === 'praise') {
        text = `父親誇獎了女兒。但叛逆的女兒一臉不屑，冷冷地說「這沒什麼了不起的」，好感度微升。`;
        newDaughter.relationship = Math.min(100, newDaughter.relationship + 2);
      } else if (type === 'headpat') {
        text = `父親想要摸摸女兒的頭。但叛逆的女兒一巴掌拍開你的手，氣呼呼地說「別碰我！」；親密度下降。`;
        newDaughter.relationship = Math.max(0, newDaughter.relationship - 4);
      } else if (type === 'allowance') {
        const allowanceAmount = 80 + Math.round(newDaughter.relationship * 0.5);
        newDaughter.gold = Math.max(0, newDaughter.gold + allowanceAmount);
        newDaughter.relationship = Math.min(100, newDaughter.relationship + 2);
        text = `父親給了女兒零用錢 ${allowanceAmount} G。叛逆的女兒搶過去說「才這點啊？算了，我拿走了。」`;
      }
    } else {
      if (type === 'gentle') {
        text = `父親溫柔地與女兒聊天。她非常開心，壓力顯著消除。\n${gentleQuotes[personality] || ''}`;
        newDaughter.relationship = Math.min(100, newDaughter.relationship + 5);
        updatedAttributes.stress = Math.max(0, updatedAttributes.stress - 20);
      } else if (type === 'scold') {
        text = `父親嚴肅地訓誡了女兒。女兒感到委屈，但更懂得自我約束了。\n${scoldQuotes[personality] || ''}`;
        newDaughter.relationship = Math.max(0, newDaughter.relationship - 5);
        updatedAttributes.morality += 10;
        updatedAttributes.stress += 8;
      } else if (type === 'praise') {
        text = `父親誇獎了女兒，女兒的小臉上洋溢著驕傲的神采！\n${praiseQuotes[personality] || ''}`;
        newDaughter.relationship = Math.min(100, newDaughter.relationship + 4);
        updatedAttributes.charisma += 5;
        updatedAttributes.stress = Math.max(0, updatedAttributes.stress - 10);
      } else if (type === 'headpat') {
        text = `父親溫柔地摸了摸女兒的頭。女兒閉上眼蹭了蹭你的掌心，臉上露出開心的笑容。`;
        newDaughter.relationship = Math.min(100, newDaughter.relationship + 4);
        updatedAttributes.stress = Math.max(0, updatedAttributes.stress - 30);
        updatedAttributes.sensitivity = Math.min(999, updatedAttributes.sensitivity + 2);
      } else if (type === 'allowance') {
        const allowanceAmount = 80 + Math.round(newDaughter.relationship * 0.5);
        newDaughter.gold = Math.max(0, newDaughter.gold + allowanceAmount);
        newDaughter.relationship = Math.min(100, newDaughter.relationship + 6);
        updatedAttributes.sensitivity = Math.min(999, updatedAttributes.sensitivity + 2);
        text = `父親給了女兒零用錢 ${allowanceAmount} G。女兒非常高興，開心地親了你一下！`;
      }
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
      logs: newLogs,
      lastFatherInteractionMonth: state.time.month
    }));
  };

  // 使用背包道具
  const useItem = (itemId: string): { success: boolean; message: string } => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: '找不到該道具' };

    const idx = state.inventory.indexOf(itemId);
    if (idx === -1) return { success: false, message: '背包中沒有此道具' };

    let newDaughter = { ...state.daughter };
    let success = false;
    let message = '';

    if (itemId === 'holy_water') {
      newDaughter.isSick = false;
      // 應用屬性變更
      Object.entries(item.statChanges).forEach(([key, val]) => {
        const attrKey = key as keyof typeof newDaughter.attributes;
        if (attrKey === 'stress') {
          newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + (val || 0));
        } else {
          newDaughter.attributes[attrKey] = Math.max(0, newDaughter.attributes[attrKey] + (val || 0));
        }
      });
      message = `✨ 使用了【${item.name}】，女兒的生病狀態被消除了！`;
      success = true;
    } else if (item.type === 'food') {
      // 食物消耗品
      Object.entries(item.statChanges).forEach(([key, val]) => {
        const attrKey = key as keyof typeof newDaughter.attributes;
        if (attrKey === 'stress') {
          newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + (val || 0));
        } else {
          newDaughter.attributes[attrKey] = Math.max(0, newDaughter.attributes[attrKey] + (val || 0));
        }
      });
      message = `😋 女兒吃下了【${item.name}】！`;
      if (item.statChanges.stress && item.statChanges.stress < 0) {
        message += ` 壓力減少了 ${Math.abs(item.statChanges.stress)}。`;
      }
      success = true;
    } else {
      return { success: false, message: '此道具為裝備或特殊書籍，無法直接使用。' };
    }

    if (success) {
      newDaughter.combatHp = newDaughter.attributes.stamina;
      newDaughter.combatMp = newDaughter.attributes.magicSkill * 2 + 10;

      const newInventory = [...state.inventory];
      newInventory.splice(idx, 1);

      const newLogs = [...state.logs, {
        id: Math.random().toString(),
        year: state.time.year,
        month: state.time.month,
        period: state.time.period,
        text: message,
        type: 'event' as const
      }];

      setState(prev => ({
        ...prev,
        daughter: newDaughter,
        inventory: newInventory,
        logs: newLogs
      }));
    }

    return { success, message };
  };

  // 更換裝備服飾
  const changeOutfit = (outfit: Daughter['outfit']) => {
    setState((prev) => ({
      ...prev,
      daughter: { ...prev.daughter, outfit }
    }));
  };

  // 選擇稱號
  const selectTitle = (title: string | null) => {
    setState((prev) => ({
      ...prev,
      daughter: { ...prev.daughter, selectedTitle: title }
    }));
  };

  // --- 冒險修行核心方法 ---
  const startAdventure = () => {
    const isEmilia = state.daughter.characterId === 'emilia';
    const areaOrder: AdventureAreaId[] = ['betel_forest', 'naval_border', 'royal_ruins'];
    const areaId = areaOrder[state.time.month % areaOrder.length];
    const areaCfg = AREA_CONFIG[areaId];
    
    // 增加冒險次數追蹤
    const runCount = state.daughter.adventureCount || 0;
    const nextCount = runCount + 1;
    const updatedDaughter = {
      ...state.daughter,
      adventureCount: nextCount
    };

    // 初始化 Slay the Spire 地圖
    const mapNodes = generateAdventureMap(areaId, updatedDaughter, state.inventory);
    
    let partyData = undefined;
    if (isEmilia) {
      partyData = {
        yv: { name: 'yv', hp: 90, maxHp: 90, mp: 60, maxMp: 60 },
        jumbo: { name: 'jumbo', hp: 160, maxHp: 160, mp: 30, maxMp: 30 }
      };
    }

    setState((prev) => ({
      ...prev,
      daughter: updatedDaughter,
      activeScreen: 'adventure',
      adventure: {
        areaId,
        areaName: areaCfg.name,
        highLayerDebuffName: areaCfg.debuffName,
        highLayerDebuffDescription: areaCfg.debuffDescription,
        nodes: mapNodes,
        currentNodeId: '0_0',
        daughterHp: updatedDaughter.combatHp,
        daughterMaxHp: prev.daughter.attributes.stamina,
        party: partyData,
        combatLog: [`進入「${areaCfg.name}」，準備迎戰區域魔物。高層區域效果：${areaCfg.debuffName}。`],
        status: 'exploring'
      }
    }));
  };

  const equipMember = (memberId: 'yv' | 'jumbo', itemId: string) => {
    setState((prev) => {
      if (!prev.adventure || !prev.adventure.party) return prev;
      const nextAdv = { ...prev.adventure };
      const currentParty = nextAdv.party;
      if (!currentParty) return prev;
      
      const nextParty = {
        yv: { ...currentParty.yv },
        jumbo: { ...currentParty.jumbo }
      };
      if (memberId === 'yv') {
        nextParty.yv.weapon = itemId || undefined;
      } else {
        nextParty.jumbo.weapon = itemId || undefined;
      }
      nextAdv.party = nextParty;
      return {
        ...prev,
        adventure: nextAdv
      };
    });
  };

  const stepAdventure = (nodeId: string) => {
    if (!state.adventure) return;
    const nextAdv = { ...state.adventure };
    const targetNode = nextAdv.nodes.find(n => n.id === nodeId);
    if (!targetNode) return;
    const nextInventory = [...state.inventory];

    // 計算專注度扣除。未來摩托車 / 黑市摩托車使基礎消耗為 1；精靈祝福使非摩托車的消耗減半為 2。
    const hasMotorcycle = state.inventory.includes('future_gp125') || state.inventory.includes('bm_cheap_gp125');
    const hasBlessing = state.inventory.includes('fairy_blessing');
    const focusCost = hasMotorcycle ? 1 : (hasBlessing ? 2 : 4);
    
    const newDaughter = { ...state.daughter };
    newDaughter.focus = Math.max(0, newDaughter.focus - focusCost);

    nextAdv.currentNodeId = nodeId;
    targetNode.cleared = true;
    nextAdv.combatLog.push(`🐾 前往 [${targetNode.name}] 耗費了 ${focusCost} 點專注度。`);

    if (targetNode.layer >= 4 && (targetNode.type === 'battle' || targetNode.type === 'boss')) {
      if (nextAdv.areaId === 'betel_forest') {
        newDaughter.combatHp = Math.max(1, newDaughter.combatHp - 10);
        nextAdv.daughterHp = Math.max(1, nextAdv.daughterHp - 10);
        nextAdv.combatLog.push(`🌫️【${nextAdv.highLayerDebuffName}】迷霧侵蝕體力，進入戰鬥前 HP -10。`);
      } else if (nextAdv.areaId === 'naval_border') {
        newDaughter.combatMp = Math.max(0, newDaughter.combatMp - 8);
        nextAdv.combatLog.push(`🌊【${nextAdv.highLayerDebuffName}】砲火威壓壓制施法，進入戰鬥前 MP -8。`);
      } else if (nextAdv.areaId === 'royal_ruins') {
        newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + 10);
        nextAdv.combatLog.push(`🕯️【${nextAdv.highLayerDebuffName}】古咒纏身，進入戰鬥前疲勞 +10。`);
      }
    }

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
      // 驛站，顯示修行專屬商店，不跳轉主商店
      nextAdv.status = 'shopping';
      setState(prev => ({
        ...prev,
        daughter: newDaughter,
        adventure: nextAdv
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

    else if (targetNode.type === 'chest') {
      nextAdv.status = 'exploring';
      const roll = Math.random();
      if (roll < 0.40) {
        const goldReward = Math.floor(Math.random() * 151) + 100;
        newDaughter.gold += goldReward;
        nextAdv.combatLog.push(`🎁 踩到寶箱節點！獲得了金幣 ${goldReward}。`);
      } else {
        let itemId = '';
        if (roll < 0.70) {
          const eqList = ['steel_sword', 'silver_armor', 'royal_dress', 'summer_dress', 'bm_dark_armor', 'bm_poison_dagger'];
          itemId = pickRandom(eqList);
        } else {
          const consList = ['binlang_ice', 'binlang_twin', 'binlang_normal', 'barrel_rice_cake', 'holy_water'];
          itemId = pickRandom(consList);
        }
        const item = ITEMS.find(i => i.id === itemId);
        if (item) {
          nextInventory.push(itemId);
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
          nextAdv.daughterHp = Math.min(nextAdv.daughterMaxHp, nextAdv.daughterHp + (item.statChanges.stamina || 0));
          
          nextAdv.combatLog.push(`🎁 踩到寶箱節點！獲得了${item.type === 'weapon' || item.type === 'armor' || item.type === 'dress' ? '裝備' : '道具'}：【${item.name}】！`);
        }
      }
    }
    else if (targetNode.type === 'spring') {
      nextAdv.status = 'exploring';
      const roll = Math.random();
      if (roll < 0.40) {
        const restorePct = 0.4;
        nextAdv.daughterHp = Math.min(nextAdv.daughterMaxHp, nextAdv.daughterHp + Math.round(nextAdv.daughterMaxHp * restorePct));
        if (nextAdv.party) {
          nextAdv.party.yv.hp = Math.min(nextAdv.party.yv.maxHp, nextAdv.party.yv.hp + Math.round(nextAdv.party.yv.maxHp * restorePct));
          nextAdv.party.jumbo.hp = Math.min(nextAdv.party.jumbo.maxHp, nextAdv.party.jumbo.hp + Math.round(nextAdv.party.jumbo.maxHp * restorePct));
          nextAdv.combatLog.push(`⛲ 踩到恢復泉水！泉水泛起溫暖微光，全隊恢復了 40% 的生命值！`);
        } else {
          nextAdv.combatLog.push(`⛲ 踩到恢復泉水！泉水泛起溫暖微光，女兒恢復了 40% 的生命值！`);
        }
      } else if (roll < 0.60) {
        newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress - 20);
        nextAdv.combatLog.push(`⛲ 踩到恢復泉水！泉水清涼舒爽，洗淨了一身疲憊，疲勞度減少 20 點。`);
      } else {
        const battleAttrs: Array<'strength' | 'intelligence' | 'combatSkill' | 'magicSkill'> = ['strength', 'intelligence', 'combatSkill', 'magicSkill'];
        const selectedAttr = pickRandom(battleAttrs);
        const attrNames = {
          strength: '力量',
          intelligence: '智力',
          combatSkill: '戰鬥技術',
          magicSkill: '魔法技術'
        };
        newDaughter.attributes[selectedAttr] += 5;
        nextAdv.combatLog.push(`⛲ 踩到恢復泉水！喝下甘甜泉水後精神大振，隨機戰鬥屬性【${attrNames[selectedAttr]}】提升了 5 點！`);
      }
    }

    setState(prev => ({
      ...prev,
      daughter: newDaughter,
      adventure: nextAdv,
      inventory: nextInventory
    }));
  };

  const endAdventure = (isDefeat: boolean) => {
    if (!state.adventure) return;
    const rewardGold = isDefeat ? 0 : 200;
    const logText = isDefeat 
      ? `☠️ 冒險失敗！女兒在${state.adventure.areaName}中受傷被送回家中，修行強制終止。`
      : `🏆 冒險結束！女兒成功探索${state.adventure.areaName}歸來，獲得金幣獎勵 200。`;

    setState((prev) => {
      return advanceOnePeriod(prev, logText, {
        gold: prev.daughter.gold + rewardGold,
        focus: 100,
        combatHp: prev.daughter.attributes.stamina
      });
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

        if (rew.relationship) {
          newDaughter.relationship = Math.min(100, Math.max(0, newDaughter.relationship + rew.relationship));
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

      // 解鎖新獲得道具的圖鑑
      const currentUnlocked = prev.unlockedItems || [];
      let newUnlocked = [...currentUnlocked];
      newInventory.forEach(itemId => {
        if (!newUnlocked.includes(itemId) && ITEMS.some(i => i.id === itemId)) {
          newUnlocked.push(itemId);
        }
      });

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
        const isArrested = prev.currentEventStep === 'jaks_arrest';
        let logText = '';
        let daughterUpdates = {};
        
        let finalUnlockedAchievements = [...prev.unlockedAchievements || []];
        let logsForPeriod = [...updatedLogs];

        if (isArrested) {
          logText = `☠️ 冒險失敗！女兒被傑克斯少校逮捕押送回城，修行強制終止。`;
          daughterUpdates = {
            focus: 100,
            combatHp: Math.round(newDaughter.attributes.stamina * 0.2)
          };
        } else {
          logText = `🏆 冒險成功！藉由智慧與高雅氣質說服了傑克斯少校，成功探索「${updatedAdventure.areaName}」，獲得獎勵金幣 300！`;
          daughterUpdates = {
            gold: newDaughter.gold + 300,
            focus: 100,
            combatHp: newDaughter.attributes.stamina
          };
          
          if (!finalUnlockedAchievements.includes('海路放行者')) {
            finalUnlockedAchievements.push('海路放行者');
            logsForPeriod.push({
              id: Math.random().toString(),
              year: prev.time.year,
              month: prev.time.month,
              period: prev.time.period,
              text: `🏆 解鎖成就：【海路放行者】（在冒險中免戰說服傑克斯少校，或在正面戰鬥中將其擊敗）！`,
              type: 'event' as const
            });
          }
        }

        const stateAfterPeriod = advanceOnePeriod(
          {
            ...prev,
            daughter: newDaughter,
            inventory: newInventory,
            logs: logsForPeriod,
            unlockedAchievements: finalUnlockedAchievements,
            unlockedItems: newUnlocked,
            currentEvent: null,
            currentEventStep: null
          },
          logText,
          daughterUpdates
        );

        return stateAfterPeriod;
      }

      const { unlocked: achUnlocked, logs: checkedLogs } = checkAchievements(
        newDaughter,
        newInventory,
        prev.unlockedAchievements || [],
        updatedLogs,
        prev.time.year,
        prev.time.month,
        prev.time.period
      );

      const finalUnlockedAchievements = [...achUnlocked];

      return {
        ...prev,
        daughter: newDaughter,
        inventory: newInventory,
        activeScreen: newScreen,
        logs: checkedLogs,
        currentEvent: isEnd ? null : prev.currentEvent,
        currentEventStep: isEnd ? null : nextStep,
        unlockedAchievements: finalUnlockedAchievements,
        unlockedItems: newUnlocked,
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

  const leaveAdventureShop = () => {
    setState((prev) => {
      if (!prev.adventure) return prev;
      return {
        ...prev,
        adventure: {
          ...prev.adventure,
          status: 'exploring' as const
        }
      };
    });
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

      const newInventory = [...prev.inventory];
      const monsterName = currentNode?.monster?.name;
      if (monsterName === '海軍少校 傑克斯' && !newInventory.includes('royal_saber')) {
        newInventory.push('royal_saber');
        nextAdv.combatLog.push(`🎁 戰利品：獲得傑克斯少校的【皇家海軍軍刀】！`);
      }

      // 掉落精煉礦石
      let oreDropped = 0;
      if (isBoss) {
        oreDropped = Math.floor(Math.random() * 2) + 1; // 1-2
      } else if (Math.random() < 0.20) {
        oreDropped = 1;
      }
      
      if (oreDropped > 0) {
        for (let i = 0; i < oreDropped; i++) {
          newInventory.push('refine_ore');
        }
        nextAdv.combatLog.push(`🎁 戰利品：獲得了 ${oreDropped} 個【精煉礦石】！`);
      }

      if (isBoss) {
        const logText = `👑 討伐首領成功！順利完成「${prev.adventure.areaName}」修行！獲得金幣 300！`;
        
        // 觸發擊敗修行首領日記里程碑
        const currentDiary = newDaughter.diaryMilestones ? [...newDaughter.diaryMilestones] : [];
        if (!currentDiary.includes('first_adventure_boss')) {
          currentDiary.push('first_adventure_boss');
          logs.push({
            id: Math.random().toString(),
            year: prev.time.year,
            month: prev.time.month,
            period: prev.time.period,
            text: `📖 女兒在回憶日記中寫下了關於【擊敗修行首領】的新頁面...`,
            type: 'info' as const
          });
        }
        newDaughter.diaryMilestones = currentDiary;

        return advanceOnePeriod(prev, logText, {
          gold: newDaughter.gold + 300,
          focus: 100,
          combatHp: newDaughter.attributes.stamina,
          diaryMilestones: newDaughter.diaryMilestones
        }, newInventory);
      }

      const { unlocked: achUnlocked, logs: checkedLogs } = checkAchievements(
        newDaughter,
        newInventory,
        prev.unlockedAchievements || [],
        logs,
        prev.time.year,
        prev.time.month,
        prev.time.period
      );

      // 解鎖獲得道具的圖鑑
      const currentUnlocked = prev.unlockedItems || [];
      let newUnlocked = [...currentUnlocked];
      newInventory.forEach(itemId => {
        if (!newUnlocked.includes(itemId) && ITEMS.some(i => i.id === itemId)) {
          newUnlocked.push(itemId);
        }
      });

      return {
        ...prev,
        daughter: newDaughter,
        inventory: newInventory,
        adventure: updatedAdventure,
        activeScreen: newScreen,
        logs: checkedLogs,
        unlockedAchievements: achUnlocked,
        unlockedItems: newUnlocked
      };
    });
  };

  const resolveCombatDefeat = () => {
    setState((prev) => {
      if (!prev.adventure) return prev;
      const logText = `☠️ 戰鬥力竭！被魔物擊倒送回王城，修行強制結束。`;
      return advanceOnePeriod(prev, logText, {
        focus: 100,
        combatHp: Math.round(prev.daughter.attributes.stamina * 0.2)
      });
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
      
      let newUnlockedAchievements = [...(prev.unlockedAchievements || [])];
      let newLogs = [...prev.logs, {
        id: logId,
        year: prev.time.year,
        month: prev.time.month,
        period: 'late' as const,
        text: logText,
        type: 'event' as const
      }];

      if (_victory && !newUnlockedAchievements.includes('收穫祭之霸')) {
        newUnlockedAchievements.push('收穫祭之霸');
        newLogs.push({
          id: Math.random().toString(),
          year: prev.time.year,
          month: prev.time.month,
          period: 'late' as const,
          text: `🏆 解鎖成就：【收穫祭之霸】（在年度 10 月收穫祭中，任一賽道獲得第一名冠軍。）！下次開局將獲得加成效果：初始王國名望 +50！`,
          type: 'event' as const
        });
      }

      const { unlocked: achUnlocked, logs: checkedLogs } = checkAchievements(
        newDaughter,
        newInventory,
        newUnlockedAchievements,
        newLogs,
        prev.time.year,
        prev.time.month,
        'late'
      );

      return {
        ...prev,
        daughter: newDaughter,
        inventory: newInventory,
        time: { year: nextYear, month: nextMonth, period: 'early' as const },
        activeScreen: 'main' as const,
        logs: checkedLogs,
        unlockedAchievements: achUnlocked
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

      const newDaughter = { ...prev.daughter };
      const currentDiary = newDaughter.diaryMilestones ? [...newDaughter.diaryMilestones] : [];
      if (!currentDiary.includes('first_reunion')) {
        currentDiary.push('first_reunion');
        newLogs.push({
          id: Math.random().toString(),
          year: prev.time.year,
          month: prev.time.month,
          period: prev.time.period,
          text: `📖 女兒在回憶日記中寫下了關於【三胞胎姊妹首次重逢】的新頁面...`,
          type: 'info' as const
        });
      }
      newDaughter.diaryMilestones = currentDiary;

      const eventId = `${sisterId}_reunion_avg`;
      const ev = AVG_EVENTS[eventId];

      return {
        ...prev,
        daughter: newDaughter,
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

  const buyHeritageUpgrade = (upgradeId: string, cost: number): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const currentStardust = prev.stardust || 0;
      if (currentStardust < cost) {
        success = false;
        message = '回憶星塵不足！';
        return prev;
      }

      const upgrades = { ...prev.heritageUpgrades };
      const currentLevel = upgrades[upgradeId] || 0;

      const maxLevels: Record<string, number> = {
        gold_boost: 5,
        stamina_boost: 5,
        all_stats_boost: 3,
        heirloom_potion: 1,
        heirloom_dagger: 1
      };
      
      const maxLevel = maxLevels[upgradeId] || 0;
      if (currentLevel >= maxLevel) {
        success = false;
        message = '該升級項已達最高等級！';
        return prev;
      }

      upgrades[upgradeId] = currentLevel + 1;
      success = true;
      message = '升級成功！';

      return {
        ...prev,
        stardust: currentStardust - cost,
        heritageUpgrades: upgrades
      };
    });

    return { success, message };
  };

  const refineEquipment = (itemId: string): { success: boolean; message: string } => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: '找不到該裝備' };
    if (item.type !== 'weapon' && item.type !== 'armor') return { success: false, message: '此道具不可進行精煉' };

    let success = false;
    let message = '';

    setState(prev => {
      const newDaughter = { ...prev.daughter };
      const newInventory = [...prev.inventory];
      const refineLevels = { ...newDaughter.refineLevels };
      const currentLevel = refineLevels[itemId] || 0;

      if (currentLevel >= 5) {
        success = false;
        message = '該裝備已達到最高精煉等級 (+5)';
        return prev;
      }

      const oreCount = newInventory.filter(id => id === 'refine_ore').length;
      const requiredOre = currentLevel + 1;
      const requiredGold = 100 * (currentLevel + 1);

      if (newDaughter.gold < requiredGold) {
        success = false;
        message = `金幣不足！精煉需要 ${requiredGold} G。`;
        return prev;
      }

      if (oreCount < requiredOre) {
        success = false;
        message = `精煉礦石不足！精煉需要 ${requiredOre} 個，當前僅有 ${oreCount} 個。`;
        return prev;
      }

      newDaughter.gold -= requiredGold;
      
      let oresRemoved = 0;
      for (let i = newInventory.length - 1; i >= 0; i--) {
        if (newInventory[i] === 'refine_ore' && oresRemoved < requiredOre) {
          newInventory.splice(i, 1);
          oresRemoved++;
        }
      }

      const nextLevel = currentLevel + 1;
      refineLevels[itemId] = nextLevel;
      newDaughter.refineLevels = refineLevels;

      let statUpMessage = '';
      if (itemId === 'steel_sword') {
        newDaughter.attributes.combatSkill += 6;
        newDaughter.attributes.strength += 3;
        statUpMessage = '戰鬥技術+6，力量+3';
      } else if (itemId === 'silver_armor') {
        newDaughter.attributes.stamina += 10;
        newDaughter.attributes.combatSkill += 4;
        statUpMessage = '體力+10，戰鬥技術+4';
      } else if (itemId === 'bm_dark_armor') {
        newDaughter.attributes.stamina += 12;
        newDaughter.attributes.combatSkill += 6;
        statUpMessage = '體力+12，戰鬥技術+6';
      } else if (itemId === 'bm_poison_dagger') {
        newDaughter.attributes.combatSkill += 10;
        newDaughter.attributes.sin += 3;
        statUpMessage = '戰鬥技術+10，罪孽+3';
      }

      newDaughter.combatHp = newDaughter.attributes.stamina;
      newDaughter.combatMp = newDaughter.attributes.magicSkill * 2 + 10;

      const logText = `🔨 【裝備精煉】成功將【${item.name}】精煉至 +${nextLevel}！消耗了 ${requiredGold} G 與 ${requiredOre} 個精煉礦石。主角屬性增加：${statUpMessage}！`;
      const newLogs = [...prev.logs, {
        id: Math.random().toString(),
        year: prev.time.year,
        month: prev.time.month,
        period: prev.time.period,
        text: logText,
        type: 'info' as const
      }];

      success = true;
      message = `成功將【${item.name}】精煉至 +${nextLevel}！`;

      return {
        ...prev,
        daughter: newDaughter,
        inventory: newInventory,
        logs: newLogs
      };
    });

    return { success, message };
  };

  const addDiaryMilestone = (milestoneId: string) => {
    setState(prev => {
      const currentMilestones = prev.daughter.diaryMilestones || [];
      if (currentMilestones.includes(milestoneId)) return prev;

      const newMilestones = [...currentMilestones, milestoneId];
      const newDaughter = {
        ...prev.daughter,
        diaryMilestones: newMilestones
      };

      const milestoneNames: Record<string, string> = {
        first_work_success: '首次打工大成功',
        first_study_success: '首次上課大成功',
        first_sick: '首次生病住院',
        first_rebellion: '首次叛逆翹課',
        first_adventure_boss: '擊敗修行首領',
        first_reunion: '三胞胎姊妹首次重逢',
        first_black_market: '踏入神秘黑市',
        first_casino: '初入黑鑽賭局'
      };

      const name = milestoneNames[milestoneId] || milestoneId;
      const logText = `📖 女兒在回憶日記中寫下了關於【${name}】的新頁面...`;
      const newLogs = [...prev.logs, {
        id: Math.random().toString(),
        year: prev.time.year,
        month: prev.time.month,
        period: prev.time.period,
        text: logText,
        type: 'info' as const
      }];

      return {
        ...prev,
        daughter: newDaughter,
        logs: newLogs
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
        useItem,
        talkToDaughter,
        changeOutfit,
        selectTitle,
        startAdventure,
        stepAdventure,
        endAdventure,
        equipMember,
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
        resolveCombatReunion,
        leaveAdventureShop,
        buyHeritageUpgrade,
        refineEquipment,
        addDiaryMilestone
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
