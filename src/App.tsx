import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { StartScreen } from './components/StartScreen';
import { MainScreen } from './components/MainScreen';
import { SchedulerScreen } from './components/SchedulerScreen';
import { ExecutionScreen } from './components/ExecutionScreen';
import { StoreScreen } from './components/StoreScreen';
import { AdventureScreen } from './components/AdventureScreen';
import { EndingScreen } from './components/EndingScreen';
import { DialogOverlay } from './components/DialogOverlay';

const GameContent: React.FC = () => {
  const { state } = useGame();
  
  // If no logs, the game hasn't started yet (still in initialization)
  if (state.logs.length === 0) {
    return <StartScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between py-6">
      
      {/* Dynamic Screen Routing */}
      {state.activeScreen === 'main' && <MainScreen />}
      {state.activeScreen === 'scheduler' && <SchedulerScreen />}
      {state.activeScreen === 'execution' && <ExecutionScreen />}
      {state.activeScreen === 'store' && <StoreScreen />}
      {state.activeScreen === 'adventure' && <AdventureScreen />}
      {state.activeScreen === 'ending' && <EndingScreen />}

      {/* Narrative Dialogue Event Overlay */}
      <DialogOverlay />
      
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
      <GameContent />
    </GameProvider>
  );
}

export default App;
