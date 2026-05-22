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
}

interface CombatContextProps {
  combatState: CombatState;
  startCombat: (monster: Monster, daughter: Daughter) => void;
  executePlayerAction: (
    actor: 'solo' | 'emilia' | 'yv' | 'jumbo',
    action: 'attack' | 'skill_slash' | 'skill_combo' | 'skill_heal' | 'skill_fire' | 'skill_taunt' | 'skill_smash' | 'item_binlang_ice' | 'item_binlang_twin' | 'item_binlang_normal' | 'flee',
    targetMember?: 'emilia' | 'yv' | 'jumbo' | 'solo'
  ) => void;
  resolveEnemyTurn: (daughter: Daughter) => void;
  endCombat: (result: 'victory' | 'defeat' | 'fled') => void;
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
  frozenTurns: 0
};

export const CombatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [combatState, setCombatState] = useState<CombatState>(INITIAL_COMBAT_STATE);

  const startCombat = (monster: Monster, daughter: Daughter) => {
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
      frozenTurns: 0
    });
  };

  const executePlayerAction = (
    actor: 'solo' | 'emilia' | 'yv' | 'jumbo',
    action: 'attack' | 'skill_slash' | 'skill_combo' | 'skill_heal' | 'skill_fire' | 'skill_taunt' | 'skill_smash' | 'item_binlang_ice' | 'item_binlang_twin' | 'item_binlang_normal' | 'flee',
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

    // --- 玩家各指令解析 ---
    if (action === 'attack') {
      // 普通攻擊
      let baseDmg = actor === 'yv' ? 10 : actor === 'jumbo' ? 22 : 18;
      // 暴擊判定
      const isCrit = Math.random() < 0.15;
      damage = Math.max(5, Math.round(baseDmg * (isCrit ? 1.5 : 1) - monster.defense * 0.5));
      
      // 連擊 Buff 判定
      if (actor === 'solo' && nextState.doubleAttackTurns > 0) {
        damage = Math.round(damage * 1.8);
        logEntries.push(`⚔️ ${actorObj.name} 雙子星檳榔連擊爆發！`);
      }
      
      logEntries.push(`⚔️ ${actorObj.name} 攻擊 ${monster.name}，造成 ${damage} 點傷害！${isCrit ? '（關鍵一擊！）' : ''}`);
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
      damage = Math.max(10, Math.round(28 - monster.defense * 0.5));
      logEntries.push(`🔥 ${actorObj.name} 消耗 10 MP 施展皇家斬擊！造成 ${damage} 點傷害！`);
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
      targetObj.hp = Math.max(0, targetObj.hp - monsterDmg);
      logEntries.push(`👿 ${monster.name} 發動反擊，對 ${targetObj.name} 造成了 ${monsterDmg} 點傷害！`);
      
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
        endCombat
      }}
    >
      {children}
    </CombatContext.Provider>
  );
};
