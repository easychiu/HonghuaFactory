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

export type CharacterId = 'honghua' | 'erica' | 'emilia';
export type FatherBackground = 'knight' | 'scholar' | 'merchant' | 'bard';

export interface Daughter {
  name: string;
  age: number;
  birthMonth: number;
  birthDay: number;
  attributes: CharacterAttributes;
  gold: number;
  relationship: number; // 與父親的親密度
  outfit: 'default' | 'dress' | 'armor' | 'summer';
  combatHp: number; // 戰鬥生命值
  combatMp: number; // 戰鬥魔法值
  focus: number;    // 專注度
  maxFocus: number; // 專注度上限
  avatarUrl: string; // 頭像路徑
  characterId: CharacterId; // 主角ID
  fatherBackground: FatherBackground; // 老爸背景
  bonds: {
    clover: number;
    shanshan: number;
    xuewu: number;
  };
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

export interface AVGChoice {
  text: string;
  effect: (state: any) => { log: string; nextDialogId?: string; rewards?: any };
  nextId?: string;
}

export interface AVGDialogueNode {
  speaker: string;
  text: string;
  choices?: AVGChoice[];
  nextId?: string;
}

export interface AVGEvent {
  id: string;
  title: string;
  startNodeId: string;
  nodes: Record<string, AVGDialogueNode>;
}

// 戰鬥狀態下的怪物
export interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  goldReward: number;
  expReward: number;
  behaviorPattern?: 'standard' | 'aggressive' | 'boss';
  sisterId?: CharacterId;
}

// Slay the Spire 風格的節點
export interface AdventureMapNode {
  id: string;
  layer: number; // 0 (起點) 到 5 (Boss)
  index: number; // 同一層的橫向排列位置
  type: 'start' | 'battle' | 'event' | 'rest' | 'shop' | 'hidden' | 'boss';
  name: string;
  cleared: boolean;
  connectedTo: string[]; // 下一層所連接的節點 ID 列表
  monster?: Monster;
}

// 艾蜜莉亞三人小隊隊員狀態
export interface PartyMember {
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}

// 冒險修行狀態
export interface AdventureState {
  areaName: string;
  nodes: AdventureMapNode[];
  currentNodeId: string;
  daughterHp: number;
  daughterMaxHp: number;
  party?: {
    yv: PartyMember;
    jumbo: PartyMember;
  };
  combatLog: string[];
  status: 'exploring' | 'fighting' | 'chest' | 'defeat' | 'victory';
  // 記錄是否已打破巨石障礙等冒險暫存狀態
  boulderBroken?: boolean;
  satiated?: boolean;
}

export interface GameState {
  daughter: Daughter;
  time: GameTime;
  schedule: [string, string, string] | null; // 上、中、下旬的活動 ID
  inventory: string[]; // 已擁有道具 ID 列表
  activeScreen: 'main' | 'scheduler' | 'execution' | 'store' | 'adventure' | 'ending' | 'festival';
  logs: LogEntry[];
  currentEvent: AVGEvent | null;
  currentEventStep: string | null; // 當前對話節點 ID
  adventure: AdventureState | null;
  cheatMode: boolean;
  unlockedCharacters: CharacterId[]; // 已解鎖角色列表（NG+ 用）
  completedEndings: string[]; // 已達成結局列表
  unlockedAchievements: string[]; // 已解鎖成就
}
