/* Autor: Lukas Behnke (FH Münster) */

import { Entity } from './entity.js';

export interface SumUserMonthEarning extends Entity {
  month: string;
  year: string;
  totalSum: string;
  salary: string;
  rental: string;
  dividend: string;
  refund: string;
  gift: string;
  other: string;
  userId: string;
}
