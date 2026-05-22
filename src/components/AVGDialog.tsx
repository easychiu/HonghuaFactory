import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Sparkles, MessageCircle } from 'lucide-react';

export const AVGDialog: React.FC = () => {
  const { state, executeAVGChoice } = useGame();
  const { currentEvent, currentEventStep, daughter } = state;

  if (!currentEvent || !currentEventStep) return null;

  // Under currentEvent, nodes is a Record<string, AVGDialogueNode>
  const nodes = (currentEvent as any).nodes || {};
  const currentNode = nodes[currentEventStep];
  if (!currentNode) return null;

  const handleNext = () => {
    // Calling executeAVGChoice(0) will handle nodes with no choices and close/advance
    executeAVGChoice(0);
  };

  const handleChoice = (index: number) => {
    executeAVGChoice(index);
  };

  // Determine if speaker is the daughter
  const isDaughter = currentNode.speaker === daughter.name || currentNode.speaker === '女兒';

  // Apply hair color filter for Emilia
  const applyEmiliaFilter = daughter.characterId === 'emilia' && isDaughter;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-[4px] flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-panel w-full max-w-xl p-6 md:p-8 animate-slide-up border-2 border-[#d4af37]/45 shadow-[0_0_40px_rgba(212,175,55,0.3)] flex flex-col gap-6">
        
        {/* Event Header Banner */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-[#ffd700] font-bold text-sm tracking-wider">
          <MessageCircle size={18} className="text-[#ffd700]" />
          <span>冒險事件：{currentEvent.title}</span>
        </div>

        {/* Narrative / Text box */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-block bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.5)] text-[#ffd700] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
              🗣️ {currentNode.speaker}
            </div>
          </div>
          <div className="text-sm md:text-base text-slate-100 leading-relaxed text-justify bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 font-medium shadow-inner relative min-h-[100px] flex items-center">
            {applyEmiliaFilter && (
              <span className="absolute top-2 right-2 text-[10px] text-[#a855f7] bg-[#a855f7]/10 px-1.5 py-0.5 rounded border border-[#a855f7]/25">
                ☕ 咖啡髮色
              </span>
            )}
            <p className="w-full">{currentNode.text}</p>
          </div>
        </div>

        {/* Choices / Actions */}
        <div className="flex flex-col gap-3">
          {currentNode.choices && currentNode.choices.length > 0 ? (
            currentNode.choices.map((choice: any, index: number) => (
              <button
                key={index}
                onClick={() => handleChoice(index)}
                className="w-full text-left py-3.5 px-5 bg-slate-900/50 border border-slate-800/80 hover:border-[#ffd700] hover:bg-[rgba(212,175,55,0.06)] text-xs md:text-sm font-semibold rounded-xl text-slate-300 hover:text-white transition-all flex justify-between items-center gap-3 shadow-sm"
              >
                <span>{choice.text}</span>
                <Sparkles size={14} className="text-[#ffd700]/70 shrink-0" />
              </button>
            ))
          ) : (
            <button
              onClick={handleNext}
              className="btn-fantasy py-3.5 px-10 text-xs md:text-sm flex items-center justify-center gap-2 mx-auto shadow-lg"
            >
              繼續對話
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
