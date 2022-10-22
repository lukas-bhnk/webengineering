/* Autor: Lukas Behnke (FH Münster) */

import pg from 'pg';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync(new URL('../config.json', import.meta.url), 'utf-8'));

const { Client } = pg;

const client = new Client({
  user: config.db.connect.user,
  host: config.db.connect.host,
  database: config.db.connect.database,
  password: config.db.connect.password,
  port: config.db.connect.port.psql
});

async function createScheme() {
  await client.connect();
  await client.query(`DROP TABLE IF EXISTS users, earnings, expenditures, tips, finances, budgets`);
  await client.query(`CREATE TABLE users(
    id VARCHAR(40) PRIMARY KEY,
    "createdAt" bigint NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL, 
    goal VARCHAR(255))`);
    
  await client.query(`CREATE TABLE earnings(
    id VARCHAR(255) PRIMARY KEY,
    month VARCHAR(5) NOT NULL,
    year VARCHAR(5) NOT NULL,
    "createdAt" bigint NOT NULL,
    title VARCHAR(200), NOT NULL,
    category VARCHAR(15) NOT NULL,
    description VARCHAR(400),
    amount VARCHAR(400) NOT NULL,
    creationDate VARCHAR(10) NOT NULL,
    "userId" VARCHAR(40) NOT NULL)`);

  await client.query(`CREATE TABLE expenditures(
    id VARCHAR(255) PRIMARY KEY,
    month VARCHAR(5) NOT NULL,
    year VARCHAR(5) NOT NULL,
    "createdAt" bigint NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(15) NOT NULL,
    description VARCHAR(400),
    amount VARCHAR(400) NOT NULL,
    creationDate VARCHAR(10) NOT NULL,
    "userId" VARCHAR(40) NOT NULL)`);

  await client.query(`CREATE TABLE sumsUserMonthExpenditures(
    id VARCHAR(255) PRIMARY KEY,
    month VARCHAR(5) NOT NULL,
    year VARCHAR(5) NOT NULL,
    totalSum VARCHAR(255) NOT NULL,
    rent VARCHAR(255) NOT NULL,
    house VARCHAR(255) NOT NULL,
    leisure VARCHAR(255) NOT NULL,
    food VARCHAR(255) NOT NULL,
    clothes VARCHAR(255) NOT NULL,
    travel VARCHAR(255) NOT NULL,
    insurance VARCHAR(255) NOT NULL,
    health  VARCHAR(255) NOT NULL,
    other VARCHAR(255) NOT NULL,
    "createdAt" bigint NOT NULL,
    "userId" VARCHAR(40) NOT NULL)`);

  await client.query(`CREATE TABLE sumsUserMonthEarnings(
    id VARCHAR(255) PRIMARY KEY,
    month VARCHAR(5) NOT NULL,
    year VARCHAR(5) NOT NULL,
    totalSum VARCHAR(255) NOT NULL,
    dividend VARCHAR(255) NOT NULL,
    salary VARCHAR(255) NOT NULL,
    other VARCHAR(255) NOT NULL,
    refund VARCHAR(255) NOT NULL,
    gift VARCHAR(255) NOT NULL,
    rental VARCHAR(255) NOT NULL,
    "createdAt" bigint NOT NULL,
    "userId" VARCHAR(40) NOT NULL)`);

  await client.query(`CREATE TABLE tips(
    id VARCHAR(40) PRIMARY KEY,
    createdAt bigint NOT NULL,
    category VARCHAR(10) NOT NULL,
    text VARCHAR(400) NOT NULL,
    financeId VARCHAR(40),
    userId VARCHAR(40) NOT NULL)`);

  await client.query(`CREATE TABLE finances(
    id VARCHAR(40) PRIMARY KEY,
    createdAt bigint NOT NULL,
    month VARCHAR(2),
    year VARCHAR(4),
    title VARCHAR(100),
    userId VARCHAR(40) NOT NULL)`);

  await client.query(`CREATE TABLE budgets(
    id VARCHAR(40) PRIMARY KEY,
    createdAt bigint NOT NULL,
    month VARCHAR(2),
    year VARCHAR(4),
    category VARCHAR(15) NOT NULL,
    target NUMERIC(24, 2),
    funds NUMERIC(24, 2),
    text VARCHAR(400),
    budgetingStyle VARCHAR(10) NOT NULL,
    userId VARCHAR(40) NOT NULL)`);
}

createScheme().then(() => {
  client.end();
  console.log('finished');
});
