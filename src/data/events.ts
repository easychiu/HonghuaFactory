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
    title: '遺跡巨石障礙',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '青梅竹馬 yv',
        text: '前方的遺跡被巨石封路，還有魔法陷阱。jumbo 你這肌肉腦能把巨石砸碎嗎？我來解析魔法。若是有大鐵錘，就能直接破開了。',
        choices: [
          {
            text: '🤝 讓 jumbo 砸石，yv 解析魔法（擁有【三十公分的錘子】直接打破）',
            effect: (state) => {
              const hasHammer = state.inventory.includes('giant_hammer');
              if (hasHammer) {
                return {
                  log: '裝備「三十公分的錘子」發揮奇效，直接將巨石砸得粉碎！yv 順利解開魔力核心，完美通關！獲得王國線索與大招解鎖！',
                  nextDialogId: 'tactics_success',
                  rewards: { addInventory: 'royal_crest', combatSkill: 30, addTacticsUnlock: true }
                };
              }
              // 否則進行力量與智力判定 (120 閾值)
              const strength = state.daughter.attributes.strength || 0;
              const intelligence = state.daughter.attributes.intelligence || 0;
              if (strength >= 120 && intelligence >= 120) {
                return {
                  log: '女兒與同伴配合無間，憑藉過人的力量與智慧（雙屬性 >= 120）成功尋得巨石機關受力點擊碎！',
                  nextDialogId: 'tactics_success',
                  rewards: { addInventory: 'royal_crest', combatSkill: 30, addTacticsUnlock: true }
                };
              } else {
                return {
                  log: '判定失敗！巨石倒塌砸傷了女兒，且消耗了大量專注度（HP -15，Focus -15）。',
                  nextDialogId: 'jumbo_no_hammer',
                  rewards: { hp: -15, focus: -15 }
                };
              }
            }
          },
          {
            text: '↩️ 繞路退回',
            effect: (_state) => {
              return { log: '小隊選擇繞路前行。' };
            }
          }
        ]
      },
      jumbo_no_hammer: {
        speaker: '青梅竹馬 jumbo',
        text: '可惡，我的力量不夠，或是沒有老胡木工坊的「三十公分錘子」，根本敲不動啊！',
        nextId: undefined
      },
      tactics_success: {
        speaker: '青梅竹馬 yv',
        text: '做得好！我們領悟的「青梅竹馬友情大連擊」在接下來的戰鬥中一定能派上大用場！',
        nextId: undefined
      }
    }
  },
  clover_encounter: {
    id: 'clover_encounter',
    title: '同窗好友：四葉草的雙馬尾與劍道',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '同窗好友 四葉草',
        text: '哼，聽說妳最近在學習上很風光嘛！但在劍道與宮廷禮儀上，我是絕對不會輸給妳的！要不要來切磋一下？',
        choices: [
          {
            text: '💬 真誠直球（誇獎她的努力與雙馬尾）',
            effect: (_state) => {
              return {
                log: '女兒真誠地誇獎了四葉草的雙馬尾和劍術，四葉草面紅耳赤地接受了。好感度 +20，名望 +10。',
                nextDialogId: 'clover_gentle',
                rewards: { cloverBond: 20, reputation: 10 }
              };
            }
          },
          {
            text: '⚔️ 良性競爭（全力切磋劍術）',
            effect: (_state) => {
              return {
                log: '兩人進行了激烈的劍術切磋，雙方都有所領悟！好感度 +15，戰鬥技術 +5，體力 -5。',
                nextDialogId: 'clover_compete',
                rewards: { cloverBond: 15, combatSkill: 5, stamina: -5 }
              };
            }
          },
          {
            text: '💬 打壓 PUA（嘲笑她的雙馬尾）',
            effect: (_state) => {
              return {
                log: '女兒嘲笑了四葉草的雙馬尾，四葉草氣得大哭跑開了。好感度 -30，疲勞 +15。',
                nextDialogId: 'clover_pua',
                rewards: { cloverBond: -30, stress: 15 }
              };
            }
          }
        ]
      },
      clover_gentle: {
        speaker: '同窗好友 四葉草',
        text: '哼、哼，既然妳這麼有眼光，那我就勉強承認妳是個合格的對手吧！',
        nextId: undefined
      },
      clover_compete: {
        speaker: '同窗好友 四葉草',
        text: '痛快！今天就先打到這裡，下次我一定會堂堂正正擊敗妳的！',
        nextId: undefined
      },
      clover_pua: {
        speaker: '同窗好友 四葉草',
        text: '妳、妳這個無禮之徒！我再也不理妳了！嗚嗚嗚……',
        nextId: undefined
      }
    }
  },
  shanshan_encounter: {
    id: 'shanshan_encounter',
    title: '同窗好友：珊珊的古籍研讀',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '同窗好友 珊珊',
        text: '殿下，我最近在修辭和歷史古籍中發現了一些奇妙的記載，妳有興趣一起討論研究嗎？',
        choices: [
          {
            text: '📚 一起研究討論（智力 >= 120 時有特殊收穫）',
            effect: (state) => {
              const hasIntel = (state.daughter.attributes.intelligence || 0) >= 120;
              if (hasIntel) {
                return {
                  log: '女兒與珊珊深入探討，珊珊非常佩服，悄悄透露了地下皇家圖書館的線索！好感度 +15，智力 +5，獲得圖書館線索。',
                  nextDialogId: 'shanshan_library',
                  rewards: { shanshanBond: 15, intelligence: 5, addInventory: 'royal_library_clue' }
                };
              } else {
                return {
                  log: '女兒與珊珊研讀了古籍，獲益匪淺。好感度 +15，智力 +5。',
                  nextDialogId: 'shanshan_study',
                  rewards: { shanshanBond: 15, intelligence: 5 }
                };
              }
            }
          },
          {
            text: '💤 藉口累了推辭休息',
            effect: (_state) => {
              return {
                log: '女兒藉口疲累推辭了。珊珊有些失望，但女兒得到了休息。好感度 +5，疲勞 -10。',
                nextDialogId: 'shanshan_rest',
                rewards: { shanshanBond: 5, stress: -10 }
              };
            }
          }
        ]
      },
      shanshan_library: {
        speaker: '同窗好友 珊珊',
        text: '殿下果然博學！這份關於皇家地下圖書館的古老地圖碎片，對妳的冒險一定有幫助。',
        nextId: undefined
      },
      shanshan_study: {
        speaker: '同窗好友 珊珊',
        text: '跟殿下一起讀書真開心，下次我們再來討論其他的書籍吧。',
        nextId: undefined
      },
      shanshan_rest: {
        speaker: '同窗好友 珊珊',
        text: '這樣啊……殿下請多保重身體，課業的事情下次再聊吧。',
        nextId: undefined
      }
    }
  },
  xuewu_encounter: {
    id: 'xuewu_encounter',
    title: '同窗好友：雪舞與自然科學的奧秘',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '同窗好友 雪舞',
        text: '（打了個哈欠）自然科學太奇妙了，但我昨晚看書太晚好睏喔……殿下要不要一起去後山吹吹風、散散步？',
        choices: [
          {
            text: '🌸 陪伴她去後山散步（獲特級桶仔米糕）',
            effect: (_state) => {
              return {
                log: '兩人去後山享受清風與陽光，雪舞高興地送給女兒一桶野餐米糕。好感度 +20，疲勞 -15，獲得【桶仔米糕】。',
                nextDialogId: 'xuewu_walk',
                rewards: { xuewuBond: 20, stress: -15, addInventory: 'barrel_rice_cake' }
              };
            }
          },
          {
            text: '⏰ 叫醒她認真聽課（增加道德）',
            effect: (_state) => {
              return {
                log: '女兒嚴肅地督促雪舞認真上課。雪舞有些委屈，但懂得了課堂紀律。好感度 -5，道德 +5。',
                nextDialogId: 'xuewu_wake',
                rewards: { xuewuBond: -5, morality: 5 }
              };
            }
          }
        ]
      },
      xuewu_walk: {
        speaker: '同窗好友 雪舞',
        text: '後山的海風真舒服！這是我親手做的特級桶仔米糕，在野外探險吃能大大恢復體力喔！',
        nextId: undefined
      },
      xuewu_wake: {
        speaker: '同窗好友 雪舞',
        text: '嗚嗚，殿下好嚴厲喔……那、那我就再撐一下，不睡覺了……',
        nextId: undefined
      }
    }
  },
  erica_reunion_avg: {
    id: 'erica_reunion_avg',
    title: '命運的交織：與艾莉卡重逢',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '遺失的王女 艾莉卡',
        text: '這股溫暖的血脈共鳴……難道說，妳就是當年與我失散的姊妹？沒想到我們會在修行的戰場上重逢。',
        choices: [
          {
            text: '💖 抱住她，千言萬語盡在不言中',
            effect: (_state) => {
              return {
                log: '女兒流淚抱住艾莉卡，兩人相認，解鎖了下週目扮演艾莉卡的可能！',
                nextDialogId: 'reunion_end'
              };
            }
          }
        ]
      },
      reunion_end: {
        speaker: '艾莉卡',
        text: '我現在還必須去處理一些王國遺留的線索，但在那之後，我們一定會再次團聚的！',
        nextId: undefined
      }
    }
  },
  emilia_reunion_avg: {
    id: 'emilia_reunion_avg',
    title: '命運的交織：與艾蜜莉亞重逢',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '遺失的王女 艾蜜莉亞',
        text: '這個皇家紋章的感應，絕對不會錯！原來妳也活了下來……我的姊妹！有妳在，蔚藍海岸的復國希望更近了一步。',
        choices: [
          {
            text: '💖 抱住她，千言萬語盡在不言中',
            effect: (_state) => {
              return {
                log: '女兒流淚抱住艾蜜莉亞，兩人相認，解鎖了下週目扮演艾蜜莉亞的可能！',
                nextDialogId: 'reunion_end'
              };
            }
          }
        ]
      },
      reunion_end: {
        speaker: '艾蜜莉亞',
        text: '帶上我的信物。雖然我現在必須在暗中活動，但當終局來臨，我們三姊妹必定會重登王座！',
        nextId: undefined
      }
    }
  },
  honghua_reunion_avg: {
    id: 'honghua_reunion_avg',
    title: '命運的交織：與紅花重逢',
    startNodeId: 'start',
    nodes: {
      start: {
        speaker: '遺失的王女 紅花',
        text: '這味道……包葉檳榔的香氣，不，是王國正統血脈的悸動！妳就是我的手足嗎？能在戰場上遇到妳，真是命運的恩賜！',
        choices: [
          {
            text: '💖 抱住她，千言萬語盡在不言中',
            effect: (_state) => {
              return {
                log: '女兒流淚抱住紅花，兩人相認，解鎖了下週目扮演紅花的可能！',
                nextDialogId: 'reunion_end'
              };
            }
          }
        ]
      },
      reunion_end: {
        speaker: '紅花',
        text: '這片大地雖然破碎，但我們的羈絆已經重新連起。拿著這枚信物，期待我們在未來頂峰相見！',
        nextId: undefined
      }
    }
  }
};
