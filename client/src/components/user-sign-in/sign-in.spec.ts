/* Autor: Christopher Lupton (FH Münster) */

import { html, LitElement } from 'lit';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import './sign-in';
import { expect } from 'chai';

describe('app-sign-in', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should render 2 label elements', async () => {
    const element = (await fixture(html`<app-sign-in></app-sign-in>`)) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const inputElements = element.shadowRoot!.querySelectorAll('label');
    expect(inputElements.length).to.equal(2);
  });
});
