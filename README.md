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
