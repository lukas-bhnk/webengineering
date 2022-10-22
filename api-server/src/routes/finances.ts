/* Autor: Sain Larlee-Matthews (FH Münster) */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Finance } from '../models/finance.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const financeDAO: GenericDAO<Finance> = req.app.locals.financeDAO;
  const filter: Partial<Finance> = { userId: res.locals.user.id };
  const finances = (await financeDAO.findAll(filter)).map(finance => {
    return {
      ...finance,
      title: cryptoService.decrypt(finance.title)
    };
  });
  if (!finances) {
    res.status(404).json({ message: `There are no finances here` });
  } else {
    res.json({ results: finances });
  }
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const financeDAO: GenericDAO<Finance> = req.app.locals.financeDAO;
  const createdFinance = await financeDAO.create({
    title: cryptoService.encrypt(req.body.title),
    month: req.body.month,
    year: req.body.year,
    userId: res.locals.user.id,
    budgetingStyle: req.body.budgetingStyle
  });
  res.status(201).json(createdFinance);
});

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const financeDAO: GenericDAO<Finance> = req.app.locals.financeDAO;
  const finance = await financeDAO.findOne({ id: req.params.id });
  if (!finance) {
    res.status(404).json({ message: `There is no finance summary with ID ${req.params.id}` });
  } else {
    res.status(200).json(finance);
  }
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const financeDAO: GenericDAO<Finance> = req.app.locals.financeDAO;
  const partialFinance: Partial<Finance> = { id: req.params.id };
  if (cryptoService.encrypt(req.body.title)) {
    partialFinance.title = req.body.title;
  }
  if (req.body.month) {
    partialFinance.month = req.body.month;
  }
  if (req.body.year) {
    partialFinance.year = req.body.year;
  }
  if (req.body.budgetingStyle) {
    partialFinance.budgetingStyle = req.body.budgetingStyle;
  }
  await financeDAO.update(partialFinance);
  res.status(200).end();
});

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => {
  const financeDAO: GenericDAO<Finance> = req.app.locals.financeDAO;
  await financeDAO.delete(req.params.id);
  res.status(200).end();
});

router.get('/:month/:year', async (req, res) => {
  const financeDAO: GenericDAO<Finance> = req.app.locals.financeDAO;
  const finances = await financeDAO.findOne({
    userId: res.locals.user.id,
    month: req.params.month,
    year: req.params.year
  });
  if (!finances) {
    res.status(404).json({ message: `There are no finances for this month found.` });
  } else {
    res.json({ results: finances });
  }
});

export default router;
