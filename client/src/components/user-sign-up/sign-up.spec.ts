/* Autor: Christopher Lupton (FH Münster) */

import { html, LitElement } from 'lit';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client';
import './sign-up';
import { expect } from 'chai';

describe('app-sign-up', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render heading', async () => {
    const element = (await fixture(html`<app-sign-up></app-sign-up>`)) as LitElement;
    await element.updateComplete;
    const notificationElement = element.shadowRoot!.querySelectorAll('h1');
    expect(notificationElement.length).to.equal(1);
  });
});
