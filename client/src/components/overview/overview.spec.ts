/* Lukas Behnke (FH Münster) */

import { expect } from 'chai';
import sinon from 'sinon';
import { html, LitElement } from 'lit';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client.js';
import './overview';

describe('app-overview', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the overview on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-overview></app-overview>')) as LitElement;
    await element.updateComplete;
    sinon.assert.callCount(stub, 4);
  });

  it('should render two doughnut-charts', async () => {
    const element = (await fixture(html` <app-overview month="05" year="2022"></app-overview>`)) as LitElement;
    await element.updateComplete;
    element.requestUpdate(); // da in firstUpdated() das Property overviews asynchron gesetzt wird
    await element.updateComplete;

    const doughnutElements = element.shadowRoot!.querySelectorAll('app-doughnut-chart');
    expect(doughnutElements.length).to.equal(2);
  });

  it('should render two snippets with one for earnings and one for expenditures', async () => {
    const element = (await fixture(html` <app-overview month="05" year="2022"></app-overview>`)) as LitElement;
    await element.updateComplete;
    element.requestUpdate(); // da in firstUpdated() das Property overviews asynchron gesetzt wird
    await element.updateComplete;

    const expenditureElems = element.shadowRoot!.querySelectorAll('app-snippet');
    expect(expenditureElems.length).to.equal(2);
  });
});
