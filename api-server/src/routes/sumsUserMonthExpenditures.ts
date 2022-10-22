/* Autor: Lukas Behnke (FH Münster) */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';
import { SumUserMonthExpenditure } from '../models/SumUserMonthExpenditure.js';

const router = express.Router();

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const expendituresSumDAO: GenericDAO<SumUserMonthExpenditure> = req.app.locals.sumUserMonthExpenditureDAO;
  await expendituresSumDAO.create({
    userId: res.locals.user.id,
    totalSum: cryptoService.encrypt(Number(req.body.totalSum).toFixed(2)),
    rent: cryptoService.encrypt(Number(req.body.rent).toFixed(2)),
    house: cryptoService.encrypt(Number(req.body.house).toFixed(2)),
    leisure: cryptoService.encrypt(Number(req.body.leisure).toFixed(2)),
    food: cryptoService.encrypt(Number(req.body.food).toFixed(2)),
    clothes: cryptoService.encrypt(Number(req.body.clothes).toFixed(2)),
    travel: cryptoService.encrypt(Number(req.body.travel).toFixed(2)),
    insurance: cryptoService.encrypt(Number(req.body.insurance).toFixed(2)),
    health: cryptoService.encrypt(Number(req.body.health).toFixed(2)),
    other: cryptoService.encrypt(Number(req.body.other).toFixed(2)),
    month: req.body.month,
    year: req.body.year
  });
  res.status(200).end();
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const expenditureSumDAO: GenericDAO<SumUserMonthExpenditure> = req.app.locals.sumUserMonthExpenditureDAO;

  const partialExpendituresSum: Partial<SumUserMonthExpenditure> = { id: req.params.id };
  if (cryptoService.encrypt(String(req.body.totalSum))) {
    partialExpendituresSum.totalSum = cryptoService.encrypt(Number(req.body.totalSum).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.rent))) {
    partialExpendituresSum.rent = cryptoService.encrypt(Number(req.body.rent).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.house))) {
    partialExpendituresSum.house = cryptoService.encrypt(Number(req.body.house).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.leisure))) {
    partialExpendituresSum.leisure = cryptoService.encrypt(Number(req.body.leisure).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.food))) {
    partialExpendituresSum.food = cryptoService.encrypt(Number(req.body.food).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.clothes))) {
    partialExpendituresSum.clothes = cryptoService.encrypt(Number(req.body.clothes).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.travel))) {
    partialExpendituresSum.travel = cryptoService.encrypt(Number(req.body.travel).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.insurance))) {
    partialExpendituresSum.insurance = cryptoService.encrypt(Number(req.body.insurance).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.health))) {
    partialExpendituresSum.health = cryptoService.encrypt(Number(req.body.health).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.other))) {
    partialExpendituresSum.other = cryptoService.encrypt(Number(req.body.other).toFixed(2));
  }

  await expenditureSumDAO.update(partialExpendituresSum);
  res.status(200).end();
});

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => {
  const expenditureSumDAO: GenericDAO<SumUserMonthExpenditure> = req.app.locals.sumUserMonthExpenditureDAO;
  await expenditureSumDAO.delete(req.params.id);
  res.status(200).end();
});

router.get('/:month/:year', authService.authenticationMiddleware, async (req, res) => {
  const expendituresSumDAO: GenericDAO<SumUserMonthExpenditure> = req.app.locals.sumUserMonthExpenditureDAO;
  const sumUserMonthExpenditure = await expendituresSumDAO.findOne({
    userId: res.locals.user.id,
    month: req.params.month,
    year: req.params.year
  });
  if (!sumUserMonthExpenditure) {
    res.status(200).json({
      month: req.params.month,
      year: req.params.year,
      totalSum: 0,
      rent: 0,
      house: 0,
      leisure: 0,
      food: 0,
      clothes: 0,
      travel: 0,
      insurance: 0,
      health: 0,
      other: 0
    });
  } else {
    res.status(200).json({
      ...sumUserMonthExpenditure,
      totalSum: Number(cryptoService.decrypt(sumUserMonthExpenditure.totalSum)),
      rent: Number(cryptoService.decrypt(sumUserMonthExpenditure.rent)),
      house: Number(cryptoService.decrypt(sumUserMonthExpenditure.house)),
      leisure: Number(cryptoService.decrypt(sumUserMonthExpenditure.leisure)),
      food: Number(cryptoService.decrypt(sumUserMonthExpenditure.food)),
      clothes: Number(cryptoService.decrypt(sumUserMonthExpenditure.clothes)),
      travel: Number(cryptoService.decrypt(sumUserMonthExpenditure.travel)),
      insurance: Number(cryptoService.decrypt(sumUserMonthExpenditure.insurance)),
      health: Number(cryptoService.decrypt(sumUserMonthExpenditure.health)),
      other: Number(cryptoService.decrypt(sumUserMonthExpenditure.other))
    });
  }
});

export default router;
