import { parseEquation } from './equation';
import { buildMatrix, isMatrixBalanced } from './matrix';
import { solve } from './solver';
import type { BalanceOptions, BalanceResult, BalancedTerm, ChemicalEquation, EquationTerm } from './types';


/** Formats a reaction term using its stoichiometric coefficient. */
function formatTerm ( { formula, coefficient }: BalancedTerm ) : string {
  return coefficient === 1 ? formula : `${ coefficient } ${ formula }`;
}

/** Converts a parsed equation and its coefficients into balanced terms. */
function createTerms ( terms: EquationTerm[], coefficients: number[], offset: number ) : BalancedTerm[] {
  return terms.map( ( { formula }, i ) => ( { formula, coefficient: coefficients[ offset + i ] } ) );
}

/** Creates optional species for the selected reaction medium. */
function createAuxiliaryTerms ( medium: BalanceOptions[ 'medium' ] ) : EquationTerm[] {
  const formulas = medium === 'acidic' ? [ 'H2O', 'H^+', 'e^-' ] : medium === 'basic' ? [ 'H2O', 'OH^-', 'e^-' ] : [];
  if ( ! formulas.length ) return [];

  return parseEquation( `${ formulas.join( ' + ' ) } -> ${ formulas.join( ' + ' ) }` )
    .reactants.map( term => ( { ...term, auxiliary: true } ) );
}

/** Generates all combinations of optional species placements. */
function* auxiliaryEquations ( { reactants, products }: ChemicalEquation, species: EquationTerm[] ) {
  const existing = new Set( [ ...reactants, ...products ].map( ( { formula } ) => formula ) );
  const candidates = species.filter( ( { formula } ) => ! existing.has( formula ) );

  function insert ( terms: EquationTerm[], term: EquationTerm ) : EquationTerm[] {
    const auxiliaryCount = terms.filter( ( { auxiliary } ) => auxiliary ).length;
    const i = Math.min( 1 + auxiliaryCount, terms.length );

    return [ ...terms.slice( 0, i ), term, ...terms.slice( i ) ];
  }

  function* generate ( i: number, r: EquationTerm[], p: EquationTerm[] ) : Generator< ChemicalEquation > {
    if ( i === candidates.length ) { yield { reactants: r, products: p }; return }
    yield* generate( i + 1, r, p );

    const term = candidates[ i ];
    yield* generate( i + 1, insert( r, term ), p );
    yield* generate( i + 1, r, insert( p, term ) );
  }

  yield* generate( 0, reactants, products );
}

/** Counts auxiliary species and electrons in a reaction equation. */
function countAuxiliaryTerms ( { reactants, products }: ChemicalEquation ) : { terms: number; electrons: number } {
  const counts = { terms: 0, electrons: 0 };

  for ( const { auxiliary, composition } of [ ...reactants, ...products ] ) {
    if ( ! auxiliary ) continue;

    counts.terms++;
    if ( composition.particleCounts?.e !== undefined ) counts.electrons++;
  }

  return counts;
}

/** Compares solutions by auxiliary species, coefficient sum and lexicographically. */
function isBetter (
  { equation: currentEquation, coefficients: currentCoefficients }: { equation: ChemicalEquation; coefficients: number[] },
  { equation: bestEquation, coefficients: bestCoefficients }: { equation: ChemicalEquation; coefficients: number[] }
) : boolean {
  const currentCounts = countAuxiliaryTerms( currentEquation );
  const bestCounts = countAuxiliaryTerms( bestEquation );

  if ( currentCounts.electrons !== bestCounts.electrons ) return currentCounts.electrons < bestCounts.electrons;
  if ( currentCounts.terms !== bestCounts.terms ) return currentCounts.terms < bestCounts.terms;

  const sum = currentCoefficients.reduce( ( total, v ) => total + v, 0 );
  const bestSum = bestCoefficients.reduce( ( total, v ) => total + v, 0 );

  if ( sum !== bestSum ) return sum < bestSum;

  for ( let i = 0; i < Math.min( currentCoefficients.length, bestCoefficients.length ); i++ ) {
    if ( currentCoefficients[ i ] !== bestCoefficients[ i ] )
      return currentCoefficients[ i ] < bestCoefficients[ i ];
  }

  return currentCoefficients.length < bestCoefficients.length;
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
  let searchLimitExceeded = false;

  for ( const candidate of auxiliaryEquations( parsed, species ) ) {
    try {
      const coefficients = solve( buildMatrix( candidate ) );
      const current = { equation: candidate, coefficients };

      if ( ! best || isBetter( current, best ) ) best = current;
    } catch ( err ) {
      if ( err instanceof Error && err.message === 'Balancing search limit exceeded.' )
        searchLimitExceeded = true;
    }
  }

  if ( ! best ) {
    if ( searchLimitExceeded ) throw new Error( 'Balancing search limit exceeded.' );
    throw new Error( 'No positive balancing solution exists for the selected reaction medium.' );
  }

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
