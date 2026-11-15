import ChemParse, { parse as parseFormula } from 'chemparse';
import type { ChemicalEquation, EquationTerm } from './types';


/** Supported reaction arrows. */
const ARROW_REGEX = /->|→/g;

/** Separates reaction terms without interfering with ionic charges. */
const TERM_SEPARATOR_REGEX = /\s+\+\s+/;

/** Matches an optional leading stoichiometric coefficient. */
const COEFFICIENT_REGEX = /^(\d+)\s*(.+)$/;
