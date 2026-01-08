export interface Question {
  id: number;
  text: string;
  wildcard?: boolean;
  category?: string;
}

export type ViewState = 'splash' | 'game';
export type Theme = 'classic' | 'midnight';

export interface CardSetOption {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon?: string;
}

export interface GameState {
  view: ViewState;
  deck: Question[];
  history: Question[];
  currentCard: Question | null;
  isFlipped: boolean;
  cardSets: CardSetOption[];
}