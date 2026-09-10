# The Prawn Game

A shared-screen conversation card game. Choose your card sets, reveal a prompt,
and take turns sharing a story. The current catalog contains 1,425 prompts
across seven categories, including Perspective.

## Playing

- Select categories with the checkboxes, then choose **Start game**.
- Select the card to reveal or hide its question. **Back** and **Next** browse
  without changing your selected categories.
- At the end, go back to a favourite or choose **Shuffle again**.
- **Options** returns to category selection; starting again creates a new deck.
- **Dark theme** switches between the Prawn light and midnight appearances.

Tab moves between controls; Enter and Space activate focused buttons, and Space
changes a focused checkbox. From the game page outside an interactive control,
Left/Right browse cards and Enter/Space reveal the current card. Modified keys,
key repeats and input composition are left alone. Reduced-motion preferences
make the card flip immediate.

The deck runs in browser memory and resets on reload. There are no accounts,
networked rooms, player tracking or saved sessions. Question data is bundled
from `questions.json`; play does not query Supabase or call a server API.

## Development

Use Node.js 24 or newer:

```sh
npm ci
npm test
npm run build
npm run dev
```

The build includes TypeScript checking. React renders the views, native CSS
handles layout and card transitions, and Lucide supplies icons. Space Grotesk
is bundled locally; the page has no external font, script or stylesheet request.

## Browser checks

```sh
npx playwright install chromium
npm run build
npm run test:browser
```

The suite checks category selection, focused-button activation, page shortcuts,
card faces, deck completion/restart, both themes and same-origin runtime assets
at 1440px, 390px and 320px. It starts a temporary local preview server and closes
it afterward. Set `PRAWN_GAME_BASE_URL` to a deployed URL to run the same browser
flows against a release. Tests change only their own page's in-memory game state.

## Data and deployment

Keep `questions.json` intact when changing the interface. Category options are
built from the catalog so additional categories remain reachable. The existing
Vercel project builds from `main`; hashed assets keep their long-lived cache
headers. A release should verify its exact deployment commit and public assets.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
The bundled Space Grotesk font retains its [SIL Open Font License](public/space-grotesk-license.txt).
