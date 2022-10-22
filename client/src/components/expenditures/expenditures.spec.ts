/* Lukas Behnke (FH Münster) */

import { expect } from 'chai';
import sinon from 'sinon';
import { LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';
import './expenditures';

describe('app-expenditures', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the expenditures on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-expenditures></app-expenditures>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });

  it('should render placeholder "No Entries", when there is no entry for this month', async () => {
    const expenditures: unknown[] = [];

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: expenditures });
        }
      } as Response)
    );

    const element = (await fixture('<app-expenditures></app-expenditures>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate(); // da in firstUpdated() das Property expenditures asynchron gesetzt wird
    await element.updateComplete;

    const expenditureElems = element.shadowRoot!.querySelectorAll('app-expenditure');
    expect(expenditureElems.length).to.equal(1);
    const noEntries: string = expenditureElems[0].innerHTML;
    expect(noEntries).to.be.a('string').that.contains('No Entries');
  });

  it('should render two expenditure entries', async () => {
    const expenditures = [
      { id: 1, title: 'Expenditure 1', amount: '12', category: 'salary' },
      { id: 2, title: 'Expenditure 2', amount: '20', category: 'dividend' }
    ];

    sinon.stub(httpClient, 'get').returns(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: expenditures });
        }
      } as Response)
    );

    const element = (await fixture('<app-expenditures></app-expenditures>')) as LitElement;
    await element.updateComplete;
    element.requestUpdate(); // da in firstUpdated() das Property expenditures asynchron gesetzt wird
    await element.updateComplete;

    const expenditureElems = element.shadowRoot!.querySelectorAll('app-expenditure');
    expect(expenditureElems.length).to.equal(2);
  });
});
