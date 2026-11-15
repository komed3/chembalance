/** Calculates the greatest common divisor. */
export function gcd ( a: bigint, b: bigint ) : bigint {
  a = a < 0n ? -a : a, b = b < 0n ? -b : b;

  while ( b !== 0n ) {
    const remainder = a % b;
    a = b, b = remainder;
  }

  return a;
}
