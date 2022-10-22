/* Autor: Christopher Lupton (FH Münster) */

import { LitElement } from 'lit';
import sinon from 'sinon';
import { fixture } from '@open-wc/testing-helpers';
import { httpClient } from '../../http-client';
import './user-change-password';
import { expect } from 'chai';

describe('app-user-change-password', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should fetch the page on first update', async () => {
    const stub = sinon.stub(httpClient, 'get');
    const element = (await fixture('<app-user-change-password></app-user-change-password>')) as LitElement;
    await element.updateComplete;
    expect(stub.calledOnce).to.be.true;
  });
});
