import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cardSetOptions, selectedQuestions, startSession, nextSession, previousSession,
  flipSession, shortcutAction } from '../lib/game.ts';

const catalog = JSON.parse(readFileSync(new URL('../questions.json', import.meta.url), 'utf8'));
const cards = [1, 2, 3].map(id => ({ id, text: 'Synthetic prompt ' + id, category: 'Fixture' }));

test('every category in the real catalog can be selected, including Perspective', () => {
  const options = cardSetOptions(catalog);
  assert.deepEqual(new Set(options.map(option => option.id)), new Set(catalog.map(question => question.category)));
  assert(options.some(option => option.id === 'Perspective'));
  assert.equal(new Set(catalog.map(question => question.id)).size, catalog.length);
});

test('all enabled categories preserve the entire catalog', () => {
  assert.deepEqual(selectedQuestions(catalog, cardSetOptions(catalog)), catalog);
});

test('a single selected category excludes the other categories', () => {
  const options = cardSetOptions(catalog).map(option => ({ ...option, enabled: option.id === 'Perspective' }));
  assert.deepEqual(selectedQuestions(catalog, options), catalog.filter(question => question.category === 'Perspective'));
});

test('no selected categories yields an empty deck', () => {
  assert.deepEqual(selectedQuestions(catalog, cardSetOptions(catalog).map(option => ({ ...option, enabled: false }))), []);
});

test('uncategorized prompts follow the existing any-enabled-category rule', () => {
  const input = [...cards, { id: 4, text: 'Uncategorized synthetic prompt' }];
  const options = cardSetOptions(input);
  assert.deepEqual(selectedQuestions(input, options), input);
  assert.deepEqual(selectedQuestions(input, options.map(option => ({ ...option, enabled: false }))), []);
});

test('future categories get a selectable option without editing a fixed list', () => {
  for (const category of ['New category', 'constructor', '__proto__']) {
    const option = cardSetOptions([{ id: 1, text: 'Fixture', category }])[0];
    assert.equal(option.id, category);
    assert.equal(typeof option.description, 'string');
  }
});

test('shuffle preserves every question and leaves the input unchanged', () => {
  const original = [...cards];
  const session = startSession(cards, () => 0);
  assert.deepEqual(cards, original);
  assert.deepEqual(new Set([...session.deck, session.currentCard]), new Set(cards));
  assert.equal(session.history.length, 0);
  assert.equal(session.isFlipped, false);
});

test('forward traversal visits every card once and reaches the end', () => {
  let session = startSession(cards, () => 0);
  const seen = [];
  while (session.currentCard) {
    seen.push(session.currentCard.id);
    session = nextSession(session);
  }
  assert.equal(new Set(seen).size, cards.length);
  assert.equal(session.deck.length, 0);
  assert.deepEqual(session.history.map(card => card.id), seen);
  assert.equal(nextSession(session), session);
  assert.equal(flipSession(session), session);
});

test('back then forward restores the same next card without changing source state', () => {
  const first = startSession(cards, () => 0);
  const firstSnapshot = structuredClone(first);
  const second = flipSession(nextSession(first));
  const back = previousSession(second);
  assert.equal(back.currentCard.id, first.currentCard.id);
  assert.equal(back.isFlipped, false);
  assert.equal(nextSession(back).currentCard.id, second.currentCard.id);
  assert.deepEqual(first, firstSnapshot);
});

test('back from the end restores the final card and can finish again', () => {
  let session = startSession(cards, () => 0);
  for (let i = 0; i < cards.length; i++) session = nextSession(session);
  const previous = previousSession(session);
  assert.equal(previous.currentCard.id, session.history.at(-1).id);
  assert.equal(previous.deck.length, 0);
  assert.deepEqual(nextSession(previous), session);
});

test('first-card back and empty sessions are stable', () => {
  const initial = startSession(cards);
  assert.equal(previousSession(initial), initial);
  const empty = startSession([]);
  assert.equal(previousSession(empty), empty);
  assert.equal(nextSession(empty), empty);
  assert.equal(flipSession(empty), empty);
});

test('flip changes only the revealed state', () => {
  const initial = startSession(cards);
  const flipped = flipSession(initial);
  assert.equal(flipped.currentCard, initial.currentCard);
  assert.equal(flipped.deck, initial.deck);
  assert.equal(flipped.history, initial.history);
  assert.equal(flipped.isFlipped, true);
  assert.deepEqual(flipSession(flipped), initial);
});

test('page shortcuts choose the expected action', () => {
  for (const [key, action] of [['ArrowRight', 'next'], ['ArrowLeft', 'previous'], ['Enter', 'flip'], [' ', 'flip']]) {
    assert.equal(shortcutAction({ key }, false), action);
  }
  assert.equal(shortcutAction({ key: 'Escape' }, false), null);
});

test('focused controls, modifiers, repeat, composition and handled events keep their keys', () => {
  for (const key of ['ArrowRight', 'ArrowLeft', 'Enter', ' ']) {
    assert.equal(shortcutAction({ key }, true), null);
    for (const flag of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'repeat', 'isComposing', 'defaultPrevented']) {
      assert.equal(shortcutAction({ key, [flag]: true }, false), null);
    }
  }
});
