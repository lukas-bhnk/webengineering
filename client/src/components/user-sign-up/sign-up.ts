/* Autor: Christopher Lupton (FH Münster) */

import { html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { httpClient } from '../../http-client.js';
import { router } from '../../router/router.js';
import { PageMixin } from '../page.mixin.js';

import sharedStyle from '../shared.css';
import componentStyle from './sign-up.css';

interface User {
  name: string;
  email: string;
  password: string;
  goal: string;
}

@customElement('app-sign-up')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [sharedStyle, componentStyle];

  @state() private users: User[] = [];

  @query('form') private form!: HTMLFormElement;

  @query('#name') private nameElement!: HTMLInputElement;

  @query('#email') private emailElement!: HTMLInputElement;

  @query('#password') private passwordElement!: HTMLInputElement;

  @query('#password-check') private passwordCheckElement!: HTMLInputElement;

  @query('#goal') private goalElement!: HTMLInputElement;

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Create Account</h1>
      <h2>Welcome to Piggy-Bank, your chance to manage your Money easy and uncomplicated!</h2>
      <form novalidate>
        <div>
          <label for="name">Name</label>
          <input type="name" autofocus required id="name" />
          <div class="invalid-feedback">Name is required</div>
        </div>
        <div>
          <label for="email">E-Mail</label>
          <input type="email" required id="email" />
          <div class="invalid-feedback">E-Mail is required and has to be valid</div>
        </div>
        <div>
          <label for="password">Password</label>
          <input type="password" required minlength="10" id="password" />
          <div class="invalid-feedback">Password is required and has to have a length of 10</div>
        </div>
        <div>
          <label for="password-check">Please repeat password</label>
          <input type="password" required minlength="10" id="password-check" />
          <div class="invalid-feedback">
            Password has to be inserted a seconed time and has to match the first password.
          </div>
        </div>
        <div>
          <label for="goal">You can add your personal saving goal here to be revisit this at a later time</label>
          <textarea name="goal" id="goal" cols="40" rows="5"></textarea>
        </div>
        <button type="button" id="save" @click="${this.submit}">Create Account</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      const accountData = {
        name: this.nameElement.value,
        email: this.emailElement.value,
        password: this.passwordElement.value,
        passwordCheck: this.passwordCheckElement.value,
        goal: this.goalElement.value
      };
      try {
        const response = await httpClient.post('/users', accountData);
        const user: User = await response.json();
        this.users = [...this.users, user];
        router.navigate('/overview');
      } catch (e) {
        this.showNotification((e as Error).message, 'error');
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
}
