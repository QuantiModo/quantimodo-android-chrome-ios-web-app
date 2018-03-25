/* eslint-disable no-process-env */
var appHostName = (process.env.APP_HOST_NAME) ? process.env.APP_HOST_NAME : "https://app.quantimo.do";
var appSettings, privateConfig, devCredentials, versionNumbers;
var androidX86ReleaseName = 'android-x86-release';
var androidArm7DebugApkName = 'android-armv7-debug';
var androidX86DebugApkName = 'android-x86-debug';
var androidArm7ReleaseApkName = 'android-armv7-release';
var androidX86ReleaseApkName = 'android-x86-release';
/** @namespace process.env.DEBUG_BUILD */
/** @namespace process.env.BUILD_DEBUG */
var buildDebug = isTruthy(process.env.BUILD_DEBUG || process.env.DEBUG_BUILD);
/** @namespace process.env.DO_NOT_MINIFY */
var doNotMinify = isTruthy(process.env.DO_NOT_MINIFY);
var buildPath = 'build';
var circleCIPathToRepo = '~/quantimodo-android-chrome-ios-web-app';
var chromeExtensionBuildPath = buildPath + '/chrome_extension';
var platformCurrentlyBuildingFor;
var s3BaseUrl = 'https://quantimodo.s3.amazonaws.com/';
// Setup platforms to build that are supported on current hardware
// See https://taco.visualstudio.com/en-us/docs/tutorial-gulp-readme/
//var winPlatforms = ["android", "windows"], //Android is having problems so I'm only building windows for now
var winPlatforms = ['windows'],
    linuxPlatforms = ['android'],
    osxPlatforms = ['ios'],
    platformsToBuild = process.platform === 'darwin' ? osxPlatforms :
        (process.platform === 'linux' ? linuxPlatforms : winPlatforms),
    // Build config to use for build - Use Pascal case to match paths set by VS
    buildConfig = 'Release',
    // Arguments for build by platform. Warning: Omit the extra "--" when referencing platform
    // specific options (Ex:"-- --gradleArg" is "--gradleArg").
    buildArgs = {
        android: ['--' + buildConfig.toLocaleLowerCase(), '--device', '--gradleArg=--no-daemon'],
        ios: ['--' + buildConfig.toLocaleLowerCase(), '--device'],
        windows: ['--' + buildConfig.toLocaleLowerCase(), '--device']
    },
    // Paths used by build
    buildPaths = {
        tsconfig: 'scripts/tsconfig.json',
        ts: './scripts/**/*.ts',
        apk: ['./platforms/android/ant-build/*.apk',
            './platforms/android/bin/*.apk',
            './platforms/android/build/outputs/apk/*.apk'],
        binApk: './bin/Android/' + buildConfig,
        ipa: ['./platforms/ios/build/device/*.ipa',
            './platforms/ios/build/device/*.app.dSYM'],
        binIpa: './bin/iOS/' + buildConfig,
        appx: './platforms/windows/AppPackages/**/*',
        binAppx: './bin/Windows/' + buildConfig
    };
var appIds = {
    'moodimodo': 'homaagppbekhjkalcndpojiagijaiefm',
    'mindfirst': 'jeadacoeabffebaeikfdpjgpjbjinobl',
    'energymodo': 'aibgaobhplpnjmcnnmdamabfjnbgflob',
    'quantimodo': true,
    'medimodo': true
};
var paths = {
    apk: {
        combinedRelease: "platforms/android/build/outputs/apk/android-release.apk",
        combinedDebug: "platforms/android/build/outputs/apk/android-debug.apk",
        arm7Release: "platforms/android/build/outputs/apk/android-arm7-release.apk",
        x86Release: "platforms/android/build/outputs/apk/android-x86-release.apk",
        outputFolder: "platforms/android/build/outputs/apk",
    },
    sass: ['./src/scss/**/*.scss'],
    src:{
        appConfigs: "src/",
        devCredentials: "src/private_configs/dev-credentials.json",
        privateConfigs: "src/private_configs/",
        defaultConfig: "src/default.config.json",
        defaultPrivateConfig: "src/private_configs/default.private_config.json",
        icons: "src/img/icons",
        firebase: "src/lib/firebase/**/*",
        js: "src/js/*.js",
        serviceWorker: "src/firebase-messaging-sw.js"
    },
    www: {
        appConfigs: "www/",
        devCredentials: "www/private_configs/dev-credentials.json",
        privateConfigs: "www/private_configs/",
        defaultConfig: "www/default.config.json",
        buildInfo: "www/build-info.json",
        defaultPrivateConfig: "www/private_configs/default.private_config.json",
        icons: "www/img/icons",
        firebase: "www/lib/firebase/",
        js: "www/js/"
    }
};
var argv = require('yargs').argv;
var bower = require('bower');
var change = require('gulp-change');
var clean = require('gulp-rimraf');
var cordovaBuild = require('taco-team-build');
var csso = require('gulp-csso');
var concat = require('gulp-concat');
var defaultRequestOptions = {strictSSL: false};
var download = require('gulp-download-stream');
var es = require('event-stream');
var exec = require('child_process').exec;
var filter = require('gulp-filter');
var fs = require('fs');
var git = require('gulp-git');
var gulp = require('gulp');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var jeditor = require('gulp-json-editor');
var lazypipe = require('lazypipe');
var minifyCss = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var open = require('gulp-open');
var parseString = require('xml2js').parseString;
var plist = require('plist');
var q = require('q');
var rename = require('gulp-rename');
var replace = require('gulp-string-replace');
var request = require('request');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var rp = require('request-promise');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var sh = require('shelljs');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var streamify = require('gulp-streamify');
var templateCache = require('gulp-angular-templatecache');
var ts = require('gulp-typescript');
var uglify      = require('gulp-uglify');
var unzip = require('gulp-unzip');
var useref = require('gulp-useref');
var xml2js = require('xml2js');
var zip = require('gulp-zip');
var s3 = require('gulp-s3-upload')({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});
var bugsnag = require("bugsnag");
bugsnag.register("ae7bc49d1285848342342bb5c321a2cf");
bugsnag.releaseStage = getCurrentServerContext();
process.on('unhandledRejection', function (err) {
    console.error("Unhandled rejection: " + (err && err.stack || err));
    bugsnag.notify(err);
});
bugsnag.onBeforeNotify(function (notification) {
    var metaData = notification.events[0].metaData;
    // modify meta-data
    metaData.subsystem = { name: getCurrentServerContext() };
    metaData.client_id = process.env.QUANTIMODO_CLIENT_ID;
    metaData.build_link = getBuildLink();
});
var qmLog = {
    error: function (message, object) {
        console.error(obfuscateStringify(message, object));
        bugsnag.notify(new Error(obfuscateStringify(message), obfuscateSecrets(object)));
    },
    info: function (message, object) {console.log(obfuscateStringify(message, object));},
    debug: function (message, object) {
        if(buildDebug){qmLog.info("BUILD DEBUG: " + message, object);}
    },
    logErrorAndThrowException: function (message, object) {
        qmLog.error(message, object);
        throw message;
    }
};
var majorMinorVersionNumbers = '2.8.';
if(argv.clientSecret){process.env.QUANTIMODO_CLIENT_SECRET = argv.clientSecret;}
process.env.npm_package_licenseText = null; // Pollutes logs
qmLog.info("Environmental Variables:", process.env);
function setVersionNumbers() {
    var date = new Date();
    function getPatchVersionNumber() {
        var date = new Date();
        var monthNumber = (date.getMonth() + 1).toString();
        var dayOfMonth = ('0' + date.getDate()).slice(-2);
        return monthNumber + dayOfMonth;
    }
    function appendLeadingZero(integer) {return ('0' + integer).slice(-2);}
    function getLongDateFormat(){return date.getFullYear().toString() + appendLeadingZero(date.getMonth() + 1) + appendLeadingZero(date.getDate());}
    versionNumbers = {
        iosCFBundleVersion: majorMinorVersionNumbers + getPatchVersionNumber() + '.0',
        //androidVersionCodes: {armV7: getLongDateFormat() + appendLeadingZero(date.getHours()), x86: getLongDateFormat() + appendLeadingZero(date.getHours() + 1)},
        androidVersionCode: getLongDateFormat() + appendLeadingZero(date.getHours()),
        ionicApp: majorMinorVersionNumbers + getPatchVersionNumber()
    };
    qmLog.info(JSON.stringify(versionNumbers));
}
setVersionNumbers();
var buildingFor = {
    web: function () {
        return !buildingFor.android() && !buildingFor.ios() && !buildingFor.chrome();
    },
    android: function () {
        return process.env.BUILD_ANDROID;
    },
    ios:function () {
        return process.env.BUILD_IOS;
    },
    chrome: function () {
        return process.env.BUILD_CHROME;
    }
};
var Quantimodo = require('quantimodo');
var defaultClient = Quantimodo.ApiClient.instance;
var quantimodo_oauth2 = defaultClient.authentications['quantimodo_oauth2'];
quantimodo_oauth2.accessToken = process.env.QUANTIMODO_ACCESS_TOKEN;
console.log("process.platform is " + process.platform + " and process.env.OS is " + process.env.OS);
function isTruthy(value) {return (value && value !== "false");}
function getCurrentServerContext() {
    var currentServerContext = "local";
    if(process.env.CIRCLE_BRANCH){return "circleci";}
    if(process.env.BUDDYBUILD_BRANCH){return "buddybuild";}
    return process.env.HOSTNAME;
}
function getBuildLink() {
    if(process.env.BUDDYBUILD_APP_ID){return "https://dashboard.buddybuild.com/apps/" + process.env.BUDDYBUILD_APP_ID + "/build/" + process.env.BUDDYBUILD_APP_ID;}
    if(process.env.CIRCLE_BUILD_NUM){return "https://circleci.com/gh/QuantiModo/quantimodo-android-chrome-ios-web-app/" + process.env.CIRCLE_BUILD_NUM;}
}
function setClientId(callback) {
    if(process.env.QUANTIMODO_CLIENT_ID){
        qmLog.info('Client id already set to ' + process.env.QUANTIMODO_CLIENT_ID);
        if (callback) {callback();}
        return;
    }
    if(process.env.BUDDYBUILD_BRANCH && process.env.BUDDYBUILD_BRANCH.indexOf('apps') !== -1){
        process.env.QUANTIMODO_CLIENT_ID = process.env.BUDDYBUILD_BRANCH.replace('apps/', '');
    }
    if(process.env.CIRCLE_BRANCH && process.env.CIRCLE_BRANCH.indexOf('apps') !== -1){
        process.env.QUANTIMODO_CLIENT_ID = process.env.CIRCLE_BRANCH.replace('apps/', '');
        qmLog.info("Using CIRCLE_BRANCH as client id: " + process.env.CIRCLE_BRANCH);
    }
    if(argv.clientId){
        process.env.QUANTIMODO_CLIENT_ID = argv.clientId;
        qmLog.info("Using argv.clientId as client id: " + argv.clientId);
    }
    if(process.env.QUANTIMODO_CLIENT_ID){
        process.env.QUANTIMODO_CLIENT_ID = process.env.QUANTIMODO_CLIENT_ID.replace('apps/', '');
        qmLog.info('Stripped apps/ and now client id is ' + process.env.QUANTIMODO_CLIENT_ID);
    }
    if (!process.env.QUANTIMODO_CLIENT_ID) {
        git.revParse({args: '--abbrev-ref HEAD'}, function (err, branch) {
            qmLog.info('current git branch: ' + branch);
            if (!process.env.QUANTIMODO_CLIENT_ID) {
                if (appIds[branch]) {
                    qmLog.info('Setting process.env.QUANTIMODO_CLIENT_ID using branch name ' + branch);
                    process.env.QUANTIMODO_CLIENT_ID = branch;
                } else {
                    console.warn('No process.env.QUANTIMODO_CLIENT_ID set.  Falling back to quantimodo client id');
                    process.env.QUANTIMODO_CLIENT_ID = 'quantimodo';
                }
            }
            if (callback) {callback();}
        });
    } else {
        if (callback) {callback();}
    }
}
function getChromeExtensionZipFilename() {return process.env.QUANTIMODO_CLIENT_ID + '-chrome-extension.zip';}
function getPathToChromeExtensionZip() {return buildPath + '/' + getChromeExtensionZipFilename();}
function getPathToUnzippedChromeExtension() {return buildPath + '/' + process.env.QUANTIMODO_CLIENT_ID + '-chrome-extension';}
function readDevCredentials(){
    try{
        devCredentials = JSON.parse(fs.readFileSync(paths.src.devCredentials));
        qmLog.info("Using dev credentials from " + paths.src.devCredentials + ". This file is ignored in .gitignore and should never be committed to any repository.");
    } catch (error){
        qmLog.info('No existing dev credentials found');
        devCredentials = {};
    }
}
function validateJsonFile(filePath) {
    try{
        var parsedOutput = JSON.parse(fs.readFileSync(filePath));
        qmLog.info(filePath + " is valid json");
        qmLog.debug(filePath + ": ", parsedOutput);
    } catch (error){
        var message = filePath + " is NOT valid json!";
        qmLog.error(message, error);
        throw(message);
    }
}
readDevCredentials();
function convertToCamelCase(string) {
    string = string.replace('.', '-');
    string = string.replace('_', '-');
    if(string.charAt(0) === "-"){string = string.substr(1);}
    string = string.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
    string = string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    return string;
}
function getSubStringAfterLastSlash(myString) {
    var parts = myString.split('/');
    return parts[parts.length - 1];
}
function convertFilePathToPropertyName(filePath) {
    var propertyName = getSubStringAfterLastSlash(filePath);
    propertyName = propertyName.replace(process.env.QUANTIMODO_CLIENT_ID, '');
    propertyName = propertyName.replace('.zip', '').replace('.apk', '');
    propertyName = convertToCamelCase(propertyName);
    return propertyName;
}
function getS3RelativePath(relative_filename) {
    return  'app_uploads/' + process.env.QUANTIMODO_CLIENT_ID + '/' + relative_filename;
}
function getS3Url(relative_filename) {
    return s3BaseUrl + getS3RelativePath(relative_filename);
}
function uploadBuildToS3(filePath) {
    if(appSettings.apiUrl === "local.quantimo.do"){
        qmLog.info("Not uploading because appSettings.apiUrl is " + appSettings.apiUrl);
        return;
    }
    /** @namespace appSettings.appStatus.betaDownloadLinks */
    appSettings.appStatus.betaDownloadLinks[convertFilePathToPropertyName(filePath)] = getS3Url(filePath);
    /** @namespace appSettings.appStatus.buildStatus */
    appSettings.appStatus.buildStatus[convertFilePathToPropertyName(filePath)] = "READY";
    return uploadToS3(filePath);
}
function uploadAppImagesToS3(filePath) {
    //appSettings.additionalSettings.appImages[convertFilePathToPropertyName(filePath)] = getS3Url(filePath); We can just generate this from client id in PHP contructor
    return uploadToS3(filePath);
}
function checkAwsEnvs() {
    if(!process.env.AWS_ACCESS_KEY_ID){
        qmLog.info("Please set environmental variable AWS_ACCESS_KEY_ID");
        return false;
    }
    if(!process.env.AWS_SECRET_ACCESS_KEY){
        qmLog.info("Please set environmental variable AWS_SECRET_ACCESS_KEY");
        return false;
    }
    return true;
}
function uploadToS3(filePath) {
    if(!checkAwsEnvs()){
        qmLog.info("Cannot upload to S3. Please set environmental variable AWS_SECRET_ACCESS_KEY");
        return;
    }
    fs.stat(filePath, function (err, stat) {
        if (!err) {
            qmLog.info("Uploading " + filePath + "...");
            return gulp.src([filePath]).pipe(s3({
                Bucket: 'quantimodo',
                ACL: 'public-read',
                keyTransform: function(relative_filename) {
                    return getS3RelativePath(filePath);
                }
            }, {
                maxRetries: 5,
                logger: console
            }));
        } else {
            qmLog.error('Could not find ' + filePath);
            qmLog.error(err);
        }
    });
}
function prettyJSONStringify(object) {return JSON.stringify(object, null, '\t');}
function execute(command, callback, suppressErrors) {
    qmLog.debug('executing ' + command);
    var my_child_process = exec(command, function (error, stdout, stderr) {
        if (error !== null) {
            if (suppressErrors) {
                qmLog.info('ERROR: exec ' + error);
            } else {
                qmLog.error('ERROR: exec ' + error);
            }
        }
        callback(error, stdout);
    });
    my_child_process.stdout.pipe(process.stdout);
    my_child_process.stderr.pipe(process.stderr);
}
function executeCommand(command, callback) {
    exec(command, function (err, stdout, stderr) {
        qmLog.info(stdout);
        qmLog.info(stderr);
        callback(err);
    });
}
function decryptFile(fileToDecryptPath, decryptedFilePath, callback) {
    if (!process.env.ENCRYPTION_SECRET) {
        qmLog.error('ERROR: Please set ENCRYPTION_SECRET environmental variable!');
        if (callback) {callback();}
        return;
    }
    qmLog.info('DECRYPTING ' + fileToDecryptPath + ' to ' + decryptedFilePath);
    var cmd = 'openssl aes-256-cbc -k "' + process.env.ENCRYPTION_SECRET + '" -in "' + fileToDecryptPath + '" -d -a -out "' + decryptedFilePath + '"';
    execute(cmd, function (error) {
        if (error !== null) {qmLog.error('ERROR: DECRYPTING: ' + error);} else {qmLog.info('DECRYPTED to ' + decryptedFilePath);}
        fs.stat(decryptedFilePath, function (err, stat) {
            if (!err) {
                qmLog.info(decryptedFilePath + ' exists');
            } else {
                qmLog.error('Could not decrypt' + fileToDecryptPath);
                qmLog.error('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
                qmLog.error(err);
            }
        });
        if (callback) {callback();}
        //outputSHA1ForAndroidKeystore(decryptedFilePath);
    });
}
function encryptFile(fileToEncryptPath, encryptedFilePath, callback) {
    if (!process.env.ENCRYPTION_SECRET) {
        qmLog.error('ERROR: Please set ENCRYPTION_SECRET environmental variable!');
        return;
    }
    var cmd = 'openssl aes-256-cbc -k "' + process.env.ENCRYPTION_SECRET + '" -in "' + fileToEncryptPath + '" -e -a -out "' + encryptedFilePath + '"';
    qmLog.debug('executing ' + cmd);
    execute(cmd, callback);
}
function ionicUpload(callback) {
    var commandForGit = 'git log -1 HEAD --pretty=format:%s';
    execute(commandForGit, function (error, output) {
        var commitMessage = output.trim();
        var uploadCommand = 'ionic upload --email m@thinkbnumbers.org --password ' + process.env.IONIC_PASSWORD +
            ' --note "' + commitMessage + '" --deploy ' + process.env.RELEASE_STAGE;
        qmLog.info('ionic upload --note "' + commitMessage + '" --deploy ' + process.env.RELEASE_STAGE);
        qmLog.debug('\n' + uploadCommand);
        execute(uploadCommand, callback);
    });
}
function zipAFolder(folderPath, zipFileName, destinationFolder) {
    qmLog.info("Zipping " + folderPath + " to " + destinationFolder + '/' + zipFileName);
    qmLog.debug('If this fails, make sure there are no symlinks.');
    return gulp.src([folderPath + '/**/*'])
        .pipe(zip(zipFileName))
        .pipe(gulp.dest(destinationFolder));
}
function resizeIcon(callback, resolution) {
    var outputIconPath = paths.www.icons + '/icon_' + resolution + '.png';
    var command = 'convert resources/icon.png -resize ' + resolution + 'x' + resolution + ' ' + outputIconPath;
    return execute(command, function (error) {
        if (error) {
            qmLog.info("Please install imagemagick in order to resize icons.  The windows version is here: https://sourceforge.net/projects/imagemagick/?source=typ_redirect");
            qmLog.info('ERROR: ' + JSON.stringify(error));
        }
        uploadAppImagesToS3(outputIconPath);
        callback();
    });
}
function onWindows(callback) {
    if(process.env.OS && process.env.OS.toLowerCase().indexOf('win') !== -1){
        qmLog.info("Cannot do this on windows");
        if(callback){callback();}
        return true;
    }
}
function fastlaneSupply(track, callback) {
    if(onWindows(callback)){return;}
    var apk_paths;
    qmLog.info("If you have problems uploading to Play, promote any alpha releases to beta, disable the alpha channel, and set xwalkMultipleApk to false");
    /** @namespace appSettings.additionalSettings */
    /** @namespace buildSettings.xwalkMultipleApk */
    if(buildSettings.xwalkMultipleApk) {
        apk_paths = paths.apk.arm7Release + ',' + paths.apk.x86Release;
    } else {
        apk_paths = paths.apk.combinedRelease;
    }
    /** @namespace appSettings.additionalSettings.appIds.appIdentifier */
    /** @namespace appSettings.additionalSettings.appIds */
    executeCommand('fastlane supply' +
        ' --apk_paths ' + apk_paths +
        ' --track ' + track +
        ' --skip_upload_metadata ' +
        ' --skip_upload_images ' +
        ' --skip_upload_screenshots ' +
        ' --verbose ' +
        ' --package_name ' + appSettings.additionalSettings.appIds.appIdentifier +
        ' --json_key supply_json_key_for_google_play.json',
        callback);
}
function setVersionNumbersInWidget(parsedXmlFile) {
    parsedXmlFile.widget.$.version = versionNumbers.ionicApp;
    parsedXmlFile.widget.$['ios-CFBundleVersion'] = versionNumbers.iosCFBundleVersion;
    parsedXmlFile.widget.$['android-versionCode'] = versionNumbers.androidVersionCode;
    return parsedXmlFile;
}
function getPostRequestOptions() {
    var options = getRequestOptions('/api/v1/appSettings');
    options.method = "POST";
    options.body = {clientId: process.env.QUANTIMODO_CLIENT_ID};
    return options;
}
function obfuscateSecrets(object){
    if(typeof object !== 'object'){return object;}
    object = JSON.parse(JSON.stringify(object)); // Decouple so we don't screw up original object
    for (var propertyName in object) {
        if (object.hasOwnProperty(propertyName)) {
            var lowerCaseProperty = propertyName.toLowerCase();
            if(lowerCaseProperty.indexOf('secret') !== -1 || lowerCaseProperty.indexOf('password') !== -1 || lowerCaseProperty.indexOf('token') !== -1){
                object[propertyName] = "HIDDEN";
            } else {
                object[propertyName] = obfuscateSecrets(object[propertyName]);
            }
        }
    }
    return object;
}
function obfuscateStringify(message, object) {
    var objectString = '';
    if(object){
        object = obfuscateSecrets(object);
        objectString = ':  ' + prettyJSONStringify(object);
    }
    message += objectString;
    if(process.env.QUANTIMODO_CLIENT_SECRET){message = message.replace(process.env.QUANTIMODO_CLIENT_SECRET, 'HIDDEN');}
    if(process.env.AWS_SECRET_ACCESS_KEY){message = message.replace(process.env.AWS_SECRET_ACCESS_KEY, 'HIDDEN');}
    if(process.env.ENCRYPTION_SECRET){message = message.replace(process.env.ENCRYPTION_SECRET, 'HIDDEN');}
    if(process.env.QUANTIMODO_ACCESS_TOKEN){message = message.replace(process.env.QUANTIMODO_ACCESS_TOKEN, 'HIDDEN');}
    return message;
}
function postAppStatus() {
    var options = getPostRequestOptions();
    options.body.appStatus = appSettings.appStatus;
    qmLog.info("Posting appStatus", appSettings.appStatus);
    return makeApiRequest(options);
}
function makeApiRequest(options, successHandler) {
    qmLog.info('Making request to ' + options.uri + ' with clientId: ' + process.env.QUANTIMODO_CLIENT_ID);
    qmLog.debug(options.uri, options);
    //options.uri = options.uri.replace('app', 'staging');
    if(options.uri.indexOf('staging') !== -1){options.strictSSL = false;}
    return rp(options).then(function (response) {
        qmLog.info("Successful response from " + options.uri + " for client id " + options.qs.clientId);
        qmLog.debug(options.uri + " response", response);
        if(successHandler){successHandler(response);}
    }).catch(function (err) {
        outputApiErrorResponse(err, options);
        throw err;
    });
}
function postNotifyCollaborators(appType) {
    var options = getPostRequestOptions();
    options.uri = appHostName + '/api/v2/email';
    options.body.emailType = appType + '-build-ready';
    return makeApiRequest(options);
}
function getRequestOptions(path) {
    var options = {
        uri: appHostName + path,
        qs: {clientId: process.env.QUANTIMODO_CLIENT_ID, clientSecret: process.env.QUANTIMODO_CLIENT_SECRET},
        headers: {'User-Agent': 'Request-Promise', 'Content-Type': 'application/json'},
        json: true // Automatically parses the JSON string in the response
    };
    if(process.env.QUANTIMODO_ACCESS_TOKEN){
        options.qs.access_token = process.env.QUANTIMODO_ACCESS_TOKEN;
    } else {
        qmLog.error("Please add your QUANTIMODO_ACCESS_TOKEN environmental variable from " + appHostName + "/api/v2/account");
    }
    return options;
}
function getAppEditUrl() {
    return getAppsListUrl() + '/' + appSettings.clientId + '/edit';
}
function getAppsListUrl() {
    return appHostName + '/api/v2/apps';
}
function getAppDesignerUrl() {
    return appHostName + '/ionic/Modo/www/configuration-index.html#/app/configuration?clientId=' + appSettings.clientId;
}
function verifyExistenceOfFile(filePath) {
    return fs.stat(filePath, function (err, stat) {
        if (!err) {qmLog.info(filePath + ' exists');} else {throw 'Could not create ' + filePath + ': '+ err;}
    });
}
function writeToXmlFile(outputFilePath, parsedXmlFile, callback) {
    var builder = new xml2js.Builder();
    var updatedXml = builder.buildObject(parsedXmlFile);
    fs.writeFile(outputFilePath, updatedXml, 'utf8', function (error) {
        if (error) {
            qmLog.error('ERROR: error writing to xml file', error);
        } else {
            qmLog.info('Successfully wrote the xml file: ' + updatedXml);
            if(callback){callback();}
        }
    });
}
function replaceTextInFiles(filesArray, textToReplace, replacementText){
    return gulp.src(filesArray, {base: '.'})
        .pipe(replace(textToReplace, replacementText))
        .pipe(gulp.dest('./'));
}
function outputApiErrorResponse(err, options) {
    if(!err || !err.response){
        qmLog.error("No err.response provided to outputApiErrorResponse!  err: ", err);
        qmLog.error("Request options: ", options);
        return;
    }
    if(err.response.statusCode === 401){
        throw "Credentials invalid.  Please correct them in " + paths.src.devCredentials + " and try again.";
    }
    qmLog.error(options.uri + " error response", err.response.body);
}
function getFileNameFromUrl(url) {
    return url.split('/').pop();
}
function downloadEncryptedFile(url, outputFileName) {
    var decryptedFilename = getFileNameFromUrl(url).replace('.enc', '');
    var downloadUrl = appHostName + '/api/v2/download?client_id=' + process.env.QUANTIMODO_CLIENT_ID + '&filename=' + encodeURIComponent(url);
    qmLog.info("Downloading " + downloadUrl + ' to ' + decryptedFilename);
    return request(downloadUrl + '&accessToken=' + process.env.QUANTIMODO_ACCESS_TOKEN, defaultRequestOptions)
        .pipe(fs.createWriteStream(outputFileName));
}
function unzipFile(pathToZipFile, pathToOutputFolder) {
    qmLog.info("Unzipping " + pathToZipFile + " to " + pathToOutputFolder);
    return gulp.src(pathToZipFile)
        .pipe(unzip())
        .pipe(gulp.dest(pathToOutputFolder));
}
function getCordovaBuildCommand(releaseStage, platform) {
    var command = 'cordova build --' + releaseStage + ' ' + platform;
    //if(buildDebug){command += " --verbose";}  // Causes stdout maxBuffer exceeded error.  Run this as a command outside gulp if you need verbose output
    return command;
}
function outputVersionCodeForApk(pathToApk) {
    if(onWindows()){return;}
    var cmd = '$ANDROID_HOME/build-tools/24.0.2/aapt dump badging ' + circleCIPathToRepo + '/' + pathToApk;
    // aapt dump badging MyAwesomeApplication.apk |grep version
    return execute(cmd, function (error) {
        if (error !== null) {qmLog.error('ERROR: ' + error);}
    });
}
function copyFiles(sourceFiles, destinationPath, excludedFolder) {
    var srcArray = [sourceFiles];
    if(excludedFolder && typeof excludedFolder === "string"){
        console.log("Excluding " + excludedFolder + " from copy.. ");
        srcArray.push('!' + excludedFolder);
        srcArray.push('!' + excludedFolder + '/**');
    } else if (excludedFolder) {
        srcArray = srcArray.concat(excludedFolder);
    }
    console.log("Copying " + JSON.stringify(srcArray) + " to " + destinationPath);
    return gulp.src(srcArray).pipe(gulp.dest(destinationPath));
}
function addAppSettingsToParsedConfigXml(parsedXmlFile) {
    parsedXmlFile.widget.name[0] = appSettings.appDisplayName;
    parsedXmlFile.widget.description[0] = appSettings.appDescription;
    parsedXmlFile.widget.$.id = appSettings.additionalSettings.appIds.appIdentifier;
    parsedXmlFile.widget.preference.push({$: {name: "xwalkMultipleApk",
        value: (buildSettings.xwalkMultipleApk) ? true : false}});
    return parsedXmlFile;
}
function outputPluginVersionNumber(folderName) {
    var pluginXmlPath = 'plugins/' + folderName + '/plugin.xml';
    try {
        var xml = fs.readFileSync(pluginXmlPath, 'utf8');
        //console.log(prettyJSONStringify(xml));
        parseString(xml, function (err, parsedXmlFile) {
            if (err) {
                throw new Error('ERROR: failed to read xml file', err);
            } else {
                console.log(folderName + " version: " + parsedXmlFile.plugin.$.version);
            }
        });
    } catch (error) {
        qmLog.error("Could not get plugin config from " + pluginXmlPath);
    }
}
function generateConfigXmlFromTemplate(callback) {
    //var configXmlPath = 'config-template-' + platformCurrentlyBuildingFor + '.xml';
    var configXmlPath = 'config-template-shared.xml';
    var xml = fs.readFileSync(configXmlPath, 'utf8');
    /** @namespace appSettings.additionalSettings.appIds.googleReversedClientId */
    if (appSettings.additionalSettings.appIds.googleReversedClientId) {
        xml = xml.replace('REVERSED_CLIENT_ID_PLACEHOLDER', appSettings.additionalSettings.appIds.googleReversedClientId);
    }
    xml = xml.replace('QuantiModoClientId_PLACEHOLDER', process.env.QUANTIMODO_CLIENT_ID);
    xml = xml.replace('QuantiModoClientSecret_PLACEHOLDER', process.env.QUANTIMODO_CLIENT_SECRET);
    parseString(xml, function (err, parsedXmlFile) {
        if (err) {
            throw new Error('ERROR: failed to read xml file', err);
        } else {
            parsedXmlFile = addAppSettingsToParsedConfigXml(parsedXmlFile);
            parsedXmlFile = setVersionNumbersInWidget(parsedXmlFile);
            writeToXmlFile('./config.xml', parsedXmlFile, callback);
        }
    });
}
var timeHelper = {
    getUnixTimestampInSeconds: function(dateTimeString) {
        if(!dateTimeString){dateTimeString = new Date().getTime();}
        return Math.round(timeHelper.getUnixTimestampInMilliseconds(dateTimeString)/1000);
    },
    getUnixTimestampInMilliseconds:function(dateTimeString) {
        if(!dateTimeString){return new Date().getTime();}
        return new Date(dateTimeString).getTime();
    },
    getTimeSinceString:function(unixTimestamp) {
        if(!unixTimestamp){return "never";}
        var secondsAgo = timeHelper.secondsAgo(unixTimestamp);
        if(secondsAgo > 2 * 24 * 60 * 60){return Math.round(secondsAgo/(24 * 60 * 60)) + " days ago";}
        if(secondsAgo > 2 * 60 * 60){return Math.round(secondsAgo/(60 * 60)) + " hours ago";}
        if(secondsAgo > 2 * 60){return Math.round(secondsAgo/(60)) + " minutes ago";}
        return secondsAgo + " seconds ago";
    },
    secondsAgo: function(unixTimestamp) {return Math.round((timeHelper.getUnixTimestampInSeconds() - unixTimestamp));}
};
// Set the default to the build task
gulp.task('default', ['configureApp']);
// Executes taks specified in winPlatforms, linuxPlatforms, or osxPlatforms based on
// the hardware Gulp is running on which are then placed in platformsToBuild
gulp.task('build', ['scripts', 'sass'], function () {
    qmLog.info("Be sure to setup your system following the instructions at http://taco.visualstudio.com/en-us/docs/tutorial-gulp-readme/#tacoteambuild");
    return cordovaBuild.buildProject(platformsToBuild, buildArgs)
        .then(function () {
            // ** NOTE: Package not required in recent versions of Cordova
            return cordovaBuild.packageProject(platformsToBuild)
                .then(function () {
                    return es.concat(
                        gulp.src(buildPaths.apk).pipe(gulp.dest(buildPaths.binApk)),
                        gulp.src(buildPaths.ipa).pipe(gulp.dest(buildPaths.binIpa)),
                        gulp.src(buildPaths.appx).pipe(gulp.dest(buildPaths.binAppx)));
                });
        });
});
// Build Android, copy the results back to bin folder
gulp.task('build-android', ['scripts', 'sass'], function () {
    return cordovaBuild.buildProject('android', buildArgs)
        .then(function () {
            return gulp.src(buildPaths.apk).pipe(gulp.dest(buildPaths.binApk));
        });
});
// Build iOS, copy the results back to bin folder
gulp.task('build-ios', ['scripts', 'sass'], function () {
    return cordovaBuild.buildProject('ios', buildArgs)
        .then(function () {
            // ** NOTE: Package not required in recent versions of Cordova
            return cordovaBuild.packageProject(platformsToBuild)
                .then(function () {
                    return gulp.src(buildPaths.ipa).pipe(gulp.dest(buildPaths.binIpa));
                });
        });
});
// Build Windows, copy the results back to bin folder
gulp.task('build-win', ['scripts', 'sass'], function () {
    return cordovaBuild.buildProject('windows', buildArgs)
        .then(function () {
            return gulp.src(buildPaths.appx).pipe(gulp.dest(buildPaths.binAppx));
        });
});
// Typescript compile - Can add other things like minification here
gulp.task('scripts', function () {
    // Compile TypeScript code - This sample is designed to compile anything under the "scripts" folder using settings
    // in tsconfig.json if present or this gulpfile if not.  Adjust as appropriate for your use case.
    if (fs.existsSync(buildPaths.tsconfig)) {
        // Use settings from scripts/tsconfig.json
        gulp.src(buildPaths.ts)
            .pipe(ts(ts.createProject(buildPaths.tsconfig)))
            .pipe(gulp.dest('.'));
    } else {
        // Otherwise use these default settings
        gulp.src(buildPaths.ts)
            .pipe(ts({
                noImplicitAny: false,
                noEmitOnError: true,
                removeComments: false,
                sourceMap: true,
                out: 'appBundle.js',
                target: 'es5'
            }))
            .pipe(gulp.dest('www/scripts'));
    }
});
var chromeScripts = ['lib/localforage/dist/localforage.js', 'lib/bugsnag/src/bugsnag.js', 'lib/quantimodo/quantimodo-web.js',
    'js/qmLogger.js','js/qmHelpers.js', 'js/qmChrome.js', 'qm-amazon/qmUrlUpdater.js'];
function chromeManifest(outputPath, backgroundScriptArray) {
    outputPath = outputPath || chromeExtensionBuildPath + '/manifest.json';
    var chromeExtensionManifest = {
        'manifest_version': 2,
        'name': appSettings.appDisplayName,
        'description': appSettings.appDescription,
        'version': versionNumbers.ionicApp,
        'options_page': 'chrome_options.html',
        'icons': {
            '16': 'img/icons/icon_16.png',
            '48': 'img/icons/icon_48.png',
            '128': 'img/icons/icon_128.png'
        },
        'permissions': [
            'alarms',
            'notifications',
            'storage',
            'tabs',
            'https://*.google.com/*',
            'https://*.facebook.com/*',
            'https://*.quantimo.do/*',
            'https://*.uservoice.com/*',
            'https://*.googleapis.com/*',
            'https://*.intercom.com/*',
            'https://*.intercom.io/*',
            'https://*.googleapis.com/*',
            'https://*.google-analytics.com/*',
            'webRequest', 'webRequestBlocking', 'http://www.amazon.com/*', 'https://www.amazon.com/*', 'http://www.amazon.ca/*', 'https://www.amazon.ca/*', 'http://www.amazon.co.uk/*', 'https://www.amazon.co.uk/*', 'http://www.amazon.de/*', 'https://www.amazon.de/*', 'http://www.amazon.es/*', 'https://www.amazon.es/*', 'http://www.amazon.fr/*', 'https://www.amazon.fr/*', 'http://www.amazon.it/*', 'https://www.amazon.it/*', 'http://www.amazon.co.jp/*', 'https://www.amazon.co.jp/*', 'http://www.amazon.cn/*', 'https://www.amazon.cn/*'
        ],
        'browser_action': {
            'default_icon':  'img/icons/icon_700.png',
            'default_popup': 'chrome_default_popup_iframe.html'
        },
        'background': {
            'scripts': backgroundScriptArray,
            'persistent': true
        }
    };
    //chromeExtensionManifest.appSettings = appSettings; // I think adding appSettings to the chrome manifest breaks installation
    chromeExtensionManifest = JSON.stringify(chromeExtensionManifest, null, 2);
    qmLog.info("Creating chrome manifest at " + outputPath);
    writeToFile(outputPath, chromeExtensionManifest);
}
gulp.task('chromeIFrameHtml', [], function () {
    return gulp.src(['src/chrome_default_popup_iframe.html'])
        .pipe(replace("quantimodo.quantimo.do", process.env.QUANTIMODO_CLIENT_ID + ".quantimo.do", './www/'))
        .pipe(gulp.dest(chromeExtensionBuildPath));
});
gulp.task('chromeOptionsHtml', [], function () {
    return gulp.src(['src/chrome_options.html'])
        .pipe(replace("quantimodo.quantimo.do", process.env.QUANTIMODO_CLIENT_ID + ".quantimo.do", './www/'))
        .pipe(gulp.dest(chromeExtensionBuildPath));
});
gulp.task('chromeManifestInBuildFolder', ['getAppConfigs'], function () {
    chromeManifest(chromeExtensionBuildPath + '/manifest.json', [chromeBackgroundJsFilename]);
});
gulp.task('chromeManifestInSrcFolder', ['getAppConfigs'], function () {
    chromeManifest('src/manifest.json', chromeScripts);
});
gulp.task('createProgressiveWebAppManifestInSrcFolder', ['getAppConfigs'], function () {
    createProgressiveWebAppManifest('src/manifest.json');
});
function createProgressiveWebAppManifest(outputPath) {
    outputPath = outputPath || paths.src + '/manifest.json';
    var pwaManifest = {
        'manifest_version': 2,
        'name': appSettings.appDisplayName,
        'short_name': appSettings.clientId,
        'description': appSettings.appDescription,
        "start_url": "index.html",
        "display": "standalone",
        "icons": [{
            "src": "img/icons/icon.png",
            "sizes": "512x512",
            "type": "image/png"
        }],
        "background_color": "#FF9800",
        "theme_color": "#FF9800",
        "gcm_sender_id": "1052648855194"
    };
    pwaManifest = JSON.stringify(pwaManifest, null, 2);
    qmLog.info("Creating ProgressiveWebApp manifest at " + outputPath);
    writeToFile(outputPath, pwaManifest);
}
function writeToFile(filePath, stringContents) {
    qmLog.info("Writing to " + filePath);
    if(typeof stringContents !== "string"){stringContents = JSON.stringify(stringContents);}
    return fs.writeFileSync(filePath, stringContents);
}
gulp.task('createSuccessFile', function () {return fs.writeFileSync('success');});
gulp.task('deleteSuccessFile', function () {return clean(['success']);});
gulp.task('deleteWwwManifestJson', function () {return clean(['www/manifest.json']);});
gulp.task('deleteDevCredentialsFromWww', function () {return clean([paths.www.devCredentials]);});
gulp.task('setClientId', function (callback) {setClientId(callback);});
gulp.task('validateDevCredentials', ['setClientId'], function () {
    var options = getRequestOptions('/api/v1/user');
    return makeApiRequest(options);
});
gulp.task('saveDevCredentials', ['setClientId'], function () {
    return writeToFile(paths.src.devCredentials, JSON.stringify(devCredentials));
});
function downloadFile(url, filename, destinationFolder) {
    qmLog.info("Downloading  " + url + " to " + destinationFolder + "/" + filename);
    return download(url)
        .pipe(rename(filename))
        .pipe(gulp.dest(destinationFolder));
}
function downloadAndUnzipFile(url, destinationFolder) {
    qmLog.info("Downloading  " + url + " and uzipping to " + destinationFolder);
    return download(url)
        .pipe(unzip())
        .pipe(gulp.dest(destinationFolder));
}
gulp.task('downloadChromeExtension', [], function(){
    return downloadAndUnzipFile(appSettings.appStatus.betaDownloadLinks.chromeExtension, getPathToUnzippedChromeExtension());
});
gulp.task('downloadIcon', [], function(){
    /** @namespace appSettings.additionalSettings.appImages.appIcon */
    /** @namespace appSettings.additionalSettings.appImages */
    var iconUrl = (appSettings.additionalSettings.appImages.appIcon) ? appSettings.additionalSettings.appImages.appIcon : appSettings.iconUrl;
    return downloadFile(iconUrl, 'icon.png', "./resources");
});
gulp.task('generatePlayPublicLicenseKeyManifestJson', ['getAppConfigs'], function(){
    if(!appSettings.additionalSettings.monetizationSettings.playPublicLicenseKey){
        qmLog.error("No public licence key for Play Store subscriptions.  Please add it at  " + getAppDesignerUrl(), appSettings.additionalSettings);
        return;
    }
    var manifestJson = {'play_store_key': appSettings.additionalSettings.monetizationSettings.playPublicLicenseKey};
    /** @namespace buildSettings.playPublicLicenseKey */
    return writeToFile('./www/manifest.json', manifestJson);
});
gulp.task('downloadSplashScreen', [], function(){
    /** @namespace appSettings.additionalSettings.appImages.splashScreen */
    var splashScreen = (appSettings.additionalSettings.appImages.splashScreen) ? appSettings.additionalSettings.appImages.splashScreen : appSettings.splashScreen;
    return downloadFile(splashScreen, 'splash.png', "./resources");
});
gulp.task('mergeToMasterAndTriggerRebuildsForAllApps', [], function(){
    var options = getRequestOptions('/api/ionic/master/merge');
    options.qs.server = options.qs.currentServerConext = getCurrentServerContext();
    return makeApiRequest(options);
});
gulp.task('getAppConfigs', ['setClientId'], function () {
    if(appSettings && appSettings.clientId === process.env.QUANTIMODO_CLIENT_ID){
        qmLog.info("Already have appSettings for " + appSettings.clientId);
        return;
    }
    var options = getRequestOptions('/api/v1/appSettings');
    function successHandler(response) {
        appSettings = response.appSettings;
        if(response.privateConfig){privateConfig = response.privateConfig;}
        function addBuildInfoToAppSettings() {
            appSettings.buildServer = getCurrentServerContext();
            appSettings.buildLink = getBuildLink();
            appSettings.versionNumber = versionNumbers.ionicApp;
            appSettings.debugMode = isTruthy(process.env.APP_DEBUG);
            appSettings.builtAt = timeHelper.getUnixTimestampInSeconds();
            if (!appSettings.clientSecret && process.env.QUANTIMODO_CLIENT_SECRET) {
                appSettings.clientSecret = process.env.QUANTIMODO_CLIENT_SECRET;
            }
            buildSettings = JSON.parse(JSON.stringify(appSettings.additionalSettings.buildSettings));
            delete appSettings.additionalSettings.buildSettings;
            /** @namespace appSettings.appStatus.buildEnabled.androidArmv7Release */
            /** @namespace appSettings.appStatus.buildEnabled.androidX86Release */
            if (appSettings.appStatus.buildEnabled.androidX86Release || appSettings.appStatus.buildEnabled.androidArmv7Release) {
                appSettings.appStatus.additionalSettings.buildSettings.xwalkMultipleApk = true;
            }
        }
        addBuildInfoToAppSettings();
        qmLog.info("Got app settings for " + appSettings.appDisplayName + ". You can change your app settings at " + getAppEditUrl());
        //appSettings = removeCustomPropertiesFromAppSettings(appSettings);
        if(process.env.APP_HOST_NAME){appSettings.apiUrl = process.env.APP_HOST_NAME.replace("https://", '');}
    }
    return makeApiRequest(options, successHandler);
});
function writeDefaultConfigJson(path) {
    writeToFile(path + "/default.config.json", prettyJSONStringify(appSettings));
}
function writePrivateConfigs(path) {
    if (!privateConfig && devCredentials.accessToken) {
        qmLog.error("Could not get privateConfig from " + options.uri + ' Please double check your available client ids at '
            + getAppsListUrl() + ' ' + appSettings.additionalSettings.companyEmail +
            " and ask them to make you a collaborator at " + getAppsListUrl() + " and run gulp devSetup again.");
    }
    /** @namespace response.privateConfig */
    if (privateConfig) {
        try {
            writeToFile(path + '/private_configs/default.private_config.json', prettyJSONStringify(privateConfig));
        } catch (error) {
            qmLog.error(error);
        }
    } else {
        qmLog.error("No private config provided!  User will not be able to use OAuth login!");
    }
}
gulp.task('chromeDefaultConfigJson', ['getAppConfigs'], function () {
    //writePrivateConfigs(chromeExtensionBuildPath);
    writeDefaultConfigJson(chromeExtensionBuildPath);
});
gulp.task('defaultConfigJsonToSrc', ['getAppConfigs'], function () {
    //writePrivateConfigs('src');
    writeDefaultConfigJson('src');
});
var buildSettings;
gulp.task('downloadAndroidReleaseKeystore', ['getAppConfigs'], function () {
    /** @namespace buildSettings.androidReleaseKeystoreFile */
    if(!buildSettings.androidReleaseKeystoreFile){
        qmLog.error( "No Android Keystore provided.  Using QuantiModo one.  If you have your own, please upload it at " + getAppDesignerUrl());
        return;
    }
    /** @namespace buildSettings.androidReleaseKeystorePassword */
    if(!buildSettings.androidReleaseKeystorePassword){
        qmLog.error( "No Android keystore storePassword provided.  Using QuantiModo one.  If you have your own, please add it at " + getAppDesignerUrl());
        return;
    }
    /** @namespace buildSettings.androidReleaseKeyAlias */
    if(!buildSettings.androidReleaseKeyAlias){
        qmLog.error( "No Android keystore alias provided.  Using QuantiModo one.  If you have your own, please add it at " + getAppDesignerUrl());
        return;
    }
    /** @namespace buildSettings.androidReleaseKeyPassword */
    if(!buildSettings.androidReleaseKeyPassword){
        qmLog.error( "No Android keystore password provided.  Using QuantiModo one.  If you have your own, please add it at " + getAppDesignerUrl());
        return;
    }
    var buildJson = {
        "android": {
            "release": {
                "keystore":"quantimodo.keystore",
                "storePassword": buildSettings.androidReleaseKeystorePassword,
                "alias": buildSettings.androidReleaseKeyAlias,
                "password": buildSettings.androidReleaseKeyPassword,
                "keystoreType":""
            }
        }
    };
    writeToFile('build.json', prettyJSONStringify(buildJson));
    return downloadEncryptedFile(buildSettings.androidReleaseKeystoreFile, "quantimodo.keystore");
});
gulp.task('downloadAndroidDebugKeystore', ['getAppConfigs'], function () {
    if(!buildSettings.androidReleaseKeystoreFile){
        throw "Please upload your Android release keystore at " + getAppEditUrl();
    }
    return downloadEncryptedFile(buildSettings.androidReleaseKeystoreFile, "debug.keystore");
});
gulp.task('getAndroidManifest', ['getAppConfigs'], function () {
    /** @namespace buildSettings.androidMaifestJsonFile */
    if(!buildSettings.androidMaifestJsonFile){
        qmLog.error("Please add your Android manifest.json at " + getAppEditUrl() + " to enable Google Play Store subscriptions");
    }
    return downloadEncryptedFile(buildSettings.androidMaifestJsonFile, "www/manifest.json");
});
gulp.task('verify-and-post-notify-collaborators-android', ['getAppConfigs'], function (callback) {
    runSequence(
        'verifyExistenceOfAndroidX86ReleaseBuild',
        'verifyExistenceOfAndroidArmV7ReleaseBuild',
        'verifyExistenceOfChromeExtension',
        'post-notify-collaborators-android',
        callback);
});
gulp.task('post-notify-collaborators-android', ['getAppConfigs'], function () {
    return postNotifyCollaborators('android');
});
gulp.task('post-app-status', [], function () {
    return postAppStatus();
});
gulp.task('validateChromeManifest', function () {
    return validateJsonFile(getPathToUnzippedChromeExtension() + '/manifest.json');
});
gulp.task('verifyExistenceOfBuildInfo', function () {
    return verifyExistenceOfFile(paths.www.buildInfo);
});
gulp.task('verifyExistenceOfAndroidX86ReleaseBuild', function () {
    if(buildSettings.xwalkMultipleApk){
        return verifyExistenceOfFile(paths.apk.x86Release);
    }
});
gulp.task('verifyExistenceOfAndroidArmV7ReleaseBuild', function () {
    if(buildSettings.xwalkMultipleApk){
        return verifyExistenceOfFile(paths.apk.arm7Release);
    }
});
gulp.task('verifyExistenceOfChromeExtension', function () {
    return verifyExistenceOfFile(getPathToChromeExtensionZip());
});
gulp.task('getCommonVariables', function () {
    var url = appHostName + '/api/v1/public/variables?removeAdvancedProperties=true&limit=200&sort=-numberOfUserVariables&numberOfUserVariables=(gt)3';
    qmLog.info('gulp getCommonVariables from '+ url);
    return request(url, defaultRequestOptions)
        .pipe(source('commonVariables.json'))
        .pipe(streamify(jeditor(function (commonVariables) {
            return commonVariables;
        })))
        .pipe(gulp.dest('./www/data/'));
});
gulp.task('getUnits', function (callback) {
    var url = appHostName + '/api/v1/units';
    qmLog.info('gulp getUnits from '+ url);
    try {
        request(url, defaultRequestOptions)
            .pipe(source('units.json'))
            .pipe(streamify(jeditor(function (units) {
                return units;
            })))
            .pipe(gulp.dest('./www/data/'));
    } catch (error) {
        qmLog.error(error);
    }
    callback();
});
gulp.task('getSHA1FromAPK', function () {
    qmLog.info('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
    var cmd = 'keytool -list -printcert -jarfile ' + paths.apk.arm7Release + ' | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64';
    return execute(cmd, function (error) {
        if (error !== null) {qmLog.error('ERROR: ' + error);} else {qmLog.info('DECRYPTED to ' + paths.apk.arm7Release);}
    });
});
gulp.task('outputX86ApkVersionCode', function () {
    if(buildSettings.xwalkMultipleApk){
        return outputVersionCodeForApk(paths.apk.x86Release);
    }
});
gulp.task('outputArmv7ApkVersionCode', function () {
    if(buildSettings.xwalkMultipleApk){
        return outputVersionCodeForApk(paths.apk.arm7Release);
    }
});
gulp.task('outputCombinedApkVersionCode', function () {
    if(!buildSettings.xwalkMultipleApk){
        return outputVersionCodeForApk(paths.apk.arm7Release);
    }
});
gulp.task('unzipChromeExtension', function () {
    return unzipFile(getPathToChromeExtensionZip(), getPathToUnzippedChromeExtension());
});
gulp.task('sass', function (done) {
    gulp.src('./src/scss/app.scss')  // Can't use "return" because gulp doesn't know whether to respect that or the "done" callback
        .pipe(sass({errLogToConsole: true}))
        .pipe(gulp.dest('./src/css/'))
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./src/css/'))
        .on('end', done);
});
gulp.task('watch', function () {gulp.watch(paths.sass, ['sass']);});
gulp.task('install', ['git-check'], function () {
    return bower.commands.install().on('log', function (data) {gutil.log('bower', gutil.colors.cyan(data.id), data.message);});
});
gulp.task('deleteNodeModules', function () {
    qmLog.info('If file is locked in Windows, open Resource Monitor as Administrator.  Then go to CPU -> Associated ' +
        'Handles and search for the locked file.  Then right click to kill all the processes using it.  Then try this ' +
        'task again.');
    return cleanFolder('node_modules');
});
gulp.task('deleteWwwPrivateConfigs', function () {
    return cleanFolder(paths.www.privateConfigs);
});
gulp.task('deleteWwwConfigs', function () {
    return cleanFolder(paths.www.appConfigs);
});
gulp.task('getDevAccessTokenFromUserInput', [], function () {
    var deferred = q.defer();
    if(devCredentials.accessToken){
        process.env.QUANTIMODO_ACCESS_TOKEN = devCredentials.accessToken;
        qmLog.info("Using accessToken " + devCredentials.accessToken + " from " + paths.src.devCredentials);
        deferred.resolve();
        return deferred.promise;
    }
    inquirer.prompt([{
        type: 'input', name: 'accessToken', message: 'Please enter your QuantiModo access token obtained from http://app.quantimo.do/api/v2/account: '
    }], function (answers) {
        process.env.QUANTIMODO_ACCESS_TOKEN = devCredentials.accessToken = answers.accessToken.trim();
        deferred.resolve();
    });
    return deferred.promise;
});
gulp.task('devSetup', [], function (callback) {
    runSequence(
        'getDevAccessTokenFromUserInput',
        'getClientIdFromUserInput',
        'validateDevCredentials',
        'saveDevCredentials',
        'configureApp',
        'ionicServe',
        'copyConfigsToSrc',
        callback);
});
gulp.task('getClientIdFromUserInput', function () {
    var deferred = q.defer();
    inquirer.prompt([{
        type: 'input', name: 'clientId', message: 'Please enter the client id obtained at '  + getAppsListUrl() + ": "
    }], function (answers) {
        process.env.QUANTIMODO_CLIENT_ID = answers.clientId.trim();
        deferred.resolve();
    });
    return deferred.promise;
});
var updatedVersion = '';
gulp.task('getUpdatedVersion', ['getClientIdFromUserInput'], function () {
    var deferred = q.defer();
    inquirer.prompt([{
        type: 'confirm', name: 'updatedVersion', 'default': false,
        message: 'Have you updated the app\'s version number in chromeApps/' + process.env.QUANTIMODO_CLIENT_ID + '/manifest.json ?'
    }], function (answers) {
        /** @namespace answers.updatedVersion */
        if (answers.updatedVersion) {
            updatedVersion = answers.updatedVersion;
            deferred.resolve();
        } else {
            qmLog.info('PLEASE UPDATE IT BEFORE UPLOADING');
            deferred.reject();
        }
    });
    return deferred.promise;
});
gulp.task('copyWwwFolderToChromeApp', ['getUpdatedVersion'], function () {
    return copyFiles('www/**/*', 'chromeApps/' + process.env.QUANTIMODO_CLIENT_ID + '/www');
});
gulp.task('zipChromeApp', ['copyWwwFolderToChromeApp'], function () {
    return gulp.src(['chromeApps/' + process.env.QUANTIMODO_CLIENT_ID + '/**/*'])
        .pipe(zip(process.env.QUANTIMODO_CLIENT_ID + '.zip'))
        .pipe(gulp.dest('chromeApps/zips'));
});
gulp.task('openChromeAuthorizationPage', ['zipChromeApp'], function () {
    var deferred = q.defer();
    gulp.src(__filename)
        .pipe(open({uri: 'https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=1052648855194-h7mj5q7mmc31k0g3b9rj65ctk0uejo9p.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob'}));
    deferred.resolve();
});
var code = '';
gulp.task('getChromeAuthorizationCode', ['openChromeAuthorizationPage'], function () {
    var deferred = q.defer();
    setTimeout(function () {
        qmLog.info('Starting getChromeAuthorizationCode');
        inquirer.prompt([{
            type: 'input', name: 'code', message: 'Please Enter the Code Generated from the opened website: '
        }], function (answers) {
            code = answers.code;
            code = code.trim();
            qmLog.info('code: ', code);
            deferred.resolve();
        });
    }, 2000);
    return deferred.promise;
});
var access_token = '';
gulp.task('getAccessTokenFromGoogle', ['getChromeAuthorizationCode'], function () {
    var deferred = q.defer();
    var options = {
        method: 'POST',
        url: 'https://accounts.google.com/o/oauth2/token',
        form: {
            client_id: '1052648855194-h7mj5q7mmc31k0g3b9rj65ctk0uejo9p.apps.googleusercontent.com',
            client_secret: 'gXbySqbFgRcg_RM9bIiXUmIS',
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
        }
    };
    request(options, function (error, message, response) {
        if (error) {
            qmLog.error('ERROR: Failed to generate the access code', error);
            defer.reject();
        } else {
            response = JSON.parse(response);
            access_token = response.access_token;
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task("upload-chrome-extension-to-s3", function() {return uploadBuildToS3(getPathToChromeExtensionZip());});
gulp.task("upload-x86-release-apk-to-s3", function() {
    if(buildSettings.xwalkMultipleApk){
        return uploadBuildToS3(paths.apk.x86Release);
    }
});
gulp.task("upload-armv7-release-apk-to-s3", function() {
    if(buildSettings.xwalkMultipleApk){
        return uploadBuildToS3(paths.apk.arm7Release);
    }
});
gulp.task("upload-combined-release-apk-to-s3", function() {
    if(!buildSettings.xwalkMultipleApk){
        return uploadBuildToS3(paths.apk.combinedRelease);
    }
});
gulp.task("upload-combined-debug-apk-to-s3", function() {
    if(!buildSettings.xwalkMultipleApk){
        if(buildDebug){
            return uploadBuildToS3(paths.apk.combinedDebug);
        } else {
            return console.log("Not building debug version because process.env.BUILD_DEBUG is not true");
        }
    }
});
gulp.task('uploadChromeApp', ['getAccessTokenFromGoogle'], function () {
    var deferred = q.defer();
    var source = fs.createReadStream('./chromeApps/zips/' + process.env.QUANTIMODO_CLIENT_ID + '.zip');
    // upload the package
    var options = {
        url: 'https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + appIds[process.env.QUANTIMODO_CLIENT_ID],
        method: 'PUT',
        headers: {'Authorization': 'Bearer ' + access_token, 'x-goog-api-version': '2'}
    };
    qmLog.info('Generated URL for upload operation: ', options.url);
    qmLog.info('The Access Token: Bearer ' + access_token);
    qmLog.info('UPLOADING. .. .. Please Wait! .. .');
    source.pipe(request(options, function (error, message, data) {
        if (error) {
            qmLog.error('ERROR: Error in Uploading Data', error);
            deferred.reject();
        } else {
            qmLog.info('Upload Response Received');
            data = JSON.parse(data);
            /** @namespace data.uploadState */
            if (data.uploadState === 'SUCCESS') {
                qmLog.info('Uploaded successfully!');
                deferred.resolve();
            } else {
                qmLog.info('Failed to upload the zip file');
                qmLog.info(JSON.stringify(data, 0, 2));
                deferred.reject();
            }
        }
    }));
    return deferred.promise;
});
var shouldPublish = true;
gulp.task('shouldPublish', ['uploadChromeApp'], function () {
    var deferred = q.defer();
    inquirer.prompt([{
        type: 'confirm',
        name: 'shouldPublish',
        message: 'Should we publish this version?',
        default: true
    }], function (answers) {
        /** @namespace answers.shouldPublish */
        if (answers.shouldPublish) {
            shouldPublish = answers.shouldPublish;
            deferred.resolve();
        } else {
            qmLog.info('Ended without publishing!');
            deferred.reject();
        }
    });
    return deferred.promise;
});
gulp.task('publishToGoogleAppStore', ['shouldPublish'], function () {
    var deferred = q.defer();
    // upload the package
    var options = {
        url: 'https://www.googleapis.com/chromewebstore/v1.1/items/' + appIds[process.env.QUANTIMODO_CLIENT_ID] + '/publish?publishTarget=trustedTesters',
        method: 'POST',
        headers: {'Authorization': 'Bearer ' + access_token, 'x-goog-api-version': '2', 'publishTarget': 'trustedTesters', 'Content-Length': '0'}
    };
    request(options, function (error, message, publishResult) {
        if (error) {
            qmLog.error('ERROR: error in publishing to trusted Users', error);
            deferred.reject();
        } else {
            publishResult = JSON.parse(publishResult);
            if (publishResult.status.indexOf('OK') > -1) {
                qmLog.info('published successfully');
                deferred.resolve();
            } else {
                qmLog.info('not published');
                qmLog.info(publishResult);
                deferred.reject();
            }
        }
    });
    return deferred.promise;
});
gulp.task('chrome', ['publishToGoogleAppStore'], function () {qmLog.info('Enjoy your day!');});
gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        qmLog.info(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
gulp.task('deleteIOSApp', function () {
    var deferred = q.defer();
    execute('ionic platform rm ios', function (error) {
        if (error !== null) {
            qmLog.error('ERROR: REMOVING IOS APP: ' + error);
            deferred.reject();
        } else {
            qmLog.info('\n***PLATFORM REMOVED****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('encryptSupplyJsonKeyForGooglePlay', [], function (callback) {
    var fileToEncryptPath = 'supply_json_key_for_google_play.json';
    var encryptedFilePath = 'supply_json_key_for_google_play.json.enc';
    encryptFile(fileToEncryptPath, encryptedFilePath, callback);
});
gulp.task('decryptSupplyJsonKeyForGooglePlay', [], function (callback) {
    var fileToDecryptPath = 'supply_json_key_for_google_play.json.enc';
    var decryptedFilePath = 'supply_json_key_for_google_play.json';
    decryptFile(fileToDecryptPath, decryptedFilePath, callback);
});
gulp.task('encryptBuildJson', [], function (callback) {
    var fileToEncryptPath = 'build.json';
    var encryptedFilePath = 'build.json.enc';
    encryptFile(fileToEncryptPath, encryptedFilePath, callback);
});
gulp.task('decryptBuildJson', [], function (callback) {
    var fileToDecryptPath = 'build.json.enc';
    var decryptedFilePath = 'build.json';
    decryptFile(fileToDecryptPath, decryptedFilePath, callback);
});
gulp.task('ng-annotate', [], function() {
    return gulp.src('src/js/**/*.js')
        .pipe(ngAnnotate())
        .pipe(gulp.dest('www/js'));
});
function minifyJsGenerateCssAndIndexHtml(sourceIndexFileName) {
    qmLog.info("Running minify-js-generate-css-and-index-html...");
    var jsFilter = filter("**/*.js", { restore: true });
    var cssFilter = filter("**/*.css", { restore: true });
    var indexHtmlFilter = filter(['**/*', '!**/'+sourceIndexFileName], { restore: true });
    var sourceMapsWriteOptions = {
        //sourceRoot: "src/lib/",
        includeContent: true // https://github.com/gulp-sourcemaps/gulp-sourcemaps#write-options
    };
    return gulp.src("src/"+sourceIndexFileName)
    //.pipe(useref())      // Concatenate with gulp-useref
        .pipe(useref({}, lazypipe().pipe(sourcemaps.init, { loadMaps: true })))
        .pipe(jsFilter)
        .pipe(uglify({mangle: false}))             // Minify any javascript sources (Can't mangle Angular files for some reason)
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(csso())               // Minify any CSS sources
        .pipe(cssFilter.restore)
        .pipe(indexHtmlFilter)
        .pipe(rev())                // Rename the concatenated files (but not index.html)
        .pipe(indexHtmlFilter.restore)
        .pipe(revReplace())         // Substitute in new filenames
        .pipe(sourcemaps.write('.', sourceMapsWriteOptions))
        .pipe(gulp.dest('www'));
}
gulp.task('minify-js-generate-css-and-index-html', ['cleanCombinedFiles'], function() {
    if(doNotMinify){
        return copyFiles('src/**/*', 'www', []);
    }
    return minifyJsGenerateCssAndIndexHtml('index.html');
});
var pump = require('pump');
gulp.task('uglify-error-debugging', function (cb) {
    pump([
        gulp.src('src/js/**/*.js'),
        uglify(),
        gulp.dest('./dist/')
    ], cb);
});
gulp.task('deleteFacebookPlugin', function (callback) {
    qmLog.info('If this doesn\'t work, just use gulp cleanPlugins');
    executeCommand('cordova plugin rm phonegap-facebook-plugin', callback);
});
gulp.task('deleteGooglePlusPlugin', function (callback) {
    qmLog.info('If this doesn\'t work, just use gulp cleanPlugins');
    execute('cordova plugin rm cordova-plugin-googleplus', callback);
});
gulp.task('ionicPlatformAddIOS', function (callback) {
    executeCommand('ionic platform add ios', callback);
});
gulp.task('ionicServe', function (callback) {
    qmLog.info("The app should open in a new browser tab in a few seconds. If it doesn't, run `ionic serve` from an administrative command prompt in the root of the repository.");
    executeCommand('ionic serve', callback);
});
gulp.task('ionicStateReset', function (callback) {
    executeCommand('ionic state reset', callback);
});
gulp.task('fastlaneSupplyBeta', ['decryptSupplyJsonKeyForGooglePlay'], function (callback) {
    try {
        fastlaneSupply('beta', callback, true);
    } catch (error) {
        qmLog.info(error);
    }
});
gulp.task('fastlaneSupplyProduction', ['decryptSupplyJsonKeyForGooglePlay'], function (callback) {
    try {
        fastlaneSupply('production', callback, true);
    } catch (error) {
        qmLog.info(error);
    }
});
gulp.task('ionicResources', function (callback) {
    executeCommand('ionic resources', callback);
});
gulp.task('androidDebugKeystoreInfo', function (callback) {
    qmLog.info('androidDebugKeystoreInfo gets stuck for some reason');
    callback();
    //executeCommand("keytool -exportcert -list -v -alias androiddebugkey -keystore debug.keystore", callback);
});
gulp.task('gitPull', function () {
    var commandForGit = 'git pull';
    execute(commandForGit, function (error, output) {
        output = output.trim();
        if (error) {
            qmLog.error('ERROR: Failed to pull: ' + output, error);
        } else {
            qmLog.info('Pulled changes ' + output);
        }
    });
});
gulp.task('gitCheckoutAppJs', function () {
    var commandForGit = 'git checkout -- www/js/app.js';
    execute(commandForGit, function (error, output) {
        output = output.trim();
        if (error) {
            qmLog.error('ERROR: Failed to gitCheckoutAppJs: ' + output, error);
        } else {
            qmLog.info('gitCheckoutAppJs ' + output);
        }
    });
});
gulp.task('ionicUploadStaging', function (callback) {
    process.env.RELEASE_STAGE = 'staging';
    ionicUpload(callback);
});
gulp.task('ionicUploadProduction', function (callback) {
    process.env.RELEASE_STAGE = 'production';
    ionicUpload(callback);
});
gulp.task('ionicUpload', function (callback) {
    ionicUpload(callback);
});
gulp.task('ionicUploadProductionForAllApps', function (callback) {
    process.env.RELEASE_STAGE = 'production';
    runSequence(
        'ionicUploadAllApps',
        callback);
});
gulp.task('fastlaneSupplyBetaQuantiModo', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'configureApp',
        'fastlaneSupplyBeta',
        callback);
});
gulp.task('ionicUploadStagingForAllApps', function (callback) {
    process.env.RELEASE_STAGE = 'production';
    runSequence(
        'ionicUploadAllApps',
        callback);
});
gulp.task('ionicUploadAllApps', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'configureApp',
        'ionicUploadProduction',
        'setMoodiModoEnvs',
        'configureApp',
        'ionicUploadProduction',
        'setQuantiModoEnvs',
        'configureApp',
        'ionicUploadProduction',
        callback);
});
gulp.task('ionicAddCrosswalk', function (callback) {
    var command = 'ionic plugin add cordova-plugin-crosswalk-webview@2.2.0';  // Trying 2.2.0 to fix XWalkWebViewEngine is not abstract and does not override abstract method evaluateJavascript
    executeCommand(command, callback);
});
gulp.task('ionicInfo', function (callback) {
    var command = 'ionic info';
    executeCommand(command, callback);
});
gulp.task('cordovaPlatformVersionAndroid', function (callback) {
    var command = 'cordova platform version android';
    executeCommand(command, callback);
});
gulp.task('downloadGradle', function () {
    return request('https://services.gradle.org/distributions/gradle-2.14.1-bin.zip')
        .pipe(fs.createWriteStream('gradle-2.14.1-bin.zip'));
});
gulp.task('addFacebookPlugin', ['getAppConfigs'], function () {
    var deferred = q.defer();
    var addFacebookPlugin = function () {
        var commands = [
            'cordova -d plugin add ../fbplugin/phonegap-facebook-plugin',
            'APP_ID="' + privateConfig.FACEBOOK_APP_ID + '"',
            'APP_NAME="' + privateConfig.FACEBOOK_APP_NAME + '"'
        ].join(' --variable ');
        execute(commands, function (error) {
            if (error !== null) {
                qmLog.error('ERROR: THERE WAS AN ERROR:ADDING THE FACEBOOK PLUGIN***', error);
                deferred.reject();
            } else {
                qmLog.info('\n***FACEBOOK PLUGIN SUCCESSFULLY ADDED***');
                deferred.resolve();
            }
        });
    };
    fs.exists('../fbplugin', function (exists) {
        if (exists) {
            qmLog.info('FACEBOOK REPO ALREADY CLONED');
            addFacebookPlugin();
        } else {
            qmLog.info('FACEBOOK REPO NOT FOUND, CLONING https://github.com/Wizcorp/phonegap-facebook-plugin.git NOW');
            var commands = [
                'cd ../',
                'mkdir fbplugin',
                'cd fbplugin',
                'GIT_CURL_VERBOSE=1 GIT_TRACE=1 git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git'
            ].join(' && ');
            /*			//Try this if you get the muliple dex file error still
             qmLog.info("FACEBOOK REPO NOT FOUND, CLONING https://github.com/Telerik-Verified-Plugins/Facebook.git NOW");
             var commands = [
             "cd ../",
             "mkdir fbplugin",
             "cd fbplugin",
             "GIT_CURL_VERBOSE=1 GIT_TRACE=1 git clone https://github.com/Telerik-Verified-Plugins/Facebook.git"
             ].join(' && ');
             */
            execute(commands, function (error) {
                if (error !== null) {
                    qmLog.error('ERROR: THERE WAS AN ERROR:DOWNLOADING THE FACEBOOK PLUGIN***', error);
                    deferred.reject();
                } else {
                    qmLog.info('\n***FACEBOOK PLUGIN DOWNLOADED, NOW ADDING IT TO IONIC PROJECT***');
                    addFacebookPlugin();
                }
            });
        }
    });
    return deferred.promise;
});
//gulp.task('addGooglePlusPlugin', ['deleteGooglePlusPlugin'] , function(){
// Can't do this because failure of deleteGooglePlusPlugin prevents next task.  Use runSequence instead
gulp.task('addGooglePlusPlugin', [], function () {
    var deferred = q.defer();
    if (!process.env.REVERSED_CLIENT_ID) {
        process.env.REVERSED_CLIENT_ID = 'com.googleusercontent.apps.1052648855194-djmit92q5bbglkontak0vdc7lafupt0d';
        qmLog.info('No REVERSED_CLIENT_ID env specified. Falling back to ' + process.env.REVERSED_CLIENT_ID);
    }
    var commands = [
        'cordova -d plugin add https://github.com/mikepsinn/cordova-plugin-googleplus.git#89ac9f2e8d521bacaaf3989a22b50e4d0b5d6d09',
        'REVERSED_CLIENT_ID="' + process.env.REVERSED_CLIENT_ID + '"'
    ].join(' --variable ');
    execute(commands, function (error) {
        if (error !== null) {
            qmLog.error('ERROR: ADDING THE GOOGLE PLUS PLUGIN***', error);
            deferred.reject();
        } else {
            qmLog.info('\n***GOOGLE PLUS PLUGIN ADDED****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('checkDrawOverAppsPlugin', [], function (callback) {
    fs.exists('./platforms/android/assets/www/plugins/cordova-plugin-drawoverapps/www/OverApps.js', function (exists) {
        if (exists) {
            qmLog.info('drawoverapps plugin installed');
            if(callback){callback();}
        } else {
            qmLog.error('drawoverapps plugin NOT installed! Installing now');
            execute("cordova plugin add https://github.com/mikepsinn/cordova-plugin-drawoverapps.git", function (error) {
                if (error !== null) {
                    qmLog.error('ERROR: ADDING THE drawoverapps PLUGIN: ' + error);
                } else {
                    qmLog.info('drawoverapps PLUGIN ADDED');
                }
                if(callback){callback();}
            });
        }
    });
});
gulp.task('removeDrawOverAppsPlugin', [], function (callback) {
    qmLog.info('We have to reinstall DrawOverAppsPlugin with new client id to fix "package com.quantimodo.quantimodo does not exist" error');
    var suppressErrors = true;
    execute("cordova plugin remove cordova-plugin-drawoverapps", function (error) {
        if (error !== null) {
            qmLog.error('ERROR: Failed to remove drawoverapps PLUGIN! error: ' + error);
        } else {
            qmLog.info('drawoverapps plugin REMOVED');
        }
        if(callback){callback();}
    }, suppressErrors);
});
gulp.task('reinstallDrawOverAppsPlugin', ['removeDrawOverAppsPlugin'], function (callback) {
    return execute("cordova plugin add https://github.com/mikepsinn/cordova-plugin-drawoverapps.git", function (error) {
        if (error !== null) {
            qmLog.error('ERROR: ADDING THE drawoverapps PLUGIN: ' + error);
        } else {
            qmLog.info('drawoverapps PLUGIN ADDED');
        }
        if(callback){callback();}
    });
});
gulp.task('fixResourcesPlist', function () {
    var deferred = q.defer();
    if (!appSettings.appDisplayName) {deferred.reject('Please export appSettings.appDisplayName');}
    var myPlist = plist.parse(fs.readFileSync('platforms/ios/' + appSettings.appDisplayName + '/' + appSettings.appDisplayName + '-Info.plist', 'utf8'));
    var LSApplicationQueriesSchemes = [
        'fbapi',
        'fbapi20130214',
        'fbapi20130410',
        'fbapi20130702',
        'fbapi20131010',
        'fbapi20131219',
        'fbapi20140410',
        'fbapi20140116',
        'fbapi20150313',
        'fbapi20150629',
        'fbauth',
        'fbauth2',
        'fb-messenger-api20140430'
    ];
    myPlist.LSApplicationQueriesSchemes = LSApplicationQueriesSchemes.concat(myPlist.LSApplicationQueriesSchemes);
    if (myPlist.NSAppTransportSecurity && myPlist.NSAppTransportSecurity.NSExceptionDomains) {
        var facebookDotCom = {};
        /** @namespace myPlist.NSAppTransportSecurity.NSExceptionDomains */
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['facebook.com']) {
            facebookDotCom = myPlist.NSAppTransportSecurity.NSExceptionDomains['facebook.com'];
        }
        if (!facebookDotCom.NSIncludesSubdomains) {facebookDotCom.NSIncludesSubdomains = true;}
        if (!facebookDotCom.NSThirdPartyExceptionRequiresForwardSecrecy) {facebookDotCom.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        /** @namespace myPlist.NSAppTransportSecurity */
        myPlist.NSAppTransportSecurity.NSExceptionDomains['facebook.com'] = facebookDotCom;
        qmLog.info('Updated facebook.com');
        var fbcdnDotNet = {};
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net']) {fbcdnDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net'];}
        if (!fbcdnDotNet.NSIncludesSubdomains) {fbcdnDotNet.NSIncludesSubdomains = true;}
        if (!fbcdnDotNet.NSThirdPartyExceptionRequiresForwardSecrecy) {fbcdnDotNet.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net'] = fbcdnDotNet;
        qmLog.info('Updated fbcdn.net');
        // akamaihd.net
        var akamaihdDotNet = {};
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net']) {
            akamaihdDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net'];
        }
        if (!akamaihdDotNet.NSIncludesSubdomains) {akamaihdDotNet.NSIncludesSubdomains = true;}
        if (!akamaihdDotNet.NSThirdPartyExceptionRequiresForwardSecrecy) {akamaihdDotNet.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net'] = akamaihdDotNet;
        qmLog.info('Updated akamaihd.net');
    }
    fs.writeFile('platforms/ios/' + appSettings.appDisplayName + '/' + appSettings.appDisplayName + '-Info.plist', plist.build(myPlist), 'utf8', function (err) {
        if (err) {
            qmLog.error('ERROR: error writing to plist', err);
            deferred.reject();
        } else {
            qmLog.info('successfully updated plist');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('addPodfile', function () {
    var deferred = q.defer();
    if (!appSettings.appDisplayName) {deferred.reject('Please export appSettings.appDisplayName');}
    var addBugsnagToPodfile = function () {
        fs.readFile('./platforms/ios/Podfile', function (err, data) {
            if (err) {throw err;}
            //if(data.indexOf('pod \'Bugsnag\', :git => "https://github.com/bugsnag/bugsnag-cocoa.git"') < 0){
            if (data.indexOf('Bugsnag') < 0) {
                qmLog.info('no Bugsnag detected');
                gulp.src('./platforms/ios/Podfile')
                    .pipe(change(function (content) {
                        var bugsnag_str = 'target \'' + appSettings.appDisplayName + '\' do \npod \'Bugsnag\', :git => "https://github.com/bugsnag/bugsnag-cocoa.git"';
                        qmLog.info('Bugsnag Added to Podfile');
                        deferred.resolve();
                        return content.replace(/target.*/g, bugsnag_str);
                    }))
                    .pipe(gulp.dest('./platforms/ios/'));
            } else {
                qmLog.info('Bugsnag already present in Podfile');
                deferred.resolve();
            }
        });
    };
    fs.exists('./platforms/ios/Podfile', function (exists) {
        if (exists) {
            qmLog.info('Podfile');
            addBugsnagToPodfile();
        } else {
            qmLog.info('PODFILE REPO NOT FOUND, Installing it First');
            var commands = [
                'cd ./platforms/ios',
                'pod init'
            ].join(' && ');
            execute(commands, function (error) {
                if (error !== null) {
                    qmLog.error('ERROR: There was an error detected', error);
                    deferred.reject();
                } else {
                    qmLog.info('\n***Podfile Added****');
                    addBugsnagToPodfile();
                }
            });
        }
    });
    return deferred.promise;
});
gulp.task('addInheritedToOtherLinkerFlags', function () {
    if (!appSettings.appDisplayName) {qmLog.info('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            return content.replace(/OTHER_LDFLAGS(\s+)?=(\s+)?(\s+)\(/g, 'OTHER_LDFLAGS = (\n\t\t\t\t\t"$(inherited)",');
        }))
        .pipe(gulp.dest('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/'));
});
gulp.task('addDeploymentTarget', function () {
    if (!appSettings.appDisplayName) {qmLog.info('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            if (content.indexOf('IPHONEOS_DEPLOYMENT_TARGET') === -1) {
                return content.replace(/ENABLE_BITCODE(\s+)?=(\s+)?(\s+)NO\;/g, 'IPHONEOS_DEPLOYMENT_TARGET = 6.0;\ENABLE_BITCODE = NO;');
            }
            return content;
        }))
        .pipe(change(function (content) {
            qmLog.info('*****************\n\n\n', content, '\n\n\n*****************');
        }))
        .pipe(gulp.dest('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/'));
});
gulp.task('installPods', ['addPodfile'], function () {
    var deferred = q.defer();
    var commands = [
        'cd platforms/ios',
        'pod install'
    ].join(' && ');
    execute(commands, function (error) {
        if (error !== null) {
            qmLog.error('ERROR: There was an error detected', error);
            deferred.reject();
        } else {
            qmLog.info('\n***Pods Installed****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('addBugsnagInObjC', function () {
    if (!appSettings.appDisplayName) {qmLog.info('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '/Classes/AppDelegate.m')
        .pipe(change(function (content) {
            if (content.indexOf('Bugsnag') !== -1) {
                qmLog.info('Bugsnag Already Present');
                return content;
            } else {
                content = content.replace(/#import "MainViewController.h"/g, '#import "MainViewController.h"\n#import "Bugsnag.h"');
                content = content.replace(/self\.window\.rootViewController(\s)?=(\s)?self\.viewController\;/g, '[Bugsnag startBugsnagWithApiKey:@"ae7bc49d1285848342342bb5c321a2cf"];\n\tself.window.rootViewController = self.viewController;');
                qmLog.info('Bugsnag Added');
            }
            return content;
        }))
        .pipe(gulp.dest('./platforms/ios/' + appSettings.appDisplayName + '/Classes/'));
});
gulp.task('enableBitCode', function () {
    if (!appSettings.appDisplayName) {qmLog.info('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            return content.replace(/FRAMEWORK_SEARCH_PATHS(\s*)?=(\s*)?\(/g, 'ENABLE_BITCODE = NO;\n\t\t\t\tFRAMEWORK_SEARCH_PATHS = (');
        }))
        .pipe(gulp.dest('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/'));
});
gulp.task('makeIosApp', function (callback) {
    runSequence(
        'deleteIOSApp',
        'deleteFacebookPlugin',
        'ionicPlatformAddIOS',
        'ionicResources',
        'addFacebookPlugin',
        //'addGooglePlusPlugin',
        'fixResourcesPlist',
        'addBugsnagInObjC',
        'enableBitCode',
        'addInheritedToOtherLinkerFlags',
        'addDeploymentTarget',
        'addPodfile',
        'installPods',
        callback);
});
gulp.task('makeIosAppSimplified', function (callback) {
    runSequence(
        'fixResourcesPlist',
        'enableBitCode',
        'addInheritedToOtherLinkerFlags',
        'addDeploymentTarget',
        callback);
});
var uncommentedCordovaScript = '<script src="cordova.js"></script>';
var commentedCordovaScript = '<!-- cordova.js placeholder -->';
gulp.task('uncommentCordovaJsInIndexHtml', function () {
    return replaceTextInFiles(['src/index.html'], commentedCordovaScript, uncommentedCordovaScript);
});
gulp.task('commentOrUncommentCordovaJs', function () {
    if(process.env.BUILD_IOS || process.env.BUILD_ANDROID){
        console.log("Uncommenting cordova.js because process.env.BUILD_IOS or process.env.BUILD_ANDROID is true");
        return replaceTextInFiles(['src/index.html'], commentedCordovaScript, uncommentedCordovaScript);
    }
    console.log("Commenting cordova.js because neither process.env.BUILD_IOS or process.env.BUILD_ANDROID are true");
    return replaceTextInFiles(['src/index.html'], uncommentedCordovaScript, commentedCordovaScript);
});
gulp.task('setVersionNumberInFiles', function () {
    var filesToUpdate = [
        //paths.www.defaultConfig,
        '.travis.yml',
        'resources/chrome_app/manifest.json'
    ];
    return gulp.src(filesToUpdate, {base: '.'})
        .pipe(replace('IONIC_IOS_APP_VERSION_NUMBER_PLACEHOLDER', versionNumbers.iosCFBundleVersion))
        .pipe(replace('IONIC_APP_VERSION_NUMBER_PLACEHOLDER', versionNumbers.ionicApp))
        .pipe(gulp.dest('./'));
});
gulp.task('buildInfo', ['getAppConfigs'], function () {
    var buildInfo = {
        iosCFBundleVersion: versionNumbers.iosCFBundleVersion,
        builtAt: timeHelper.getUnixTimestampInSeconds(),
        buildServer: getCurrentServerContext,
        buildLink: getBuildLink(),
        versionNumber: versionNumbers.ionicApp
    };
    writeToFile("./www/build-info.json", buildInfo);
});
gulp.task('ic_notification', function () {
    gulp.src('./resources/android/res/**')
        .pipe(gulp.dest('./platforms/android/res'));
});
gulp.task('template', function (done) {
    gulp.src('./www/templates/**/*.html')
        .pipe(templateCache({
            standalone: true,
            root: 'templates'
        }))
        .pipe(gulp.dest('./public'))
        .on('end', done);
});
gulp.task('setEnvsFromBranchName', [], function (callback) {
    runSequence(
        'setClientId',
        'getAppConfigs',
        callback);
});
gulp.task('setMediModoEnvs', [], function (callback) {
    process.env.QUANTIMODO_CLIENT_ID = 'medimodo';
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('setMoodiModoEnvs', [], function (callback) {
    process.env.QUANTIMODO_CLIENT_ID = 'moodimodo';
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('setAppEnvs', ['setClientId'], function (callback) {
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('setQuantiModoEnvs', [], function (callback) {
    process.env.QUANTIMODO_CLIENT_ID = 'quantimodo';
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('cleanResources', [], function () {
    return cleanFolder('resources');
});
gulp.task('cleanPlugins', [], function () {
    return cleanFolder('plugins');
});
gulp.task('cleanPlatformsAndroid', [], function () {
    return cleanFolder('platforms/android');
});
gulp.task('cleanPlatforms', [], function () {
    return cleanFolder('platforms');
});
function cleanFiles(filesArray) {
    qmLog.info("Cleaning " + JSON.stringify(filesArray) + '...');
    return gulp.src(filesArray, {read: false}).pipe(clean());
}
function cleanFolder(folderPath) {
    qmLog.info("Cleaning " + folderPath + " folder...");
    return gulp.src(folderPath + '/*', {read: false}).pipe(clean());
}
gulp.task('cleanChromeBuildFolder', [], function () {
    return cleanFolder(chromeExtensionBuildPath);
});
gulp.task('cleanCombinedFiles', [], function () {
    qmLog.info("Running cleanCombinedFiles...");
    return cleanFiles(['www/css/combined*', 'www/scripts/combined*']);
});
gulp.task('cleanBuildFolder', [], function () {
    return cleanFolder(buildPath);
});
gulp.task('cleanWwwLibFolder', [], function () {
    return cleanFolder('www/lib');
});
gulp.task('copyAppResources', [
    //'cleanResources'
], function () {
    if(!process.env.QUANTIMODO_CLIENT_ID){
        qmLog.error("No QUANTIMODO_CLIENT_ID so falling back to quantimodo");
        process.env.QUANTIMODO_CLIENT_ID = 'quantimodo';
    }
    qmLog.info('If this doesn\'t work, make sure there are no symlinks in the apps folder!');
    var sourcePath = 'apps/' + process.env.QUANTIMODO_CLIENT_ID + '/**/*';
    qmLog.info("Copying " + sourcePath + "...");
    //return copyFiles(sourcePath, '.');
    return gulp.src([sourcePath], {
        base: 'apps/' + process.env.QUANTIMODO_CLIENT_ID
    }).pipe(gulp.dest('.'));
});
gulp.task('copyIonIconsToWww', [], function () {
    return copyFiles('src/lib/Ionicons/**/*', 'www/lib/Ionicons');
});
gulp.task('copyMaterialIconsToWww', [], function () {
    return copyFiles('src/lib/angular-material-icons/*', 'www/lib/angular-material-icons');
});
gulp.task('copySrcToWwwExceptLibrariesAndConfigs', [], function () {
    return copyFiles('src/**/*', 'www', ['!src/lib', '!src/lib/**', '!src/configs', '!src/default.config.json','!src/private_configs',
        '!src/private_configs/**', '!src/index.html', '!src/configuration-index.html']);
});
gulp.task('copySrcToWww', [], function () {
    return copyFiles('src/**/*', 'www', []);
});
gulp.task('copySrcJsToWww', [], function () {
    return copyFiles('src/js/**/*', 'www/js');
});
gulp.task('copyConfigsToSrc', [], function () {
    return copyFiles('default.config.json', 'src', []);
});
var chromeBackgroundJsFilename = 'qmChromeBackground.js';
gulp.task('chromeBackgroundJS', [], function () {
    var base = './src/';
    var chromeScriptsWithBase = [];
    for (var i = 0; i < chromeScripts.length; i++) {
        chromeScriptsWithBase[i] = base + chromeScripts[i];
    }
    return gulp.src(chromeScriptsWithBase)
        .pipe(uglify())
        .pipe(concat(chromeBackgroundJsFilename))
        .pipe(gulp.dest(chromeExtensionBuildPath));
    //return gulp.src(chromeScriptsWithBase).pipe(babel({presets: ['es2015']})).pipe(uglify()).pipe(gulp.dest(chromeExtensionBuildPath));
    //return gulp.src(chromeScriptsWithBase,  {base: base}).pipe(gulp.dest(chromeExtensionBuildPath));
});
gulp.task('copySrcToAndroidWww', [], function () {
    return copyFiles('src/**/*', 'www'); /// Have to copy to www because android build will overwrite android/assets/www
});
gulp.task('copyIconsToWwwImg', [], function () {
    return copyFiles('apps/' + process.env.QUANTIMODO_CLIENT_ID + '/resources/icon*.png', paths.www.icons);
});
gulp.task('copyIconsToChromeImg', [], function () {
    return copyFiles('www/img/icons/*', chromeExtensionBuildPath+"/img/icons");
});
gulp.task('copyServiceWorkerAndLibraries', [], function () {
    try {
        copyFiles(paths.src.firebase, paths.www.firebase);
    } catch (error) {
        qmLog.error(error);
    }
    try {
        copyFiles(paths.src.serviceWorker, 'www/');
    } catch (error) {
        qmLog.error(error);
    }
    try {
        return copyFiles(paths.src.js, paths.www.js);
    } catch (error) {
        qmLog.error(error);
    }
});
gulp.task('copyIconsToSrcImg', [], function () {
    return copyFiles('apps/' + process.env.QUANTIMODO_CLIENT_ID + '/resources/icon*.png', paths.src.icons);
});
gulp.task('copyAndroidLicenses', [], function () {
    if(!process.env.ANDROID_HOME){
        qmLog.error("Please pass ANDROID_HOME environmental variable to gulp task");
        return;
    }
    return copyFiles('android-licenses/*', process.env.ANDROID_HOME + '/licenses');
});
gulp.task('copyAndroidResources', [], function () {
    return copyFiles('resources/android/**/*', 'platforms/android');
});
gulp.task('copyAndroidBuild', [], function () {
    if (!process.env.QUANTIMODO_CLIENT_ID) {throw 'process.env.QUANTIMODO_CLIENT_ID not set!';}
    var buildFolderPath = buildPath + '/apks/' + process.env.QUANTIMODO_CLIENT_ID; // Non-symlinked apk build folder accessible by Jenkins within Vagrant box
    return copyFiles(paths.apk.outputFolder + '/*.apk', buildFolderPath);
});
gulp.task('copyWwwFolderToChromeExtension', ['getAppConfigs'], function () {
    return copyFiles('www/*.html', chromeExtensionBuildPath);
});
gulp.task('copyWwwFolderToAndroidApp', [], function () {
    return copyFiles('www/**/*', 'platforms/android/assets/www');
});
gulp.task('copyWwwIconsToSrc', [], function () {
    return copyFiles(paths.www.icons + "/*", paths.src.icons);
});
gulp.task('removeTransparentPng', [], function () {
    return gulp.src('resources/icon.png', {read: false}).pipe(clean());
});
gulp.task('removeTransparentPsd', [], function () {
    return gulp.src('resources/icon.psd', {read: false}).pipe(clean());
});
gulp.task('useWhiteIcon', ['downloadIcon'], function (callback) {
    return execute('convert -flatten resources/icon.png resources/icon.png', callback);
});
gulp.task('bowerInstall', [], function (callback) {
    return execute('bower install --allow-root', callback);
});
gulp.task('ionicResourcesIos', [], function (callback) {
    return execute('ionic resources ios', callback);
});
gulp.task('generateConfigXmlFromTemplate', ['setClientId', 'getAppConfigs'], function (callback) {
    generateConfigXmlFromTemplate(callback);
});
gulp.task('prepareIosApp', function (callback) {
    platformCurrentlyBuildingFor = 'ios';
    runSequence(
        'uncommentCordovaJsInIndexHtml',
        'cleanPlugins',
        'configureApp',
        //'copyAppResources',
        'generateConfigXmlFromTemplate', // Needs to happen before resource generation so icon paths are not overwritten
        'removeTransparentPng',
        'removeTransparentPsd',
        'useWhiteIcon',
        'ionicResourcesIos',
        'copyIconsToWwwImg',
        callback);
});
gulp.task('zipChromeExtension', [], function () {
    return zipAFolder(chromeExtensionBuildPath, getChromeExtensionZipFilename(), buildPath);
});
gulp.task('zipBuild', [], function () {
    return zipAFolder(process.env.BUDDYBUILD_WORKSPACE, "buddybuild.zip", './');
});
gulp.task('uploadBuddyBuildToS3', ['zipBuild'], function () {
    return uploadBuildToS3("buddybuild.zip");
});
// Need configureAppAfterNpmInstall or prepareIosApp results in infinite loop
gulp.task('configureAppAfterNpmInstall', [], function (callback) {
    qmLog.info('gulp configureAppAfterNpmInstall');
    if (process.env.BUDDYBUILD_SCHEME) {
        process.env.QUANTIMODO_CLIENT_ID = process.env.BUDDYBUILD_SCHEME.toLowerCase().substr(0, process.env.BUDDYBUILD_SCHEME.indexOf(' '));
        qmLog.info('BUDDYBUILD_SCHEME is ' + process.env.BUDDYBUILD_SCHEME + ' so going to prepareIosApp');
        runSequence(
            'prepareIosApp',
            callback);
    } else if (process.env.BUDDYBUILD_SECURE_FILES) {
        qmLog.info('Building Android because BUDDYBUILD_SCHEME is not set and we know we\'re on BuddyBuild because BUDDYBUILD_SECURE_FILES is set to: ' + process.env.BUDDYBUILD_SECURE_FILES);
        runSequence(
            'prepareRepositoryForAndroid',
            //'buildQuantiModoAndroid',  // Had to do this previously because buildAndroid wasn't working
            callback);
    } else {
        runSequence(
            'configureApp',
            //'deleteWwwConfigs',
            'deleteWwwPrivateConfigs',
            callback);
    }
});
gulp.task('configureApp', [], function (callback) {
    runSequence(
        //'deleteSuccessFile',  // I think this breaks iOS build
        'setClientId',
        'copyIonIconsToWww',
        //'copyMaterialIconsToWww',
        'sass',
        'copySrcToWwwExceptLibrariesAndConfigs',
        //'commentOrUncommentCordovaJs',
        'getCommonVariables',
        'getUnits',  // This is being weird for some reason
        'getAppConfigs',
        'uglify-error-debugging',
        'minify-js-generate-css-and-index-html',
        'downloadIcon',
        'resizeIcons',
        'downloadSplashScreen',
        'copyIconsToWwwImg',
        'copyServiceWorkerAndLibraries',
        'buildInfo',
        'setVersionNumberInFiles',
        'createSuccessFile',
        'verifyExistenceOfBuildInfo',
        callback);
});
gulp.task('chromeInSrcFolder', ['getAppConfigs'], function (callback) {
    if(!appSettings.appStatus.buildEnabled.chromeExtension){
        qmLog.error("Not building chrome extension because appSettings.appStatus.buildEnabled.chromeExtension is " +
            appSettings.appStatus.buildEnabled.chromeExtension + ".  You can re-enable it at " + getAppDesignerUrl());
        return;
    }
    runSequence(
        'chromeManifestInSrcFolder',
        'defaultConfigJsonToSrc',
        callback);
});
gulp.task('buildChromeExtension', ['getAppConfigs'], function (callback) {
    if(!appSettings.appStatus.buildEnabled.chromeExtension){
        qmLog.error("Not building chrome extension because appSettings.appStatus.buildEnabled.chromeExtension is " +
            appSettings.appStatus.buildEnabled.chromeExtension + ".  You can re-enable it at " + getAppDesignerUrl());
        return;
    }
    runSequence(
        'cleanWwwLibFolder',
        'cleanChromeBuildFolder',
        'bowerInstall',
        'copyIonIconsToWww',
        'copyWwwFolderToChromeExtension',
        'buildChromeExtensionWithoutCleaning',
        callback);
});
gulp.task('buildChromeExtensionWithoutCleaning', ['getAppConfigs'], function (callback) {
    if(!appSettings.appStatus.buildEnabled.chromeExtension){
        qmLog.error("Not building chrome extension because appSettings.appStatus.buildEnabled.chromeExtension is " +
            appSettings.appStatus.buildEnabled.chromeExtension + ".  You can re-enable it at " + getAppDesignerUrl());
        return;
    }
    runSequence(
        'downloadQmAmazonJs',
        'downloadIcon',
        'resizeIcons',
        'chromeBackgroundJS',
        'chromeIFrameHtml',
        'chromeOptionsHtml',
        'verifyExistenceOfBuildInfo',
        'copyIconsToChromeImg',
        'setVersionNumberInFiles',
        'chromeManifestInBuildFolder',
        'chromeDefaultConfigJson',
        'deleteWwwPrivateConfigs',
        'zipChromeExtension',
        'unzipChromeExtension',
        'validateChromeManifest',
        'upload-chrome-extension-to-s3',
        'post-app-status',
        callback);
});
gulp.task('prepareMoodiModoIos', function (callback) {
    runSequence(
        'setMoodiModoEnvs',
        'prepareIosApp',
        callback);
});
gulp.task('buildQuantiModo', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'buildChromeExtension',
        'buildAndroidApp',
        'prepareIosApp',
        callback);
});
gulp.task('buildMoodiModo', function (callback) {
    runSequence(
        'setMoodiModoEnvs',
        'buildChromeExtension',
        //'buildAndroidApp',
        'prepareIosApp',
        callback);
});
gulp.task('buildMediModo', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'buildChromeExtension',
        'buildAndroidApp',
        'prepareIosApp',
        callback);
});
gulp.task('buildQuantiModoAndroid', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'buildAndroidApp',
        callback);
});
gulp.task('buildMediModoAndroid', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'buildAndroidApp',
        callback);
});
gulp.task('buildAllChromeExtensions', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'buildChromeExtension',
        'setMoodiModoEnvs',
        'buildChromeExtensionWithoutCleaning',
        'setQuantiModoEnvs',
        'buildChromeExtensionWithoutCleaning',
        callback);
});
gulp.task('downloadQmAmazonJs', function () {
    return download("https://utopia.quantimo.do/dist/qmUrlUpdater.js")
        .pipe(gulp.dest("www/js/"));
});
gulp.task('downloadAllChromeExtensions', function (callback) {
    runSequence(
        'cleanBuildFolder',
        'setMediModoEnvs',
        'downloadChromeExtension',
        'setMoodiModoEnvs',
        'downloadChromeExtension',
        'setQuantiModoEnvs',
        'downloadChromeExtension',
        callback);
});
gulp.task('buildAllAndroidApps', function (callback) {
    runSequence(
        'cleanBuildFolder',
        'prepareRepositoryForAndroid',
        'setMediModoEnvs',
        'buildAndroidApp',
        'setQuantiModoEnvs',
        'buildAndroidApp',
        callback);
});
gulp.task('buildAllAndroidAppsWithCleaning', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'cleanBuildFolder',
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        'setQuantiModoEnvs',
        'cleanBuildFolder',
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        callback);
});
gulp.task('buildQuantiModoChromeExtension', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'buildChromeExtension',
        callback);
});
gulp.task('buildMediModoChromeExtension', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'buildChromeExtension',
        callback);
});
// This is a hook so we really shouldn't need it
gulp.task('buildAndReleaseIosApp', function (callback) {
    runSequence(
        'xcodeProjectFix',
        'fastlaneBetaIos',
        callback);
});
gulp.task('fastlaneBetaIos', function (callback) {
    var command = 'fastlane beta';
    return execute(command, callback);
});
gulp.task('xcodeProjectFix', function (callback) {
    var command = 'ruby hooks/xcodeprojectfix.rb';
    return execute(command, callback);
});
gulp.task('ionicPlatformAddAndroid', function (callback) {
    return execute('ionic platform add android@6.2.2', callback);
});
gulp.task('ionicPlatformRemoveAndroid', function (callback) {
    return execute('ionic platform remove android', callback);
});
gulp.task('cordovaBuildAndroidDebug', function (callback) {
    if(buildDebug){
        appSettings.appStatus.buildStatus[convertFilePathToPropertyName(androidArm7DebugApkName)] = "BUILDING";
        appSettings.appStatus.buildStatus[convertFilePathToPropertyName(androidX86DebugApkName)] = "BUILDING";
        appSettings.appStatus.buildStatus.androidDebug = "BUILDING";
        postAppStatus();
        return execute(getCordovaBuildCommand('debug', 'android'), callback);
    } else {
        console.log("Not building debug version because process.env.BUILD_DEBUG is not true");
        callback();
    }
});
gulp.task('cordovaBuildAndroidRelease', function (callback) {
    appSettings.appStatus.buildStatus[convertFilePathToPropertyName(androidArm7ReleaseApkName)] = "BUILDING";
    appSettings.appStatus.buildStatus[convertFilePathToPropertyName(androidX86ReleaseApkName)] = "BUILDING";
    appSettings.appStatus.buildStatus.androidRelease = "BUILDING";
    postAppStatus();
    return execute(getCordovaBuildCommand('release', 'android'), callback);
});
gulp.task('prepareQuantiModoIos', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'prepareIosApp',
        callback);
});
gulp.task('copySrcAndEmulateAndroid', function (callback) {
    runSequence(
        'uncommentCordovaJsInIndexHtml',
        'copySrcToWww',
        //'copySrcToAndroidWww',
        'ionicEmulateAndroid',
        callback);
});
gulp.task('copySrcAndRunAndroid', function (callback) {
    runSequence(
        'uncommentCordovaJsInIndexHtml',
        'copySrcToWww',
        //'copySrcToAndroidWww',
        'ionicRunAndroid',
        callback);
});
gulp.task('ionicResourcesAndroid', [], function (callback) {
    return execute('ionic resources android', callback);
});
gulp.task('ionicRunAndroid', [], function (callback) {
    return execute('ionic run android', callback);
});
gulp.task('ionicEmulateAndroid', [], function (callback) {
    return execute('ionic emulate android', callback);
});
gulp.task('resizeIcon700', [], function (callback) { return resizeIcon(callback, 700); });
gulp.task('resizeIcon16', [], function (callback) { return resizeIcon(callback, 16); });
gulp.task('resizeIcon48', [], function (callback) { return resizeIcon(callback, 48); });
gulp.task('resizeIcon128', [], function (callback) { return resizeIcon(callback, 128); });
gulp.task('resizeIcons', function (callback) {
    runSequence('resizeIcon700',
        'resizeIcon16',
        'resizeIcon48',
        'resizeIcon128',
        callback);
});
gulp.task('prepareRepositoryForAndroid', function (callback) {
    platformCurrentlyBuildingFor = 'android';
    runSequence(
        'uncommentCordovaJsInIndexHtml',
        'setAppEnvs',
        'generateConfigXmlFromTemplate',  // Must be run before addGooglePlusPlugin or running any other cordova commands
        'cleanPlatforms',
        'cleanPlugins',
        'prepareRepositoryForAndroidWithoutCleaning',
        callback);
});
gulp.task('prepareRepositoryForAndroidWithoutCleaning', function (callback) {
    if(!process.env.ANDROID_HOME){throw "ANDROID_HOME env is not set!";}
    console.log("ANDROID_HOME is " + process.env.ANDROID_HOME);
    platformCurrentlyBuildingFor = 'android';
    runSequence(
        'setAppEnvs',
        'uncommentCordovaJsInIndexHtml',
        'generateConfigXmlFromTemplate',  // Must be run before addGooglePlusPlugin or running any other cordova commands
        'ionicPlatformAddAndroid',
        'ionicAddCrosswalk',
        'ionicInfo',
        callback);
});
gulp.task('buildAndroidAfterCleaning', [], function (callback) {
    runSequence(
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        callback);
});
gulp.task('cordovaHotCodePushConfig', ['getAppConfigs'], function () {
    /** @namespace appSettings.additionalSettings.appIds.appleId */
    var string =
        '{"name": "QuantiModo", '+
        //'{"name": "'+appSettings.appDisplayName+'", '+
        '"s3bucket": "qm-cordova-hot-code-push", "s3prefix": "", "s3region": "us-east-1",' +
        // '"ios_identifier": "'+appSettings.additionalSettings.appIds.appleId + '",' +
        // '"android_identifier": "'+appSettings.additionalSettings.appIds.appIdentifier + '",' +
        '"ios_identifier": "",' +
        '"android_identifier": "",' +
        '"update": "resume", "content_url": "https://s3.amazonaws.com/qm-cordova-hot-code-push"}';
    return writeToFile('cordova-hcp.json', string);
});
gulp.task('cordovaHotCodePushLogin', [], function () {
    if(!checkAwsEnvs()){throw "Cannot upload to S3. Please set environmental variable AWS_SECRET_ACCESS_KEY";}
    /** @namespace process.env.AWS_ACCESS_KEY_ID */
    /** @namespace process.env.AWS_SECRET_ACCESS_KEY */
    var string = '{"key": "' + process.env.AWS_ACCESS_KEY_ID + ' ", "secret": "' + process.env.AWS_SECRET_ACCESS_KEY +'"}';
    return writeToFile('.chcplogin', string);
});
gulp.task('cordovaHotCodePushBuildDeploy', [], function (callback) {
    return executeCommand("cordova-hcp build && cordova-hcp deploy", callback);
});
gulp.task('deployToProduction', [], function (callback) {
    runSequence(
        'cordovaHotCodePushConfig',
        'cordovaHotCodePushLogin',
        //'deleteDevCredentialsFromWww',
        'deleteWwwPrivateConfigs',
        //'deleteWwwConfigs',
        'deleteWwwManifestJson',
        //'cordovaHotCodePushBuildDeploy',
        callback);
});
gulp.task('buildAndroidApp', ['getAppConfigs'], function (callback) {
    /** @namespace appSettings.additionalSettings.monetizationSettings */
    /** @namespace appSettings.additionalSettings.monetizationSettings.subscriptionsEnabled */
    if(!appSettings.additionalSettings.monetizationSettings.playPublicLicenseKey && appSettings.additionalSettings.monetizationSettings.subscriptionsEnabled){
        qmLog.error("Please add your playPublicLicenseKey at " + getAppDesignerUrl());
        qmLog.error("No playPublicLicenseKey so disabling subscriptions on Android build");
        //appSettings.additionalSettings.monetizationSettings.subscriptionsEnabled = false;
        //generateDefaultConfigJson(appSettings);
    }
    /** @namespace appSettings.appStatus.buildEnabled */
    /** @namespace appSettings.appStatus.buildEnabled.androidRelease */
    if(!appSettings.appStatus.buildEnabled.androidRelease){
        qmLog.info("Not building android app because appSettings.appStatus.buildEnabled.androidRelease is " +
            appSettings.appStatus.buildEnabled.androidRelease + ".  You can enable it at " + getAppDesignerUrl());
        return;
    }
    outputPluginVersionNumber('de.appplant.cordova.plugin.local-notification');
    //outputPluginVersionNumber('cordova-plugin-local-notifications');
    runSequence(
        'uncommentCordovaJsInIndexHtml',
        'copyAndroidLicenses',
        'bowerInstall',
        'configureApp',
        'copyAppResources',
        'generateConfigXmlFromTemplate',
        'cordovaPlatformVersionAndroid',
        'decryptBuildJson',
        'generatePlayPublicLicenseKeyManifestJson',
        'downloadAndroidReleaseKeystore',
        'ionicResourcesAndroid',
        'copyAndroidResources',
        'copyIconsToWwwImg',
        'reinstallDrawOverAppsPlugin',
        'ionicInfo',
        'checkDrawOverAppsPlugin',
        'cordovaBuildAndroidRelease',
        //'outputArmv7ApkVersionCode',
        //'outputX86ApkVersionCode',
        //'outputCombinedApkVersionCode',
        'cordovaBuildAndroidDebug',
        //"upload-x86-release-apk-to-s3",
        //"upload-armv7-release-apk-to-s3",
        "upload-combined-release-apk-to-s3",
        "upload-combined-debug-apk-to-s3",
        "fastlaneSupplyBeta",
        "post-app-status",
        callback);
});
var watch = require('gulp-watch');
gulp.task('watch-src', function () {
    var source = './src', destination = './www';
    gulp.src(source + '/**/*', {base: source})
        .pipe(watch(source, {base: source}))
        .pipe(gulp.dest(destination));
});
