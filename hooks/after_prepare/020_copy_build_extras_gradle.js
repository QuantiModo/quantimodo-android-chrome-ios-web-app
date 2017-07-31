#!/usr/bin/env node
'use strict';
var fs = require('fs');
var rootdir = process.argv[2];
if(fs.existsSync(rootdir + '/platforms/android')){
    console.log('Add build-extras.gradle');
    fs.createReadStream(rootdir + '/build-extras.gradle').pipe(fs.createWriteStream(rootdir + '/platforms/android/build-extras.gradle'));
}
