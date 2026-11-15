import { parseEquation } from './equation';
import { buildMatrix, isMatrixBalanced } from './matrix';
import { solve } from './solver';
import type { BalanceResult, BalancedTerm, ChemicalEquation } from './types';


/** Formats a reaction term using its stoichiometric coefficient. */
function formatTerm ( term: BalancedTerm ) : string {
  return term.coefficient === 1 ? term.formula : `${ term.coefficient } ${ term.formula }`;
}
