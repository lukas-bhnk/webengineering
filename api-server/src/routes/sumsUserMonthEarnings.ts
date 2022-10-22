/* Autor: Lukas Behnke (FH Münster) */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';
import { SumUserMonthEarning } from '../models/SumUserMonthEarning';

const router = express.Router();

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const earningsSumDAO: GenericDAO<SumUserMonthEarning> = req.app.locals.sumUserMonthEarningDAO;
  await earningsSumDAO.create({
    userId: res.locals.user.id,
    totalSum: cryptoService.encrypt(Number(req.body.totalSum).toFixed(2)),
    salary: cryptoService.encrypt(Number(req.body.salary).toFixed(2)),
    rental: cryptoService.encrypt(Number(req.body.rental).toFixed(2)),
    dividend: cryptoService.encrypt(Number(req.body.dividend).toFixed(2)),
    refund: cryptoService.encrypt(Number(req.body.refund).toFixed(2)),
    gift: cryptoService.encrypt(Number(req.body.gift).toFixed(2)),
    other: cryptoService.encrypt(Number(req.body.other).toFixed(2)),
    month: req.body.month,
    year: req.body.year
  });
  res.status(200).end();
});

router.patch('/:id', authService.authenticationMiddleware, async (req, res) => {
  const earningSumDAO: GenericDAO<SumUserMonthEarning> = req.app.locals.sumUserMonthEarningDAO;

  const partialEarningsSum: Partial<SumUserMonthEarning> = { id: req.params.id };
  if (cryptoService.encrypt(String(req.body.totalSum))) {
    partialEarningsSum.totalSum = cryptoService.encrypt(Number(req.body.totalSum).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.salary))) {
    partialEarningsSum.salary = cryptoService.encrypt(Number(req.body.salary).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.rental))) {
    partialEarningsSum.rental = cryptoService.encrypt(Number(req.body.rental).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.dividend))) {
    partialEarningsSum.dividend = cryptoService.encrypt(Number(req.body.dividend).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.refund))) {
    partialEarningsSum.refund = cryptoService.encrypt(Number(req.body.refund).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.gift))) {
    partialEarningsSum.gift = cryptoService.encrypt(Number(req.body.gift).toFixed(2));
  }
  if (cryptoService.encrypt(String(req.body.other))) {
    partialEarningsSum.other = cryptoService.encrypt(Number(req.body.other).toFixed(2));
  }

  await earningSumDAO.update(partialEarningsSum);
  res.status(200).end();
});

router.delete('/:id', authService.authenticationMiddleware, async (req, res) => {
  const earningSumDAO: GenericDAO<SumUserMonthEarning> = req.app.locals.sumUserMonthEarningDAO;
  await earningSumDAO.delete(req.params.id);
  res.status(200).end();
});

router.get('/:month/:year', authService.authenticationMiddleware, async (req, res) => {
  const earningsSumDAO: GenericDAO<SumUserMonthEarning> = req.app.locals.sumUserMonthEarningDAO;
  const sumUserMonthEarning = await earningsSumDAO.findOne({
    userId: res.locals.user.id,
    month: req.params.month,
    year: req.params.year
  });
  if (!sumUserMonthEarning) {
    res.status(200).json({
      month: req.params.month,
      year: req.params.year,
      totalSum: 0,
      salary: 0,
      rental: 0,
      dividend: 0,
      refund: 0,
      gift: 0,
      other: 0
    });
  } else {
    res.status(200).json({
      ...sumUserMonthEarning,
      totalSum: Number(cryptoService.decrypt(sumUserMonthEarning.totalSum)),
      salary: Number(cryptoService.decrypt(sumUserMonthEarning.salary)),
      rental: Number(cryptoService.decrypt(sumUserMonthEarning.rental)),
      dividend: Number(cryptoService.decrypt(sumUserMonthEarning.dividend)),
      refund: Number(cryptoService.decrypt(sumUserMonthEarning.refund)),
      gift: Number(cryptoService.decrypt(sumUserMonthEarning.gift)),
      other: Number(cryptoService.decrypt(sumUserMonthEarning.other))
    });
  }
});

export default router;
