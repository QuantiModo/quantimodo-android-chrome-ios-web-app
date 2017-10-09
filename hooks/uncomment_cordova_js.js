#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var rootdir = process.argv[2];
function replace_string_in_file(filename, to_replace, replace_with) {
    var data = fs.readFileSync(filename, 'utf8');
    console.log('replace_string_in_file');
    var result = data.replace(new RegExp(to_replace, "g"), replace_with);
    fs.writeFileSync(filename, result, 'utf8');
}
var filestoreplace = [
    "platforms/android/assets/www/index.html",
    "platforms/ios/www/index.html",
    "www/index.html"
];
filestoreplace.forEach(function(val, index, array) {
    var fullfilename = path.join(rootdir, val);
    fullfilename = val;
    if (fs.existsSync(fullfilename)) {
        console.log("Uncommenting cordova.js in  " + fullfilename);
        replace_string_in_file(fullfilename, "<!-- cordova.js placeholder -->", "<script src=\"cordova.js\"></script>");
    } else {
        console.log("missing: "+ fullfilename);
    }
});