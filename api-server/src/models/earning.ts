/* Autor: Lukas Behnke (FH Münster) */

import { Entity } from './entity.js';

export interface Earning extends Entity {
  title: string;
  category: 'salary' | 'rental' | 'dividend' | 'refund' | 'gift' | 'other';
  creationDate: string;
  description: string;
  amount: string;
  month: string;
  year: string;
  userId: string;
}
