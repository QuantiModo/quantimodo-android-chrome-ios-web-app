#!/usr/bin/env node

/**
 * Update build-release.xcconfig with correct profile and developer values for app signing
 */
var path = require('path');
var fs = require('fs');
var PROFILE_UUID_TEMPLATE_VAL = '%PROFILE_UUID%';
var PROFILE_UUID_ENV_VAR = process.env.PROFILE_UUID;
var DEVELOPER_NAME_REGEX_GLOBAL = /%DEVELOPER_NAME%/g;
var DEVELOPER_NAME_ENV_VAR = process.env.DEVELOPER_NAME;
var platforms = process.env.CORDOVA_PLATFORMS;
var rootdir = process.argv[2];

var FgRed = "\x1b[31m";
var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var Reset = "\x1b[0m";

console.log('hook: root directory is ' + rootdir);

if (platforms.indexOf("ios" > -1)){
  console.log("Current platform is " + platforms);
  var xcconfigFinal = path.resolve(__dirname, '../../platforms/ios/cordova/build-release.xcconfig');
  var xcconfigTemplate = path.resolve(__dirname, '../../scripts/xcconfig/build-release.xcconfig.template');

  fs.readFile(xcconfigTemplate, 'utf8', function (err,data) {
    if (err) {
      return console.log(FgRed, err, Reset);
    }

    var result = data.replace(PROFILE_UUID_TEMPLATE_VAL, PROFILE_UUID_ENV_VAR)
      .replace(DEVELOPER_NAME_REGEX_GLOBAL, DEVELOPER_NAME_ENV_VAR);

    fs.writeFile(xcconfigFinal, result, 'utf8', function (err) {
      if (err) {
        return console.log(FgRed, 'No directory Found for cordova iOS! Skipping xcconfig creation. ', err, Reset);
      }
      console.log('Cordova iOS build-release.xcconfig updated with profile and developer values.');
    });
  });
} else if (platforms.indexOf("android" > -1)){
	console.log("update-release-xcconfig hook is for iOS only! Current platform is " + platforms);
} else {
  console.log("update-release-xcconfig hook is for iOS only! Current platform is " + platforms);
}
