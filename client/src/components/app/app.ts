/* Autor: Lukas Behnke (FH Münster)*/

import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import componentStyle from './app.css';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  static styles = componentStyle;

  @state() private linkItems = [
    { title: 'Overview', routePath: 'overview' },
    { title: 'Tips', routePath: 'tips' },
    { title: 'Planner', routePath: 'finances' },
    { title: 'Create account', routePath: 'users/sign-up' },
    { title: 'Sign in', routePath: 'users/sign-in' },
    { title: 'Sign out', routePath: 'users/sign-out' },
    { title: 'User Profile', routePath: 'users/profile' }
  ];

  constructor() {
    super();
    const port = location.protocol === 'https:' ? 3443 : 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }
  render() {
    return html`
      <app-header .linkItems=${this.linkItems}> </app-header>
      <div class="main">${this.renderRouterOutlet()}</div>
    `;
  }

  firstUpdated() {
    router.subscribe(() => this.requestUpdate());
  }

  renderRouterOutlet() {
    return router.select(
      {
        'users/sign-in': () => html`<app-sign-in></app-sign-in>`,
        'users/sign-up': () => html`<app-sign-up></app-sign-up>`,
        'users/sign-out': () => html`<app-sign-out></app-sign-out>`,
        'users/profile': () => html`<app-user-details></app-user-details>`,
        'users/changepassword': () => html`<app-user-change-password></app-user-change-password>`,
        'users/delete': () => html`<app-user-delete></app-user-delete>`,
        'earnings/:month/:year': params =>
          html` <app-earnings .month=${params.month} .year=${params.year}></app-earnings>`,
        'earnings-details/:id': params =>
          html`<app-earning-details
            .month=${params.month}
            .year=${params.year}
            .earningId=${params.id}
          ></app-earning-details>`,
        'earnings-add/:month/:year': params =>
          html`<app-earning-details .month=${params.month} .year=${params.year}></app-earning-details>`,
        'expenditures/:month/:year': params =>
          html` <app-expenditures .month=${params.month} .year=${params.year}></app-expenditures>`,
        'expenditures-details/:id': params =>
          html`<app-expenditure-details
            .month=${params.month}
            .year=${params.year}
            .expenditureId=${params.id}
          ></app-expenditure-details>`,
        'expenditures-add/:month/:year': params =>
          html`<app-expenditure-details .month=${params.month} .year=${params.year}></app-earning-details>`,
        'overview/:month/:year': params =>
          html` <app-overview .month=${params.month} .year=${params.year}></app-overview>`,
        'tip': params => html`<app-tip .tipId=${params.id}></app-tip>`,
        'tips': params => html`<app-tips .tipId=${params.id}></app-tips>`,
        'tips/:userId': params => html`<app-tips .userId=${params.userId}></app-tips>`,
        'tips/:financeId': params => html`<app-tips .financeId=${params.financeId}></app-tips>`,
        'finances': () => html`<app-finances .month=${this.getMonth()} .year=${this.getYear()}></app-finances>`,
        'finances/:year': params => html`<app-finances .year=${params.year}</app-finances>`,
        'finances/:month/:year': params =>
          html`<app-finances .month=${params.month} .year=${params.year} .financesId=${params.id}></app-finances>`,
        'budgets/:month/:year': params => html`<app-budgets .month=${params.month} .year=${params.year}></app-budgets>`,
        'budget/:month/:year': params =>
          html`<app-budgets .month=${params.month} .year=${params.year} .budgetId=${params.id}></app-budgets>`
      },
      () => html` <app-overview .month=${this.getMonth()} .year=${this.getYear()}></app-overview>`
    );
  }

  getMonth() {
    const month = new Date().getMonth() + 1;
    if (month <= 9) return '0' + month;
    return month;
  }

  getYear() {
    const year = new Date();
    return year.getFullYear();
  }
}
