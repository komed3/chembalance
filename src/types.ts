import type { ChemParseResult } from 'chemparse';


/** A parsed term of a chemical reaction. */
export interface EquationTerm {
  formula: string;
  coefficient: number;
  composition: ChemParseResult;
}
