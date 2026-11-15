import type { Fraction } from './types';


/** Calculates the greatest common divisor. */
export function gcd ( a: bigint, b: bigint ) : bigint {
  a = a < 0n ? -a : a, b = b < 0n ? -b : b;

  while ( b !== 0n ) {
    const remainder = a % b;
    a = b, b = remainder;
  }

  return a;
}


/** Calculates the least common multiple. */
export function lcm ( a: bigint, b: bigint ) : bigint {
  if ( a === 0n || b === 0n ) return 0n;
  return ( a / gcd( a, b ) ) * b;
}


/** Creates a normalized fraction. */
export function fraction ( numerator: bigint, denominator = 1n ) : Fraction {
  if ( denominator === 0n ) throw new Error( 'Fraction denominator must not be zero.' );

  if ( denominator < 0n ) numerator = -numerator, denominator = -denominator;
  const divisor = gcd( numerator, denominator );

  return { numerator: numerator / divisor, denominator: denominator / divisor };
}
