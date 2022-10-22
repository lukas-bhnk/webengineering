/* Autor: Sain Larlee-Matthews (FH Münster) */

import { timeStamp } from 'console';
import { LitElement, html, render } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { httpClient } from '../../../http-client.js';
import { router } from '../../../router/router.js';
import { PageMixin } from '../../page.mixin.js';

import sharedStyle from '../../shared.css';
import componentStyle from './tip.css';

interface Tip {
  id: string;
  category: 'rent' | 'house' | 'leisure' | 'food' | 'clothes' | 'travel' | 'insurance' | 'health' | 'other';
  text: string;
}

@customElement('app-tip')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TipComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() tip!: Tip;

  render() {
    if (this.tip.category == 'rent')
      return html`<div class="post" id="rent">
        <center><h5>Rent ${this.tip.id}</h5></center>
        <hr />
        <span id="tip-text">${this.tip.text ? html`${this.tip.text}<br />` : ''}</span>
      </div>`;
    if (this.tip.category == 'house')
      return html`<div class="post" id="house">
        <center><h5>House</h5></center>
        <hr />
        <span id="tip-text">${this.tip.text ? html`${this.tip.text}<br />` : ''}</span>
      </div>`;
    if (this.tip.category == 'food')
      return html`<div class="post" id="food">
        <center><h5>Food</h5></center>
        <hr />
        <span id="tip-text">${this.tip.text ? html`${this.tip.text}<br />` : ''}</span>
      </div>`;
    if (this.tip.category == 'leisure')
      return html`<div class="post" id="leisure">
        <center><h5>Leisure</h5></center>
        <hr />
        <span id="tip-text">${this.tip.text ? html`${this.tip.text}<br />` : ''}</span>
      </div>`;
    if (this.tip.category == 'insurance')
      return html`<div class="post" id="insurance">
        <center><h5>Insurance</h5></center>
        <hr />
        <span id="tip-text">${this.tip.text ? html`${this.tip.text}<br />` : ''}</span>
      </div>`;
    if (this.tip.category == 'travel')
      return html`<div class="post" id="travel">
        <center><h5>Travel</h5></center>
        <hr />
        <span id="tip-text">${this.tip.text ? html`${this.tip.text}<br />` : ''}</span>
      </div>`;
    if (this.tip.category == 'clothes')
      return html`<div class="post" id="clothes">
        <center><h5>Clothes</h5></center>
        <hr />
        <span id="tip-text">${this.tip.text ? html`${this.tip.text}<br />` : ''}</span>
      </div>`;
    if (this.tip.category == 'health')
      return html`<div class="post" id="health">
        <center><h5>Health</h5></center>
        <hr />
        <span id="tip-text">${this.tip.text ? html`${this.tip.text}<br />` : ''}</span>
      </div>`;
    if (this.tip.category == 'other')
      return html`<div class="post" id="other">
        <center><h5>Other</h5></center>
        <hr />
        <span id="tip-text">${this.tip.text ? html`${this.tip.text}<br />` : ''}</span>
      </div> `;
    else return html`<p>There are no tips available to display.</p>`;
  }
}
