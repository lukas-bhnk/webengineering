/* Autor: Sain Larlee-Matthews (FH Münster) */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Budget } from '../models/budget.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const budgetDAO: GenericDAO<Budget> = req.app.locals.budgetDAO;
  const filter: Partial<Budget> = { userId: res.locals.user.id };
  const budgets = (await budgetDAO.findAll(filter)).map(budget => {
    return {
      budget,
      text: cryptoService.decrypt(budget.text)
    };
  });
  if (!budgets) {
    res.status(404).json({ message: `There are no budgets yet` });
  } else {
    res.json({ results: budgets });
  }
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const budgetDAO: GenericDAO<Budget> = req.app.locals.budgetDAO;
  await budgetDAO.create({
    text: cryptoService.encrypt(req.body.text),
    target: req.body.target,
    funds: req.body.funds,
    category: req.body.category,
    month: req.body.month,
    year: String(req.body.year),
    userId: res.locals.user.id,
    budgetingStyle: req.body.budgetingStyle
  });
  res.status(200).end();
});

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const budgetDAO: GenericDAO<Budget> = req.app.locals.budgetDAO;
  const budget = await budgetDAO.findOne({ id: req.params.id });
  if (!budget) {
    res.status(404).json({ message: `There is no budget with ID ${req.params.id}` });
  } else {
    res.status(200).json({
      ...budget,
      text: cryptoService.decrypt(budget.text)
    });
  }
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const budgetDAO: GenericDAO<Budget> = req.app.locals.budgetDAO;

  const partialBudget: Partial<Budget> = { id: req.params.id };
  if (cryptoService.encrypt(req.body.text)) {
    partialBudget.text = req.body.text;
  }
  if (req.body.category) {
    partialBudget.category = req.body.category;
  }
  if (req.body.month) {
    partialBudget.month = req.body.month;
  }
  if (req.body.year) {
    partialBudget.year = String(req.body.year);
  }
  if (req.body.target) {
    partialBudget.target = req.body.target;
  }
  if (req.body.budgetingStyle) {
    partialBudget.budgetingStyle = req.body.budgetingStyle;
  }

  await budgetDAO.update(partialBudget);
  res.status(200).end();
});

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => {
  const budgetDAO: GenericDAO<Budget> = req.app.locals.budgetDAO;
  await budgetDAO.delete(req.params.id);
  res.status(200).end();
});

router.get('/:month/:year', authService.authenticationMiddleware, async (req, res) => {
  const budgetDAO: GenericDAO<Budget> = req.app.locals.budgetDAO;
  const filter: Partial<Budget> = { userId: res.locals.user.id, month: req.params.month, year: req.params.year };
  const budgets = (await budgetDAO.findAll(filter)).map(budget => {
    return {
      ...budget,
      text: cryptoService.decrypt(budget.text)
    };
  });
  if (!budgets) {
    res.status(404).json({ message: `There are no budgets yet` });
  } else {
    res.json({ results: budgets });
  }
});

export default router;
