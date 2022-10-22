/* Autor: Lukas Behnke (FH Münster) */

import { Entity } from './entity.js';

export interface Expenditure extends Entity {
  title: string;
  category: 'rent' | 'house' | 'leisure' | 'food' | 'clothes' | 'travel' | 'insurance' | 'health' | 'other';
  creationDate: string;
  description: string;
  amount: string;
  month: string;
  year: string;
  userId: string;
}
