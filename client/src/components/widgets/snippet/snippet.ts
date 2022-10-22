/* Autor: Lukas Behnke (FH Münster) */

import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../../http-client';
import { router } from '../../../router/router';
import { PageMixin } from '../../page.mixin.js';
import sharedStyle from '../../shared.css';
import componentStyle from './snippet.css';

interface Data {
  id: string;
  title: string;
  amount: number;
  category: string;
  month: string;
  year: string;
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

@customElement('app-snippet')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Snippet extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() dataArr!: Data[];

  @property() dataTitle!: string;

  @property() month!: string;

  @property() year!: string;

  @query('#childs-container')
  datefield!: string;

  render() {
    return html` <div class="container-big">
      <div class="container firstline">
        <h3 id="heading" class="heading">${this.dataTitle}</h3>
        <div class="child buttons">
          <button type="button button-secondary" id="goTo" @click="${this.goToEntries}">Go to ${this.dataTitle}</button>
          <button type="button" @click="${this.addEntry}">Add</button>
        </div>
      </div>
      <div class="childs-container">${this.getData()}</div>
    </div>`;
  }

  //returns the entries of the Data and print one row, with 'No Entries', when no Entry exists
  getData() {
    if (this.dataTitle == 'Earnings') {
      if (this.dataArr.length == 0) {
        return html`<app-earning> <span slot="no-entries">${'No Entries'}</span> </app-earning>`;
      } else {
        return repeat(
          this.dataArr,
          data => data.id,
          data => html` <app-earning
            class="line"
            @appearningremoveclick=${() => this.removeEntry(data)}
            @appearningclick=${() => this.showDetails(data)}
          >
            <span slot="title">${data.title}</span>
            <span slot="amount">€${data.amount}</span>
            <span slot="category">${data.category}</span>
          </app-earning>`
        );
      }
    } else {
      if (this.dataArr.length == 0) {
        return html`<app-expenditure> <span slot="no-entries">${'No Entries'}</span> </app-expenditure>`;
      } else {
        return repeat(
          this.dataArr,
          data => data.id,
          data => html` <app-expenditure
            class="line"
            @appexpenditureremoveclick=${() => this.removeEntry(data)}
            @appexpenditureclick=${() => this.showDetails(data)}
          >
            <span slot="title">${data.title}</span>
            <span slot="amount">€${data.amount}</span>
            <span slot="category">${data.category}</span>
          </app-expenditure>`
        );
      }
    }
  }

  emit(eventType: string, eventData = {}) {
    const event = new CustomEvent(eventType, {
      detail: eventData,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  async showDetails(data: Data) {
    if (this.dataTitle == 'Earnings') router.navigate('earnings-details/' + data.id);
    if (this.dataTitle == 'Expenditures') router.navigate('expenditures-details/' + data.id);
  }

  async removeEntry(dataToRemove: Data) {
    if (this.dataTitle == 'Earnings') {
      await this.removeEarning(dataToRemove);
    } else {
      await this.removeExpenditure(dataToRemove);
    }
    this.emit('appremoveentry');
  }

  async addEntry() {
    if (this.dataTitle == 'Earnings') router.navigate('/earnings-add/' + this.month + '/' + this.year);
    if (this.dataTitle == 'Expenditures') router.navigate('/expenditures-add/' + this.month + '/' + this.year);
  }

  async goToEntries() {
    if (this.dataTitle == 'Earnings') router.navigate('/earnings/' + this.month + '/' + this.year);
    if (this.dataTitle == 'Expenditures') router.navigate('/expenditures/' + this.month + '/' + this.year);
  }

  async removeExpenditure(expenditureToRemove: Data) {
    try {
      this.dataArr = this.dataArr.filter(expenditure => expenditure.id !== expenditureToRemove.id);
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

  async removeEarning(earningToRemove: Data) {
    try {
      this.dataArr = this.dataArr.filter(earning => earning.id !== earningToRemove.id);
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
}
