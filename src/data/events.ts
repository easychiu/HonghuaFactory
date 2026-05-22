import type { Monster, AVGEvent } from '../types';

export const AVG_EVENTS: Record<string, AVGEvent> = {
  noble_crest: {
    id: ' noble_crest',
    title: '落難貴族的紋章考驗',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '流亡貴族 席爾瓦',
        text: '吾乃被叛軍追擊之落難領主，旅人啊，交出汝的補給，否則休怪吾劍下無情！',
        choices: [
          {
            text: '⚔️ 武力介入（進入戰鬥）',
            effect: (_state) => {
              // 觸發與貴族的戰鬥
              const silvaMonster: Monster = {
                name: '流亡貴族 席爾瓦',
                hp: 150,
                maxHp: 150,
                attack: 16,
                defense: 8,
                goldReward: 200,
                expReward: 50
              };
              return {
                log: '女兒拔出了長劍，喝退無理之徒！',
                nextDialogId: undefined,
                rewards: { triggerCombat: silvaMonster }
              };
            }
          },
          {
            text: '👑 展示淑女禮儀（禮儀判定）',
            effect: (state) => {
              const success = state.daughter.attributes.elegance >= 100;
              if (success) {
                return {
                  log: '女兒行了優雅無缺的宮廷古禮，席爾瓦將軍大驚失色，認出這是王室禮節，流淚道歉並給予「王室紋章線索」！',
                  nextDialogId: 'elegance_success',
                  rewards: { gold: 100, addReputation: 30, addClues: 1 }
                };
              } else {
                return {
                  log: '女兒禮儀姿態略顯生疏，被席爾瓦嘲笑為虛有其表的鄉野民女！女兒感覺屈辱，疲勞增加 15，並被迫戰鬥。',
                  nextDialogId: 'elegance_fail',
                  rewards: { stress: 15, triggerCombatAuto: true }
                };
              }
            }
          },
          {
            text: '👥 冷眼旁觀並繞路',
            effect: (_state) => {
              return {
                log: '女兒默默繞開了他，多繞了一些林間小路，專注度消耗 5。',
                nextDialogId: undefined,
                rewards: { focus: -5 }
              };
            }
          }
        ]
      },
      elegance_success: {
        speaker: '流亡貴族 席爾瓦',
        text: '請寬恕在下的無禮！沒想到在這蠻荒邊境還能見到王室的禮儀，這塊「蔚藍海岸的王國紋章殘片」請您收下。',
        nextId: undefined
      },
      elegance_fail: {
        speaker: '流亡貴族 席爾瓦',
        text: '哼，虛張聲勢的丫頭，看招！',
        choices: [
          {
            text: '迎戰！',
            effect: (_state) => {
              const silvaMonster: Monster = {
                name: '流亡貴族 席爾瓦',
                hp: 150,
                maxHp: 150,
                attack: 16,
                defense: 8,
                goldReward: 200,
                expReward: 50
              };
              return {
                log: '被迫開打！',
                rewards: { triggerCombat: silvaMonster }
              };
            }
          }
        ]
      }
    }
  },
  mist_forest: {
    id: 'mist_forest',
    title: '迷霧森林的指引',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '旁白',
        text: '四周被濃重的大霧籠罩，指南針完全失效。女兒感到有些慌張，此時需要以智力尋找迷霧出口。',
        choices: [
          {
            text: '🧠 運用天文與歷史知識分析（智力判定）',
            effect: (state) => {
              const success = state.daughter.attributes.intelligence >= 120;
              if (success) {
                return {
                  log: '女兒觀察星斗與樹苔方向，完美找到了捷徑！專注度回復 15。',
                  nextDialogId: 'intellect_success',
                  rewards: { focus: 15 }
                };
              } else {
                return {
                  log: '女兒在濃霧中兜兜轉轉，徹底迷失了方向。體力與專注度受到極大損耗！',
                  nextDialogId: 'intellect_fail',
                  rewards: { focus: -20, hp: -20 }
                };
              }
            }
          }
        ]
      },
      intellect_success: {
        speaker: '女兒',
        text: '呼……還好上課時認真研讀了地理和天體規律，前面就是出口了！',
        nextId: undefined
      },
      intellect_fail: {
        speaker: '女兒',
        text: '怎麼走又回到了原地……頭好暈，好累啊……',
        nextId: undefined
      }
    }
  },
  blackmarket_box: {
    id: 'blackmarket_box',
    title: '黑市商人的神祕盲盒',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '黑市行商 卡爾',
        text: '嘿嘿嘿，小姑娘，這可是從王都遺跡中走私出來的密封盲盒，一個只要 300 金幣，要不要賭一賭運氣？',
        choices: [
          {
            text: '🪙 花費金幣購買（300金幣，行商老爸特價 240金）',
            effect: (state) => {
              const price = state.daughter.fatherBackground === 'merchant' ? 240 : 300;
              if (state.daughter.gold < price) {
                return {
                  log: '金幣不足，黑市商人給了你一個白眼。',
                  nextDialogId: undefined
                };
              }
              // 艾莉卡強運必出好裝，其他人隨機
              const isErica = state.daughter.characterId === 'erica';
              const lucky = isErica || Math.random() < 0.35;
              if (lucky) {
                return {
                  log: `女兒買下了盲盒！打開一看，竟然是散發著魔法輝光的「蔚藍皇家海軍軍刀」！`,
                  nextDialogId: 'box_lucky',
                  rewards: { gold: -price, addInventory: 'royal_saber' }
                };
              } else {
                return {
                  log: '女兒買下了盲盒！打開只拿到了幾塊發霉的乾糧，真是倒楣。',
                  nextDialogId: 'box_sad',
                  rewards: { gold: -price, addInventory: 'moldy_bread' }
                };
              }
            }
          },
          {
            text: '拒絕他並離開',
            effect: (_state) => {
              return { log: '女兒婉拒了黑市商人的推銷。' };
            }
          }
        ]
      },
      box_lucky: {
        speaker: '黑市行商 卡爾',
        text: '天啊！這可是海軍精銳配備的神兵，你這小姑娘運氣也太逆天了吧！',
        nextId: undefined
      },
      box_sad: {
        speaker: '黑市行商 卡爾',
        text: '哎呀，盲盒本來就是買個樂趣嘛，下次再來！',
        nextId: undefined
      }
    }
  },
  jaks_patrol: {
    id: 'jaks_patrol',
    title: '海軍少校 傑克斯的巡航',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '海軍少校 傑克斯',
        text: '軍事管制區！前方海域與林地已被皇家海軍封鎖，閒雜人等立刻退後，否則以間諜罪論處！',
        choices: [
          {
            text: '👑 出示復國線索並說明來意（需要 1 個以上的王國線索殘片）',
            effect: (state) => {
              const hasClue = state.inventory.includes('royal_crest') || state.daughter.reputation >= 100;
              const hasElegance = state.daughter.attributes.elegance >= 150;
              if (hasClue && hasElegance) {
                return {
                  log: '傑克斯少校看見線索並感受到女兒高雅的王室涵養，神色一肅，暗中放行，並傳授皇家海軍秘密戰法！',
                  nextDialogId: 'jaks_pass',
                  rewards: { addTactics: 25, reputation: 50 }
                };
              } else {
                return {
                  log: '傑克斯少校懷疑女兒線索造假，下令部兵將女兒逮捕！',
                  nextDialogId: 'jaks_arrest',
                  rewards: { stress: 20 }
                };
              }
            }
          },
          {
            text: '⚔️ 拔劍硬闖（Boss 挑戰級戰鬥）',
            effect: (_state) => {
              const jaksBoss: Monster = {
                name: '海軍少校 傑克斯',
                hp: 400,
                maxHp: 400,
                attack: 35,
                defense: 18,
                goldReward: 800,
                expReward: 200,
                behaviorPattern: 'boss'
              };
              return {
                log: '女兒傲然拔劍，直指海軍少校！',
                nextDialogId: undefined,
                rewards: { triggerCombat: jaksBoss, dropOnVictory: 'royal_saber' }
              };
            }
          }
        ]
      },
      jaks_pass: {
        speaker: '海軍少校 傑克斯',
        text: '（壓低聲音）原來您就是失落的王女……殿下，末將傑克斯在此海域暗中巡航，誓死守護您的歸來。這些防禦陣行秘訣請您收下！',
        nextId: undefined
      },
      jaks_arrest: {
        speaker: '海軍少校 傑克斯',
        text: '花言巧語！拿下！送入要塞地牢！',
        choices: [
          {
            text: '進行越獄戰鬥！',
            effect: (_state) => {
              const guardMonster: Monster = {
                name: '海軍要塞守衛',
                hp: 180,
                maxHp: 180,
                attack: 18,
                defense: 10,
                goldReward: 100,
                expReward: 40
              };
              return {
                log: '女兒在地牢中暴起反擊，試圖越獄！',
                rewards: { triggerCombat: guardMonster }
              };
            }
          }
        ]
      }
    }
  },
  doctor_axxia: {
    id: 'doctor_axxia',
    title: '流浪醫生 阿俠的野外診所',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '流浪醫生 阿俠',
        text: '哎呀呀，小姑娘看起來面色蒼白，是不是冒險累壞了？我這野外診所藥到病除，只要 300 金幣就能幫你回滿生命值！',
        choices: [
          {
            text: '🪙 支付 300 金幣進行治療',
            effect: (state) => {
              if (state.daughter.gold < 300) {
                return { log: '金幣不夠呢，阿俠醫生搖了搖頭。' };
              }
              return {
                log: '阿俠醫生配置了草藥，女兒的生命值完全復原！',
                nextDialogId: 'doctor_healed',
                rewards: { gold: -300, hpRestoreMax: true }
              };
            }
          },
          {
            text: '🍱 出示【桶仔米糕】進行等價物易',
            effect: (state) => {
              const hasCake = state.inventory.includes('barrel_rice_cake');
              if (!hasCake) {
                return {
                  log: '身上並沒有桶仔米糕，無法進行以物易物。',
                  nextDialogId: undefined
                };
              }
              return {
                log: '阿俠看見美食大受感動，狼吞虎嚥後為女兒進行「聖光大拔罐」！疲勞全清、生命爆滿，永久魔防 +10！',
                nextDialogId: 'doctor_rice_cake',
                rewards: { removeInventory: 'barrel_rice_cake', hpRestoreMax: true, stress: -999, magicSkill: 10 }
              };
            }
          },
          {
            text: '離開診所',
            effect: (_state) => {
              return { log: '女兒告別了阿俠醫生。' };
            }
          }
        ]
      },
      doctor_healed: {
        speaker: '流浪醫生 阿俠',
        text: '客氣客氣，下次受傷了隨時來找我阿俠！健康第一！',
        nextId: undefined
      },
      doctor_rice_cake: {
        speaker: '流浪醫生 阿俠',
        text: '唔喔喔！這桶仔米糕也太香了吧！簡直是人間美味！來，叔叔給你打通任督二脈，保你修行路上生龍活虎！',
        nextId: undefined
      }
    }
  },
  tactics_test: {
    id: 'tactics_test',
    title: '青梅竹馬的默契考驗',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '青梅竹馬 yv',
        text: '艾蜜莉亞，前方的遺跡巨石封路，還有魔法陷阱。jumbo 你這肌肉腦能把巨石砸碎嗎？我來解析魔法。',
        choices: [
          {
            text: '🤝 讓 jumbo 砸石，yv 解析魔法（需要艾蜜莉亞主角且擁有30cm鐵鎚）',
            effect: (state) => {
              const isEmilia = state.daughter.characterId === 'emilia';
              const hasHammer = state.inventory.includes('giant_hammer');
              if (!isEmilia) {
                return {
                  log: '這項考驗需要由艾蜜莉亞與她的青梅竹馬小隊共同完成！',
                  nextDialogId: undefined
                };
              }
              if (!hasHammer) {
                return {
                  log: 'jumbo 撓了撓頭：「沒有趁手的錘子，這頑石我也砸不開啊！」',
                  nextDialogId: 'jumbo_no_hammer'
                };
              }
              return {
                log: 'jumbo 揮舞 30cm 鐵錘直接將巨石砸得粉碎！yv 揮動法杖解開魔法核心。完美通過！獲得終極招式與王國線索！',
                nextDialogId: 'tactics_success',
                rewards: { addInventory: 'royal_crest', addCombatSkill: 30, addTacticsUnlock: true }
              };
            }
          },
          {
            text: '退回',
            effect: (_state) => {
              return { log: '小隊無奈只得繞路。' };
            }
          }
        ]
      },
      jumbo_no_hammer: {
        speaker: '青梅竹馬 jumbo',
        text: '要是老胡木工坊的「三十公分錘子」在手就好了，我肯定一錘砸個稀巴爛！我們還是退回吧。',
        nextId: undefined
      },
      tactics_success: {
        speaker: '青梅竹馬 yv',
        text: '合作無間！艾蜜莉亞，我們領悟的「青梅竹馬友情大連擊」在接下來的戰鬥中一定能派上大用場！',
        nextId: undefined
      }
    }
  }
};
