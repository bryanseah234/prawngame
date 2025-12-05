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
  Users,
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

  // Initialize Logic
  useEffect(() => {
    // Load players from local storage
    const savedPlayers = localStorage.getItem('wnrs_players');
    if (savedPlayers) {
      try {
        setPlayers(JSON.parse(savedPlayers));
      } catch (e) {
        console.error("Failed to parse players", e);
      }
    }
  }, []);

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

  // Persist players
  useEffect(() => {
    localStorage.setItem('wnrs_players', JSON.stringify(players));
  }, [players]);

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
      // Logic for end of deck - maybe reshuffle history? 
      // For now, just keep current null or reset
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
    const previous = newHistory.pop() || null; // The card we are going back to

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
    // Requirement: Toggling immediately reshuffles
    // We defer the actual logic to useEffect or call it directly. 
    // Since state update is async, we can't call initializeDeck immediately with new state.
    // However, initializeDeck depends on wildcardsEnabled. 
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
    <div className={`min-h-screen transition-colors duration-500 flex flex-col ${theme === 'classic' ? 'text-black' : 'text-white'}`}>
      
      {/* Header */}
      <header className="p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-xl tracking-tighter ${theme === 'classic' ? 'text-wnrs-red' : 'text-white'}`}>
            PRAWN GAME
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="icon" onClick={() => setTheme(prev => prev === 'classic' ? 'midnight' : 'classic')}>
            {theme === 'classic' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>
          {view === 'game' && (
            <Button variant="icon" onClick={() => setView('setup')}>
              <Settings size={20} />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* SETUP VIEW */}
          {view === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2">Who's playing?</h2>
                <p className="opacity-60">Add everyone who's playing on this device.</p>
              </div>

              <div className="flex gap-2 mb-6">
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

              <div className="flex-1 overflow-y-auto mb-6 space-y-2 max-h-[40vh]">
                <AnimatePresence>
                  {players.map((p, i) => (
                    <motion.div
                      key={`${p}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
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
                    <div className="text-center opacity-40 py-8 italic">
                      No players added yet
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-auto">
                <Button fullWidth onClick={startGame} disabled={players.length === 0}>
                  <span className="flex items-center justify-center gap-2">
                    Start Game <Play size={18} fill="currentColor" />
                  </span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* GAME VIEW */}
          {view === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col"
            >
              {/* Turn Indicator */}
              <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-widest uppercase opacity-50 mb-1">Current Turn</span>
                  <span className="text-2xl font-bold truncate max-w-[200px]">{currentPlayerName}</span>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={shufflePlayers}
                  title="Shuffle Player Order"
                  className="flex items-center gap-2 text-sm"
                >
                  <Dices size={18} />
                  <span>Shuffle</span>
                </Button>
              </div>

              {/* Card Area */}
              <div className="flex-1 flex items-center justify-center mb-8">
                <GameCard 
                  card={currentCard} 
                  isFlipped={isFlipped} 
                  onFlip={() => setIsFlipped(prev => !prev)}
                  theme={theme}
                />
              </div>

              {/* Controls Footer */}
              <div className="mt-auto space-y-6">
                
                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                  <Button 
                    variant="icon" 
                    onClick={prevCard} 
                    disabled={history.length === 0}
                    className="h-14 w-14 border border-current opacity-80 hover:opacity-100 disabled:opacity-20"
                  >
                    <ArrowLeft size={24} />
                  </Button>
                  
                  <div className="text-center">
                    <span className="text-xs font-bold tracking-widest uppercase opacity-40">
                      {deck.length} Left
                    </span>
                  </div>

                  <Button 
                    variant="icon" 
                    onClick={nextCard}
                    className="h-14 w-14 bg-current text-current inverse-text hover:scale-105 active:scale-95 transition-transform"
                    style={{ 
                      backgroundColor: theme === 'classic' ? '#C31C23' : '#FFFFFF',
                      color: theme === 'classic' ? '#FFFFFF' : '#000000'
                    }}
                  >
                    <ArrowRight size={24} />
                  </Button>
                </div>

                {/* Deck Options */}
                <div className={`p-4 rounded-xl flex items-center justify-between transition-colors
                  ${theme === 'classic' ? 'bg-gray-100' : 'bg-wnrs-darkgrey'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${wildcardsEnabled ? 'bg-yellow-400 text-black' : 'bg-gray-400 text-white'}`}>
                      <Sparkles size={16} />
                    </div>
                    <span className="font-medium text-sm">Wildcards</span>
                  </div>
                  
                  {/* Custom Toggle Switch */}
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
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;