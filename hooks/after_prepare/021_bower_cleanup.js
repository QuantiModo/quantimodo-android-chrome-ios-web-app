#!/usr/bin/env node

/**
 * After prepare, files are copied to the platforms/ios and platforms/android folders.
 * Lets clean up some of bower files that arent needed with this hook.
 */
var fs = require('fs');
var path = require('path');


var rootdir = path.resolve(__dirname, '../../');

var platformsDirectories = [
    'ios/www/lib/',
    'android/assets/www/lib/'
];

var deleteFolderRecursive = function(removePath) {
    if( fs.existsSync(removePath) ) {
        fs.readdirSync(removePath).forEach(function(file,index){
            var curPath = path.join(removePath, file);
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(removePath);
    }
};

var unusedFiles = [
    'angular-material/angular-material.js',
    'momentjs/min/tests.js',
    'moment/min/tests.js',
    'angular/angular.js',
    'Ionicons/cheatsheet.html',
    'ionic/js/ionic.bundle.js',
    'highstock-release/highstock.src.js',
    'angular-material/angular-material.css',
    'highcharts/highcharts.src.js',
    'angular-material/layouts/angular-material.layout-attributes.css',
    'angular-material/modules/layouts/angular-material.layouts.css',
    'public.built/ionic/Modo/www/lib/angular-material/modules/closure/core/core.css',
    'public.built/ionic/Modo/www/lib/angular-material/modules/js/core/core.css',
    'public.built/ionic/Modo/www/lib/angular-material/layouts/angular-material.layouts.css',
    'public.built/ionic/Modo/www/lib/ionic/js/ionic.js',
    'public.built/ionic/Modo/www/lib/ionic/js/ionic-angular.js',
    'public.built/ionic/Modo/www/lib/d3/d3.js',
    'public.built/ionic/Modo/www/lib/angular-material/CHANGELOG.md'
];

for (var i in platformsDirectories) {
    for (var j in unusedFiles) {
        var pathToDelete = path.join(rootdir, platformsDirectories[i] + unusedFiles[j]);
        console.log('Deleting unused file ' + pathToDelete );
        deleteFolderRecursive(pathToDelete);
    }
}