/* Autor: Sain Larlee-Matthews (FH Münster) */

import { Entity } from './entity.js';

export interface Tip extends Entity {
  category: string;
  text: string;
  userId: string;
  financeId: string;
}
