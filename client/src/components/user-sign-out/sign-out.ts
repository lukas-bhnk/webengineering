/* Autor: Christopher Lupton (FH Münster) */

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import sharedStyle from '../shared.css';
import componentStyle from './sign-out.css';

@customElement('app-sign-out')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  async firstUpdated() {
    try {
      await httpClient.delete('/users/sign-out');
      this.showNotification('You have been signout successfully!');
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Good Bye 👋</h1>
      <h2>Didn't want to leave or are here without an Account?</h2>
      <h3>No Problem! We got 2 Options for you:</h3>
      <div class="child buttons">
        <button type="button" id="sign-in" @click="${this.signIn}">Sign In</button>
        <button type="button" id="sign-up" @click="${this.createAccount}">Create Account</button>
      </div>
    `;
  }

  signIn() {
    router.navigate('/users/sign-in');
  }

  createAccount() {
    router.navigate('/users/sign-up');
  }
}
