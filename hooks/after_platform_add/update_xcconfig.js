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


if (platforms == "ios") {
  var xcconfigFinal = path.resolve(__dirname, '../../platforms/ios/cordova/build.xcconfig');
  var xcconfigTemplate = path.resolve(__dirname, '../../scripts/xcconfig/build.xcconfig.template');

  fs.readFile(xcconfigTemplate, 'utf8', function (err,templateFile) {
    if (err) {
      return console.log(err);
    }

    fs.writeFile(xcconfigFinal, templateFile, 'utf8', function (err) {
      if (err) return console.log('No directory Found for cordova iOS! Skipping xcconfig creation. ',err);
      console.log('Cordova iOS build.xcconfig replaced successfully.')
    });
  });
} else if (platforms == "android") {
	console.log("update_xconfig hook is for iOS only");
} else {
  console.log("update_xconfig hook is for iOS only");
}
