import React, { createContext, useContext, useState } from 'react';
import type { Monster, PartyMember, Daughter } from '../types';
import { audioManager } from '../utils/audio';

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
  monsterPoisonTurns: number; // 怪物中毒剩餘回合
  monsterBurnTurns: number; // 怪物灼燒剩餘回合
  monsterSilenceTurns: number; // 怪物沉默剩餘回合
  monsterStunTurns: number; // 怪物定身/眩暈剩餘回合
  playerPoisonTurns: Record<string, number>; // 玩家中毒剩餘回合 (solo, emilia, yv, jumbo)
  playerBurnTurns: Record<string, number>; // 玩家灼燒剩餘回合
  playerSilenceTurns: Record<string, number>; // 玩家沉默剩餘回合
  playerStunTurns: Record<string, number>; // 玩家定身/眩暈剩餘回合
  satiated: boolean; // 飽腹狀態
  inventory: string[]; // 當前背包備份，用於判定武器加成
  observeCount: number;
  isReunionTriggered: boolean;
  reunitedSisterId: string | null;
  daughter: Daughter | null;
}

interface CombatContextProps {
  combatState: CombatState;
  startCombat: (
    monster: Monster, 
    daughter: Daughter, 
    satiated?: boolean, 
    inventory?: string[], 
    party?: { yv: PartyMember; jumbo: PartyMember }
  ) => void;
  executePlayerAction: (
    actor: 'solo' | 'emilia' | 'yv' | 'jumbo',
    action: 'attack' | 'skill_slash' | 'skill_combo' | 'skill_heal' | 'skill_fire' | 'skill_taunt' | 'skill_smash' | 'skill_ice_juice' | 'item_binlang_ice' | 'item_binlang_twin' | 'item_binlang_normal' | 'item_rice_cake' | 'flee' | 'observe',
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
  monsterPoisonTurns: 0,
  monsterBurnTurns: 0,
  monsterSilenceTurns: 0,
  monsterStunTurns: 0,
  playerPoisonTurns: { solo: 0, emilia: 0, yv: 0, jumbo: 0 },
  playerBurnTurns: { solo: 0, emilia: 0, yv: 0, jumbo: 0 },
  playerSilenceTurns: { solo: 0, emilia: 0, yv: 0, jumbo: 0 },
  playerStunTurns: { solo: 0, emilia: 0, yv: 0, jumbo: 0 },
  satiated: false,
  inventory: [],
  observeCount: 0,
  isReunionTriggered: false,
  reunitedSisterId: null,
  daughter: null
};

export const CombatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [combatState, setCombatState] = useState<CombatState>(INITIAL_COMBAT_STATE);

  const startCombat = (
    monster: Monster,
    daughter: Daughter,
    satiated: boolean = false,
    inventory: string[] = [],
    party?: { yv: PartyMember; jumbo: PartyMember }
  ) => {
    const isEmilia = daughter.characterId === 'emilia';
    
    const partyData: CombatState['party'] = {};
    if (isEmilia) {
      partyData.emilia = { name: daughter.name, hp: daughter.combatHp, maxHp: daughter.attributes.stamina, mp: daughter.combatMp, maxMp: daughter.attributes.magicSkill * 2 + 10 };
      partyData.yv = party?.yv 
        ? { ...party.yv } 
        : { name: 'yv', hp: 90, maxHp: 90, mp: 60, maxMp: 60 };
      partyData.jumbo = party?.jumbo 
        ? { ...party.jumbo } 
        : { name: 'jumbo', hp: 160, maxHp: 160, mp: 30, maxMp: 30 };
      
      // 私房聖水裝備加成：法力值上限 +20
      if (partyData.yv.weapon === 'holy_water') {
        partyData.yv.maxMp = 80;
        partyData.yv.mp = Math.min(80, partyData.yv.mp + 20);
      }
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
      monsterPoisonTurns: 0,
      monsterBurnTurns: 0,
      monsterSilenceTurns: 0,
      monsterStunTurns: 0,
      playerPoisonTurns: { solo: 0, emilia: 0, yv: 0, jumbo: 0 },
      playerBurnTurns: { solo: 0, emilia: 0, yv: 0, jumbo: 0 },
      playerSilenceTurns: { solo: 0, emilia: 0, yv: 0, jumbo: 0 },
      playerStunTurns: { solo: 0, emilia: 0, yv: 0, jumbo: 0 },
      satiated,
      inventory,
      observeCount: 0,
      isReunionTriggered: false,
      reunitedSisterId: null,
      daughter
    });
  };

  const resolvePlayerTurnStart = (nextState: CombatState, daughter: Daughter, logEntries: string[]) => {
    const isEmilia = daughter.characterId === 'emilia';
    const members: ('solo' | 'emilia' | 'yv' | 'jumbo')[] = isEmilia ? ['emilia', 'yv', 'jumbo'] : ['solo'];

    members.forEach(member => {
      const memberObj: any = nextState.party[member];
      if (!memberObj || memberObj.hp <= 0) return;

      // 結算中毒
      if (nextState.playerPoisonTurns[member] > 0) {
        const dmg = 10;
        memberObj.hp = Math.max(0, memberObj.hp - dmg);
        nextState.playerPoisonTurns[member]--;
        logEntries.push(`🧪 ${memberObj.name} 受到毒素傷害，失去 ${dmg} 點生命值！（剩餘 ${nextState.playerPoisonTurns[member]} 回合）`);
        if (memberObj.hp <= 0) {
          logEntries.push(`💀 ${memberObj.name} 毒發倒下了！`);
        }
      }

      // 結算灼燒
      if (nextState.playerBurnTurns[member] > 0) {
        const dmg = 8;
        memberObj.hp = Math.max(0, memberObj.hp - dmg);
        nextState.playerBurnTurns[member]--;
        logEntries.push(`🔥 ${memberObj.name} 受到灼燒傷害，失去 ${dmg} 點生命值！（剩餘 ${nextState.playerBurnTurns[member]} 回合）`);
        if (memberObj.hp <= 0) {
          logEntries.push(`💀 ${memberObj.name} 燒傷倒下了！`);
        }
      }

      // 遞減沉默回合
      if (nextState.playerSilenceTurns[member] > 0) {
        nextState.playerSilenceTurns[member]--;
      }
    });

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
      return;
    }

    // 隨機觸發同窗好友戰鬥援護 (好感度 >= 40 且 15% 機率)
    const bonds = daughter.bonds || { clover: 0, shanshan: 0, xuewu: 0 };
    const eligibleAssists: ('clover' | 'shanshan' | 'xuewu')[] = [];
    if (bonds.clover >= 40) eligibleAssists.push('clover');
    if (bonds.shanshan >= 40) eligibleAssists.push('shanshan');
    if (bonds.xuewu >= 40) eligibleAssists.push('xuewu');

    if (eligibleAssists.length > 0 && Math.random() < 0.15) {
      const assistType = eligibleAssists[Math.floor(Math.random() * eligibleAssists.length)];
      if (assistType === 'clover') {
        const strength = daughter.attributes?.strength || 0;
        const assistDmg = Math.round(25 + strength * 0.1);
        nextState.monsterHp = Math.max(0, nextState.monsterHp - assistDmg);
        logEntries.push(`🍀 【同窗戰鬥援護】四葉草 突然亂入戰場！使出精湛的「迴旋斬」！對 ${nextState.monster!.name} 造成了 ${assistDmg} 點克制傷害！`);
        audioManager.playSfx('sfx_crit.mp3');
        
        if (nextState.monsterHp <= 0) {
          audioManager.playSfx('sfx_coin.mp3');
          logEntries.push(`🎉 擊敗了 ${nextState.monster!.name}！獲得 ${nextState.monster!.goldReward} 金幣。`);
          nextState.turn = 'victory';
        }
      } else if (assistType === 'shanshan') {
        members.forEach(member => {
          const memberObj: any = nextState.party[member];
          if (memberObj && memberObj.hp > 0) {
            memberObj.mp = Math.min(memberObj.maxMp, memberObj.mp + 10);
          }
        });
        logEntries.push(`📖 【同窗戰鬥援護】珊珊 突然亂入戰場！高舉魔導書吟唱「心靈之音」，為全體存活隊員回復 10 點 MP！`);
        audioManager.playSfx('sfx_heal.mp3');
      } else if (assistType === 'xuewu') {
        members.forEach(member => {
          const memberObj: any = nextState.party[member];
          if (memberObj && memberObj.hp > 0) {
            memberObj.hp = Math.min(memberObj.maxHp, memberObj.hp + 25);
          }
        });
        logEntries.push(`🧪 【同窗戰鬥援護】雪舞 突然亂入戰場！投擲新型煉金藥劑，灑下治癒微光，為全體存活隊員回復 25 點 HP！`);
        audioManager.playSfx('sfx_heal.mp3');
      }
    }
  };

  const executePlayerAction = (
    actor: 'solo' | 'emilia' | 'yv' | 'jumbo',
    action: 'attack' | 'skill_slash' | 'skill_combo' | 'skill_heal' | 'skill_fire' | 'skill_taunt' | 'skill_smash' | 'skill_ice_juice' | 'item_binlang_ice' | 'item_binlang_twin' | 'item_binlang_normal' | 'item_rice_cake' | 'flee' | 'observe',
    targetMember?: 'emilia' | 'yv' | 'jumbo' | 'solo'
  ) => {
    if (!combatState.isActive || !combatState.monster) return;
    
    const nextState = { ...combatState };
    const monster = nextState.monster!;
    const logEntries: string[] = [];
    let damage = 0;
    let shouldPlayHitSfx = false;
    let shouldPlayCritSfx = false;
    let shouldPlayHealSfx = false;
    
    // 獲取施法者資訊
    let actorObj: any;
    if (actor === 'solo') actorObj = nextState.party.solo;
    else if (actor === 'emilia') actorObj = nextState.party.emilia;
    else if (actor === 'yv') actorObj = nextState.party.yv;
    else if (actor === 'jumbo') actorObj = nextState.party.jumbo;

    if (!actorObj || actorObj.hp <= 0) return;

    // --- 異常狀態攔截 ---
    // 1. 定身/眩暈攔截
    if (nextState.playerStunTurns[actor] > 0) {
      logEntries.push(`🌀 ${actorObj.name} 處於定身/眩暈狀態，無法行動！`);
      nextState.playerStunTurns[actor] = Math.max(0, nextState.playerStunTurns[actor] - 1);
      
      // 直接進行下一動輪替（跳過此角色回合）
      if (nextState.monsterHp <= 0) {
        audioManager.playSfx('sfx_coin.mp3');
        logEntries.push(`🎉 擊敗了 ${monster.name}！獲得 ${monster.goldReward} 金幣。`);
        nextState.turn = 'victory';
      } else {
        let isEnemyBlocked = false;
        let blockReason = '';
        if (nextState.frozenTurns > 0) {
          nextState.frozenTurns--;
          blockReason = `❄️ ${monster.name} 被冰凍，無法行動！（剩餘冰凍回合: ${nextState.frozenTurns}）`;
          isEnemyBlocked = true;
        } else if (nextState.monsterStunTurns > 0) {
          nextState.monsterStunTurns--;
          blockReason = `🌀 ${monster.name} 處於定身/眩暈狀態，無法行動！（剩餘眩暈回合: ${nextState.monsterStunTurns}）`;
          isEnemyBlocked = true;
        }

        if (isEnemyBlocked) {
          logEntries.push(blockReason);
          nextState.turn = 'player';
          resolvePlayerTurnStart(nextState, nextState.daughter!, logEntries);
        } else {
          nextState.turn = 'enemy';
        }
      }
      setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
      return;
    }

    // 2. 沉默攔截
    if (action.startsWith('skill_') && nextState.playerSilenceTurns[actor] > 0) {
      logEntries.push(`🔇 ${actorObj.name} 處於沉默狀態，無法施展技能與魔法！`);
      setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
      return;
    }

    // 計算魔物的有效防禦力（灼燒防禦降低 30%）
    const effectiveMonsterDefense = nextState.monsterBurnTurns > 0 
      ? Math.round(monster.defense * 0.7) 
      : monster.defense;

    // 攻擊與傷害技能會重置觀察計數
    const isOffensive = ['attack', 'skill_slash', 'skill_combo', 'skill_fire', 'skill_smash', 'skill_ice_juice'].includes(action);
    if (isOffensive) {
      nextState.observeCount = 0;
    }

    // --- 逃跑邏輯 ---
    if (action === 'flee') {
      audioManager.playSfx('sfx_click.mp3');
      const escapeChance = actor === 'solo' ? 0.5 : 0.4;
      if (Math.random() < escapeChance) {
        logEntries.push(`🏃 ${actorObj.name} 成功帶領隊伍逃離戰鬥！`);
        nextState.turn = 'victory';
      } else {
        logEntries.push(`❌ 逃跑失敗！${monster.name} 封鎖了退路！`);
        nextState.turn = 'enemy';
      }
      setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
      return;
    }

    // --- 觀察邏輯 ---
    if (action === 'observe') {
      audioManager.playSfx('sfx_click.mp3');
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
      let baseDmg = 18;
      let critRate = 0.15;
      
      if (actor === 'yv') {
        baseDmg = actorObj.weapon === 'old_lute' ? 15 : 10;
      } else if (actor === 'jumbo') {
        if (actorObj.weapon === 'giant_hammer') {
          baseDmg = 57;
          critRate = 0.30;
        } else if (actorObj.weapon === 'steel_sword') {
          baseDmg = 42;
        } else {
          baseDmg = 22;
        }
      } else {
        // solo / emilia
        const hasHammer = nextState.inventory && nextState.inventory.includes('giant_hammer');
        if (hasHammer) {
          baseDmg += 30;
          critRate = 0.30;
        }
      }

      // 神廟獻祭暴擊加成判定
      if ((actor === 'solo' || actor === 'emilia') && nextState.inventory && nextState.inventory.includes('temple_double_rate')) {
        critRate += 0.10;
      }

      // 暴擊判定
      const isCrit = Math.random() < critRate;
      audioManager.playSfx(isCrit ? 'sfx_crit.mp3' : 'sfx_hit.mp3');
      damage = Math.max(5, Math.round(baseDmg * (isCrit ? 1.5 : 1) - effectiveMonsterDefense * 0.5));
      
      // 連擊 Buff 判定
      if (actor === 'solo' && nextState.doubleAttackTurns > 0) {
        damage = Math.round(damage * 1.8);
        logEntries.push(`⚔️ ${actorObj.name} 雙子星檳榔連擊爆發！`);
      }
      
      // 神聖克制：Yv 的普通攻擊克制幽靈 (1.5x)
      const isYvHolyWeak = (actor === 'yv') && monster.name.includes('幽靈');
      if (isYvHolyWeak) {
        damage = Math.round(damage * 1.5);
      }

      logEntries.push(`⚔️ ${actorObj.name} 攻擊 ${monster.name}，造成 ${damage} 點傷害！${isCrit ? '（關鍵一擊！）' : ''}${isYvHolyWeak ? '✨ 元素克制：神聖對不死/幽靈魔物造成 1.5 倍傷害！' : ''}`);
      if (actor === 'jumbo' && actorObj.weapon === 'giant_hammer') {
        logEntries.push(`🔨 jumbo 裝備「三十公分的錘子」加持：物理基礎攻擊力大幅提升，暴擊率提升至 30%！`);
      } else if (actor === 'jumbo' && actorObj.weapon === 'steel_sword') {
        logEntries.push(`⚔️ jumbo 裝備「古雅十字鐵劍」加持：物理基礎攻擊力提升！`);
      } else if (actor === 'yv' && actorObj.weapon === 'old_lute') {
        logEntries.push(`🎸 yv 裝備「古舊的魯特琴」加持：普通攻擊傷害微幅提升！`);
      } else if ((actor === 'solo' || actor === 'emilia') && nextState.inventory && nextState.inventory.includes('giant_hammer')) {
        logEntries.push(`🔨 裝備「三十公分的錘子」加持：額外 +30 傷害，暴擊率提升至 30%！`);
      }

      // 淬毒雙短刃判定 (女主角物理攻擊 50% 機率施加「中毒」)
      const hasPoisonDagger = (actor === 'solo' || actor === 'emilia') && nextState.inventory && nextState.inventory.includes('bm_poison_dagger');
      if (hasPoisonDagger && Math.random() < 0.50) {
        nextState.monsterPoisonTurns = 3;
        logEntries.push(`🧪 淬毒雙短刃生效！${monster.name} 陷入中毒狀態，持續 3 回合！（每回合扣除 20 HP）`);
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
      audioManager.playSfx(hasCross ? 'sfx_crit.mp3' : 'sfx_hit.mp3');
      if (hasCross) {
        damage = Math.max(25, Math.round(56 - effectiveMonsterDefense * 0.5));
        logEntries.push(`⚔️ ${actorObj.name} 消耗 10 MP 施展皇家奧義「十字斬」！造成 ${damage} 點傷害！`);
      } else {
        damage = Math.max(10, Math.round(28 - effectiveMonsterDefense * 0.5));
        logEntries.push(`🔥 ${actorObj.name} 消耗 10 MP 施展皇家斬擊！造成 ${damage} 點傷害！`);
      }
      nextState.monsterHp = Math.max(0, nextState.monsterHp - damage);
      shouldPlayHitSfx = true;
    } 
    
    else if (action === 'skill_combo') {
      // 合體奧義「青梅竹馬友情大連擊」
      const pEmilia = nextState.party.emilia;
      const pYv = nextState.party.yv;
      const pJumbo = nextState.party.jumbo;
      const hasTrio = pEmilia && pYv && pJumbo && pYv.hp > 0 && pJumbo.hp > 0;
      
      if (hasTrio && pEmilia && pYv && pJumbo) {
        if (pEmilia.mp < 12 || pYv.mp < 12 || pJumbo.mp < 12) {
          logEntries.push(`❌ 全隊 MP 不足！三人皆需 12 點 MP 才能釋放友情合體奧義。`);
          setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
          return;
        }
        audioManager.playSfx('sfx_crit.mp3');
        pEmilia.mp -= 12;
        pYv.mp -= 12;
        pJumbo.mp -= 12;
        
        let bonus = 0;
        if (pYv.weapon === 'old_lute') bonus += 15;
        if (pJumbo.weapon === 'giant_hammer') bonus += 35;
        if (pJumbo.weapon === 'steel_sword') bonus += 20;

        damage = Math.max(100, Math.round(150 + bonus - effectiveMonsterDefense * 0.2));
        logEntries.push(`✨✨✨ 【合體奧義】青梅竹馬友情大連擊！ ✨✨✨`);
        logEntries.push(`⚔️ jumbo 舉盾正面防禦重擊！yv 吟唱爆炎旋風！艾蜜莉亞釋放皇家十字裂空斬！`);
        logEntries.push(`💥 三人默契合一產生強烈共鳴，對魔物 ${monster.name} 造成了毀滅性的 ${damage} 點大傷害！`);
        if (bonus > 0) {
          logEntries.push(`🎒（小隊裝備共鳴加成：額外 +${bonus} 傷害）`);
        }
      } else {
        // 單人連擊
        if (actorObj.mp < 30) {
          logEntries.push(`❌ MP 不足！無法施展單人連擊。`);
          setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
          return;
        }
        audioManager.playSfx('sfx_crit.mp3');
        actorObj.mp -= 30;
        damage = Math.max(40, Math.round(75 - effectiveMonsterDefense * 0.3));
        logEntries.push(`✨ ${actorObj.name} 施展單人突刺連擊！對 ${monster.name} 造成 ${damage} 點傷害。`);
      }
      nextState.monsterHp = Math.max(0, nextState.monsterHp - damage);
      shouldPlayHitSfx = true;
    }

    else if (action === 'skill_heal') {
      // yv 治療術 (12 MP)
      if (actorObj.mp < 12) {
        logEntries.push(`❌ MP 不足！無法施展治癒術。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 12;
      audioManager.playSfx('sfx_heal.mp3');
      
      let target: any;
      if (targetMember === 'emilia') target = nextState.party.emilia;
      else if (targetMember === 'yv') target = nextState.party.yv;
      else if (targetMember === 'jumbo') target = nextState.party.jumbo;
      else target = actorObj;

      if (target) {
        const healAmt = actorObj.weapon === 'old_lute' ? 60 : 45;
        target.hp = Math.min(target.maxHp, target.hp + healAmt);
        if (actorObj.weapon === 'old_lute') {
          logEntries.push(`💚 yv 彈奏魯特琴施展「聖光治癒」，回復 ${target.name} ${healAmt} 點生命值！（琴音悠揚治癒加成 +15！）`);
        } else {
          logEntries.push(`💚 yv 施展「聖光治癒」，回復 ${target.name} ${healAmt} 點生命值！`);
        }
        shouldPlayHealSfx = true;
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
      audioManager.playSfx('sfx_hit.mp3');
      let baseFireDmg = actorObj.weapon === 'old_lute' ? 53 : 38;
      
      // 火系克制：克制木/土系魔物 (史萊姆、巨蛛) 1.5 倍傷害
      const isWeak = monster.name.includes('史萊姆') || monster.name.includes('蛛');
      if (isWeak) {
        baseFireDmg = Math.round(baseFireDmg * 1.5);
      }
      if (actorObj.weapon === 'old_lute') {
        logEntries.push(`💥 yv 彈奏魯特琴釋放音波火球！對 ${monster.name} 造成 ${baseFireDmg} 點魔法傷害！${isWeak ? '🔥 元素克制：火對木/土系魔物造成 1.5 倍傷害！' : ''}（魯特琴魔法加成 +15）`);
      } else {
        logEntries.push(`💥 yv 吟唱法術，噴射烈焰火球！對 ${monster.name} 造成 ${baseFireDmg} 點魔法傷害！${isWeak ? '🔥 元素克制：火對木/土系魔物造成 1.5 倍傷害！' : ''}`);
      }

      // 施加灼燒狀態 3 回合 (100% 機率)
      nextState.monsterBurnTurns = 3;
      logEntries.push(`🔥 ${monster.name} 陷入了 3 回合的灼燒狀態！（防禦降低 30%，每回合扣除 15 HP）`);

      nextState.monsterHp = Math.max(0, nextState.monsterHp - baseFireDmg);
    }

    else if (action === 'skill_taunt') {
      // jumbo 嘲諷 (8 MP)
      if (actorObj.mp < 8) {
        logEntries.push(`❌ MP 不足！無法強行嘲諷。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 8;
      audioManager.playSfx('sfx_click.mp3');
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
      audioManager.playSfx('sfx_hit.mp3');
      
      let baseSmashDmg = 35;
      let weaponDesc = '';
      if (actorObj.weapon === 'giant_hammer') {
        baseSmashDmg = 70;
        weaponDesc = `🔨 jumbo 揮舞「三十公分的錘子」砸向地面！釋放大地裂波，`;
      } else if (actorObj.weapon === 'steel_sword') {
        baseSmashDmg = 50;
        weaponDesc = `⚔️ jumbo 揮舞「古雅十字鐵劍」使出重力橫掃，`;
      } else {
        baseSmashDmg = 35;
        weaponDesc = `🔨 jumbo 重擊地面，碎石橫飛，`;
      }
      
      damage = Math.max(15, Math.round(baseSmashDmg - effectiveMonsterDefense * 0.4));
      
      // 物理/地系克制：克制靈體魔物 (幽靈) 1.5 倍傷害
      const isWeak = monster.name.includes('幽靈');
      if (isWeak) {
        damage = Math.round(damage * 1.5);
      }

      logEntries.push(`${weaponDesc}對 ${monster.name} 造成了 ${damage} 點傷害！${isWeak ? '🔨 元素克制：重力物理對靈體魔物造成 1.5 倍傷害！' : ''}`);
      nextState.monsterHp = Math.max(0, nextState.monsterHp - damage);
      shouldPlayHitSfx = true;
    }

    else if (action === 'skill_ice_juice') {
      // 極凍檳榔汁大招 (12 MP)
      if (actorObj.mp < 12) {
        logEntries.push(`❌ MP 不足！無法施展極凍檳榔汁。`);
        setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
        return;
      }
      actorObj.mp -= 12;
      audioManager.playSfx('sfx_hit.mp3');
      let baseIceDmg = Math.max(15, Math.round(40 - effectiveMonsterDefense * 0.3));
      
      // 冰系克制：克制岩石魔物 (魔像) 1.5 倍傷害
      const isWeak = monster.name.includes('魔像');
      if (isWeak) {
        baseIceDmg = Math.round(baseIceDmg * 1.5);
      }

      nextState.frozenTurns = 2;
      logEntries.push(`❄️ ${actorObj.name} 施展主動大招【極凍檳榔汁】！對 ${monster.name} 造成 ${baseIceDmg} 點冰霜傷害，${isWeak ? '❄️ 元素克制：冰對岩石魔物造成 1.5 倍傷害！' : ''}並將其定身冰凍 2 回合！`);
      nextState.monsterHp = Math.max(0, nextState.monsterHp - baseIceDmg);
    }

    // --- 檳榔道具邏輯 ---
    else if (action === 'item_binlang_ice') {
      audioManager.playSfx('sfx_click.mp3');
      nextState.frozenTurns = 2;
      logEntries.push(`❄️ 女兒嚼起【結冰檳榔】吐出寒霜黏液，${monster.name} 被牢牢凍結，無法行動 2 回合！`);
    }

    else if (action === 'item_binlang_twin') {
      audioManager.playSfx('sfx_click.mp3');
      nextState.doubleAttackTurns = 3;
      logEntries.push(`🔥 女兒吞下【雙子星檳榔】，全身氣血翻湧！攻擊力翻倍，持續 3 回合！`);
    }

    else if (action === 'item_binlang_normal') {
      audioManager.playSfx('sfx_heal.mp3');
      actorObj.hp = Math.min(actorObj.maxHp, actorObj.hp + 40);
      logEntries.push(`💚 女兒嚼了【包葉檳榔】，回復 40 點生命值，並感到神清氣爽！`);
      shouldPlayHealSfx = true;
    }

    else if (action === 'item_rice_cake') {
      audioManager.playSfx('sfx_heal.mp3');
      const beforeHp = actorObj.hp;
      const hpRecover = Math.round(actorObj.maxHp * 0.5);
      actorObj.hp = Math.min(actorObj.maxHp, actorObj.hp + hpRecover);
      nextState.satiated = true;
      const idx = nextState.inventory.indexOf('barrel_rice_cake');
      if (idx > -1) {
        nextState.inventory.splice(idx, 1);
      }
      const actualRecover = actorObj.hp - beforeHp;
      logEntries.push(`🍱 女兒在戰鬥中吃下【特級桶仔米糕】，回復 ${actualRecover} 點生命值，並進入飽腹狀態（防禦 +10）！`);
      shouldPlayHealSfx = true;
    }

    // --- 結算魔物異常狀態 (Poison/Burn) ---
    if (nextState.monsterHp > 0) {
      if (nextState.monsterPoisonTurns > 0) {
        const poisonDmg = 20;
        nextState.monsterHp = Math.max(0, nextState.monsterHp - poisonDmg);
        nextState.monsterPoisonTurns--;
        logEntries.push(`🧪 ${monster.name} 受到毒素折磨，失去 ${poisonDmg} 點生命值！（剩餘 ${nextState.monsterPoisonTurns} 回合）`);
      }
      
      if (nextState.monsterBurnTurns > 0) {
        const burnDmg = 15;
        nextState.monsterHp = Math.max(0, nextState.monsterHp - burnDmg);
        nextState.monsterBurnTurns--;
        logEntries.push(`🔥 ${monster.name} 受到烈火灼燒，失去 ${burnDmg} 點生命值！（剩餘 ${nextState.monsterBurnTurns} 回合）`);
      }
      
      if (nextState.monsterHp <= 0) {
        audioManager.playSfx('sfx_coin.mp3');
        logEntries.push(`🎉 擊敗了 ${monster.name}！獲得 ${monster.goldReward} 金幣。`);
        nextState.turn = 'victory';
      }
    }

    // --- 檢查怪物死亡與下一動輪替 ---
    if (nextState.monsterHp <= 0) {
      // 怪物已死
    } else {
      let isEnemyBlocked = false;
      let blockReason = '';
      
      if (nextState.frozenTurns > 0) {
        nextState.frozenTurns--;
        blockReason = `❄️ ${monster.name} 被冰凍，無法行動！（剩餘冰凍回合: ${nextState.frozenTurns}）`;
        isEnemyBlocked = true;
      } else if (nextState.monsterStunTurns > 0) {
        nextState.monsterStunTurns--;
        blockReason = `🌀 ${monster.name} 處於定身/眩暈狀態，無法行動！（剩餘眩暈回合: ${nextState.monsterStunTurns}）`;
        isEnemyBlocked = true;
      }
      
      if (isEnemyBlocked) {
        logEntries.push(blockReason);
        nextState.turn = 'player';
        resolvePlayerTurnStart(nextState, nextState.daughter!, logEntries);
      } else {
        nextState.turn = 'enemy';
      }
    }

    // 減少狀態回合數
    if (nextState.doubleAttackTurns > 0) nextState.doubleAttackTurns--;

    setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
    if (shouldPlayCritSfx) {
      audioManager.playSfx('sfx_crit.mp3', 0.65);
    } else if (shouldPlayHitSfx) {
      audioManager.playSfx('sfx_hit.mp3', 0.55);
    }
    if (shouldPlayHealSfx) {
      audioManager.playSfx('sfx_heal.mp3', 0.6);
    }
  };

  const resolveEnemyTurn = (daughter: Daughter) => {
    if (!combatState.isActive || !combatState.monster || combatState.monsterHp <= 0) return;
    if (combatState.turn !== 'enemy') return;

    const nextState = { ...combatState };
    const monster = nextState.monster!;
    const logEntries: string[] = [];
    let shouldPlayHitSfx = false;
    
    // --- 檢查魔物是否被冰凍或定身/眩暈 ---
    if (nextState.frozenTurns > 0 || nextState.monsterStunTurns > 0) {
      if (nextState.frozenTurns > 0) {
        nextState.frozenTurns--;
        logEntries.push(`❄️ ${monster.name} 被冰凍，無法行動！（剩餘冰凍回合: ${nextState.frozenTurns}）`);
      } else if (nextState.monsterStunTurns > 0) {
        nextState.monsterStunTurns--;
        logEntries.push(`🌀 ${monster.name} 處於定身/眩暈狀態，無法行動！（剩餘眩暈回合: ${nextState.monsterStunTurns}）`);
      }
      nextState.turn = 'player';
      resolvePlayerTurnStart(nextState, daughter, logEntries);
      setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
      return;
    }

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
      audioManager.playSfx('sfx_hit.mp3');
      let patternMultiplier = 1;
      if (monster.behaviorPattern === 'aggressive') patternMultiplier = 1.2;
      if (monster.behaviorPattern === 'boss') patternMultiplier = 1.12;
      const monsterDmg = Math.max(3, Math.round(monster.attack * patternMultiplier * (0.8 + Math.random() * 0.4)));
      
      const isTargetDaughter = targetKey === 'solo' || targetKey === 'emilia';
      
      // 計算防禦力
      let def = 0;
      if (isTargetDaughter) {
        const { strength, combatSkill } = daughter.attributes;
        def = Math.round(strength * 0.05 + combatSkill * 0.05);
        if (daughter.fatherBackground === 'knight') {
          def += 5;
        }
        if (nextState.satiated) {
          def += 10;
        }
        if (monster.behaviorPattern === 'boss') {
          def = Math.max(0, def - 5);
        }
      } else if (targetKey === 'jumbo') {
        def = 12;
      } else if (targetKey === 'yv') {
        def = 5;
      }

      // 灼燒狀態：防禦力下降 30%
      if (nextState.playerBurnTurns[targetKey] > 0) {
        def = Math.round(def * 0.7);
      }

      const finalDmg = Math.max(3, monsterDmg - def);
      targetObj.hp = Math.max(0, targetObj.hp - finalDmg);
      logEntries.push(`👿 ${monster.name} 發動反擊，對 ${targetObj.name} 造成了 ${finalDmg} 點傷害！`);
      
      if (isTargetDaughter) {
        let defDetail = `🛡️ 女兒防禦護甲發揮作用（基礎防禦減免: ${def - (nextState.satiated ? 10 : 0)} 點傷害）`;
        if (daughter.fatherBackground === 'knight') {
          defDetail += `（騎士老爸額外 +5 防禦）`;
        }
        if (nextState.satiated) {
          defDetail += ` + 🍱 特級米糕飽腹效果額外防禦 +10，減免傷害！`;
        }
        if (monster.behaviorPattern === 'boss') {
          defDetail += `（首領威壓穿甲，額外削弱 5 點防禦）`;
        }
        if (nextState.playerBurnTurns[targetKey] > 0) {
          defDetail += `（🔥 灼燒狀態：防禦力下降 30%！）`;
        }
        logEntries.push(defDetail);
      } else {
        if (nextState.playerBurnTurns[targetKey] > 0) {
          logEntries.push(`🛡️ ${targetObj.name} 處於 🔥 灼燒狀態，防禦力下降 30%！`);
        }
      }

      if (monster.behaviorPattern === 'aggressive' && targetObj.hp > 0 && Math.random() < 0.25) {
        const extraDmg = Math.max(2, Math.round(monster.attack * 0.35));
        targetObj.hp = Math.max(0, targetObj.hp - extraDmg);
        shouldPlayHitSfx = true;
        logEntries.push(`💢 ${monster.name} 進入狂暴節奏，追加追擊造成 ${extraDmg} 點傷害！`);
      }
      
      // 檢查隊員是否倒下
      if (targetObj.hp <= 0) {
        logEntries.push(`💀 ${targetObj.name} 倒下了！`);
      }

      // --- 魔物攻擊施加異常狀態 ---
      if (targetObj.hp > 0) {
        if (monster.name.includes('史萊姆')) {
          if (Math.random() < 0.25) {
            nextState.playerStunTurns[targetKey] = 1;
            logEntries.push(`🌀 ${monster.name} 吐出黏稠液體！${targetObj.name} 被定身/眩暈 1 回合！`);
          }
        } else if (monster.name.includes('蛛')) {
          if (Math.random() < 0.30) {
            nextState.playerPoisonTurns[targetKey] = 3;
            logEntries.push(`🧪 ${monster.name} 注入毒液！${targetObj.name} 陷入中毒狀態，持續 3 回合！`);
          }
        } else if (monster.name.includes('幽靈')) {
          if (Math.random() < 0.35) {
            nextState.playerSilenceTurns[targetKey] = 3;
            logEntries.push(`🔇 ${monster.name} 發出淒厲尖叫！${targetObj.name} 被沉默了，3 回合內無法施展技能！`);
          }
        } else if (monster.name.includes('魔像')) {
          if (Math.random() < 0.25) {
            nextState.playerStunTurns[targetKey] = 1;
            logEntries.push(`🌀 ${monster.name} 發動重擊！${targetObj.name} 被震暈/眩暈 1 回合！`);
          }
        } else if (monster.name.includes('傑克斯')) {
          const rand = Math.random();
          if (rand < 0.30) {
            nextState.playerBurnTurns[targetKey] = 3;
            logEntries.push(`🔥 ${monster.name} 揮舞燃燒的軍刀！${targetObj.name} 陷入灼燒狀態，持續 3 回合！`);
          } else if (rand >= 0.30 && rand < 0.50) {
            nextState.playerSilenceTurns[targetKey] = 3;
            logEntries.push(`🔇 ${monster.name} 高聲喝令軍規！${targetObj.name} 被威懾沉默，3 回合內無法施展技能！`);
          }
        }
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
      resolvePlayerTurnStart(nextState, daughter, logEntries);
    }

    setCombatState({ ...nextState, combatLog: [...nextState.combatLog, ...logEntries] });
    if (shouldPlayHitSfx) {
      audioManager.playSfx('sfx_hit.mp3', 0.5);
    }
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
