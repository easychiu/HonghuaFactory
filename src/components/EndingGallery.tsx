import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Trophy, Lock, X, Eye } from 'lucide-react';

// All possible endings in the game
const ALL_ENDINGS = [
  { id: 'infinite_observer', name: '無限週目的觀測者', title: '命運之神', description: '妳已看透了無數次蔚藍海岸王國的興衰與命運循環。這一次，妳打破了第四面牆，反客為主，成為了引導後續命運軌跡的系統「命運女神」。' },
  { id: 'binlang_monopoly', name: '蔚藍檳榔大托拉斯', title: '歐陸提神產業帝國總裁', description: '紅花與商老爸一拍即合，將提神「檳榔」實現了工業化大生產與全渠道壟斷。現在，從王國騎士到帝國魔法師，每天早上都必須來一顆紅花牌檳榔，用經濟壟斷支配了整個歐陸！' },
  { id: 'lucky_lay_flat', name: '天選的躺平女王', title: '強運登基者', description: '艾莉卡什麼都沒學，整天躺平。然而，偽王突然在吃骨頭時噎死，敵軍首領行軍時被雷劈死，保皇黨與叛軍內鬥瓦解。在眾人的驚嘆聲與跪迎下，艾莉卡一臉懵逼地戴上了皇冠。' },
  { id: 'shadow_cabinet', name: '第五季的影子內閣', title: '幕後支配者', description: '艾蜜莉亞藉由文臣父親的人脈與自身絕頂的智慧，扶植了一位傀儡國王，自己與青梅竹馬 yv、jumbo 組成核心特務與影子軍政內閣，在黑暗中絕對支配著國家的命脈。' },
  { id: 'phantom_thief_triplets', name: '暗夜的蔚藍三連星', title: '義賊怪盜三胞胎', description: '三姊妹在吟遊詩人爸爸的藝術熏陶下重聚，放棄了沉重的復國大任，化身為怪盜團。她們專偷當年瓜分王國的無良貴族，讓優雅的魯特琴樂章成為夜空中權貴們的噩夢。' },
  { id: 'royal_return', name: '王女的回歸', title: '蔚藍海岸王國女王', description: '三胞胎公主團結一致，以無可挑剔的帝王學識與優雅姿態重登王位。她們共同治理國家，洗刷了內亂的分裂，使蔚藍海岸王國重新迎來了繁榮與復興。' },
  { id: 'three_revolution', name: '三女的革命', title: '蔚藍共和國執政官', description: '三姊妹聯手發起轟轟烈烈的大革命，用武力推翻了腐敗的封建王權。她們宣布廢除舊體制，建立了歐陸第一個由平民與姊妹共同執政的「蔚藍共和國」。' },
  { id: 'three_shelter', name: '三女的結義', title: '蔚藍庇護所創始人', description: '她們決定放下王室血海深仇，以博愛與慈悲之心，在蔚藍海岸邊建立了一座收容所有因戰火流離失所之孤兒的「蔚藍庇護所」，成為大陸上最溫暖的傳說。' },
  { id: 'duet_adventurers', name: '兩女的結伴', title: '流浪雙子冒險者', description: '姊妹重逢認親後，放下國家的重擔，作為彼此最信任的戰鬥夥伴，肩並肩浪跡天涯，寫下了屬於雙人冒險者的無數傳奇。' },
  { id: 'prince_marriage', name: '嫁給王子', title: '帝國王妃', description: '女兒以絕世的美貌、典雅的宮廷禮儀與高尚道德，深深吸引了鄰國王子，舉辦了舉世矚目的盛大婚禮，過著幸福快樂的生活。' },
  { id: 'court_official', name: '宮廷女官長', title: '內宮大管家', description: '憑藉出眾的治國才華與宮廷禮儀，女兒成為掌控內廷規章與百官輔佐的宮廷女官長，深受國王與貴族們的敬重。' },
  { id: 'valkyrie_hero', name: '救世女勇者', title: '傳奇勇者', description: '女兒承襲了父親的武藝衣缽，手持神兵擊敗了企圖侵略大陸的古老魔王，名震天下，被萬民歌頌為新一代的救世女勇者！' },
  { id: 'holy_nun', name: '聖潔大修女', title: '神之代言人', description: '一生不沾染任何罪孽，虔誠侍奉神明，安撫病痛與貧民。女兒最終被推選為大修道院的最高主持，名列王國聖人名錄。' },
  { id: 'bounty_hunter', name: '賞金獵人', title: '荒野孤狼', description: '女兒成為了游走在法律邊緣的賞金獵人，只要給足金幣，不論是林間盜匪還是凶猛魔獸，都難逃她的追獵。' },
  { id: 'famous_painter', name: '知名畫家', title: '藝術巨匠', description: '女兒的畫作筆觸充滿了無窮的感性與哲思，一幅畫在王都拍賣會能賣出數千金幣天價，其作品被永久保存在國家美術館中。' },
  { id: 'mob_boss', name: '黑幫老大', title: '地下教父', description: '沾染深重罪孽的女兒，用鐵血與手腕統合了王國的地下黑市與盜賊公會，成為令人聞風喪膽的地下秩序掌控者。' },
  { id: 'courtesan', name: '酒店花魁', title: '蔚藍海岸交際花', description: '女兒憑藉絕頂魅力周旋於富商與王公貴族之間，傾倒眾生，無數權貴拜倒在她的石榴裙下，左右著王國的幕後政商決策。' },
  { id: 'beggar', name: '流浪漢', title: '街頭乞討者', description: '由於無法承受培育的重壓與高昂的疲勞，女兒精神崩潰，最終流落街頭，成為港口旁靠討薪水度日的一名流浪乞討者。' },
  { id: 'housewife', name: '平凡的主婦', title: '普通市民', description: '沒有出類拔萃的特長，也沒有沾染罪惡。女兒嫁給了城裡一位勤勞的麵包師傅，生兒育女，過著平凡、安穩且溫馨的生活。' },
];

const getEndingVisuals = (id: string) => {
  switch (id) {
    case 'infinite_observer':
      return { color: '#e0aaff', badge: '👁️🔮🌌', glow: 'rgba(224, 170, 255, 0.45)', bg: 'radial-gradient(circle, #240046 0%, #030008 100%)' };
    case 'binlang_monopoly':
      return { color: '#80ed99', badge: '🍃💰🏭', glow: 'rgba(128, 237, 153, 0.45)', bg: 'radial-gradient(circle, #132a13 0%, #020802 100%)' };
    case 'lucky_lay_flat':
      return { color: '#ffb703', badge: '🛌🍀👑', glow: 'rgba(255, 183, 3, 0.45)', bg: 'radial-gradient(circle, #3a2e05 0%, #0d0a01 100%)' };
    case 'shadow_cabinet':
      return { color: '#1d3557', badge: '👥🕶️🏛️', glow: 'rgba(29, 53, 87, 0.45)', bg: 'radial-gradient(circle, #0b132b 0%, #010204 100%)' };
    case 'phantom_thief_triplets':
      return { color: '#f72585', badge: '💎🎩🎵', glow: 'rgba(247, 37, 133, 0.45)', bg: 'radial-gradient(circle, #3c0c27 0%, #0f0209 100%)' };
    case 'royal_return':
      return { color: '#ffd700', badge: '👑👸✨', glow: 'rgba(255, 215, 0, 0.45)', bg: 'radial-gradient(circle, #3a2e05 0%, #0d0a01 100%)' };
    case 'three_revolution':
      return { color: '#d90429', badge: '✊🏴🚩', glow: 'rgba(217, 4, 41, 0.45)', bg: 'radial-gradient(circle, #38040e 0%, #0d0103 100%)' };
    case 'three_shelter':
      return { color: '#4ea8de', badge: '🏡🤝❤️', glow: 'rgba(78, 168, 222, 0.45)', bg: 'radial-gradient(circle, #0c2b3a 0%, #010a0f 100%)' };
    case 'duet_adventurers':
      return { color: '#48cae4', badge: '🎒⚔️🗺️', glow: 'rgba(72, 202, 228, 0.45)', bg: 'radial-gradient(circle, #072a33 0%, #010a0d 100%)' };
    case 'prince_marriage':
      return { color: '#ffb7b2', badge: '💍🤴✨', glow: 'rgba(255, 183, 178, 0.45)', bg: 'radial-gradient(circle, #3a1518 0%, #0d0304 100%)' };
    case 'court_official':
      return { color: '#06d6a0', badge: '📜🎓🏛️', glow: 'rgba(6, 214, 160, 0.35)', bg: 'radial-gradient(circle, #023326 0%, #000a07 100%)' };
    case 'valkyrie_hero':
      return { color: '#ef476f', badge: '🛡️⚔️🌟', glow: 'rgba(239, 71, 111, 0.45)', bg: 'radial-gradient(circle, #380c16 0%, #0d0104 100%)' };
    case 'holy_nun':
      return { color: '#b5e2fa', badge: '⛪🤍🙏', glow: 'rgba(181, 226, 250, 0.35)', bg: 'radial-gradient(circle, #10253c 0%, #020a12 100%)' };
    case 'bounty_hunter':
      return { color: '#f77f00', badge: '🤠🐺🪙', glow: 'rgba(247, 127, 0, 0.45)', bg: 'radial-gradient(circle, #3c2005 0%, #0f0701 100%)' };
    case 'famous_painter':
      return { color: '#ffc6ff', badge: '🎨🖌️🖼️', glow: 'rgba(255, 198, 255, 0.45)', bg: 'radial-gradient(circle, #2d162f 0%, #0d040e 100%)' };
    case 'mob_boss':
      return { color: '#343a40', badge: '😈🥃⛓️', glow: 'rgba(52, 58, 64, 0.45)', bg: 'radial-gradient(circle, #1c1f22 0%, #070809 100%)' };
    case 'courtesan':
      return { color: '#ff70a6', badge: '💋🌸🍷', glow: 'rgba(255, 112, 166, 0.45)', bg: 'radial-gradient(circle, #3a1523 0%, #0f0509 100%)' };
    case 'beggar':
      return { color: '#a3a1bc', badge: '🥖📦🌧️', glow: 'rgba(163, 161, 188, 0.35)', bg: 'radial-gradient(circle, #1f1b2c 0%, #0a0812 100%)' };
    case 'housewife':
      return { color: '#e9c46a', badge: '🍳🍞🏡', glow: 'rgba(233, 196, 106, 0.35)', bg: 'radial-gradient(circle, #32250d 0%, #0a0702 100%)' };
    default:
      return { color: '#a3a1bc', badge: '🧳⛺🦅', glow: 'rgba(163, 161, 188, 0.35)', bg: 'radial-gradient(circle, #1f1b2c 0%, #0a0812 100%)' };
  }
};

export const EndingGallery: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state } = useGame();
  const { completedEndings = [] } = state;
  const [selectedEnding, setSelectedEnding] = useState<string | null>(null);

  const unlockedCount = completedEndings.length;
  const totalCount = ALL_ENDINGS.length;

  const selected = selectedEnding ? ALL_ENDINGS.find(e => e.id === selectedEnding) : null;
  const selectedVis = selected ? getEndingVisuals(selected.id) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-4xl p-6 animate-slide-up border-2 border-[#d4af37]/35 shadow-[0_0_35px_rgba(212,175,55,0.2)] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-[#d4af37] bg-clip-text text-transparent flex items-center gap-2">
              <Trophy size={20} /> 結局圖鑑
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              已解鎖 {unlockedCount} / {totalCount} 個結局
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 transition-all text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#ffd700] rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Selected Ending Detail */}
        {selected && selectedVis && (
          <div className="mb-6 p-5 rounded-xl animate-slide-up" style={{ background: selectedVis.bg, border: `2px solid ${selectedVis.color}`, boxShadow: `0 0 20px ${selectedVis.glow}` }}>
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">{selectedVis.badge}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold" style={{ color: selectedVis.color }}>{selected.name}</h3>
                <p className="text-xs text-slate-400 mb-2">{selected.title}</p>
                <p className="text-sm text-slate-300 leading-relaxed text-justify">{selected.description}</p>
              </div>
              <button onClick={() => setSelectedEnding(null)} className="p-1 text-slate-500 hover:text-white transition-all flex-shrink-0">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Ending Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ALL_ENDINGS.map((ending) => {
            const isUnlocked = completedEndings.includes(ending.id);
            const vis = getEndingVisuals(ending.id);
            const isSelected = selectedEnding === ending.id;

            return (
              <button
                key={ending.id}
                onClick={() => isUnlocked && setSelectedEnding(isSelected ? null : ending.id)}
                className={`relative p-3 rounded-xl border transition-all text-left ${
                  isUnlocked
                    ? 'cursor-pointer hover:scale-[1.02]'
                    : 'cursor-not-allowed opacity-40'
                } ${isSelected ? 'ring-2 ring-offset-1 ring-offset-transparent' : ''}`}
                style={{
                  background: isUnlocked ? vis.bg : 'rgba(15,12,25,0.8)',
                  borderColor: isUnlocked ? vis.color + '80' : 'rgba(50,50,60,0.3)',
                  boxShadow: isUnlocked ? `0 0 12px ${vis.glow}` : 'none',
                  ...(isSelected ? { ringColor: vis.color } : {})
                }}
                disabled={!isUnlocked}
              >
                {/* Badge */}
                <div className="text-lg mb-1.5">
                  {isUnlocked ? vis.badge : <Lock size={18} className="text-slate-600" />}
                </div>

                {/* Name */}
                <div className="text-xs font-bold truncate" style={{ color: isUnlocked ? vis.color : '#4a4a5a' }}>
                  {isUnlocked ? ending.name : '？？？'}
                </div>

                {/* Title */}
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {isUnlocked ? ending.title : '未解鎖'}
                </div>

                {/* View indicator */}
                {isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <Eye size={12} className="text-slate-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {unlockedCount < totalCount && (
          <p className="text-center text-xs text-slate-600 mt-4">
            💡 提示：嘗試不同的主角、父親背景與養育策略來解鎖更多結局！
          </p>
        )}
      </div>
    </div>
  );
};
