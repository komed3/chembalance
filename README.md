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
