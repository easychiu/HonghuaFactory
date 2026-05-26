import type { Activity, Item } from '../types';

export const ACTIVITIES: Activity[] = [
  // --- 打工 (Jobs) ---
  {
    id: 'farm',
    name: '農場打工',
    type: 'work',
    cost: 0,
    reward: 10,
    description: '在烈日下耕作，鍛鍊體力與耐力。',
    statChanges: { stamina: 3, strength: 2, intelligence: -1, stress: 3 },
    effectDescription: '體力+3, 力量+2, 智力-1, 疲勞+3, 金幣+10'
  },
  {
    id: 'church',
    name: '教堂義工',
    type: 'work',
    cost: 0,
    reward: 0,
    description: '協助修女打掃教堂、照料信徒，提升道德與信仰並洗滌罪孽。',
    statChanges: { piety: 4, morality: 3, strength: -1, sin: -3, stress: 1 },
    effectDescription: '信仰+4, 道德+3, 力量-1, 罪孽-3, 疲勞+1, 金幣+0'
  },
  {
    id: 'maid',
    name: '豪宅女僕',
    type: 'work',
    cost: 0,
    reward: 15,
    description: '在商人家中學習禮儀與打掃，培養魅力、禮儀與細心。',
    statChanges: { charisma: 2, elegance: 3, sensitivity: 1, stamina: -1, stress: 4 },
    effectDescription: '魅力+2, 禮儀+3, 感受+1, 體力-1, 疲勞+4, 金幣+15'
  },
  {
    id: 'graveyard',
    name: '墓地守衛',
    type: 'work',
    cost: 0,
    reward: 22,
    description: '在深夜看守墓園，直面恐懼，但可能因接觸死靈而沾染罪孽。',
    statChanges: { sensitivity: 3, magicSkill: 2, sin: 2, charisma: -2, stress: 5 },
    effectDescription: '感受+3, 魔法+2, 罪孽+2, 魅力-2, 疲勞+5, 金幣+22'
  },

  // --- 學習 (Studies) ---
  {
    id: 'martial_arts',
    name: '武術鍛鍊',
    type: 'study',
    cost: 20,
    reward: 0,
    description: '跟隨教官學習劍術與防身格鬥，增強身體素質。',
    statChanges: { strength: 4, combatSkill: 4, stress: 2 },
    effectDescription: '力量+4, 戰鬥技術+4, 疲勞+2, 金幣-20'
  },
  {
    id: 'magic_class',
    name: '魔法研究',
    type: 'study',
    cost: 25,
    reward: 0,
    description: '拜訪大魔法師，學習古老元素與咒語釋放。',
    statChanges: { intelligence: 3, magicSkill: 5, stress: 3 },
    effectDescription: '智力+3, 魔法技術+5, 疲勞+3, 金幣-25'
  },
  {
    id: 'science',
    name: '自然科學',
    type: 'study',
    cost: 15,
    reward: 0,
    description: '研讀天文、地理與數學，探求世界真理，但可能降低感性信仰。',
    statChanges: { intelligence: 5, piety: -2, stress: 2 },
    effectDescription: '智力+5, 信仰-2, 疲勞+2, 金幣-15'
  },
  {
    id: 'theology',
    name: '神學研習',
    type: 'study',
    cost: 12,
    reward: 0,
    description: '閱讀聖典與教義，感悟生命的崇高與秩序，稍微減少罪孽。',
    statChanges: { piety: 5, morality: 3, sin: -1, stress: 1 },
    effectDescription: '信仰+5, 道德+3, 罪孽-1, 疲勞+1, 金幣-12'
  },
  {
    id: 'poetry',
    name: '文學詩歌',
    type: 'study',
    cost: 15,
    reward: 0,
    description: '撰寫詩歌、研讀藝術與音樂，提高氣質、品味與感受。',
    statChanges: { sensitivity: 4, charisma: 2, art: 4, stress: 2 },
    effectDescription: '感受+4, 魅力+2, 氣質+4, 疲勞+2, 金幣-15'
  },

  // --- 休息 (Rest) ---
  {
    id: 'rest_home',
    name: '在家休息',
    type: 'rest',
    cost: 0,
    reward: 0,
    description: '在家安穩地睡上一覺，稍微釋放累積的壓力。',
    statChanges: { stress: -20 },
    effectDescription: '疲勞-20'
  },
  {
    id: 'rest_vacation',
    name: '野外度假',
    type: 'rest',
    cost: 30,
    reward: 0,
    description: '帶女兒前往郊外散心、泡溫泉，極大釋放壓力，增進父女感情。',
    statChanges: { stress: -60, sensitivity: 1 },
    effectDescription: '疲勞-60, 感受+1, 父親親密度+3, 金幣-30'
  }
];

export const ITEMS: Item[] = [
  {
    id: 'steel_sword',
    name: '鋼鐵十字長劍',
    description: '教官推薦的精鍛鐵劍，增加戰鬥力。',
    price: 150,
    type: 'weapon',
    statChanges: { combatSkill: 25, strength: 8 }
  },
  {
    id: 'silver_armor',
    name: '銀白女武神胸甲',
    description: '保護女兒免受威脅的亮銀鎧甲，防禦力驚人。',
    price: 250,
    type: 'armor',
    statChanges: { stamina: 35, combatSkill: 15 },
    outfitChange: 'armor'
  },
  {
    id: 'luxury_dress',
    name: '皇家絲綢華麗洋裝',
    description: '穿上後宛如落入凡間的精靈公主，極大提升魅力與名望。',
    price: 350,
    type: 'dress',
    statChanges: { charisma: 50, reputation: 25 },
    outfitChange: 'dress'
  },
  {
    id: 'summer_dress',
    name: '盛夏微風連身裙',
    description: '清涼舒適的藍白裙裝，洋溢著青春的氣息。',
    price: 120,
    type: 'dress',
    statChanges: { charisma: 20, sensitivity: 10 },
    outfitChange: 'summer'
  },
  {
    id: 'strawberry_cake',
    name: '特製草莓千層蛋糕',
    description: '甜美濃郁的手作甜點，能夠瞬間消除女兒的疲憊。',
    price: 30,
    type: 'food',
    statChanges: { stress: -40, stamina: 5 }
  },
  {
    id: 'ancient_grimoire',
    name: '大賢者遺落的古老魔導書',
    description: '記載著晦澀魔法符文的厚重書本，開啟魔法之門。',
    price: 180,
    type: 'book',
    statChanges: { intelligence: 30, magicSkill: 20 }
  },
  {
    id: 'refine_ore',
    name: '精煉礦石',
    description: '在野外冒險修行中獲得的特殊礦石，可用於在胡村姑的木工作坊精煉升級武器與防具。',
    price: 300,
    type: 'book',
    statChanges: {}
  },
  {
    id: 'oak_hardwood',
    name: '橡木硬材',
    description: '在野外或木工作坊獲得的堅硬橡木，用於提升精煉成功率與極限。',
    price: 500,
    type: 'book',
    statChanges: {}
  }
];

export interface EndingCondition {
  id: string;
  name: string;
  description: string;
  image: string; // 結局配圖 Prompt
  evaluator: (stats: any, gold: number, relationship: number) => boolean;
}

export const ENDINGS: EndingCondition[] = [
  {
    id: 'queen',
    name: '神聖帝國女王',
    description: '在你的精心培育下，女兒展現出驚人的統治才能與高尚人格，在老國王禪讓後加冕為新一代的女王，開創了繁榮治世。',
    image: 'A glorious anime queen standing on a royal balcony overlooking a medieval fantasy castle city, wearing a majestic crown and golden cape, beautiful lighting, artstation, premium masterwork.',
    evaluator: (stats) => 
      stats.reputation >= 600 && 
      stats.charisma >= 500 && 
      stats.intelligence >= 400 && 
      stats.morality >= 400 &&
      (stats.elegance || 0) >= 400 &&
      (stats.art || 0) >= 400 &&
      (stats.sin || 0) <= 50
  },
  {
    id: 'hero',
    name: '救世女勇者',
    description: '手持聖劍擊退深淵魔物，女兒繼承了你的英名，成為王國人人敬仰的傳奇勇者。不論前方有多少黑暗，她都將一劍斬除！',
    image: 'A female anime hero in shining silver plate armor holding a glowing holy sword high, majestic battlefield background with dramatic clouds, detailed fantasy art, high quality.',
    evaluator: (stats) => 
      stats.combatSkill >= 500 && 
      stats.strength >= 450 && 
      stats.stamina >= 400 && 
      stats.reputation >= 400 &&
      (stats.sin || 0) <= 99
  },
  {
    id: 'dark_lord',
    name: '墮落暗黑魔王',
    description: '在極度的壓力和扭曲的心智下，女兒捨棄了道德與虔誠，釋放了潛在的黑暗魔力，成為統領無數魔族、反攻人類王國的恐怖魔王。',
    image: 'A dark anime sorceress queen sitting on a throne of black skulls, glowing red eyes, purple magical energy floating around, dark fantasy gothic aesthetic, detailed masterpiece.',
    evaluator: (stats) => 
      stats.magicSkill >= 500 && 
      stats.stress >= 250 && 
      stats.morality <= 80 && 
      stats.piety <= 80 &&
      (stats.sin || 0) >= 150
  },
  {
    id: 'archmage',
    name: '皇家大魔法師',
    description: '女兒以驚人的智慧與天賦參透了真理的奧秘，成為皇家魔法研究院的院長，掌控風雨雷電與空間魔法的精髓。',
    image: 'A young female anime mage holding a glowing blue magic staff, reading a floating magical book in a library filled with glowing crystals, dynamic spell effects, masterpiece.',
    evaluator: (stats) => 
      stats.magicSkill >= 500 && 
      stats.intelligence >= 500 && 
      stats.reputation >= 300
  },
  {
    id: 'nun',
    name: '聖潔大修女',
    description: '洗盡鉛華，女兒一生奉獻給神明。她前往邊境的孤兒院與教堂，用無私的愛救贖了無數無家可歸的孩子，死後被追封為聖女。',
    image: 'A gentle and beautiful anime nun with clasped hands in a grand gothic cathedral, rays of sunshine filtering through stained glass windows, serene and spiritual lighting.',
    evaluator: (stats) => 
      stats.piety >= 500 && 
      stats.morality >= 500 &&
      (stats.sin || 0) === 0
  },
  {
    id: 'prime_minister',
    name: '帝國開國宰相',
    description: '女兒憑藉超凡的智略與政治手腕步入朝堂，輔佐君王推行法治，整治貪官，成為王國歷史上第一位女宰相。',
    image: 'A mature anime woman in elegant official robes holding a scroll, standing in a grand parliament hall of a fantasy kingdom, serious yet wise expression.',
    evaluator: (stats) => 
      stats.intelligence >= 500 && 
      stats.morality >= 300 && 
      stats.reputation >= 300 &&
      (stats.sin || 0) <= 50
  },
  {
    id: 'rich_merchant',
    name: '跨國商會大會長',
    description: '掌握了王國的經濟命脈！女兒長大後開始經商，收購了鐵路與港口，開創了自己的跨國大商會，成為富甲一方的傳奇女性。',
    image: 'An elegant anime noblewoman holding a gold coin, surrounded by treasure chests, velvet drapes, and maps of trade routes, golden hour lighting, rich masterwork.',
    evaluator: (stats, gold) => 
      gold >= 1500 && 
      stats.intelligence >= 300
  },
  {
    id: 'general',
    name: '帝國不敗女將軍',
    description: '女兒率領鋼鐵洪流般的王國騎士團在邊疆拒敵千里，軍紀嚴明，戰無不勝，威名傳遍整個大陸。',
    image: 'A female anime general in military uniform standing on a fortress wall, crimson cape waving in the wind, a massive army marching behind, cinematic lighting.',
    evaluator: (stats) => 
      stats.combatSkill >= 400 && 
      stats.strength >= 300 && 
      stats.reputation >= 300 &&
      stats.morality >= 150
  },
  {
    id: 'rebel_leader',
    name: '反抗軍首領',
    description: '不滿貴族階級的殘暴統治，女兒高舉反抗的大旗，帶領受壓迫的百姓建立了自由同盟，向腐朽的帝國發起挑戰。',
    image: 'A rebel female anime warrior standing on a barricade holding a rugged flag, broken chains, flames in the background, revolutionary heroic aesthetic.',
    evaluator: (stats) => 
      stats.combatSkill >= 300 && 
      stats.strength >= 300 &&
      stats.morality <= 150 && 
      (stats.sin || 0) >= 50
  },
  {
    id: 'royal_maid',
    name: '王宮首席侍女長',
    description: '進入王宮服務的女兒，憑藉認真、勤快與出色的禮儀，被提拔為侍奉國王與王后的首席侍女長，受到王室的高度信賴。',
    image: 'A beautiful anime maid in a premium detailed classic maid dress, standing in a sunlit palace corridor, carrying a silver tray with tea, elegant smile.',
    evaluator: (stats) => 
      stats.stamina >= 250 && 
      stats.charisma >= 200 && 
      stats.morality >= 200 &&
      (stats.elegance || 0) >= 250
  },
  {
    id: 'ordinary_marriage',
    name: '幸福的普通人',
    description: '她沒有追求至高無上的名望，而是選擇與深愛她的伴侶結婚。在溫馨的小屋裡，每天享受著親手烘培的麵包與家人的歡聲笑語，這是最平凡卻也最奢侈的幸福。',
    image: 'A happy young anime couple standing in front of a cozy country house surrounded by a blooming flower garden, sunbeams falling on them, warm and sweet mood.',
    evaluator: (_, __, relationship) => 
      relationship >= 150
  },
  {
    id: 'wanderer',
    name: '自由的流浪冒險家',
    description: '女兒不願受到任何拘束，背起行囊踏上了無盡的旅途。她看過極光的絢麗，也見過大漠的孤煙，繼續在廣袤的大陸上書寫自己的傳奇。',
    image: 'An anime traveler girl wearing a cloak and backpack, looking down at a beautiful green valley from a mountain cliff, birds flying, fantasy adventure landscape.',
    evaluator: () => true // 默認結局
  }
];