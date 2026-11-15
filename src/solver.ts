import { fraction, divide, multiply, subtract, negate, lcm, gcd } from './rational';
import type { Fraction, IntegerSolution } from './types';


/**
 * Solves a homogeneous system of linear equations.
 *
 * The current implementation supports systems with exactly one
 * free variable and returns the smallest positive integer solution.
 *
 * @param matrix The stoichiometric matrix.
 * @returns The smallest positive integer solution.
 * @throws {Error} If no unique positive balancing ratio exists.
 */
export function solve ( matrix: bigint[][] ) : IntegerSolution {
  if ( ! matrix.length || ! matrix[ 0 ].length ) throw new Error( 'Matrix must not be empty.' );

  const columns = matrix[ 0 ].length;
  if ( matrix.some( row => row.length !== columns ) ) throw new Error( 'Matrix must be rectangular.' );

  const rows: Fraction[][] = matrix.map( row => row.map( v => fraction( v ) ) );
  const pivotColumns: number[] = [];
  let pivotRow = 0;
}
