export interface Question {
  id: number;
  text: string;
  wildcard?: boolean;
}

export type ViewState = 'setup' | 'game';
export type Theme = 'classic' | 'midnight';

export interface GameState {
  view: ViewState;
  players: string[];
  activePlayerIndex: number;
  deck: Question[];
  history: Question[];
  currentCard: Question | null;
  isFlipped: boolean;
  wildcardsEnabled: boolean;
}