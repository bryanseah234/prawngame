import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const questions: { id: number; text: string; category: string }[] = JSON.parse(readFileSync(new URL('../../questions.json', import.meta.url), 'utf8'));
const perspectiveCount = questions.filter(question => question.category === 'Perspective').length;

async function start(page: Page) {
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show question', exact: true })).toBeVisible();
}

async function onlyPerspective(page: Page) {
  for (const box of await page.getByRole('checkbox').all()) await box.uncheck();
  await page.getByRole('checkbox', { name: 'Perspective', exact: true }).check();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeVisible();
});

test('all categories are available and checkboxes work by keyboard', async ({ page }) => {
  await expect(page.getByRole('checkbox')).toHaveCount(new Set(questions.map(question => question.category)).size);
  const option = page.getByRole('checkbox', { name: 'Perspective', exact: true });
  await expect(option).toBeChecked();
  await option.focus();
  await page.keyboard.press('Space');
  await expect(option).not.toBeChecked();
  await page.keyboard.press('Space');
  await expect(option).toBeChecked();
  for (const box of await page.getByRole('checkbox').all()) await box.uncheck();
  await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('Choose at least one');
});

test('the full deck and selected-category deck have the correct counts', async ({ page }) => {
  await start(page);
  await expect(page.locator('.deck-position')).toContainText('1 / ' + questions.length);
  await page.getByRole('button', { name: 'Card options', exact: true }).click();
  await onlyPerspective(page);
  await start(page);
  await expect(page.locator('.deck-position')).toContainText('1 / ' + perspectiveCount);
  await expect(page.locator('#card-category')).toHaveText('Perspective');
});

test('focused Next and Back buttons use Enter and Space without flipping the card', async ({ page }) => {
  await start(page);
  const flip = page.getByRole('button', { name: 'Show question', exact: true });
  await page.getByRole('button', { name: 'Next card', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.deck-position')).toContainText('2 / ');
  await expect(flip).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Space');
  await expect(page.locator('.deck-position')).toContainText('3 / ');
  await page.getByRole('button', { name: 'Previous card', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.deck-position')).toContainText('2 / ');
  await expect(flip).toHaveAttribute('aria-pressed', 'false');
});

test('theme and options buttons work from the keyboard in game view', async ({ page }) => {
  await start(page);
  const theme = page.getByRole('button', { name: 'Dark theme', exact: true });
  await theme.focus();
  await page.keyboard.press('Enter');
  await expect(theme).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveClass('dark');
  await page.keyboard.press('Space');
  await expect(theme).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Card options', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Start a conversation.' })).toBeFocused();
});

test('card activation flips exactly once and hides the other face from accessibility', async ({ page }) => {
  await start(page);
  const flip = page.getByRole('button', { name: 'Show question', exact: true });
  await flip.focus();
  await page.keyboard.press('Enter');
  await expect(flip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.card-front')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('.card-back')).toHaveAttribute('aria-hidden', 'true');
  await page.keyboard.press('Space');
  await expect(flip).toHaveAttribute('aria-pressed', 'false');
  await flip.click();
  await expect(flip).toHaveAttribute('aria-pressed', 'true');
});

test('page shortcuts navigate, but browser modifiers and focused controls retain their keys', async ({ page }) => {
  await start(page);
  await page.locator('#game-title').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.deck-position')).toContainText('2 / ');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.deck-position')).toContainText('1 / ');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Show question' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Shift+ArrowRight');
  await expect(page.locator('.deck-position')).toContainText('1 / ');
  await page.getByRole('button', { name: 'Dark theme', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.deck-position')).toContainText('1 / ');
});

test('the deck can finish, go back and restart', async ({ page }) => {
  await onlyPerspective(page);
  await start(page);
  await page.locator('#game-title').focus();
  for (let i = 0; i < perspectiveCount; i++) await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('heading', { name: 'That’s the deck.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next card', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Previous card', exact: true }).click();
  await expect(page.locator('.deck-position')).toContainText(perspectiveCount + ' / ' + perspectiveCount);
  await page.getByRole('button', { name: 'Next card', exact: true }).click();
  await page.getByRole('button', { name: 'Shuffle again', exact: true }).click();
  await expect(page.locator('.deck-position')).toContainText('1 / ' + perspectiveCount);
});

test('both themes fit the viewport and use only same-origin runtime assets', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const failures: string[] = [];
  const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(page.url()).origin) external.push(request.url()); });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(await fits()).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('setup.png'), fullPage: true });
  await start(page);
  await page.getByRole('button', { name: 'Show question' }).click();
  expect(await fits()).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('question-light.png'), fullPage: true });
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
  expect(await fits()).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('question-dark.png'), fullPage: true });
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  expect(external).toEqual([]);
  await expect(page.locator('.card-inner')).toHaveCSS('transition-duration', '0s');
});

test('every catalog prompt fits within the revealed card', async ({ page }) => {
  await start(page);
  await page.getByRole('button', { name: 'Show question', exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  // Exercise actual font/layout with the full catalog. The mutation is confined
  // to this disposable test page; the source catalog and app state are untouched.
  const overflowIds = await page.locator('.card-prompt').evaluate((element, catalog) => {
    const face = element.closest('.card-front') as HTMLElement;
    const original = element.textContent;
    const failures: number[] = [];
    try {
      for (const question of catalog) {
        element.textContent = question.text;
        if (face.scrollHeight > face.clientHeight + 1 || face.scrollWidth > face.clientWidth + 1) failures.push(question.id);
      }
    } finally {
      element.textContent = original;
    }
    return failures;
  }, questions);
  expect(overflowIds).toEqual([]);
});
