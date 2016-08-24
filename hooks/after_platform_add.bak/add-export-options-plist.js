#!/usr/bin/env node

/**
 * Add exportOptionsPlist
 */
var path = require('path');
var fs = require('fs');
var TEAM_ID = process.env.TEAM_ID;
var platforms = process.env.CORDOVA_PLATFORMS;
var rootdir = process.argv[2];

var FgRed = "\x1b[31m";
var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var Reset = "\x1b[0m";

console.log('hook: root directory is ' + rootdir);
console.log('MAKE SURE YOUR PRIVATE CONFIG FILE IS IN www/private_configs!');

if (platforms.indexOf("ios" > -1)){
	console.log(FgGreen, "Current platform is " + platforms, Reset);
	var plistFile = path.resolve(__dirname, '../../platforms/ios/exportOptions.plist');

	var result = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
		'<plist version="1.0">',
		'<dict>',
		'<key>method</key>',
		'<string>app-store</string>',
		'<key>teamID</key>',
		'<string>'+TEAM_ID+'</string>',
		'</dict>',
		'</plist>'
	].join('\n');

	fs.writeFile(plistFile, result, 'utf8', function (err) {
		if (err) {
		    return console.log(FgRed, 'No directory Found for cordova iOS! Skipping exportOptionsPlist creation. ', err, Reset);
        }
		console.log(FgGreen, 'Cordova iOS exportOptionsPlist updated with profile and developer values.', Reset);
	});
} else if (platforms.indexOf("android" > -1)){
	console.log(FgYellow, "add-export-options hook is for iOS only!  Current platform is " + platforms, Reset);
} else {
  console.log(FgYellow, "dd-export-options hook is for iOS only!  Current platform is " + platforms, Reset);
}
