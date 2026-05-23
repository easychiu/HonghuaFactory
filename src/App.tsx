import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { CombatProvider } from './contexts/CombatContext';
import { StartScreen } from './components/StartScreen';
import { MainPanel } from './components/MainPanel';
import { Scheduler } from './components/Scheduler';
import { ExecutionScreen } from './components/ExecutionScreen';
import { StoreScreen } from './components/StoreScreen';
import { AdventureMap } from './components/AdventureMap';
import { EndingScreen } from './components/EndingScreen';
import { FestivalScreen } from './components/FestivalScreen';
import { AVGDialog } from './components/AVGDialog';
import { audioManager } from './utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

const SoundToggle: React.FC = () => {
  const [muted, setMuted] = React.useState(audioManager.getMutedState());

  const handleToggle = () => {
    const nextMuted = audioManager.toggleMute();
    setMuted(nextMuted);
  };

  return (
    <button
      onClick={handleToggle}
      className="fixed top-4 right-4 z-[99] p-2.5 rounded-full bg-slate-950/70 border border-slate-800 text-[#ffd700] hover:text-[#ffe566] shadow-md backdrop-blur-sm hover:border-[#d4af37]/50 hover:scale-105 transition-all flex items-center justify-center"
      title={muted ? '取消靜音' : '靜音背景音樂'}
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
};

const GameContent: React.FC = () => {
  const { state } = useGame();

  React.useEffect(() => {
    if (state.logs.length === 0) {
      audioManager.playBgm('BGM_Title.mp3');
    } else if (state.activeScreen === 'main' || state.activeScreen === 'scheduler') {
      audioManager.playBgm('BGM_Room.mp3');
    } else if (state.activeScreen === 'store') {
      audioManager.playBgm('BGM_shop.mp3');
    } else if (state.activeScreen === 'execution') {
      audioManager.playBgm('BGM_Execution.mp3');
    } else if (state.activeScreen === 'adventure') {
      const currentNode = state.adventure?.nodes.find(n => n.id === state.adventure?.currentNodeId);
      if (state.adventure?.status === 'fighting') {
        const isBoss = currentNode?.type === 'boss' || currentNode?.monster?.behaviorPattern === 'boss';
        if (isBoss) {
          audioManager.playBgm('bgm_boss.mp3');
        } else {
          audioManager.playBgm('bgm_battle.mp3');
        }
      } else {
        if (currentNode?.type === 'rest' || currentNode?.type === 'spring') {
          audioManager.playBgm('BGM_Campfire&Spring.mp3');
        } else if (currentNode?.type === 'shop') {
          audioManager.playBgm('BGM_shop.mp3');
        } else {
          audioManager.playBgm('BGM_Adventure.mp3');
        }
      }
    } else if (state.activeScreen === 'festival') {
      audioManager.playBgm('BGM_Harvest.mp3');
    } else if (state.activeScreen === 'ending') {
      audioManager.playBgm('BGM_Ending&Gallery.mp3');
    }
  }, [state.activeScreen, state.logs.length, state.adventure?.status, state.adventure?.currentNodeId]);
  
  // If no logs, the game hasn't started yet (still in initialization)
  if (state.logs.length === 0) {
    return (
      <>
        <SoundToggle />
        <StartScreen />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between py-6">
      <SoundToggle />
      
      {/* Dynamic Screen Routing */}
      {state.activeScreen === 'main' && <MainPanel />}
      {state.activeScreen === 'scheduler' && <Scheduler />}
      {state.activeScreen === 'execution' && <ExecutionScreen />}
      {state.activeScreen === 'store' && <StoreScreen />}
      {state.activeScreen === 'adventure' && <AdventureMap />}
      {state.activeScreen === 'ending' && <EndingScreen />}
      {state.activeScreen === 'festival' && <FestivalScreen />}

      {/* Narrative Dialogue Event Overlay */}
      <AVGDialog />
      
      {/* Footer copyright */}
      <footer className="text-center text-[10px] text-slate-600 mt-8 tracking-wider">
        © 2026 Princess Maker Web. Developed with Lucide React & Modern Glassmorphism.
      </footer>
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <CombatProvider>
        <GameContent />
      </CombatProvider>
    </GameProvider>
  );
}

export default App;
