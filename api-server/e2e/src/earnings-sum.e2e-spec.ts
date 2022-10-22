/* Autor: Lukas Behnke (FH Münster) */

import { expect } from 'chai';
import { UserSession } from './user-session.js';

describe('/sumsUserMonthEarnings', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#POST', () => {
    it('should answer with status code 200', async () => {
      const response = await userSession.post('/sumsUserMonthEarnings', {
        month: '05',
        year: '2022',
        totalSum: '200',
        salary: '100',
        rental: '101',
        dividend: '80',
        refund: '10',
        gift: '1111',
        other: '33'
      });
      expect(response.status).to.equal(200);
    });
  });

  describe('#GET', () => {
    it('check if you get all values, with parameter month and year', async () => {
      await userSession.post('/sumsUserMonthEarnings', {
        month: '05',
        year: '2022',
        totalSum: '200.06',
        salary: '100',
        rental: '101.05',
        dividend: '80',
        refund: '10',
        gift: '1111',
        other: '33'
      });

      const response = await userSession.get('/sumsUserMonthEarnings/05/2022');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as Record<string, string>;
      expect(json.totalSum).to.equal(200.06);
      expect(json.salary).to.equal(100);
      expect(json.rental).to.equal(101.05);
      expect(json.dividend).to.equal(80);
      expect(json.refund).to.equal(10);
      expect(json.gift).to.equal(1111);
      expect(json.other).to.equal(33);
    });

    it('should return a sum with all values 0', async () => {
      const response = await userSession.get('/sumsUserMonthEarnings/05/2022');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as Record<string, string>;
      expect(json.totalSum).to.equal(0);
      expect(json.salary).to.equal(0);
      expect(json.rental).to.equal(0);
      expect(json.dividend).to.equal(0);
      expect(json.refund).to.equal(0);
      expect(json.gift).to.equal(0);
      expect(json.other).to.equal(0);
    });
  });

  describe('#PATCH', () => {
    it('should patch the values', async () => {
      await userSession.post('/sumsUserMonthEarnings', {
        month: '05',
        year: '2022',
        totalSum: '200.06',
        salary: '100',
        rental: '101.05',
        dividend: '80',
        refund: '10',
        gift: '1111',
        other: '33'
      });

      const response = await userSession.get('/sumsUserMonthEarnings/05/2022');
      const prePatch = (await response.json()) as Record<string, string>;
      const response2 = await userSession.patch('/sumsUserMonthEarnings/' + prePatch.id, {
        month: '05',
        year: '2022',
        totalSum: '300.06',
        salary: '100',
        rental: '101.05',
        dividend: '90',
        refund: '10',
        gift: '121',
        other: '33'
      });
      expect(response2.status).to.equal(200);
      const response3 = await userSession.get('/sumsUserMonthEarnings/05/2022');
      const json = (await response3.json()) as Record<string, string>;
      expect(json.totalSum).to.equal(300.06);
      expect(json.salary).to.equal(100);
      expect(json.rental).to.equal(101.05);
      expect(json.dividend).to.equal(90);
      expect(json.refund).to.equal(10);
      expect(json.gift).to.equal(121);
      expect(json.other).to.equal(33);
    });
  });
});
