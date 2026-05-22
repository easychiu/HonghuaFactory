import React, { createContext, useContext, useState } from 'react';
import type { GameState, Daughter, NarrativeEvent, AdventureState, AdventureNode, CharacterAttributes, PeriodType, DialogueNode } from '../types';
import { ACTIVITIES, ITEMS } from '../data/gameData';

interface GameContextProps {
  state: GameState;
  initGame: (name: string, birthMonth: number, birthDay: number, avatarUrl?: string) => void;
  updateAvatarUrl: (url: string) => void;
  setSchedule: (early: string, mid: string, late: string) => void;
  startScheduleExecution: () => void;
  executeNextPeriod: () => boolean; // returns true if month finished
  finishExecution: () => void;
  buyItem: (itemId: string) => { success: boolean; message: string };
  talkToDaughter: (type: 'gentle' | 'scold' | 'praise') => void;
  startAdventure: () => void;
  stepAdventure: () => void;
  adventureCombatAction: (action: 'attack' | 'magic' | 'flee') => void;
  endAdventure: () => void;
  triggerEvent: (event: NarrativeEvent) => void;
  selectEventChoice: (choice: any) => void;
  saveGame: () => void;
  loadGame: () => boolean;
  resetGame: () => void;
  toggleCheatMode: () => void;
  setScreen: (screen: GameState['activeScreen']) => void;
}

const DEFAULT_ATTRIBUTES: CharacterAttributes = {
  stamina: 100,
  strength: 50,
  intelligence: 50,
  charisma: 50,
  morality: 50,
  piety: 30,
  sensitivity: 40,
  stress: 0,
  combatSkill: 10,
  magicSkill: 10,
  reputation: 10
};

const INITIAL_DAUGHTER = (name: string, birthMonth: number, birthDay: number, avatarUrl?: string): Daughter => ({
  name: name || '小櫻',
  age: 10,
  birthMonth: birthMonth || 5,
  birthDay: birthDay || 20,
  attributes: { ...DEFAULT_ATTRIBUTES },
  gold: 150,
  relationship: 50,
  outfit: 'default',
  combatHp: 100,
  combatMp: 50,
  avatarUrl: avatarUrl || '/8719.png'
});

const INITIAL_STATE: GameState = {
  daughter: INITIAL_DAUGHTER('小櫻', 5, 20),
  time: { year: 1, month: 1, period: 'early' },
  schedule: null,
  inventory: [],
  activeScreen: 'main',
  logs: [],
  currentEvent: null,
  currentEventStep: null,
  adventure: null,
  cheatMode: false
};

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

  const setScreen = (screen: GameState['activeScreen']) => {
    setState((prev) => ({ ...prev, activeScreen: screen }));
  };

  // Initialize Game
  const initGame = (name: string, birthMonth: number, birthDay: number, avatarUrl?: string) => {
    const freshDaughter = INITIAL_DAUGHTER(name, birthMonth, birthDay, avatarUrl);
    freshDaughter.combatHp = freshDaughter.attributes.stamina;
    freshDaughter.combatMp = freshDaughter.attributes.magicSkill * 2 + 10;
    
    setState({
      daughter: freshDaughter,
      time: { year: 1, month: birthMonth, period: 'early' },
      schedule: null,
      inventory: [],
      activeScreen: 'main',
      logs: [
        {
          id: Math.random().toString(),
          year: 1,
          month: birthMonth,
          period: 'early',
          text: `收養了可愛的女兒 ${freshDaughter.name}，她今年 10 歲，生日是 ${birthMonth} 月 ${birthDay} 日。展開你們的新生活吧！`,
          type: 'info'
        }
      ],
      currentEvent: null,
      currentEventStep: null,
      adventure: null,
      cheatMode: false
    });
  };

  // Set Schedule for the month
  const setSchedule = (early: string, mid: string, late: string) => {
    setState((prev) => ({
      ...prev,
      schedule: [early, mid, late]
    }));
  };

  // Start executing the schedule
  const startScheduleExecution = () => {
    if (!state.schedule) return;
    setState((prev) => ({
      ...prev,
      activeScreen: 'execution',
      time: { ...prev.time, period: 'early' }
    }));
  };

  // Execute a single period (early -> mid -> late)
  const executeNextPeriod = (): boolean => {
    if (!state.schedule) return true;
    const currentPeriod = state.time.period;
    let activityId = '';
    
    if (currentPeriod === 'early') activityId = state.schedule[0];
    else if (currentPeriod === 'mid') activityId = state.schedule[1];
    else if (currentPeriod === 'late') activityId = state.schedule[2];

    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return true;

    const newDaughter = { ...state.daughter };
    const newLogs = [...state.logs];
    const logId = Math.random().toString();

    // 1. Check Gold requirements (for study/rest)
    if (activity.cost > newDaughter.gold) {
      newLogs.push({
        id: logId,
        year: state.time.year,
        month: state.time.month,
        period: currentPeriod,
        text: `【${activity.name}】因為金幣不足（需要 ${activity.cost}，持有 ${newDaughter.gold}），被迫取消，改為在家休息。`,
        type: 'info'
      });
      // Fallback to home rest
      const rest = ACTIVITIES.find(a => a.id === 'rest_home')!;
      newDaughter.attributes.stress = Math.max(0, newDaughter.attributes.stress + (rest.statChanges.stress || 0));
    } else {
      // Deduct cost & add reward
      newDaughter.gold = Math.max(0, newDaughter.gold - activity.cost + activity.reward);
      
      // Apply stat changes
      const updatedAttributes = { ...newDaughter.attributes };
      
      Object.entries(activity.statChanges).forEach(([key, val]) => {
        const attrKey = key as keyof CharacterAttributes;
        if (attrKey === 'stress') {
          updatedAttributes.stress = Math.max(0, updatedAttributes.stress + val);
        } else {
          updatedAttributes[attrKey] = Math.max(0, updatedAttributes[attrKey] + val);
        }
      });

      newDaughter.attributes = updatedAttributes;

      // Add log
      newLogs.push({
        id: logId,
        year: state.time.year,
        month: state.time.month,
        period: currentPeriod,
        text: `完成 ${activity.name}：${activity.effectDescription}`,
        type: activity.type === 'work' ? 'stat_up' : activity.type === 'study' ? 'info' : 'stat_down'
      });
    }

    // 2. Check Stress & Sickness
    if (newDaughter.attributes.stress > newDaughter.attributes.stamina) {
      newDaughter.attributes.stress = Math.round(newDaughter.attributes.stress * 0.5);
      newDaughter.attributes.stamina = Math.max(50, newDaughter.attributes.stamina - 10);
      newDaughter.gold = Math.max(0, newDaughter.gold - 50); // Medical bills
      newLogs.push({
        id: Math.random().toString(),
        year: state.time.year,
        month: state.time.month,
        period: currentPeriod,
        text: `⚠️ 女兒因為過度勞累生病住院了！體力衰退，並花費了 50 金幣醫藥費，壓力減半。`,
        type: 'stat_down'
      });
    }

    // Check if month is completed or transition to next period
    let nextPeriod: PeriodType = 'early';
    let monthFinished = false;

    if (currentPeriod === 'early') {
      nextPeriod = 'mid';
    } else if (currentPeriod === 'mid') {
      nextPeriod = 'late';
    } else if (currentPeriod === 'late') {
      monthFinished = true;
    }

    // Recalculate dynamic combat HP / MP based on updated stats
    newDaughter.combatHp = newDaughter.attributes.stamina;
    newDaughter.combatMp = newDaughter.attributes.magicSkill * 2 + 10;

    setState(prev => ({
      ...prev,
      daughter: newDaughter,
      logs: newLogs,
      time: {
        ...prev.time,
        period: nextPeriod
      }
    }));

    return monthFinished;
  };

  // Finish month execution, advance to next month, handle age ups & festivals
  const finishExecution = () => {
    setState((prev) => {
      let nextMonth = prev.time.month + 1;
      let nextYear = prev.time.year;
      let newAge = prev.daughter.age;
      const newLogs = [...prev.logs];

      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }

      // Check for age-up on birthday month
      if (nextMonth === prev.daughter.birthMonth) {
        newAge += 1;
        newLogs.push({
          id: Math.random().toString(),
          year: nextYear,
          month: nextMonth,
          period: 'early',
          text: `🎉 生日快樂！女兒 ${prev.daughter.name} 成長為 ${newAge} 歲了！`,
          type: 'info'
        });
      }

      // Check for game over (Ending) at age 18
      if (newAge >= 18) {
        // Trigger Ending
        return {
          ...prev,
          time: { year: nextYear, month: nextMonth, period: 'early' },
          activeScreen: 'ending',
          schedule: null,
          logs: newLogs
        };
      }

      // Recalculate dynamic combat values
      const updatedDaughter = {
        ...prev.daughter,
        age: newAge,
        combatHp: prev.daughter.attributes.stamina,
        combatMp: prev.daughter.attributes.magicSkill * 2 + 10
      };

      // Check if harvest festival occurs in October
      if (nextMonth === 10) {
        newLogs.push({
          id: Math.random().toString(),
          year: nextYear,
          month: nextMonth,
          period: 'early',
          text: `🍁 十月收穫祭開始了！王國廣場正在舉辦盛大的比賽！`,
          type: 'event'
        });
        // We will trigger harvest festival. Let's make an event or route to main and show popup.
      }

      // Standard trigger random events
      // For simplicity, we can have a small chance of a dialogue or stat change
      const randomChance = Math.random();
      let triggeredEvent: NarrativeEvent | null = null;
      let eventStep: string | null = null;
      
      if (randomChance < 0.25) {
        // Generate a quick random dialogue event
        triggeredEvent = generateRandomEvent(prev.daughter, nextYear, nextMonth);
        if (triggeredEvent) {
          eventStep = triggeredEvent.dialogue[0].id;
        }
      }

      return {
        ...prev,
        daughter: updatedDaughter,
        time: { year: nextYear, month: nextMonth, period: 'early' },
        activeScreen: triggeredEvent ? 'main' : 'main', // overlay will show event if currentEvent is set
        currentEvent: triggeredEvent,
        currentEventStep: eventStep,
        schedule: null,
        logs: newLogs
      };
    });
  };

  // Generate a random event dialogue
  const generateRandomEvent = (_daughter: Daughter, _year: number, _month: number): NarrativeEvent => {
    const eventsList = [
      {
        id: 'father_talk',
        title: '父女長談',
        dialogue: [
          {
            id: 'start',
            speaker: '女兒',
            text: '父親，你覺得我最近表現得怎麼樣？',
            choices: [
              {
                text: '「非常好，你是我的驕傲！」',
                nextId: 'praise',
                effects: (s: GameState) => ({
                  daughter: {
                    ...s.daughter,
                    relationship: s.daughter.relationship + 5,
                    attributes: { ...s.daughter.attributes, charisma: s.daughter.attributes.charisma + 5 }
                  }
                })
              },
              {
                text: '「還要多加努力，不要鬆懈。」',
                nextId: 'strict',
                effects: (s: GameState) => ({
                  daughter: {
                    ...s.daughter,
                    attributes: { ...s.daughter.attributes, morality: s.daughter.attributes.morality + 8, stress: s.daughter.attributes.stress + 5 }
                  }
                })
              }
            ]
          },
          {
            id: 'praise',
            speaker: '女兒',
            text: '太好了！我會繼續努力的，謝謝爸爸！',
            nextId: 'end'
          },
          {
            id: 'strict',
            speaker: '女兒',
            text: '我知道了，我會更嚴格要求自己的。',
            nextId: 'end'
          }
        ]
      },
      {
        id: 'wander_merchant',
        title: '流浪商人造訪',
        dialogue: [
          {
            id: 'start',
            speaker: '流浪商人',
            text: '打擾了，尊敬的勇者！我這裡有一瓶神祕的精力藥水，只要 50 金幣，能瞬間消除所有疲勞，要買一瓶嗎？',
            choices: [
              {
                text: '「買下藥水（-50金幣）」',
                nextId: 'buy',
                effects: (s: GameState) => {
                  if (s.daughter.gold >= 50) {
                    return {
                      daughter: {
                        ...s.daughter,
                        gold: s.daughter.gold - 50,
                        attributes: { ...s.daughter.attributes, stress: 0, stamina: s.daughter.attributes.stamina + 5 }
                      }
                    };
                  } else {
                    return { error: '金幣不足！' } as any; // handled in component
                  }
                }
              },
              {
                text: '「禮貌拒絕」',
                nextId: 'reject'
              }
            ]
          },
          {
            id: 'buy',
            speaker: '女兒',
            text: '呼，喝下去熱熱的！疲勞感一掃而空，而且感覺身體更有力氣了！',
            nextId: 'end'
          },
          {
            id: 'reject',
            speaker: '流浪商人',
            text: '好吧，祝你們旅途愉快，下次有機會再交易。',
            nextId: 'end'
          }
        ]
      },
      {
        id: 'palace_invite',
        title: '宮廷邀請函',
        dialogue: [
          {
            id: 'start',
            speaker: '宮廷使者',
            text: '勇者大人，國王聽說您的女兒知書達禮，特邀她前往皇宮花園參加茶會。',
            choices: [
              {
                text: '「讓女兒盛裝出席（需要華麗洋裝）」',
                nextId: 'attend_dress',
                effects: (s: GameState) => {
                  const hasDress = s.inventory.includes('luxury_dress');
                  if (hasDress) {
                    return {
                      daughter: {
                        ...s.daughter,
                        attributes: { 
                          ...s.daughter.attributes, 
                          reputation: s.daughter.attributes.reputation + 40,
                          charisma: s.daughter.attributes.charisma + 10
                        }
                      }
                    };
                  } else {
                    return { error: '沒有華麗洋裝！' } as any;
                  }
                }
              },
              {
                text: '「穿著日常服裝出席」',
                nextId: 'attend_normal',
                effects: (s: GameState) => ({
                  daughter: {
                    ...s.daughter,
                    attributes: { ...s.daughter.attributes, reputation: s.daughter.attributes.reputation + 10 }
                  }
                })
              }
            ]
          },
          {
            id: 'attend_dress',
            speaker: '宮廷使者',
            text: '太完美了！貴族們都被您女兒的高雅氣質所折服，名望大幅上升！',
            nextId: 'end'
          },
          {
            id: 'attend_normal',
            speaker: '女兒',
            text: '雖然有些貴族在背後指指點點，但我和幾位隨和的大臣聊得很開心，也算長了見識。',
            nextId: 'end'
          }
        ]
      }
    ];

    // Select based on conditions
    const idx = Math.floor(Math.random() * eventsList.length);
    const ev = eventsList[idx];
    
    return {
      id: ev.id,
      title: ev.title,
      triggerCondition: () => true,
      dialogue: ev.dialogue as DialogueNode[]
    };
  };

  // Buy Item from Shop
  const buyItem = (itemId: string): { success: boolean; message: string } => {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, message: '找不到商品' };
    if (state.daughter.gold < item.price) return { success: false, message: '金幣不足' };

    let newDaughter = { ...state.daughter };
    newDaughter.gold -= item.price;

    const updatedAttributes = { ...newDaughter.attributes };
    Object.entries(item.statChanges).forEach(([key, val]) => {
      const attrKey = key as keyof CharacterAttributes;
      if (attrKey === 'stress') {
        updatedAttributes.stress = Math.max(0, updatedAttributes.stress + val);
      } else {
        updatedAttributes[attrKey] = Math.max(0, updatedAttributes[attrKey] + val);
      }
    });

    newDaughter.attributes = updatedAttributes;
    
    if (item.outfitChange) {
      newDaughter.outfit = item.outfitChange;
    }

    newDaughter.combatHp = newDaughter.attributes.stamina;
    newDaughter.combatMp = newDaughter.attributes.magicSkill * 2 + 10;

    const newLogs = [...state.logs, {
      id: Math.random().toString(),
      year: state.time.year,
      month: state.time.month,
      period: state.time.period,
      text: `購買道具【${item.name}】：${item.description}`,
      type: 'info' as const
    }];

    setState((prev) => ({
      ...prev,
      daughter: newDaughter,
      inventory: [...prev.inventory, item.id],
      logs: newLogs
    }));

    return { success: true, message: `成功購買 ${item.name}！` };
  };

  // Talk to Daughter (Interaction)
  const talkToDaughter = (type: 'gentle' | 'scold' | 'praise') => {
    let text = '';
    let newDaughter = { ...state.daughter };
    const updatedAttributes = { ...newDaughter.attributes };

    if (type === 'gentle') {
      text = `父親溫柔地和 ${state.daughter.name} 聊天。她露出了甜美的笑容。`;
      newDaughter.relationship = Math.min(100, newDaughter.relationship + 4);
      updatedAttributes.stress = Math.max(0, updatedAttributes.stress - 15);
    } else if (type === 'scold') {
      text = `父親嚴厲地訓誡了 ${state.daughter.name}。她低頭反省，感覺到了壓力。`;
      newDaughter.relationship = Math.max(0, newDaughter.relationship - 5);
      updatedAttributes.morality = updatedAttributes.morality + 8;
      updatedAttributes.stress = updatedAttributes.stress + 10;
    } else if (type === 'praise') {
      text = `父親誇獎了 ${state.daughter.name} 最近的表現。她感到充滿自信。`;
      newDaughter.relationship = Math.min(100, newDaughter.relationship + 2);
      updatedAttributes.charisma = updatedAttributes.charisma + 4;
      updatedAttributes.stress = Math.max(0, updatedAttributes.stress - 5);
    }

    newDaughter.attributes = updatedAttributes;
    newDaughter.combatHp = newDaughter.attributes.stamina;
    newDaughter.combatMp = newDaughter.attributes.magicSkill * 2 + 10;

    const newLogs = [...state.logs, {
      id: Math.random().toString(),
      year: state.time.year,
      month: state.time.month,
      period: state.time.period,
      text,
      type: 'dialogue' as const
    }];

    setState((prev) => ({
      ...prev,
      daughter: newDaughter,
      logs: newLogs
    }));
  };

  // Adventure System (野外修行)
  const startAdventure = () => {
    // Generate 6 nodes
    const nodes: AdventureNode[] = [
      { id: 0, type: 'start', name: '森林入口', cleared: true },
      { id: 1, type: 'chest', name: '遠古遺跡石雕', cleared: false },
      { id: 2, type: 'monster', name: '史萊姆巢穴', cleared: false, monster: { name: '綠色波波史萊姆', hp: 40, maxHp: 40, attack: 6, defense: 2, goldReward: 30, expReward: 15 } },
      { id: 3, type: 'rest', name: '精靈林間泉水', cleared: false },
      { id: 4, type: 'monster', name: '魔狼出沒地', cleared: false, monster: { name: '雙頭烈焰魔狼', hp: 90, maxHp: 90, attack: 14, defense: 4, goldReward: 60, expReward: 35 } },
      { id: 5, type: 'boss', name: '幽暗密林深處', cleared: false, monster: { name: '森林守護樹妖 (BOSS)', hp: 180, maxHp: 180, attack: 22, defense: 10, goldReward: 150, expReward: 80 } }
    ];

    const advState: AdventureState = {
      areaName: '神秘幽暗森林',
      nodes,
      currentNodeIndex: 0,
      daughterHp: state.daughter.combatHp,
      daughterMaxHp: state.daughter.attributes.stamina,
      combatLog: ['你帶著女兒來到了神秘的幽暗森林，開始了野外修行！'],
      status: 'exploring'
    };

    setState((prev) => ({
      ...prev,
      activeScreen: 'adventure',
      adventure: advState
    }));
  };

  const stepAdventure = () => {
    if (!state.adventure) return;
    const nextIndex = state.adventure.currentNodeIndex + 1;
    if (nextIndex >= state.adventure.nodes.length) {
      // Completed adventure!
      endAdventure();
      return;
    }

    const nextNode = state.adventure.nodes[nextIndex];
    let newStatus: AdventureState['status'] = 'exploring';
    let logMsg = `前進到了第 ${nextIndex + 1} 站：${nextNode.name}。`;
    let newDaughterHp = state.adventure.daughterHp;
    let newGold = state.daughter.gold;
    let newAttributes = { ...state.daughter.attributes };

    if (nextNode.type === 'chest') {
      newStatus = 'chest';
      const chestGold = 80 + Math.floor(Math.random() * 80);
      newGold += chestGold;
      newAttributes.reputation += 10;
      logMsg += ` 發現一個古老寶箱！獲得金幣 +${chestGold}，名望 +10。`;
      nextNode.cleared = true;
    } else if (nextNode.type === 'rest') {
      newStatus = 'exploring';
      newDaughterHp = Math.min(state.adventure.daughterMaxHp, newDaughterHp + 50);
      newAttributes.stress = Math.max(0, newAttributes.stress - 30);
      logMsg += ` 飲用了精靈泉水，體力恢復 50 點，疲勞值減少 30 點。`;
      nextNode.cleared = true;
    } else if (nextNode.type === 'monster' || nextNode.type === 'boss') {
      newStatus = 'fighting';
      logMsg += ` ⚠️ 遭遇魔物【${nextNode.monster?.name}】！進入戰鬥！`;
    }

    setState((prev) => {
      const adv = prev.adventure!;
      const updatedNodes = [...adv.nodes];
      updatedNodes[nextIndex] = nextNode;

      return {
        ...prev,
        daughter: {
          ...prev.daughter,
          gold: newGold,
          attributes: newAttributes
        },
        adventure: {
          ...adv,
          currentNodeIndex: nextIndex,
          daughterHp: newDaughterHp,
          status: newStatus,
          nodes: updatedNodes,
          combatLog: [...adv.combatLog, logMsg]
        }
      };
    });
  };

  const adventureCombatAction = (action: 'attack' | 'magic' | 'flee') => {
    if (!state.adventure || state.adventure.status !== 'fighting') return;

    const adv = state.adventure;
    const node = adv.nodes[adv.currentNodeIndex];
    const monster = node.monster;
    if (!monster) return;

    let newCombatLog = [...adv.combatLog];
    let mHp = monster.hp;
    let dHp = adv.daughterHp;
    let newStatus = adv.status;
    let newGold = state.daughter.gold;
    let newAttributes = { ...state.daughter.attributes };

    if (action === 'flee') {
      newCombatLog.push(`女兒落荒而逃，放棄了本次修行。`);
      setState((prev) => ({
        ...prev,
        adventure: {
          ...prev.adventure!,
          status: 'exploring',
          currentNodeIndex: Math.max(0, adv.currentNodeIndex - 1), // back up one node
          combatLog: newCombatLog
        }
      }));
      return;
    }

    // 1. Daughter Attacks
    let dDamage = 0;
    if (action === 'attack') {
      dDamage = Math.max(5, Math.round((state.daughter.attributes.strength * 0.4 + state.daughter.attributes.combatSkill * 0.8) - monster.defense));
      mHp = Math.max(0, mHp - dDamage);
      newCombatLog.push(`⚔️ 女兒使用物理攻擊，對【${monster.name}】造成 ${dDamage} 點傷害。`);
    } else if (action === 'magic') {
      dDamage = Math.max(10, Math.round((state.daughter.attributes.intelligence * 0.6 + state.daughter.attributes.magicSkill * 1.2)));
      mHp = Math.max(0, mHp - dDamage);
      newCombatLog.push(`🔮 女兒詠唱魔法，對【${monster.name}】造成 ${dDamage} 點魔法傷害！`);
    }

    // Check if monster dead
    if (mHp <= 0) {
      newCombatLog.push(`🎉 成功擊敗魔物【${monster.name}】！`);
      newCombatLog.push(`獲得金幣 +${monster.goldReward}，戰鬥經驗提升，名望 +15。`);
      
      newGold += monster.goldReward;
      newAttributes.combatSkill += 5;
      newAttributes.magicSkill += 3;
      newAttributes.reputation += 15;
      newAttributes.stress += 10;
      
      node.cleared = true;
      newStatus = 'exploring';

      if (node.type === 'boss') {
        newStatus = 'victory';
        newCombatLog.push(`🏆 你擊敗了深處的守護樹妖！幽暗森林的修行圓滿結束！`);
        newAttributes.reputation += 50;
      }
    } else {
      // Monster attacks back
      monster.hp = mHp;
      const mDamage = Math.max(2, Math.round(monster.attack - (state.daughter.attributes.stamina * 0.15 + state.daughter.attributes.combatSkill * 0.2)));
      dHp = Math.max(0, dHp - mDamage);
      newCombatLog.push(`💥 【${monster.name}】反擊，對女兒造成 ${mDamage} 點傷害。`);

      if (dHp <= 0) {
        newStatus = 'defeat';
        newCombatLog.push(`💀 女兒力竭倒下了…… 修行被迫結束，回家休養。`);
        newAttributes.stress = Math.round(newAttributes.stress * 0.8); // trauma, but stress slightly reduced from rest
      }
    }

    setState((prev) => {
      const currentAdv = prev.adventure!;
      const updatedNodes = [...currentAdv.nodes];
      updatedNodes[adv.currentNodeIndex] = {
        ...node,
        monster: monster ? { ...monster, hp: mHp } : undefined
      };

      return {
        ...prev,
        daughter: {
          ...prev.daughter,
          gold: newGold,
          attributes: newAttributes
        },
        adventure: {
          ...currentAdv,
          daughterHp: dHp,
          status: newStatus,
          nodes: updatedNodes,
          combatLog: newCombatLog
        }
      };
    });
  };

  const endAdventure = () => {
    setState((prev) => {
      const logs = [...prev.logs];
      const time = prev.time;
      logs.push({
        id: Math.random().toString(),
        year: time.year,
        month: time.month,
        period: time.period,
        text: `完成野外修行，女兒增加了戰鬥資歷與名望。`,
        type: 'info'
      });

      return {
        ...prev,
        activeScreen: 'main',
        adventure: null,
        logs
      };
    });
  };

  // Event handlers
  const triggerEvent = (event: NarrativeEvent) => {
    setState((prev) => ({
      ...prev,
      currentEvent: event,
      currentEventStep: event.dialogue[0].id
    }));
  };

  const selectEventChoice = (choice: any) => {
    setState((prev) => {
      if (!prev.currentEvent || !prev.currentEventStep) return prev;
      
      const currentNode = prev.currentEvent.dialogue.find(d => d.id === prev.currentEventStep);
      if (!currentNode) return prev;

      let newState = { ...prev };
      
      // Apply effects of choice if any
      if (choice.effects) {
        const sideEffects = choice.effects(prev);
        if ((sideEffects as any).error) {
          // If custom error (like lacking items), do not advance, just log or skip
          // Simple visual error can be handled or ignored
          return prev;
        }
        
        newState = {
          ...prev,
          ...sideEffects,
          daughter: {
            ...prev.daughter,
            ...(sideEffects.daughter || {})
          }
        };
      }

      const nextId = choice.nextId;
      if (nextId === 'end') {
        // Complete event
        const onComplete = prev.currentEvent?.onComplete;
        let finalState: GameState = {
          ...newState,
          currentEvent: null,
          currentEventStep: null
        };
        if (onComplete) {
          finalState = onComplete(finalState);
        }
        return finalState;
      }

      return {
        ...newState,
        currentEventStep: nextId
      };
    });
  };

  // Save / Load / Reset Game
  const saveGame = () => {
    localStorage.setItem('princess_maker_save', JSON.stringify(state));
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs, {
        id: Math.random().toString(),
        year: prev.time.year,
        month: prev.time.month,
        period: prev.time.period,
        text: '💾 遊戲進度已儲存！',
        type: 'info'
      }]
    }));
  };

  const loadGame = (): boolean => {
    const raw = localStorage.getItem('princess_maker_save');
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      setState({
        ...parsed,
        activeScreen: 'main', // Force reset to main to avoid bad state
        currentEvent: null,
        currentEventStep: null,
        adventure: null
      });
      return true;
    } catch {
      return false;
    }
  };

  const resetGame = () => {
    setState(INITIAL_STATE);
  };

  // Cheat Mode
  const toggleCheatMode = () => {
    setState((prev) => {
      const toggled = !prev.cheatMode;
      const daughter = { ...prev.daughter };
      
      if (toggled) {
        daughter.gold = 9999;
        daughter.attributes = {
          stamina: 800,
          strength: 800,
          intelligence: 800,
          charisma: 800,
          morality: 800,
          piety: 800,
          sensitivity: 800,
          stress: 0,
          combatSkill: 800,
          magicSkill: 800,
          reputation: 800
        };
      } else {
        daughter.gold = 150;
        daughter.attributes = { ...DEFAULT_ATTRIBUTES };
      }

      daughter.combatHp = daughter.attributes.stamina;
      daughter.combatMp = daughter.attributes.magicSkill * 2 + 10;

      return {
        ...prev,
        cheatMode: toggled,
        daughter,
        logs: [...prev.logs, {
          id: Math.random().toString(),
          year: prev.time.year,
          month: prev.time.month,
          period: prev.time.period,
          text: toggled ? '✨ 開啟作弊模式：金幣滿載，女兒屬性達到登峰造極！' : '❌ 關閉作弊模式，重置女兒數值。',
          type: 'info'
        }]
      };
    });
  };

  const updateAvatarUrl = (url: string) => {
    setState((prev) => ({
      ...prev,
      daughter: {
        ...prev.daughter,
        avatarUrl: url
      }
    }));
  };

  return (
    <GameContext.Provider value={{
      state,
      initGame,
      updateAvatarUrl,
      setSchedule,
      startScheduleExecution,
      executeNextPeriod,
      finishExecution,
      buyItem,
      talkToDaughter,
      startAdventure,
      stepAdventure,
      adventureCombatAction,
      endAdventure,
      triggerEvent,
      selectEventChoice,
      saveGame,
      loadGame,
      resetGame,
      toggleCheatMode,
      setScreen
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
