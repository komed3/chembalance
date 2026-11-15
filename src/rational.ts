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
