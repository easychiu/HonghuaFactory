import React, { useState } from 'react';
import { useGame, ITEMS } from '../contexts/GameContext';
import type { Item } from '../types';
import { ShoppingCart, Coins, Heart, Shield, Brain, Sparkles, Trophy, HelpCircle, ArrowLeft } from 'lucide-react';
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
  const { state, buyItem, setScreen } = useGame();
  const { daughter } = state;

  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleBuy = (item: Item) => {
    const res = buyItem(item.id);
    if (res.success) {
      setMessage({ text: res.message, isError: false });
      audioManager.playSfx('sfx_coin.mp3', 0.55);
    } else {
      setMessage({ text: res.message, isError: true });
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
            <h1 className="text-xl md:text-2xl font-bold">皇家武器與禮品商會</h1>
            <p className="text-xs text-slate-400">購買武器、護甲、華麗服飾或藥品，直接提升女兒屬性。</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Gold */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.25)] rounded-lg text-sm">
            <Coins className="text-[#d4af37]" size={16} />
            <span className="font-bold text-[#ffd700]">{daughter.gold} G</span>
          </div>

          <button 
            onClick={() => setScreen('main')} 
            className="btn-fantasy-sec text-xs flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            返回起居室
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

      {/* Items Shelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {ITEMS.filter((item) => {
          if (item.id.startsWith('bm_')) {
            return state.inventory.includes('black_market_unlocked');
          }
          return true;
        }).map((item) => {
          let isBlackMarketDiscount = false;
          let isMerchantDiscount = false;
          let finalPrice = item.price;

          if (item.id.startsWith('binlang_') && state.inventory.includes('black_market_unlocked')) {
            isBlackMarketDiscount = true;
            finalPrice = Math.round(item.price * 0.5);
          } else if (daughter.fatherBackground === 'merchant') {
            isMerchantDiscount = true;
            finalPrice = Math.round(item.price * 0.8);
          }

          return (
            <div key={item.id} className="glass-panel p-5 flex flex-col justify-between gap-4 border border-slate-800/80 hover:border-[rgba(212,175,55,0.3)] transition-all">
              
              {/* Title & Price */}
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
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
                    </h3>
                  </div>
                  <span className="shrink-0 text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 text-[#ffd700] font-bold rounded-lg flex items-center gap-1">
                    <Coins size={12} />
                    {finalPrice < item.price ? (
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

    </div>
  );
};
