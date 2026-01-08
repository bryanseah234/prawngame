import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Settings,
  Play,
  Sparkles,
  Heart,
  Users,
  Eye,
  Home
} from 'lucide-react';
import { QUESTIONS } from './constants';
import { Question, ViewState, Theme, CardSetOption } from './types';
import { Button } from './components/Button';
import { GameCard } from './components/GameCard';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Updated to match your questions.json categories
const DEFAULT_CARD_SETS: CardSetOption[] = [
  {
    id: 'Wildcard',
    name: 'Wildcards',
    description: 'Fun action prompts & dares',
    enabled: true,
  },
  {
    id: 'Reflection',
    name: 'Reflection',
    description: 'Self-discovery questions',
    enabled: true,
  },
  {
    id: 'Perception',
    name: 'Perception',
    description: 'How others see you',
    enabled: true,
  },
  {
    id: 'Connection',
    name: 'Connection',
    description: 'Relationship & bonding',
    enabled: true,
  },
  {
    id: 'Family',
    name: 'Family',
    description: 'Family-related questions',
    enabled: true,
  },
  {
    id: 'Self-Love',
    name: 'Self-Love',
    description: 'Self-care & compassion',
    enabled: true,
  },
];

const getIconForCardSet = (id: string) => {
  switch (id) {
    case 'Wildcard':
      return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />;
    case 'Reflection':
      return <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />;
    case 'Perception':
      return <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />;
    case 'Connection':
      return <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />;
    case 'Family':
      return <Home className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />;
    case 'Self-Love':
      return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />;
    default:
      return <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />;
  }
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('classic');
  const [view, setView] = useState<ViewState>('splash');
  const [cardSets, setCardSets] = useState<CardSetOption[]>(DEFAULT_CARD_SETS);
  const [deck, setDeck] = useState<Question[]>([]);
  const [history, setHistory] = useState<Question[]>([]);
  const [currentCard, setCurrentCard] = useState<Question | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (theme === 'midnight') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0a';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F5F5F5';
    }
  }, [theme]);

  const initializeDeck = useCallback(() => {
    const enabledCategories = cardSets
      .filter(s => s.enabled)
      .map(s => s.id);

    // Filter questions by enabled categories
    let filtered = QUESTIONS.filter(q => {
      if (q.category) {
        return enabledCategories.includes(q.category);
      }
      // If no category, include if any category is enabled
      return enabledCategories.length > 0;
    });

    const shuffled = shuffleArray(filtered);
    const first = shuffled.pop() || null;

    setDeck(shuffled);
    setCurrentCard(first);
    setHistory([]);
    setIsFlipped(false);
  }, [cardSets]);

  const startGame = () => {
    initializeDeck();
    setView('game');
  };

  const toggleCardSet = (id: string) => {
    setCardSets(prev => prev.map(set =>
      set.id === id ? { ...set, enabled: !set.enabled } : set
    ));
  };

  const nextCard = () => {
    if (!currentCard) return;

    setHistory(prev => [...prev, currentCard]);

    if (deck.length > 0) {
      const nextDeck = [...deck];
      const next = nextDeck.pop() || null;
      setDeck(nextDeck);
      setCurrentCard(next);
      setIsFlipped(false);
    } else {
      setCurrentCard(null);
    }
  };

  const prevCard = () => {
    if (history.length === 0) return;

    const previousHistory = [...history];
    const previousCard = previousHistory.pop();
    setHistory(previousHistory);

    if (currentCard) {
      setDeck(prev => [...prev, currentCard]);
    }

    setCurrentCard(previousCard || null);
    setIsFlipped(false);
  };

  useEffect(() => {
    if (view === 'game') {
      initializeDeck();
    }
  }, [cardSets]);

  // Keyboard navigation for game view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'game') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevCard();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, nextCard, prevCard]);

  const hasEnabledCardSet = cardSets.some(set => set.enabled);

  return (
    <div className={`min-h-screen min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col transition-colors duration-500 hide-scrollbar ${theme === 'classic' ? 'text-black bg-[#F5F5F5]' : 'text-white bg-[#0a0a0a]'}`}>

      <header className="h-12 sm:h-14 lg:h-16 shrink-0 sticky top-0 z-20 flex items-center justify-center px-4 sm:px-6 backdrop-blur-sm bg-inherit">
        {/* Settings icon - top left (only in game view) */}
        <div className="absolute left-3 sm:left-4 lg:left-6">
          {view === 'game' && (
            <Button variant="icon" className="p-2 sm:p-2.5 lg:p-3" onClick={() => setView('splash')}>
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            </Button>
          )}
        </div>

        {/* Title - centered */}
        <span className={`font-bold text-lg sm:text-xl lg:text-2xl tracking-tighter text-center ${theme === 'classic' ? 'text-wnrs-red' : 'text-white'}`}>
          THE PRAWN GAME
        </span>

        {/* Theme toggle - top right */}
        <div className="absolute right-3 sm:right-4 lg:right-6">
          <Button variant="icon" className="p-2 sm:p-2.5 lg:p-3" onClick={() => setTheme(prev => prev === 'classic' ? 'midnight' : 'classic')}>
            {theme === 'classic' ? <Moon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" /> : <Sun className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col">
        <AnimatePresence mode="wait">

          {view === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto px-4 sm:px-6 py-4 sm:py-6"
            >
              {/* Options and button grouped together */}
              <div className="w-full flex flex-col items-center">
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">Card Options</h2>
                  <p className="opacity-60 text-sm sm:text-base lg:text-lg">Choose which card sets to include.</p>
                </div>

                <div className="w-full space-y-2 sm:space-y-3 lg:space-y-4">
                  {cardSets.map((cardSet) => (
                    <motion.div
                      key={cardSet.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl flex items-center justify-between transition-colors cursor-pointer
                        ${theme === 'classic' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-wnrs-darkgrey hover:bg-gray-800'}`}
                      onClick={() => toggleCardSet(cardSet.id)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`p-2 sm:p-2.5 lg:p-3 rounded-full transition-colors ${cardSet.enabled
                          ? 'bg-wnrs-red text-white'
                          : theme === 'classic' ? 'bg-gray-300 text-gray-500' : 'bg-gray-700 text-gray-400'
                          }`}>
                          {getIconForCardSet(cardSet.id)}
                        </div>
                        <span className="font-medium text-sm sm:text-base lg:text-lg">{cardSet.name}</span>
                      </div>

                      <button
                        className={`w-10 h-6 sm:w-12 sm:h-7 lg:w-14 lg:h-8 rounded-full transition-colors relative focus:outline-none
                          ${cardSet.enabled
                            ? (theme === 'classic' ? 'bg-wnrs-red' : 'bg-white')
                            : 'bg-gray-400'}`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full shadow-sm transition-all duration-200 ease-out
                            ${cardSet.enabled ? 'left-[calc(100%-0.125rem)] -translate-x-full' : 'left-0.5 translate-x-0'}`}
                          style={{ backgroundColor: cardSet.enabled && theme === 'midnight' ? 'black' : 'white' }}
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Start Game button directly below options */}
                <div className="w-full mt-4 sm:mt-6 lg:mt-8">
                  <Button fullWidth onClick={startGame} disabled={!hasEnabledCardSet} className="py-4 sm:py-5 lg:py-6 text-base sm:text-lg lg:text-xl">
                    <span className="flex items-center justify-center gap-2 sm:gap-3">
                      Start Game <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="currentColor" />
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-3 py-4 sm:py-6"
            >
              {/* Card and controls grouped together */}
              <div className="w-full flex flex-col items-center">
                <GameCard
                  card={currentCard}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(prev => !prev)}
                  theme={theme}
                />

                {/* Navigation buttons directly below card */}
                <div className="mt-4 sm:mt-6 lg:mt-8 flex items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                  <Button
                    variant="icon"
                    onClick={prevCard}
                    disabled={history.length === 0}
                    className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 border border-current opacity-80 hover:opacity-100 disabled:opacity-20 flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </Button>

                  <div className="text-center min-w-[50px] sm:min-w-[60px] lg:min-w-[70px]">
                    <span className="text-[10px] sm:text-xs lg:text-sm font-bold tracking-widest uppercase opacity-40">
                      {deck.length} Left
                    </span>
                  </div>

                  <Button
                    variant="icon"
                    onClick={nextCard}
                    className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: theme === 'classic' ? '#C31C23' : '#FFFFFF',
                      color: theme === 'classic' ? '#FFFFFF' : '#000000'
                    }}
                  >
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="shrink-0 py-3 sm:py-4 text-center pb-safe">
        <span className={`text-[10px] sm:text-xs lg:text-sm font-bold tracking-[0.2em] uppercase ${theme === 'classic' ? 'text-gray-400' : 'text-gray-600'}`}>
          BUILT WITH <span className="text-wnrs-red">🦐</span> POWER
        </span>
      </footer>
    </div>
  );
};

export default App;
