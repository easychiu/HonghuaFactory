export interface CharacterAttributes {
  stamina: number;      // 體力
  strength: number;     // 力量
  intelligence: number; // 智力
  charisma: number;     // 魅力
  morality: number;     // 道德
  piety: number;        // 信仰
  sensitivity: number;  // 感受
  stress: number;       // 疲勞度
  combatSkill: number;  // 戰鬥技術
  magicSkill: number;   // 魔法技術
  reputation: number;   // 名望
  sin: number;          // 罪孽
  elegance: number;     // 禮儀
  art: number;          // 氣質
}

export type AttributeKey = keyof CharacterAttributes;

export interface Daughter {
  name: string;
  age: number;
  birthMonth: number;
  birthDay: number;
  attributes: CharacterAttributes;
  gold: number;
  relationship: number; // 與父親的親密度
  outfit: 'default' | 'dress' | 'armor' | 'summer';
  combatHp: number; // 戰鬥生命值 (目前值)
  combatMp: number; // 戰鬥魔法值 (目前值)
  avatarUrl: string; // 頭像路徑或自訂上傳 Base64
}

export type PeriodType = 'early' | 'mid' | 'late';

export interface GameTime {
  year: number;   // 第 1 到第 8 年
  month: number;  // 1 到 12 月
  period: PeriodType; // 上旬、中旬、下旬
}

export interface Activity {
  id: string;
  name: string;
  type: 'work' | 'study' | 'rest';
  cost: number;        // 花費的金幣
  reward: number;      // 獲得的金幣
  description: string;
  statChanges: Partial<CharacterAttributes>; // 屬性增減
  effectDescription: string;
}

export interface LogEntry {
  id: string;
  year: number;
  month: number;
  period: PeriodType;
  text: string;
  type: 'info' | 'stat_up' | 'stat_down' | 'event' | 'combat' | 'dialogue';
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'weapon' | 'armor' | 'dress' | 'food' | 'book';
  statChanges: Partial<CharacterAttributes>;
  outfitChange?: Daughter['outfit'];
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  choices?: {
    text: string;
    nextId: string;
    effects?: (state: GameState) => Partial<GameState>;
  }[];
  nextId?: string;
}

export interface NarrativeEvent {
  id: string;
  title: string;
  triggerCondition: (state: GameState) => boolean;
  dialogue: DialogueNode[];
  onComplete?: (state: GameState) => GameState;
}

// 冒險修行狀態
export interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  goldReward: number;
  expReward: number;
}

export interface AdventureNode {
  id: number;
  type: 'start' | 'empty' | 'chest' | 'monster' | 'rest' | 'boss';
  name: string;
  cleared: boolean;
  monster?: Monster;
}

export interface AdventureState {
  areaName: string;
  nodes: AdventureNode[];
  currentNodeIndex: number;
  daughterHp: number;
  daughterMaxHp: number;
  combatLog: string[];
  status: 'exploring' | 'fighting' | 'chest' | 'defeat' | 'victory';
}

export interface GameState {
  daughter: Daughter;
  time: GameTime;
  schedule: [string, string, string] | null; // 上、中、下旬的活動 ID
  inventory: string[]; // 已擁有道具 ID 列表
  activeScreen: 'main' | 'scheduler' | 'execution' | 'store' | 'adventure' | 'ending';
  logs: LogEntry[];
  currentEvent: NarrativeEvent | null;
  currentEventStep: string | null; // 當前對話節點 ID
  adventure: AdventureState | null;
  cheatMode: boolean;
}
