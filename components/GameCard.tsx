import { Sparkles } from 'lucide-react';
import type { Question } from '../types';

interface GameCardProps {
  card: Question | null;
  isFlipped: boolean;
  onFlip: () => void;
}

export function GameCard({ card, isFlipped, onFlip }: GameCardProps) {
  if (!card) return <div className="empty-deck"><span aria-hidden="true">🦐</span><p>More stories next time.</p></div>;

  return (
    <button className="game-card" type="button" onClick={onFlip} aria-label="Show question"
      aria-pressed={isFlipped} aria-describedby={isFlipped ? 'card-question' : 'card-category'}>
      <span className={'card-inner' + (isFlipped ? ' is-revealed' : '')} key={card.id}>
        <span className="card-face card-back" aria-hidden={isFlipped}>
          <span className="card-category" id="card-category">{card.category || 'Question'}</span>
          <span className="card-brand"><span aria-hidden="true">🦐</span>THE PRAWN<br />GAME</span>
          <span className="card-hint">Tap to reveal a question</span>
        </span>
        <span className="card-face card-front" aria-hidden={!isFlipped}>
          <span className="card-category">{card.category || 'Question'}{card.wildcard && <Sparkles aria-hidden="true" />}</span>
          <span className="card-prompt" id="card-question">{card.text}</span>
          <span className="card-hint">Take your time. Tap to turn over.</span>
        </span>
      </span>
    </button>
  );
}
