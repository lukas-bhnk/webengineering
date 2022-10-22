/* Autor: Christopher Lupton (FH Münster) */

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';
import sharedStyle from '../shared.css';
import componentStyle from './user-delete.css';

@customElement('app-user-delete')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserDeleteComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  async firstUpdated() {
    try {
      await httpClient.delete('/users');
      this.showNotification('Your account has been deleted successfully!');
    } catch (e) {
      this.showNotification((e as Error).message, 'error');
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Good Bye 👋 Sorry to see you go!</h1>
      <h2>Didn't want to delete your Account?</h2>
      <h3>No Problem! We got 2 Options for you:</h3>
      <p>Sadly all of your data has been lost. Still you can create a new Account</p>
      <button type="button" id="sign-up" @click="${this.createAccount}">Create Account</button>
    `;
  }

  createAccount() {
    router.navigate('/users/sign-up');
  }
}
