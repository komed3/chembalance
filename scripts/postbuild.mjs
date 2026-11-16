// scripts/postbuild.mjs

import { mkdir, unlink, writeFile } from 'node:fs/promises';


await mkdir( 'dist/cjs', { recursive: true } );
await writeFile( 'dist/cjs/package.json', JSON.stringify( { type: 'commonjs' }, null, 2 ) );
await unlink( 'dist/cjs/types.js' );

await mkdir( 'dist/esm', { recursive: true } );
await writeFile( 'dist/esm/package.json', JSON.stringify( { type: 'module' }, null, 2 ) );
await unlink( 'dist/esm/types.js' );
