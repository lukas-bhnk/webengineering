/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import mongodb from 'mongodb';
import pg from 'pg';
import { application, Express } from 'express';
import { MongoGenericDAO } from './models/mongo-generic.dao.js';
import { PsqlGenericDAO } from './models/psql-generic.dao.js';
import { InMemoryGenericDAO } from './models/in-memory-generic.dao.js';
import fs from 'fs';
// TODO: Models importieren
import { User } from './models/user.js';
import { Expenditure } from './models/expenditure.js';
import { Earning } from './models/earning.js';
import { SumUserMonthEarning } from './models/SumUserMonthEarning.js';
import { SumUserMonthExpenditure } from './models/SumUserMonthExpenditure.js';
import { Tip } from './models/tip.js';
import { Finance } from './models/finance.js';
import { Budget } from './models/budget.js';

const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url), 'utf-8'));
const { MongoClient } = mongodb;
const { Client } = pg;

export default async function startDB(app: Express) {
  switch (config.db.use) {
    case 'mongodb':
      return await startMongoDB(app);
    case 'psql':
      return await startPsql(app);
    default:
      return await startInMemoryDB(app);
  }
}

async function startInMemoryDB(app: Express) {
  // TODO: DAOs erzeugen
  app.locals.userDAO = new InMemoryGenericDAO<User>();
  app.locals.expenditureDAO = new InMemoryGenericDAO<Expenditure>();
  app.locals.earningDAO = new InMemoryGenericDAO<Earning>();
  app.locals.sumUserMonthEarningDAO = new InMemoryGenericDAO<SumUserMonthEarning>();
  app.locals.sumUserMonthExpenditureDAO = new InMemoryGenericDAO<SumUserMonthExpenditure>();
  app.locals.tipDAO = new InMemoryGenericDAO<Tip>();
  app.locals.financeDAO = new InMemoryGenericDAO<Finance>();
  app.locals.budgetDAO = new InMemoryGenericDAO<Budget>();
  return async () => Promise.resolve();
}

async function startMongoDB(app: Express) {
  const client = await connectToMongoDB();
  const db = client.db('piggybank');
  // TODO: DAOs erzeugen
  app.locals.userDAO = new MongoGenericDAO<User>(db, 'users');
  app.locals.expenditureDAO = new MongoGenericDAO<Expenditure>(db, 'expenditures');
  app.locals.earningDAO = new MongoGenericDAO<Earning>(db, 'earnings');
  app.locals.sumUserMonthEarningDAO = new MongoGenericDAO<SumUserMonthEarning>(db, 'sumsUserMonthEarnings');
  app.locals.sumUserMonthExpenditureDAO = new MongoGenericDAO<SumUserMonthExpenditure>(db, 'sumsUserMonthExpenditures');
  app.locals.tipDAO = new MongoGenericDAO<Tip>(db, 'tips');
  app.locals.financeDAO = new MongoGenericDAO<Finance>(db, 'finances');
  app.locals.budgetDAO = new MongoGenericDAO<Budget>(db, 'budgets');
  return async () => await client.close();
}

async function connectToMongoDB() {
  const url = `mongodb://${config.db.connect.host}:${config.db.connect.port.mongodb}`;
  const client = new MongoClient(url, {
    auth: { username: config.db.connect.user, password: config.db.connect.password },
    authSource: config.db.connect.database
  });
  try {
    await client.connect();
  } catch (err) {
    console.log('Could not connect to MongoDB: ', err);
    process.exit(1);
  }
  return client;
}

async function startPsql(app: Express) {
  const client = await connectToPsql();
  // TODO: DAOs erzeugen
  app.locals.userDAO = new PsqlGenericDAO<User>(client!, 'users');
  app.locals.earningDao = new PsqlGenericDAO<Earning>(client!, 'earnings');
  app.locals.expenditureDao = new PsqlGenericDAO<Expenditure>(client!, 'expenditures');
  app.locals.sumUserMonthEarningDao = new PsqlGenericDAO<SumUserMonthEarning>(client!, 'sumsUserMonthEarnings');
  app.locals.sumUserMonthExpenditureDao = new PsqlGenericDAO<SumUserMonthExpenditure>(
    client!,
    'sumsUserMonthExpenditures'
  );
  app.locals.tipDAO = new PsqlGenericDAO<Tip>(client!, 'tips');
  app.locals.financeDAO = new PsqlGenericDAO<Finance>(client!, 'finances');
  app.locals.budgetDAO = new PsqlGenericDAO<Budget>(client!, 'budgets');
  return async () => await client.end();
}

async function connectToPsql() {
  const client = new Client({
    user: config.db.connect.user,
    host: config.db.connect.host,
    database: config.db.connect.database,
    password: config.db.connect.password,
    port: config.db.connect.port.psql
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.log('Could not connect to PostgreSQL: ', err);
    process.exit(1);
  }
}
