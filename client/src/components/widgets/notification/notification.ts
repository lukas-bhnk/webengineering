/* Autor: Christopher Lupton (FH Münster) */

import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import componentstyle from './notification.css';

@customElement('app-notification')
//eslint-disable-next-line @typescript-eslint/no-unused-vars
class NotifcationComponent extends LitElement {
  static styles = componentstyle;

  @property() content = '';
  @property() type: 'error' | 'info' = 'info';

  render() {
    return html` ${this.content ? html`<div class="${this.type}">${this.content}</div>` : nothing}`;
  }
}
