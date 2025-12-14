
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sun, 
  Moon, 
  Dices, 
  X, 
  Settings, 
  Play,
  Sparkles
} from 'lucide-react';
import { QUESTIONS } from './constants';
import { Question, ViewState, Theme } from './types';
import { Button } from './components/Button';
import { GameCard } from './components/GameCard';

// Utils
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<Theme>('classic');
  const [view, setView] = useState<ViewState>('setup');
  
  // Player State
  const [players, setPlayers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);

  // Deck State
  const [deck, setDeck] = useState<Question[]>([]);
  const [history, setHistory] = useState<Question[]>([]);
  const [currentCard, setCurrentCard] = useState<Question | null>(null);
  
  // UI State
  const [isFlipped, setIsFlipped] = useState(false);
  const [wildcardsEnabled, setWildcardsEnabled] = useState(true);

  // --- Effects ---

  // Update Body Class for Theme
  useEffect(() => {
    if (theme === 'midnight') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F5F5F5';
    }
  }, [theme]);

  // --- Game Logic ---

  const initializeDeck = useCallback(() => {
    let filtered = wildcardsEnabled 
      ? QUESTIONS 
      : QUESTIONS.filter(q => !q.wildcard);
    
    const shuffled = shuffleArray(filtered);
    const first = shuffled.pop() || null;
    
    setDeck(shuffled);
    setCurrentCard(first);
    setHistory([]);
    setIsFlipped(false);
  }, [wildcardsEnabled]);

  const startGame = () => {
    if (players.length === 0) return;
    initializeDeck();
    setActivePlayerIndex(0);
    setView('game');
  };

  const addPlayer = () => {
    if (!inputValue.trim()) return;
    setPlayers(prev => [...prev, inputValue.trim()]);
    setInputValue('');
  };

  const removePlayer = (index: number) => {
    setPlayers(prev => prev.filter((_, i) => i !== index));
  };

  const shufflePlayers = () => {
    setPlayers(prev => shuffleArray(prev));
    setActivePlayerIndex(0);
  };

  const nextCard = () => {
    if (currentCard) {
      setHistory(prev => [...prev, currentCard]);
    }

    if (deck.length === 0) {
      alert("End of deck! Reshuffling...");
      initializeDeck();
      return;
    }

    const newDeck = [...deck];
    const next = newDeck.pop() || null;
    
    setDeck(newDeck);
    setCurrentCard(next);
    setIsFlipped(false); // Reset flip state for new card
    
    // Rotate player
    if (players.length > 0) {
      setActivePlayerIndex(prev => (prev + 1) % players.length);
    }
  };

  const prevCard = () => {
    if (history.length === 0) return;

    const newHistory = [...history];
    const previous = newHistory.pop() || null; 

    // Put current card back on top of deck
    if (currentCard) {
      setDeck(prev => [...prev, currentCard]);
    }

    setHistory(newHistory);
    setCurrentCard(previous);
    setIsFlipped(true); // Usually want to see the face when going back

    // Rotate player backwards
    if (players.length > 0) {
      setActivePlayerIndex(prev => (prev - 1 + players.length) % players.length);
    }
  };

  const toggleWildcards = () => {
    setWildcardsEnabled(prev => !prev);
  };

  // React to wildcard toggle while in game
  useEffect(() => {
    if (view === 'game') {
      initializeDeck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wildcardsEnabled]);


  // --- Render Helpers ---

  const currentPlayerName = players.length > 0 ? players[activePlayerIndex] : "Player";

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col transition-colors duration-500 ${theme === 'classic' ? 'text-black' : 'text-white'}`}>
      
      {/* Header - Fixed Height */}
      <header className="h-16 shrink-0 relative flex items-center justify-center z-20 px-4">
        {/* Title Centered via Flex + Absolute positioning of controls */}
        <span className={`font-bold text-xl tracking-tighter text-center ${theme === 'classic' ? 'text-wnrs-red' : 'text-white'}`}>
          PRAWN GAME
        </span>

        {/* Right Controls - Absolute to allow perfect centering of title */}
        <div className="absolute right-4 flex items-center gap-2">
          {view === 'game' && (
            <Button variant="icon" onClick={() => setView('setup')}>
              <Settings size={20} />
            </Button>
          )}
          <Button variant="icon" onClick={() => setTheme(prev => prev === 'classic' ? 'midnight' : 'classic')}>
            {theme === 'classic' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>
        </div>
      </header>

      {/* Main Content Area - Fills remaining height */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* SETUP VIEW */}
          {view === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center w-full max-w-md mx-auto p-6 relative"
            >
              {/* Centered Content Container - using flex-1 to push it to vertical center */}
              <div className="flex-1 flex flex-col items-center justify-center w-full -mt-20">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Who's playing?</h2>
                  <p className="opacity-60">Add everyone who's playing on this device.</p>
                </div>

                <div className="w-full flex gap-2 mb-8">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                    placeholder="Enter name..."
                    className={`flex-1 px-4 py-3 rounded-lg border-2 bg-transparent focus:outline-none focus:ring-2 transition-all
                      ${theme === 'classic' 
                        ? 'border-gray-200 focus:border-wnrs-red focus:ring-red-100' 
                        : 'border-gray-800 focus:border-white focus:ring-white/10'}`}
                  />
                  <Button onClick={addPlayer} disabled={!inputValue.trim()}>
                    Add
                  </Button>
                </div>

                {/* Player List - Centered under input, scrollable if long */}
                <div className="w-full max-h-[30vh] overflow-y-auto space-y-2 pr-2">
                  <AnimatePresence>
                    {players.map((p, i) => (
                      <motion.div
                        key={`${p}-${i}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`flex justify-between items-center p-3 rounded-lg ${theme === 'classic' ? 'bg-white shadow-sm border border-gray-100' : 'bg-wnrs-darkgrey'}`}
                      >
                        <span className="font-medium">{p}</span>
                        <button 
                          onClick={() => removePlayer(i)}
                          className="p-1 opacity-40 hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    ))}
                    {players.length === 0 && (
                      <div className="text-center opacity-40 py-2 italic text-sm">
                        No players added yet
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Button - Absolute positioned to stay at bottom regardless of center alignment */}
              <div className="absolute bottom-6 left-6 right-6 pb-safe">
                <Button fullWidth onClick={startGame} disabled={players.length === 0}>
                  <span className="flex items-center justify-center gap-2">
                    Start Game <Play size={18} fill="currentColor" />
                  </span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* GAME VIEW - 2 Column Grid for Desktop, Stack for Mobile */}
          {view === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // Use Grid for Desktop to ensure equal columns (50% / 50%)
              className="flex-1 flex flex-col md:grid md:grid-cols-2 w-full h-full max-w-7xl mx-auto p-4 md:p-8 gap-4 md:gap-0"
            >
              
              {/* --- LEFT / COLUMN 1: The Card --- */}
              {/* Flex centering for mobile. Grid alignment for Desktop. */}
              <div className="flex-1 md:h-full flex items-center justify-center relative min-h-0 min-w-0 md:p-8">
                 <GameCard 
                  card={currentCard} 
                  isFlipped={isFlipped} 
                  onFlip={() => setIsFlipped(prev => !prev)}
                  theme={theme}
                />
              </div>

              {/* --- RIGHT / COLUMN 2: Controls --- */}
              {/* Flex-col for mobile. Centered block for Desktop. */}
              <div className="shrink-0 w-full md:h-full flex flex-col justify-end md:justify-center md:items-center z-10 pb-safe">
                
                {/* Controls Container: Constrained width on desktop to prevent stretching */}
                <div className="w-full md:max-w-sm flex flex-col gap-4 md:gap-8">
                  
                  {/* Navigation Controls (Arrows) */}
                  <div className="order-1 flex items-center justify-between gap-4">
                    <Button 
                      variant="icon" 
                      onClick={prevCard} 
                      disabled={history.length === 0}
                      className="h-14 w-14 md:h-16 md:w-16 border border-current opacity-80 hover:opacity-100 disabled:opacity-20 flex items-center justify-center"
                    >
                      <ArrowLeft size={24} />
                    </Button>
                    
                    <div className="text-center">
                      <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-40">
                        {deck.length} Left
                      </span>
                    </div>

                    <Button 
                      variant="icon" 
                      onClick={nextCard}
                      className="h-14 w-14 md:h-16 md:w-16 bg-current text-current hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-lg"
                      style={{ 
                        backgroundColor: theme === 'classic' ? '#C31C23' : '#FFFFFF',
                        color: theme === 'classic' ? '#FFFFFF' : '#000000'
                      }}
                    >
                      <ArrowRight size={24} />
                    </Button>
                  </div>

                  {/* Turn Indicator */}
                  <div className={`order-2 flex flex-row md:flex-col justify-between md:justify-center items-center gap-2 md:gap-4 p-4 rounded-xl backdrop-blur-sm transition-colors
                     ${theme === 'classic' ? 'bg-white/50 md:bg-gray-50' : 'bg-white/5 md:bg-white/5'}`}>
                    <div className="flex flex-col md:text-center">
                      <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-50 mb-1">Current Turn</span>
                      <span className="text-xl md:text-3xl font-bold truncate max-w-[150px] md:max-w-full">{currentPlayerName}</span>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={shufflePlayers}
                      title="Shuffle Player Order"
                      className="flex items-center gap-2 text-xs md:text-sm whitespace-nowrap"
                    >
                      <Dices size={16} />
                      <span>Shuffle Order</span>
                    </Button>
                  </div>

                  {/* Deck Options Toggle */}
                  <div className={`order-3 p-3 md:p-4 rounded-xl flex items-center justify-between transition-colors
                    ${theme === 'classic' ? 'bg-gray-100' : 'bg-wnrs-darkgrey'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${wildcardsEnabled ? 'bg-yellow-400 text-black' : 'bg-gray-400 text-white'}`}>
                        <Sparkles size={16} />
                      </div>
                      <span className="font-medium text-sm">Wildcards</span>
                    </div>
                    
                    <button
                      onClick={toggleWildcards}
                      className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${wildcardsEnabled 
                          ? (theme === 'classic' ? 'bg-wnrs-red' : 'bg-white') 
                          : 'bg-gray-400'}`}
                    >
                      <motion.div
                        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
                        animate={{ x: wildcardsEnabled ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        style={{ backgroundColor: wildcardsEnabled && theme === 'midnight' ? 'black' : 'white' }}
                      />
                    </button>
                  </div>
                  
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
