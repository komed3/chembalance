import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import ChemBalance, { balance, isBalanced, parse, validate } from '../dist/esm/index.js';


const require = createRequire( import.meta.url );
const CommonJS = require( '../dist/cjs/index.js' );
