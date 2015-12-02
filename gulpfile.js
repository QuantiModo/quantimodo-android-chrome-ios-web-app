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
var zip = require('gulp-zip');
var request = require('request');
var open = require('gulp-open');
var gcallback = require('gulp-callback');
var runSequence = require('run-sequence');

var appIds = {
    'moodimodo': 'homaagppbekhjkalcndpojiagijaiefm',
    'mindfirst': 'jeadacoeabffebaeikfdpjgpjbjinobl',
    'energymodo': 'aibgaobhplpnjmcnnmdamabfjnbgflob'
};

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
	// 	"MINDFIRST_WEB_CLIENT_ID" : 'asd',
	// 	"MINDFIRST_WEB_CLIENT_SECRET" : 'das',
	// 	"ENERGYMODO_WEB_CLIENT_ID" : 'asd',
	// 	"ENERGYMODO_WEB_CLIENT_SECRET" : 'asd',
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
				client_secrets : {}
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
			
            if(typeof env_keys['IONIC_BUGSNAG_KEY'] !== "undefined"){
                configkeys.bugsnag_key = env_keys['IONIC_BUGSNAG_KEY'];
                console.log('IONIC_BUGSNAG_KEY' +' Detected');
            } else {
                console.log('IONIC_BUGSNAG_KEY'+' NOT DETECTED');
            }

			var content = 'window.private_keys = '+JSON.stringify(configkeys, 0, 2);

			fs.writeFileSync("./www/private_configs/"+appName.toLowerCase()+".config.js", content);

			console.log('Created '+ './www/private_configs/'+appName.toLowerCase()+'.config.js');

		});
	}

	return deferred.promise;
	
});

var answer = '';
gulp.task('getApp', function(){
	var deferred = q.defer();

	inquirer.prompt([{
		type: 'input',
		name: 'app',
		message: 'Please enter the app name (moodimodo/energymodo/etc..)'
	}], function( answers ) {
		answer = answers.app;
		answer = answer.trim();
		deferred.resolve();
	});

	return deferred.promise;
});

var updatedVersion = '';
gulp.task('getUpdatedVersion', ['getApp'], function(){
	var deferred = q.defer();
	inquirer.prompt([{
		type : 'confirm',
		name : 'updatedVersion',
		'default' : false,
		message : 'Have you updated the app\'s version number in chromeApps/'+answer+'/menifest.json ?'
	}], function(answers){
		if (answers.updatedVersion){
			updatedVersion = answers.updatedVersion;
			deferred.resolve();
		} else {
			console.log("PLEASE UPDATE IT BEFORE UPLOADING");
			deferred.reject();
		}
	});
	return deferred.promise;
});

gulp.task('copywww', ['getUpdatedVersion'], function(){
	return gulp.src(['www/**/*'])
	.pipe(gulp.dest('chromeApps/'+answer+'/www'));
});

gulp.task('makezip', ['copywww'], function(){
	return gulp.src(['chromeApps/'+answer+'/**/*'])
	.pipe(zip(answer+'.zip'))
	.pipe(gulp.dest('chromeApps/zips'));
});

gulp.task('openbrowser', ['makezip'], function(){
	 var deferred = q.defer();
	 
	 gulp.src(__filename)
	.pipe(open({uri: 'https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=1052648855194-h7mj5q7mmc31k0g3b9rj65ctk0uejo9p.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob'}));

	
	deferred.resolve();
	
});

var code = '';
gulp.task('getCode', ['openbrowser'], function(){
	var deferred = q.defer();
	setTimeout(function(){
		console.log("Starting getCode");
		inquirer.prompt([{
			type : 'input',
			name : 'code',
			message : 'Please Enter the Code Generated from the opened website'
		}], function(answers){
			code = answers.code;
			code = code.trim();
			console.log("code: ", code);
			deferred.resolve();
		});
	}, 2000);
	
	return deferred.promise;
});

var access_token = '';
gulp.task('getAccessTokenFromGoogle', ['getCode'], function(){
	var deferred = q.defer();

	var options = {
		method : "POST",
		url : "https://accounts.google.com/o/oauth2/token",
		form : {
			client_id : '1052648855194-h7mj5q7mmc31k0g3b9rj65ctk0uejo9p.apps.googleusercontent.com',
			client_secret : 'gXbySqbFgRcg_RM9bIiXUmIS',
			code : code,
			grant_type : 'authorization_code',
			redirect_uri : 'urn:ietf:wg:oauth:2.0:oob'
		}
	};

	request(options, function(error, message, response){
		if(error){
			console.log('Failed to generate the access code');
			defer.reject();
		} else {
			response = JSON.parse(response);	
			access_token = response.access_token;
			deferred.resolve();
		}
	});

	return deferred.promise;
});

var getAppIds = function(){
	return appIds;
};

gulp.task('uploadToAppServer', ['getAccessTokenFromGoogle'], function(){
	var deferred = q. defer();
	var appIds =getAppIds();

	var source = fs.createReadStream('./chromeApps/zips/'+answer+'.zip');

	// upload the package
	var options = {
		url : "https://www.googleapis.com/upload/chromewebstore/v1.1/items/"+appIds[answer],
		method : "PUT",
		headers : {
			'Authorization': 'Bearer '+ access_token,
			'x-goog-api-version' : '2'
		}
	};

	console.log('Gnerated URL for upload operation: ', options.url);
	console.log('The Access Token: Bearer '+access_token);
	console.log("UPLOADING. .. .. Please Wait! .. .");

	source.pipe(request(options, function(error, message, data){
		if(error){
			console.log("Error in Uploading Data", error);
			deferred.reject();
		} else {
			console.log('Upload Response Recieved');
			data = JSON.parse(data);
			
			if(data.uploadState === "SUCCESS"){
				console.log('Uploaded successfully!');
				deferred.resolve();
			} else {
				console.log('Failed to upload the zip file');
				console.log(JSON.stringify(data, 0 , 2));
				deferred.reject();
			}
		}
	}));

	return deferred.promise;
});

var shouldPublish = true;
gulp.task('shouldPublish', ['uploadToAppServer'], function(){
	var deferred = q.defer();
	inquirer.prompt([{
		type : 'confirm',
		name : 'shouldPublish',
		message : 'Should we publish this version?',
		default : true
	}], function(answers){

		if (answers.shouldPublish){
			shouldPublish = answers.shouldPublish;
			deferred.resolve();
		} else {
			console.log("Ended without publishing!");
			deferred.reject();
		}
	});
	return deferred.promise;
});

gulp.task('publishToGoogleAppStore', ['shouldPublish'],function(){
	var deferred = q.defer();
	var appIds =getAppIds();

	// upload the package
	var options = {
		url : "https://www.googleapis.com/chromewebstore/v1.1/items/"+appIds[answer]+'/publish?publishTarget=trustedTesters',
		method : "POST",
		headers : {
			'Authorization': 'Bearer '+ access_token,
			'x-goog-api-version' : '2',
			'publishTarget' : 'trustedTesters',
			'Content-Length': '0'
		}
	};

	request(options, function(error, message, publishResult){
		if(error) { 
			console.log("error in publishing to trusted Users");
			deferred.reject();
		} else {
			publishResult = JSON.parse(publishResult);
			if(publishResult.status.indexOf("OK")>-1){
				console.log("published successfully");
				deferred.resolve();
			} else {
				console.log('not published');
				console.log(publishResult);
				deferred.reject();
			}
		}
	});

	return deferred.promise;
});

gulp.task('chrome', ['publishToGoogleAppStore'], function () {
	console.log('Enjoy your day!');
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
