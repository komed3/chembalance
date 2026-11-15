import { parseEquation } from './equation';
import { buildMatrix, isMatrixBalanced } from './matrix';
import { solve } from './solver';
import type { BalanceResult, BalancedTerm, EquationTerm } from './types';


/** Formats a reaction term using its stoichiometric coefficient. */
function formatTerm ( term: BalancedTerm ) : string {
  return term.coefficient === 1 ? term.formula : `${ term.coefficient } ${ term.formula }`;
}

/** Converts a parsed equation and its coefficients into balanced terms. */
function createTerms ( terms: EquationTerm[], coefficients: number[], offset: number ) : BalancedTerm[] {
  return terms.map( ( { formula }, i ) => ( { formula, coefficient: coefficients[ offset + i ] } ) );
}


/**
 * Balances a chemical reaction equation.
 *
 * Existing stoichiometric coefficients are recalculated.
 *
 * @param equation The chemical reaction equation.
 * @returns The balanced equation and its coefficients.
 * @throws {Error} If the equation cannot be balanced.
 */
export function balance ( equation: string ) : BalanceResult {
  const parsed = parseEquation( equation ), matrix = buildMatrix( parsed );
  const coefficients = solve( matrix );

  const reactants = createTerms( parsed.reactants, coefficients, 0 );
  const products = createTerms( parsed.products, coefficients, parsed.reactants.length );

  return {
    equation: [
      reactants.map( formatTerm ).join( ' + ' ),
      products.map( formatTerm ).join( ' + ' )
    ].join( ' -> ' ),
    coefficients, reactants, products,
    balanced: true
  };
}


/**
 * Checks whether a chemical reaction equation is balanced.
 *
 * Existing stoichiometric coefficients are taken into account.
 *
 * @param equation The chemical reaction equation.
 * @returns True if all elements and charges are balanced.
 */
export function isBalanced ( equation: string ) : boolean {
  const parsed = parseEquation( equation ), matrix = buildMatrix( parsed, true );
  return isMatrixBalanced( matrix );
}


/**
 * Checks whether a chemical reaction equation is syntactically valid.
 *
 * @param equation The chemical reaction equation.
 * @returns True if the equation and all formulas are valid.
 */
export function validate ( equation: string ) : boolean {
  try { parseEquation( equation ); return true }
  catch { return false }
}
