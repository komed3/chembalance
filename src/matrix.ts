import { ELEMENT_SYMBOLS } from 'chemparse';
import type { ChemicalEquation } from './types';


/**
 * Converts a chemical count into an integer.
 *
 * @throws {Error} If the count is not a safe integer.
 */
function toInteger ( value: number, label: string ) : bigint {
  if ( ! Number.isSafeInteger( value ) ) throw new Error( `${ label } must be a safe integer.` );
  return BigInt( value );
}


/**
 * Creates the stoichiometric matrix of a chemical equation.
 *
 * Rows represent elements and ionic charge.
 * Columns represent reaction terms.
 *
 * @param reactants The parsed reactants.
 * @param products The parsed products.
 * @param useCoefficients Whether existing coefficients should be applied.
 * @returns The stoichiometric matrix.
 */
export function buildMatrix ( { reactants, products }: ChemicalEquation, useCoefficients = false ) : bigint[][] {
  const terms = [ ...reactants, ...products ];

  const factors = terms.map( ( { coefficient }, i ) =>
    ( i < reactants.length ? 1n : -1n ) * ( useCoefficients ? BigInt( coefficient ) : 1n )
  );

  const elements = ELEMENT_SYMBOLS.filter( el => terms.some( ( { composition } ) =>
    el in composition.elementCounts
  ) );

  const includeCharge = terms.some( ( { composition } ) => composition.charge !== undefined );

  const rows = elements.map( el => terms.map( ( { composition }, i ) =>
    toInteger( composition.elementCounts[ el ] || 0, el ) * factors[ i ]
  ) );

  if ( includeCharge ) rows.push( terms.map( ( { composition }, i ) =>
    toInteger( composition.charge || 0, 'Charge' ) * factors[ i ]
  ) );

  return rows;
}


/** Checks whether every row of a stoichiometric matrix sums to zero. */
export function isMatrixBalanced ( matrix: bigint[][] ) : boolean {
  return matrix.every( row => row.reduce( ( sum, value ) => sum + value, 0n ) === 0n );
}
