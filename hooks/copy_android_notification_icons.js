#!/usr/bin/env node
var shell = require( "shelljs" );

// for some reason, using shell.cp() would throw this error:
// "cp: copy File Sync: could not write to dest file (code=ENOENT)"
shell.exec( "cp -Rf resources/android/res/* platforms/android/res", {silent:true} );

console.log( "Copied all android assets." );

process.exit(0);