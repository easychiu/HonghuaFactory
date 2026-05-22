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
import { AVGDialog } from './components/AVGDialog';

const GameContent: React.FC = () => {
  const { state } = useGame();
  
  // If no logs, the game hasn't started yet (still in initialization)
  if (state.logs.length === 0) {
    return <StartScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between py-6">
      
      {/* Dynamic Screen Routing */}
      {state.activeScreen === 'main' && <MainPanel />}
      {state.activeScreen === 'scheduler' && <Scheduler />}
      {state.activeScreen === 'execution' && <ExecutionScreen />}
      {state.activeScreen === 'store' && <StoreScreen />}
      {state.activeScreen === 'adventure' && <AdventureMap />}
      {state.activeScreen === 'ending' && <EndingScreen />}

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
