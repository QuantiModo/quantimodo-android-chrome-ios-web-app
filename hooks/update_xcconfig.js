#!/usr/bin/env node

/**
 * Replace build.xcconfig with template that doesn't include ResourceRules.plist to
 * fix upload to iTunes error starting with XCode 7
 */
var path = require('path');
var fs = require('fs');
var rootdir = process.argv[2];
console.log('hook: root directory is ' + rootdir);
var platforms = process.env.CORDOVA_PLATFORMS;

var FgRed = "\x1b[31m";
var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var Reset = "\x1b[0m";

if (platforms.indexOf('ios' > -1)) {
  console.log("Current platform is " + platforms);
  var xcconfigFinal = path.resolve(__dirname, '../../platforms/ios/cordova/build.xcconfig');
  var xcconfigTemplate = path.resolve(__dirname, '../../scripts/xcconfig/build.xcconfig.template');

  fs.readFile(xcconfigTemplate, 'utf8', function (err, templateFile) {
    if (err) {
      return console.log(err);
    }

    fs.writeFile(xcconfigFinal, templateFile, 'utf8', function (err) {
      if (err) {
        return console.log('No directory Found for cordova iOS! Skipping xcconfig creation. ERROR: ' + err);
      }
      console.log('Cordova iOS build.xcconfig replaced successfully.')
    });
  });
} else if (platforms.indexOf("android" > -1)){
	console.log("update_xconfig hook is for iOS only! Current platform is " + platforms);
} else {
  console.log("update_xconfig hook is for iOS only! Current platform is " + platforms);
}
