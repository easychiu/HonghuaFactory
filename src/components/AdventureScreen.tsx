import React, { useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { Swords, Heart, ArrowRight, Shield, LogOut } from 'lucide-react';

export const AdventureScreen: React.FC = () => {
  const { state, stepAdventure, adventureCombatAction, endAdventure } = useGame();
  const { adventure } = state;

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll combat log to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [adventure?.combatLog.length]);

  if (!adventure) return null;

  const currentNode = adventure.nodes[adventure.currentNodeIndex];
  const monster = currentNode.monster;

  // Icons mapping for adventure nodes
  const getNodeEmoji = (type: string) => {
    if (type === 'start') return '🚩';
    if (type === 'chest') return '🎁';
    if (type === 'monster') return '👾';
    if (type === 'rest') return '♨️';
    if (type === 'boss') return '👑';
    return '❓';
  };

  const getDaughterHpPercent = () => {
    return Math.max(0, (adventure.daughterHp / adventure.daughterMaxHp) * 100);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 md:p-6 w-full max-w-4xl mx-auto animate-slide-up">
      {/* Header Panel */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-emerald-400">
            <Swords size={22} /> 野外修行：{adventure.areaName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            通過與荒野魔物的戰鬥與探索，鍛鍊女兒的膽識、力量與魔法素質。
          </p>
        </div>

        {/* Daughter Adventure HP bar */}
        <div className="flex flex-col gap-1 w-full sm:max-w-[200px]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Heart size={12} className="text-red-400" /> 女兒生命值
            </span>
            <span className="font-bold">{adventure.daughterHp} / {adventure.daughterMaxHp}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${getDaughterHpPercent()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Map Nodes Timeline */}
      <div className="glass-panel p-6 flex items-center justify-between gap-2 overflow-x-auto">
        {adventure.nodes.map((node, index) => {
          const isActive = index === adventure.currentNodeIndex;
          const isCleared = index < adventure.currentNodeIndex || node.cleared;
          
          return (
            <React.Fragment key={node.id}>
              {/* Node Circle */}
              <div className="flex flex-col items-center shrink-0">
                <div 
                  className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl transition-all relative ${
                    isActive 
                      ? 'bg-[rgba(16,185,129,0.15)] border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] scale-110' 
                      : isCleared 
                      ? 'bg-slate-900 border-slate-700 opacity-60' 
                      : 'bg-slate-950 border-slate-800 opacity-30'
                  }`}
                >
                  {getNodeEmoji(node.type)}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-semibold">{node.name}</span>
              </div>
              
              {/* Connector Arrow */}
              {index < adventure.nodes.length - 1 && (
                <div className={`h-[1px] flex-1 min-w-[20px] transition-all ${
                  isCleared ? 'bg-slate-700' : 'bg-slate-900'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Screen Action Box */}
      <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[220px] text-center gap-4 relative">
        
        {/* Exploring normal screen */}
        {adventure.status === 'exploring' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200">抵達安全區域</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              此處灌木叢生，隱約能聽到溪流的聲音，目前沒有發現怪物威脅。請繼續探索前進。
            </p>
            <button 
              onClick={stepAdventure}
              className="btn-fantasy py-3 px-8 text-sm flex items-center gap-2 mx-auto"
            >
              前進探索下一步 <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Chest Screen */}
        {adventure.status === 'chest' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-3xl float-animation">
              🎁
            </div>
            <h2 className="text-lg font-bold text-[#ffd700]">遺跡古物箱！</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              女兒在石雕背後挖出了一個滿是塵土的木盒，打開後裡面竟然裝滿了古王國的金幣！
            </p>
            <button 
              onClick={stepAdventure}
              className="btn-fantasy py-3 px-8 text-sm flex items-center gap-2 mx-auto"
            >
              收取金幣並前進 <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Combat Screen */}
        {adventure.status === 'fighting' && monster && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Monster portrait cards */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-red-950 border border-red-900 text-red-400 font-bold px-2 py-0.5 rounded uppercase">
                    敵方怪物
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{monster.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">生命值</span>
                  <p className="text-sm font-bold text-red-400">{monster.hp} / {monster.maxHp}</p>
                </div>
              </div>
              
              {/* Monster HP bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                />
              </div>

              {/* Monster Stats details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-900/50">
                <div className="flex items-center gap-1.5">
                  <Swords size={12} className="text-[#ffd700]" />
                  <span>攻擊力：{monster.attack}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-[#ffd700]" />
                  <span>防禦力：{monster.defense}</span>
                </div>
              </div>
            </div>

            {/* Right: Combat Commands */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-400 text-left uppercase tracking-wider mb-1">
                選擇戰鬥指令：
              </h4>
              
              <button 
                onClick={() => adventureCombatAction('attack')}
                className="btn-fantasy w-full py-3.5 text-xs flex items-center justify-center gap-2"
              >
                ⚔️ 物理斬擊 (力量/戰鬥加成)
              </button>

              <button 
                onClick={() => adventureCombatAction('magic')}
                className="btn-fantasy-sec w-full py-3.5 text-xs flex items-center justify-center gap-2 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/20"
              >
                🔮 元素魔法 (智力/魔法加成)
              </button>

              <button 
                onClick={() => adventureCombatAction('flee')}
                className="btn-fantasy-sec w-full py-3.5 text-xs flex items-center justify-center gap-2 border-red-500/40 text-red-300 hover:bg-red-950/20"
              >
                🏃 撤退逃跑 (回退前一站)
              </button>
            </div>
          </div>
        )}

        {/* Victory Screen */}
        {adventure.status === 'victory' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto text-3xl float-animation">
              🏆
            </div>
            <h2 className="text-xl font-bold text-[#ffd700]">修行大捷！</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              成功討伐幽暗密林的領主守護樹妖！女兒表現得極為出色，在實戰中獲得了巨大的磨礪與名望！
            </p>
            <button 
              onClick={endAdventure}
              className="btn-fantasy py-3 px-8 text-sm flex items-center gap-2 mx-auto"
            >
              結束修行並回家 <LogOut size={16} />
            </button>
          </div>
        )}

        {/* Defeat Screen */}
        {adventure.status === 'defeat' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-900/30 text-red-400 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-3xl animate-pulse">
              💀
            </div>
            <h2 className="text-xl font-bold text-red-500">女兒力竭昏迷了！</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              荒野魔物太過強大，女兒體力透支倒下了。你不得不立刻帶她返回王城醫治，修行被迫結束。
            </p>
            <button 
              onClick={endAdventure}
              className="btn-fantasy-sec border-red-500 text-red-400 py-3 px-8 text-sm flex items-center gap-2 mx-auto"
            >
              回城修養 <LogOut size={16} />
            </button>
          </div>
        )}

      </div>

      {/* Combat logs display */}
      <div className="glass-panel p-5 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          📜 修行實戰記錄
        </h3>
        
        <div className="h-44 overflow-y-auto bg-slate-950/80 border border-slate-900 rounded-lg p-3 space-y-2 text-xs font-mono">
          {adventure.combatLog.map((logLine, idx) => (
            <div key={idx} className="text-slate-300 leading-relaxed text-left">
              {logLine}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

    </div>
  );
};
