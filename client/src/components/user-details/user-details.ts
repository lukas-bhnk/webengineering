/* Autor: Christopher Lupton (FH Münster) */

import { html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './user-details.css';

export interface User {
  id: string;
  name: string;
  email: string;
  goal: string;
}

@customElement('app-user-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserDetailsComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() id!: string;

  @query('form') private form!: HTMLFormElement;

  @query('#name') private nameElement!: HTMLInputElement;

  @query('#email') private emailElement!: HTMLInputElement;

  @query('#goal') private goalElement!: HTMLInputElement;

  @state() private user!: User;

  async connectedCallback() {
    super.connectedCallback();
    await this.updateValues();
  }

  async updateValues() {
    try {
      const response = await httpClient.get('/users/' + this.id);
      this.user = await response.json();
      this.requestUpdate();
      await this.updateComplete;
    } catch (e) {
      if ((e as { statusCode: number }).statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.showNotification((e as Error).message, 'error');
      }
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Hello ${this.user?.name || ''}</h1>
      <h2>This is your Profile</h2>
      <form novalidate>
        <div>
          <label for="name">Name: </label>
          <input type="text" autofocus required id="name" .value=${this.user?.name || ''} />
          <div class="invalid-feedback">Name is required</div>
        </div>
        <div>
          <label for="email">E-Mail</label>
          <input type="email" required id="email" .value=${this.user?.email || ''} />
          <div class="invalid-feedback">E-Mail is required and has to be valid</div>
        </div>
        <div>
          <label for="goal">Your Goal</label>
          <textarea type="text" id="goal" cols="40" rows="5" .value=${this.user?.goal || ''}></textarea>
        </div>
        <button type="button" @click="${this.submit}">save</button>
        <button type="button" @click="${this.cancel}">cancel</button>
      </form>
      <div class="child buttons">
        <button type="button" @click="${this.changePassword}">Change Password</button>
        <button type="button" @click="${this.deleteUser}">Delete User</button>
      </div>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const updatedUser: User = {
        ...this.user,
        name: this.nameElement.value,
        email: this.emailElement.value,
        goal: this.goalElement.value
      };
      try {
        await httpClient.patch('/users/' + updatedUser.id, updatedUser);
        await this.updateValues();
      } catch (e) {
        if ((e as { statusCode: number }).statusCode === 401) {
          router.navigate('/users/sign-in');
        } else {
          this.showNotification((e as Error).message, 'error');
        }
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  cancel() {
    router.navigate('/overview');
  }

  isFormValid() {
    return this.form.checkValidity();
  }

  changePassword() {
    router.navigate('users/changepassword');
  }

  deleteUser() {
    router.navigate('users/delete');
  }
}
