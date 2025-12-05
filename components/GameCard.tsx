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

  if (!card) {
    return (
      <div className={`w-full h-96 rounded-2xl flex items-center justify-center ${theme === 'classic' ? 'bg-gray-100' : 'bg-wnrs-darkgrey'} opacity-50`}>
        <span className="text-sm font-medium">End of Deck</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] perspective-1000 cursor-pointer group" onClick={onFlip}>
      <motion.div
        className="w-full h-full relative transform-style-3d shadow-2xl rounded-2xl"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front of Card (Question) - Shows when FLIPPED (180deg) conceptually, but in code the 'front' face is usually 0deg. 
            However, user request says: "Clicking triggers flip... Front shows Question". 
            So 0deg = Back (Logo), 180deg = Front (Question). 
            Let's implement: 0deg = Logo (Back of physical card), 180deg = Text (Front of physical card).
        */}

        {/* The 'Back' (Logo side) - Initial State */}
        <div 
          className={`absolute w-full h-full rounded-2xl backface-hidden flex flex-col items-center justify-center ${backBg} ${backText}`}
        >
          <h1 className="text-6xl font-bold tracking-tighter">WNRS</h1>
          <p className="mt-4 text-xs tracking-widest uppercase opacity-80">Prawn Game Edition</p>
        </div>

        {/* The 'Front' (Question side) - Rotated 180 */}
        <div 
          className={`absolute w-full h-full rounded-2xl backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center ${frontBg} ${frontText}`}
        >
          {card.wildcard && (
            <div className="absolute top-6 right-6">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          )}
          
          <div className="flex-1 flex items-center justify-center">
             <h2 className="text-3xl font-bold leading-tight select-none">
              {card.text}
            </h2>
          </div>
          
          {card.wildcard && (
            <div className="absolute bottom-6 text-sm font-semibold uppercase tracking-widest border border-current px-3 py-1 rounded-full opacity-60">
              Wildcard
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};