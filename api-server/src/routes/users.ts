/* Autor: Christopher Lupton (FH Münster) */

import express from 'express';
import bcrypt from 'bcryptjs';
import { GenericDAO } from '../models/generic.dao.js';
import { User } from '../models/user.js';
import { authService } from '../services/auth.service.js';
import { Expenditure } from '../models/expenditure.js';
import { Earning } from '../models/earning.js';
import { Budget } from '../models/budget.js';
import { Finance } from '../models/finance.js';
import { Tip } from '../models/tip.js';
import { SumUserMonthEarning } from '../models/SumUserMonthEarning.js';
import { SumUserMonthExpenditure } from '../models/SumUserMonthExpenditure.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];

  const sendErrorMessage = (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };

  if (!hasRequiredFields(req.body, ['email', 'name', 'password', 'passwordCheck'], errors)) {
    return sendErrorMessage(errors.join('\n'));
  }

  if (req.body.password !== req.body.passwordCheck) {
    return sendErrorMessage('Passwords don´t match');
  }

  const filter: Partial<User> = { email: req.body.email };
  if (await userDAO.findOne(filter)) {
    return sendErrorMessage('A user with this email already exists. Please change email');
  }

  const createdUser = await userDAO.create({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
    goal: req.body.goal
  });
  authService.createAndSetToken({ id: createdUser.id }, res);
  res.status(200).json(createdUser);
});

router.post('/sign-in', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { email: req.body.email };
  const errors: string[] = [];

  if (!hasRequiredFields(req.body, ['email', 'password'], errors)) {
    res.status(400).json({ message: errors.join('\n') });
    return;
  }

  const user = await userDAO.findOne(filter);

  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    authService.createAndSetToken({ id: user.id }, res);
    res.status(201).json({
      ...user,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10)
    });
  } else {
    authService.removeToken(res);
    res.status(401).json({ message: 'E-Mail or password are unvalid' });
  }
});

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const user = await userDAO.findOne({ id: res.locals.user.id });
  if (!user) {
    res.status(404).json({ message: `No user with ${res.locals.user.id} exists` });
  } else {
    res.status(200).json({
      ...user,
      name: user.name,
      email: user.email,
      goal: user.goal
    });
  }
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;

  const partialUser: Partial<User> = { id: res.locals.user.id };
  if (req.body.name) {
    partialUser.name = req.body.name;
  }

  if (req.body.email) {
    partialUser.email = req.body.email;
  }

  if (req.body.password) {
    partialUser.password = await bcrypt.hash(req.body.password, 10);
  }

  if (req.body.goal) {
    partialUser.goal = req.body.goal;
  }

  await userDAO.update(partialUser);
  res.status(200).end();
});

router.delete('/sign-out', (req, res) => {
  authService.removeToken(res);
  res.status(200).end();
});

router.delete('/', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const expenditureDAO: GenericDAO<Expenditure> = req.app.locals.expenditureDAO;
  const earningDAO: GenericDAO<Earning> = req.app.locals.earningDAO;
  const sumsUserMonthEarningDAO: GenericDAO<SumUserMonthEarning> = req.app.locals.sumsUserMonthEarningDAO;
  const sumsUserMonthExpenditureDAO: GenericDAO<SumUserMonthExpenditure> = req.app.locals.sumsUserMonthExpenditureDAO;
  const budgetsDAO: GenericDAO<Budget> = req.app.locals.budgetsDAO;
  const financesDAO: GenericDAO<Finance> = req.app.locals.financesDAO;
  const tipsDAO: GenericDAO<Tip> = req.app.locals.tipsDAO;

  userDAO.delete(res.locals.user.id);
  expenditureDAO.deleteAll({ userId: res.locals.user.id });
  earningDAO.deleteAll({ userId: res.locals.user.id });
  // sumsUserMonthEarningDAO.deleteAll({ userId: res.locals.user.id });
  // sumsUserMonthExpenditureDAO.deleteAll({ userId: res.locals.user.id });
  // budgetsDAO.deleteAll({ userId: res.locals.user.id });
  // financesDAO.deleteAll({ userId: res.locals.user.id });
  // tipsDAO.deleteAll({ userId: res.locals.user.id });

  authService.removeToken(res);
  res.status(200).end();
});

function hasRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
  let hasErrors = false;
  requiredFields.forEach(fieldName => {
    if (!object[fieldName]) {
      errors.push(fieldName + ' can`t be empty');
      hasErrors = true;
    }
  });
  return !hasErrors;
}

export default router;
