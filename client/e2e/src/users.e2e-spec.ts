/* Autor: Christopher Lupton (FH Münster) */

import { Browser, BrowserContext, chromium, Page } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/users', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let userSession: UserSession;

  before(async () => {
    browser = await chromium.launch(config.launchOptions);
  });

  after(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
    userSession = new UserSession(context);
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
    await context.close();
  });

  it('should fill in form for user sign in', async () => {
    await page.goto(config.clientUrl('/users/sign-in'));
    await page.fill('app-sign-in #email', userSession.email);
    await page.fill('app-sign-in #password', userSession.password);

    expect(await page.inputValue('app-sign-in #email')).to.equal(userSession.email);
    expect(await page.inputValue('app-sign-in #password')).to.equal(userSession.password);
  });

  it('should fill form for create account', async () => {
    await page.goto(config.clientUrl('/users/sign-up'));
    await page.fill('app-sign-up #name', userSession.name);
    await page.fill('app-sign-up #email', userSession.email);
    await page.fill('app-sign-up #password', userSession.password);
    await page.fill('app-sign-up #password-check', userSession.password);

    expect(await page.inputValue('app-sign-up #name')).to.equal(userSession.name);
    expect(await page.inputValue('app-sign-up #email')).to.equal(userSession.email);
    expect(await page.inputValue('app-sign-up #password')).to.equal(userSession.password);
    expect(await page.inputValue('app-sign-up #password-check')).to.equal(userSession.password);
  });

  it('should render the Title to include "Hallo"', async () => {
    await page.goto(config.clientUrl('/users/profile'));
    const title = await page.textContent('app-user-details h1');
    expect(title).to.include('Hello');
  });

  it('check that create Account works, user profile should have userSession user information', async () => {
    await page.goto(config.clientUrl('users/profile'));

    expect(await page.inputValue('app-user-details #name')).to.equal(userSession.name);
    expect(await page.inputValue('app-user-details #email')).to.equal(userSession.email);
  });

  it('should render the Title "Password settings"', async () => {
    await page.goto(config.clientUrl('/users/changepassword'));
    const title = await page.textContent('app-user-change-password h1');
    expect(title).to.equal('Password settings');
  });

  it('should fill form for changing user password', async () => {
    const newPassword = '1234567890';

    await page.goto(config.clientUrl('/users/changepassword'));
    await page.fill('app-user-change-password #oldpassword', userSession.password);
    await page.fill('app-user-change-password #password', newPassword);
    await page.fill('app-user-change-password #password-check', newPassword);

    expect(await page.inputValue('app-user-change-password #oldpassword')).to.equal(userSession.password);
    expect(await page.inputValue('app-user-change-password #password')).to.equal(newPassword);
    expect(await page.inputValue('app-user-change-password #password-check')).to.equal(newPassword);
  });
});
