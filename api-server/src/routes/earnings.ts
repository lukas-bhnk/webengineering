/* Autor: Lukas Behnke (FH Münster) */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Earning } from '../models/earning.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';
import { config } from 'process';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  const earningDAO: GenericDAO<Earning> = req.app.locals.earningDAO;
  const filter: Partial<Earning> = { userId: res.locals.user.id };
  const earnings = (await earningDAO.findAll(filter)).map(earning => {
    return {
      ...earning,
      title: cryptoService.decrypt(earning.title),
      description: cryptoService.decrypt(earning.description),
      amount: cryptoService.decrypt(earning.amount)
    };
  });
  res.json({ results: earnings });
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const earningDAO: GenericDAO<Earning> = req.app.locals.earningDAO;
  await earningDAO.create({
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
  const earningDAO: GenericDAO<Earning> = req.app.locals.earningDAO;
  const earning = await earningDAO.findOne({ id: req.params.id });
  if (!earning) {
    res.status(404).json({ message: `There is no earning with ID ${req.params.id}` });
  } else {
    res.status(200).json({
      ...earning,
      title: cryptoService.decrypt(earning.title),
      description: earning.description ? cryptoService.decrypt(earning.description) : '',
      amount: cryptoService.decrypt(earning.amount)
    });
  }
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const earningDAO: GenericDAO<Earning> = req.app.locals.earningDAO;

  const partialEarning: Partial<Earning> = { id: req.params.id };
  if (cryptoService.encrypt(req.body.title)) {
    partialEarning.title = cryptoService.encrypt(req.body.title);
  }
  if (req.body.creationDate) {
    partialEarning.creationDate = req.body.creationDate;
    partialEarning.month = req.body.creationDate.substring(5, 7);
    partialEarning.year = req.body.creationDate.substring(0, 4);
  }
  if (cryptoService.encrypt(req.body.description || '')) {
    partialEarning.description = cryptoService.encrypt(req.body.description || '');
  }
  if (cryptoService.encrypt(req.body.amount)) {
    partialEarning.amount = cryptoService.encrypt(req.body.amount);
  }
  if (req.body.category) {
    partialEarning.category = req.body.category;
  }

  await earningDAO.update(partialEarning);
  res.status(200).end();
});

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => {
  const earningDAO: GenericDAO<Earning> = req.app.locals.earningDAO;
  await earningDAO.delete(req.params.id);
  res.status(200).end();
});

router.get('/:month/:year', authService.authenticationMiddleware, async (req, res) => {
  const earningDAO: GenericDAO<Earning> = req.app.locals.earningDAO;
  const earnings = (
    await earningDAO.findAllAscending({ userId: res.locals.user.id, month: req.params.month, year: req.params.year })
  ).map(earning => {
    return {
      ...earning,
      title: cryptoService.decrypt(earning.title),
      description: cryptoService.decrypt(earning.description),
      amount: cryptoService.decrypt(earning.amount)
    };
  });
  res.json({ results: earnings });
});

router.get('/latestFiveEntries/:month/:year', authService.authenticationMiddleware, async (req, res) => {
  const earningDAO: GenericDAO<Earning> = req.app.locals.earningDAO;
  //need ascending because the inmemory and mongo sorting was different
  const earnings = (
    await earningDAO.findAllAscending({ userId: res.locals.user.id, month: req.params.month, year: req.params.year })
  )
    .map(earning => {
      return {
        ...earning,
        title: cryptoService.decrypt(earning.title),
        description: cryptoService.decrypt(earning.description),
        amount: cryptoService.decrypt(earning.amount)
      };
    })
    .slice(-5);
  res.json({ results: earnings });
});

export default router;
