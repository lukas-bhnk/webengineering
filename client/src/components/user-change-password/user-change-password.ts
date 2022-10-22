/* Autor: Christopher Lupton */

import { html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './user-change-password.css';

export interface User {
  id: string;
  password: string;
}

@customElement('app-user-change-password')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class UserChangePasswordComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @property() id!: string;

  @query('form') private form!: HTMLFormElement;

  @query('#oldPassword') private oldPasswordElement!: HTMLInputElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  @state() private user!: User;

  async firstUpdated() {
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
    return html` ${this.renderNotification()}
      <h1>Password settings</h1>
      <h2>Please insert the necessary information</h2>
      <form novalidate>
        <div>
            <label for="old-password"<Old Password</label>
            <input type="password" id="oldpassword" required minlength="10" id="old-password" />
            <div class="invalid-feedback">Password does not match your old Password</div>
        </div>
        <div>
            <label for="password">Passwort</label>
            <input type="password" id="password" required minlength="10" id="password" />
            <div class="invalid-feedback">Password is required and has to have a length of 10</div>
        </div>
        <div>
            <label for="password-check">Passwort erneut eingeben</label>
            <input type="password" id="password-check" required minlength="10" id="password-check" />
            <div class="invalid-feedback">
                Password has to be inserted a seconed time and has to match the first password.
        </div>
        <button type="button" @click="${this.submit}">save</button>
        <button type="button" @click="${this.cancel}">cancel</button>
      </form>`;
  }

  async submit() {
    if (this.isFormValid()) {
      const updatedUser: User = {
        ...this.user,
        password: this.passwordElement.value
      };
      try {
        await httpClient.patch('/users/' + updatedUser.id, updatedUser);
        this.showNotification('Password has successfully been updated');
        router.navigate('users/profile');
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

  isFormValid() {
    if (this.passwordElement.value !== this.passwordCheckElement.value) {
      this.passwordCheckElement.setCustomValidity('Passwords have to match');
    } else {
      this.passwordCheckElement.setCustomValidity('');
    }
    return this.form.checkValidity();
  }

  cancel() {
    router.navigate('users/profile');
  }
}
