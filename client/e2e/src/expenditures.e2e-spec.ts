/* Autor: Lukas Behnke (FH Münster) */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/expenditures', () => {
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

  it('should render the title "Expenditures"', async () => {
    await page.goto(config.clientUrl('/expenditures/05/2022'));
    const title = await page.textContent('app-expenditures h3');
    expect(title).to.equal('Expenditures');
  });

  it('should add a new expenditure', async () => {
    await page.goto(config.clientUrl('/expenditures-add/05/2022'));
    await page.fill('app-expenditure-details #title', 'Test 1');
    await page.fill('app-expenditure-details #amount', '12');
    await page.selectOption('app-expenditure-details select#category', { label: 'Other' });
    await page.fill('app-expenditure-details #creationDate', '2022-05-12');
    await page.click('app-expenditure-details #save');
    await Promise.all([page.waitForResponse('**'), await page.waitForSelector('app-expenditure span[slot="title"]')]);
    expect(await page.textContent('app-expenditure span[slot="title"]')).to.equal('Test 1');
  });

  it('should render No Entries Placeholder and set input month value', async () => {
    await page.goto(config.clientUrl('/expenditures/05/2022'));
    expect(await page.textContent('app-expenditure span[slot="no-entries"]')).to.equal('No Entries');
    expect(await page.inputValue('app-expenditures #monthInput')).to.equal('2022-05');
  });

  it('should can use next Month and previous Month on navigation bar', async () => {
    await page.goto(config.clientUrl('/expenditures/11/2022'));
    await page.click('app-expenditures #next');
    expect(await page.inputValue('app-expenditures #monthInput')).to.equal('2022-12');
    expect(page.url()).to.include('/expenditures/12/2022');

    await page.click('app-expenditures #next');
    expect(await page.inputValue('app-expenditures #monthInput')).to.equal('2023-01');
    expect(page.url()).to.include('/expenditures/01/2023');

    await page.click('app-expenditures #previous');
    expect(await page.inputValue('app-expenditures #monthInput')).to.equal('2022-12');
    expect(page.url()).to.include('/expenditures/12/2022');
  });

  it('should can set month and year in input-navigations and render monthly expenditures', async () => {
    await page.goto(config.clientUrl('/expenditures-add/05/2022'));
    await page.fill('app-expenditure-details #title', 'Test 1');
    await page.fill('app-expenditure-details #amount', '12');
    await page.selectOption('app-expenditure-details select#category', { label: 'Other' });
    await page.fill('app-expenditure-details #creationDate', '2022-05-12');
    await Promise.all([page.waitForResponse('**'), await page.click('app-expenditure-details #save')]);

    expect(await page.inputValue('app-expenditures #monthInput')).to.equal('2022-05');
    await page.fill('app-expenditures #monthInput', '2018-08');
    await Promise.all([page.waitForResponse('**'), await page.click('app-expenditures #choose')]);
    expect(await page.textContent('app-expenditure span[slot="no-entries"]')).to.equal('No Entries');

    expect(await page.inputValue('app-expenditures #monthInput')).to.equal('2018-08');
    await page.fill('app-expenditures #monthInput', '2022-05');
    await Promise.all([page.waitForResponse('**'), await page.click('app-expenditures #choose')]);

    expect(await page.inputValue('app-expenditures #monthInput')).to.equal('2022-05');
    expect(page.url()).to.include('/expenditures/05/2022');
    expect(await page.textContent('app-expenditure span[slot="title"]')).to.equal('Test 1');
  });

  it('should delete an expenditure', async () => {
    await page.goto(config.clientUrl('/expenditures-add/05/2022'));
    await page.fill('app-expenditure-details #title', 'Test 1');
    await page.fill('app-expenditure-details #amount', '12');
    await page.selectOption('select#category', { label: 'Insurance' });
    await page.fill('app-expenditure-details #creationDate', '2022-05-12');
    await Promise.all([page.waitForResponse('**'), await page.click('app-expenditure-details #save')]);
    await page.waitForSelector('app-expenditure');
    await page.hover('app-expenditure');
    await Promise.all([page.waitForResponse('**'), await page.click('app-expenditure .remove-expenditure')]);
    expect(await page.locator('app-expenditure').count()).to.equal(1);
    expect(await page.textContent('app-expenditure span[slot="no-entries"]')).to.equal('No Entries');
  });

  it('should go to expenditure-details on click and load the values', async () => {
    await page.goto(config.clientUrl('/expenditures-add/05/2022'));
    await page.fill('app-expenditure-details #title', 'Test 1');
    await page.fill('app-expenditure-details #amount', '12');
    await page.selectOption('select#category', { label: 'Insurance' });
    await page.fill('app-expenditure-details #creationDate', '2022-05-12');
    await Promise.all([page.waitForResponse('**'), await page.click('app-expenditure-details #save')]);

    await page.waitForSelector('app-expenditure');
    await page.hover('app-expenditure');
    await Promise.all([page.waitForResponse('**'), await page.click('app-expenditure span[slot="title"]')]);

    expect(await page.inputValue('app-expenditure-details #title')).to.equal('Test 1');
    expect(await page.inputValue('app-expenditure-details #amount')).to.equal('12');
    expect(await page.inputValue('app-expenditure-details #category')).to.equal('insurance');
    expect(await page.inputValue('app-expenditure-details #creationDate')).to.equal('2022-05-12');
  });
});
