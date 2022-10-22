/* Autor: Lukas Behnke (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import componentStyle from './expenditure.css';

@customElement('app-expenditure')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TaskComponent extends LitElement {
  static styles = componentStyle;

  render() {
    return html`
      <slot name="title" @click="${() => this.emit('appexpenditureclick')}"></slot>
      <slot name="amount" @click="${() => this.emit('appexpenditureclick')}"></slot>
      <slot name="category" @click="${() => this.emit('appexpenditureclick')}"></slot>
      <slot name="no-entries" @click="${() => this.emit('appexpenditureclick')}"></slot>
      <span class="remove-expenditure" @click="${() => this.emit('appexpenditureremoveclick')}"></span>
    `;
  }

  emit(eventType: string, eventData = {}) {
    const event = new CustomEvent(eventType, {
      detail: eventData,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}
