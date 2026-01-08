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
  const classicFrontBg = "bg-white";
  const classicFrontText = "text-wnrs-red";
  const classicBackBg = "bg-wnrs-red";
  const classicBackText = "text-white";

  const midnightFrontBg = "bg-wnrs-darkgrey border border-gray-800";
  const midnightFrontText = "text-white";
  const midnightBackBg = "bg-black border border-gray-800";
  const midnightBackText = "text-gray-400";

  const frontBg = theme === 'classic' ? classicFrontBg : midnightFrontBg;
  const frontText = theme === 'classic' ? classicFrontText : midnightFrontText;
  const backBg = theme === 'classic' ? classicBackBg : midnightBackBg;
  const backText = theme === 'classic' ? classicBackText : midnightBackText;

  const getFontSizeClass = (textLength: number) => {
    if (textLength <= 40) return "text-lg md:text-3xl lg:text-4xl";
    if (textLength <= 80) return "text-base md:text-2xl lg:text-3xl";
    if (textLength <= 120) return "text-sm md:text-xl lg:text-2xl";
    if (textLength <= 180) return "text-xs md:text-lg lg:text-xl";
    return "text-xs md:text-base lg:text-lg";
  };

  if (!card) {
    return (
      <div className={`w-full h-full aspect-[4/3] max-w-[800px] max-h-[500px] rounded-2xl flex items-center justify-center ${theme === 'classic' ? 'bg-gray-100' : 'bg-wnrs-darkgrey'} opacity-50`}>
        <span className="text-sm font-medium">End of Deck</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000 cursor-pointer group" onClick={onFlip}>
      <motion.div
        key={card.id}
        className="w-full h-auto aspect-[4/3] max-w-[800px] max-h-[500px] relative transform-style-3d shadow-2xl rounded-2xl"
        initial={{ scale: 0.95, opacity: 0, rotateY: isFlipped ? 180 : 0 }}
        animate={{ scale: 1, opacity: 1, rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
      >
        <div 
          className={`absolute inset-0 rounded-2xl backface-hidden flex flex-col items-center justify-center ${backBg} ${backText}`}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">WNRS</h1>
          <p className="mt-2 md:mt-4 text-xs tracking-widest uppercase opacity-80">Prawn Edition</p>
        </div>

        <div 
          className={`absolute inset-0 rounded-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-4 md:p-8 lg:p-10 text-center ${frontBg} ${frontText}`}
        >
          {card.wildcard && (
            <div className="absolute top-3 right-3 md:top-4 md:right-4">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            </div>
          )}
          
          <div className="flex-1 flex items-center justify-center w-full overflow-hidden px-2 md:px-4">
            <h2 className={`${getFontSizeClass(card.text.length)} font-bold leading-snug md:leading-tight select-none w-full break-words`}>
              {card.text}
            </h2>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
};