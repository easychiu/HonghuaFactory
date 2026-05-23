export interface Achievement {
  id: string;
  name: string;
  description: string;
  bonusText: string;
  badge: string;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: '第一次當爸爸',
    name: '第一次當爸爸',
    description: '養育女兒的第一步！進入遊戲並完成角色初始化。',
    bonusText: '開局金幣 +100',
    badge: '👶🍼'
  },
  {
    id: '海路放行者',
    name: '海路放行者',
    description: '在冒險中免戰說服傑克斯少校，或在正面戰鬥中將其擊敗。',
    bonusText: '初始戰術/戰技 +10',
    badge: '⚓⚔️'
  },
  {
    id: '三王女重聚',
    name: '三王女重聚',
    description: '在單次培育中將三胞胎姊妹（紅花、艾莉卡、艾蜜莉亞）全部認親重聚。',
    bonusText: '開局全屬性 +10',
    badge: '👑✨'
  },
  {
    id: '蔚藍大富翁',
    name: '蔚藍大富翁',
    description: '在培育過程中，女兒的持有金幣達到 8,000 以上。',
    bonusText: '開局金幣 +300',
    badge: '💰💎'
  },
  {
    id: '良師友誼',
    name: '良師友誼',
    description: '與同窗好友「四葉草」的好感度達到 100。',
    bonusText: '初始力量/體力 +15',
    badge: '🍀🗡️'
  },
  {
    id: '永遠的學院生',
    name: '永遠的學院生',
    description: '與同窗好友「雪舞」的好感度達到 100。',
    bonusText: '初始感受/魔法技術 +15',
    badge: '❄️🔮'
  },
  {
    id: '皇家圖書館學伴',
    name: '皇家圖書館學伴',
    description: '與同窗好友「珊珊」的好感度達到 100。',
    bonusText: '初始智力/氣質 +15',
    badge: '📖👓'
  },
  {
    id: '逆天改命',
    name: '逆天改命',
    description: '艾莉卡在驛站觸發的「黑鑽賭局」中憑強運盲擲獲勝，贏得賭場產權。',
    bonusText: '初始防禦 +10，大成功率額外 +5%',
    badge: '🎲💎'
  },
  {
    id: '收穫祭之霸',
    name: '收穫祭之霸',
    description: '在年度 10 月收穫祭中，任一賽道獲得第一名冠軍。',
    bonusText: '初始王國名望 +50',
    badge: '🏆🎉'
  }
];
