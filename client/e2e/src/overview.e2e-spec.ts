/* Autor: Lukas Behnke (FH Münster) */

import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { expect } from 'chai';
import { UserSession } from './user-session.js';
import config from './config.js';

describe('/overview', () => {
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

  it('should render by default overview page for the current month and year', async () => {
    await page.goto(config.clientUrl('/'));
    expect(await page.locator('app-overview').count()).to.equal(1);
    let month = String(new Date().getMonth() + 1);
    if (Number(month) < 10) month = '0' + month;
    const year = new Date().getFullYear();
    expect(await page.inputValue('app-overview #monthInput')).to.equal(year + '-' + month);
  });

  it('should render overview, two doughnut-charts and snippets(with "No Entries") for earnings and expenditures', async () => {
    await page.goto(config.clientUrl('/overview/05/2022'));
    expect(await page.locator('app-overview').count()).to.equal(1);
    expect(await page.locator('app-doughnut-chart').count()).to.equal(2);
    expect(await page.locator('app-snippet').count()).to.equal(2);
    expect(await page.textContent('app-snippet:nth-of-type(1) h3')).to.equal('Earnings');
    expect(await page.textContent('app-snippet:nth-of-type(1) span[slot="no-entries"]')).to.equal('No Entries');

    expect(await page.textContent('app-snippet:nth-of-type(2) h3')).to.equal('Expenditures');
    expect(await page.textContent('app-snippet:nth-of-type(2) span[slot="no-entries"]')).to.equal('No Entries');
  });

  it('should can add a new earning on "add" and update Earningssum', async () => {
    await page.goto(config.clientUrl('/overview/04/2022'));
    await page.click('app-snippet:nth-of-type(1) button:nth-of-type(2)');
    await page.fill('app-earning-details #title', 'Test 1');
    await page.fill('app-earning-details #amount', '41');
    await page.selectOption('app-earning-details select#category', { label: 'Salary' });
    await page.fill('app-earning-details #creationDate', '2022-04-12');
    await Promise.all([page.waitForResponse('**'), await page.click('app-earning-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Go to Overview')]);
    await page.waitForSelector('app-overview');
    expect(await page.textContent('app-overview #earningsSumTotal')).to.include('€41');
  });

  it('should can add a new expenditure on "add" and update Expenditures', async () => {
    await page.goto(config.clientUrl('/overview/04/2022'));
    await page.click('app-snippet:nth-of-type(2) button:nth-of-type(2)');
    await page.fill('app-expenditure-details #title', 'Test 1');
    await page.fill('app-expenditure-details #amount', '20');
    await page.selectOption('app-expenditure-details select#category', { label: 'Health' });
    await page.fill('app-expenditure-details #creationDate', '2022-04-12');
    await Promise.all([page.waitForResponse('**'), await page.click('app-expenditure-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Go to Overview')]);

    await page.waitForSelector('app-overview');
    expect(await page.textContent('app-overview #expendituresSumTotal')).to.include('€20');
  });

  it('savings should be the difference between earningsSum and expendituresSum', async () => {
    const expenditureAmount = 52.12;
    const earningAmount = 14.59;

    await page.goto(config.clientUrl('/overview/04/2022'));
    await page.click('app-snippet:nth-of-type(2) button:nth-of-type(2)');
    await page.fill('app-expenditure-details #title', 'Test 1');
    await page.fill('app-expenditure-details #amount', String(expenditureAmount));
    await page.selectOption('app-expenditure-details select#category', { label: 'Health' });
    await page.fill('app-expenditure-details #creationDate', '2022-04-12');
    await Promise.all([page.waitForResponse('**'), await page.click('app-expenditure-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Go to Overview')]);

    await page.click('app-snippet:nth-of-type(1) button:nth-of-type(2)');
    await page.fill('app-earning-details #title', 'Test 1');
    await page.fill('app-earning-details #amount', String(earningAmount));
    await page.selectOption('app-earning-details select#category', { label: 'Salary' });
    await page.fill('app-earning-details #creationDate', '2022-04-12');
    await Promise.all([page.waitForResponse('**'), await page.click('app-earning-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Go to Overview')]);
    await page.setDefaultTimeout(3000);
    await page.waitForSelector('app-overview');
    expect(await page.textContent('app-overview #savings')).to.include('€' + String(earningAmount - expenditureAmount));
  });

  it('should only render the 5 last added entries in snippet', async () => {
    await page.goto(config.clientUrl('/overview/04/2022'));
    await page.click('app-snippet:nth-of-type(1) button:nth-of-type(2)');
    await page.fill('app-earning-details #title', 'Test 1');
    await page.fill('app-earning-details #amount', '20');
    await page.selectOption('app-earning-details select#category', { label: 'Salary' });
    await page.fill('app-earning-details #creationDate', '2022-04-30');
    await Promise.all([page.waitForResponse('**'), await page.click('app-earning-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Add')]);

    await page.fill('app-earning-details #title', 'Test 2');
    await page.fill('app-earning-details #amount', '20');
    await page.selectOption('app-earning-details select#category', { label: 'Dividend' });
    await page.fill('app-earning-details #creationDate', '2022-04-17');
    await Promise.all([page.waitForResponse('**'), await page.click('app-earning-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Add')]);

    await page.fill('app-earning-details #title', 'Test 3');
    await page.fill('app-earning-details #amount', '20');
    await page.selectOption('app-earning-details select#category', { label: 'Other' });
    await page.fill('app-earning-details #creationDate', '2022-04-01');
    await Promise.all([page.waitForResponse('**'), await page.click('app-earning-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Add')]);

    await page.fill('app-earning-details #title', 'Test 4');
    await page.fill('app-earning-details #amount', '20');
    await page.selectOption('app-earning-details select#category', { label: 'Refund' });
    await page.fill('app-earning-details #creationDate', '2022-04-12');
    await Promise.all([page.waitForResponse('**'), await page.click('app-earning-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Add')]);

    await page.fill('app-earning-details #title', 'Test 5');
    await page.fill('app-earning-details #amount', '20');
    await page.selectOption('app-earning-details select#category', { label: 'Other' });
    await page.fill('app-earning-details #creationDate', '2022-04-12');
    await Promise.all([page.waitForResponse('**'), await page.click('app-earning-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Add')]);

    await page.fill('app-earning-details #title', 'Test 6');
    await page.fill('app-earning-details #amount', '20');
    await page.selectOption('app-earning-details select#category', { label: 'Salary' });
    await page.fill('app-earning-details #creationDate', '2022-04-22');
    await Promise.all([page.waitForResponse('**'), await page.click('app-earning-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('text=Add')]);

    await page.fill('app-earning-details #title', 'Test 7');
    await page.fill('app-earning-details #amount', '20');
    await page.selectOption('app-earning-details select#category', { label: 'Salary' });
    await page.fill('app-earning-details #creationDate', '2022-04-19');
    await Promise.all([page.waitForResponse('**'), await page.click('app-earning-details #save')]);
    await Promise.all([page.waitForResponse('**'), await page.click('#goToOverview')]);
    await page.setDefaultTimeout(3000);
    await page.waitForSelector('app-snippet');
    expect(
      await page.textContent('app-snippet:nth-of-type(1) app-earning:nth-of-type(1) span[slot="title"]:nth-of-type(1)')
    ).to.include('Test 3');
    expect(await page.locator('app-snippet app-earning').count()).to.equal(5);
    expect(
      await page.textContent('app-snippet:nth-of-type(1) app-earning:nth-of-type(5) span[slot="title"]:nth-of-type(1)')
    ).to.include('Test 7');
  });
});
