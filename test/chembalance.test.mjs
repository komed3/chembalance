import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import ChemBalance, { balance, isBalanced, parse, validate } from '../dist/esm/index.js';


const require = createRequire( import.meta.url );
const CommonJS = require( '../dist/cjs/index.js' );


test( 'exports', async t => {
  await t.test( 'ESM exports', () => {
    assert.equal( typeof balance, 'function' );
    assert.equal( typeof isBalanced, 'function' );
    assert.equal( typeof parse, 'function' );
    assert.equal( typeof validate, 'function' );

    assert.equal( typeof ChemBalance.balance, 'function' );
    assert.equal( typeof ChemBalance.isBalanced, 'function' );
    assert.equal( typeof ChemBalance.parse, 'function' );
    assert.equal( typeof ChemBalance.validate, 'function' );
  } );

  await t.test( 'CommonJS exports', () => {
    assert.equal( typeof CommonJS.balance, 'function' );
    assert.equal( typeof CommonJS.isBalanced, 'function' );
    assert.equal( typeof CommonJS.parse, 'function' );
    assert.equal( typeof CommonJS.validate, 'function' );

    assert.equal( typeof CommonJS.default.balance, 'function' );
    assert.equal( typeof CommonJS.default.isBalanced, 'function' );
    assert.equal( typeof CommonJS.default.parse, 'function' );
    assert.equal( typeof CommonJS.default.validate, 'function' );
  } );
} );


test( 'parse', async t => {
  await t.test( 'parses reaction terms', () => {
    const result = parse( '2 H2 + O2 -> H2O' );

    assert.equal( result.reactants.length, 2 );
    assert.equal( result.products.length, 1 );

    assert.deepEqual(
      result.reactants.map( ( { formula, coefficient } ) => ( { formula, coefficient } ) ),
      [ { formula: 'H2', coefficient: 2 }, { formula: 'O2', coefficient: 1 } ]
    );

    assert.deepEqual(
      result.products.map( ( { formula, coefficient } ) => ( { formula, coefficient } ) ),
      [ { formula: 'H2O', coefficient: 1 } ]
    );
  } );

  await t.test( 'parses element compositions', () => {
    const result = parse( 'H2O -> H2O' );

    assert.deepEqual( result.reactants[ 0 ].composition.elementCounts, { H: 2, O: 1 } );
    assert.deepEqual( result.products[ 0 ].composition.elementCounts, { H: 2, O: 1 } );
  } );

  await t.test( 'parses Unicode reaction arrows', () => {
    const result = parse( 'H2 + O2 → H2O' );

    assert.equal( result.reactants.length, 2 );
    assert.equal( result.products.length, 1 );
  } );

  await t.test( 'parses ionic charges', () => {
    const result = parse( 'H^+ + Cl^- -> HCl' );

    assert.equal( result.reactants[ 0 ].composition.charge, 1 );
    assert.equal( result.reactants[ 1 ].composition.charge, -1 );
    assert.equal( result.products[ 0 ].composition.charge, undefined );
  } );
} );


test( 'balance', async t => {
  const cases = [ {
    equation: 'H2 + O2 -> H2O',
    balanced: '2 H2 + O2 -> 2 H2O',
    coefficients: [ 2, 1, 2 ]
  }, {
    equation: 'Fe + O2 -> Fe2O3',
    balanced: '4 Fe + 3 O2 -> 2 Fe2O3',
    coefficients: [ 4, 3, 2 ]
  }, {
    equation: 'C2H6 + O2 -> CO2 + H2O',
    balanced: '2 C2H6 + 7 O2 -> 4 CO2 + 6 H2O',
    coefficients: [ 2, 7, 4, 6 ]
  }, {
    equation: 'Al + HCl -> AlCl3 + H2',
    balanced: '2 Al + 6 HCl -> 2 AlCl3 + 3 H2',
    coefficients: [ 2, 6, 2, 3 ]
  }, {
    equation: 'NaOH + H2SO4 -> Na2SO4 + H2O',
    balanced: '2 NaOH + H2SO4 -> Na2SO4 + 2 H2O',
    coefficients: [ 2, 1, 1, 2 ]
  }, {
    equation: 'Ca(OH)2 + HCl -> CaCl2 + H2O',
    balanced: 'Ca(OH)2 + 2 HCl -> CaCl2 + 2 H2O',
    coefficients: [ 1, 2, 1, 2 ]
  }, {
    equation: 'H^+ + Cl^- -> HCl',
    balanced: 'H^+ + Cl^- -> HCl',
    coefficients: [ 1, 1, 1 ]
  } ];

  for ( const { equation, balanced, coefficients } of cases ) {
    await t.test( equation, () => {
      const result = balance( equation );

      assert.equal( result.equation, balanced );
      assert.deepEqual( result.coefficients, coefficients );
      assert.equal( result.balanced, true );

      assert.deepEqual(
        result.reactants.map( ( { coefficient } ) => coefficient ),
        coefficients.slice( 0, result.reactants.length )
      );

      assert.deepEqual(
        result.products.map( ( { coefficient } ) => coefficient ),
        coefficients.slice( result.reactants.length )
      );
    } );
  }

  await t.test( 'recalculates existing coefficients', () => {
    const result = balance( '2 H2 + 4 O2 -> 7 H2O' );

    assert.equal( result.equation, '2 H2 + O2 -> 2 H2O' );
    assert.deepEqual( result.coefficients, [ 2, 1, 2 ] );
  } );

  await t.test( 'returns the smallest integer coefficients', () => {
    const result = balance( '4 H2 + 2 O2 -> 4 H2O' );

    assert.deepEqual( result.coefficients, [ 2, 1, 2 ] );
  } );
} );


test( 'isBalanced', async t => {
  await t.test( 'accepts balanced equations', () => {
    assert.equal( isBalanced( '2 H2 + O2 -> 2 H2O' ), true );
    assert.equal( isBalanced( '4 Fe + 3 O2 -> 2 Fe2O3' ), true );
    assert.equal( isBalanced( 'H^+ + Cl^- -> HCl' ), true );
  } );

  await t.test( 'rejects unbalanced equations', () => {
    assert.equal( isBalanced( 'H2 + O2 -> H2O' ), false );
    assert.equal( isBalanced( 'Fe + O2 -> Fe2O3' ), false );
    assert.equal( isBalanced( '2 H2 + 2 O2 -> 2 H2O' ), false );
  } );

  await t.test( 'takes existing coefficients into account', () => {
    assert.equal( isBalanced( '2 H2 + O2 -> 2 H2O' ), true );
    assert.equal( isBalanced( 'H2 + O2 -> 2 H2O' ), false );
  } );
} );


test( 'validate', async t => {
  await t.test( 'accepts syntactically valid equations', () => {
    assert.equal( validate( 'H2 + O2 -> H2O' ), true );
    assert.equal( validate( '4 Fe + 3 O2 -> 2 Fe2O3' ), true );
    assert.equal( validate( 'H^+ + Cl^- -> HCl' ), true );
  } );

  await t.test( 'does not require an equation to be balanced', () => {
    assert.equal( validate( 'H2 + O2 -> H2O' ), true );
    assert.equal( validate( 'Fe + O2 -> Fe2O3' ), true );
  } );

  await t.test( 'rejects invalid equations', () => {
    const invalid = [
      '', '   ', 'H2 + O2', '-> H2O', 'H2 ->', 'H2 -> H2 -> H2', 'H2 +  + O2 -> H2O',
      'H2 + O2 -> H2O + ', '0 H2 + O2 -> H2O', '9007199254740992 H2 -> H2', 'Xx + O2 -> XxO2'
    ];

    for ( const equation of invalid ) assert.equal( validate( equation ), false, equation );
  } );

  await t.test( 'rejects non-string input', () => {
    assert.equal( validate( null ), false );
    assert.equal( validate( undefined ), false );
    assert.equal( validate( 123 ), false );
    assert.equal( validate( {} ), false );
  } );
} );


test( 'special species', async t => {
  await t.test( 'parses electron notation', () => {
    for ( const formula of [ 'e-', 'e^-', 'e^-1', 'e⁻', 'e⁻¹', 'e^−', 'e^−1' ] ) {
      const result = parse( `${ formula } -> ${ formula }` );

      assert.deepEqual( result.reactants[ 0 ].composition.elementCounts, {} );
      assert.equal( result.reactants[ 0 ].composition.charge, -1 );
    }
  } );

  await t.test( 'balances electron half-reactions', () => {
    const result = balance( 'Fe^2+ -> Fe^3+ + e-' );

    assert.equal( result.equation, 'Fe^2+ -> Fe^3+ + e-' );
    assert.deepEqual( result.coefficients, [ 1, 1, 1 ] );
    assert.equal( isBalanced( result.equation ), true );
  } );

  await t.test( 'preserves the original electron notation', () => {
    const result = balance( 'Fe^2+ -> Fe^3+ + e⁻¹' );

    assert.equal( result.equation, 'Fe^2+ -> Fe^3+ + e⁻¹' );
  } );
} );


test( 'error handling', async t => {
  await t.test( 'parse rejects non-string input with TypeError', () => {
    assert.throws( () => parse( null ), TypeError );
    assert.throws( () => parse( undefined ), TypeError );
    assert.throws( () => parse( 123 ), TypeError );
  } );

  await t.test( 'parse rejects missing or multiple reaction arrows', () => {
    assert.throws( () => parse( 'H2 + O2' ), Error );
    assert.throws( () => parse( 'H2 -> H2 -> H2' ), Error );
  } );

  await t.test( 'parse rejects empty reaction sides', () => {
    assert.throws( () => parse( '-> H2O' ), Error );
    assert.throws( () => parse( 'H2 ->' ), Error );
  } );

  await t.test( 'parse rejects empty reaction terms', () => {
    assert.throws( () => parse( 'H2 +  + O2 -> H2O' ), Error );
    assert.throws( () => parse( 'H2 + O2 -> H2O + ' ), Error );
  } );

  await t.test( 'parse rejects invalid formulas', () => {
    assert.throws( () => parse( 'Xx -> Xx' ), Error );
  } );

  await t.test( 'parse rejects invalid coefficients', () => {
    assert.throws( () => parse( '0 H2 -> H2' ), Error );
    assert.throws( () => parse( '9007199254740992 H2 -> H2' ), Error );
  } );

  await t.test( 'balance rejects invalid equations', () => {
    assert.throws( () => balance( '' ), Error );
    assert.throws( () => balance( 'H2 + O2' ), Error );
    assert.throws( () => balance( 'Xx -> Xx' ), Error );
  } );

  await t.test( 'isBalanced rejects invalid equations', () => {
    assert.throws( () => isBalanced( '' ), Error );
    assert.throws( () => isBalanced( 'H2 + O2' ), Error );
    assert.throws( () => isBalanced( 'Xx -> Xx' ), Error );
  } );
} );
