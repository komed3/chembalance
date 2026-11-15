import { divide, fraction, gcd, lcm, multiply, negate, subtract } from './rational';
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

      rows[ row ] = rows[ row ].map( ( v, i ) =>
        subtract( v, multiply( factor, rows[ pivotRow ][ i ] ) )
      );
    }

    pivotColumns.push( column );
    pivotRow++;
  }

  const freeColumns = Array.from( { length: columns }, ( _, i ) => i ).filter(
    col => ! pivotColumns.includes( col )
  );

  if ( freeColumns.length === 0 ) throw new Error( 'The equation has no non-trivial balancing solution.' );
  if ( freeColumns.length > 1 ) throw new Error( 'The equation has multiple independent balancing solutions.' );

  // Set the only free variable to one.
  const solution: Fraction[] = Array.from( { length: columns }, () => fraction( 0n ) );

  const freeColumn = freeColumns[ 0 ];
  solution[ freeColumn ] = fraction( 1n );

  for ( let row = 0; row < pivotColumns.length; row++ ) {
    const column = pivotColumns[ row ];
    solution[ column ] = negate( rows[ row ][ freeColumn ] );
  }

  // Convert all fractions to integers using a common denominator.
  const denominator = solution.reduce( ( v, item ) => lcm( v, item.denominator ), 1n );
  const integers = solution.map( item => item.numerator * ( denominator / item.denominator ) );

  // Reduce the integer vector by its greatest common divisor.
  const divisor = integers.reduce( gcd );
  const reduced = integers.map( v => v / divisor );

  // A valid balancing solution must contain positive coefficients only.
  const hasPos = reduced.some( v => v > 0n ), hasNeg = reduced.some( v => v < 0n );
  const hasZero = reduced.some( v => v === 0n );

  if ( hasZero || ( hasPos && hasNeg ) ) throw new Error( 'No strictly positive balancing solution exists.' );
  const normalized = hasNeg ? reduced.map( v => -v ) : reduced;

  return normalized.map( v => {
    const result = Number( v );

    if ( ! Number.isSafeInteger( result ) )
      throw new Error( 'Balancing coefficient exceeds the safe integer range.' );

    return result;
  } );
}
