import type { ChemParseResult } from 'chemparse';


/** An exact rational number. */
export interface Fraction {
  numerator: bigint;
  denominator: bigint;
}

/** Represents a non-trivial integer solution vector. */
export type IntegerSolution = number[];


/** A parsed term of a chemical reaction. */
export interface EquationTerm {
  formula: string;
  coefficient: number;
  composition: ChemParseResult;
}

/** A parsed chemical reaction equation. */
export interface ChemicalEquation {
  reactants: EquationTerm[];
  products: EquationTerm[];
}

/** A term of a balanced chemical reaction. */
export interface BalancedTerm {
  formula: string;
  coefficient: number;
}

/** Result of balancing a chemical reaction. */
export interface BalanceResult {
  equation: string;
  coefficients: number[];
  reactants: BalancedTerm[];
  products: BalancedTerm[];
  balanced: true;
}
