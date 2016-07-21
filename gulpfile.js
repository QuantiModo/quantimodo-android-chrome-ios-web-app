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
var plist = require('plist');
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;


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

gulp.task('generateXmlConfig', ['getAppName'], function(){

	var deferred = q.defer();

	gulp.src('./apps/' + LOWERCASE_APP_NAME  +'/config.xml')
	.pipe(rename('config.xml'))
	.pipe(gulp.dest('./'));

	gulp.src('./www/js/apps.js')
	.pipe(change(function(content){
		deferred.resolve();
		return content.replace(/defaultApp\s?:\s?("|')\w+("|'),/g, 'defaultApp : "' + LOWERCASE_APP_NAME + '",');
	}))
	.pipe(gulp.dest('./www/js/'));

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

gulp.task('generatePrivateConfigFromEnvsForHeroku', function(){

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

	var environmentalVariables = process.env;

	// Only run when on heroku
	if(typeof environmentalVariables['BUILDPACK_URL'] === "undefined" ){
		console.log("BUILDPACK_URL is undefined.  Heroku Not Detected.  Kashif, what is this check for?");
		deferred.reject();
	}

	// Can't do this because it overwrites decrypted config on Travis
	// if(typeof environmentalVariables['APPS'] === "undefined" || environmentalVariables['APPS'].trim() === '') {
	// 	if (environmentalVariables['LOWERCASE_APP_NAME']) {
	// 		console.log('No APPS env found.  Using LOWERCASE_APP_NAME ' + environmentalVariables['LOWERCASE_APP_NAME'].toUpperCase());
	// 		environmentalVariables['APPS'] = environmentalVariables['LOWERCASE_APP_NAME'].toUpperCase();
	// 	}
	// }

	if(typeof environmentalVariables['APPS'] === "undefined" || environmentalVariables['APPS'].trim() === ''){
		console.error('No APPS env found!');
		deferred.reject();
	} else {
		var upperCaseAppNames = environmentalVariables['APPS'].split(',');

		upperCaseAppNames.forEach(function(upperCaseAppName){
			upperCaseAppName = upperCaseAppName.trim();
			var configkeys = {
				client_ids : {},
				client_secrets : {},
				redirect_uris : {},
				api_urls : {}
			};
			if(typeof environmentalVariables[upperCaseAppName+'_WEB_CLIENT_ID'] !== "undefined"){
				configkeys.client_ids.Web = environmentalVariables[upperCaseAppName+'_WEB_CLIENT_ID'];
				console.log(upperCaseAppName+'_WEB_CLIENT_ID'+' Detected');
			} else {
				console.log(upperCaseAppName+'_WEB_CLIENT_ID'+' NOT DETECTED');
			}

			if(typeof environmentalVariables[upperCaseAppName+'_WEB_CLIENT_SECRET'] !== "undefined"){
				configkeys.client_secrets.Web = environmentalVariables[upperCaseAppName+'_WEB_CLIENT_SECRET'];
				console.log(upperCaseAppName+'_WEB_CLIENT_SECRET'+' Detected');
			} else {
				console.log(upperCaseAppName+'_WEB_CLIENT_SECRET'+' NOT DETECTED');
			}

			if(typeof environmentalVariables[upperCaseAppName+'_WEB_API_URL'] !== "undefined"){
				configkeys.api_urls.Web = environmentalVariables[upperCaseAppName+'_WEB_API_URL'];
				console.log(upperCaseAppName+'_WEB_API_URL'+' Detected');
			} else {
				console.log(upperCaseAppName+'_WEB_API_URL'+' NOT DETECTED. Using https://app.quantimo.do');
				configkeys.api_urls.Web = 'https://app.quantimo.do';
			}

			if(typeof environmentalVariables[upperCaseAppName+'_WEB_REDIRECT_URI'] !== "undefined"){
				configkeys.redirect_uris.Web = environmentalVariables[upperCaseAppName+'_WEB_REDIRECT_URI'];
				console.log(upperCaseAppName+'_WEB_REDIRECT_URI'+' Detected');
			} else {
				console.log(upperCaseAppName+'_WEB_REDIRECT_URI'+' NOT DETECTED. Using https://app.quantimo.do/ionic/Modo/www/callback/');
				configkeys.redirect_uris.Web = 'https://app.quantimo.do/ionic/Modo/www/callback/';
			}

            if(typeof environmentalVariables['IONIC_BUGSNAG_KEY'] !== "undefined"){
                configkeys.bugsnag_key = environmentalVariables['IONIC_BUGSNAG_KEY'];
                console.log('IONIC_BUGSNAG_KEY' +' Detected');
            } else {
                console.log('IONIC_BUGSNAG_KEY'+' NOT DETECTED');
            }

			var content = 'window.private_keys = '+JSON.stringify(configkeys, 0, 2);

			var lowerCaseAppName = upperCaseAppName.toLowerCase();

			fs.writeFileSync("./www/private_configs/" + lowerCaseAppName + ".config.js", content);

			console.log('Created '+ './www/private_configs/' + lowerCaseAppName + '.config.js');

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
			console.log('Failed to generate the access code', error);
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


gulp.task('prepareApp', function(){
	var deferred = q.defer();



	return deferred.promise;
});

gulp.task('uploadToAppServer', ['getAccessTokenFromGoogle'], function(){
	var deferred = q.defer();
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
			console.log("error in publishing to trusted Users", error);
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


// making ios build

var exec = require('child_process').exec;
function execute(command, callback){
    var my_child_process = exec(command, function(error, stdout, stderr){
    	if (error !== null) {
	      console.log('exec ERROR: ' + error);
	    }
    	callback(error, stdout);
    });

    my_child_process.stdout.pipe(process.stdout);
    my_child_process.stderr.pipe(process.stderr);
}
gulp.task('deleteIOSApp', function () {
	var deferred = q.defer();

	execute("ionic platform rm ios", function(error){
		if(error !== null){
			console.log("ERROR REMOVING IOS APP: " + error);
			deferred.reject();
		} else {
			console.log("\n***PLATFORM REMOVED****");
			deferred.resolve();
		}
	});

	return deferred.promise;
});

gulp.task('deleteFacebookPlugin', function(){
	var deferred = q.defer();

	execute("cordova plugin rm phonegap-facebook-plugin", function(error){
		if(error !== null){
			console.log("ERROR REMOVING FACEBOOK PLUGIN: " + error);
			deferred.reject();
		} else {
			console.log("\n****FACEBOOK PLUGIN REMOVED***");
			deferred.resolve();
		}
	});

	return deferred.promise;
});

gulp.task('deleteGooglePlusPlugin', function(){
	var deferred = q.defer();

	execute("cordova plugin rm cordova-plugin-googleplus", function(error){
		if(error !== null){
			console.log("ERROR REMOVING GOOGLE PLUS PLUGIN: " + error);
			deferred.reject();
		} else {
			console.log("\n****GOOGLE PLUS PLUGIN REMOVED***");
			deferred.resolve();
		}
	});

	return deferred.promise;
});

gulp.task('addIOSApp', function(){
	var deferred = q.defer();

	execute("ionic platform add ios", function(error){
		if(error !== null){
			console.log("ERROR ADDING IOS: " + error);
			deferred.reject();
		} else {
			console.log("\n***PLATFORM ADDED****");
			deferred.resolve();
		}
	});

	return deferred.promise;
});

gulp.task('ionicResources', function(){
	var deferred = q.defer();

	execute("ionic resources", function(error){
		if(error !== null){
			console.log("ERROR GENERATING RESOURCES " + error);
			deferred.reject();
		} else {
			console.log("\n***RESOURCES GENERATED****");
			deferred.resolve();
		}
	});

	return deferred.promise;
});

var LOWERCASE_APP_NAME = false;

gulp.task('getAppName', function(){
	var deferred = q.defer();
  gutil.log('process.env.LOWERCASE_APP_NAME is ' + process.env.LOWERCASE_APP_NAME);
  LOWERCASE_APP_NAME = process.env.LOWERCASE_APP_NAME;
  if(LOWERCASE_APP_NAME) deferred.resolve();
  if(!LOWERCASE_APP_NAME){
    throw new Error('Please set LOWERCASE_APP_NAME env!');
  }
	return deferred.promise;
});

gulp.task('getAppNameFromUserInput', function(){
  var inquireAboutAppName = function(){
    inquirer.prompt([{
      type: 'input',
      name: 'app',
      message: 'Please enter the app name (moodimodo/energymodo/etc..)'
    }], function( answers ) {
      LOWERCASE_APP_NAME = answers.app;
      deferred.resolve();
    });
  };
});

gulp.task('getAppNameFromGitBranchName', function(){
  var commandForGit = 'git rev-parse --abbrev-ref HEAD';
  execute(commandForGit, function(error, output){
    output = output.trim();
    if(error || output.indexOf('app/') < 0 || !output.split("/")[1] || output.split("/")[1].length === 0){
      console.log("Failed to get App name automatically.", error);
      inquireAboutAppName();
    } else {
      LOWERCASE_APP_NAME = output.split("/")[1];
      console.log("the app name from git branch is", JSON.stringify(LOWERCASE_APP_NAME));
      deferred.resolve();
    }
  });
});

var FACEBOOK_APP_ID = false;
var FACEBOOK_APP_NAME = false;
var REVERSED_CLIENT_ID = false;

gulp.task('readKeysForCurrentApp', ['getAppName'] ,function(){
	var deferred = q.defer();

	fs.stat('./www/private_configs/' + LOWERCASE_APP_NAME + '.config.js', function(err, stat) {
		if(err == null) {
			console.log('./www/private_configs/' + LOWERCASE_APP_NAME + '.config.js exists');
		} else {
			console.log(err.code);
		}
	});

	fs.readFile('./www/private_configs/' + LOWERCASE_APP_NAME + '.config.js', function (err, data) {
		if (err) {
			throw err;
		}

		var exr = false;

		if(data.indexOf('FACEBOOK_APP_ID') < 0){
			exr = true;
			console.log("ERROR: NO FACEBOOK_APP_ID found in ./www/private_configs/" + LOWERCASE_APP_NAME + '.config.js');
			deferred.reject();
		}

		if(data.indexOf('FACEBOOK_APP_NAME') < 0){
			exr = true;
			console.log("ERROR: NO FACEBOOK_APP_NAME found in ./www/private_configs/" + LOWERCASE_APP_NAME + '.config.js');
			deferred.reject();
		}

		if(data.indexOf('REVERSED_CLIENT_ID') < 0){
			exr = true;
			console.log("ERROR: NO REVERSED_CLIENT_ID found in ./www/private_configs/" + LOWERCASE_APP_NAME + '.config.js');
			deferred.reject();
		}

		if(!exr){
			var rx =  /("|')FACEBOOK_APP_ID("|')(\s)?:(\s)?("|')(\w*|\.*|\-*)*("|')/g;
			var arr = rx.exec(data);
			FACEBOOK_APP_ID = JSON.parse("{"+arr[0]+"}").FACEBOOK_APP_ID;

			var rx =  /("|')FACEBOOK_APP_NAME("|')(\s)?:(\s)?("|')(\w*|\.*|\-*)*("|')/g;
			var arr = rx.exec(data);
			FACEBOOK_APP_NAME = JSON.parse("{"+arr[0]+"}").FACEBOOK_APP_NAME;

			var rx =  /("|')REVERSED_CLIENT_ID("|')(\s)?:(\s)?("|')(\w*|\.*|\-*)*("|')/g;
			var arr = rx.exec(data);
			REVERSED_CLIENT_ID = JSON.parse("{"+arr[0]+"}").REVERSED_CLIENT_ID;

			console.log(FACEBOOK_APP_ID, FACEBOOK_APP_NAME, REVERSED_CLIENT_ID);
			deferred.resolve();
		} else deferred.reject();
	});

	return deferred.promise;
});

gulp.task('addFacebookPlugin', ['readKeysForCurrentApp'] , function(){
	var deferred = q.defer();

	var addFacebookPlugin = function(){
		var commands = [
			'cordova -d plugin add ../fbplugin/phonegap-facebook-plugin',
			'APP_ID="'+ FACEBOOK_APP_ID +'"',
			'APP_NAME="'+ FACEBOOK_APP_NAME +'"'
		].join(' --variable ');

		execute(commands, function(error){
			if(error !== null){
				console.log("***THERE WAS AN ERROR ADDING THE FACEBOOK PLUGIN***", error);
				deferred.reject();
			} else {
				console.log("\n***FACEBOOK PLUGIN SUCCESSFULLY ADDED***");
				deferred.resolve();
			}
		});
	};

	fs.exists('../fbplugin', function(exists) {
	    if (exists) {
	    	console.log("FACEBOOK REPO ALREADY CLONED");
	        addFacebookPlugin();
	    } else {
			console.log("FACEBOOK REPO NOT FOUND, CLONING https://github.com/Wizcorp/phonegap-facebook-plugin.git NOW");
	    	var commands = [
	    		"cd ../",
	    		"mkdir fbplugin",
	    		"cd fbplugin",
	    		"GIT_CURL_VERBOSE=1 GIT_TRACE=1 git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git"
	    	].join(' && ');


/*			//Try this if you get the muliple dex file error still
      console.log("FACEBOOK REPO NOT FOUND, CLONING https://github.com/Telerik-Verified-Plugins/Facebook.git NOW");
			var commands = [
				"cd ../",
				"mkdir fbplugin",
				"cd fbplugin",
				"GIT_CURL_VERBOSE=1 GIT_TRACE=1 git clone https://github.com/Telerik-Verified-Plugins/Facebook.git"
        ].join(' && ');
*/
	    	execute(commands, function(error){
	    		if(error !== null){
	    			console.log("***THERE WAS AN ERROR DOWNLOADING THE FACEBOOK PLUGIN***", error);
	    			deferred.reject();
	    		} else {
	    			console.log("\n***FACEBOOK PLUGIN DOWNLOADED, NOW ADDING IT TO IONIC PROJECT***");
	    			addFacebookPlugin();
	    		}
	    	});
	    }
	});

	return deferred.promise;
});

gulp.task('addGooglePlusPlugin', ['readKeysForCurrentApp'] , function(){
	var deferred = q.defer();

	var commands = [
		'cordova -d plugin add cordova-plugin-googleplus@4.0.8',
		'REVERSED_CLIENT_ID="'+ REVERSED_CLIENT_ID +'"'
	].join(' --variable ');

	execute(commands, function(error){
		if(error !== null){
			console.log("***ERROR ADDING THE GOOGLE PLUS PLUGIN***", error);
			deferred.reject();
		} else {
			console.log("\n***GOOGLE PLUS PLUGIN ADDED****");
			deferred.resolve();
		}
	});

	return deferred.promise;
});

var IOS_FOLDER_NAME = false;

gulp.task('getIOSAppFolderName', ['getAppName'] , function(){
	var deferred = q.defer();

	if(IOS_FOLDER_NAME) deferred.resolve();
	else {
		var xml = fs.readFileSync('./apps/' + LOWERCASE_APP_NAME + '/config.xml', 'utf8');
		parseString(xml, function (err, result) {
		    if(err){
		    	console.log("failed to read xml file", err);
		    	deferred.reject();
		    } else {
		    	if(result && result.widget && result.widget.name && result.widget.name.length > 0){
					IOS_FOLDER_NAME = result.widget.name[0];
					console.log("IOS_FOLDER_NAME : ", IOS_FOLDER_NAME);
		    		deferred.resolve();
		    	}
		    }
		});
	}

	return deferred.promise;
});

gulp.task('fixResourcesPlist', ['getIOSAppFolderName'] , function(){
	var deferred = q.defer();

	var myPlist = plist.parse(fs.readFileSync('platforms/ios/'+IOS_FOLDER_NAME+'/'+IOS_FOLDER_NAME+'-Info.plist', 'utf8'));

	var LSApplicationQueriesSchemes = [
		"fbapi",
		"fbapi20130214",
		"fbapi20130410",
		"fbapi20130702",
		"fbapi20131010",
		"fbapi20131219",
		"fbapi20140410",
		"fbapi20140116",
		"fbapi20150313",
		"fbapi20150629",
		"fbauth",
		"fbauth2",
		"fb-messenger-api20140430"
	];

	myPlist.LSApplicationQueriesSchemes = LSApplicationQueriesSchemes.concat(myPlist.LSApplicationQueriesSchemes);

	if(myPlist.NSAppTransportSecurity && myPlist.NSAppTransportSecurity.NSExceptionDomains){

		// facebook.com
		var facebookDotCom = {};

		if(myPlist.NSAppTransportSecurity.NSExceptionDomains["facebook.com"]){
			facebookDotCom = myPlist.NSAppTransportSecurity.NSExceptionDomains["facebook.com"];
		}

		if(!facebookDotCom["NSIncludesSubdomains"]){
			facebookDotCom["NSIncludesSubdomains"] = true;
		}

		if(!facebookDotCom["NSThirdPartyExceptionRequiresForwardSecrecy"]){
			facebookDotCom["NSThirdPartyExceptionRequiresForwardSecrecy"] = false;
		}

		myPlist.NSAppTransportSecurity.NSExceptionDomains["facebook.com"] = facebookDotCom;

		console.log("Updated facebook.com");

		// fbcdn.net
		var fbcdnDotNet = {};

		if(myPlist.NSAppTransportSecurity.NSExceptionDomains["fbcdn.net"]){
			fbcdnDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains["fbcdn.net"];
		}

		if(!fbcdnDotNet["NSIncludesSubdomains"]){
			fbcdnDotNet["NSIncludesSubdomains"] = true;
		}

		if(!fbcdnDotNet["NSThirdPartyExceptionRequiresForwardSecrecy"]){
			fbcdnDotNet["NSThirdPartyExceptionRequiresForwardSecrecy"] = false;
		}

		myPlist.NSAppTransportSecurity.NSExceptionDomains["fbcdn.net"] = fbcdnDotNet;

		console.log("Updated fbcdn.net");

		// akamaihd.net
		var akamaihdDotNet = {};

		if(myPlist.NSAppTransportSecurity.NSExceptionDomains["akamaihd.net"]){
			akamaihdDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains["akamaihd.net"];
		}

		if(!akamaihdDotNet["NSIncludesSubdomains"]){
			akamaihdDotNet["NSIncludesSubdomains"] = true;
		}

		if(!akamaihdDotNet["NSThirdPartyExceptionRequiresForwardSecrecy"]){
			akamaihdDotNet["NSThirdPartyExceptionRequiresForwardSecrecy"] = false;
		}

		myPlist.NSAppTransportSecurity.NSExceptionDomains["akamaihd.net"] = akamaihdDotNet;

		console.log("Updated akamaihd.net");
	}

	fs.writeFile('platforms/ios/'+IOS_FOLDER_NAME+'/'+IOS_FOLDER_NAME+'-Info.plist', plist.build(myPlist), 'utf8', function (err) {
		if (err) {
			console.log("error writing to plist", err);
			deferred.reject();
		} else {
			console.log("successfully updated plist");
			deferred.resolve();
		}
	});

	return deferred.promise;
});

gulp.task('addPodfile', [ 'getIOSAppFolderName' ], function(){
	var deferred = q.defer();

	var addBugsnagToPodfile = function(){
		fs.readFile('./platforms/ios/Podfile', function (err, data) {
			if (err) {
				throw err;
			}

			//if(data.indexOf('pod \'Bugsnag\', :git => "https://github.com/bugsnag/bugsnag-cocoa.git"') < 0){

			if(data.indexOf('Bugsnag') < 0){
				console.log("no Bugsnag detected");

				gulp.src('./platforms/ios/Podfile')
				.pipe(change(function(content){
					var bugsnag_str = 'target \''+IOS_FOLDER_NAME+'\' do \npod \'Bugsnag\', :git => "https://github.com/bugsnag/bugsnag-cocoa.git"';
					console.log("Bugsnag Added to Podfile");
					deferred.resolve();
					return content.replace(/target.*/g, bugsnag_str);
				}))
				.pipe(gulp.dest('./platforms/ios/'));

			} else {
				console.log("Bugsnag already present in Podfile");
				deferred.resolve();
			}
		});
	};

	fs.exists('./platforms/ios/Podfile', function(exists) {
	    if (exists) {
	    	console.log("Podfile");
	        addBugsnagToPodfile();
	    } else {
	    	console.log("PODFILE REPO NOT FOUND, Installing it First");

	    	var commands = [
	    		'cd ./platforms/ios',
	    		'pod init'
	    	].join(' && ');

	    	execute(commands, function(error){
	    		if(error !== null){
	    			console.log("There was an error detected", error);
	    			deferred.reject();
	    		} else {
	    			console.log("\n***Podfile Added****");
	    			addBugsnagToPodfile();
	    		}
	    	});
	    }
	});

	return deferred.promise;
});

gulp.task('addInheritedToOtherLinkerFlags', [ 'getIOSAppFolderName' ], function(){
	return gulp.src('./platforms/ios/'+IOS_FOLDER_NAME+'.xcodeproj/project.pbxproj')
	.pipe(change(function(content){
		return content.replace(/OTHER_LDFLAGS(\s+)?=(\s+)?(\s+)\(/g, "OTHER_LDFLAGS = (\n\t\t\t\t\t\"$(inherited)\",");
	}))
	.pipe(gulp.dest('./platforms/ios/'+IOS_FOLDER_NAME+'.xcodeproj/'));
});

gulp.task('addDeploymentTarget', ['getIOSAppFolderName'], function(){
	return gulp.src('./platforms/ios/'+IOS_FOLDER_NAME+'.xcodeproj/project.pbxproj')
		.pipe(change(function(content){
			if(content.indexOf('IPHONEOS_DEPLOYMENT_TARGET') === -1)
				return content.replace(/ENABLE_BITCODE(\s+)?=(\s+)?(\s+)NO\;/g, "IPHONEOS_DEPLOYMENT_TARGET = 6.0;\ENABLE_BITCODE = NO;");
			return content;
		}))
		.pipe(change(function(content){
			console.log("*****************\n\n\n",content,"\n\n\n*****************");
		}))
		.pipe(gulp.dest('./platforms/ios/'+IOS_FOLDER_NAME+'.xcodeproj/'));
});

gulp.task('installPods', [ 'addPodfile' ] , function(){
	var deferred = q.defer();

	var commands = [
		'cd platforms/ios',
		'pod install'
	].join(' && ');

	execute(commands, function(error){
		if(error !== null){
			console.log("There was an error detected", error);
			deferred.reject();
		} else {
			console.log("\n***Pods Installed****");
			deferred.resolve();
		}
	});

	return deferred.promise;
});

gulp.task('addBugsnagInObjC', [ 'getIOSAppFolderName' ] , function(){

	return gulp.src('./platforms/ios/'+IOS_FOLDER_NAME+'/Classes/AppDelegate.m')
	.pipe(change(function(content){
		if(content.indexOf('Bugsnag') !== -1){
			console.log("Bugsnag Already Present");
			return content;
		} else {
			content = content.replace(/#import "MainViewController.h"/g, "#import \"MainViewController.h\"\n#import \"Bugsnag.h\"");
			content = content.replace(/self\.window\.rootViewController(\s)?=(\s)?self\.viewController\;/g, "[Bugsnag startBugsnagWithApiKey:@\"ae7bc49d1285848342342bb5c321a2cf\"];\n\tself.window.rootViewController = self.viewController;");
			console.log("Bugsnag Added");
		}
		return content;
	}))
	.pipe(gulp.dest('./platforms/ios/'+IOS_FOLDER_NAME+'/Classes/'));

});

gulp.task('enableBitCode', [ 'getIOSAppFolderName' ] ,function(){
	return gulp.src('./platforms/ios/'+IOS_FOLDER_NAME+'.xcodeproj/project.pbxproj')
	.pipe(change(function(content){
		return content.replace(/FRAMEWORK_SEARCH_PATHS(\s*)?=(\s*)?\(/g, "ENABLE_BITCODE = NO;\n\t\t\t\tFRAMEWORK_SEARCH_PATHS = (");
	}))
	.pipe(gulp.dest('./platforms/ios/'+IOS_FOLDER_NAME+'.xcodeproj/'));
});

gulp.task('makeIosApp', function(callback){
	runSequence('deleteIOSApp',
	'deleteFacebookPlugin',
	'deleteGooglePlusPlugin',
	'addIOSApp',
    'ionicResources',
	'readKeysForCurrentApp',
	'addFacebookPlugin',
	'addGooglePlusPlugin',
	'fixResourcesPlist',
	'addBugsnagInObjC',
	'enableBitCode',
	'addInheritedToOtherLinkerFlags',
	'addDeploymentTarget',
	'addPodfile',
	'installPods',
	callback);
});

gulp.task('bumpVersion', function(){
	var deferred = q.defer();

	var xml = fs.readFileSync('./apps/' + LOWERCASE_APP_NAME + '/config.xml', 'utf8');

	parseString(xml, function (err, result) {
		if(err){
			console.log("failed to read xml file", err);
			deferred.reject();
		} else {
			var version = "1.0.0";

			if(result && result.widget && result.widget.$ ){
				if(result.widget.$['version']) version = result.widget.$['version'];
				if(result.widget.$["ios-CFBundleVersion"]) version = result.widget.$["ios-CFBundleVersion"];
			}

	    	// bump version number
	    	var numberToBumpArr = version.split('.');
	    	var numberToBump = numberToBumpArr[numberToBumpArr.length-1];
	    	numberToBumpArr[numberToBumpArr.length-1] = (parseInt(numberToBump)+1).toString();
	    	version = numberToBumpArr.join('.');

	    	if(!result) result = {};
	    	if(!result.widget) result['widget'] = {};
	    	if(!result.widget.$) result.widget['$'] = {};

	    	result.widget.$["version"] = version;
	    	result.widget.$["ios-CFBundleVersion"] = version;

	    	var builder = new xml2js.Builder();
	    	var updatedXml = builder.buildObject(result);

	    	fs.writeFile('./apps/' + LOWERCASE_APP_NAME + '/config.xml', updatedXml, 'utf8', function (err) {
	    		if (err) {
	    			console.log("error writing to xml file", err);
	    			deferred.reject();
	    		} else {
	    			console.log("successfully updated the version number xml file");
	    			deferred.resolve();
	    		}
	    	});
	    }
	});

	return deferred.promise;
});

gulp.task('setVersionNumbersWithEnvs', function(){

	var deferred = q.defer();
	var environmentalVariables = process.env;
	if(!environmentalVariables['IONIC_APP_VERSION_NUMBER']){
		//throw new Error('Please set IONIC_APP_VERSION_NUMBER env!');
		environmentalVariables['IONIC_APP_VERSION_NUMBER'] = '1.7.2';
		console.warn('No IONIC_APP_VERSION_NUMBER env!  Using hardcoded gulp version ' +
			environmentalVariables['IONIC_APP_VERSION_NUMBER'])
	}

	if(!environmentalVariables['IONIC_IOS_APP_VERSION_NUMBER']){
		//throw new Error('Please set IONIC_IOS_APP_VERSION_NUMBER env!');
		environmentalVariables['IONIC_IOS_APP_VERSION_NUMBER'] = '1.7.2.0';
		console.warn('No IONIC_IOS_APP_VERSION_NUMBER env!  Using hardcoded gulp version ' +
			environmentalVariables['IONIC_IOS_APP_VERSION_NUMBER'])
	}

	var xml = fs.readFileSync('./config.xml', 'utf8');

	parseString(xml, function (err, parsedXmlFile) {
		if(err){
			throw new Error("failed to read xml file", err);
		} else {

			if(parsedXmlFile && parsedXmlFile.widget && parsedXmlFile.widget.$ ){
				if(parsedXmlFile.widget.$['version']) {
					var currentVersionNumber = parsedXmlFile.widget.$['version'];
				}
				if(parsedXmlFile.widget.$["ios-CFBundleVersion"]) {
					var currentIosVersionNumber = parsedXmlFile.widget.$["ios-CFBundleVersion"];
				}
			}

			if(!parsedXmlFile) parsedXmlFile = {};
			if(!parsedXmlFile.widget) parsedXmlFile['widget'] = {};
			if(!parsedXmlFile.widget.$) parsedXmlFile.widget['$'] = {};

			parsedXmlFile.widget.$["version"] = environmentalVariables['IONIC_APP_VERSION_NUMBER'];
			parsedXmlFile.widget.$["ios-CFBundleVersion"] = environmentalVariables['IONIC_IOS_APP_VERSION_NUMBER'];

			var builder = new xml2js.Builder();
			var updatedXmlFile = builder.buildObject(parsedXmlFile);

			fs.writeFile('./config.xml', updatedXmlFile, 'utf8', function (err) {
				if (err) {
					console.log("Error updating version in config.xml", err);
					deferred.reject();
				} else {
					console.log("Successfully updated the version number to " +
						environmentalVariables['IONIC_APP_VERSION_NUMBER'] + " in config.xml file");
					deferred.resolve();
				}
			});
		}
	});

	return deferred.promise;
});
