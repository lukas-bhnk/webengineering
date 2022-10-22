/* Autor: Lukas Behnke (FH Münster) */

import { Chart } from 'chart.js';
import { stat } from 'fs';
import { LitElement, html } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { loadConfigFromFile, transformWithEsbuild } from 'vite';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './overview.css';

interface Earning {
  id: string;
  title: string;
  category: string;
  creationDate: string;
  description: string;
  amount: string;
}

interface Expenditure {
  id: string;
  title: string;
  category: string;
  creationDate: string;
  description: string;
  amount: string;
}

interface SumUserMonthEarning {
  month: string;
  year: string;
  totalSum: number;
  salary: number;
  rental: number;
  dividend: number;
  refund: number;
  gift: number;
  other: number;
}

interface SumUserMonthExpenditure {
  totalSum: number;
  rent: number;
  house: number;
  leisure: number;
  food: number;
  clothes: number;
  travel: number;
  insurance: number;
  health: number;
  other: number;
  month: string;
  year: string;
}

@customElement('app-overview')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class OverviewComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];
  @property() month!: string;

  @property() year!: string;

  @query('#monthInput')
  private monthInput!: HTMLInputElement;

  @state() private expendituresSum: SumUserMonthExpenditure = {
    month: this.month,
    year: this.year,
    totalSum: 0,
    rent: 0,
    house: 0,
    leisure: 0,
    food: 0,
    clothes: 0,
    travel: 0,
    insurance: 0,
    health: 0,
    other: 0
  };

  @state() private earningsSum: SumUserMonthEarning = {
    month: this.month,
    year: this.year,
    totalSum: 0,
    salary: 0,
    rental: 0,
    dividend: 0,
    refund: 0,
    gift: 0,
    other: 0
  };

  @state() private earnings: Earning[] = [];

  @state() private expenditures: Expenditure[] = [];

  async connectedCallback() {
    super.connectedCallback();
    await this.updateValues();
  }

  async updateValues() {
    try {
      this.startAsyncInit();
      const responseEarnings = await httpClient.get('/sumsUserMonthEarnings/' + this.month + '/' + this.year);
      const responseLatestEarnings = await httpClient.get(
        '/earnings/latestFiveEntries/' + this.month + '/' + this.year + location.search
      );
      const responseExpenditures = await httpClient.get('/sumsUserMonthExpenditures/' + this.month + '/' + this.year);
      const responseLatestExpenditures = await httpClient.get(
        '/expenditures/latestFiveEntries/' + this.month + '/' + this.year + location.search
      );
      this.earningsSum = await responseEarnings.json();
      this.earnings = (await responseLatestEarnings.json()).results;
      this.expendituresSum = await responseExpenditures.json();
      this.expenditures = (await responseLatestExpenditures.json()).results;
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
    return html`
      <div id="overview-page">
        <div class="container container-big">
          <div id="earningChart" class="child">
            <h3 class="title">Earnings</h3>
            <app-doughnut-chart .data=${this.earningsSum}></app-doughnut-chart>
          </div>
          <div id="middle-text" class="child container container-text">
            <div class="child">
              <div id="previous" @click="${() => this.previousMonth(Number(this.month), Number(this.year))}"></div>
              <h2 class="title">
                <form>
                  <input type="month" id="monthInput" name="monthInput" value="${this.year}-${this.month}" />
                  <button type="button" @click="${this.choose}">choose</button>
                </form>
              </h2>
              <div id="next" @click="${() => this.nextMonth(Number(this.month), Number(this.year))}"></div>
            </div>
            <div class="child text" id="text">
              <p id="earningsSumTotal">💰Earnings: €${this.earningsSum.totalSum.toFixed(2)}</p>
              <p id="expendituresSumTotal">💸Expenditures: €${this.expendituresSum.totalSum.toFixed(2)}</p>
              <p id="savings">📈Savings: €${(this.earningsSum.totalSum - this.expendituresSum.totalSum).toFixed(2)}</p>
            </div>
          </div>
          <div id="expenditureChart" class="child">
            <h3 class="title">Expenditures</h3>
            <app-doughnut-chart .data=${this.expendituresSum}></app-doughnut-chart>
          </div>
        </div>
        <div id="snippets">
          <app-snippet
            .dataTitle=${'Earnings'}
            .dataArr=${this.earnings}
            .month=${this.month}
            .year=${this.year}
            @appremoveentry="${
              //man hätte auch earnings und expenditures getrennt aktualisieren können, jedoch fande ich es sieht schöner aus, wenn sich beide Doughnut charts zusammen aktualisieren
              this.updateValues
            }"
          ></app-snippet>
          <app-snippet
            .dataTitle=${'Expenditures'}
            .dataArr=${this.expenditures}
            .month=${this.month}
            .year=${this.year}
            @appremoveentry="${
              //man hätte auch earnings und expenditures getrennt aktualisieren können, jedoch fande ich es sieht schöner aus, wenn sich beide Doughnut charts zusammen aktualisieren
              this.updateValues
            }"
          ></app-snippet>
        </div>
      </div>
    `;
  }

  //on click on the previous "button", the previous month gets loaded
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
    router.navigate('overview/' + this.month + '/' + this.year);
    await this.updateValues();
  }

  //on click on the next "button", the next month gets loaded
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
    router.navigate('overview/' + this.month + '/' + this.year);
    await this.updateValues();
  }
  //when you press choose you get the month of the month input loaded
  async choose() {
    this.month = this.monthInput.value.substring(5);
    this.year = this.monthInput.value.substring(0, 4);
    router.navigate('overview/' + this.month + '/' + this.year);
    await this.updateValues();
  }

  goToFinances() {
    router.navigate('finances/' + this.month + '/' + this.year);
  }

  goToTips() {
    router.navigate('tips');
  }
}
