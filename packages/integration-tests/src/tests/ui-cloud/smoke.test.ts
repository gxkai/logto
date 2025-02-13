import { appendPath } from '@silverhand/essentials';

import { logtoCloudUrl as logtoCloudUrlString, logtoConsoleUrl } from '#src/constants.js';
import { generatePassword } from '#src/utils.js';

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
// Tip: See https://github.com/argos-ci/jest-puppeteer/blob/main/packages/expect-puppeteer/README.md
// for convenient expect methods
describe('smoke testing for cloud', () => {
  const consoleUsername = 'admin';
  const consolePassword = generatePassword();
  const logtoCloudUrl = new URL(logtoCloudUrlString);
  const adminTenantUrl = new URL(logtoConsoleUrl); // In dev mode, the console URL is actually for admin tenant

  it('can open with app element and navigate to register page', async () => {
    await page.goto(logtoCloudUrl.href);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await expect(page.waitForSelector('#app')).resolves.not.toBeNull();
    expect(page.url()).toBe(appendPath(adminTenantUrl, '/register').href);
  });

  it('can register the first admin account', async () => {
    await expect(page).toClick('button', { text: 'Create account' });

    await expect(page).toFill('input[name=identifier]', consoleUsername);
    await expect(page).toClick('button[name=submit]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url()).toBe(appendPath(adminTenantUrl, '/register/password').href);

    await expect(page).toFillForm('form', {
      newPassword: consolePassword,
      confirmPassword: consolePassword,
    });
    await expect(page).toClick('button[name=submit]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    expect(page.url()).toBe(logtoCloudUrl.href);
  });

  it('shows a tenant-select page with two tenants', async () => {
    const tenantsWrapper = await page.waitForSelector('div[class$=wrapper]');

    await expect(tenantsWrapper).toMatchElement('a:nth-of-type(1)', { text: 'default' });
    await expect(tenantsWrapper).toMatchElement('a:nth-of-type(2)', { text: 'admin' });
  });

  it('can create another tenant', async () => {
    await expect(page).toClick('button', { text: 'Create' });

    await page.waitForTimeout(1000);
    const tenants = await page.$$('div[class$=wrapper] > a');
    expect(tenants.length).toBe(3);
  });

  it('can enter the tenant just created', async () => {
    const button = await page.waitForSelector('div[class$=wrapper] > a:last-of-type');
    const tenantId = await button.evaluate((element) => element.textContent);

    await button.click();

    // Wait for our beautiful logo to show up
    await page.waitForSelector('div[class$=topbar] > svg[viewbox][class$=logo]');
    expect(page.url()).toBe(new URL(`/${tenantId ?? ''}/onboarding/welcome`, logtoCloudUrl).href);
  });

  it('can sign out of admin console', async () => {
    await expect(page).toClick('div[class$=topbar] > div[class$=container]');

    // Try awaiting for 500ms before clicking sign-out button
    await page.waitForTimeout(500);

    await expect(page).toClick(
      '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownItem]:last-child'
    );
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    expect(page.url()).toBe(new URL('sign-in', logtoConsoleUrl).href);
  });

  it('can create another account', async () => {
    const newUsername = 'another_admin';
    const newPassword = generatePassword();

    await expect(page).toClick('a', { text: 'Create account' });
    await expect(page).toMatchElement('button', { text: 'Create account' });
    await expect(page).toFill('input[name=identifier]', newUsername);
    await expect(page).toClick('button[name=submit]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url()).toBe(new URL('/register/password', logtoConsoleUrl).href);

    await expect(page).toFillForm('form', {
      newPassword,
      confirmPassword: newPassword,
    });

    await expect(page).toClick('button[name=submit]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    expect(page.url().startsWith(logtoCloudUrl.href)).toBeTruthy();
    expect(new URL(page.url()).pathname.endsWith('/onboarding/welcome')).toBeTruthy();
  });
});
