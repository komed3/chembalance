import { parseEquation } from './equation';
import { buildMatrix, isMatrixBalanced } from './matrix';
import { solve } from './solver';
import type { BalanceOptions, BalanceResult, BalancedTerm, ChemicalEquation, EquationTerm } from './types';


/** Formats a reaction term using its stoichiometric coefficient. */
function formatTerm ( term: BalancedTerm ) : string {
  return term.coefficient === 1 ? term.formula : `${ term.coefficient } ${ term.formula }`;
}

/** Converts a parsed equation and its coefficients into balanced terms. */
function createTerms ( terms: EquationTerm[], coefficients: number[], offset: number ) : BalancedTerm[] {
  return terms.map( ( { formula }, i ) => ( { formula, coefficient: coefficients[ offset + i ] } ) );
}


/** Creates optional species for the selected reaction medium. */
function createAuxiliaryTerms ( medium: BalanceOptions[ 'medium' ] ) : EquationTerm[] {
  if ( medium === 'acidic' ) return [
    ...parseEquation( 'H2O -> H2O' ).reactants.map( term => ( { ...term, auxiliary: true } ) ),
    ...parseEquation( 'H^+ -> H^+' ).reactants.map( term => ( { ...term, auxiliary: true } ) ),
    { ...parseEquation( 'e^- -> e^-' ).reactants[ 0 ], auxiliary: true }
  ];

  if ( medium === 'basic' ) return [
    ...parseEquation( 'H2O -> H2O' ).reactants.map( term => ( { ...term, auxiliary: true } ) ),
    ...parseEquation( 'OH^- -> OH^-' ).reactants.map( term => ( { ...term, auxiliary: true } ) ),
    { ...parseEquation( 'e^- -> e^-' ).reactants[ 0 ], auxiliary: true }
  ];

  return [];
}


/** Returns whether an equation already contains a species. */
function hasSpecies ( equation: ChemicalEquation, formula: string ) : boolean {
  return [ ...equation.reactants, ...equation.products ].some( term => term.formula === formula );
}


/** Generates all combinations of optional species placements. */
function* auxiliaryEquations ( equation: ChemicalEquation, species: EquationTerm[] ) {
  const candidates = species.filter( ( { formula } ) => ! hasSpecies( equation, formula ) );

  function* generate ( i: number, reactants: EquationTerm[], products: EquationTerm[] ) {
    if ( i === candidates.length ) {
      yield { reactants, products };
      return;
    }

    yield* generate( i + 1, reactants, products );

    const term = candidates[ i ];
    yield* generate( i + 1, [ ...reactants, term ], products );
    yield* generate( i + 1, reactants, [ ...products, term ] );
  }

  yield* generate( 0, equation.reactants, equation.products );
}


/** Compares solutions by coefficient sum and then lexicographically. */
function isBetter ( current: number[], best: number[] ) : boolean {
  const sum = current.reduce( ( total, v ) => total + v, 0 );
  const bestSum = best.reduce( ( total, v ) => total + v, 0 );

  if ( sum !== bestSum ) return sum < bestSum;
  return current.some( ( v, i ) => v !== best[ i ] && v < best[ i ] );
}


/**
 * Balances a chemical reaction equation.
 *
 * Existing stoichiometric coefficients are recalculated.
 *
 * @param equation The chemical reaction equation.
 * @param options Optional reaction conditions.
 * @returns The balanced equation and its coefficients.
 * @throws {Error} If the equation cannot be balanced.
 */
export function balance ( equation: string, options: BalanceOptions = {} ) : BalanceResult {
  const { medium } = options;
  const parsed = parseEquation( equation );

  if ( medium !== undefined && medium !== 'acidic' && medium !== 'basic' )
    throw new Error( 'Reaction medium must be "acidic" or "basic".' );

  const species = createAuxiliaryTerms( medium );
  let best: { equation: ChemicalEquation; coefficients: number[] } | undefined;

  for ( const candidate of auxiliaryEquations( parsed, species ) ) {
    try {
      const coefficients = solve( buildMatrix( candidate ) );
      if ( ! best || isBetter( coefficients, best.coefficients ) ) best = { equation: candidate, coefficients };
    } catch ( err ) {
      if ( err instanceof Error && err.message === 'Balancing search limit exceeded.' ) throw err;
    }
  }

  if ( ! best ) throw new Error( 'No positive balancing solution exists for the selected reaction medium.' );

  const reactants = createTerms( best.equation.reactants, best.coefficients, 0 );
  const products = createTerms( best.equation.products, best.coefficients, best.equation.reactants.length );

  return {
    equation: [
      reactants.map( formatTerm ).join( ' + ' ),
      products.map( formatTerm ).join( ' + ' )
    ].join( ' -> ' ),
    coefficients: best.coefficients, reactants, products,
    balanced: true
  };
}


/**
 * Checks whether a chemical reaction equation is balanced.
 *
 * Existing coefficients are taken into account.
 *
 * @param equation The chemical reaction equation.
 * @returns True if all elements and charges are balanced.
 */
export function isBalanced ( equation: string ) : boolean {
  const parsed = parseEquation( equation ), matrix = buildMatrix( parsed, true );
  return isMatrixBalanced( matrix );
}


/**
 * Checks whether a chemical reaction equation is syntactically valid.
 *
 * @param equation The chemical reaction equation.
 * @returns True if the equation and all formulas are valid.
 */
export function validate ( equation: string ) : boolean {
  try { parseEquation( equation ); return true }
  catch { return false }
}
