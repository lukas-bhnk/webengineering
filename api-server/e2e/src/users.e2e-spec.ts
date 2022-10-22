/* Autor: Christopher Lupton (FH Münster) */

import { expect } from 'chai';
import { User } from '../../src/models/user';
import { UserSession } from './user-session.js';

describe('/users', () => {
  let userSession: UserSession;

  beforeEach(async () => {
    userSession = new UserSession();
    await userSession.registerUser();
  });

  afterEach(async () => {
    await userSession.deleteUser();
  });

  describe('#POST', () => {
    it('should answer with status code 200 when create user was successful', async () => {
      const testUser = {
        email: 'max@mustermann.de',
        name: 'Max Mustermann',
        password: '1234567890',
        passwordCheck: '1234567890'
      };
      const response = await userSession.post('/users', testUser);
      expect(response.status).to.equal(200);
    });

    it('should return status code 400 when information are missing', async () => {
      const testUser = {
        email: 'emil@foo.com',
        password: '1234567890',
        passwordCheck: '1234567890'
      };
      const response = await userSession.post('/users', testUser);
      expect(response.status).to.equal(400);
    });

    it('should return status code 400 when passwords are not the same', async () => {
      const testUser = {
        email: 'emil@foo.de',
        name: 'Emil Mustermann',
        password: '1234567890',
        passwordCheck: 'ontwothreefourfive'
      };
      const response = await userSession.post('/users', testUser);
      expect(response.status).to.equal(400);
    });

    it('should  return status code 201 when user has signed in successfully', async () => {
      const response = await userSession.post('/users/sign-in', userSession.signInData());
      expect(response.status).to.equal(201);
    });

    it('should return status 401 if password is unvalid', async () => {
      const response = await userSession.post('/users/sign-in', {
        email: userSession.email,
        password: '1234567890'
      });
      expect(response.status).to.equal(401);
    });

    it('should return status 401 if email is unvalid', async () => {
      const response = await userSession.post('/users/sign-in', {
        email: 'test@example.org',
        password: userSession.password
      });
      expect(response.status).to.equal(401);
    });
  });

  describe('#GET', async () => {
    it('should return status 200 when user information are available', async () => {
      const response = await userSession.get('/users/' + userSession);
      expect(response.status).to.equal(200);
    });

    it('should return status 404 when no user with id exists', async () => {
      const response = await userSession.get('/users');
      expect(response.status).to.equal(404);
    });
  });

  describe('#PATCH', async () => {
    it('should return status 200 when user information have been changed successfully', async () => {
      const updatedUser: User = {
        name: 'Max Mustermann',
        id: '',
        createdAt: 0,
        email: '',
        password: '',
        goal: ''
      };
      const response = await userSession.patch('/users/' + userSession, updatedUser);
      expect(response.status).to.equal(200);
    });
  });

  describe('#DELETE', async () => {
    it('should sign out user and return status 200', async () => {
      const response = await userSession.delete('/users/sign-out');
      expect(response.status).to.equal(200);
    });

    it('should delete user information and return status 200', async () => {
      const response = await userSession.delete('/users');
      expect(response.status).to.equal(200);
    });
  });
});
