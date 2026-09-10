# Agent State

Portfolio upkeep, 2026-09-11. Working from deployed/main d3c1fa8 in an isolated
checkout; preserve the original checkout's existing .gitignore edit.

Task list for this pass:
- [x] Map production and reproduce focused-button keyboard failures.
- [x] Confirm all 1,425 question records and the missing 107-card Perspective category.
- [x] Repair keyboard handling, semantic controls and complete category selection.
- [x] Apply the Prawn Projects visual style, self-host the font and reduce unused UI code.
- [x] Verify type checking, deck transitions, browser workflows, preserved data and build size.
- [ ] Release to production and verify both public aliases against the exact commit.

This is a static browser game with no backend, account flow or persistent saves.
Keep question data intact. Review source and production evidence before claiming
the broader portfolio, free-tier or UI requirements complete.

Local evidence: fourteen unit checks, the first twenty-four browser scenarios,
and six final layout/catalog checks passed at 1440, 390 and 320 pixels.
All 1,425 prompts fit the revealed card; the question file is unchanged.
Type checking and production build pass. JavaScript is about 25.7% smaller;
the dependency audit reports zero known vulnerabilities. The same full suite
of twenty-seven browser checks is configured for hosted CI. Production release
and both-alias verification remain pending.
