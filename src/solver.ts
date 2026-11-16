import { divide, fraction, gcd, lcm, multiply, negate, subtract } from './rational';
import type { Fraction, IntegerSolution } from './types';


/** Maximum number of nodes to explore during the search for a positive integer solution. */
const MAX_SEARCH_NODES = 2_000_000;

/** Maximum sum of coefficients to consider during the search for a positive integer solution. */
const MAX_COEFFICIENT_SUM = 10_000;


/** Converts a rational solution into its smallest integer representation. */
function toIntegers ( solution: Fraction[] ) : bigint[] {
  const denominator = solution.reduce( ( v, { denominator } ) => lcm( v, denominator ), 1n );
  const integers = solution.map( ( { numerator, denominator: d } ) => numerator * ( denominator / d ) );
  const divisor = integers.reduce( gcd );

  return integers.map( v => v / divisor );
}


/** Converts a positive integer solution into safe JavaScript numbers. */
function toNumbers ( values: bigint[] ) : IntegerSolution {
  return values.map( v => {
    const result = Number( v );

    if ( ! Number.isSafeInteger( result ) )
      throw new Error( 'Balancing coefficient exceeds the safe integer range.' );

    return result;
  } );
}


/** Checks whether a candidate satisfies every matrix row. */
function isSolution ( matrix: bigint[][], values: bigint[] ) : boolean {
  return matrix.every( row => row.reduce( ( sum, v, i ) => sum + v * values[ i ], 0n ) === 0n );
}


/** Calculates the reduced row echelon form of a matrix. */
function toReducedRowEchelonForm ( matrix: bigint[][] ) : { rows: Fraction[][]; pivotColumns: number[] } {
  const rows = matrix.map( row => row.map( v => fraction( v ) ) ), pivotColumns: number[] = [];
  let pivotRow = 0;

  for ( let column = 0; column < rows[ 0 ].length && pivotRow < rows.length; column++ ) {
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

  return { rows, pivotColumns };
}


/** Finds the smallest positive integer solution for a multi-dimensional nullspace. */
function searchSolution ( matrix: bigint[][], columns: number ) : bigint[] {
  let nodes = 0;

  for ( let sum = columns; sum <= MAX_COEFFICIENT_SUM; sum++ ) {
    const values = Array.from( { length: columns }, () => 1n );

    function search ( i: number, remaining: number ) : bigint[] | undefined {
      if ( ++nodes > MAX_SEARCH_NODES ) throw new Error( 'Balancing search limit exceeded.' );

      if ( i === columns - 1 ) {
        if ( remaining < 1 ) return;

        values[ i ] = BigInt( remaining );
        return isSolution( matrix, values ) ? [ ...values ] : undefined;
      }

      for ( let value = 1; value <= remaining - ( columns - i - 1 ); value++ ) {
        values[ i ] = BigInt( value );

        const result = search( i + 1, remaining - value );
        if ( result ) return result;
      }
    }

    const result = search( 0, sum );
    if ( result ) return result;
  }

  throw new Error( 'No positive integer balancing solution found within the search limit.' );
}


/**
 * Solves a homogeneous system of linear equations.
 *
 * Returns the positive integer solution with the smallest coefficient sum.
 *
 * @param matrix The stoichiometric matrix.
 * @returns The smallest positive integer solution.
 * @throws {Error} If no positive balancing solution exists or the search limit is exceeded.
 */
export function solve ( matrix: bigint[][] ) : IntegerSolution {
  if ( ! matrix.length || ! matrix[ 0 ].length ) throw new Error( 'Matrix must not be empty.' );

  const columns = matrix[ 0 ].length;
  if ( matrix.some( row => row.length !== columns ) ) throw new Error( 'Matrix must be rectangular.' );

  const { rows, pivotColumns } = toReducedRowEchelonForm( matrix );
  const pivots = new Set( pivotColumns );
  const freeColumns = Array.from( { length: columns }, ( _, i ) => i ).filter( col => ! pivots.has( col ) );

  if ( freeColumns.length === 0 ) throw new Error( 'The equation has no non-trivial balancing solution.' );

  if ( freeColumns.length === 1 ) {
    const solution: Fraction[] = Array.from( { length: columns }, () => fraction( 0n ) );
    const freeColumn = freeColumns[ 0 ];

    solution[ freeColumn ] = fraction( 1n );

    for ( let row = 0; row < pivotColumns.length; row++ )
      solution[ pivotColumns[ row ] ] = negate( rows[ row ][ freeColumn ] );

    const integers = toIntegers( solution ), hasZero = integers.some( v => v === 0n );
    const hasPos = integers.some( v => v > 0n ), hasNeg = integers.some( v => v < 0n );

    if ( hasZero || ( hasPos && hasNeg ) ) throw new Error( 'No strictly positive balancing solution exists.' );
    return toNumbers( hasNeg ? integers.map( value => -value ) : integers );
  }

  return toNumbers( searchSolution( matrix, columns ) );
}
