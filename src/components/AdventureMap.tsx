import React, { useEffect, useRef, useState } from 'react';
import { useGame, ITEMS } from '../contexts/GameContext';
import { useCombat } from '../contexts/CombatContext';
import { useAdventure } from '../hooks/useAdventure';
import { Swords, Heart, LogOut, Backpack, AlertCircle } from 'lucide-react';

export const AdventureMap: React.FC = () => {
  const { state, resolveCombatVictory, resolveCombatDefeat, eatRiceCake, consumeItem, resolveCombatReunion, equipMember } = useGame();
  const { combatState, startCombat, executePlayerAction, resolveEnemyTurn, endCombat, failFleeAttempt } = useCombat();
  const { daughter, inventory } = state;
  
  const {
    adventure,
    focusCost,
    hasMotorcycle,
    isNodeReachable,
    handleNodeClick,
    endAdventure
  } = useAdventure();

  const logEndRef = useRef<HTMLDivElement>(null);
  const [healTargetSelect, setHealTargetSelect] = useState<boolean>(false);

  // Auto-scroll combat log to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combatState.combatLog.length]);

  // Auto start combat when entering a fight node
  useEffect(() => {
    if (adventure && adventure.status === 'fighting' && !combatState.isActive) {
      const activeNode = adventure.nodes.find(n => n.id === adventure.currentNodeId);
      if (activeNode && activeNode.monster) {
        startCombat(activeNode.monster, daughter, adventure.satiated || false, inventory, adventure.party);
      }
    }
  }, [adventure?.status, adventure?.currentNodeId, combatState.isActive, adventure?.satiated, inventory, daughter, startCombat, adventure?.party]);

  // Auto resolve enemy turn after a delay
  useEffect(() => {
    if (combatState.isActive && combatState.turn === 'enemy') {
      const timer = setTimeout(() => {
        resolveEnemyTurn(daughter);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [combatState.isActive, combatState.turn, daughter]);

  if (!adventure) return null;

  // Coordinate helper for Slay the Spire Map layout
  const getCoordinates = (layer: number, index: number) => {
    const y = 430 - layer * 70; // Climbing up: Layer 0 at y=430, Layer 5 at y=80
    
    let N = 3;
    if (layer === 0 || layer === 5) N = 1;
    else if (layer === 4) N = 2;

    const width = 600;
    const center = width / 2;
    const spacing = 155;
    const x = center + (index - (N - 1) / 2) * spacing;
    return { x, y };
  };

  // Node emoji/icon resolver
  const getNodeSymbol = (type: string) => {
    if (type === 'start') return '🚩';
    if (type === 'battle') return '⚔️';
    if (type === 'event') return '📜';
    if (type === 'rest') return '🔥';
    if (type === 'shop') return '🛒';
    if (type === 'hidden') return '❓';
    if (type === 'boss') return '👑';
    if (type === 'chest') return '🎁';
    if (type === 'spring') return '⛲';
    return '❓';
  };

  const getDaughterHpPercent = () => {
    return Math.max(0, (adventure.daughterHp / adventure.daughterMaxHp) * 100);
  };

  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  
  // Resolve daughter dynamic avatar
  const getAgeGroup = (age: number) => {
    if (age < 12) return 10;
    if (age < 14) return 12;
    if (age < 16) return 14;
    return 16;
  };
  const daughterAvatar = `${prefix}sprites/daughter_${getAgeGroup(daughter.age)}_${daughter.outfit}.png`;
  const yvAvatar = `${prefix}avatar_mage.png`;
  const jumboAvatar = `${prefix}avatar_warrior.png`;

  // Filter for Emilia's Coffee Hair
  const emiliaFilterStyle = daughter.characterId === 'emilia' ? { filter: 'hue-rotate(330deg) saturate(0.8) sepia(0.5)' } : {};

  // Handlers for victory / defeat
  const handleVictoryConfirm = () => {
    if (combatState.isReunionTriggered && combatState.reunitedSisterId) {
      resolveCombatReunion(combatState.reunitedSisterId);
      endCombat('victory');
      return;
    }

    let remainingHp = daughter.combatHp;
    if (daughter.characterId === 'emilia') {
      remainingHp = combatState.party.emilia?.hp || 0;
    } else {
      remainingHp = combatState.party.solo?.hp || 0;
    }
    const goldReward = combatState.monster?.goldReward || 50;

    resolveCombatVictory(remainingHp, goldReward);
    endCombat('victory');
  };

  const handleDefeatConfirm = () => {
    resolveCombatDefeat();
    endCombat('defeat');
  };

  const handleFleeConfirm = () => {
    let remainingHp = daughter.combatHp;
    if (daughter.characterId === 'emilia') {
      remainingHp = combatState.party.emilia?.hp || 0;
    } else {
      remainingHp = combatState.party.solo?.hp || 0;
    }
    
    // Knight background escape rate is 100%, others is 75%
    const isKnight = daughter.fatherBackground === 'knight';
    const escapeChance = isKnight ? 1.0 : 0.75;
    
    if (Math.random() < escapeChance) {
      // Return to exploration with 0 gold reward
      resolveCombatVictory(remainingHp, 0);
      endCombat('fled');
    } else {
      failFleeAttempt();
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 w-full max-w-5xl mx-auto animate-slide-up">
      {/* Header Panel */}
      <div className="glass-panel p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-emerald-400">
            <Swords size={22} /> 野外修行：{adventure.areaName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            通過節點式探索挑戰，尋找古老線索。專注度剩餘：
            <span className="font-bold text-[#ffd700]">{daughter.focus}</span> / {daughter.maxFocus}
            {hasMotorcycle && <span className="text-emerald-400 ml-2 font-semibold">🏍️ 摩托車加持 (移動僅扣 1 專注度)</span>}
          </p>
          <p className="text-[11px] text-indigo-300 mt-1">
            ⚠️ 高層區域效果：{adventure.highLayerDebuffName}（{adventure.highLayerDebuffDescription}）
          </p>
        </div>

        {/* HP & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex flex-col gap-1 w-full sm:min-w-[160px]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <Heart size={12} className="text-red-400" /> 女兒生命值
                {adventure.satiated && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    🍖 飽腹
                  </span>
                )}
              </span>
              <span className="font-bold">{adventure.daughterHp} / {adventure.daughterMaxHp}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${getDaughterHpPercent()}%` }}
              />
            </div>
          </div>
          
          {adventure.status === 'exploring' && inventory.includes('barrel_rice_cake') && !adventure.satiated && (
            <button 
              onClick={() => eatRiceCake()}
              className="btn-fantasy border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/20 text-xs py-2 px-3 flex items-center gap-1.5 animate-pulse"
            >
              🍱 食用桶仔米糕
            </button>
          )}

          {adventure.status === 'exploring' && (
            <button 
              onClick={() => endAdventure(false)}
              className="btn-fantasy-sec border-red-500/40 text-red-300 hover:bg-red-950/20 text-xs py-2 px-3 flex items-center gap-1"
            >
              <LogOut size={12} /> 結束修行
            </button>
          )}
        </div>
      </div>

      {/* Slay the Spire Map (Exploring state) */}
      {adventure.status === 'exploring' && (
        <div className="glass-panel p-3 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <h2 className="text-xs sm:text-sm font-bold text-[#ffd700] mb-3 sm:mb-4 uppercase tracking-wider">📜 {adventure.areaName} 修行路徑圖</h2>
          
          <div className="relative w-full max-w-[600px] overflow-x-auto overflow-y-hidden bg-slate-950/40 rounded-2xl border border-slate-900/60 p-2 sm:p-4 shadow-inner -webkit-overflow-scrolling-touch">
            <svg width="600" height="500" viewBox="0 0 600 500" className="mx-auto block min-w-[400px]">
              {/* Draw connections */}
              {adventure.nodes.map((node) => {
                const { x: x1, y: y1 } = getCoordinates(node.layer, node.index);
                return node.connectedTo.map((targetId) => {
                  const targetNode = adventure.nodes.find(n => n.id === targetId);
                  if (!targetNode) return null;
                  const { x: x2, y: y2 } = getCoordinates(targetNode.layer, targetNode.index);
                  
                  // Highlight path if both are cleared or active
                  const isCurrentPath = node.id === adventure.currentNodeId;
                  
                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isCurrentPath ? '#10b981' : '#334155'}
                      strokeWidth={isCurrentPath ? '3' : '1.5'}
                      strokeDasharray={isCurrentPath ? '0' : '4 4'}
                      opacity={isCurrentPath ? '0.85' : '0.4'}
                      className={isCurrentPath ? 'animate-pulse' : ''}
                    />
                  );
                });
              })}

              {/* Draw Nodes */}
              {adventure.nodes.map((node) => {
                const { x, y } = getCoordinates(node.layer, node.index);
                const isActive = node.id === adventure.currentNodeId;
                const isReachable = isNodeReachable(node.id);
                const isCleared = node.cleared;

                return (
                  <g key={node.id}>
                    {/* Node Background Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="20"
                      className={`transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? 'fill-emerald-950 stroke-emerald-400 stroke-2 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                          : isReachable 
                          ? 'fill-slate-900 stroke-yellow-500 hover:stroke-[#ffd700] stroke-2 hover:scale-110 filter drop-shadow-[0_0_4px_rgba(234,179,8,0.2)]'
                          : isCleared 
                          ? 'fill-slate-950 stroke-slate-800 opacity-60' 
                          : 'fill-slate-950 stroke-slate-900 opacity-20'
                      }`}
                      onClick={() => handleNodeClick(node.id)}
                    />
                    {/* Node Emoji/Symbol */}
                    <text
                      x={x}
                      y={y + 5}
                      textAnchor="middle"
                      fontSize="14"
                      className="pointer-events-none select-none"
                    >
                      {getNodeSymbol(node.type)}
                    </text>
                    {/* Node Name Tag */}
                    <text
                      x={x}
                      y={y + 35}
                      textAnchor="middle"
                      fontSize="9"
                      fill={isActive ? '#10b981' : isReachable ? '#ffd700' : '#64748b'}
                      fontWeight={isActive || isReachable ? 'bold' : 'normal'}
                      className="pointer-events-none select-none"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 py-2.5 px-4 rounded-xl border border-slate-900">
            <AlertCircle size={14} className="text-yellow-500" />
            <span>綠色亮邊為當前所在。黃色圈為可移動目標，消耗 {focusCost} 點專注度。</span>
          </div>
        </div>
      )}

      {/* Party Equipment Panel for JRPG multi-character mode */}
      {adventure && adventure.status === 'exploring' && adventure.party && (() => {
        const party = adventure.party;
        return (
          <div className="glass-panel p-5 mb-6 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col gap-4 animate-fade-in">
            <h3 className="text-xs font-bold text-[#ffd700] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
              ⚔️ 冒險小隊整備 (獨立裝備槽)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* yv */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 flex flex-col gap-2.5 text-left">
                <div className="flex justify-between items-center border-b border-slate-850/50 pb-1.5">
                  <span className="text-xs font-bold text-indigo-300">yv (賢者)</span>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-950/40 py-0.5 px-1.5 rounded border border-slate-850">
                    當前裝備: {party.yv.weapon ? (ITEMS.find(i => i.id === party.yv.weapon)?.name || party.yv.weapon) : '無'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {inventory.includes('old_lute') && party.yv.weapon !== 'old_lute' && (
                    <button 
                      onClick={() => equipMember('yv', 'old_lute')}
                      className="btn-fantasy-sec text-[10px] py-1.5 px-2.5"
                    >
                      🎸 裝備古舊的魯特琴 (+15 治療/火球)
                    </button>
                  )}
                  {inventory.includes('holy_water') && party.yv.weapon !== 'holy_water' && (
                    <button 
                      onClick={() => equipMember('yv', 'holy_water')}
                      className="btn-fantasy-sec text-[10px] py-1.5 px-2.5"
                    >
                      🧪 裝備私房聖水 (+20 Max MP)
                    </button>
                  )}
                  {!inventory.includes('old_lute') && !inventory.includes('holy_water') && (
                    <span className="text-[10px] text-slate-500 italic">背包內無可用法術裝備</span>
                  )}
                  {party.yv.weapon && (
                    <button 
                      onClick={() => equipMember('yv', '')}
                      className="text-red-400 text-[10px] font-bold hover:underline ml-auto"
                    >
                      卸下
                    </button>
                  )}
                </div>
              </div>

              {/* jumbo */}
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 flex flex-col gap-2.5 text-left">
                <div className="flex justify-between items-center border-b border-slate-850/50 pb-1.5">
                  <span className="text-xs font-bold text-amber-300">jumbo (守護者)</span>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-950/40 py-0.5 px-1.5 rounded border border-slate-850">
                    當前裝備: {party.jumbo.weapon ? (ITEMS.find(i => i.id === party.jumbo.weapon)?.name || party.jumbo.weapon) : '無'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {inventory.includes('giant_hammer') && party.jumbo.weapon !== 'giant_hammer' && (
                    <button 
                      onClick={() => equipMember('jumbo', 'giant_hammer')}
                      className="btn-fantasy-sec text-[10px] py-1.5 px-2.5"
                    >
                      🔨 裝備三十公分錘子 (物理/碎石擊+35)
                    </button>
                  )}
                  {inventory.includes('steel_sword') && party.jumbo.weapon !== 'steel_sword' && (
                    <button 
                      onClick={() => equipMember('jumbo', 'steel_sword')}
                      className="btn-fantasy-sec text-[10px] py-1.5 px-2.5"
                    >
                      ⚔️ 裝備十字鐵劍 (物理+20, 重掃+15)
                    </button>
                  )}
                  {!inventory.includes('giant_hammer') && !inventory.includes('steel_sword') && (
                    <span className="text-[10px] text-slate-500 italic">背包內無可用重武器</span>
                  )}
                  {party.jumbo.weapon && (
                    <button 
                      onClick={() => equipMember('jumbo', '')}
                      className="text-red-400 text-[10px] font-bold hover:underline ml-auto"
                    >
                      卸下
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Combat UI Screen (Fighting state) */}
      {adventure.status === 'fighting' && combatState.isActive && combatState.monster && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left Columns (lg:col-span-2) - Combat Arena */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Arena board: Monster vs Party */}
            <div className="glass-panel p-3 sm:p-6 flex flex-col md:flex-row items-center justify-around gap-4 sm:gap-6 bg-slate-950/20 border-2 border-[#d4af37]/35 min-h-[240px] sm:min-h-[300px] relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient opacity-10 pointer-events-none" />
              
              {/* Team Party Members */}
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">王女小隊</h3>
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center items-center w-full">
                  
                  {/* Single player daughter */}
                  {combatState.party.solo && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${combatState.turn === 'player' ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800 bg-slate-900/40'} w-full max-w-[240px] md:min-w-[200px]`}>
                      <img 
                        src={daughterAvatar} 
                        alt={daughter.name} 
                        className="w-12 h-12 rounded-full border border-slate-700 bg-slate-950 object-cover"
                        style={emiliaFilterStyle}
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-white mb-1">{combatState.party.solo.name}</div>
                        <div className="flex flex-col gap-1">
                          {/* HP Bar */}
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>HP</span>
                            <span>{combatState.party.solo.hp} / {combatState.party.solo.maxHp}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 transition-all duration-300"
                              style={{ width: `${(combatState.party.solo.hp / combatState.party.solo.maxHp) * 100}%` }}
                            />
                          </div>
                          {/* MP Bar */}
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span>MP</span>
                            <span>{combatState.party.solo.mp} / {combatState.party.solo.maxMp}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${(combatState.party.solo.mp / combatState.party.solo.maxMp) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Three-member party (Emilia) */}
                  {daughter.characterId === 'emilia' && (
                    <>
                      {/* Emilia */}
                      {combatState.party.emilia && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${combatState.party.emilia.hp <= 0 ? 'border-red-950 bg-red-950/10 opacity-50' : 'border-slate-800 bg-slate-900/40'} w-full max-w-[240px] md:min-w-[200px]`}>
                          <img 
                            src={daughterAvatar} 
                            alt={daughter.name} 
                            className="w-12 h-12 rounded-full border border-slate-700 bg-slate-950 object-cover"
                            style={emiliaFilterStyle}
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-white mb-1">{combatState.party.emilia.name} (王女)</div>
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[9px]">
                                <span>HP</span>
                                <span>{combatState.party.emilia.hp} / {combatState.party.emilia.maxHp}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-500 transition-all duration-300"
                                  style={{ width: `${(combatState.party.emilia.hp / combatState.party.emilia.maxHp) * 100}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px]">
                                <span>MP</span>
                                <span>{combatState.party.emilia.mp} / {combatState.party.emilia.maxMp}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-300"
                                  style={{ width: `${(combatState.party.emilia.mp / combatState.party.emilia.maxMp) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* yv */}
                      {combatState.party.yv && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${combatState.party.yv.hp <= 0 ? 'border-red-950 bg-red-950/10 opacity-50' : 'border-slate-800 bg-slate-900/40'} w-full max-w-[240px] md:min-w-[200px]`}>
                          <img 
                            src={yvAvatar} 
                            alt="yv" 
                            className="w-12 h-12 rounded-full border border-slate-700 bg-slate-950 object-cover"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-white mb-1">{combatState.party.yv.name} (賢者)</div>
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[9px]">
                                <span>HP</span>
                                <span>{combatState.party.yv.hp} / {combatState.party.yv.maxHp}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-500 transition-all duration-300"
                                  style={{ width: `${(combatState.party.yv.hp / combatState.party.yv.maxHp) * 100}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px]">
                                <span>MP</span>
                                <span>{combatState.party.yv.mp} / {combatState.party.yv.maxMp}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-300"
                                  style={{ width: `${(combatState.party.yv.mp / combatState.party.yv.maxMp) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* jumbo */}
                      {combatState.party.jumbo && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl border ${combatState.party.jumbo.hp <= 0 ? 'border-red-950 bg-red-950/10 opacity-50' : 'border-slate-800 bg-slate-900/40'} w-full max-w-[240px] md:min-w-[200px]`}>
                          <img 
                            src={jumboAvatar} 
                            alt="jumbo" 
                            className="w-12 h-12 rounded-full border border-slate-700 bg-slate-950 object-cover"
                          />
                          <div className="flex-1 text-xs">
                            <div className="font-bold text-white mb-1">
                              {combatState.party.jumbo.name} (守護者)
                              {combatState.jumboTauntTurns > 0 && <span className="text-yellow-500 ml-1">🛡️ 嘲諷</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[9px]">
                                <span>HP</span>
                                <span>{combatState.party.jumbo.hp} / {combatState.party.jumbo.maxHp}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-500 transition-all duration-300"
                                  style={{ width: `${(combatState.party.jumbo.hp / combatState.party.jumbo.maxHp) * 100}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[9px]">
                                <span>MP</span>
                                <span>{combatState.party.jumbo.mp} / {combatState.party.jumbo.maxMp}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-300"
                                  style={{ width: `${(combatState.party.jumbo.mp / combatState.party.jumbo.maxMp) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* VERSUS middle indicator */}
              <div className="text-2xl font-black text-[#d4af37] py-2 md:py-0">VS</div>

              {/* Enemy Monster card */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-red-950/15 border border-red-500/20 min-w-[200px] text-center shadow-inner relative">
                {combatState.frozenTurns > 0 && (
                  <div className="absolute top-2 right-2 text-blue-300 bg-blue-900/60 border border-blue-600/40 text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                    ❄️ 冰凍 ({combatState.frozenTurns})
                  </div>
                )}
                <div className="text-4xl">😈</div>
                <div>
                  <h3 className="text-sm font-bold text-white">{combatState.monster.name}</h3>
                  <div className="flex justify-center gap-3 text-[10px] text-slate-400 mt-1">
                    <span>⚔️ 攻 {combatState.monster.attack}</span>
                    <span>🛡️ 防 {combatState.monster.defense}</span>
                  </div>
                </div>
                
                <div className="w-full flex flex-col gap-1 mt-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">生命值</span>
                    <span className="font-bold text-red-400">{combatState.monsterHp} / {combatState.monster.hp}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${(combatState.monsterHp / combatState.monster.hp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Action Commands Control panel */}
            <div className="glass-panel p-5 flex flex-col gap-4">
              
              {/* Turn indicator banner */}
              <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {combatState.turn === 'player' ? '🟢 己方出招回合' : 
                   combatState.turn === 'enemy' ? '🔴 敵方魔物反擊中...' : 
                   combatState.turn === 'victory' ? '🎉 戰鬥勝利！' : '☠️ 戰鬥失敗...'}
                </h4>
                
                {combatState.doubleAttackTurns > 0 && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 rounded font-medium">
                    🔥 檳榔連擊中 ({combatState.doubleAttackTurns} 輪)
                  </span>
                )}
              </div>

              {/* Combat ended screens */}
              {combatState.turn === 'victory' && (
                <div className="flex flex-col gap-2 items-center text-center p-4">
                  <p className="text-sm text-slate-300">擊退了強悍的魔物！獲得戰利品金幣 {combatState.monster.goldReward} G。</p>
                  <button 
                    onClick={handleVictoryConfirm}
                    className="btn-fantasy py-3 px-8 text-sm mt-3"
                  >
                    領取獎勵並繼續
                  </button>
                </div>
              )}

              {combatState.turn === 'defeat' && (
                <div className="flex flex-col gap-2 items-center text-center p-4">
                  <p className="text-sm text-red-300">隊伍不幸落敗……只得撤退回城調養。</p>
                  <button 
                    onClick={handleDefeatConfirm}
                    className="btn-fantasy border-red-500 text-red-300 py-3 px-8 text-sm mt-3"
                  >
                    重返起居室
                  </button>
                </div>
              )}

              {/* Active Player action commands */}
              {combatState.turn === 'player' && (
                <div className="space-y-4">
                  
                  {/* Single mode controls */}
                  {combatState.party.solo && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <button 
                        onClick={() => executePlayerAction('solo', 'attack')}
                        className="btn-fantasy py-3 text-xs"
                      >
                        ⚔️ 普通攻擊
                      </button>
                      <button 
                        onClick={() => executePlayerAction('solo', 'skill_slash')}
                        disabled={combatState.party.solo.mp < 10}
                        className="btn-fantasy-sec py-3 text-xs disabled:opacity-40"
                      >
                        {inventory.includes('royal_sword_cross') ? '⚔️ 十字斬 (10 MP)' : '🔥 皇家斬擊 (10 MP)'}
                      </button>
                      {inventory.includes('temple_ice_juice') && (
                        <button
                          onClick={() => executePlayerAction('solo', 'skill_ice_juice')}
                          disabled={combatState.party.solo.mp < 12}
                          className="btn-fantasy py-3 text-xs border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/15 disabled:opacity-40"
                        >
                          ❄️ 極凍檳榔汁 (12 MP)
                        </button>
                      )}
                      {combatState.monster?.sisterId && (
                        <button 
                          onClick={() => executePlayerAction('solo', 'observe')}
                          className="btn-fantasy py-3 text-xs border-amber-500/50 text-amber-300 hover:bg-amber-950/15"
                        >
                          🔍 仔細觀察
                        </button>
                      )}
                      <button 
                        onClick={handleFleeConfirm}
                        className="btn-fantasy-sec border-red-500/35 text-red-300 hover:bg-red-950/10 py-3 text-xs"
                      >
                        🏃 逃跑撤退
                      </button>
                    </div>
                  )}

                  {/* Three-member party controls (Emilia) */}
                  {daughter.characterId === 'emilia' && (
                    <div className="flex flex-col gap-3">
                      
                      {/* Emilia Actions */}
                      {combatState.party.emilia && combatState.party.emilia.hp > 0 && (
                        <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-center gap-3">
                          <span className="font-bold text-white text-xs md:w-20">艾蜜莉亞:</span>
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <button 
                              onClick={() => executePlayerAction('emilia', 'attack')}
                              className="btn-fantasy text-[10px] py-2"
                            >
                              ⚔️ 普攻
                            </button>
                            <button 
                              onClick={() => executePlayerAction('emilia', 'skill_slash')}
                              disabled={combatState.party.emilia.mp < 10}
                              className="btn-fantasy-sec text-[10px] py-2 disabled:opacity-40"
                            >
                              {inventory.includes('royal_sword_cross') ? '⚔️ 十字斬 (10)' : '🗡️ 皇家斬擊 (10)'}
                            </button>
                            {combatState.monster?.sisterId ? (
                              <button 
                                onClick={() => executePlayerAction('emilia', 'observe')}
                                className="btn-fantasy text-[10px] py-2 border-amber-500/50 text-amber-300 hover:bg-amber-950/15 col-span-2 sm:col-span-1"
                              >
                                🔍 仔細觀察
                              </button>
                            ) : (
                              (() => {
                                const hasTrio = combatState.party.emilia && combatState.party.yv && combatState.party.jumbo && combatState.party.yv.hp > 0 && combatState.party.jumbo.hp > 0;
                                if (hasTrio) {
                                  const disabled = combatState.party.emilia.mp < 12 || (combatState.party.yv?.mp || 0) < 12 || (combatState.party.jumbo?.mp || 0) < 12;
                                  return (
                                    <button 
                                      onClick={() => executePlayerAction('emilia', 'skill_combo')}
                                      disabled={disabled}
                                      className="btn-fantasy text-[10px] py-2 bg-gradient-to-r from-violet-500 via-[#ffd700] to-red-500 border-none disabled:opacity-40 animate-pulse font-bold text-white shadow-[0_0_8px_rgba(255,215,0,0.4)] col-span-2 sm:col-span-1"
                                    >
                                      ✨ 友情大連擊 (三人12)
                                    </button>
                                  );
                                } else {
                                  return (
                                    <button 
                                      onClick={() => executePlayerAction('emilia', 'skill_combo')}
                                      disabled={combatState.party.emilia.mp < 30}
                                      className="btn-fantasy text-[10px] py-2 bg-gradient-to-r from-amber-500 to-red-500 border-none disabled:opacity-40 text-white font-semibold col-span-2 sm:col-span-1"
                                    >
                                      ✨ 單人連擊 (30)
                                    </button>
                                  );
                                }
                              })()
                            )}
                          </div>
                        </div>
                      )}

                      {/* yv Actions */}
                      {combatState.party.yv && combatState.party.yv.hp > 0 && (
                        <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-center gap-3">
                          <span className="font-bold text-indigo-300 text-xs md:w-20">yv (賢者):</span>
                          
                          {healTargetSelect ? (
                            <div className="flex-1 flex flex-wrap gap-2 items-center">
                              <span className="text-[10px] text-slate-400">選擇治癒目標:</span>
                              <button 
                                onClick={() => { executePlayerAction('yv', 'skill_heal', 'emilia'); setHealTargetSelect(false); }}
                                className="btn-fantasy-sec text-[10px] py-1 px-2.5"
                              >
                                艾蜜莉亞
                              </button>
                              <button 
                                onClick={() => { executePlayerAction('yv', 'skill_heal', 'yv'); setHealTargetSelect(false); }}
                                className="btn-fantasy-sec text-[10px] py-1 px-2.5"
                              >
                                yv
                              </button>
                              <button 
                                onClick={() => { executePlayerAction('yv', 'skill_heal', 'jumbo'); setHealTargetSelect(false); }}
                                className="btn-fantasy-sec text-[10px] py-1 px-2.5"
                              >
                                jumbo
                              </button>
                              <button 
                                onClick={() => setHealTargetSelect(false)}
                                className="text-red-400 text-[10px] font-semibold hover:underline ml-2"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                              <button 
                                onClick={() => executePlayerAction('yv', 'attack')}
                                className="btn-fantasy text-[10px] py-2"
                              >
                                ⚔️ 普攻
                              </button>
                              <button 
                                onClick={() => executePlayerAction('yv', 'skill_fire')}
                                disabled={combatState.party.yv.mp < 15}
                                className="btn-fantasy-sec text-[10px] py-2 disabled:opacity-40"
                              >
                                💥 火球術 (15)
                              </button>
                              <button 
                                onClick={() => setHealTargetSelect(true)}
                                disabled={combatState.party.yv.mp < 12}
                                className="btn-fantasy-sec text-[10px] py-2 disabled:opacity-40 text-emerald-300 col-span-2 sm:col-span-1"
                              >
                                💚 治癒術 (12)
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* jumbo Actions */}
                      {combatState.party.jumbo && combatState.party.jumbo.hp > 0 && (
                        <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-center gap-3">
                          <span className="font-bold text-amber-300 text-xs md:w-20">jumbo:</span>
                          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <button 
                              onClick={() => executePlayerAction('jumbo', 'attack')}
                              className="btn-fantasy text-[10px] py-2"
                            >
                              ⚔️ 普攻
                            </button>
                            <button 
                              onClick={() => executePlayerAction('jumbo', 'skill_taunt')}
                              disabled={combatState.party.jumbo.mp < 8}
                              className="btn-fantasy-sec text-[10px] py-2 disabled:opacity-40 text-yellow-300"
                            >
                              🛡️ 挑釁嘲諷 (8)
                            </button>
                            <button 
                              onClick={() => executePlayerAction('jumbo', 'skill_smash')}
                              disabled={combatState.party.jumbo.mp < 15}
                              className="btn-fantasy-sec text-[10px] py-2 disabled:opacity-40 col-span-2 sm:col-span-1"
                            >
                              🔨 碎石擊 (15)
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={handleFleeConfirm}
                          className="btn-fantasy-sec border-red-500/30 text-red-400 hover:bg-red-950/15 py-2 px-6 text-xs flex items-center gap-1.5"
                        >
                          🏃 撤退逃離戰場
                        </button>
                      </div>

                    </div>
                  )}

                  {/* shared Items panel */}
                  <div className="mt-3 pt-3 border-t border-slate-850">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Backpack size={10} /> 戰鬥背包補給 (背包持有數)
                    </h5>
                    <div className="flex gap-3 flex-wrap">
                      {inventory.includes('barrel_rice_cake') && !combatState.satiated ? (
                        <button
                          onClick={() => {
                            const actor = daughter.characterId === 'emilia' ? 'emilia' : 'solo';
                            executePlayerAction(actor, 'item_rice_cake');
                            eatRiceCake();
                          }}
                          className="btn-fantasy-sec text-[10px] py-1.5 px-3 border-emerald-500/40 text-emerald-300 flex items-center gap-1"
                        >
                          🍱 特級桶仔米糕
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 line-through">
                          特級桶仔米糕 {combatState.satiated ? '(已飽腹)' : '(缺)'}
                        </span>
                      )}

                      {inventory.includes('binlang_ice') ? (
                        <button
                          onClick={() => {
                            const actor = daughter.characterId === 'emilia' ? 'emilia' : 'solo';
                            executePlayerAction(actor, 'item_binlang_ice');
                            consumeItem('binlang_ice');
                          }}
                          className="btn-fantasy-sec text-[10px] py-1.5 px-3 border-blue-400/30 text-blue-300 flex items-center gap-1"
                        >
                          ❄️ 結冰檳榔
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 line-through">結冰檳榔 (缺)</span>
                      )}

                      {inventory.includes('binlang_twin') ? (
                        <button
                          onClick={() => {
                            const actor = daughter.characterId === 'emilia' ? 'emilia' : 'solo';
                            executePlayerAction(actor, 'item_binlang_twin');
                            consumeItem('binlang_twin');
                          }}
                          className="btn-fantasy-sec text-[10px] py-1.5 px-3 border-amber-400/30 text-amber-300 flex items-center gap-1"
                        >
                          🔥 雙子星檳榔
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 line-through">雙子星檳榔 (缺)</span>
                      )}

                      {inventory.includes('binlang_normal') ? (
                        <button
                          onClick={() => {
                            const actor = daughter.characterId === 'emilia' ? 'emilia' : 'solo';
                            executePlayerAction(actor, 'item_binlang_normal');
                            consumeItem('binlang_normal');
                          }}
                          className="btn-fantasy-sec text-[10px] py-1.5 px-3 border-emerald-400/30 text-emerald-300 flex items-center gap-1"
                        >
                          🍃 包葉檳榔
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 line-through">包葉檳榔 (缺)</span>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Right Column (lg:col-span-1) - Live Combat logs */}
          <div className="glass-panel p-5 flex flex-col gap-3 h-full max-h-[500px]">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 tracking-wider">
              📜 實戰出招紀錄
            </h3>
            <div className="flex-1 overflow-y-auto bg-slate-950/80 border border-slate-900 rounded-xl p-4 space-y-2 text-xs font-mono min-h-[250px] shadow-inner text-left">
              {combatState.combatLog.map((logLine, idx) => (
                <div key={idx} className="text-slate-300 leading-relaxed py-0.5 border-b border-slate-950">
                  {logLine}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>
      )}

      {/* Shared Logs Panel (When exploring) */}
      {adventure.status === 'exploring' && (
        <div className="glass-panel p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            📜 冒險探索記錄
          </h3>
          <div className="h-32 overflow-y-auto bg-slate-950/80 border border-slate-900 rounded-lg p-3 space-y-2 text-xs font-mono shadow-inner text-left">
            {adventure.combatLog.map((logLine, idx) => (
              <div key={idx} className="text-slate-300 leading-relaxed">
                {logLine}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

    </div>
  );
};
