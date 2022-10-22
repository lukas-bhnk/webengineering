/* Autor: Sain Larlee-Matthews (FH Münster) */

import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Tip } from '../models/tip.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const tipDAO: GenericDAO<Tip> = req.app.locals.tipDAO;
  const tips = (await tipDAO.findAll()).map(tip => {
    return {
      tip,
      text: tip.text,
      category: tip.category
    };
  });
  if (!tips) {
    res.status(404).end();
  } else res.json({ results: tips });
});

router.post('/', authService.authenticationMiddleware, async (req, res) => {
  const tipDAO: GenericDAO<Tip> = req.app.locals.tipDAO;
  await tipDAO.create({
    text: req.body.text,
    category: req.body.category,
    userId: res.locals.user.id,
    financeId: req.body.financeId
  });
  res.status(200).end();
});

router.get('/:id', async (req, res) => {
  const tipDAO: GenericDAO<Tip> = req.app.locals.tipDAO;
  const tip = await tipDAO.findOne({ id: req.params.id });
  if (!tip) {
    res.status(404).json({ message: `There is no tip with ID ${req.params.id}` });
  } else {
    res.status(200).json(tip);
  }
});

router.patch('/:id', async (req, res) => {
  const tipDAO: GenericDAO<Tip> = req.app.locals.tipDAO;

  const partialTip: Partial<Tip> = { id: req.params.id };
  if (req.body.text) {
    partialTip.text = req.body.text;
  }
  if (req.body.category) {
    partialTip.category = req.body.category;
  }
  // if (req.body.financeId) {
  //   partialTip.financeId = req.body.financeId;
  // }
  await tipDAO.update(partialTip);
  res.status(200).end();
});

router.delete('/:id', async (req, res) => {
  const tipDAO: GenericDAO<Tip> = req.app.locals.financeDAO;
  await tipDAO.delete(req.params.id);
  res.status(200).end();
});

router.get('/:userId', async (req, res) => {
  const tipDAO: GenericDAO<Tip> = req.app.locals.tipDAO;
  const filter: Partial<Tip> = { userId: res.locals.user.id };
  const tips = (await tipDAO.findAll(filter)).map(tip => {
    return {
      ...tip
    };
  });
  if (!tips) {
    res.status(404).end();
  } else res.json({ results: tips });
});

// router.get('/:financeId', async (req, res) => {
//   const tipDAO: GenericDAO<Tip> = req.app.locals.tipDAO;
//   const filter: Partial<Tip> = { financeId: req.body.financeId };
//   const tips = (await tipDAO.findAll(filter)).map(tip => {
//     return {
//       ...tip
//     };
//   });
//   if (!tips) {
//     res
//       .status(404)
//       .json({ message: `No tips found for finance id ${filter}` })
//       .end();
//   } else res.json({ results: tips });
// });
export default router;
