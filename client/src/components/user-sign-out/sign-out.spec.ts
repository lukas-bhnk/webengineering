/* Autor: Christopher Lupton (FH Münster) */

import { html, LitElement } from 'lit';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import './sign-out';
import { expect } from 'chai';

describe('app-sign-out', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render notification', async () => {
    const element = (await fixture(html`<app-sign-out></app-sign-out>`)) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;
    const notificationElement = element.shadowRoot!.querySelectorAll('app-notification');
    expect(notificationElement.length).to.equal(1);
  });
});
