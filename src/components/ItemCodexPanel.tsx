import React from 'react';
import { useGame, ITEMS } from '../contexts/GameContext';
import { Book, HelpCircle, Award, CheckCircle2 } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface ItemCodexPanelProps {
  onClose: () => void;
}

const FUNNY_DESCS: Record<string, string> = {
  steel_sword: "教官一直推銷這把長劍，其實只是因為它庫存太多了。不過聽說老爸以前就是用它砍柴的。",
  silver_armor: "亮閃閃的女武神鎧甲，穿上去極為威風。雖然防禦效果一流，但女兒總是抱怨胸口有點緊。",
  royal_dress: "觸感極佳的絲綢洋裝。雖然穿上去立刻變成優雅淑女，但聽說乾洗費一次要花 100 G。",
  summer_dress: "清涼舒適的藍白裙裝，洋溢著青春的氣息。極為適合在大熱天出門吃冰時穿著。",
  royal_letter: "一張看似普通的宮廷推薦信，其實上面的公章是老爸當年喝醉時自己蓋的。",
  old_lute: "琴身滿是刮痕的古舊魯特琴。雖然音色有些沙啞，但只要彈起它，總能讓浮躁的心平靜下來。",
  future_gp125: "一台不知從哪個次元傳送過來的藍色摩托車，引擎聲極大，被小鎮居民舉報過好幾次。",
  giant_hammer: "據說胡村姑曾用它在十分鐘內敲出了一棟木屋。拿在手上沉甸甸的，充滿了實用的力量感。",
  binlang_ice: "口感酷涼有嚼勁！在戰鬥中嚼上一口，吐出的冰涼檳榔汁能直接將對手凍結，不愧是紅花推薦的神兵。",
  binlang_twin: "傳說中的雙子星檳榔！吃下去後會看到兩個老爸在面前跳舞，使人在短時間內潛能爆發、力量翻倍！",
  binlang_normal: "經典款包葉檳榔。紅花精心包製，提神醒腦、回復元氣，居家旅行防身必備良藥。",
  barrel_rice_cake: "香氣撲鼻的古法木桶米糕。在荒野修行累了吃上一口，甚至能引來山林仙子幫妳做大拔罐排毒。",
  holy_water: "塞特神父私下調配的神秘聖水。喝起來有一股淡淡的甜味，能奇蹟般地消除生病等一切負面狀態。",
  bm_dark_armor: "黑市走私的高級防具。穿上後能融入夜色中，但由於造型過於反派，會被教堂的人嫌棄。",
  bm_poison_dagger: "淬有劇毒的黑色雙刃。雖然在戰鬥中威力無窮，但由於沾染了黑暗氣息，會使女兒的罪孽加深。",
  bm_cheap_gp125: "黑市低價出售的二手摩托車，排氣管經常冒黑煙，但用來趕路還是相當實惠的。"
};

const BONUS_DESCS: Record<string, string> = {
  steel_sword: "初始力量 +2",
  silver_armor: "初始體力 +5",
  royal_dress: "初始魅力 +5",
  summer_dress: "初始疲勞 -5",
  royal_letter: "初始智力 +5",
  old_lute: "初始感受 +5",
  future_gp125: "初始金幣 +100",
  giant_hammer: "初始力量 +5",
  binlang_ice: "初始戰鬥技術 +2",
  binlang_twin: "初始魔法技術 +2",
  binlang_normal: "初始體力 +5",
  barrel_rice_cake: "初始體力 +5",
  holy_water: "初始信仰 +5",
  bm_dark_armor: "初始體力 +5",
  bm_poison_dagger: "初始戰鬥技術 +5",
  bm_cheap_gp125: "初始金幣 +50"
};

export const ItemCodexPanel: React.FC<ItemCodexPanelProps> = ({ onClose }) => {
  const { state } = useGame();
  const unlockedItems = state.unlockedItems || [];
  
  // Filter out refine_ore from codex list to keep it 16 main items
  const codexItems = ITEMS.filter(item => item.id !== 'refine_ore');
  const unlockedCount = codexItems.filter(item => unlockedItems.includes(item.id)).length;
  const pct = Math.round((unlockedCount / codexItems.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 md:p-6 animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-4xl p-5 sm:p-6 md:p-8 animate-slide-up border-2 border-[#d4af37]/45 shadow-[0_0_50px_rgba(212,175,55,0.25)] flex flex-col gap-6 bg-slate-905/95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Book size={26} className="text-[#d4af37]" />
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#ffd700] to-[#e9c46a] bg-clip-text text-transparent">
                📚 道具百科與收藏圖鑑
              </h2>
              <p className="text-xs text-slate-400">
                收集歷次遊戲中獲得的裝備與道具，解鎖永久開局屬性加成！
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-900 px-4 py-2 rounded-xl text-xs shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-slate-400 font-medium">收集進度:</span>
            <div className="w-24 sm:w-32 bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-[#ffd700] to-amber-500 h-full rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-bold text-[#ffd700]">{unlockedCount} / {codexItems.length} ({pct}%)</span>
          </div>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
          {codexItems.map(item => {
            const isUnlocked = unlockedItems.includes(item.id);
            const funnyDesc = FUNNY_DESCS[item.id] || "一件充滿神秘氣息的異世界道具。";
            const bonusDesc = BONUS_DESCS[item.id] || "無特殊開局加成。";

            return (
              <div 
                key={item.id} 
                className={`glass-panel p-4 flex gap-4 border transition-all ${
                  isUnlocked 
                    ? 'border-slate-800/80 bg-slate-950/30 hover:border-[#d4af37]/40 shadow-inner' 
                    : 'border-slate-950 bg-slate-950/75 opacity-70 grayscale'
                }`}
              >
                {/* Left side: Item Icon / Placeholder */}
                <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-center relative shadow-sm">
                  {isUnlocked ? (
                    <span className="text-2xl" role="img" aria-label={item.name}>
                      {item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : item.type === 'dress' ? '👗' : item.type === 'food' ? '🍬' : '📖'}
                    </span>
                  ) : (
                    <HelpCircle size={24} className="text-slate-600" />
                  )}
                  {isUnlocked && (
                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-950 border border-emerald-500 text-emerald-400 p-0.5 rounded-full">
                      <CheckCircle2 size={10} />
                    </div>
                  )}
                </div>

                {/* Right side: Info */}
                <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-100 truncate">
                        {isUnlocked ? item.name : "？？？"}
                      </h4>
                      {isUnlocked && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[#ffd700] font-semibold rounded">
                          {item.price} G
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 italic mb-2">
                      {isUnlocked ? funnyDesc : `於「${item.id.startsWith('bm_') ? '武者修行-走私黑市' : '起居室-皇家商會'}」中獲得以解鎖`}
                    </p>
                  </div>
                  
                  {/* Bonus Badge */}
                  <div className="flex items-center gap-1 mt-1">
                    <Award size={10} className="text-amber-500 shrink-0" />
                    <span className="text-[9px] font-bold text-amber-400 tracking-wide uppercase">
                      開局繼承：{bonusDesc}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer buttons */}
        <div className="border-t border-slate-800 pt-4 flex justify-end">
          <button 
            type="button" 
            onClick={() => {
              audioManager.playSfx('sfx_click.mp3');
              onClose();
            }} 
            className="btn-fantasy py-2.5 px-8 text-xs font-bold"
          >
            關閉圖鑑
          </button>
        </div>

      </div>
    </div>
  );
};
