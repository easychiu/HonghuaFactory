import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { 
  Award, Trophy, Shield, ChefHat, Palette, MessageSquare, 
  ArrowRight, Coins, Sparkles 
} from 'lucide-react';
import { getAvatarPath } from '../utils/avatar';

type TrackId = 'martial' | 'cooking' | 'art' | 'customer';



export const FestivalScreen: React.FC = () => {
  const { state, resolveFestival } = useGame();
  const { daughter, time, inventory } = state;

  const [step, setStep] = useState<'select' | 'simulating' | 'result'>('select');
  const [selectedTrack, setSelectedTrack] = useState<TrackId>('martial');
  const [useSpecialItem, setUseSpecialItem] = useState(false);
  
  // Simulation states
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Target Score: scales with the year
  const targetScore = 60 + time.year * 35;

  // Inventory check
  const hasBinlangTwin = inventory.includes('binlang_twin');
  const hasRiceCake = inventory.includes('barrel_rice_cake');

  // Track Formulas & Scores
  const getTrackScore = (track: TrackId, applyItem: boolean): { score: number; label: string } => {
    const attrs = daughter.attributes;
    switch (track) {
      case 'martial': {
        const baseScore = Math.round(attrs.stamina * 0.3 + attrs.combatSkill * 0.4 + attrs.strength * 0.3);
        const bonus = applyItem ? 150 : 0;
        return { score: baseScore + bonus, label: `力量、戰術、體力 (目前: ${baseScore}${bonus ? ` + 檳榔爆發: ${bonus}` : ''})` };
      }
      case 'cooking': {
        if (applyItem) return { score: 9999, label: `特級桶仔米糕直接奪冠 (分數: 9999)` };
        const baseScore = Math.round(attrs.sensitivity * 0.5 + attrs.morality * 0.3 + attrs.stamina * 0.2);
        return { score: baseScore, label: `感受、道德、體力 (目前: ${baseScore})` };
      }
      case 'art': {
        const baseScore = Math.round(attrs.art * 0.5 + attrs.elegance * 0.3 + attrs.intelligence * 0.2);
        const fatherBonus = daughter.fatherBackground === 'bard' ? 100 : 0;
        return { score: baseScore + fatherBonus, label: `氣質、禮儀、智力 (目前: ${baseScore}${fatherBonus ? ` + 詩人爸爸: ${fatherBonus}` : ''})` };
      }
      case 'customer': {
        const baseScore = Math.round(attrs.intelligence * 0.5 + attrs.stamina * 0.5 - attrs.stress * 0.2);
        return { score: baseScore, label: `智力、體力、疲勞影響 (目前: ${baseScore})` };
      }
    }
  };

  // Probability calculations
  const calculateWinProbability = (track: TrackId, applyItem: boolean): number => {
    const { score } = getTrackScore(track, applyItem);
    if (score >= 9999) return 99; // direct win
    
    // actual score = score + randomFactor (-20 to +20)
    // probability that score + randomFactor >= targetScore
    if (score - 20 >= targetScore) return 99;
    if (score + 20 < targetScore) return 1;
    
    const prob = Math.round(((score + 20 - targetScore) / 40) * 100);
    return Math.min(99, Math.max(1, prob));
  };

  // Handle Track Selection Change
  useEffect(() => {
    setUseSpecialItem(false);
  }, [selectedTrack]);

  // Scroll to bottom of logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [simulationLogs]);

  // Start Simulation
  const handleStartChallenge = () => {
    const { score } = getTrackScore(selectedTrack, useSpecialItem);
    
    // Simulate final result
    const randomFactor = score >= 9999 ? 0 : Math.floor(Math.random() * 41) - 20; // -20 to 20
    const finalCalculatedScore = score >= 9999 ? 9999 : Math.max(10, score + randomFactor);
    const winResult = finalCalculatedScore >= targetScore;
    
    // Generate simulation logs
    const logsList: string[] = [];
    
    if (selectedTrack === 'martial') {
      logsList.push("⚔️ 皇家武術大會正式開幕！競技場上彩旗飄揚，觀眾的歡呼聲如山呼海嘯般傳來！");
      logsList.push(`🥋 ${daughter.name} 披掛上陣，緩步走入競技場中央。今天她的對手是學院天才「四葉草」。`);
      if (useSpecialItem) {
        logsList.push(`✨ 【狂暴爆發】女兒毅然嚼下了【雙子星檳榔】！雙眼亮起璀璨的紅光，實力獲得史詩級提升 (+150 戰力)！`);
      }
      logsList.push("💥 比賽哨聲響起！四葉草身形如電，長劍帶起凌厲風聲，直擊女兒胸口！");
      logsList.push("⚡ 女兒冷靜閃身，長劍順勢格擋，反擊速度快得令人目不暇給。刀光劍影，雙方交手十餘回合不分勝負！");
      if (winResult) {
        logsList.push("🎉 喝啊！女兒捕捉到四葉草一瞬間的破綻，一記重斬將對手長劍挑飛！四葉草無奈攤手，微笑認輸！");
      } else {
        logsList.push("😢 四葉草的劍雨太過密不透風，女兒體力漸漸支撐不住。最後被對手一劍架在頸側，惜敗落幕！");
      }
      logsList.push(`🏆 大會評審團給出最終判定：女兒獲得評分 ${finalCalculatedScore} 分！（勝出目標：${targetScore} 分）`);
    } 
    
    else if (selectedTrack === 'cooking') {
      logsList.push("🍳 王國烹飪大賽在中央大廣場盛大舉行，香氣四溢，名廚高手齊聚一堂！");
      logsList.push(`🔥 ${daughter.name} 站在灶台前，冷靜地整理食材。評審席上的王國首席美食家神情肅穆。`);
      if (useSpecialItem) {
        logsList.push(`🍱 【王牌料理】女兒不慌不忙，端出了驚世駭俗的【特級桶仔米糕】！米糕金黃油亮，散發出無法抗拒的神聖香氣！`);
        logsList.push("🍽️ 料理送至評審面前，首席評審拿起湯匙，挖起一口放入口中...");
        logsList.push("😭 【特寫劇情】評審咀嚼了三秒，忽然雙手掩面，眼淚止不住地奪眶而出：『這、這是阿嬤的味道……是家的感覺啊！』");
        logsList.push("💯 評審席集體痛哭流涕，紛紛給出不可思議的滿分！");
      } else {
        logsList.push("🔥 女兒熟練地升火、翻炒、調味，精準掌控火候，製作出香氣四溢的王國傳統創意燉菜。");
        logsList.push("🍽️ 料理端上評審席。美食家們緩緩品嚐，交頭接耳，露出若有所思的表情。");
        if (winResult) {
          logsList.push("😋 評審點頭大讚：『火候精妙，調味豐富多層次，實在是一道溫暖人心的神級料理！』");
        } else {
          logsList.push("😖 評審搖頭嘆息：『調味稍微過鹹了些，配料的香氣被掩蓋了，火候稍顯不足，有些可惜。』");
        }
      }
      logsList.push(`🏆 評審們合計後公布結果：女兒獲得評分 ${finalCalculatedScore} 分！（勝出目標：${targetScore} 分）`);
    } 
    
    else if (selectedTrack === 'art') {
      logsList.push("🎵 蔚藍藝術祭大禮堂內高朋滿座，豎琴悠揚。王國名流與貴族們正襟危坐。");
      logsList.push(`✨ ${daughter.name} 身著典雅服飾，沉穩步上舞台，向台下的觀眾與評審深鞠一躬。`);
      if (daughter.fatherBackground === 'bard') {
        logsList.push("🎸 【老爸傳承】吟遊詩人父親的長年薰陶，讓女兒一舉手一投足皆散發著空靈的藝術氣息 (+100 藝術分)！");
      }
      logsList.push("🎻 女兒輕拂琴弦，如流水般的琴音緩緩流瀉，將眾人帶入精靈低語的夢幻森林之中。");
      if (daughter.bonds.shanshan >= 50) {
        logsList.push(`💬 評審席上的同窗「珊珊」雙眼放光，忍不住驚呼：『如此空靈脫俗的琴聲，簡直是藝術的化身！』`);
      }
      if (winResult) {
        logsList.push("👏 曲終，全場寂靜無聲，隨後爆發出雷鳴般的掌聲與歡呼！觀眾紛紛起立喝采！");
      } else {
        logsList.push("😌 表演雖然流暢優雅，但缺少了些能直擊靈魂深處的情感爆發。台下觀眾給予了禮貌的掌聲。");
      }
      logsList.push(`🏆 藝術祭大會宣布得分：女兒獲得評分 ${finalCalculatedScore} 分！（勝出目標：${targetScore} 分）`);
    } 
    
    else if (selectedTrack === 'customer') {
      logsList.push("👿 傳說中的奧客挑戰賽，在熱鬧的王都市場神祕拉開序幕！台下聚滿了看熱鬧的民眾。");
      logsList.push(`🏪 ${daughter.name} 雙手抱胸，面帶標準微笑站在櫃檯前。此時，地獄級奧客「凱文 (Kerwin)」怒氣沖沖地走來！`);
      logsList.push("💢 凱文猛力拍桌：『老闆！這湯太燙了！而且裡面香菜切得不對稱！退錢！還要賠償我精神損失！』");
      logsList.push("🧠 面對無理的叫囂，女兒大腦高速運轉，保持著甜美的微笑，開始用驚人的口才進行邏輯降維打擊！");
      logsList.push(`💬 女兒溫和回應：『尊敬的客官，香菜不對稱是為了襯托您那高雅而特立獨行的品味。而這湯的溫度，更是我們專門為您清熱解毒調配的完美溫度呢～』`);
      if (winResult) {
        logsList.push("🤯 凱文瞬間語塞，臉色漲紅，啞口無言！最後惱羞成怒，捂著臉在眾人的鬨笑聲中狼狽逃離現場！");
      } else {
        logsList.push("😣 凱文的無理取鬧實在是排山倒海，女兒漸漸被對方的歪理攪得心煩意亂，疲於應付，無奈敗下陣來。");
      }
      logsList.push(`🏆 奧客挑戰賽裁判亮分：女兒獲得評分 ${finalCalculatedScore} 分！（勝出目標：${targetScore} 分）`);
    }

    // Set simulation state
    setSimulationLogs([logsList[0]]);
    setStep('simulating');
 
    // Roll logs one by one
    let currentIdx = 1;
    const interval = setInterval(() => {
      if (currentIdx < logsList.length) {
        setSimulationLogs(prev => [...prev, logsList[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setStep('result');
      }
    }, 1200);
  };

  // Instantly finish simulation
  const handleSkipSimulation = () => {
    setStep('result');
  };

  // Settle rewards
  const handleClaimReward = () => {
    const { score } = getTrackScore(selectedTrack, useSpecialItem);
    const randomFactor = score >= 9999 ? 0 : Math.floor(Math.random() * 41) - 20;
    const finalCalculatedScore = score >= 9999 ? 9999 : Math.max(10, score + randomFactor);
    const winResult = finalCalculatedScore >= targetScore;

    const goldPrize = winResult ? 3000 : 500;
    const repPrize = winResult ? 200 : 50;

    let trackName = '';
    if (selectedTrack === 'martial') trackName = '皇家武術大會';
    else if (selectedTrack === 'cooking') trackName = '王國烹飪大賽';
    else if (selectedTrack === 'art') trackName = '蔚藍藝術祭';
    else if (selectedTrack === 'customer') trackName = '奧客挑戰賽';

    const outcomeText = winResult 
      ? `👑 在 10 月收穫祭的【${trackName}】中勇奪冠軍！獲得獎金 ${goldPrize} G，王國名望增加 ${repPrize}！`
      : `🎗️ 在 10 月收穫祭的【${trackName}】中表現優異，獲得鼓勵獎金 ${goldPrize} G，王國名望增加 ${repPrize}。`;

    const consumedList: string[] = [];
    if (useSpecialItem) {
      if (selectedTrack === 'martial') consumedList.push('binlang_twin');
      if (selectedTrack === 'cooking') consumedList.push('barrel_rice_cake');
    }

    resolveFestival(winResult, goldPrize, repPrize, outcomeText, consumedList);
  };

  // Helper values for current selection
  const { label: currentLabel } = getTrackScore(selectedTrack, useSpecialItem);

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 min-h-[85vh]">
      
      {/* Component Styles (Isolated stylesheet logic) */}
      <style dangerouslySetInnerHTML={{__html: `
        .festival-card {
          width: 100%;
          max-width: 900px;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(20, 16, 38, 0.75);
          border: 1px solid rgba(212, 175, 55, 0.25);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        .festival-banner {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-bottom: 2px solid rgba(212, 175, 55, 0.3);
        }
        @media (min-width: 640px) {
          .festival-banner {
            height: 180px;
          }
        }
        .track-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        @media (min-width: 640px) {
          .track-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }
        }
        .track-item {
          padding: 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
        }
        .track-item.selected {
          background: rgba(212, 175, 55, 0.08);
          border-color: #d4af37;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.15);
        }
        .track-item:hover:not(.selected) {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .prob-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
        }
        .prob-high { background: rgba(6, 214, 160, 0.15); color: #06d6a0; border: 1px solid rgba(6, 214, 160, 0.3); }
        .prob-mid { background: rgba(255, 209, 102, 0.15); color: #ffd166; border: 1px solid rgba(255, 209, 102, 0.3); }
        .prob-low { background: rgba(239, 71, 111, 0.15); color: #ef476f; border: 1px solid rgba(239, 71, 111, 0.3); }
        
        .simulation-box {
          background: #080612;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          height: 220px;
          overflow-y: auto;
          padding: 12px;
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.8);
        }
        @media (min-width: 640px) {
          .simulation-box {
            height: 300px;
            padding: 16px;
            gap: 12px;
          }
        }
        .simulation-line {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #e2e8f0;
          animation: fade-in-line 0.5s ease forwards;
        }
        @keyframes fade-in-line {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gradient-overlay {
          background: linear-gradient(180deg, rgba(20, 16, 38, 0.8) 0%, rgba(20, 16, 38, 0.95) 100%);
        }
      `}} />

      <div className="festival-card glass-panel animate-slide-up flex flex-col">
        {/* Banner Section */}
        <div className="relative">
          <img 
            src="/harvest_festival_banner.png" 
            alt="Harvest Festival" 
            className="festival-banner"
            onError={(e) => {
              // fallback if copy failed or not found
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1000";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141026] to-transparent" />
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-6 flex items-center gap-2 sm:gap-3">
            <Trophy className="text-[#d4af37] w-6 h-6 sm:w-8 sm:h-8 float-animation" />
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#ffd700] m-0">十月年度收穫祭</h1>
              <p className="text-xs text-slate-300 font-semibold mt-1">
                第 {time.year} 年的王國盛會 - 展現培育成果、爭奪無上榮耀！
              </p>
            </div>
          </div>
        </div>

        {/* Phase 1: Track Selection */}
        {step === 'select' && (
          <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">
            
            <div className="bg-[rgba(255,255,255,0.02)] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                {/* Protagonist Mini Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-900">
                  <img 
                    src={getAvatarPath(daughter.age, daughter.outfit, daughter.avatarUrl)} 
                    alt={daughter.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{daughter.name} ({daughter.age} 歲)</h3>
                  <p className="text-xs text-slate-400">目前黃金: {daughter.gold} G | 名望: {daughter.attributes.reputation}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block">本年奪冠目標分數</span>
                <span className="text-xl font-black text-[#d4af37]">{targetScore} 分</span>
              </div>
            </div>

            <div>
              <span className="text-sm font-semibold text-slate-300">選擇你要報名的賽道：</span>
              
              <div className="track-grid">
                
                {/* Track 1: Martial */}
                <div 
                  className={`track-item flex flex-col gap-2 ${selectedTrack === 'martial' ? 'selected' : ''}`}
                  onClick={() => setSelectedTrack('martial')}
                >
                  <div className="flex justify-between items-start">
                    <span className="p-2 bg-red-950/40 rounded-lg text-[#ef476f] border border-red-500/20">
                      <Shield size={20} />
                    </span>
                    <span className={`prob-badge ${
                      calculateWinProbability('martial', false) >= 75 ? 'prob-high' :
                      calculateWinProbability('martial', false) >= 40 ? 'prob-mid' : 'prob-low'
                    }`}>
                      勝率 {calculateWinProbability('martial', hasBinlangTwin && selectedTrack === 'martial' ? useSpecialItem : false)}%
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">皇家武術大會</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    檢驗近身搏鬥與體能極限。決賽對手為四葉草。
                  </p>
                </div>

                {/* Track 2: Cooking */}
                <div 
                  className={`track-item flex flex-col gap-2 ${selectedTrack === 'cooking' ? 'selected' : ''}`}
                  onClick={() => setSelectedTrack('cooking')}
                >
                  <div className="flex justify-between items-start">
                    <span className="p-2 bg-emerald-950/40 rounded-lg text-[#06d6a0] border border-emerald-500/20">
                      <ChefHat size={20} />
                    </span>
                    <span className={`prob-badge ${
                      calculateWinProbability('cooking', hasRiceCake && selectedTrack === 'cooking' ? useSpecialItem : false) >= 75 ? 'prob-high' :
                      calculateWinProbability('cooking', hasRiceCake && selectedTrack === 'cooking' ? useSpecialItem : false) >= 40 ? 'prob-mid' : 'prob-low'
                    }`}>
                      勝率 {calculateWinProbability('cooking', hasRiceCake && selectedTrack === 'cooking' ? useSpecialItem : false)}%
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">王國烹飪大賽</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    比拼家事、細心與調味。考驗感受與道德。
                  </p>
                </div>

                {/* Track 3: Art */}
                <div 
                  className={`track-item flex flex-col gap-2 ${selectedTrack === 'art' ? 'selected' : ''}`}
                  onClick={() => setSelectedTrack('art')}
                >
                  <div className="flex justify-between items-start">
                    <span className="p-2 bg-purple-950/40 rounded-lg text-[#a855f7] border border-purple-500/20">
                      <Palette size={20} />
                    </span>
                    <span className={`prob-badge ${
                      calculateWinProbability('art', false) >= 75 ? 'prob-high' :
                      calculateWinProbability('art', false) >= 40 ? 'prob-mid' : 'prob-low'
                    }`}>
                      勝率 {calculateWinProbability('art', false)}%
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">蔚藍藝術祭</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    展現氣質與藝術才華。珊珊評審會進行點評。
                  </p>
                </div>

                {/* Track 4: Customer (Honghua Only) */}
                {daughter.characterId === 'honghua' && (
                  <div 
                    className={`track-item flex flex-col gap-2 ${selectedTrack === 'customer' ? 'selected' : ''}`}
                    onClick={() => setSelectedTrack('customer')}
                  >
                    <div className="flex justify-between items-start">
                      <span className="p-2 bg-amber-950/40 rounded-lg text-[#ffd166] border border-amber-500/20">
                        <MessageSquare size={20} />
                      </span>
                      <span className={`prob-badge ${
                        calculateWinProbability('customer', false) >= 75 ? 'prob-high' :
                        calculateWinProbability('customer', false) >= 40 ? 'prob-mid' : 'prob-low'
                      }`}>
                        勝率 {calculateWinProbability('customer', false)}%
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">奧客挑戰賽</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      紅花專屬隱藏賽道。迎戰神仙級奧客「凱文」。
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Selected Track Details & Special Items Ingestion */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">賽道評分標準</span>
                <span className="text-sm text-slate-200 font-bold mt-0.5 block">{currentLabel}</span>
              </div>

              {/* Special Item Options */}
              {selectedTrack === 'martial' && hasBinlangTwin && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-red-950/20 border border-red-500/20 mt-1 animate-pulse">
                  <input 
                    type="checkbox" 
                    id="useBinlang" 
                    className="w-4 h-4 accent-[#ef476f] cursor-pointer"
                    checked={useSpecialItem}
                    onChange={(e) => setUseSpecialItem(e.target.checked)}
                  />
                  <label htmlFor="useBinlang" className="text-xs text-red-200 font-semibold cursor-pointer">
                    🔥 嚼下背包中的【雙子星檳榔】！獲得大賽狂暴 Buff，評估戰力額外提升 +150！
                  </label>
                </div>
              )}

              {selectedTrack === 'cooking' && hasRiceCake && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 mt-1 animate-pulse">
                  <input 
                    type="checkbox" 
                    id="useRiceCake" 
                    className="w-4 h-4 accent-[#06d6a0] cursor-pointer"
                    checked={useSpecialItem}
                    onChange={(e) => setUseSpecialItem(e.target.checked)}
                  />
                  <label htmlFor="useRiceCake" className="text-xs text-emerald-200 font-semibold cursor-pointer">
                    🍱 拿出背包中的【特級桶仔米糕】參賽！直接觸發評審感動落淚特效，保送奪冠！
                  </label>
                </div>
              )}
            </div>

            {/* Bottom buttons */}
            <div className="flex justify-end mt-2">
              <button 
                onClick={handleStartChallenge}
                className="btn-fantasy text-sm py-3 px-8 flex items-center gap-2"
              >
                <Sparkles size={16} />
                報名並開始模擬
              </button>
            </div>

          </div>
        )}

        {/* Phase 2: Live Ticker Simulation */}
        {step === 'simulating' && (
          <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2 text-sm text-[#ffd700] font-bold">
                <Sparkles className="animate-spin text-amber-400" size={18} />
                賽況激鬥模擬中...
              </span>
              <button 
                onClick={handleSkipSimulation}
                className="btn-fantasy-sec text-xs py-1 px-3"
              >
                跳過過程
              </button>
            </div>

            {/* Simulation Log screen */}
            <div ref={logContainerRef} className="simulation-box">
              {simulationLogs.map((log, idx) => (
                <div key={idx} className="simulation-line">
                  {log}
                </div>
              ))}
            </div>

            {/* Simulated Ticker loading spinner */}
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '200ms' }} />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        )}

        {/* Phase 3: Results & Rewards */}
        {step === 'result' && (
          <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 text-center animate-slide-up">
            
            {(() => {
              const { score } = getTrackScore(selectedTrack, useSpecialItem);
              const finalScore = score >= 9999 ? 9999 : score; // note: actual was checked inside startChallenge but we'll show result nicely
              const isVictor = finalScore >= targetScore;
              
              return (
                <div className="flex flex-col items-center gap-4 py-6">
                  
                  {/* Crown / Trophy Overlay */}
                  <div className={`p-3 sm:p-5 rounded-full ${isVictor ? 'bg-amber-500/10 border-2 border-amber-400 animate-pulse' : 'bg-slate-800 border-2 border-slate-700'}`}>
                    <Trophy className={`w-10 h-10 sm:w-16 sm:h-16 ${isVictor ? 'text-[#ffd700]' : 'text-slate-400'}`} />
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-3xl font-black mt-2 tracking-widest uppercase">
                      {isVictor ? '👑 奪得冠軍 👑' : '🎗️ 榮獲優勝 🎗️'}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                      {isVictor 
                        ? `太棒了！女兒在收穫祭中力壓群雄，成功摘得桂冠！`
                        : `表現相當不俗！雖然與冠軍擦肩而過，但她的努力大家都看在眼裡！`}
                    </p>
                  </div>

                  {/* Score breakdown badge */}
                  <div className="glass-panel py-2 sm:py-3 px-4 sm:px-8 rounded-full border border-slate-800 flex items-center gap-3 sm:gap-6 mt-4">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">女兒最終評分</span>
                      <span className="text-lg sm:text-2xl font-black text-white">{finalScore} 分</span>
                    </div>
                    <div className="h-6 sm:h-8 w-px bg-slate-800" />
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">大會勝出標準</span>
                      <span className="text-lg sm:text-2xl font-black text-[#d4af37]">{targetScore} 分</span>
                    </div>
                  </div>

                  {/* Rewards Grid */}
                  <div className="w-full max-w-sm grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-[#d4af37]/20 flex flex-col items-center gap-1.5">
                      <Coins className="text-[#ffd700]" size={24} />
                      <span className="text-xs text-slate-400 font-semibold">獲得獎金</span>
                      <span className="text-lg font-bold text-white">+{isVictor ? 3000 : 500} G</span>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col items-center gap-1.5">
                      <Award className="text-purple-400" size={24} />
                      <span className="text-xs text-slate-400 font-semibold">提升名望</span>
                      <span className="text-lg font-bold text-white">+{isVictor ? 200 : 50}</span>
                    </div>
                  </div>

                  {/* Finish button */}
                  <div className="mt-8">
                    <button 
                      onClick={handleClaimReward}
                      className="btn-fantasy py-3 px-8 text-sm flex items-center gap-2"
                    >
                      領取獎勵並回到房間
                      <ArrowRight size={16} />
                    </button>
                  </div>

                </div>
              );
            })()}

          </div>
        )}

      </div>
    </div>
  );
};
