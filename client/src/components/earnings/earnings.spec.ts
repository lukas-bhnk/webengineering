/* Lukas Behnke (FH Münster) */

import { expect } from 'chai';
import sinon from 'sinon';
import { LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';
import './earnings';

describe('app-earnings', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the earnings on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-earnings></app-earnings>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });

  it('should render placeholder "No Entries", when there is no entry for this month', async () => {
    const earnings: unknown[] = [];

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: earnings });
        }
      } as Response)
    );

    const element = (await fixture('<app-earnings></app-earnings>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const earningElems = element.shadowRoot!.querySelectorAll('app-earning');
    expect(earningElems.length).to.equal(1);
    const noEntries: string = earningElems[0].innerHTML;
    expect(noEntries).to.be.a('string').that.contains('No Entries');
  });

  it('should render the fetched earnings', async () => {
    const earnings = [
      { id: 1, title: 'Earning 1', amount: '12', category: 'salary' },
      { id: 2, title: 'Earning 2', amount: '20', category: 'dividend' }
    ];

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: earnings });
        }
      } as Response)
    );

    const element = (await fixture('<app-earnings></app-earnings>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const earningElems = element.shadowRoot!.querySelectorAll('app-earning');
    expect(earningElems.length).to.equal(2);
  });
});
