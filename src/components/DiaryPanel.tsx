import React from 'react';
import { useGame } from '../contexts/GameContext';
import { BookOpen, Calendar, Lock } from 'lucide-react';
import { audioManager } from '../utils/audio';

interface DiaryPanelProps {
  onClose: () => void;
}

interface DiaryEntry {
  id: string;
  title: string;
  emoji: string;
  text: string;
  condition: string;
}

const DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: 'first_work_success',
    title: '首次工作大成功',
    emoji: '🌟',
    text: "今天去幫忙工作時居然大成功了！拿到了加倍的工資！看著沉甸甸的薪水袋，還有老爸那溫馨的摸頭鼓勵，心裡暖洋洋的。我一定要更努力，成為老爸的驕傲！",
    condition: "打工行程觸發大成功"
  },
  {
    id: 'first_study_success',
    title: '首次學習大成功',
    emoji: '📚',
    text: "今天上課時得到了老師的誇獎！原來學習新知識是這麼有趣的事情。看著筆記本上滿滿的紅圈，連疲勞都飛走了呢！老爸看到一定也會很高興吧！",
    condition: "學習行程觸發大成功"
  },
  {
    id: 'first_sick',
    title: '生病住院了',
    emoji: '🏥',
    text: "唔... 今天頭重腳輕，連下床的力氣都沒有了。老爸一臉焦急地在床邊照顧我，還一直安慰我。對不起，讓老爸擔心了... 我以後一定會多注意身體的。",
    condition: "疲勞值過高導致生病或住院"
  },
  {
    id: 'first_rebellion',
    title: '叛逆翹課去',
    emoji: '⚡',
    text: "哼，為什麼每天都要聽老爸的安排？今天我決定翹課去街角晃晃。雖然心裡有一點點愧疚，但這種自由的感覺真是不賴！不過，如果老爸生氣的話，我還是會道歉的啦...",
    condition: "道德過低或壓力過大進入叛逆期翹課"
  },
  {
    id: 'first_adventure_boss',
    title: '擊敗修行強敵',
    emoji: '⚔️',
    text: "我們做到了！在荖葉林的深處擊倒了那個可怕的怪物首領。雖然戰鬥時心跳得好快，但握緊長劍的瞬間，我感覺自己長大了！我不再是需要躲在老爸羽翼下的小女孩了！",
    condition: "野外冒險中擊敗區域 Boss 首領"
  },
  {
    id: 'first_reunion',
    title: '命運的重逢',
    emoji: '🌸',
    text: "天啊... 今天在冒險中遇到的人，居然是我的親生姊妹！看著她與我神似的臉龐，命運的齒輪彷彿在這一刻發出了清脆的轉動聲。原來我在這世界上並不孤單，謝謝老爸一直以來守護這個秘密。",
    condition: "冒險中與三胞胎姊妹相認重聚"
  },
  {
    id: 'first_black_market',
    title: '踏入神秘黑市',
    emoji: '🕯️',
    text: "在荒野的隱密角落裡，我跟著神秘商人走進了走私黑市。那裡擺滿了發光的禁忌武器和冒煙的藥水。雖然很有趣，但回去絕對不能跟老爸說，不然他一定會嘮叨半天！",
    condition: "武者修行中點擊商店驛站節點"
  },
  {
    id: 'first_casino',
    title: '初入黑鑽賭局',
    emoji: '🎲',
    text: "今天誤打誤撞進入了熱鬧的賭局。骰子在碗裡旋轉的聲音，還有賭客們的歡呼聲，讓我心跳加速！雖然很刺激，但希望老爸別發現我有偷偷押注，不然屁股要被打爛啦...",
    condition: "修行商店觸發黑鑽賭局事件"
  }
];

export const DiaryPanel: React.FC<DiaryPanelProps> = ({ onClose }) => {
  const { state } = useGame();
  const { daughter } = state;
  const diaryMilestones = daughter.diaryMilestones || [];

  const unlockedCount = DIARY_ENTRIES.filter(e => diaryMilestones.includes(e.id)).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 md:p-6 animate-fade-in overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl p-5 sm:p-6 md:p-8 animate-slide-up border-2 border-pink-500/35 shadow-[0_0_40px_rgba(244,114,182,0.25)] flex flex-col gap-6 bg-slate-905/95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <BookOpen size={26} className="text-pink-400" />
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                📖 女兒的成長回憶日記
              </h2>
              <p className="text-xs text-slate-400">
                紀錄女兒在當前週目中經歷的所有重大時刻與真心話。
              </p>
            </div>
          </div>
          
          {/* Milestone Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-950/20 border border-pink-900/40 rounded-xl text-xs font-bold shrink-0 text-pink-300">
            <span>已記錄心情:</span>
            <span>{unlockedCount} / {DIARY_ENTRIES.length}</span>
          </div>
        </div>

        {/* Diary Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto pr-1">
          {DIARY_ENTRIES.map(entry => {
            const isUnlocked = diaryMilestones.includes(entry.id);

            return (
              <div 
                key={entry.id}
                className={`p-5 rounded-2xl border text-left flex flex-col gap-2 relative transition-all shadow ${
                  isUnlocked 
                    ? 'bg-[rgba(244,114,182,0.03)] border-pink-900/40 shadow-inner' 
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                {/* Diary Header */}
                <div className="flex justify-between items-center gap-2 border-b border-slate-800/60 pb-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    {isUnlocked ? entry.emoji : '🔒'} {entry.title}
                  </h4>
                  {isUnlocked && (
                    <span className="text-[9px] px-2 py-0.5 bg-pink-950/40 border border-pink-900/40 text-pink-400 font-medium rounded-full flex items-center gap-1">
                      <Calendar size={8} /> 已記錄
                    </span>
                  )}
                </div>

                {/* Diary text */}
                <div className="text-xs leading-relaxed text-justify min-h-[90px] flex items-center">
                  {isUnlocked ? (
                    <p className="text-slate-300 font-sans tracking-wide" style={{ fontFamily: 'var(--font-fantasy), system-ui' }}>
                      「 {entry.text} 」
                    </p>
                  ) : (
                    <div className="w-full flex flex-col items-center justify-center text-slate-500 gap-1.5 py-4">
                      <Lock size={16} className="text-slate-600" />
                      <p className="text-[10px] italic text-slate-500">這頁日記還是空白的...</p>
                      <p className="text-[9px] text-slate-600 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-900 mt-1">
                        解鎖條件：{entry.condition}
                      </p>
                    </div>
                  )}
                </div>

                {/* Handdrawn line style overlays */}
                <div className="absolute inset-x-4 bottom-3 border-b border-[rgba(244,114,182,0.02)] pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex justify-end">
          <button 
            type="button" 
            onClick={() => {
              audioManager.playSfx('sfx_click.mp3');
              onClose();
            }} 
            className="btn-fantasy py-2.5 px-8 text-xs font-bold"
          >
            蓋上日記本
          </button>
        </div>

      </div>
    </div>
  );
};
