import type { Daughter } from '../types';

export interface EndingResult {
  id: string;
  name: string;
  title: string;
  description: string;
}

export const determineEnding = (
  daughter: Daughter,
  completedEndingsCount: number,
  _cluesCount: number,
  reunitedSisters: string[]
): EndingResult => {
  const attrs = daughter.attributes;
  const isHonghua = daughter.characterId === 'honghua';
  const isErica = daughter.characterId === 'erica';
  const isEmilia = daughter.characterId === 'emilia';
  const dad = daughter.fatherBackground;
  
  // 1. 無限週目的觀測者 (4週目及多結局解鎖)
  if (completedEndingsCount >= 4) {
    return {
      id: 'infinite_observer',
      name: '無限週目的觀測者',
      title: '命運之神',
      description: '妳已看透了無數次蔚藍海岸王國的興衰與命運循環。這一次，妳打破了第四面牆，反客為主，成為了引導後續命運軌跡的系統「命運女神」。'
    };
  }

  // 2. 特化隱藏結局 (優先級高)
  
  // 蔚藍檳榔大托拉斯
  if (isHonghua && dad === 'merchant' && daughter.gold >= 8000) {
    return {
      id: 'binlang_monopoly',
      name: '蔚藍檳榔大托拉斯',
      title: '歐陸提神產業帝國總裁',
      description: '紅花與商老爸一拍即合，將提神「檳榔」實現了工業化大生產與全渠道壟斷。現在，從王國騎士到帝國魔法師，每天早上都必須來一顆紅花牌檳榔，用經濟壟斷支配了整個歐陸！'
    };
  }
  
  // 天選的躺平女王
  if (isErica && attrs.combatSkill < 120 && attrs.intelligence < 120 && attrs.art < 120) {
    return {
      id: 'lucky_lay_flat',
      name: '天選的躺平女王',
      title: '強運登基者',
      description: '艾莉卡什麼都沒學，整天躺平。然而，偽王突然在吃骨頭時噎死，敵軍首領行軍時被雷劈死，保皇黨與叛軍內鬥瓦解。在眾人的驚嘆聲與跪迎下，艾莉卡一臉懵逼地戴上了皇冠。'
    };
  }
  
  // 第五季的影子內閣
  if (isEmilia && dad === 'scholar' && attrs.intelligence >= 500) {
    return {
      id: 'shadow_cabinet',
      name: '第五季的影子內閣',
      title: '幕後支配者',
      description: '艾蜜莉亞藉由文臣父親的人脈與自身絕頂的智慧，扶植了一位傀儡國王，自己與青梅竹馬 yv、jumbo 組成核心特務與影子軍政內閣，在黑暗中絕對支配著國家的命脈。'
    };
  }

  // 暗夜的蔚藍三連星
  const hasThreeSisters = reunitedSisters.includes('erica') && reunitedSisters.includes('emilia');
  if (hasThreeSisters && dad === 'bard' && attrs.art >= 500 && attrs.morality <= 150) {
    return {
      id: 'phantom_thief_triplets',
      name: '暗夜的蔚藍三連星',
      title: '義賊怪盜三胞胎',
      description: '三姊妹在吟遊詩人爸爸的藝術熏陶下重聚，放棄了沉重的復國大任，化身為怪盜團。她們專偷當年瓜分王國的無良貴族，讓優雅的魯特琴樂章成為夜空中權貴們的噩夢。'
    };
  }

  // 3. 主線隱藏結局 (姊妹重聚)
  if (hasThreeSisters) {
    // 王女的回歸
    if (attrs.intelligence >= 450 && attrs.elegance >= 400) {
      return {
        id: 'royal_return',
        name: '王女的回歸',
        title: '蔚藍海岸王國女王',
        description: '三胞胎公主團結一致，以無可挑剔的帝王學識與優雅姿態重登王位。她們共同治理國家，洗刷了內亂的分裂，使蔚藍海岸王國重新迎來了繁榮與復興。'
      };
    }
    // 三女的革命
    if (attrs.combatSkill >= 450 && attrs.morality <= 180) {
      return {
        id: 'three_revolution',
        name: '三女的革命',
        title: '蔚藍共和國執政官',
        description: '三姊妹聯手發起轟轟烈烈的大革命，用武力推翻了腐敗的封建王權。她們宣布廢除舊體制，建立了歐陸第一個由平民與姊妹共同執政的「蔚藍共和國」。'
      };
    }
    // 三女的結義
    if (attrs.morality >= 400 && attrs.sensitivity >= 400) {
      return {
        id: 'three_shelter',
        name: '三女的結義',
        title: '蔚藍庇護所創始人',
        description: '她們決定放下王室血海深仇，以博愛與慈悲之心，在蔚藍海岸邊建立了一座收容所有因戰火流離失所之孤兒的「蔚藍庇護所」，成為大陸上最溫暖的傳說。'
      };
    }
  }

  const hasTwoSisters = reunitedSisters.length >= 1;
  if (hasTwoSisters) {
    return {
      id: 'duet_adventurers',
      name: '兩女的結伴',
      title: '流浪雙子冒險者',
      description: '姊妹重逢認親後，放下國家的重擔，作為彼此最信任的戰鬥夥伴，肩並肩浪跡天涯，寫下了屬於雙人冒險者的無數傳奇。'
    };
  }

  // 4. 常規結局 (各主角通用)
  
  // 嫁給王子
  if (attrs.elegance >= 500 && attrs.charisma >= 500 && attrs.intelligence >= 300 && attrs.morality >= 300) {
    return {
      id: 'prince_marriage',
      name: '嫁給王子',
      title: '帝國王妃',
      description: '女兒以絕世的美貌、典雅的宮廷禮儀與高尚道德，深深吸引了鄰國王子，舉辦了舉世矚目的盛大婚禮，過著幸福快樂的生活。'
    };
  }

  // 宮廷女官長
  if (attrs.elegance >= 450 && attrs.intelligence >= 400 && attrs.reputation >= 400) {
    return {
      id: 'court_official',
      name: '宮廷女官長',
      title: '內宮大管家',
      description: '憑藉出眾的治國才華與宮廷禮儀，女兒成為掌控內廷規章與百官輔佐的宮廷女官長，深受國王與貴族們的敬重。'
    };
  }

  // 救世女勇者
  if (attrs.combatSkill >= 480 && attrs.strength >= 400 && attrs.reputation >= 400 && attrs.sin <= 99) {
    return {
      id: 'valkyrie_hero',
      name: '救世女勇者',
      title: '傳奇勇者',
      description: '女兒承襲了父親的武藝衣缽，手持神兵擊敗了企圖侵略大陸的古老魔王，名震天下，被萬民歌頌為新一代的救世女勇者！'
    };
  }

  // 聖潔大修女
  if (attrs.piety >= 480 && attrs.morality >= 450 && attrs.sin === 0) {
    return {
      id: 'holy_nun',
      name: '聖潔大修女',
      title: '神之代言人',
      description: '一生不沾染任何罪孽，虔誠侍奉神明，安撫病痛與貧民。女兒最終被推選為大修道院的最高主持，名列王國聖人名錄。'
    };
  }

  // 賞金獵人
  if (attrs.combatSkill >= 350 && attrs.strength >= 300 && attrs.morality <= 150) {
    return {
      id: 'bounty_hunter',
      name: '賞金獵人',
      title: '荒野孤狼',
      description: '女兒成為了游走在法律邊緣的賞金獵人，只要給足金幣，不論是林間盜匪還是凶猛魔獸，都難逃她的追獵。'
    };
  }

  // 知名畫家
  if (attrs.art >= 450 && attrs.sensitivity >= 400) {
    return {
      id: 'famous_painter',
      name: '知名畫家',
      title: '藝術巨匠',
      description: '女兒的畫作筆觸充滿了無窮的感性與哲思，一幅畫在王都拍賣會能賣出數千金幣天價，其作品被永久保存在國家美術館中。'
    };
  }

  // 黑幫老大
  if (attrs.combatSkill >= 300 && attrs.morality <= 80 && attrs.sin >= 120) {
    return {
      id: 'mob_boss',
      name: '黑幫老大',
      title: '地下教父',
      description: '沾染深重罪孽的女兒，用鐵血與手腕統合了王國的地下黑市與盜賊公會，成為令人聞風喪膽的地下秩序掌控者。'
    };
  }

  // 酒店花魁
  if (attrs.charisma >= 450 && attrs.morality <= 100 && attrs.sin >= 80) {
    return {
      id: 'courtesan',
      name: '酒店花魁',
      title: '蔚藍海岸交際花',
      description: '女兒憑藉絕頂魅力周旋於富商與王公貴族之間，傾倒眾生，無數權貴拜倒在她的石榴裙下，左右著王國的幕後政商決策。'
    };
  }

  // 流浪漢
  if (attrs.stress >= 250 && attrs.reputation <= 50) {
    return {
      id: 'beggar',
      name: '流浪漢',
      title: '街頭乞討者',
      description: '由於無法承受培育的重壓與高昂的疲勞，女兒精神崩潰，最終流落街頭，成為港口旁靠討薪水度日的一名流浪乞討者。'
    };
  }

  // 平凡的主婦
  return {
    id: 'housewife',
    name: '平凡的主婦',
    title: '普通市民',
    description: '沒有出類拔萃的特長，也沒有沾染罪惡。女兒嫁給了城裡一位勤勞的麵包師傅，生兒育女，過著平凡、安穩且溫馨的生活。'
  };
};
