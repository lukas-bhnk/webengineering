/* Autor: Lukas Behnke (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './earning-details.css';

interface newSumUserMonthEarning {
  totalSum: string;
  salary: string;
  rental: string;
  dividend: string;
  refund: string;
  gift: string;
  other: string;
  month: string;
  year: string;
}

interface patchSumUserMonthEarning {
  id: string;
  totalSum: string;
  salary: string;
  rental: string;
  dividend: string;
  refund: string;
  gift: string;
  other: string;
  month: string;
  year: string;
}

interface patchEarning {
  id: string;
  totalSum: string;
  salary: string;
  rental: string;
  dividend: string;
  refund: string;
  gift: string;
  other: string;
  creationDate: string;
  month: string;
  year: string;
}

interface patchEarning {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  description: string;
  amount: string;
  creationDate: string;
}

interface newEarning {
  title: string;
  category: string;
  creationDate: string;
  description: string;
  amount: string;
}

@customElement('app-earning-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EarningDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() earningId?: string;

  @property() month?: string;

  @property() year?: string;

  @query('form') private form!: HTMLFormElement;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#category') private categoryElement!: HTMLInputElement;

  @query('#creationDate') private creationDateElement!: HTMLInputElement;

  @query('#amount') private amountElement!: HTMLInputElement;

  @query('#description') private descriptionElement!: HTMLInputElement;

  private earning!: patchEarning;

  async firstUpdated() {
    try {
      this.startAsyncInit();
      if (this.earningId != undefined) {
        const response = await httpClient.get('/earnings/' + this.earningId + location.search);
        this.earning = await response.json();
        this.month = this.earning.creationDate.substring(5, 7);
        this.year = this.earning.creationDate.substring(0, 4);
      }
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
      ${this.renderNotification()}
      <h1>Earning details</h1>
      <form novalidate>
        <div>
          <label for="title">Title</label>
          <input type="text" maxlength="25" autofocus required id="title" .value=${this.earning?.title || ''} />
          <div class="invalid-feedback">Title is required with maxlength of 25 characters</div>
        </div>
        <div>
          <label for="category">Category</label>
          <select id="category" required .value=${this.earning?.category || ''}>
            <option value="">Please select</option>
            <option value="salary">Salary</option>
            <option value="rental">Rental</option>
            <option value="dividend">Dividend</option>
            <option value="refund">Refund</option>
            <option value="gift">Gift</option>
            <option value="other">Other</option>
          </select>
          <div class="invalid-feedback">Please select a category</div>
        </div>
        <div>
          <label for="creationDate">Due date</label>
          <input type="date" id="creationDate" required .value=${this.earning?.creationDate || ''} />
          <div class="invalid-feedback">Date is not valid</div>
        </div>
        <div>
          <label for="amount">Amount(€)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            id="amount"
            required
            .value=${Number(this.earning?.amount) || ''}
          />
          <div class="invalid-feedback">Amount is not valid - should be greater than 0.00</div>
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" maxlength="250" rows="5" .value=${this.earning?.description || ''}></textarea>
          <div class="invalid-feedback">Description can have maximal 250 characters</div>
        </div>
        <button type="button" id="save" @click="${this.submit}">Save</button>
        <button type="button" id="cancel" @click="${this.cancel}">Cancel</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      if (this.earningId != undefined) {
        const updatedEarning: patchEarning = {
          ...this.earning,
          title: this.titleElement.value,
          creationDate: this.creationDateElement.value,
          description: this.descriptionElement.value,
          amount: this.amountElement.value,
          category: this.categoryElement.value
        };
        try {
          const response = await httpClient.get('/sumsUserMonthEarnings/' + this.month + '/' + this.year);
          const earningsSum: patchSumUserMonthEarning = await response.json();
          earningsSum.totalSum = String(Number(earningsSum.totalSum) - Number(this.earning.amount));
          if (this.earning.category == 'salary')
            earningsSum.salary = String(Number(earningsSum.salary) - Number(this.earning.amount));
          if (this.earning.category == 'rental')
            earningsSum.rental = String(Number(earningsSum.rental) - Number(this.earning.amount));
          if (this.earning.category == 'dividend')
            earningsSum.dividend = String(Number(earningsSum.dividend) - Number(this.earning.amount));
          if (this.earning.category == 'gift')
            earningsSum.gift = String(Number(earningsSum.gift) - Number(this.earning.amount));
          if (this.earning.category == 'refund')
            earningsSum.refund = String(Number(earningsSum.refund) - Number(this.earning.amount));
          if (this.earning.category == 'other')
            earningsSum.other = String(Number(earningsSum.other) - Number(this.earning.amount));
          if (
            this.earning.creationDate.substring(5, 7) != updatedEarning.creationDate.substring(5, 7) ||
            this.earning.creationDate.substring(0, 4) != updatedEarning.creationDate.substring(0, 4)
          ) {
            this.month = updatedEarning.creationDate.substring(5, 7);
            this.year = updatedEarning.creationDate.substring(0, 4);
            await this.createOrPatchSum(updatedEarning);
            await httpClient.patch('/sumsUserMonthEarnings/' + earningsSum.id, earningsSum);
            await httpClient.patch('/earnings/' + updatedEarning.id, updatedEarning);
            router.navigate('/earnings/' + this.month + '/' + this.year);
          } else {
            earningsSum.totalSum = String(Number(earningsSum.totalSum) + Number(updatedEarning.amount));
            if (updatedEarning.category == 'salary')
              earningsSum.salary = String(Number(earningsSum.salary) + Number(updatedEarning.amount));
            if (updatedEarning.category == 'rental')
              earningsSum.rental = String(Number(earningsSum.rental) + Number(updatedEarning.amount));
            if (updatedEarning.category == 'dividend')
              earningsSum.dividend = String(Number(earningsSum.dividend) + Number(updatedEarning.amount));
            if (updatedEarning.category == 'gift')
              earningsSum.gift = String(Number(earningsSum.gift) + Number(updatedEarning.amount));
            if (updatedEarning.category == 'refund')
              earningsSum.refund = String(Number(earningsSum.refund) + Number(updatedEarning.amount));
            if (updatedEarning.category == 'other')
              earningsSum.other = String(Number(earningsSum.other) + Number(updatedEarning.amount));
            await httpClient.patch('/sumsUserMonthEarnings/' + earningsSum.id, earningsSum);
            await httpClient.patch('/earnings/' + updatedEarning.id, updatedEarning);
            router.navigate('/earnings/' + this.month + '/' + this.year);
          }
        } catch (e) {
          this.showNotification((e as Error).message, 'error');
        }
      } else {
        const newEarning: newEarning = {
          title: this.titleElement.value,
          creationDate: this.creationDateElement.value,
          description: this.descriptionElement.value,
          amount: this.amountElement.value,
          category: this.categoryElement.value
        };

        try {
          this.month = newEarning.creationDate.substring(5, 7);
          this.year = newEarning.creationDate.substring(0, 4);
          await this.createOrPatchSum(newEarning);
          await httpClient.post('/earnings/', newEarning);
          router.navigate('/earnings/' + this.month + '/' + this.year);
        } catch (e) {
          this.showNotification((e as Error).message, 'error');
        }
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }
  //if a sum for this month exists -> update the existing, when a sum not exists -> create a new sum for this month
  async createOrPatchSum(earning: newEarning | patchEarning) {
    try {
      const response = await httpClient.get('/sumsUserMonthEarnings/' + this.month + '/' + this.year);
      const earningsSum: patchSumUserMonthEarning = await response.json();
      if (earningsSum.id == undefined) {
        this.month = earning.creationDate.substring(5, 7);
        this.year = earning.creationDate.substring(0, 4);
        const earningsSum: newSumUserMonthEarning = {
          totalSum: '0',
          salary: '0',
          rental: '0',
          dividend: '0',
          refund: '0',
          gift: '0',
          other: '0',
          month: this.month,
          year: this.year
        };
        earningsSum.totalSum = String(Number(earningsSum.totalSum) + Number(earning.amount));

        if (earning.category == 'salary')
          earningsSum.salary = String(Number(earningsSum.salary) + Number(earning.amount));
        if (earning.category == 'rental')
          earningsSum.rental = String(Number(earningsSum.rental) + Number(earning.amount));
        if (earning.category == 'dividend')
          earningsSum.dividend = String(Number(earningsSum.dividend) + Number(earning.amount));
        if (earning.category == 'gift') earningsSum.gift = String(Number(earningsSum.gift) + Number(earning.amount));
        if (earning.category == 'refund')
          earningsSum.refund = String(Number(earningsSum.refund) + Number(earning.amount));
        if (earning.category == 'other') earningsSum.other = String(Number(earningsSum.other) + Number(earning.amount));

        await httpClient.post('/sumsUserMonthEarnings/', earningsSum);
      } else {
        earningsSum.totalSum = String(Number(earningsSum.totalSum) + Number(earning.amount));
        if (earning.category == 'salary')
          earningsSum.salary = String(Number(earningsSum.salary) + Number(earning.amount));
        if (earning.category == 'rental')
          earningsSum.rental = String(Number(earningsSum.rental) + Number(earning.amount));
        if (earning.category == 'dividend')
          earningsSum.dividend = String(Number(earningsSum.dividend) + Number(earning.amount));
        if (earning.category == 'gift') earningsSum.gift = String(Number(earningsSum.gift) + Number(earning.amount));
        if (earning.category == 'refund')
          earningsSum.refund = String(Number(earningsSum.refund) + Number(earning.amount));
        if (earning.category == 'other') earningsSum.other = String(Number(earningsSum.other) + Number(earning.amount));

        await httpClient.patch('/sumsUserMonthEarnings/' + earningsSum.id, earningsSum);
      }
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  cancel() {
    router.navigate('/earnings/' + this.month + '/' + this.year);
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
