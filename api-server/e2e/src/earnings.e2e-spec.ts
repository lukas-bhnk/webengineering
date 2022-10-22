/* Autor: Lukas Behnke (FH Münster) */

import { expect } from 'chai';
import { UserSession } from './user-session.js';

describe('/earnings', () => {
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
      const response = await userSession.post('/earnings', {
        title: 'Testearning 1',
        description: 'test',
        creationDate: '2022-05-12',
        amount: '2',
        category: 'salary'
      });
      expect(response.status).to.equal(200);
    });
  });

  describe('#GET', () => {
    it('should return a list with a single earning', async () => {
      await userSession.post('/earnings', {
        title: 'Testearning 1',
        description: 'test',
        creationDate: '2022-05-12',
        amount: '2',
        category: 'salary'
      });

      const response = await userSession.get('/earnings');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Record<string, string>> };
      expect(json.results.length).to.equal(1);
      expect(json.results[0].title).to.equal('Testearning 1');
    });

    it('should return a list of earnings by month and year', async () => {
      await userSession.post('/earnings', {
        title: 'Testearning 1',
        description: 'test',
        creationDate: '2022-05-12',
        amount: '2',
        category: 'salary'
      });

      await userSession.post('/earnings', {
        title: 'Testearning 2',
        description: 'test',
        creationDate: '2022-05-30',
        amount: '2',
        category: 'dividend'
      });

      const response = await userSession.get('/earnings/05/2022');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Record<string, string>> };
      expect(json.results.length).to.equal(2);
      expect(json.results[0].title).to.equal('Testearning 1');
      expect(json.results[1].title).to.equal('Testearning 2');
    });

    it('should return a list of the latest five entries, latest should be the first', async () => {
      await userSession.post('/earnings', { title: 'Testearning 1', creationDate: '2022-05-12' });
      await userSession.post('/earnings', { title: 'Testearning 2', creationDate: '2022-05-12' });
      await userSession.post('/earnings', { title: 'Testearning 3', creationDate: '2022-05-12' });
      await userSession.post('/earnings', { title: 'Testearning 4', creationDate: '2022-05-15' });
      await userSession.post('/earnings', { title: 'Testearning 5', creationDate: '2022-05-17' });
      await userSession.post('/earnings', { title: 'Testearning 6', creationDate: '2022-05-19' });

      const response = await userSession.get('/earnings/latestFiveEntries/05/2022');
      expect(response.status).to.equal(200);
      const json = (await response.json()) as { results: Array<Record<string, string>> };
      expect(json.results.length).to.equal(5);
      expect(json.results[0].title).to.equal('Testearning 2');
      expect(json.results[4].title).to.equal('Testearning 6');
    });
  });
  describe('#PATCH', () => {
    it('patch all values and should get all updated values', async () => {
      await userSession.post('/earnings', {
        title: 'Testearning 1',
        description: 'test',
        creationDate: '2022-05-12',
        amount: '2',
        category: 'salary'
      });
      const response = await userSession.get('/earnings/05/2022');
      const prePatch = (await response.json()) as { results: Array<Record<string, string>> };

      const response2 = await userSession.patch('/earnings/' + prePatch.results[0].id, {
        title: 'Testearning patched',
        description: 'patch',
        creationDate: '2022-06-20',
        amount: '12',
        category: 'dividend'
      });
      expect(response2.status).to.equal(200);

      const response3 = await userSession.get('/earnings/06/2022');
      const json = (await response3.json()) as { results: Array<Record<string, string>> };

      expect(json.results.length).to.equal(1);
      expect(json.results[0].title).to.equal('Testearning patched');
      expect(json.results[0].creationDate).to.equal('2022-06-20');
      expect(json.results[0].category).to.equal('dividend');
      expect(json.results[0].month).to.equal('06');
      expect(json.results[0].year).to.equal('2022');
    });
  });
});
