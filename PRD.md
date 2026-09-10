# PRD: theprawngame

## Overview
A web-based social card game ("The Prawn Game") inspired by WNRS (We're Not Really Strangers). Players flip through a shuffled deck of question cards across seven categories designed to deepen connections. Features two themes, keyboard navigation, and category filtering. Deployed to Vercel.

## Goals
- Provide a digital card deck with categories derived from the question catalog (currently seven)
- Shuffle and present one card at a time with flip animation
- Allow forward/backward navigation through the deck
- Support two visual themes (classic light, midnight dark)
- Keyboard shortcuts for navigation

## Non-Goals
- Multiplayer networking or rooms
- Score tracking
- User accounts or card saving
- Custom question entry by users
- Mobile app (web only)

## User Stories
- As a group of friends, we want to play a card game that prompts meaningful conversation.
- As a player, I want to navigate back if I accidentally skipped a card.
- As a user who prefers dark mode, I want a midnight theme.
- As a player at a desk, I want to use keyboard arrows to flip through cards.

## Tech Stack
- **Language**: TypeScript / React
- **Build**: Vite
- **Animation**: native CSS card flip with reduced-motion support
- **Icons**: Lucide React
- **Styling**: native CSS following the Prawn Projects black/white, 3px-border and offset-shadow style; self-hosted Space Grotesk
- **Deployment**: Vercel

## Architecture
```
theprawngame/
├── App.tsx              # Main app — state, views, game logic
├── index.tsx            # React entry point
├── index.css            # Native CSS + theme variables
├── constants.ts         # Imports the question catalog
├── lib/game.ts          # Category selection, immutable deck transitions and shortcuts
├── types.ts             # TypeScript types (Question, ViewState, Theme, etc.)
└── components/
    ├── Button.tsx        # Reusable button with icon/full-width variants
    └── GameCard.tsx      # Semantic flip button with CSS animation
```

**State (in App.tsx):**
Deck, history, current card and reveal state are updated together as one session.
- `view: 'splash' | 'game'` — current screen
- `theme: 'classic' | 'midnight'` — visual theme
- `cardSets: CardSetOption[]` — checkbox state for every catalog category
- `deck: Question[]` — remaining cards (shuffled stack)
- `history: Question[]` — played cards (for back navigation)
- `currentCard: Question | null` — card being shown
- `isFlipped: boolean` — card flip state

## Features (detailed)

### Card Categories
| ID | Name | Description |
|---|---|---|
| `Wildcard` | Wildcards | Action prompts & dares |
| `Reflection` | Reflection | Self-discovery questions |
| `Perception` | Perception | How others see you |
| `Perspective` | Perspective | A different point of view |
| `Connection` | Connection | Relationship & bonding |
| `Family` | Family | Family-related questions |
| `Self-Love` | Self-Love | Self-care & compassion |

Each enabled category populates the deck; disabled categories are excluded. Options returns to category selection. Starting or shuffling again builds a new deck; the existing question records are preserved.

### Game Flow
1. **Splash view**: toggle card sets on/off, click "Start Game"
2. `initializeDeck()`: filter QUESTIONS by enabled categories, Fisher-Yates shuffle, pop first card
3. **Game view**: show `GameCard` with current card; click to flip
4. Next (→): push current to history, pop from deck
5. Prev (←): pop from history, push current back to deck
6. Deck empty: `currentCard = null` → deck finished state

### Card Flip Animation
- Native CSS transforms animate the brand/question faces.
- Reduced-motion preferences disable transitions.
- `isFlipped` controls both the visible face and its accessibility state.

### Keyboard Navigation
- `ArrowRight` → next card
- `ArrowLeft` → previous card
- `Space` / `Enter` → flip card
- Only active in game view outside interactive controls; modifiers, handled events, composition and held-key repeats pass through.
- Native buttons and checkboxes retain their normal keyboard behavior.

### Themes
- `classic`: white background (`#FFFFFF`), black text/borders (`#000000`), neutral gray detail
- `midnight`: dark background (`#0a0a0a`), white text/borders
- Toggle via Moon/Sun icon top-right; applied via `.dark` class on `documentElement`

## Data / Config
| File | Description |
|------|-------------|
| `constants.ts` | `QUESTIONS: Question[]` — all card content with category |
| `types.ts` | `Question {id, text, category}`, `CardSetOption {id, name, description, enabled}` |

## Deployment / Run
```bash
npm ci
npm run dev      # dev server
npm run build    # production build → dist/
```
Deployed on Vercel (auto-deploy from main branch).

## Constraints & Notes
- **Content**: all questions bundled from `questions.json` through `constants.ts` — no database or CMS
- **No persistence**: deck state is reset on page reload; no save/resume
- **Category selection**: returns through Options; starting a new deck resets progress
- **Native CSS**: uses shared theme variables, a local font asset and reduced-motion rules; no external runtime assets
