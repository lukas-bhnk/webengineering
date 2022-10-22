/* Autor: Lukas Behnke (FH Münster) */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Expenditure } from '../models/expenditure.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const expenditureDAO: GenericDAO<Expenditure> = req.app.locals.expenditureDAO;
  const filter: Partial<Expenditure> = { userId: res.locals.user.id };
  const expenditures = (await expenditureDAO.findAll(filter)).map(expenditure => {
    return {
      ...expenditure,
      title: cryptoService.decrypt(expenditure.title),
      description: cryptoService.decrypt(expenditure.description),
      amount: cryptoService.decrypt(expenditure.amount)
    };
  });
  res.json({ results: expenditures });
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const expenditureDAO: GenericDAO<Expenditure> = req.app.locals.expenditureDAO;
  await expenditureDAO.create({
    userId: res.locals.user.id,
    title: cryptoService.encrypt(req.body.title),
    creationDate: req.body.creationDate,
    description: cryptoService.encrypt(req.body.description),
    amount: cryptoService.encrypt(req.body.amount),
    month: req.body.creationDate.substring(5, 7),
    year: req.body.creationDate.substring(0, 4),
    category: req.body.category
  });
  res.status(200).end();
});

router.get('/:id', authService.authenticationMiddleware, async (req, res) => {
  const expenditureDAO: GenericDAO<Expenditure> = req.app.locals.expenditureDAO;
  const expenditure = await expenditureDAO.findOne({ id: req.params.id });
  if (!expenditure) {
    res.status(404).json({ message: `There is no expenditure with ID ${req.params.id}` });
  } else {
    res.status(200).json({
      ...expenditure,
      title: cryptoService.decrypt(expenditure.title),
      description: expenditure.description ? cryptoService.decrypt(expenditure.description) : '',
      amount: cryptoService.decrypt(expenditure.amount)
    });
  }
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const expenditureDAO: GenericDAO<Expenditure> = req.app.locals.expenditureDAO;

  const partialExpenditure: Partial<Expenditure> = { id: req.params.id };
  if (cryptoService.encrypt(req.body.title)) {
    partialExpenditure.title = cryptoService.encrypt(req.body.title);
  }
  if (req.body.creationDate) {
    partialExpenditure.creationDate = req.body.creationDate;
    partialExpenditure.month = req.body.creationDate.substring(5, 7);
    partialExpenditure.year = req.body.creationDate.substring(0, 4);
  }
  if (cryptoService.encrypt(req.body.description || '')) {
    partialExpenditure.description = cryptoService.encrypt(req.body.description || '');
  }
  if (cryptoService.encrypt(req.body.amount)) {
    partialExpenditure.amount = cryptoService.encrypt(req.body.amount);
  }
  if (req.body.category) {
    partialExpenditure.category = req.body.category;
  }

  await expenditureDAO.update(partialExpenditure);
  res.status(200).end();
});

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => {
  const expenditureDAO: GenericDAO<Expenditure> = req.app.locals.expenditureDAO;
  await expenditureDAO.delete(req.params.id);
  res.status(200).end();
});

router.get('/:month/:year', authService.authenticationMiddleware, async (req, res) => {
  const expenditureDAO: GenericDAO<Expenditure> = req.app.locals.expenditureDAO;
  const expenditures = (
    await expenditureDAO.findAllAscending({
      userId: res.locals.user.id,
      month: req.params.month,
      year: req.params.year
    })
  ).map(expenditure => {
    return {
      ...expenditure,
      title: cryptoService.decrypt(expenditure.title),
      description: cryptoService.decrypt(expenditure.description),
      amount: cryptoService.decrypt(expenditure.amount)
    };
  });
  res.json({ results: expenditures });
});

router.get('/latestFiveEntries/:month/:year', authService.authenticationMiddleware, async (req, res) => {
  const expenditureDAO: GenericDAO<Expenditure> = req.app.locals.expenditureDAO;
  //need ascending because the inmemory and mongo sorting was different
  const expenditures = (
    await expenditureDAO.findAllAscending({
      userId: res.locals.user.id,
      month: req.params.month,
      year: req.params.year
    })
  )
    .map(expenditure => {
      return {
        ...expenditure,
        title: cryptoService.decrypt(expenditure.title),
        description: cryptoService.decrypt(expenditure.description),
        amount: cryptoService.decrypt(expenditure.amount)
      };
    })
    .slice(-5);
  res.json({ results: expenditures });
});

export default router;
