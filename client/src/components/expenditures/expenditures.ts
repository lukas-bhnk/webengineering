/* Autor: Lukas Behnke (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './expenditures.css';

interface Expenditure {
  id: string;
  title: string;
  amount: number;
  category: string;
}

interface SumUserMonthExpenditure {
  id: string;
  month: string;
  year: string;
  totalSum: string;
  rent: string;
  house: string;
  leisure: string;
  food: string;
  clothes: string;
  travel: string;
  insurance: string;
  health: string;
  other: string;
}

@customElement('app-expenditures')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ExpendituresComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() month!: string;

  @property() year!: string;

  @state() private expenditures: Expenditure[] = [];

  @query('#monthInput')
  private monthInput!: HTMLInputElement;

  async firstUpdated() {
    this.updateValues();
  }

  async updateValues() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('/expenditures/' + this.month + '/' + this.year + location.search);
      this.expenditures = (await response.json()).results;
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
          <h3 id="heading" class="heading">Expenditures</h3>
          <div class="child buttons">
            <button type="button" id="goToOverview" @click="${this.goToOverview}">Go to Overview</button>
            <button type="button" @click="${this.addExpenditure}">Add</button>
          </div>
        </div>
        <div class="childs-container">${this.getData()}</div>
      </div>`;
  }

  //returns the entries of the Data and print one row, with 'No Entries', when no Entry exists
  getData() {
    if (this.expenditures.length == 0) {
      return html`<app-expenditure> <span slot="no-entries">${'No Entries'}</span> </app-expenditure>`;
    } else {
      return repeat(
        this.expenditures,
        expenditure => expenditure.id,
        expenditure => html` <app-expenditure
          id="line"
          @appexpenditureremoveclick=${() => this.removeExpenditure(expenditure)}
          @appexpenditureclick=${() => this.showExpenditureDetails(expenditure)}
        >
          <span slot="title">${expenditure.title}</span>
          <span slot="amount">€${expenditure.amount}</span>
          <span slot="category">${expenditure.category}</span>
        </app-expenditure>`
      );
    }
  }

  async removeExpenditure(expenditureToRemove: Expenditure) {
    try {
      this.expenditures = this.expenditures.filter(expenditure => expenditure.id !== expenditureToRemove.id);
      const response = await httpClient.get('/sumsUserMonthExpenditures/' + this.month + '/' + this.year);
      const expendituresSum: SumUserMonthExpenditure = await response.json();
      expendituresSum.totalSum = String(Number(expendituresSum.totalSum) - Number(expenditureToRemove.amount));
      if (expenditureToRemove.category == 'rent')
        expendituresSum.rent = String(Number(expendituresSum.rent) - Number(expenditureToRemove.amount));
      if (expenditureToRemove.category == 'house')
        expendituresSum.house = String(Number(expendituresSum.house) - Number(expenditureToRemove.amount));
      if (expenditureToRemove.category == 'leisure')
        expendituresSum.leisure = String(Number(expendituresSum.leisure) - Number(expenditureToRemove.amount));
      if (expenditureToRemove.category == 'food')
        expendituresSum.food = String(Number(expendituresSum.food) - Number(expenditureToRemove.amount));
      if (expenditureToRemove.category == 'clothes')
        expendituresSum.clothes = String(Number(expendituresSum.clothes) - Number(expenditureToRemove.amount));
      if (expenditureToRemove.category == 'travel')
        expendituresSum.travel = String(Number(expendituresSum.travel) - Number(expenditureToRemove.amount));
      if (expenditureToRemove.category == 'insurance')
        expendituresSum.insurance = String(Number(expendituresSum.insurance) - Number(expenditureToRemove.amount));
      if (expenditureToRemove.category == 'health')
        expendituresSum.health = String(Number(expendituresSum.health) - Number(expenditureToRemove.amount));
      if (expenditureToRemove.category == 'other')
        expendituresSum.other = String(Number(expendituresSum.other) - Number(expenditureToRemove.amount));
      await httpClient.delete('/expenditures/' + expenditureToRemove.id);
      await httpClient.patch('/sumsUserMonthExpenditures/' + expendituresSum.id, expendituresSum);
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
    router.navigate('expenditures/' + this.month + '/' + this.year);
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
    router.navigate('expenditures/' + this.month + '/' + this.year);
    await this.updateValues();
  }

  async choose() {
    this.month = this.monthInput.value.substring(5);
    this.year = this.monthInput.value.substring(0, 4);
    router.navigate('expenditures/' + this.month + '/' + this.year);
    this.updateValues();
  }

  async goToOverview() {
    router.navigate('overview/' + this.month + '/' + this.year);
  }

  async showExpenditureDetails(expenditure: Expenditure) {
    router.navigate(`/expenditures-details/${expenditure.id}`);
  }

  async addExpenditure() {
    router.navigate('expenditures-add/' + this.month + '/' + this.year);
  }
}
