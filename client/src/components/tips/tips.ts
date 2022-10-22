/* Autor: Sain Larlee-Matthews (FH Münster) */

import { timeStamp } from 'console';
import { LitElement, html, render } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './tips.css';

interface Tip {
  id?: string;
  category: string;
  text: string;
}

@customElement('app-tips')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TipsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() tip!: Tip;

  @state() private tipId!: string;

  @state() private _tips: Tip[] = [];

  @query('#newTip') private input!: HTMLInputElement;
  @query('#category') private select!: HTMLInputElement;
  @query('form') private form!: HTMLFormElement;
  @query('#text') private textElement!: HTMLInputElement;

  async firstUpdated() {
    this.updateTips();
  }

  async updateTips() {
    try {
      this.startAsyncInit();
      const response = await httpClient.get('/tips' + location.search);
      const responseTips = (await response.json()).results;
      this._tips = responseTips;
      this.delay(500);
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
      <h1>General Financial Tips</h1>
      <h4>Tips to save money!</h4>
      <h5>Do you have a good tip for saving money?</h5>
      <form>
        <label for="category">Choose the tip category:</label>
        <select input name="category" id="category" required>
          <option value="rent" selected>Rent</option>
          <option value="house">House</option>
          <option value="leisure">Leisure</option>
          <option value="food">Food</option>
          <option value="clothes">Clothes</option>
          <option value="travel">Travel</option>
          <option value="insurance">Insurance</option>
          <option value="health">Health</option>
          <option value="other">Other</option>
        </select>
        <input
          type="textarea"
          maxlength="250"
          minlength="30"
          rows="30"
          cols="50"
          id="newTip"
          placeholder="Enter your tip here!"
          required
        />
        <br />
        <button class="button" @click="${this.submit}">Add tip</button>
      </form>
      <div class="container">${this.renderTips()}</div>
    `;
  }
  renderTips() {
    return html`${repeat(
      this._tips,
      tip => tip.id,
      tip => html` <app-tip .tip=${tip}></app-tip>`
    )}`;
  }

  checkValue() {
    if (this._tips.length == 0) {
      this._tips = [
        {
          category: 'food',
          text: 'You can save an average of 1000€ by cooking at home instead of eating out.'
        },
        { category: 'leisure', text: 'Experiencing nature is often times free!' },
        { category: 'rent', text: 'Having a roommate can save you a lot of money each month.' },
        {
          category: 'house',
          text: 'Use toothpaste to fill holes in walls to potentially prevent unnecessary high-cost repairs.'
        },
        {
          category: 'clothes',
          text: 'You can often get designer clothes at a fraction of the cost by buying second-hand!'
        },
        { category: 'insurance', text: 'Do some research to make sure you only pay for coverage you need.' },
        {
          category: 'travel',
          text: 'Booking plane tickets between 1-4 months before your vacation is the sweet-spot for paying the cheapest flight prices.'
        },
        {
          category: 'health',
          text: 'A monthly gym membership may seem like an extra expence, but investing in your health early can save a fortune in the long-haul.'
        }
      ];
      this._tips.map(tip => {
        this.postTip(tip);
        this.updateTips;
      });
    }
  }

  delay(timeoutPeriod: any) {
    setTimeout(() => {
      this.checkValue();
    }, timeoutPeriod);
  }
  async submit() {
    if (this.isFormValid()) {
      const partialTip: Partial<Tip> = { category: String(this.select.value), text: String(this.input.value) };
      try {
        await httpClient.post('/tips', partialTip);
        this.input.value = '';
        this.select.value = 'rent';
        await this.updateTips();
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  async postTip(tip: Tip) {
    await httpClient.post('/tips', tip);
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
