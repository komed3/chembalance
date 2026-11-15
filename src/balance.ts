import { parseEquation } from './equation';
import { buildMatrix, isMatrixBalanced } from './matrix';
import { solve } from './solver';
import type { BalanceResult, BalancedTerm, ChemicalEquation, EquationTerm } from './types';


/** Formats a reaction term using its stoichiometric coefficient. */
function formatTerm ( term: BalancedTerm ) : string {
  return term.coefficient === 1 ? term.formula : `${ term.coefficient } ${ term.formula }`;
}

/** Converts a parsed equation and its coefficients into balanced terms. */
function createTerms ( terms: EquationTerm[], coefficients: number[], offset: number ) : BalancedTerm[] {
  return terms.map( ( { formula }, i ) => ( { formula, coefficient: coefficients[ offset + i ] } ) );
}
