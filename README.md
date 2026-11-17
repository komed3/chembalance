# ChemBalance

**ChemBalance** is a lightweight TypeScript library for balancing chemical reaction
equations using stoichiometric methods.

It supports chemical formulas, ionic charges, electrons, redox reactions,
and reactions in acidic or basic media. It uses exact rational arithmetic and
searches for the smallest positive integer coefficients.


## Features

- Balances chemical reaction equations using stoichiometric matrices
- Supports all 118 IUPAC element symbols through ChemParse
- Handles ionic compounds and charged species
- Supports electron transfer in redox reactions
- Balances redox reactions in acidic and basic media
- Automatically introduces water, hydrogen ions, hydroxide ions, and electrons when required
- Finds the smallest positive integer coefficients
- Supports multi-dimensional solution spaces
- Provides configurable search profiles for complex equations
- Checks whether a reaction equation is already balanced
- Parses reaction equations into structured data
- Provides TypeScript types and both named and default exports
- Uses exact rational arithmetic for matrix calculations


## Installation

```bash
npm install chembalance
```

ChemBalance uses [ChemParse](https://npmjs.com/package/chemparse) to parse
chemical formulas and particle expressions.


## Usage

### ES Modules

```js
import ChemBalance, { balance, isBalanced, parse, validate } from 'chembalance';

const result = balance( 'H2 + O2 -> H2O' );

console.log( result.equation ); // 2 H2 + O2 -> 2 H2O
console.log( result.coefficients ); // [ 2, 1, 2 ]
console.log( isBalanced( result.equation ) ); // true
console.log( validate( 'H2 + O2 -> H2O' ) ); // true

// All functions are also available as static methods.
console.log( ChemBalance.balance( 'Fe + O2 -> Fe2O3' ).equation );
```

All functions are also available as static methods on the default `ChemBalance` class.

### CommonJS

```js
const ChemBalance = require( 'chembalance' ).default;
const { balance, isBalanced, parse, validate } = require( 'chembalance' );

console.log( balance( 'H2 + O2 -> H2O' ).equation );
console.log( ChemBalance.isBalanced( '2 H2 + O2 -> 2 H2O' ) );
console.log( parse( 'H2 + O2 -> H2O' ) );
```

### Browser

ChemBalance can also be used in browser environments through an ESM CDN import:

```html
<script type="module">
  import ChemBalance, { balance } from 'https://cdn.jsdelivr.net/npm/chembalance@1.0.0/+esm';

  console.log( balance( 'H2 + O2 -> H2O' ).equation );
  console.log( ChemBalance.isBalanced( '2 H2 + O2 -> 2 H2O' ) );
</script>
```

The package provides ESM and CommonJS builds. It does not include a separate UMD build.


## API

All functions are available as named exports and as static methods of the default `ChemBalance` class.

### `balance ( equation: string, options?: BalanceOptions ) : BalanceResult`

Balances a chemical reaction equation and returns the balanced equation together with
its coefficients and individual reaction terms.

Existing stoichiometric coefficients are recalculated.

```js
balance( 'H2 + O2 -> H2O' );
// {
//   equation: '2 H2 + O2 -> 2 H2O',
//   coefficients: [ 2, 1, 2 ],
//   reactants: [
//     { formula: 'H2', coefficient: 2 },
//     { formula: 'O2', coefficient: 1 }
//   ],
//   products: [
//     { formula: 'H2O', coefficient: 2 }
//   ],
//   balanced: true
// }
```

The optional `options` parameter accepts a reaction medium and a search profile.

```js
balance( 'MnO4^- + Fe^2+ -> Mn^2+ + Fe^3+', { medium: 'acidic' } );
//  MnO4^- + 5 Fe^2+ + 8 H^+ -> Mn^2+ + 5 Fe^3+ + 4 H2O
```

The reaction medium can be set to `acidic` or `basic`.
ChemBalance introduces the required auxiliary species automatically.

The search profile controls the amount of computational effort used when finding a positive integer solution.
Available profiles are `fast`, `balanced`, and `thorough`. The default is `balanced`.

Throws an error if the equation is invalid, no positive balancing solution exists, or a search limit is exceeded.

### `isBalanced ( equation: string ) : boolean`

Checks whether a chemical reaction equation is balanced.

Existing stoichiometric coefficients are taken into account.
Both elemental composition and total ionic charge are considered.

```js
isBalanced( '2 H2 + O2 -> 2 H2O' ); // true
isBalanced( 'H2 + O2 -> H2O' ); // false
isBalanced( 'Fe^2+ -> Fe^3+' ); // false
isBalanced( '2 Fe^2+ -> 2 Fe^2+' ); // true
```

Throws an error if the equation is syntactically invalid.

### `validate ( equation: string ) : boolean`

Checks whether a chemical reaction equation is syntactically valid and all reaction formulas can be parsed.

```js
validate( 'H2 + O2 -> H2O' ); // true
validate( 'Fe^2+ + e- -> Fe' ); // true
validate( 'H2 + O2' ); // false
validate( 'Xx2 -> H2O' ); // false
```

Returns `false` for invalid input instead of throwing an error.

### `parse ( equation: string ) : ChemicalEquation`

Parses a chemical reaction equation and returns its reactants and products as structured data.

Each reaction term contains its formula, stoichiometric coefficient, and parsed chemical composition.

```js
parse( '2 H2 + O2 -> 2 H2O' );
// {
//   reactants: [
//     { formula: 'H2', coefficient: 2, composition: { elementCounts: { H: 2 } } },
//     { formula: 'O2', coefficient: 1, composition: { elementCounts: { O: 2 } } }
//   ],
//   products: [
//     { formula: 'H2O', coefficient: 2, composition: { elementCounts: { H: 2, O: 1 } } }
//   ]
// }
```

The `composition` property contains the result returned by `ChemParse.parse()`.

Throws a `TypeError` if the input is not a string and an `Error` if the equation or any reaction term is invalid.
