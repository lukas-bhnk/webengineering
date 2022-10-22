/* Autor: Lukas Behnke (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import componentStyle from './earning.css';

@customElement('app-earning')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TaskComponent extends LitElement {
  static styles = componentStyle;

  render() {
    return html`
      <slot name="title" @click="${() => this.emit('appearningclick')}"></slot>
      <slot name="amount" @click="${() => this.emit('appearningclick')}"></slot>
      <slot name="category" @click="${() => this.emit('appearningclick')}"></slot>
      <slot name="no-entries" @click="${() => this.emit('appearningclick')}"></slot>
      <span class="remove-earning" @click="${() => this.emit('appearningremoveclick')}"></span>
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
