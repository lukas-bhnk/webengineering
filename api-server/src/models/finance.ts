/* Autor: Sain Larlee-Matthews (FH Münster) */

import { Entity } from './entity.js';
import { Tip } from './tip.js';

export interface Finance extends Entity {
  title: string;
  //category: 'general' | 'rent' | 'house' | 'leisure' | 'food' | 'clothes' | 'travel' | 'insurance' | 'health' | 'other';
  //date: string;
  month: string;
  year: string;
  //description: string;
  //budgetId: string;
  userId: string;
  budgetingStyle: 'spender' | 'balanced' | 'saver';
  //savingsTarget: string;
}
