import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { 
  Award, Trophy, Shield, ChefHat, Palette, MessageSquare, 
  ArrowRight, Coins, Sparkles, Trophy as TrophyIcon 
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
    
    if (score - 20 >= targetScore) return 99;
    if (score + 20 < targetScore) return 1;
    
    const prob = Math.round(((score + 20 - targetScore) / 40) * 100);
    return Math.min(99, Math.max(1, prob));
  };

  useEffect(() => {
    setUseSpecialItem(false);
  }, [selectedTrack]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [simulationLogs]);

  const handleStartChallenge = () => {
    const { score } = getTrackScore(selectedTrack, useSpecialItem);
    const randomFactor = score >= 9999 ? 0 : Math.floor(Math.random() * 41) - 20;
    const finalCalculatedScore = score >= 9999 ? 9999 : Math.max(10, score + randomFactor);
    const winResult = finalCalculatedScore >= targetScore;
    
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
        logsList.push("🔥 女兒熟練地升火、翻炒、調味，精準掌控火候，製作出香氣四溢的王國傳統創意燉菜.");
        logsList.push("🍽️ 料理端上評審席。美食家們緩緩品嚐，交頭接耳，露出若有所思的表情。");
        if (winResult) {
          logsList.push("😋 評審點頭大讚：『火候精妙，調味豐富多層次，實在是一道溫暖人心的神級料理！』");
        } else {
          logsList.push("😖 評審搖頭嘆息：『調味稍微過鹹了些，配料的香氣被痕蓋了，火候稍顯不足，有些可惜。』");
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
        logsList.push(`💬 評審席上的同窗「珊珊」雙眼放光，忍不住驚呼：『如此空靈脫俗的琴聲，簡真是藝術的化身！』`);
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

    setSimulationLogs([logsList[0]]);
    setStep('simulating');
 
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

  const handleSkipSimulation = () => {
    setStep('result');
  };

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

  const { label: currentLabel } = getTrackScore(selectedTrack, useSpecialItem);

  // 計算勝率的輔助樣式函數
  const getProbClass = (track: TrackId, item: boolean) => {
    const prob = calculateWinProbability(track, item);
    if (prob >= 75) return 'text-emerald-400 border-emerald-900/50 bg-emerald-950/40';
    if (prob >= 40) return 'text-amber-400 border-amber-900/50 bg-amber-950/40';
    return 'text-red-400 border-red-900/50 bg-red-950/40';
  };

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 min-h-[85vh] w-full max-w-4xl mx-auto">
      <div className="victorian-container w-full brass-panel flex flex-col overflow-hidden rounded-lg">
        
        {/* Banner Section (Victorian Banner) */}
        <div className="relative w-full h-32 sm:h-44 md:h-48 overflow-hidden border-b-2 border-dashed border-[#c5a059]/40 bg-black-dark">
          <img 
            src="/harvest_festival_banner.png" 
            alt="Harvest Festival" 
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1000";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black-dark to-transparent" />
          <div className="absolute bottom-4 left-4 sm:left-8 flex items-center gap-3 z-10">
            <TrophyIcon className="text-[#c5a059] w-8 h-8 sm:w-11 sm:h-11 filter drop-shadow-[0_2px_8px_rgba(197,160,89,0.5)]" />
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-[#e5c483] tracking-wide m-0" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                十月年度收穫祭
              </h1>
              <p className="text-xs text-slate-300 font-medium mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                第 {time.year} 年王國盛典 — 展現維多利亞仕女之跨界成果與無上榮耀！
              </p>
            </div>
          </div>
        </div>

        {/* ═══ Phase 1: Track Selection ═══ */}
        {step === 'select' && (
          <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 animate-slide-up">
            
            {/* Character Header Mini-Bar */}
            <div className="border border-[#c5a059]/30 bg-[#161412]/80 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded border-2 border-[#c5a059]/50 bg-black-dark overflow-hidden shadow-md">
                  <img 
                    src={getAvatarPath(daughter.age, daughter.outfit, daughter.avatarUrl)} 
                    alt={daughter.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#e5c483] flex items-center gap-2">
                    {daughter.name} <span className="text-xs text-slate-400 font-normal">({daughter.age} 歲)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    🪙 持有資金: <span className="text-[#ffd700] font-semibold">{daughter.gold} G</span> | 👑 聲望值: <span className="text-purple-400 font-semibold">{daughter.attributes.reputation}</span>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 border-[#c5a059]/10 pt-2 sm:pt-0 w-full sm:w-auto">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">本年奪冠評審門檻</span>
                <span className="text-2xl font-black text-[#ffd700] tracking-wide" style={{ textShadow: '0 0 8px rgba(255,215,0,0.3)' }}>
                  {targetScore} <span className="text-sm font-bold text-slate-400">分</span>
                </span>
              </div>
            </div>

            {/* Grid Track Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                📜 點選大賽報名賽道
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Track 1: Martial */}
                <button
                  type="button"
                  className={`text-left flex flex-col justify-between p-4 rounded border transition-all duration-200 relative pointer-events-auto ${
                    selectedTrack === 'martial' 
                      ? 'bg-[#6b1d2f]/10 border-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.25)]' 
                      : 'bg-black-dark/40 border-[#c5a059]/20 hover:border-[#c5a059]/50 hover:bg-black-dark/60'
                  }`}
                  onClick={() => setSelectedTrack('martial')}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="p-1.5 bg-[#42101b] rounded text-[#ef476f] border border-red-900/30">
                      <Shield size={18} />
                    </span>
                    <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-bold ${getProbClass('martial', hasBinlangTwin && selectedTrack === 'martial' ? useSpecialItem : false)}`}>
                      勝率 {calculateWinProbability('martial', hasBinlangTwin && selectedTrack === 'martial' ? useSpecialItem : false)}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-[#e5c483]">皇家武術大會</h4>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1">
                      檢驗體能、格鬥與戰力。決賽對手為宿敵四葉草。
                    </p>
                  </div>
                </button>

                {/* Track 2: Cooking */}
                <button
                  type="button"
                  className={`text-left flex flex-col justify-between p-4 rounded border transition-all duration-200 relative pointer-events-auto ${
                    selectedTrack === 'cooking' 
                      ? 'bg-[#1b3b2b]/20 border-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.25)]' 
                      : 'bg-black-dark/40 border-[#c5a059]/20 hover:border-[#c5a059]/50 hover:bg-black-dark/60'
                  }`}
                  onClick={() => setSelectedTrack('cooking')}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="p-1.5 bg-[#0f2419] rounded text-[#06d6a0] border border-emerald-900/30">
                      <ChefHat size={18} />
                    </span>
                    <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-bold ${getProbClass('cooking', hasRiceCake && selectedTrack === 'cooking' ? useSpecialItem : false)}`}>
                      勝率 {calculateWinProbability('cooking', hasRiceCake && selectedTrack === 'cooking' ? useSpecialItem : false)}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-[#e5c483]">王國烹飪大賽</h4>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1">
                      比拼精細調味與廚藝家事。考驗感受與道德。
                    </p>
                  </div>
                </button>

                {/* Track 3: Art */}
                <button
                  type="button"
                  className={`text-left flex flex-col justify-between p-4 rounded border transition-all duration-200 relative pointer-events-auto ${
                    selectedTrack === 'art' 
                      ? 'bg-[#161412] border-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.25)]' 
                      : 'bg-black-dark/40 border-[#c5a059]/20 hover:border-[#c5a059]/50 hover:bg-black-dark/60'
                  }`}
                  onClick={() => setSelectedTrack('art')}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="p-1.5 bg-black-dark rounded text-purple-400 border border-purple-900/30">
                      <Palette size={18} />
                    </span>
                    <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-bold ${getProbClass('art', false)}`}>
                      勝率 {calculateWinProbability('art', false)}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-bold text-[#e5c483]">蔚藍藝術祭</h4>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1">
                      比拼琴藝才華與高雅姿態。珊珊將親臨點評。
                    </p>
                  </div>
                </button>

                {/* Track 4: Customer (Honghua Only) */}
                {daughter.characterId === 'honghua' && (
                  <button
                    type="button"
                    className={`text-left flex flex-col justify-between p-4 rounded border transition-all duration-200 relative pointer-events-auto ${
                      selectedTrack === 'customer' 
                        ? 'bg-amber-950/10 border-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.25)]' 
                        : 'bg-black-dark/40 border-[#c5a059]/20 hover:border-[#c5a059]/50 hover:bg-black-dark/60'
                    }`}
                    onClick={() => setSelectedTrack('customer')}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="p-1.5 bg-amber-950/40 rounded text-[#ffd166] border border-amber-900/30">
                        <MessageSquare size={18} />
                      </span>
                      <span className={`text-[10px] border px-2 py-0.5 rounded font-mono font-bold ${getProbClass('customer', false)}`}>
                        勝率 {calculateWinProbability('customer', false)}%
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-[#e5c483]">奧客挑戰賽</h4>
                      <p className="text-[11px] text-slate-400 leading-normal mt-1">
                        紅花限定。直面頂級刁難巨頭「奧客凱文」。
                      </p>
                    </div>
                  </button>
                )}

              </div>
            </div>

            {/* Formula Row & Ingestion Inventory check */}
            <div className="p-4 rounded border border-[#c5a059]/30 bg-black-dark/70 flex flex-col gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">賽道評審核心公式</span>
                <span className="text-sm text-slate-200 font-semibold mt-0.5 block">{currentLabel}</span>
              </div>

              {/* Special Item Options Checklist */}
              {selectedTrack === 'martial' && hasBinlangTwin && (
                <div className="flex items-center gap-2.5 p-3 rounded border border-red-900/40 bg-[#42101b]/20 victorian-flash pointer-events-auto">
                  <input 
                    type="checkbox" 
                    id="useBinlang" 
                    className="w-4 h-4 accent-red-700 cursor-pointer relative z-10"
                    checked={useSpecialItem}
                    onChange={(e) => setUseSpecialItem(e.target.checked)}
                  />
                  <label htmlFor="useBinlang" className="text-xs text-red-200 font-bold cursor-pointer relative z-10 select-none">
                    🔥 嚼下背包中的【雙子星檳榔】！引燃熱血狂暴發條，戰力公式增幅額外 +150 分！
                  </label>
                </div>
              )}

              {selectedTrack === 'cooking' && hasRiceCake && (
                <div className="flex items-center gap-2.5 p-3 rounded border border-emerald-900/40 bg-[#0f2419]/30 victorian-flash pointer-events-auto">
                  <input 
                    type="checkbox" 
                    id="useRiceCake" 
                    className="w-4 h-4 accent-emerald-700 cursor-pointer relative z-10"
                    checked={useSpecialItem}
                    onChange={(e) => setUseSpecialItem(e.target.checked)}
                  />
                  <label htmlFor="useRiceCake" className="text-xs text-emerald-200 font-bold cursor-pointer relative z-10 select-none">
                    🍱 拿出秘密底牌【特級桶仔米糕】參賽！直接擊穿美食家心理防線，保送滿分奪冠！
                  </label>
                </div>
              )}
            </div>

            {/* Footer Form trigger button */}
            <div className="flex justify-end pt-2">
              <button 
                type="button"
                onClick={handleStartChallenge}
                className="btn-fantasy text-sm py-3.5 px-8 flex items-center gap-2 uppercase tracking-wider"
              >
                <Sparkles size={16} /> 簽名報名並開啟大賽
              </button>
            </div>

          </div>
        )}

        {/* ═══ Phase 2: Live Ticker Text Simulation ═══ */}
        {step === 'simulating' && (
          <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#c5a059]/30 pb-3">
              <span className="flex items-center gap-2 text-sm text-[#e5c483] font-bold">
                <Sparkles className="animate-spin text-[#c5a059]" size={16} />
                宮廷評審大會激烈進行中...
              </span>
              <button 
                type="button"
                onClick={handleSkipSimulation}
                className="btn-fantasy-sec text-xs py-1 px-3 relative z-50 pointer-events-auto"
              >
                跳過過程
              </button>
            </div>

            {/* Custom simulation ticker container (Parchment style) */}
            <div ref={logContainerRef} className="parchment-dialog simulation-box shadow-inner overflow-y-auto">
              {simulationLogs.map((log, idx) => (
                <div key={idx} className="simulation-line font-medium text-left text-stone-900">
                  {log}
                </div>
              ))}
            </div>

            {/* Ticker custom loading cogs */}
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="w-2 h-2 rounded-full bg-red-700 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-bounce" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-800 animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        )}

        {/* ═══ Phase 3: Settle Results Screen ═══ */}
        {step === 'result' && (
          <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 text-center animate-slide-up">
            
            {(() => {
              const { score } = getTrackScore(selectedTrack, useSpecialItem);
              const finalScore = score >= 9999 ? 9999 : score;
              const isVictor = finalScore >= targetScore;
              
              return (
                <div className="flex flex-col items-center gap-5 py-4">
                  
                  {/* Victorian Shield/Trophy Overlay */}
                  <div className={`p-4 sm:p-6 rounded-full border-2 ${
                    isVictor 
                      ? 'bg-[#6b1d2f]/10 border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.5)] animate-pulse' 
                      : 'bg-black-dark border-slate-800'
                  }`}>
                    <TrophyIcon className={`w-12 h-12 sm:w-16 sm:h-16 ${isVictor ? 'text-[#ffd700]' : 'text-slate-500'}`} />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-4xl font-black text-[#e5c483] tracking-widest uppercase">
                      {isVictor ? '👑 榮登收穫祭寶座 👑' : '🎗️ 榮獲優勝嘉獎 🎗️'}
                    </h2>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      {isVictor 
                        ? `精彩絕倫！女兒在大賽中展現出壓倒性的優勢，贏得全場歡呼，成功摘得桂冠！`
                        : `表現卓越！雖然因些微運氣與最高王位擦肩而過，但她的高雅才華已名滿王都！`}
                    </p>
                  </div>

                  {/* Brass Metadata Badge */}
                  <div className="border-2 border-[#c5a059]/40 bg-[#161412]/90 py-3 px-6 sm:px-10 rounded flex items-center gap-4 sm:gap-8 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">女兒最終得分</span>
                      <span className="text-xl sm:text-2xl font-black text-white">{finalScore} <span className="text-xs font-bold text-slate-400">分</span></span>
                    </div>
                    <div className="h-8 w-px bg-[#c5a059]/30" />
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">大會冠軍門檻</span>
                      <span className="text-xl sm:text-2xl font-black text-[#e5c483]">{targetScore} <span className="text-xs font-bold text-slate-400">分</span></span>
                    </div>
                  </div>

                  {/* Settle Rewards Inventory Grid */}
                  <div className="w-full max-w-sm grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded border border-[#c5a059]/20 bg-black-dark/60 flex flex-col items-center gap-1">
                      <Coins className="text-[#ffd700]" size={20} />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">大賽金幣賞金</span>
                      <span className="text-base font-bold text-white">+{isVictor ? 3000 : 500} G</span>
                    </div>
                    
                    <div className="p-4 rounded border border-purple-500/20 bg-black-dark/60 flex flex-col items-center gap-1">
                      <Award className="text-purple-400" size={20} />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">王國名望增幅</span>
                      <span className="text-base font-bold text-white">+{isVictor ? 200 : 50}</span>
                    </div>
                  </div>

                  {/* Settle loop confirm button */}
                  <div className="mt-4 pt-2">
                    <button 
                      type="button"
                      onClick={handleClaimReward}
                      className="btn-fantasy py-3 px-10 text-sm flex items-center gap-2 relative z-50 pointer-events-auto"
                    >
                      領取賞金並擺道回宮
                      <ArrowRight size={14} />
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