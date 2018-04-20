#!/usr/bin/env node
var fs = require('fs');
function replace_string_in_file(filename, to_replace, replace_with) {
    var data = fs.readFileSync(filename, 'utf8');
    if(!data){
        console.log("No data to replace from " + filename);
        return;
    }
    console.log('hooks/uncomment_cordova_js.js replace_string_in ' + filename);
    var result = data.replace(new RegExp(to_replace, "g"), replace_with);
    fs.writeFileSync(filename, result, 'utf8');
}
var filesToReplace = [
    "platforms/android/assets/www/index.html",
    "platforms/ios/www/index.html",
    "www/index.html"
];
filesToReplace.forEach(function(fullFilename, index, array) {
    if (fs.existsSync(fullFilename)) {
        console.log("Uncommenting cordova.js in  " + fullFilename);
        replace_string_in_file(fullFilename, "<!-- cordova.js placeholder -->", "<script src=\"cordova.js\"></script>");
    } else {
        console.log("missing: "+ fullFilename);
    }
});
