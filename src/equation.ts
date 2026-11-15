import ChemParse, { parse as parseFormula } from 'chemparse';
import type { ChemicalEquation, EquationTerm } from './types';


/** Supported reaction arrows. */
const ARROW_REGEX = /->|→/g;

/** Separates reaction terms without interfering with ionic charges. */
const TERM_SEPARATOR_REGEX = /\s+\+\s+/;

/** Matches an optional leading stoichiometric coefficient. */
const COEFFICIENT_REGEX = /^(\d+)\s*(.+)$/;


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

  return { formula, coefficient, composition: parseFormula( formula ) };
}
