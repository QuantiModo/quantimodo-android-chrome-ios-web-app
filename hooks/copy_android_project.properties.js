#!/usr/bin/env node
var shell = require( "shelljs" );
// for some reason, using shell.cp() would throw this error: "cp: copy File Sync: could not write to dest file (code=ENOENT)"
console.log("Copying android project.properties to fix Play Services conflicts");
console.log("cp -Rf resources/android/project.properties platforms/android/project.properties");
shell.exec("cp -Rf resources/android/project.properties platforms/android/project.properties", {silent:true} );
console.log("Copied all project.properties.");
process.exit(0);
