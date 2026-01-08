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
  Zap
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

const DEFAULT_CARD_SETS: CardSetOption[] = [
  {
    id: 'wildcards',
    name: 'Wildcards',
    description: 'Fun action prompts & dares',
    enabled: true,
  },
  {
    id: 'deep',
    name: 'Deep Questions',
    description: 'Thought-provoking conversation starters',
    enabled: true,
  },
  {
    id: 'relationships',
    name: 'Relationships',
    description: 'Questions about connections & love',
    enabled: true,
  },
  {
    id: 'self-reflection',
    name: 'Self Reflection',
    description: 'Questions to understand yourself better',
    enabled: true,
  },
];

const getIconForCardSet = (id: string) => {
  switch (id) {
    case 'wildcards':
      return <Sparkles size={18} />;
    case 'deep':
      return <Zap size={18} />;
    case 'relationships':
      return <Heart size={18} />;
    case 'self-reflection':
      return <Users size={18} />;
    default:
      return <Sparkles size={18} />;
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
    const wildcardsEnabled = cardSets.find(s => s.id === 'wildcards')?.enabled ?? true;
    
    let filtered = wildcardsEnabled 
      ? QUESTIONS 
      : QUESTIONS.filter(q => !q.wildcard);
    
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

  const hasEnabledCardSet = cardSets.some(set => set.enabled);

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col transition-colors duration-500 ${theme === 'classic' ? 'text-black' : 'text-white'}`}>
      
      <header className="h-16 shrink-0 relative flex items-center justify-center z-20 px-4">
        <span className={`font-bold text-xl tracking-tighter text-center ${theme === 'classic' ? 'text-wnrs-red' : 'text-white'}`}>
          THE PRAWN GAME
        </span>

        <div className="absolute right-4 flex items-center gap-2">
          {view === 'game' && (
            <Button variant="icon" onClick={() => setView('splash')}>
              <Settings size={20} />
            </Button>
          )}
          <Button variant="icon" onClick={() => setTheme(prev => prev === 'classic' ? 'midnight' : 'classic')}>
            {theme === 'classic' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          
          {view === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center w-full max-w-md mx-auto p-6 relative"
            >
              <div className="flex-1 flex flex-col items-center justify-center w-full -mt-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Card Options</h2>
                  <p className="opacity-60">Choose which card sets to include in the game.</p>
                </div>

                <div className="w-full space-y-3">
                  {cardSets.map((cardSet) => (
                    <motion.div
                      key={cardSet.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl flex items-center justify-between transition-colors cursor-pointer
                        ${theme === 'classic' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-wnrs-darkgrey hover:bg-gray-800'}`}
                      onClick={() => toggleCardSet(cardSet.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full transition-colors ${
                          cardSet.enabled 
                            ? 'bg-wnrs-red text-white' 
                            : theme === 'classic' ? 'bg-gray-300 text-gray-500' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {getIconForCardSet(cardSet.id)}
                        </div>
                        <div>
                          <span className="font-medium block">{cardSet.name}</span>
                          <span className="text-xs opacity-60">{cardSet.description}</span>
                        </div>
                      </div>
                      
                      <button
                        className={`w-12 h-7 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2
                          ${cardSet.enabled 
                            ? (theme === 'classic' ? 'bg-wnrs-red' : 'bg-white') 
                            : 'bg-gray-400'}`}
                      >
                        <motion.div
                          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
                          animate={{ x: cardSet.enabled ? 20 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          style={{ backgroundColor: cardSet.enabled && theme === 'midnight' ? 'black' : 'white' }}
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 pb-safe">
                <Button fullWidth onClick={startGame} disabled={!hasEnabledCardSet}>
                  <span className="flex items-center justify-center gap-2">
                    Start Game <Play size={18} fill="currentColor" />
                  </span>
                </Button>
              </div>
            </motion.div>
          )}

          {view === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col w-full h-full max-w-7xl mx-auto p-4 md:p-8 gap-4"
            >
              
              <div className="flex-1 flex items-center justify-center relative min-h-0 min-w-0 p-4">
                <GameCard 
                  card={currentCard} 
                  isFlipped={isFlipped} 
                  onFlip={() => setIsFlipped(prev => !prev)}
                  theme={theme}
                />
              </div>

              <div className="shrink-0 w-full flex flex-col gap-4 pb-safe">
                
                <div className="flex items-center justify-center gap-6">
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

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;