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
 * @param equation The parsed chemical equation.
 * @param useCoefficients Whether existing coefficients should be applied.
 * @returns The stoichiometric matrix.
 */
export function buildMatrix ( equation: ChemicalEquation, useCoefficients = false ) : bigint[][] {
  const terms = [ ...equation.reactants, ...equation.products ];
  const elements = ELEMENT_SYMBOLS.filter( el => terms.some( term => el in term.composition.elementCounts ) );
  const includeCharge = terms.some( term => term.composition.charge !== undefined );

  const rows: bigint[][] = elements.map( el => terms.map( ( { composition, coefficient }, i ) => {
    const count = composition.elementCounts[ el ] || 0;
    const sign = i < equation.reactants.length ? 1n : -1n;
    const coeff = useCoefficients ? BigInt( coefficient ) : 1n;

    return toInteger( count, el ) * sign * coeff;
  } ) );

  if ( includeCharge ) {
    rows.push( terms.map( ( { composition, coefficient }, i ) => {
      const charge = toInteger( composition.charge || 0, 'Charge' );
      const sign = i < equation.reactants.length ? 1n : -1n;
      const coeff = useCoefficients ? BigInt( coefficient ) : 1n;

      return charge * sign * coeff;
    } ) );
  }

  return rows;
}


/** Checks whether every row of a stoichiometric matrix sums to zero. */
export function isMatrixBalanced ( matrix: bigint[][] ) : boolean {
  return matrix.every( row => row.reduce( ( sum, value ) => sum + value, 0n ) === 0n );
}
