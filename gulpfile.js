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
var glob = require('glob');

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

gulp.task('private', function(){

	var deferred = q.defer();

	// keys to set in heroku
	// var env_keys = {
	// 	"APPS": 'MOODIMODO,MINDFIRST,ENERGYMODO',
		
	// 	"MOODIMODO_WEB_CLIENT_ID" : 'zyx',
	// 	"MOODIMODO_WEB_CLIENT_SECRET" : 'das',
	// 	"MOODIMODO_WEB_MASHAPE_KEY_TESTING" : 'asdas',
	// 	"MOODIMODO_WEB_MASHAPE_KEY_PRODUCTION" : 'asdas',
		
	// 	"MINDFIRST_WEB_CLIENT_ID" : 'asd',
	// 	"MINDFIRST_WEB_CLIENT_SECRET" : 'das',
	// 	"MINDFIRST_WEB_MASHAPE_KEY_TESTING" : 'ads',
	// 	"MINDFIRST_WEB_MASHAPE_KEY_PRODUCTION" : 'asd',

	// 	"ENERGYMODO_WEB_CLIENT_ID" : 'asd',
	// 	"ENERGYMODO_WEB_CLIENT_SECRET" : 'asd',
	// 	"ENERGYMODO_WEB_MASHAPE_KEY_TESTING" : 'sdfdsf',
	// 	"ENERGYMODO_WEB_MASHAPE_KEY_PRODUCTION" : 'asda'

	// };

	var env_keys = process.env;

	// Only run when on heroku
	if(typeof env_keys['BUILDPACK_URL'] === "undefined" ){
		console.log("Heroku Not Detected");
		deferred.reject();
	}

	if(typeof env_keys['APPS'] === "undefined" || env_keys['APPS'].trim() === ''){
		console.error('No Apps Found')
		deferred.reject();
	} else {
		var apps = env_keys['APPS'].split(',')

		apps.forEach(function(appName){
			appName = appName.trim();
			var configkeys = {
				client_ids : {},
				client_secrets : {},
				mashape_keys : {
					Web : {}
				}
			};
			if(typeof env_keys[appName+'_WEB_CLIENT_ID'] !== "undefined"){
				configkeys.client_ids.Web = env_keys[appName+'_WEB_CLIENT_ID'];
				console.log(appName+'_WEB_CLIENT_ID'+' Detected');
			} else {
				console.log(appName+'_WEB_CLIENT_ID'+' NOT DETECTED');
			}
			if(typeof env_keys[appName+'_WEB_CLIENT_SECRET'] !== "undefined"){
				configkeys.client_secrets.Web = env_keys[appName+'_WEB_CLIENT_SECRET'];
				console.log(appName+'_WEB_CLIENT_SECRET'+' Detected');
			} else {
				console.log(appName+'_WEB_CLIENT_SECRET'+' NOT DETECTED');
			}
			if(typeof env_keys[appName+'_WEB_MASHAPE_KEY_TESTING'] !== "undefined"){
				configkeys.mashape_keys.Web.Testing = env_keys[appName+'_WEB_MASHAPE_KEY_TESTING'];
				console.log(appName+'_WEB_MASHAPE_KEY_TESTING'+' Detected');
			} else {
				console.log(appName+'_WEB_MASHAPE_KEY_TESTING'+' NOT DETECTED');
			}
			if(typeof env_keys[appName+'_WEB_MASHAPE_KEY_PRODUCTION'] !== "undefined"){
				configkeys.mashape_keys.Web.Production = env_keys[appName+'_WEB_MASHAPE_KEY_PRODUCTION'];
				console.log(appName+'_WEB_MASHAPE_KEY_PRODUCTION'+' Detected');
			} else {
				console.log(appName+'_WEB_MASHAPE_KEY_PRODUCTION'+' NOT DETECTED');
			}		

			var content = 'window.private_keys = '+JSON.stringify(configkeys, 0, 2);

			fs.writeFileSync("./private_configs/"+appName.toLowerCase()+".config.js", content);

			console.log('Created '+ './private_configs/'+appName.toLowerCase()+'.config.js');

		});
	}

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
