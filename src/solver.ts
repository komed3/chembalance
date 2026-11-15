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
export function solve ( matrix: bigint[][] ) : IntegerSolution {}
