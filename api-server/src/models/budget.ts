/* Autor: Sain Larlee-Matthews (FH Münster) */

import { Entity } from './entity.js';

export interface Budget extends Entity {
  category: 'rent' | 'house' | 'leisure' | 'food' | 'clothes' | 'travel' | 'insurance' | 'health' | 'other';
  text: string;
  target: number;
  funds: number;
  month: string;
  year: string;
  userId: string;
  budgetingStyle: 'spender' | 'balanced' | 'saver';
}
