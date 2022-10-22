/* Autor: Lukas Behnke (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './earnings.css';

interface Earning {
  id: string;
  title: string;
  amount: number;
  category: string;
}

interface SumUserMonthEarning {
  id: string;
  totalSum: string;
  salary: string;
  rental: string;
  dividend: string;
  refund: string;
  gift: string;
  other: string;
}

@customElement('app-earnings')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EarningsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() month!: string;

  @property() year!: string;

  @state() private earnings: Earning[] = [];

  @query('#monthInput')
  private monthInput!: HTMLInputElement;

  async firstUpdated() {
    this.updateValues();
  }

  async updateValues() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('/earnings/' + this.month + '/' + this.year + location.search);
      this.earnings = (await response.json()).results;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit();
    }
  }

  render() {
    return html` <div class="header-container">
        <span id="previous" @click="${() => this.previousMonth(Number(this.month), Number(this.year))}"></span>
        <input type="month" id="monthInput" name="monthInput" value="${this.year}-${this.month}" />
        <button type="button" id="choose" @click="${this.choose}">choose</button>
        <span id="next" @click="${() => this.nextMonth(Number(this.month), Number(this.year))}"></span>
      </div>
      <div class="container-big">
        <div class="container firstline">
          <h3 id="heading" class="heading">Earnings</h3>
          <div class="child buttons">
            <button type="button" id="goToOverview" @click="${this.goToOverview}">Go to Overview</button>
            <button type="button" @click="${this.addEarning}">Add</button>
          </div>
        </div>
        <div class="childs-container">${this.getData()}</div>
      </div>`;
  }

  //returns the entries of the Data and print one row, with 'No Entries', when no Entry exists
  getData() {
    if (this.earnings.length == 0) {
      return html`<app-earning> <span slot="no-entries">${'No Entries'}</span> </app-earning>`;
    } else {
      return repeat(
        this.earnings,
        earning => earning.id,
        earning => html` <app-earning
          id="line"
          @appearningremoveclick=${() => this.removeEarning(earning)}
          @appearningclick=${() => this.showEarningDetails(earning)}
        >
          <span slot="title">${earning.title}</span>
          <span slot="amount">€${earning.amount}</span>
          <span slot="category">${earning.category}</span>
        </app-earning>`
      );
    }
  }
  async removeEarning(earningToRemove: Earning) {
    try {
      this.earnings = this.earnings.filter(earning => earning.id !== earningToRemove.id);
      const response = await httpClient.get('/sumsUserMonthEarnings/' + this.month + '/' + this.year);
      const earningsSum: SumUserMonthEarning = await response.json();
      earningsSum.totalSum = String(Number(earningsSum.totalSum) - Number(earningToRemove.amount));
      if (earningToRemove.category == 'salary')
        earningsSum.salary = String(Number(earningsSum.salary) - Number(earningToRemove.amount));
      if (earningToRemove.category == 'rental')
        earningsSum.rental = String(Number(earningsSum.rental) - Number(earningToRemove.amount));
      if (earningToRemove.category == 'dividend')
        earningsSum.dividend = String(Number(earningsSum.dividend) - Number(earningToRemove.amount));
      if (earningToRemove.category == 'gift')
        earningsSum.gift = String(Number(earningsSum.gift) - Number(earningToRemove.amount));
      if (earningToRemove.category == 'refund')
        earningsSum.refund = String(Number(earningsSum.refund) - Number(earningToRemove.amount));
      if (earningToRemove.category == 'other')
        earningsSum.other = String(Number(earningsSum.other) - Number(earningToRemove.amount));
      await httpClient.delete('/earnings/' + earningToRemove.id);
      await httpClient.patch('/sumsUserMonthEarnings/' + earningsSum.id, earningsSum);
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async goToOverviewPage() {
    router.navigate('/overview/' + this.month + '/' + this.year);
  }

  async previousMonth(month: number, year: number) {
    if (month == 1) {
      this.month = '12';
      this.year = String(year - 1);
    }
    if (month != 1) {
      if (month <= 10) this.month = '0' + String(month - 1);
      else this.month = String(month - 1);
    }
    this.monthInput.value = this.year + '-' + this.month;
    router.navigate('earnings/' + this.month + '/' + this.year);
    await this.updateValues();
  }

  async nextMonth(month: number, year: number) {
    if (month == 12) {
      this.month = '01';
      this.year = String(year + 1);
    }
    if (month != 12) {
      if (month < 9) this.month = '0' + String(month + 1);
      else this.month = String(month + 1);
    }
    this.monthInput.value = this.year + '-' + this.month;
    router.navigate('earnings/' + this.month + '/' + this.year);
    await this.updateValues();
  }

  async choose() {
    this.month = this.monthInput.value.substring(5);
    this.year = this.monthInput.value.substring(0, 4);
    router.navigate('earnings/' + this.month + '/' + this.year);
    this.updateValues();
  }

  async goToOverview() {
    router.navigate('overview/' + this.month + '/' + this.year);
  }

  async showEarningDetails(earning: Earning) {
    router.navigate(`/earnings-details/${earning.id}`);
  }

  async addEarning() {
    router.navigate('earnings-add/' + this.month + '/' + this.year);
  }
}
