/* Autor: Christopher Lupton (FH Münster) */

import { html, LitElement } from 'lit';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client';
import './user-details';
import { expect } from 'chai';

describe('app-user-details', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the page on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-user-details></app-user-details>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    expect(stub.calledOnce).to.be.true;
  });

  it('should render 5 div elements', async () => {
    const element = (await fixture(html`<app-user-details></app-user-details>`)) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const inputElements = element.shadowRoot!.querySelectorAll('div');
    expect(inputElements.length).to.equal(6);
  });
});
