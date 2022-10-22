/* Autor: Lukas Behnke (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './expenditure-details.css';

interface newSumUserMonthExpenditure {
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

interface patchSumUserMonthExpenditure {
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

interface patchExpenditure {
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

interface patchExpenditure {
  id: string;
  title: string;
  category: string;
  creationDate: string;
  description: string;
  amount: string;
}

interface newExpenditure {
  title: string;
  category: string;
  creationDate: string;
  description: string;
  amount: string;
}

@customElement('app-expenditure-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ExpenditureDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() expenditureId?: string;

  @property() month?: string;

  @property() year?: string;

  @query('form') private form!: HTMLFormElement;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#creationDate') private creationDateElement!: HTMLInputElement;

  @query('#category') private categoryElement!: HTMLInputElement;

  @query('#amount') private amountElement!: HTMLInputElement;

  @query('#description') private descriptionElement!: HTMLInputElement;

  private expenditure!: patchExpenditure;

  async firstUpdated() {
    try {
      if (this.expenditureId != undefined) {
        const response = await httpClient.get('/expenditures/' + this.expenditureId);
        this.expenditure = await response.json();
        this.month = this.expenditure.creationDate.substring(5, 7);
        this.year = this.expenditure.creationDate.substring(0, 4);
        this.requestUpdate();
        await this.updateComplete;
      }
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Expenditure details</h1>
      <form novalidate>
        <div>
          <label for="title" >Title</label>
          <input type="text" maxlength="25" autofocus required id="title" .value=${this.expenditure?.title || ''} />
          <div class="invalid-feedback">Title is required with maxlength of 25 characters</div>
        </div>
        <div>
          <label for="category">Category</label>
          <select name="category" id="category" required .value=${this.expenditure?.category || ''}>
              <option value="">Please select</option>
              <option value="rent">Rent</option>
              <option value="house">House</option>
              <option value="leisure">Leisure</option>
              <option value="food">Food</option>
              <option value="clothes">Clothes</option>
              <option value="travel">Travel</option>
              <option value="insurance">Insurance</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
          </select>
          <div class="invalid-feedback">Please select a category</div>
        </div>
        <div>
          <label for="creationDate">Due date</label>
          <input type="date" required id="creationDate" .value=${this.expenditure?.creationDate || ''} />
          <div class="invalid-feedback">Date is not valid</div>
        </div>
        <div>
          <label for="amount">Amount</label>
          <input type="number" step="0.01" min="0.01" id="amount" required .value=${this.expenditure?.amount || ''}/>
          <div class="invalid-feedback">Amount is not valid - should be greater than 0.00</div>
        <div class="form-group">
          <label for="description" >Description</label>
          <textarea id="description" maxlength="250" rows="5" .value=${this.expenditure?.description || ''}></textarea>
          <div class="invalid-feedback">Description can have maximal 250 characters</div>
        </div>
        <button type="button" id="save" @click="${this.submit}">Save</button>
        <button type="button" id="cancel" @click="${this.cancel}">Cancel</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      if (this.expenditureId != undefined) {
        const updatedExpenditure: patchExpenditure = {
          ...this.expenditure,
          title: this.titleElement.value,
          creationDate: this.creationDateElement.value,
          description: this.descriptionElement.value,
          amount: this.amountElement.value,
          category: this.categoryElement.value
        };
        try {
          const response = await httpClient.get('/sumsUserMonthExpenditures/' + this.month + '/' + this.year);
          const expendituresSum: patchSumUserMonthExpenditure = await response.json();
          expendituresSum.totalSum = String(Number(expendituresSum.totalSum) - Number(this.expenditure.amount));
          if (this.expenditure.category == 'rent')
            expendituresSum.rent = String(Number(expendituresSum.rent) - Number(this.expenditure.amount));
          if (this.expenditure.category == 'house')
            expendituresSum.house = String(Number(expendituresSum.house) - Number(this.expenditure.amount));
          if (this.expenditure.category == 'leisure')
            expendituresSum.leisure = String(Number(expendituresSum.leisure) - Number(this.expenditure.amount));
          if (this.expenditure.category == 'food')
            expendituresSum.food = String(Number(expendituresSum.food) - Number(this.expenditure.amount));
          if (this.expenditure.category == 'clothes')
            expendituresSum.clothes = String(Number(expendituresSum.clothes) - Number(this.expenditure.amount));
          if (this.expenditure.category == 'travel')
            expendituresSum.travel = String(Number(expendituresSum.travel) - Number(this.expenditure.amount));
          if (this.expenditure.category == 'insurance')
            expendituresSum.insurance = String(Number(expendituresSum.insurance) - Number(this.expenditure.amount));
          if (this.expenditure.category == 'health')
            expendituresSum.health = String(Number(expendituresSum.health) - Number(this.expenditure.amount));
          if (this.expenditure.category == 'other')
            expendituresSum.other = String(Number(expendituresSum.other) - Number(this.expenditure.amount));
          if (
            this.expenditure.creationDate.substring(5, 7) != updatedExpenditure.creationDate.substring(5, 7) ||
            this.expenditure.creationDate.substring(0, 4) != updatedExpenditure.creationDate.substring(0, 4)
          ) {
            this.month = updatedExpenditure.creationDate.substring(5, 7);
            this.year = updatedExpenditure.creationDate.substring(0, 4);
            await this.createOrPatchSum(updatedExpenditure);
            await httpClient.patch('/sumsUserMonthExpenditures/' + expendituresSum.id, expendituresSum);
            await httpClient.patch('/expenditures/' + updatedExpenditure.id, updatedExpenditure);
            router.navigate('/expenditures/' + this.month + '/' + this.year);
          } else {
            expendituresSum.totalSum = String(Number(expendituresSum.totalSum) + Number(updatedExpenditure.amount));
            if (updatedExpenditure.category == 'rent')
              expendituresSum.rent = String(Number(expendituresSum.rent) + Number(updatedExpenditure.amount));
            if (updatedExpenditure.category == 'house')
              expendituresSum.house = String(Number(expendituresSum.house) + Number(updatedExpenditure.amount));
            if (updatedExpenditure.category == 'leisure')
              expendituresSum.leisure = String(Number(expendituresSum.leisure) + Number(updatedExpenditure.amount));
            if (updatedExpenditure.category == 'food')
              expendituresSum.food = String(Number(expendituresSum.food) + Number(updatedExpenditure.amount));
            if (updatedExpenditure.category == 'clothes')
              expendituresSum.clothes = String(Number(expendituresSum.clothes) + Number(updatedExpenditure.amount));
            if (updatedExpenditure.category == 'travel')
              expendituresSum.travel = String(Number(expendituresSum.travel) + Number(updatedExpenditure.amount));
            if (updatedExpenditure.category == 'insurance')
              expendituresSum.insurance = String(Number(expendituresSum.insurance) + Number(updatedExpenditure.amount));
            if (updatedExpenditure.category == 'health')
              expendituresSum.health = String(Number(expendituresSum.health) + Number(updatedExpenditure.amount));
            if (updatedExpenditure.category == 'other')
              expendituresSum.other = String(Number(expendituresSum.other) + Number(updatedExpenditure.amount));
            await httpClient.patch('/sumsUserMonthExpenditures/' + expendituresSum.id, expendituresSum);
            await httpClient.patch('/expenditures/' + updatedExpenditure.id, updatedExpenditure);
            router.navigate('/expenditures/' + this.month + '/' + this.year);
          }
        } catch (e) {
          this.showNotification((e as Error).message, 'error');
        }
      } else {
        const newExpenditure: newExpenditure = {
          title: this.titleElement.value,
          creationDate: this.creationDateElement.value,
          description: this.descriptionElement.value,
          amount: this.amountElement.value,
          category: this.categoryElement.value
        };

        try {
          await this.createOrPatchSum(newExpenditure);
          await httpClient.post('/expenditures/', newExpenditure);
          router.navigate('/expenditures/' + this.month + '/' + this.year);
        } catch (e) {
          this.showNotification((e as Error).message, 'error');
        }
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  async createOrPatchSum(expenditure: newExpenditure | patchExpenditure) {
    try {
      const response = await httpClient.get('/sumsUserMonthExpenditures/' + this.month + '/' + this.year);
      const expendituresSum: patchSumUserMonthExpenditure = await response.json();
      if (expendituresSum.id == undefined) {
        this.month = expenditure.creationDate.substring(5, 7);
        this.year = expenditure.creationDate.substring(0, 4);
        const expendituresSum: newSumUserMonthExpenditure = {
          totalSum: '0',
          rent: '0',
          house: '0',
          leisure: '0',
          food: '0',
          clothes: '0',
          travel: '0',
          insurance: '0',
          health: '0',
          other: '0',
          month: this.month,
          year: this.year
        };
        expendituresSum.totalSum = String(Number(expendituresSum.totalSum) + Number(expenditure.amount));
        if (expenditure.category == 'rent')
          expendituresSum.rent = String(Number(expendituresSum.rent) + Number(expenditure.amount));
        if (expenditure.category == 'house')
          expendituresSum.house = String(Number(expendituresSum.house) + Number(expenditure.amount));
        if (expenditure.category == 'leisure')
          expendituresSum.leisure = String(Number(expendituresSum.leisure) + Number(expenditure.amount));
        if (expenditure.category == 'food')
          expendituresSum.food = String(Number(expendituresSum.food) + Number(expenditure.amount));
        if (expenditure.category == 'clothes')
          expendituresSum.clothes = String(Number(expendituresSum.clothes) + Number(expenditure.amount));
        if (expenditure.category == 'travel')
          expendituresSum.travel = String(Number(expendituresSum.travel) + Number(expenditure.amount));
        if (expenditure.category == 'insurance')
          expendituresSum.insurance = String(Number(expendituresSum.insurance) + Number(expenditure.amount));
        if (expenditure.category == 'health')
          expendituresSum.health = String(Number(expendituresSum.health) + Number(expenditure.amount));
        if (expenditure.category == 'other')
          expendituresSum.other = String(Number(expendituresSum.other) + Number(expenditure.amount));

        await httpClient.post('/sumsUserMonthExpenditures/', expendituresSum);
      } else {
        expendituresSum.totalSum = String(Number(expendituresSum.totalSum) + Number(expenditure.amount));
        if (expenditure.category == 'rent')
          expendituresSum.rent = String(Number(expendituresSum.rent) + Number(expenditure.amount));
        if (expenditure.category == 'house')
          expendituresSum.house = String(Number(expendituresSum.house) + Number(expenditure.amount));
        if (expenditure.category == 'leisure')
          expendituresSum.leisure = String(Number(expendituresSum.leisure) + Number(expenditure.amount));
        if (expenditure.category == 'food')
          expendituresSum.food = String(Number(expendituresSum.food) + Number(expenditure.amount));
        if (expenditure.category == 'clothes')
          expendituresSum.clothes = String(Number(expendituresSum.clothes) + Number(expenditure.amount));
        if (expenditure.category == 'travel')
          expendituresSum.travel = String(Number(expendituresSum.travel) + Number(expenditure.amount));
        if (expenditure.category == 'insurance')
          expendituresSum.insurance = String(Number(expendituresSum.insurance) + Number(expenditure.amount));
        if (expenditure.category == 'health')
          expendituresSum.health = String(Number(expendituresSum.health) + Number(expenditure.amount));
        if (expenditure.category == 'other')
          expendituresSum.other = String(Number(expendituresSum.other) + Number(expenditure.amount));
        await httpClient.patch('/sumsUserMonthExpenditures/' + expendituresSum.id, expendituresSum);
      }
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  cancel() {
    router.navigate('/expenditures/' + this.month + '/' + this.year);
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
