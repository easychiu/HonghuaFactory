import React, { createContext, useContext, useState } from 'react';
import type { Monster, PartyMember, Daughter } from '../types';

export interface CombatState {
  isActive: boolean;
  monster: Monster | null;
  monsterHp: number;
  combatLog: string[];
  turn: 'player' | 'enemy' | 'victory' | 'defeat';
  // 隊友狀態
  party: {
    solo?: { hp: number; maxHp: number; mp: number; maxMp: number; name: string };
    emilia?: PartyMember;
    yv?: PartyMember;
    jumbo?: PartyMember;
  };
  jumboTauntTurns: number; // jumbo 嘲諷剩餘回合
  doubleAttackTurns: number; // 雙子星檳榔連擊剩餘回合
  frozenTurns: number; // 怪物結冰剩餘回合
  satiated: boolean; // 飽腹狀態
  inventory: string[]; // 當前背包備份，用於判定武器加成
  observeCount: number;
  isReunionTriggered: boolean;
  reunitedSisterId: string | null;
  daughter: Daughter | null;
}

interface CombatContextProps {
  combatState: CombatState;
  startCombat: (monster: Monster, daughter: Daughter, satiated?: boolean, inventory?: string[]) => void;
  executePlayerAction: (
    actor: 'solo' | 'emilia' | 'yv' | 'jumbo',
    action: 'attack' | 'skill_slash' | 'skill_combo' | 'skill_heal' | 'skill_fire' | 'skill_taunt' | 'skill_smash' | 'skill_ice_juice' | 'item_binlang_ice' | 'item_binlang_twin' | 'item_binlang_normal' | 'flee' | 'observe',
    targetMember?: 'emilia' | 'yv' | 'jumbo' | 'solo'
  ) => void;
  resolveEnemyTurn: (daughter: Daughter) => void;
  endCombat: (result: 'victory' | 'defeat' | 'fled') => void;
  failFleeAttempt: () => void;
}

const CombatContext = createContext<CombatContextProps | undefined>(undefined);

export const useCombat = () => {
  const context = useContext(CombatContext);
  if (!context) throw new Error('useCombat must be used within CombatProvider');
  return context;
};

const INITIAL_COMBAT_STATE: CombatState = {
  isActive: false,
  monster: null,
  monsterHp: 0,
  combatLog: [],
  turn: 'player',
  party: {},
  jumboTauntTurns: 0,
  doubleAttackTurns: 0,
  frozenTurns: 0,
  satiated: false,
  inventory: [],
  observeCount: 0,
  isReunionTriggered: false,
  reunitedSisterId: null,
  daughter: null
};

export const CombatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [combatState, setCombatState] = useState<CombatState>(INITIAL_COMBAT_STATE);

  const startCombat = (monster: Monster, daughter: Daughter, satiated: boolean = false, inventory: string[] = []) => {
    const isEmilia = daughter.characterId === 'emilia';
    
    const partyData: CombatState['party'] = {};
    if (isEmilia) {
      partyData.emilia = { name: daughter.name, hp: daughter.combatHp, maxHp: daughter.attributes.stamina, mp: daughter.combatMp, maxMp: daughter.attributes.magicSkill * 2 + 10 };
      partyData.yv = { name: 'yv', hp: 90, maxHp: 90, mp: 60, maxMp: 60 };
      partyData.jumbo = { name: 'jumbo', hp: 160, maxHp: 160, mp: 30, maxMp: 30 };
    } else {
      partyData.solo = { name: daughter.name, hp: daughter.combatHp, maxHp: daughter.attributes.stamina, mp: daughter.combatMp, maxMp: daughter.attributes.magicSkill * 2 + 10 };
    }

    setCombatState({
      isActive: true,
      monster,
      monsterHp: monster.hp,
      combatLog: [`戰鬥開始！${monster.name} 出現了！`],
      turn: 'player',
      party: partyData,
      jumboTauntTurns: 0,
      doubleAttackTurns: 0,
      frozenTurns: 0,
      satiated,
      inventory,
      observeCount: 0,
      isReunionTriggered: false,
      reunitedSisterId: null,
      daughter
    });
  };

  const executePlayerAction = (
    actor: 'solo' | 'emilia' | 'yv' | 'jumbo',
    action: 'attack' | 'skill_slash' | 'skill_combo' | 'skill_heal' | 'skill_fire' | 'skill_taunt' | 'skill_smash' | 'skill_ice_juice' | 'item_binlang_ice' | 'item_binlang_twin' | 'item_binlang_normal' | 'flee' | 'observe',
    targetMember?: 'emilia' | 'yv' | 'jumbo' | 'solo'
  ) => {
    if (!combatState.isActive || !combatState.monster) return;
    
    const nextState = { ...combatState };
    const monster = nextState.monster!;
    const logEntries: string[] = [];
    let damage = 0;
    
    // 獲取施法者資訊
    let actorObj: any;
    if (actor === 'solo') actorObj = nextState.party.solo;
    else if (actor === 'emilia') actorObj = nextState.party.emilia;
    else if (actor === 'yv') actorObj = nextState.party.yv;
    else if (actor === 'jumbo') actorObj = nextState.party.jumbo;

    if (!actorObj || actorObj.hp <= 0) return;

    // 攻擊與傷害技能會重置觀察計數
    const isOffensive = ['attack', 'skill_slash', 'skill_combo', 'skill_fire', 'skill_smash', 'skill_ice_juice'].includes(action);
    if (isOffensive) {
      nextState.observeCount = 0;
    }

    // --- 逃跑邏輯 ---
    if (action === 'flee') {
      const escapeChance = actor === 'solo' ? 0.5 : 0.4;
      if (Math.random() < escapeChance) {
        logEntries.push(`🏃 ${actorObj.name} 成功帶領隊伍逃離戰鬥！`);
        nextState.turn = 'victory'; // 會在外部觸發逃跑結束
      } else {
        logEntries.push(`❌ 逃跑失敗！${monster.name} 封鎖了退路！`);
        nextState.turn = 'enemy';
      }
      setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
      return;
    }

    // --- 觀察邏輯 ---
    if (action === 'observe') {
      const isSister = ['遺失的王女 艾莉卡', '遺失的王女 艾蜜莉亞', '遺失的王女 紅花'].includes(monster.name);
      if (isSister) {
        nextState.observeCount += 1;
        logEntries.push(`🔍 ${actorObj.name} 靜靜地看著 ${monster.name}，試圖尋找熟悉的感覺（連續觀察次數: ${nextState.observeCount}/3）。`);
        
        // 檢查是否滿足重逢條件
        if (nextState.observeCount >= 3) {
          const daughterData = nextState.daughter;
          const inventoryData = nextState.inventory || [];
          const elegance = daughterData?.attributes?.elegance || 0;
          const art = daughterData?.attributes?.art || 0;
          const hasClue = inventoryData.some(i => i.includes('royal') || i.includes('crest') || i.includes('saber') || i.includes('clue'));
          
          if (elegance >= 150 || art >= 150 || hasClue) {
            nextState.isReunionTriggered = true;
            let sisterId = 'erica';
            if (monster.name.includes('艾蜜莉亞')) sisterId = 'emilia';
            else if (monster.name.includes('紅花')) sisterId = 'honghua';
            nextState.reunitedSisterId = sisterId;
            nextState.turn = 'victory';
            logEntries.push(`✨ 經過連續 3 次的仔細觀察，妳發現對方的面容與妳驚人地相似！身上佩戴的皇家飾物與妳的血脈產生了強烈的共鳴！姊妹重逢的眼淚奪眶而出……`);
          } else {
            logEntries.push(`🔍 妳仔細觀察著對方，雖然感到有一絲熟悉，但妳的氣質與禮儀不足 150，且沒有任何王國線索，無法喚醒對方的記憶與血脈共鳴！`);
          }
        }
      } else {
        logEntries.push(`🔍 ${actorObj.name} 仔細觀察著 ${monster.name} 的一舉一動，尋找對方的破綻。`);
      }
    }

    // --- 玩家各指令解析 ---
    else if (action === 'attack') {
      // 普通攻擊
      let baseDmg = actor === 'yv' ? 10 : actor === 'jumbo' ? 22 : 18;
      let critRate = 0.15;

      const hasHammer = nextState.inventory && nextState.inventory.includes('giant_hammer');
      if (hasHammer && (actor === 'solo' || actor === 'jumbo')) {
        baseDmg += 30;
        critRate = 0.30;
      }

      // 神廟獻祭暴擊加成判定
      if ((actor === 'solo' || actor === 'emilia') && nextState.inventory && nextState.inventory.includes('temple_double_rate')) {
        critRate += 0.10;
      }

      // 暴擊判定
      const isCrit = Math.random() < critRate;
      damage = Math.max(5, Math.round(baseDmg * (isCrit ? 1.5 : 1) - monster.defense * 0.5));
      
      // 連擊 Buff 判定
      if (actor === 'solo' && nextState.doubleAttackTurns > 0) {
        damage = Math.round(damage * 1.8);
        logEntries.push(`⚔️ ${actorObj.name} 雙子星檳榔連擊爆發！`);
      }
      
      logEntries.push(`⚔️ ${actorObj.name} 攻擊 ${monster.name}，造成 ${damage} 點傷害！${isCrit ? '（關鍵一擊！）' : ''}`);
      if (hasHammer && (actor === 'solo' || actor === 'jumbo')) {
        logEntries.push(`🔨 裝備「三十公分的錘子」加持：額外 +30 傷害，暴擊率提升至 30%！`);
      }
      nextState.monsterHp = Math.max(0, nextState.monsterHp - damage);
    } 
    
    else if (action === 'skill_slash') {
      // 斬擊 (10 MP)
      if (actorObj.mp < 10) {
        logEntries.push(`❌ MP 不足！無法施展斬擊。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 10;
      const hasCross = nextState.inventory && nextState.inventory.includes('royal_sword_cross');
      if (hasCross) {
        damage = Math.max(25, Math.round(56 - monster.defense * 0.5));
        logEntries.push(`⚔️ ${actorObj.name} 消耗 10 MP 施展皇家奧義「十字斬」！造成 ${damage} 點傷害！`);
      } else {
        damage = Math.max(10, Math.round(28 - monster.defense * 0.5));
        logEntries.push(`🔥 ${actorObj.name} 消耗 10 MP 施展皇家斬擊！造成 ${damage} 點傷害！`);
      }
      nextState.monsterHp = Math.max(0, nextState.monsterHp - damage);
    } 
    
    else if (action === 'skill_combo') {
      // 青梅竹馬友情大連擊 (30 MP)
      if (actorObj.mp < 30) {
        logEntries.push(`❌ MP 不足！無法施展連擊。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 30;
      damage = Math.max(40, Math.round(75 - monster.defense * 0.3));
      logEntries.push(`✨ ${actorObj.name}、yv、jumbo 三人默契爆發！聯手施展「友情大連擊」！對 ${monster.name} 造成了毀滅性的 ${damage} 點傷害！`);
      nextState.monsterHp = Math.max(0, nextState.monsterHp - damage);
    }

    else if (action === 'skill_heal') {
      // yv 治療術 (12 MP)
      if (actorObj.mp < 12) {
        logEntries.push(`❌ MP 不足！無法施展治癒術。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 12;
      
      // 尋找目標
      let target: any;
      if (targetMember === 'emilia') target = nextState.party.emilia;
      else if (targetMember === 'yv') target = nextState.party.yv;
      else if (targetMember === 'jumbo') target = nextState.party.jumbo;
      else target = actorObj;

      if (target) {
        target.hp = Math.min(target.maxHp, target.hp + 45);
        logEntries.push(`💚 yv 施展「聖光治癒」，回復 ${target.name} 45 點生命值！`);
      }
    }

    else if (action === 'skill_fire') {
      // yv 火球術 (15 MP)
      if (actorObj.mp < 15) {
        logEntries.push(`❌ MP 不足！無法施展火球術。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 15;
      damage = 38;
      logEntries.push(`💥 yv 吟唱法術，噴射烈焰火球！對 ${monster.name} 造成 ${damage} 點魔法傷害！`);
      nextState.monsterHp = Math.max(0, nextState.monsterHp - damage);
    }

    else if (action === 'skill_taunt') {
      // jumbo 嘲諷 (8 MP)
      if (actorObj.mp < 8) {
        logEntries.push(`❌ MP 不足！無法嘲諷。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 8;
      nextState.jumboTauntTurns = 2;
      logEntries.push(`🛡️ jumbo 拍打胸甲大聲咆哮！吸引了 ${monster.name} 的全部注意！（嘲諷持續 2 回合）`);
    }

    else if (action === 'skill_smash') {
      // jumbo 大地粉碎擊 (15 MP)
      if (actorObj.mp < 15) {
        logEntries.push(`❌ MP 不足！無法施展粉碎擊。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 15;
      damage = Math.max(15, Math.round(35 - monster.defense * 0.4));
      logEntries.push(`🔨 jumbo 重擊地面，碎石橫飛！對 ${monster.name} 造成 ${damage} 點碎甲傷害！`);
      nextState.monsterHp = Math.max(0, nextState.monsterHp - damage);
    }

    else if (action === 'skill_ice_juice') {
      // 極凍檳榔汁大招 (12 MP)
      if (actorObj.mp < 12) {
        logEntries.push(`❌ MP 不足！無法施展極凍檳榔汁。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 12;
      damage = Math.max(15, Math.round(40 - monster.defense * 0.3));
      nextState.frozenTurns = 2;
      logEntries.push(`❄️ ${actorObj.name} 施展主動大招【極凍檳榔汁】！對 ${monster.name} 造成 ${damage} 點冰霜傷害，並將其定身冰凍 2 回合！`);
      nextState.monsterHp = Math.max(0, nextState.monsterHp - damage);
    }

    // --- 檳榔道具邏輯 ---
    else if (action === 'item_binlang_ice') {
      nextState.frozenTurns = 2;
      logEntries.push(`❄️ 女兒嚼起【結冰檳榔】吐出寒霜黏液，${monster.name} 被牢牢凍結，無法行動 2 回合！`);
    }

    else if (action === 'item_binlang_twin') {
      nextState.doubleAttackTurns = 3;
      logEntries.push(`🔥 女兒吞下【雙子星檳榔】，全身氣血翻湧！攻擊力翻倍，持續 3 回合！`);
    }

    else if (action === 'item_binlang_normal') {
      actorObj.hp = Math.min(actorObj.maxHp, actorObj.hp + 40);
      logEntries.push(`💚 女兒嚼了【包葉檳榔】，回復 40 點生命值，並感到神清氣爽！`);
    }

    // --- 檢查怪物死亡 ---
    if (nextState.monsterHp <= 0) {
      logEntries.push(`🎉 擊敗了 ${monster.name}！獲得 ${monster.goldReward} 金幣。`);
      nextState.turn = 'victory';
    } else {
      // 下一動輪替
      if (actor === 'solo') {
        // 單人：怪物回擊
        if (nextState.frozenTurns > 0) {
          nextState.frozenTurns--;
          logEntries.push(`❄️ ${monster.name} 處於凍結狀態，無法行動！（剩餘 ${nextState.frozenTurns} 回合）`);
          nextState.turn = 'player';
        } else {
          nextState.turn = 'enemy';
        }
      } else {
        if (nextState.frozenTurns > 0) {
          nextState.frozenTurns--;
          logEntries.push(`❄️ ${monster.name} 被冰凍，無法反擊。`);
          nextState.turn = 'player';
        } else {
          nextState.turn = 'enemy';
        }
      }
    }

    // 減少狀態回合數
    if (nextState.doubleAttackTurns > 0) nextState.doubleAttackTurns--;

    setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
  };

  const resolveEnemyTurn = (daughter: Daughter) => {
    if (!combatState.isActive || !combatState.monster || combatState.monsterHp <= 0) return;
    if (combatState.turn !== 'enemy') return;

    const nextState = { ...combatState };
    const monster = nextState.monster!;
    const logEntries: string[] = [];
    
    // 怪物隨機攻擊一個活著的隊員
    let targetKey: 'solo' | 'emilia' | 'yv' | 'jumbo' = 'solo';
    const isEmilia = daughter.characterId === 'emilia';

    if (isEmilia) {
      // 如果 jumbo 嘲諷中且活著
      if (nextState.jumboTauntTurns > 0 && nextState.party.jumbo && nextState.party.jumbo.hp > 0) {
        targetKey = 'jumbo';
        nextState.jumboTauntTurns--;
      } else {
        // 隨機選擇活著的隊員
        const pool: ('emilia' | 'yv' | 'jumbo')[] = [];
        if (nextState.party.emilia && nextState.party.emilia.hp > 0) pool.push('emilia');
        if (nextState.party.yv && nextState.party.yv.hp > 0) pool.push('yv');
        if (nextState.party.jumbo && nextState.party.jumbo.hp > 0) pool.push('jumbo');
        
        if (pool.length > 0) {
          targetKey = pool[Math.floor(Math.random() * pool.length)] as any;
        } else {
          // 全滅
          nextState.turn = 'defeat';
          setCombatState(nextState);
          return;
        }
      }
    } else {
      targetKey = 'solo';
    }

    const targetObj: any = (nextState.party as any)[targetKey];
    if (targetObj) {
      const monsterDmg = Math.max(3, Math.round(monster.attack * (0.8 + Math.random() * 0.4)));
      
      const isTargetDaughter = targetKey === 'solo' || targetKey === 'emilia';
      if (isTargetDaughter) {
        const { strength, combatSkill } = daughter.attributes;
        let def = Math.round(strength * 0.05 + combatSkill * 0.05);
        if (daughter.fatherBackground === 'knight') {
          def += 5;
        }
        
        let satiatedReduction = 0;
        if (nextState.satiated) {
          def += 10;
          satiatedReduction = 10;
        }
        
        const finalDmg = Math.max(3, monsterDmg - def);
        targetObj.hp = Math.max(0, targetObj.hp - finalDmg);
        logEntries.push(`👿 ${monster.name} 發動反擊，對 ${targetObj.name} 造成了 ${finalDmg} 點傷害！`);
        
        let defDetail = `🛡️ 女兒防禦護甲發揮作用（基礎防禦減免: ${def - satiatedReduction} 點傷害）`;
        if (daughter.fatherBackground === 'knight') {
          defDetail += `（騎士老爸額外 +5 防禦）`;
        }
        if (nextState.satiated) {
          defDetail += ` + 🍱 特級米糕飽腹效果額外防禦 +10，減免傷害！`;
        }
        logEntries.push(defDetail);
      } else {
        targetObj.hp = Math.max(0, targetObj.hp - monsterDmg);
        logEntries.push(`👿 ${monster.name} 發動反擊，對 ${targetObj.name} 造成了 ${monsterDmg} 點傷害！`);
      }
      
      // 檢查隊員是否倒下
      if (targetObj.hp <= 0) {
        logEntries.push(`💀 ${targetObj.name} 倒下了！`);
      }
    }

    // 檢查全隊是否陣亡
    let isTipedOver = false;
    if (isEmilia) {
      const emiliaHp = nextState.party.emilia?.hp || 0;
      const yvHp = nextState.party.yv?.hp || 0;
      const jumboHp = nextState.party.jumbo?.hp || 0;
      if (emiliaHp <= 0 && yvHp <= 0 && jumboHp <= 0) {
        isTipedOver = true;
      }
    } else {
      if ((nextState.party.solo?.hp || 0) <= 0) {
        isTipedOver = true;
      }
    }

    if (isTipedOver) {
      logEntries.push(`💀 隊伍全軍覆沒……`);
      nextState.turn = 'defeat';
    } else {
      nextState.turn = 'player';
    }

    setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
  };

  const failFleeAttempt = () => {
    setCombatState(prev => {
      if (!prev.isActive || !prev.monster) return prev;
      return {
        ...prev,
        turn: 'enemy',
        combatLog: [...prev.combatLog, `❌ 逃跑失敗！${prev.monster.name} 封鎖了退路！`]
      };
    });
  };

  const endCombat = (_result: 'victory' | 'defeat' | 'fled') => {
    setCombatState(INITIAL_COMBAT_STATE);
  };

  return (
    <CombatContext.Provider
      value={{
        combatState,
        startCombat,
        executePlayerAction,
        resolveEnemyTurn,
        endCombat,
        failFleeAttempt
      }}
    >
      {children}
    </CombatContext.Provider>
  );
};
