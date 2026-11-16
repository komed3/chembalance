import { balance, isBalanced, validate } from './balance';
import { parseEquation } from './equation';


export type {
  BalancedTerm, BalanceOptions, BalanceResult, ChemicalEquation, EquationTerm,
  Fraction, IntegerSolution, ReactionMedium, SearchProfile
} from './types';

export { balance, isBalanced, parseEquation as parse, validate };


/** Provides a static API for balancing chemical equations. */
export default class ChemBalance {
  /** @see parseEquation */
  public static readonly parse = parseEquation;
  /** @see balance */
  public static readonly balance = balance;
  /** @see isBalanced */
  public static readonly isBalanced = isBalanced;
  /** @see validate */
  public static readonly validate = validate;
}
