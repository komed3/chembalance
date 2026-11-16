import type { ChemParseResult } from 'chemparse';


/** An exact rational number. */
export interface Fraction {
  numerator: bigint;
  denominator: bigint;
}

/** Represents a non-trivial integer solution vector. */
export type IntegerSolution = number[];

/** Supported reaction media. */
export type ReactionMedium = 'acidic' | 'basic';

/** Available search profiles. */
export type SearchProfile = 'fast' | 'balanced' | 'thorough';

/** Limits for each search profile. */
export type SearchLimits = {
  maxSearchNodes: number;
  maxCoefficientSum: number;
};

/** Options for balancing a chemical equation. */
export interface BalanceOptions {
  medium?: ReactionMedium;
  search?: SearchProfile;
}

/** A parsed term of a chemical reaction. */
export interface EquationTerm {
  formula: string;
  coefficient: number;
  composition: ChemParseResult;
  auxiliary?: boolean;
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
