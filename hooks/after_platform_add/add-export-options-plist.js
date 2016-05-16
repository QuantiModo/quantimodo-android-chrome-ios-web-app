#!/usr/bin/env node

/**
 * Add exportOptionsPlist
 */
var path = require('path');
var fs = require('fs');
var TEAM_ID = process.env.TEAM_ID;
var platforms = process.env.CORDOVA_PLATFORMS;
var rootdir = process.argv[2];
console.log('hook: root directory is ' + rootdir);

if (platforms == "ios") {
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
		if (err) return console.log('No directory Found for cordova iOS! Skipping exportOptionsPlist creation. ',err);
		console.log('Cordova iOS exportOptionsPlist updated with profile and developer values.')
	});
} else if (platforms == "android") {
	console.log("add-export-options hook is for iOS only");
} else {
  console.log("dd-export-options hook is for iOS only");
}
