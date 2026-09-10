import type { CardSetOption, Question } from '../types.ts';

export interface Session {
  deck: Question[];
  history: Question[];
  currentCard: Question | null;
  isFlipped: boolean;
}

const descriptions: Record<string, string> = {
  Wildcard: 'Fun action prompts and dares',
  Reflection: 'Questions for self-discovery',
  Perception: 'How others see you',
  Perspective: 'A different point of view',
  Connection: 'Relationships and shared stories',
  Family: 'The people who shaped you',
  'Self-Love': 'Self-care and compassion',
};

export function cardSetOptions(questions: Question[]): CardSetOption[] {
  const categories = new Set(questions.flatMap(q => q.category ? [q.category] : []));
  const known = Object.keys(descriptions);
  const ordered = [...known.filter(id => categories.has(id)),
    ...[...categories].filter(id => !known.includes(id)).sort()];
  return ordered.map(id => ({
    id, name: id === 'Wildcard' ? 'Wildcards' : id,
    description: known.includes(id) ? descriptions[id] : 'More questions to explore', enabled: true,
  }));
}

export function selectedQuestions(questions: Question[], options: CardSetOption[]): Question[] {
  const enabled = new Set(options.filter(option => option.enabled).map(option => option.id));
  return questions.filter(question => question.category ? enabled.has(question.category) : enabled.size > 0);
}

export function startSession(questions: Question[], random = Math.random): Session {
  const deck = [...questions];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return { deck, history: [], currentCard: deck.pop() ?? null, isFlipped: false };
}

export function nextSession(session: Session): Session {
  if (!session.currentCard) return session;
  const deck = [...session.deck];
  return { deck, history: [...session.history, session.currentCard],
    currentCard: deck.pop() ?? null, isFlipped: false };
}

export function previousSession(session: Session): Session {
  if (!session.history.length) return session;
  const history = [...session.history];
  return { deck: session.currentCard ? [...session.deck, session.currentCard] : session.deck,
    history, currentCard: history.pop() ?? null, isFlipped: false };
}

export function flipSession(session: Session): Session {
  return session.currentCard ? { ...session, isFlipped: !session.isFlipped } : session;
}

interface ShortcutEvent {
  key: string;
  repeat?: boolean;
  defaultPrevented?: boolean;
  isComposing?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

export function shortcutAction(event: ShortcutEvent, interactive: boolean) {
  if (interactive || event.repeat || event.defaultPrevented || event.isComposing ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null;
  if (event.key === 'ArrowRight') return 'next';
  if (event.key === 'ArrowLeft') return 'previous';
  if (event.key === 'Enter' || event.key === ' ') return 'flip';
  return null;
}
