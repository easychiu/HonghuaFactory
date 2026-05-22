import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Sparkles, MessageCircle } from 'lucide-react';

export const DialogOverlay: React.FC = () => {
  const { state, selectEventChoice } = useGame();
  const { currentEvent, currentEventStep } = state;

  if (!currentEvent || !currentEventStep) return null;

  const currentNode = currentEvent.dialogue.find(d => d.id === currentEventStep);
  if (!currentNode) return null;

  const handleNext = () => {
    // If no choices, advance to nextId or end event
    selectEventChoice({
      nextId: currentNode.nextId || 'end'
    });
  };

  const handleChoice = (choice: any) => {
    selectEventChoice(choice);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="glass-panel w-full max-w-xl p-6 md:p-8 animate-slide-up border-2 border-[#d4af37]/45 shadow-[0_0_30px_rgba(212,175,55,0.25)] flex flex-col gap-6">
        
        {/* Event Header Banner */}
        <div className="flex items-center gap-2 border-b border-slate-900 pb-3 text-[#d4af37] font-bold text-sm tracking-wide">
          <MessageCircle size={16} />
          <span>事件觸發：{currentEvent.title}</span>
        </div>

        {/* Narrative / Text box */}
        <div className="space-y-4">
          <div className="inline-block bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.4)] text-[#ffd700] text-xs font-bold px-3 py-1 rounded-md">
            🗣️ {currentNode.speaker}
          </div>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed text-justify bg-slate-950/60 p-4 rounded-xl border border-slate-900 font-medium">
            {currentNode.text}
          </p>
        </div>

        {/* Choices / Actions */}
        <div className="flex flex-col gap-2.5">
          {currentNode.choices && currentNode.choices.length > 0 ? (
            currentNode.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                className="w-full text-left py-3 px-4 bg-slate-900/60 border border-slate-800 hover:border-[#d4af37] hover:bg-[rgba(212,175,55,0.04)] text-xs md:text-sm font-semibold rounded-lg text-slate-300 hover:text-white transition-all flex justify-between items-center gap-2"
              >
                <span>{choice.text}</span>
                <Sparkles size={14} className="text-[#d4af37]/60 shrink-0" />
              </button>
            ))
          ) : (
            <button
              onClick={handleNext}
              className="btn-fantasy py-3 px-8 text-xs md:text-sm flex items-center justify-center gap-1.5 mx-auto"
            >
              繼續對話
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
