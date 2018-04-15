#!/usr/bin/env node
var shell = require( "shelljs" );
// for some reason, using shell.cp() would throw this error:
// "cp: copy File Sync: could not write to dest file (code=ENOENT)"
console.log( "cp -Rf resources/android/res/* platforms/android/res");
shell.exec( "cp -Rf resources/android/res/* platforms/android/res", {silent:true} );
console.log("Copying drawable-xxxhdpi-v11 to drawable for geolocation icon");
shell.exec("cp -Rf resources/android/res/drawable-xxhdpi/* platforms/android/res/drawable", {silent:true} ); // Must be done first
shell.exec("cp -Rf resources/android/res/drawable-xxhdpi-v11/* platforms/android/res/drawable", {silent:true} );
console.log( "Copied all android assets.");
process.exit(0);
