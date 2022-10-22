/* Autor: Sain Larlee-Matthews (FH Münster) */

import { timeStamp } from 'console';
import { LitElement, html, render } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import sharedStyle from '../shared.css';
import componentStyle from './budgets.css';

interface Budget {
  id: string;
  category: string;
  target: number;
  month: string;
  year: string;
  userId: string;
  budgetingStyle: string;
  funds: number;
}

interface NewBudget {
  category: string;
  text: string;
  target: number;
  month: string;
  year: string;
  budgetingStyle: string;
  funds: number;
}

interface Earning {
  id: string;
  title: string;
  amount: number;
  category: string;
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

@customElement('app-budgets')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BudgetsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() month!: string;
  @property() year!: string;
  @property() budgetingStyle!: string;
  @property() budget!: Budget;
  @property() earnings!: Earning[];
  @property() newBudgets: NewBudget[] = [];
  @state() sumUserMonthEarnings: SumUserMonthEarning = {
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

  @query('#style') select!: HTMLInputElement;
  @state() private budgets: Budget[] = [];

  @query('#saver') private saver!: HTMLInputElement;
  @query('#balanced') private balanced!: HTMLInputElement;
  @query('#spender') private spender!: HTMLInputElement;

  async firstUpdated() {
    this.updateBudgets();
  }

  async updateBudgets() {
    try {
      this.startAsyncInit;
      const response = await httpClient.get('/budgets/' + this.month + '/' + this.year + location.search);
      this.budgets = (await response.json()).results;
      const responseSumUserMonthEarnings = await httpClient.get(
        '/sumsUserMonthEarnings/' + this.month + '/' + this.year
      );
      const responseLatestEarnings = await httpClient.get(
        '/earnings/latestFiveEntries/' + this.month + '/' + this.year + location.search
      );
      this.sumUserMonthEarnings = await responseSumUserMonthEarnings.json();
      this.earnings = (await responseLatestEarnings.json()).results;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    } finally {
      this.finishAsyncInit;
    }
  }

  render() {
    return html`${this.loadBudgets()} `;
  }

  loadBudgets() {
    if (this.sumUserMonthEarnings.totalSum == 0) {
      return html`<app-earning>
          <span slot="title">${'You must add at least one earning before you can create a budget.'}</span>
        </app-earning>
        <button type="button" @click="${this.addEarning}">Add</button>`;
    } else
      return html` <label for="style">Choose your budgeting style:</label>
        <select input name="style" id="style" required>
          <option value="balanced" selected>I'm Balanced (save 20% of total earnings)</option>
          <option value="saver">I'm a Saver (save 30% of total earnings)</option>
          <option value="spender">I'm a Spender (save 10% of total earnings</option>
        </select>
        <button class="button" @click="${this.submit}">Create Budgets</button>
        <div class="budget-container">
          ${repeat(
            this.budgets,
            budget => budget.id,
            budget => html` <app-budget .budget=${budget} .month=${this.month} .year =${this.year} .budgetingStyle=${this.budgetingStyle}</app-budget>
        </div>`
          )}
        </div>`;
  }
  async submit(event: Event) {
    event.preventDefault();
    const newStyle = String(this.select.value);
    const response = await httpClient.get('/budgets/' + this.month + '/' + this.year);
    const budgetsChecker = (await response.json()).results;

    if (budgetsChecker.length == 0) {
      this.createBudget();
    } else {
      this.budgets.map(budget => {
        budget = { ...budget, budgetingStyle: newStyle };
        this.patchBudget(budget);
      });
    }
    this.updateBudgets();
    this.timedRefresh(500);
  }

  async patchBudget(budget: Budget) {
    try {
      await httpClient.patch('/budgets/' + budget.id, budget);
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  async createBudget() {
    const newBudgetRent: NewBudget = {
      category: 'rent',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetHouse: NewBudget = {
      category: 'house',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetLeisure: NewBudget = {
      category: 'leisure',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetFood: NewBudget = {
      category: 'food',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetClothes: NewBudget = {
      category: 'clothes',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetTravel: NewBudget = {
      category: 'travel',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetInsurance: NewBudget = {
      category: 'insurance',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetHealth: NewBudget = {
      category: 'health',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetOther: NewBudget = {
      category: 'other',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    this.newBudgets.push(newBudgetRent);
    this.newBudgets.push(newBudgetHouse);
    this.newBudgets.push(newBudgetLeisure);
    this.newBudgets.push(newBudgetFood);
    this.newBudgets.push(newBudgetClothes);
    this.newBudgets.push(newBudgetTravel);
    this.newBudgets.push(newBudgetInsurance);
    this.newBudgets.push(newBudgetHealth);
    this.newBudgets.push(newBudgetOther);

    this.newBudgets.map(newBudget => {
      this.postNewBudgets(newBudget);
    });
  }

  timedRefresh(timeoutPeriod: any) {
    setTimeout(function () {
      location.reload();
    }, timeoutPeriod);
  }

  async postNewBudgets(budget: NewBudget) {
    try {
      await httpClient.post('/budgets/', budget);
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async deleteBudgets() {
    this.budgets.map(budget => {
      this.deleteOne(budget);
    });
  }

  async deleteOne(budget: Budget) {
    try {
      await httpClient.delete('/budgets/' + budget.id);
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  async addEarning() {
    router.navigate('earnings-add/' + this.month + '/' + this.year);
  }

  async setBudgetSaver(event: Event) {
    if (this.budgetingStyle != this.saver.value) {
      this.budgetingStyle = this.saver.value;
      this.updateBudgets();
    }
  }

  async setBudgetBalanced(event: Event) {
    if (this.budgetingStyle != this.balanced.value) {
      this.budgetingStyle = this.balanced.value;
    }
    this.updateBudgets();
  }

  async setBudgetSpender(event: Event) {
    if (this.budgetingStyle != this.spender.value) {
      this.budgetingStyle = this.spender.value;
      this.updateBudgets();
    }
  }
}
