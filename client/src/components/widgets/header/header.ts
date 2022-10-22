/* Autor: Lukas Behnke (FH Münster) */

import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import componentStyle from './header.css';

@customElement('app-header')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HeaderComponent extends LitElement {
  static styles = componentStyle;

  @property({ type: Array }) linkItems: Array<{ title: string; routePath: string }> = [];

  @state() menuOpen = false;

  render() {
    return html`
      <a href="/" title="Home" class="logo-container">
        <base src="/" />
        <img src="./logo.png" alt="Piggy Bank" class="logo" />
        <h1>Piggy Bank</h1>
      </a>
      <span class="menu-button" @click="${this.toggleMenu}"></span>
      <ol ?open=${this.menuOpen}>
        ${this.linkItems.map(
          linkItem =>
            html`
              <li>
                <a href="${linkItem.routePath}" @click=${this.closeMenu} class="menu">${linkItem.title}</a>
              </li>
            `
        )}
      </ol>
    `;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
