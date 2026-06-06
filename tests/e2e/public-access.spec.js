const { test, expect } = require('@playwright/test');

test('public user can enter the application and open mood tracker', async ({ page }) => {
  await page.goto('/auth-choice');
  await page.getByRole('button', { name: 'Continue as Public' }).click();
  await expect(page).toHaveURL('/');
  await page.getByRole('button', { name: /Mood/ }).click();
  await expect(page.getByText('How are you feeling today?')).toBeVisible();
});

test('health endpoint is available', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
});
