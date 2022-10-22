/* Autor: Sain Larlee-Matthews (FH Münster) */

import { timeStamp } from 'console';
import { LitElement, html, render } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../../http-client.js';
import { router } from '../../../router/router.js';
import { PageMixin } from '../../page.mixin.js';
import sharedStyle from '../../shared.css';
import componentStyle from './budget.css';

interface Budget {
  id: string;
  category: string;
  month: string;
  year: string;
  text: string;
  target: number;
  funds: number;
  fundsRemaining: number;
  expenses: number;
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

@customElement('app-budget')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BudgetComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() month!: string;
  @property() year!: string;
  @property() funds!: number;
  @property() fundsRemaining!: number;
  @property() budgetingStyle = 'balanced';
  @state() expenses!: number;
  @state() category!: string;
  @property() target!: number;
  @state() earnings: Earning[] = [];
  @state() expenditures: Expenditure[] = [];
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
  @state() sumUserMonthExpenditures: SumUserMonthExpenditure = {
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
  @state() budget!: Budget;

  async firstUpdated() {
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
      this.sumUserMonthEarnings = await responseSumUserMonthEarnings.json();
      this.earnings = (await responseLatestEarnings.json()).results;
      this.sumUserMonthExpenditures = await responseSumUserMonthExpenditures.json();
      this.expenditures = (await responseLatestExpenditures.json()).results;

      this.calculateTarget();
      this.calculateBudget();
      this.selectExpenditure();
      this.calculateFundsRemaining();
      this.requestUpdate();

      await this.updateComplete;
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
    if (this.budget.category == 'rent') {
      return html` <div id="rent" class="budget">
        <h2 class="category">${this.budget.category} 🛏️</h2>
        <hr />
        <h3 class="funds">
          Budget: <span class="funds-number">${this.budget.fundsRemaining}€ / ${Math.round(this.budget.funds)}€</span>
        </h3>
        <h4>total earnings: <span class="earnings">${this.sumUserMonthEarnings.totalSum}€</span></h4>
        <h4>${this.budget.category} expenditures: <span class="expenditures">${this.budget.expenses}€</span></h4>
      </div>`;
    } else if (this.budget.category == 'house') {
      return html` <div id="house" class="budget">
        <h2 class="category">${this.budget.category} 🏠</h2>
        <hr />
        <h3 class="funds">
          Budget: <span class="funds-number">${this.budget.fundsRemaining}€ / ${Math.round(this.budget.funds)}€</span>
        </h3>
        <h4>total earnings: <span class="earnings">${this.sumUserMonthEarnings.totalSum}€</span></h4>
        <h4>${this.budget.category} expenditures: <span class="expenditures">${this.budget.expenses}€</span></h4>
      </div>`;
    } else if (this.budget.category == 'leisure') {
      return html` <div id="leisure" class="budget">
        <h2 class="category">${this.budget.category} 🎣</h2>
        <hr />
        <h3 class="funds">
          Budget: <span class="funds-number">${this.budget.fundsRemaining}€ / ${Math.round(this.budget.funds)}€</span>
        </h3>
        <h4>total earnings: <span class="earnings">${this.sumUserMonthEarnings.totalSum}€</span></h4>
        <h4>${this.budget.category} expenditures: <span class="expenditures">${this.budget.expenses}€</span></h4>
      </div>`;
    } else if (this.budget.category == 'food') {
      return html` <div id="food" class="budget">
        <h2 class="category">${this.budget.category} 🍕</h2>
        <hr />
        <h3 class="funds">
          Budget: <span class="funds-number">${this.budget.fundsRemaining}€ / ${Math.round(this.budget.funds)}€</span>
        </h3>
        <h4>total earnings: <span class="earnings">${this.sumUserMonthEarnings.totalSum}€</span></h4>
        <h4>${this.budget.category} expenditures: <span class="expenditures">${this.budget.expenses}€</span></h4>
      </div>`;
    } else if (this.budget.category == 'clothes') {
      return html` <div id="clothes" class="budget">
        <h2 class="category">${this.budget.category} 👗</h2>
        <hr />
        <h3 class="funds">
          Budget: <span class="funds-number">${this.budget.fundsRemaining}€ / ${Math.round(this.budget.funds)}€</span>
        </h3>
        <h4>total earnings: <span class="earnings">${this.sumUserMonthEarnings.totalSum}€</span></h4>
        <h4>${this.budget.category} expenditures: <span class="expenditures">${this.budget.expenses}€</span></h4>
      </div>`;
    } else if (this.budget.category == 'travel') {
      return html` <div id="travel" class="budget">
        <h2 class="category">${this.budget.category} ✈️</h2>
        <hr />
        <h3 class="funds">
          Budget: <span class="funds-number">${this.budget.fundsRemaining}€ / ${Math.round(this.budget.funds)}€</span>
        </h3>
        <h4>total earnings: <span class="earnings">${this.sumUserMonthEarnings.totalSum}€</span></h4>
        <h4>${this.budget.category} expenditures: <span class="expenditures">${this.budget.expenses}€</span></h4>
      </div>`;
    } else if (this.budget.category == 'insurance') {
      return html` <div id="insurance" class="budget">
        <h2 class="category">${this.budget.category} ⛈️</h2>
        <hr />
        <h3 class="funds">
          Budget: <span class="funds-number">${this.budget.fundsRemaining}€ / ${Math.round(this.budget.funds)}€</span>
        </h3>
        <h4>total earnings: <span class="earnings">${this.sumUserMonthEarnings.totalSum}€</span></h4>
        <h4>${this.budget.category} expenditures: <span class="expenditures">${this.budget.expenses}€</span></h4>
      </div>`;
    } else if (this.budget.category == 'health') {
      return html` <div id="health" class="budget">
        <h2 class="category">${this.budget.category} 🍎</h2>
        <hr />
        <h3 class="funds">
          Budget: <span class="funds-number">${this.budget.fundsRemaining}€ / ${Math.round(this.budget.funds)}€</span>
        </h3>
        <h4>total earnings: <span class="earnings">${this.sumUserMonthEarnings.totalSum}€</span></h4>
        <h4>${this.budget.category} expenditures: <span class="expenditures">${this.budget.expenses}€</span></h4>
      </div>`;
    } else if (this.budget.category == 'other') {
      return html` <div id="other" class="budget">
        <h2 class="category">${this.budget.category} ❔</h2>
        <hr />
        <h3 class="funds">
          Budget: <span class="funds-number">${this.budget.fundsRemaining}€ / ${Math.round(this.budget.funds)}€</span>
        </h3>
        <h4>total earnings: <span class="earnings">${this.sumUserMonthEarnings.totalSum}€</span></h4>
        <h4>${this.budget.category} expenditures: <span class="expenditures">${this.budget.expenses}€</span></h4>
      </div>`;
    }
  }

  async calculateTarget() {
    if (this.budget.budgetingStyle == 'spender') {
      if (this.budget.category == 'rent') {
        this.budget.target = 0.3;
      }
      if (this.budget.category == 'house') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'leisure') {
        this.budget.target = 0.075;
      }
      if (this.budget.category == 'food') {
        this.budget.target = 0.15;
      }
      if (this.budget.category == 'clothes') {
        this.budget.target = 0.1;
      }
      if (this.budget.category == 'travel') {
        this.budget.target = 0.075;
      }
      if (this.budget.category == 'insurance') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'health') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'other') {
        this.budget.target = 0.05;
      }
    } else if (this.budgetingStyle == 'saver') {
      if (this.budget.category == 'rent') {
        this.budget.target = 0.25;
      }
      if (this.budget.category == 'house') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'leisure') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'food') {
        this.budget.target = 0.1;
      }
      if (this.budget.category == 'clothes') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'travel') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'insurance') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'health') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'other') {
        this.budget.target = 0.05;
      }
    } else {
      if (this.budget.category == 'rent') {
        this.budget.target = 0.3;
      }
      if (this.budget.category == 'house') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'leisure') {
        this.budget.target = 0.075;
      }
      if (this.budget.category == 'food') {
        this.budget.target = 0.15;
      }
      if (this.budget.category == 'clothes') {
        this.budget.target = 0.075;
      }
      if (this.budget.category == 'travel') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'insurance') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'health') {
        this.budget.target = 0.05;
      }
      if (this.budget.category == 'other') {
        this.budget.target = 0.0;
      }
    }
  }

  async calculateBudget() {
    const calculatedFunds = this.budget.target * Number(this.sumUserMonthEarnings.totalSum);
    Math.round(calculatedFunds);
    this.budget.funds = calculatedFunds;
  }

  async selectExpenditure() {
    if (this.budget.category == 'rent') {
      this.budget.expenses = this.sumUserMonthExpenditures.rent;
    } else if (this.budget.category == 'house') {
      this.budget.expenses = this.sumUserMonthExpenditures.house;
    } else if (this.budget.category == 'leisure') {
      this.budget.expenses = this.sumUserMonthExpenditures.leisure;
    } else if (this.budget.category == 'food') {
      this.budget.expenses = this.sumUserMonthExpenditures.food;
    } else if (this.budget.category == 'clothes') {
      this.budget.expenses = this.sumUserMonthExpenditures.clothes;
    } else if (this.budget.category == 'travel') {
      this.budget.expenses = this.sumUserMonthExpenditures.travel;
    } else if (this.budget.category == 'insurance') {
      this.budget.expenses = this.sumUserMonthExpenditures.insurance;
    } else if (this.budget.category == 'health') {
      this.budget.expenses = this.sumUserMonthExpenditures.health;
    } else if (this.budget.category == 'other') {
      this.budget.expenses = this.sumUserMonthExpenditures.other;
    }
  }

  async calculateFundsRemaining() {
    this.budget.fundsRemaining = Math.round(this.budget.funds - this.budget.expenses);
  }
}
