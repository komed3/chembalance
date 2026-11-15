import {} from 'chemparse';
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
