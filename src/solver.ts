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

  // Calculate the reduced row echelon form.
  for ( let column = 0; column < columns && pivotRow < rows.length; column++ ) {
    let selected = pivotRow;

    while ( selected < rows.length && rows[ selected ][ column ].numerator === 0n ) selected++;
    if ( selected === rows.length ) continue;

    [ rows[ pivotRow ], rows[ selected ] ] = [ rows[ selected ], rows[ pivotRow ] ];

    const pivot = rows[ pivotRow ][ column ];
    rows[ pivotRow ] = rows[ pivotRow ].map( value => divide( value, pivot ) );

    for ( let row = 0; row < rows.length; row++ ) {
      if ( row === pivotRow ) continue;

      const factor = rows[ row ][ column ];
      if ( factor.numerator === 0n ) continue;

      rows[ row ] = rows[ row ].map( ( value, index ) => subtract(
        value, multiply( factor, rows[ pivotRow ][ index ] )
      ) );
    }

    pivotColumns.push( column );
    pivotRow++;
  }
}
