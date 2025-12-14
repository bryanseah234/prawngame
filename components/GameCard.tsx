import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Question } from '../types';

interface GameCardProps {
  card: Question | null;
  isFlipped: boolean;
  onFlip: () => void;
  theme: 'classic' | 'midnight';
}

export const GameCard: React.FC<GameCardProps> = ({ card, isFlipped, onFlip, theme }) => {
  // Classic Theme Colors
  const classicFrontBg = "bg-white";
  const classicFrontText = "text-wnrs-red";
  const classicBackBg = "bg-wnrs-red";
  const classicBackText = "text-white";

  // Midnight Theme Colors
  const midnightFrontBg = "bg-wnrs-darkgrey border border-gray-800";
  const midnightFrontText = "text-white";
  const midnightBackBg = "bg-black border border-gray-800";
  const midnightBackText = "text-gray-400";

  const frontBg = theme === 'classic' ? classicFrontBg : midnightFrontBg;
  const frontText = theme === 'classic' ? classicFrontText : midnightFrontText;
  const backBg = theme === 'classic' ? classicBackBg : midnightBackBg;
  const backText = theme === 'classic' ? classicBackText : midnightBackText;

  const getFontSizeClass = (textLength: number) => {
    if (textLength <= 50) return "text-3xl md:text-5xl";
    if (textLength <= 100) return "text-2xl md:text-4xl";
    if (textLength <= 180) return "text-xl md:text-3xl";
    return "text-lg md:text-2xl";
  };

  if (!card) {
    return (
      <div className={`w-full h-full aspect-[3/4] max-h-[600px] rounded-2xl flex items-center justify-center ${theme === 'classic' ? 'bg-gray-100' : 'bg-wnrs-darkgrey'} opacity-50`}>
        <span className="text-sm font-medium">End of Deck</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000 cursor-pointer group p-4" onClick={onFlip}>
      <motion.div
        // Key triggers re-render animation when card changes
        key={card.id}
        // Use aspect ratio to maintain card shape, scale to fit container (h-full/w-auto or w-full/h-auto)
        className="w-auto h-full aspect-[3/4] max-h-full max-w-full relative transform-style-3d shadow-2xl rounded-2xl"
        // Start slightly smaller and transparent. Match rotation to current state to avoid unwanted flip on load.
        initial={{ scale: 0.95, opacity: 0, rotateY: isFlipped ? 180 : 0 }}
        animate={{ scale: 1, opacity: 1, rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* The 'Back' (Logo side) - Initial State */}
        <div 
          className={`absolute inset-0 rounded-2xl backface-hidden flex flex-col items-center justify-center ${backBg} ${backText}`}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">WNRS</h1>
          <p className="mt-4 text-xs tracking-widest uppercase opacity-80">Prawn Edition</p>
        </div>

        {/* The 'Front' (Question side) - Rotated 180 */}
        <div 
          className={`absolute inset-0 rounded-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 md:p-10 text-center ${frontBg} ${frontText}`}
        >
          {card.wildcard && (
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
            </div>
          )}
          
          <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
             <h2 className={`${getFontSizeClass(card.text.length)} font-bold leading-tight select-none w-full break-words`}>
              {card.text}
            </h2>
          </div>
          
          {card.wildcard && (
            <div className="absolute bottom-6 text-xs md:text-sm font-semibold uppercase tracking-widest border border-current px-3 py-1 rounded-full opacity-60">
              Wildcard
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};