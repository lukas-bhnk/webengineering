/* Lukas Behnke (FH Münster) */

import { expect } from 'chai';
import sinon from 'sinon';
import { html, LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';
import './earning-details';

describe('app-earning-details', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the earning-details on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture(html` <app-earning-details earningId="5"></app-earning-details>`)) as LitElement;
    await element.updateComplete;
    element.requestUpdate(); // da in firstUpdated() das Property earnings asynchron gesetzt wird
    await element.updateComplete;
    sinon.assert.callCount(stub, 1);
  });

  it('should not fetch the earning-details, when no earning id', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture(html` <app-earning-details></app-earning-details>`)) as LitElement;
    await element.updateComplete;
    element.requestUpdate(); // da in firstUpdated() das Property earnings asynchron gesetzt wird
    await element.updateComplete;
    sinon.assert.callCount(stub, 0);
  });

  it('all Input Elements should be rendered with values', async () => {
    const earning = {
      id: '5',
      title: 'Earning 1',
      amount: '20000000',
      category: 'salary',
      creationDate: '2022-04-12',
      description: 'Prof. Dr. Lahme-Hütig ist der beste Prof!!!'
    };

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve(earning);
        }
      } as Response)
    );

    const element = (await fixture(
      html` <app-earning-details earningId="5" month="05" year="2015"></app-earning-details>`
    )) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;
    const title: HTMLInputElement | null = element.shadowRoot!.querySelector('#title');
    expect(title!.value).equal('Earning 1');

    const amount: HTMLInputElement | null = element.shadowRoot!.querySelector('#amount');
    expect(amount!.value).equal('20000000');

    const category: HTMLInputElement | null = element.shadowRoot!.querySelector('#category');
    expect(category!.value).equal('salary');

    const creationDate: HTMLInputElement | null = element.shadowRoot!.querySelector('#creationDate');
    expect(creationDate!.value).equal('2022-04-12');

    const description: HTMLInputElement | null = element.shadowRoot!.querySelector('#description');
    expect(description!.value).equal('Prof. Dr. Lahme-Hütig ist der beste Prof!!!');
  });
});
