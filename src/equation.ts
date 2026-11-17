import { parse as parseFormula } from 'chemparse';
import type { ChemicalEquation, EquationTerm } from './types';


/** Supported reaction arrows. */
const ARROW_REGEX = /->|→/g;

/** Separates reaction terms without interfering with ionic charges. */
const TERM_SEPARATOR_REGEX = /(?<=\s)\+(?=\s)/;

/** Matches an optional leading stoichiometric coefficient. */
const COEFFICIENT_REGEX = /^(\d+)\s*(\S.*)$/;


/**
 * Parses a reaction term into its coefficient and chemical formula.
 *
 * @throws {Error} If the coefficient or formula is invalid.
 */
function parseTerm ( value: string ) : EquationTerm {
  const term = value.trim(), match = term.match( COEFFICIENT_REGEX );
  const coefficient = match ? Number( match[ 1 ] ) : 1;
  const formula = match ? match[ 2 ].trim() : term;

  if ( ! Number.isSafeInteger( coefficient ) || coefficient <= 0 )
    throw new Error( `Invalid stoichiometric coefficient in "${ term }".` );

  const composition = parseFormula( formula );

  if ( composition.particleCounts && Object.keys( composition.particleCounts ).some( p => p !== 'e' ) )
    throw new Error( `Unsupported particle in reaction term "${ formula }".` );

  return { formula, coefficient, composition };
}

/**
 * Parses one side of a chemical reaction.
 *
 * @throws {Error} If the side contains invalid or empty terms.
 */
function parseSide ( value: string ) : EquationTerm[] {
  const terms = value.trimStart().split( TERM_SEPARATOR_REGEX );
  if ( terms.some( term => ! term.trim() ) ) throw new Error( 'Reaction contains an empty term.' );
  return terms.map( parseTerm );
}


/**
 * Parses a chemical reaction equation.
 *
 * @param equation The chemical reaction equation.
 * @returns The parsed reactants and products.
 * @throws {TypeError} If the equation is not a string.
 * @throws {Error} If the equation is invalid.
 */
export function parseEquation ( equation: string ) : ChemicalEquation {
  if ( typeof equation !== 'string' ) throw new TypeError( 'Equation must be a string.' );

  const arrows = equation.match( ARROW_REGEX );
  if ( ! arrows || arrows.length !== 1 )
    throw new Error( 'Equation must contain exactly one reaction arrow.' );

  const pos = equation.search( ARROW_REGEX ), arrow = arrows[ 0 ];
  const left = equation.slice( 0, pos ), right = equation.slice( pos + arrow.length );

  if ( ! left.trim() || ! right.trim() )
    throw new Error( 'Both sides of the equation must contain at least one term.' );

  return { reactants: parseSide( left ), products: parseSide( right ) };
}
