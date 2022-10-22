/* Autor: Lukas Behnke (FH Münster) */

import { Entity } from './entity.js';

export interface SumUserMonthExpenditure extends Entity {
  month: string;
  year: string;
  totalSum: string;
  rent: string;
  house: string;
  leisure: string;
  food: string;
  clothes: string;
  travel: string;
  insurance: string;
  health: string;
  other: string;
  userId: string;
}
