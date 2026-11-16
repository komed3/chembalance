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
} );
