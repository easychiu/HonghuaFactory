import React, { useState } from 'react';
import { useGame, ITEMS } from '../contexts/GameContext';
import type { Item } from '../types';
import { ShoppingCart, Coins, Heart, Shield, Brain, Sparkles, Trophy, HelpCircle, ArrowLeft, Hammer } from 'lucide-react';
import { audioManager } from '../utils/audio';

const STAT_ICONS: Record<string, any> = {
  stamina: Heart,
  strength: Shield,
  intelligence: Brain,
  charisma: Sparkles,
  combatSkill: Shield,
  magicSkill: Brain,
  reputation: Trophy,
  stress: Shield
};

const STAT_LABELS: Record<string, string> = {
  stamina: '體力',
  strength: '力量',
  intelligence: '智力',
  charisma: '魅力',
  morality: '道德',
  piety: '信仰',
  sensitivity: '感受',
  combatSkill: '戰鬥技術',
  magicSkill: '魔法技術',
  reputation: '名望',
  stress: '疲勞'
};

export const StoreScreen: React.FC = () => {
  const { state, buyItem, setScreen, refineEquipment } = useGame();
  const { daughter } = state;

  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'buy' | 'refine'>('buy');

  const refineOresCount = state.inventory.filter(id => id === 'refine_ore').length;
  const ownedRefineableItems = ITEMS.filter(item => 
    state.inventory.includes(item.id) && (item.type === 'weapon' || item.type === 'armor')
  );

  const handleBuy = (item: Item) => {
    const res = buyItem(item.id);
    if (res.success) {
      setMessage({ text: res.message, isError: false });
      audioManager.playSfx('sfx_coin.mp3', 0.55);
    } else {
      setMessage({ text: res.message, isError: true });
      audioManager.playSfx('sfx_click.mp3');
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleRefine = (itemId: string) => {
    const res = refineEquipment(itemId);
    if (res.success) {
      setMessage({ text: res.message, isError: false });
      audioManager.playSfx('sfx_level_up.mp3');
    } else {
      setMessage({ text: res.message, isError: true });
      audioManager.playSfx('sfx_click.mp3');
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 w-full max-w-5xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="glass-panel p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={22} className="text-[#d4af37]" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {state.adventure ? '荒野神秘商店' : '皇家武器與禮品商會'}
            </h1>
            <p className="text-xs text-slate-400">
              {state.adventure 
                ? '冒險中的神秘商人，販售稀有禁忌道具與走私裝備。' 
                : '購買武器、護甲、華麗服飾或藥品，直接提升女兒屬性。'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap justify-end">
          {/* Gold */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.25)] rounded-lg text-xs sm:text-sm">
            <Coins className="text-[#d4af37]" size={16} />
            <span className="font-bold text-[#ffd700]">{daughter.gold} G</span>
          </div>

          {/* Refine Ores */}
          {!state.adventure && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs sm:text-sm">
              <span className="text-slate-400">💎 精煉礦石:</span>
              <span className="font-bold text-slate-200">{refineOresCount} 個</span>
            </div>
          )}

          <button 
            onClick={() => {
              audioManager.playSfx('sfx_click.mp3');
              if (state.adventure) {
                setScreen('adventure');
              } else {
                setScreen('main');
              }
            }} 
            className="btn-fantasy-sec text-xs flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            {state.adventure ? '返回冒險地圖' : '返回起居室'}
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {message && (
        <div className={`p-4 rounded-lg text-sm font-semibold border ${
          message.isError 
            ? 'bg-red-950/80 border-red-500/50 text-red-200' 
            : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
        } animate-bounce text-center shadow-lg`}>
          {message.text}
        </div>
      )}

      {/* Tab Switcher - only show if not in adventure map */}
      {!state.adventure && (
        <div className="flex gap-2 border-b border-slate-900/60 pb-3">
          <button
            type="button"
            onClick={() => {
              audioManager.playSfx('sfx_click.mp3');
              setActiveTab('buy');
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'buy'
                ? 'bg-[#d4af37]/15 border border-[#d4af37]/60 text-[#ffd700] shadow-[0_0_8px_rgba(212,175,55,0.15)]'
                : 'bg-slate-950/40 border border-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart size={14} />
            🛒 購買商品
          </button>
          <button
            type="button"
            onClick={() => {
              audioManager.playSfx('sfx_click.mp3');
              setActiveTab('refine');
            }}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'refine'
                ? 'bg-[#d4af37]/15 border border-[#d4af37]/60 text-[#ffd700] shadow-[0_0_8px_rgba(212,175,55,0.15)]'
                : 'bg-slate-950/40 border border-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hammer size={14} />
            🔨 胡村姑的精煉作坊
          </button>
        </div>
      )}

      {/* Conditional Panels */}
      {(activeTab === 'buy' || state.adventure) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ITEMS.filter((item) => {
            if (item.id === 'refine_ore') {
              return false; // Hide refine ore from purchase shelf
            }
            if (item.id.startsWith('bm_')) {
              return state.adventure !== null;
            }
            return true;
          }).map((item) => {
            let isBlackMarketDiscount = false;
            let isMerchantDiscount = false;
            let isCaravanDiscount = state.seasonalEvent === 'caravan';
            let isTaxMarkup = state.seasonalEvent === 'tax';
            let finalPrice = item.price;

            if (item.id.startsWith('binlang_') && state.inventory.includes('black_market_unlocked')) {
              isBlackMarketDiscount = true;
              finalPrice = Math.round(item.price * 0.5);
            } else if (daughter.fatherBackground === 'merchant') {
              isMerchantDiscount = true;
              finalPrice = Math.round(item.price * 0.8);
            }

            if (isCaravanDiscount) {
              finalPrice = Math.round(finalPrice * 0.8);
            } else if (isTaxMarkup) {
              finalPrice = Math.round(finalPrice * 1.2);
            }

            return (
              <div key={item.id} className="glass-panel p-5 flex flex-col justify-between gap-4 border border-slate-800/80 hover:border-[rgba(212,175,55,0.3)] transition-all">
                
                {/* Title & Price */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 flex-wrap">
                        {item.name}
                        {isBlackMarketDiscount && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold rounded">
                            5折批發
                          </span>
                        )}
                        {!isBlackMarketDiscount && isMerchantDiscount && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-950 border border-amber-800 text-[#ffd700] font-bold rounded">
                            8折商惠
                          </span>
                        )}
                        {isCaravanDiscount && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold rounded">
                            商旅8折
                          </span>
                        )}
                        {isTaxMarkup && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-red-950 border border-red-800 text-red-400 font-bold rounded">
                            徵稅+20%
                          </span>
                        )}
                      </h3>
                    </div>
                    <span className="shrink-0 text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 text-[#ffd700] font-bold rounded-lg flex items-center gap-1">
                      <Coins size={12} />
                      {finalPrice !== item.price ? (
                        <span className="flex items-center gap-1">
                          <span className="line-through text-slate-500 mr-0.5">{item.price}</span>
                          <span>{finalPrice} G</span>
                        </span>
                      ) : (
                        <span>{item.price} G</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
                </div>

                {/* Stat changes & Purchase Button */}
                <div className="space-y-4">
                  {/* Stat boosts list */}
                  <div className="bg-slate-950/50 border border-slate-900/60 p-3 rounded-lg flex flex-wrap gap-2">
                    {Object.entries(item.statChanges).map(([key, val]) => {
                      const Icon = STAT_ICONS[key] || HelpCircle;
                      const label = STAT_LABELS[key] || key;
                      const isPositive = val > 0;
                      
                      return (
                        <span 
                          key={key} 
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
                            isPositive 
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' 
                              : 'bg-red-950/40 text-red-400 border border-red-900/50'
                          }`}
                        >
                          <Icon size={10} />
                          {label} {isPositive ? `+${val}` : val}
                        </span>
                      );
                    })}
                    {item.outfitChange && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-pink-950/40 text-pink-400 border border-pink-900/50 flex items-center gap-1">
                        👕 獲得新服裝外觀
                      </span>
                    )}
                  </div>

                  {/* Buy action */}
                  <button 
                    onClick={() => handleBuy(item)}
                    disabled={daughter.gold < finalPrice}
                    className="w-full btn-fantasy py-2.5 text-xs font-bold"
                  >
                    {daughter.gold < finalPrice ? '金幣不足' : '購入商品'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Refinement Panel */
        <div className="space-y-4">
          <div className="glass-panel p-4 flex items-center justify-between border border-slate-800 bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-[#ffd700] rounded-xl">
                <Hammer size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">🔨 胡村姑的精煉作坊</h2>
                <p className="text-xs text-slate-400">消耗金幣與「精煉礦石」來提升武器/防具屬性（最高可至 +5）</p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-[#ffd700]">
              持有礦石：{refineOresCount} 個
            </div>
          </div>

          {ownedRefineableItems.length === 0 ? (
            <div className="glass-panel p-8 text-center border border-dashed border-slate-800/80 bg-slate-950/20">
              <p className="text-slate-400 text-sm">🎒 背包中目前沒有可精煉的武器或防具。</p>
              <p className="text-slate-500 text-xs mt-2">請先前往「🛒 購買商品」購買古雅十字鐵劍或亮銀胸甲，再進行精煉！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ownedRefineableItems.map(item => {
                const refineLevels = daughter.refineLevels || {};
                const currentLevel = refineLevels[item.id] || 0;
                const isMax = currentLevel >= 5;
                const reqGold = 100 * (currentLevel + 1);
                const reqOre = currentLevel + 1;
                
                // Get upgrading stats preview
                let upgradePreview = "";
                if (item.id === 'steel_sword') upgradePreview = "戰鬥技術 +6, 力量 +3";
                else if (item.id === 'silver_armor') upgradePreview = "體力 +10, 戰鬥技術 +4";
                else if (item.id === 'bm_dark_armor') upgradePreview = "體力 +12, 戰鬥技術 +6";
                else if (item.id === 'bm_poison_dagger') upgradePreview = "戰鬥技術 +10, 罪孽 +3";

                return (
                  <div key={item.id} className="glass-panel p-5 border border-slate-800 flex flex-col justify-between gap-4 bg-slate-950/10">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          {item.name} 
                          <span className="text-[#ffd700] font-mono text-sm px-1.5 py-0.5 bg-[#ffd700]/10 border border-[#ffd700]/25 rounded">
                            +{currentLevel}
                          </span>
                        </h3>
                        {isMax && (
                          <span className="text-[10px] px-2 py-0.5 bg-yellow-950 border border-yellow-800 text-yellow-400 font-bold rounded">
                            已達上限
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-normal mb-3">{item.description}</p>
                      
                      {!isMax && (
                        <div className="text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg leading-relaxed">
                          ✨ 每次精煉升級屬性增益：<br/>
                          <span className="font-semibold text-emerald-300">{upgradePreview}</span>
                        </div>
                      )}
                    </div>

                    {!isMax ? (
                      <div className="space-y-3 mt-2">
                        <div className="flex gap-4 justify-between items-center text-xs border-t border-slate-900 pt-3">
                          <span className="text-slate-400">消耗金幣：</span>
                          <span className={`font-bold ${daughter.gold >= reqGold ? 'text-slate-200' : 'text-red-400 font-bold'}`}>
                            {reqGold} G <span className="text-slate-500 font-normal">(擁有: {daughter.gold} G)</span>
                          </span>
                        </div>
                        <div className="flex gap-4 justify-between items-center text-xs">
                          <span className="text-slate-400">消耗礦石：</span>
                          <span className={`font-bold ${refineOresCount >= reqOre ? 'text-slate-200' : 'text-red-400 font-bold'}`}>
                            {reqOre} 個 <span className="text-slate-500 font-normal">(擁有: {refineOresCount} 個)</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRefine(item.id)}
                          disabled={daughter.gold < reqGold || refineOresCount < reqOre}
                          className="w-full btn-fantasy py-2.5 text-xs font-bold mt-2"
                        >
                          進行精煉 (+{currentLevel} ➜ +{currentLevel + 1})
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 text-xs py-3 border-t border-slate-900">
                        ✨ 已發揮這件裝備的極致潛能！
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
