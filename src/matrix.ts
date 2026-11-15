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
 * Rows represent elements and optionally ionic charge.
 * Columns represent reaction terms.
 *
 * @param equation The parsed chemical equation.
 * @param useCoefficients Whether existing coefficients should be applied.
 * @returns The stoichiometric matrix.
 */
export function buildMatrix (
  equation: ChemicalEquation,
  useCoefficients = false
) : bigint[][] {
  const terms = [ ...equation.reactants, ...equation.products ];
  const elements = ELEMENT_SYMBOLS.filter( el => terms.some( term => el in term.composition.elementCounts ) );
  const includeCharge = terms.some( term => term.composition.charge !== undefined );

  const rows: bigint[][] = elements.map( el => terms.map( ( term, index ) => {
    const count = term.composition.elementCounts[ el ] || 0;
    const sign = index < equation.reactants.length ? 1n : -1n;
    const coefficient = useCoefficients ? BigInt( term.coefficient ) : 1n;

    return toInteger( count, el ) * sign * coefficient;
  } ) );

  if ( includeCharge ) {
    rows.push( terms.map( ( term, i ) => {
      const charge = toInteger( term.composition.charge || 0, 'Charge' );
      const sign = i < equation.reactants.length ? 1n : -1n;
      const coefficient = useCoefficients ? BigInt( term.coefficient ) : 1n;

      return charge * sign * coefficient;
    } ) );
  }

  return rows;
}
