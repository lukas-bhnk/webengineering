/* Autor: Sain Larlee-Matthews (FH Münster) */

import { LitElement, html, render } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import sharedStyle from '../shared.css';
import componentStyle from './finances.css';

interface Budget {
  id: string;
  category: string;
  text: string;
  target: number;
  month: string;
  year: string;
  userId: string;
  budgetingStyle: string;
  funds: number;
}

interface newBudget {
  category: string;
  text: string;
  target: number;
  month: string;
  year: string;
  budgetingStyle: string;
  funds: number;
}

interface PatchBudget {
  budgetingStyle: string;
}
interface Finance {
  id: string;
  title: string;
  month: string;
  year: string;
  budgetingStyle: string;
}

interface Earning {
  id: string;
  title: string;
  amount: number;
  category: string;
}

interface Expenditure {
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

@customElement('app-finances')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class FinanceComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() financeId?: string;

  @property() month!: string;

  @property() year!: string;

  @property() budgetingStyle = 'balanced';

  @state() earnings!: Earning[];
  @state() expenditures!: Expenditure[];
  @state() sumEarnings!: SumUserMonthEarning;
  @state() sumExpenditures!: SumUserMonthExpenditure;
  @state() patchBudget!: PatchBudget;
  @query('#category') select!: HTMLInputElement;

  @property() private budgets: Budget[] = [];
  @state() private finance!: Finance;

  @state() private savingsTarget = 500;

  @query('#title') private titleElement!: HTMLInputElement;

  @query('#target') private targetElement!: HTMLInputElement;

  @query('#input') private input!: HTMLInputElement;

  @query('#monthInput')
  private monthInput!: HTMLInputElement;

  async firstUpdated() {
    this.updateFinance();
  }

  async updateFinance() {
    try {
      this.startAsyncInit();
      const responseSumUserMonthEarnings = await httpClient.get(
        '/sumsUserMonthEarnings/' + this.month + '/' + this.year
      );
      const responseLatestEarnings = await httpClient.get(
        '/earnings/latestFiveEntries/' + this.month + '/' + this.year + location.search
      );
      const responseSumUserMonthExpenditures = await httpClient.get(
        '/sumsUserMonthExpenditures/' + this.month + '/' + this.year
      );
      const responseLatestExpenditures = await httpClient.get(
        '/expenditures/latestFiveEntries/' + this.month + '/' + this.year + location.search
      );
      this.sumEarnings = await responseSumUserMonthEarnings.json();
      this.earnings = (await responseLatestEarnings.json()).results;
      this.sumExpenditures = await responseSumUserMonthExpenditures.json();
      this.expenditures = (await responseLatestExpenditures.json()).results;

      const responseBudgets = await httpClient.get(
        '/budgets/' + this.month + '/' + String(this.year) + location.search
      );
      this.budgets = (await responseBudgets.json()).results;
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
      <h1>My Financial Planner</h1>
      <h4>Here are your budgets for ${this.month}, ${this.year}. You're net budget is:</h4>
      <h4>Your budgeting style is set to <strong>${this.budgetingStyle}</strong></h4>
      <div class="budget-container">
        <app-budgets .month=${this.month} .year=${this.year} .budgetingStyle=${this.budgetingStyle}
      </div>
    `;
  }

  async createBudget() {
    const newBudgetRent: newBudget = {
      category: 'rent',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetHouse: newBudget = {
      category: 'house',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetLeisure: newBudget = {
      category: 'leisure',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetFood: newBudget = {
      category: 'food',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetClothes: newBudget = {
      category: 'clothes',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetTravel: newBudget = {
      category: 'travel',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetInsurance: newBudget = {
      category: 'insurance',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetHealth: newBudget = {
      category: 'health',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    const newBudgetOther: newBudget = {
      category: 'other',
      text: '',
      target: 0,
      month: this.month,
      year: String(this.year),
      budgetingStyle: this.budgetingStyle,
      funds: 0
    };
    try {
      await httpClient.post('/budgets/', newBudgetRent);
      await httpClient.post('/budgets/', newBudgetHouse);
      await httpClient.post('/budgets/', newBudgetLeisure);
      await httpClient.post('/budgets/', newBudgetFood);
      await httpClient.post('/budgets/', newBudgetClothes);
      await httpClient.post('/budgets/', newBudgetTravel);
      await httpClient.post('/budgets/', newBudgetInsurance);
      await httpClient.post('/budgets/', newBudgetHealth);
      await httpClient.post('/budgets/', newBudgetOther);
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  /* Autor: Lukas Behnke (FH Münster) */

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
    await this.updateFinance();
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
    await this.updateFinance();
  }
}
