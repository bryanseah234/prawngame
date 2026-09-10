import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Moon, Sun, Settings, Play } from 'lucide-react';
import { QUESTIONS } from './constants';
import type { Theme, ViewState } from './types';
import { Button } from './components/Button';
import { GameCard } from './components/GameCard';
import { cardSetOptions, selectedQuestions, startSession, nextSession, previousSession,
  flipSession, shortcutAction } from './lib/game';

const DEFAULT_CARD_SETS = cardSetOptions(QUESTIONS);
const INTERACTIVE = 'button, a, input, select, textarea, summary, [role="button"], [role="checkbox"], [role="switch"], [contenteditable]:not([contenteditable="false"])';

export default function App() {
  const [theme, setTheme] = useState<Theme>('classic');
  const [view, setView] = useState<ViewState>('splash');
  const [cardSets, setCardSets] = useState(DEFAULT_CARD_SETS);
  const [session, setSession] = useState(() => startSession([]));
  const heading = useRef<HTMLHeadingElement>(null);
  const chosen = selectedQuestions(QUESTIONS, cardSets);
  const total = session.deck.length + session.history.length + (session.currentCard ? 1 : 0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'midnight');
    document.documentElement.style.colorScheme = theme === 'midnight' ? 'dark' : 'light';
  }, [theme]);

  useEffect(() => { heading.current?.focus(); }, [view]);

  useEffect(() => {
    if (view !== 'game') return;
    const onKeyDown = (event: KeyboardEvent) => {
      const interactive = event.target instanceof Element && Boolean(event.target.closest(INTERACTIVE));
      const action = shortcutAction(event, interactive);
      if (!action) return;
      event.preventDefault();
      setSession(action === 'next' ? nextSession : action === 'previous' ? previousSession : flipSession);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view]);

  const start = () => {
    if (!chosen.length) return;
    setSession(startSession(chosen));
    setView('game');
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to game</a>
      <header className="site-header">
        <a className="brand" href="https://theprawnprojects.vercel.app/" aria-label="The Prawn Projects">
          <span aria-hidden="true">🦐</span><span>THE PRAWN<br />GAME</span>
        </a>
        <div className="header-actions">
          {view === 'game' && <Button variant="secondary" onClick={() => setView('splash')} aria-label="Card options">
            <Settings aria-hidden="true" /><span>Options</span>
          </Button>}
          <Button variant="secondary" onClick={() => setTheme(value => value === 'classic' ? 'midnight' : 'classic')}
            aria-label="Dark theme" aria-pressed={theme === 'midnight'}>
            {theme === 'classic' ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
            <span className="theme-label">{theme === 'classic' ? 'Dark' : 'Light'}</span>
          </Button>
        </div>
      </header>

      <main id="main">
        {view === 'splash' ? (
          <section className="setup-layout screen-enter" aria-labelledby="setup-title">
            <div className="setup-intro">
              <p className="eyebrow">A card game for real conversations</p>
              <h1 id="setup-title" ref={heading} tabIndex={-1}>Start a<br />conversation.</h1>
              <p className="intro-copy">Choose your card sets, then take turns revealing a question. Skip any prompt you like.</p>
              <p className="catalog-total">{QUESTIONS.length.toLocaleString()} prompts <span aria-hidden="true">/</span> {cardSets.length} card sets</p>
              <p className="quiet-note">Play together on one screen. Your deck resets when you reload.</p>
            </div>
            <div className="setup-controls">
              <fieldset>
                <legend>Choose your card sets</legend>
                <div className="category-list">
                  {cardSets.map(option => (
                    <label className={'category-option' + (option.enabled ? ' is-selected' : '')} key={option.id}>
                      <input type="checkbox" checked={option.enabled}
                        onChange={() => setCardSets(current => current.map(item => item.id === option.id ? { ...item, enabled: !item.enabled } : item))}
                        aria-labelledby={'label-' + option.id} aria-describedby={'description-' + option.id} />
                      <span className="category-copy">
                        <span className="category-name" id={'label-' + option.id}>{option.name}</span>
                        <span className="category-description" id={'description-' + option.id}>{option.description}</span>
                      </span>
                      <span className="category-count" aria-label={QUESTIONS.filter(q => q.category === option.id).length + ' prompts'}>
                        {QUESTIONS.filter(q => q.category === option.id).length}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <p className="selection-status" role="status">
                {chosen.length ? chosen.length.toLocaleString() + ' prompts in your deck' : 'Choose at least one card set to start.'}
              </p>
              <Button fullWidth onClick={start} disabled={!chosen.length}>
                Start game <Play aria-hidden="true" />
              </Button>
            </div>
          </section>
        ) : (
          <section className="game-layout screen-enter" aria-labelledby="game-title">
            <div className="game-intro">
              <h1 id="game-title" ref={heading} tabIndex={-1}>{session.currentCard ? 'One card. Take your time.' : 'That’s the deck.'}</h1>
              <p>{session.currentCard ? 'Reveal a question, share a story, or skip to the next.' : 'Go back to a favourite, shuffle again, or choose different card sets.'}</p>
            </div>
            <GameCard card={session.currentCard} isFlipped={session.isFlipped}
              onFlip={() => setSession(flipSession)} />
            <nav className="card-navigation" aria-label="Browse cards">
              <Button variant="secondary" onClick={() => setSession(previousSession)}
                disabled={!session.history.length} aria-label="Previous card">
                <ArrowLeft aria-hidden="true" /><span>Back</span>
              </Button>
              <p className="deck-position" role="status" aria-live="polite">
                <strong>{session.currentCard ? session.history.length + 1 : total} / {total}</strong>
                <span>{session.deck.length} left</span>
              </p>
              <Button onClick={() => setSession(nextSession)} disabled={!session.currentCard} aria-label="Next card">
                <span>Next</span><ArrowRight aria-hidden="true" />
              </Button>
            </nav>
            {!session.currentCard && <Button className="restart-button" onClick={start}>Shuffle again</Button>}
            <p className="keyboard-hint">Use ← / → to browse, or Tab to a control. Enter / Space reveals a card; focused controls keep their usual keys.</p>
          </section>
        )}
      </main>
      <footer className="site-footer"><span>BUILT WITH 🦐 POWER</span><a href="https://theprawnprojects.vercel.app/">More Prawn projects <ArrowRight aria-hidden="true" /></a></footer>
    </div>
  );
}
