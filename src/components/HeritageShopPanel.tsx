import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Sparkles, Coins, Shield, Heart, HelpCircle, Dumbbell } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface HeritageShopPanelProps {
  onClose: () => void;
}

interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  costPerLevel: number;
  maxLevel: number;
  icon: any;
}

const UPGRADES: UpgradeOption[] = [
  {
    id: 'gold_boost',
    name: '富裕起點',
    description: '每級使下一次開局初始金幣 +200 G。',
    costPerLevel: 20,
    maxLevel: 5,
    icon: Coins
  },
  {
    id: 'stamina_boost',
    name: '健康體魄',
    description: '每級使下一次開局初始體力 +15。',
    costPerLevel: 15,
    maxLevel: 5,
    icon: Heart
  },
  {
    id: 'all_stats_boost',
    name: '全能資質',
    description: '每級使下一次開局所有初始屬性 +8。',
    costPerLevel: 30,
    maxLevel: 3,
    icon: Dumbbell
  },
  {
    id: 'heirloom_potion',
    name: '傳家寶：塞特的私房聖水',
    description: '開局背包解鎖並贈送一瓶「塞特的私房聖水」。',
    costPerLevel: 30,
    maxLevel: 1,
    icon: Sparkles
  },
  {
    id: 'heirloom_dagger',
    name: '傳家寶：暗影淬毒雙短刃',
    description: '開局背包解鎖並贈送一把「【黑市】暗影淬毒雙短刃」。',
    costPerLevel: 70,
    maxLevel: 1,
    icon: Shield
  }
];

export const HeritageShopPanel: React.FC<HeritageShopPanelProps> = ({ onClose }) => {
  const { state, buyHeritageUpgrade } = useGame();
  const stardust = state.stardust || 0;
  const upgrades = state.heritageUpgrades || {};

  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleUpgrade = (opt: UpgradeOption) => {
    const currentLevel = upgrades[opt.id] || 0;
    if (currentLevel >= opt.maxLevel) return;
    
    const cost = opt.costPerLevel * (currentLevel + 1);
    if (stardust < cost) {
      audioManager.playSfx('sfx_click.mp3');
      setMessage({ text: '回憶星塵不足，無法購買此升級！', isError: true });
      return;
    }

    const res = buyHeritageUpgrade(opt.id, cost);
    if (res.success) {
      audioManager.playSfx('sfx_coin.mp3');
      setMessage({ text: `${opt.name} 升級成功！`, isError: false });
    } else {
      audioManager.playSfx('sfx_click.mp3');
      setMessage({ text: res.message, isError: true });
    }

    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 md:p-6 animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl p-5 sm:p-6 md:p-8 animate-slide-up border-2 border-purple-500/45 shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col gap-6 bg-slate-905/95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Sparkles size={26} className="text-purple-400" />
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🌌 多週目繼承星塵商店
              </h2>
              <p className="text-xs text-slate-400">
                消費通關獲得的「回憶星塵」，購買永久性開局加成與傳家寶物！
              </p>
            </div>
          </div>
          
          {/* Stardust Balance */}
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-950/40 border border-purple-900/60 rounded-xl text-xs font-bold shrink-0 text-purple-300">
            <span>可用星塵:</span>
            <span className="text-sm text-purple-200 font-extrabold">{stardust} 🔮</span>
          </div>
        </div>

        {/* Toast Alert */}
        {message && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold border text-center shadow-lg ${
            message.isError 
              ? 'bg-red-950/80 border-red-500/40 text-red-200 animate-shake' 
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 animate-bounce'
          }`}>
            {message.text}
          </div>
        )}

        {/* Upgrades Shelf */}
        <div className="flex flex-col gap-3.5 overflow-y-auto pr-1">
          {UPGRADES.map(opt => {
            const currentLevel = upgrades[opt.id] || 0;
            const isMax = currentLevel >= opt.maxLevel;
            const cost = opt.costPerLevel * (currentLevel + 1);
            const Icon = opt.icon || HelpCircle;

            return (
              <div 
                key={opt.id} 
                className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800/80 hover:border-purple-500/30 transition-all bg-slate-950/30"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-12 h-12 rounded-xl bg-purple-950/30 border border-purple-900/45 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      {opt.name}
                      <span className="text-[10px] text-purple-400 bg-purple-950/50 border border-purple-900/30 px-2 py-0.5 rounded-full font-bold">
                        等級 {currentLevel} / {opt.maxLevel}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-normal mt-1">
                      {opt.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpgrade(opt)}
                  disabled={isMax || stardust < cost}
                  className={`w-full sm:w-auto shrink-0 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md ${
                    isMax 
                      ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed' 
                      : stardust < cost 
                        ? 'bg-slate-950 border border-purple-950 text-purple-900/60 cursor-not-allowed' 
                        : 'bg-purple-800 hover:bg-purple-700 border border-purple-600 text-white hover:scale-102 active:scale-98'
                  }`}
                >
                  {isMax ? '已達上限' : `升級 (${cost} 🔮)`}
                </button>

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex justify-end">
          <button 
            type="button" 
            onClick={() => {
              audioManager.playSfx('sfx_click.mp3');
              onClose();
            }} 
            className="btn-fantasy py-2.5 px-8 text-xs font-bold"
          >
            返回起點
          </button>
        </div>

      </div>
    </div>
  );
};
