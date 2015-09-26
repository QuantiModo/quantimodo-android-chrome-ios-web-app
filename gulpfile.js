var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var inquirer = require("inquirer");
var change = require('gulp-change');
var q = require('q');
var fs = require('fs');
var CodeGen = require('swagger-js-codegen').CodeGen;

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('make', function(){
  
  var deferred = q.defer();
  var answer = '';
  inquirer.prompt([{
    type: 'input',
    name: 'app',
    message: 'Please enter the app name (moodimodo/energymodo/etc..)'
  }], function( answers ) {
        answer = answers.app;
        gulp.src('./xmlconfigs/'+answers.app+'.xml')
        .pipe(rename('config.xml'))
        .pipe(gulp.dest('./'));

        gulp.src('./www/js/apps.js')
        .pipe(change(function(content){
          return content.replace(/defaultApp\s?:\s?("|')\w+("|'),/g, 'defaultApp : "'+answer+'",');
        }))
        .pipe(gulp.dest('./www/js/'))
        deferred.resolve();
  });
  return deferred.promise;
});

gulp.task('swagger', function(){
  var deferred = q.defer();
  var file = '../../api/docs/swagger.json';
  var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));

  var angularjsSourceCode = CodeGen.getAngularCode({ className: 'Test', swagger: swagger });
  console.log(angularjsSourceCode);
  
  fs.writeFile('./www/js/services/swaggerjs.js', angularjsSourceCode , function (err) {
      if (err) 
          return console.log(err);
      console.log('Swagger code > /www/js/services/swaggerjs.js');
      deferred.resolve();
  });
  return deferred.promise;
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
