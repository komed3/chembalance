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

  function insert ( terms: EquationTerm[], term: EquationTerm ) : EquationTerm[] {
    const auxiliaryCount = terms.filter( ( { auxiliary } ) => auxiliary ).length;
    const i = Math.min( 1 + auxiliaryCount, terms.length );

    return [ ...terms.slice( 0, i ), term, ...terms.slice( i ) ];
  }

  function* generate ( i: number, reactants: EquationTerm[], products: EquationTerm[] ) : Generator< ChemicalEquation > {
    if ( i === candidates.length ) { yield { reactants, products }; return }
    yield* generate( i + 1, reactants, products );

    const term = candidates[ i ];
    yield* generate( i + 1, insert( reactants, term ), products );
    yield* generate( i + 1, reactants, insert( products, term ) );
  }

  yield* generate( 0, equation.reactants, equation.products );
}


/** Counts auxiliary electrons in a reaction equation. */
function countAuxiliaryElectrons ( { reactants, products }: ChemicalEquation ) : number {
  return [ ...reactants, ...products ].filter( ( { auxiliary, composition } ) =>
    auxiliary && composition.particleCounts?.e !== undefined
  ).length;
}


/** Counts auxiliary species in a reaction equation. */
function countAuxiliaryTerms ( { reactants, products }: ChemicalEquation ) : number {
  return [ ...reactants, ...products ].filter( ( { auxiliary } ) => auxiliary ).length;
}


/** Compares solutions by auxiliary species, coefficient sum and lexicographically. */
function isBetter (
  current: { equation: ChemicalEquation; coefficients: number[] },
  best: { equation: ChemicalEquation; coefficients: number[] }
) : boolean {
  const electrons = countAuxiliaryElectrons( current.equation );
  const bestElectrons = countAuxiliaryElectrons( best.equation );

  if ( electrons !== bestElectrons ) return electrons < bestElectrons;

  const auxiliaries = countAuxiliaryTerms( current.equation );
  const bestAuxiliaries = countAuxiliaryTerms( best.equation );

  if ( auxiliaries !== bestAuxiliaries ) return auxiliaries < bestAuxiliaries;

  const sum = current.coefficients.reduce( ( total, v ) => total + v, 0 );
  const bestSum = best.coefficients.reduce( ( total, v ) => total + v, 0 );

  if ( sum !== bestSum ) return sum < bestSum;

  for ( let i = 0; i < Math.min( current.coefficients.length, best.coefficients.length ); i++ ) {
    if ( current.coefficients[ i ] !== best.coefficients[ i ] )
      return current.coefficients[ i ] < best.coefficients[ i ];
  }

  return current.coefficients.length < best.coefficients.length;
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
