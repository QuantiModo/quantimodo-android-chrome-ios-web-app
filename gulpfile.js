var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    es = require('event-stream'),
    cordovaBuild = require('taco-team-build');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var inquirer = require('inquirer');
var change = require('gulp-change');
var q = require('q');
var fs = require('fs');
var glob = require('glob');
var zip = require('gulp-zip');
var unzip = require('gulp-unzip');
var request = require('request');
var open = require('gulp-open');
var gcallback = require('gulp-callback');
var runSequence = require('run-sequence');
var plist = require('plist');
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var clean = require('gulp-rimraf');
var replace = require('gulp-string-replace');
var download = require('gulp-download-stream');
var git = require('gulp-git'),
    jeditor = require('gulp-json-editor'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify');
var directoryMap = require('gulp-directory-map');
var argv = require('yargs').argv;
var exec = require('child_process').exec;
var rp = require('request-promise');
var templateCache = require('gulp-angular-templatecache');
var s3 = require('gulp-s3-upload')({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});
console.log("process.platform is " + process.platform);
function isTruthy(value) {return (value && value !== "false");}
var buildDebug = isTruthy(process.env.BUILD_DEBUG);
var currentServerConext = "local";
if(process.env.CIRCLE_BRANCH){currentServerConext = "circleci";}
if(process.env.BUDDYBUILD_BRANCH){currentServerConext = "buddybuild";}
function setClientId(callback) {
    if(process.env.BUDDYBUILD_BRANCH && process.env.BUDDYBUILD_BRANCH.indexOf('apps') !== -1){process.env.QUANTIMODO_CLIENT_ID = process.env.BUDDYBUILD_BRANCH;}
    if(process.env.CIRCLE_BRANCH && process.env.CIRCLE_BRANCH.indexOf('apps') !== -1){
        process.env.QUANTIMODO_CLIENT_ID = process.env.CIRCLE_BRANCH;
        infoLog("Using CIRCLE_BRANCH as client id: " + process.env.CIRCLE_BRANCH);
    }
    if(argv.clientId){
        process.env.QUANTIMODO_CLIENT_ID = argv.clientId;
        infoLog("Using argv.clientId as client id: " + argv.clientId);
    }
    if(process.env.QUANTIMODO_CLIENT_ID){
        process.env.QUANTIMODO_CLIENT_ID = process.env.QUANTIMODO_CLIENT_ID.replace('apps/', '');
        infoLog('Stripped apps/ and now client id is ' + process.env.QUANTIMODO_CLIENT_ID);
    }
    if (!process.env.QUANTIMODO_CLIENT_ID) {
        git.revParse({args: '--abbrev-ref HEAD'}, function (err, branch) {
            infoLog('current git branch: ' + branch);
            if (!process.env.QUANTIMODO_CLIENT_ID) {
                if (appIds[branch]) {
                    console.info('Setting process.env.QUANTIMODO_CLIENT_ID using branch name ' + branch);
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
//setClientId();  // Don't want to do this here because it's logs interrupt dev credential entry
var appIds = {
    'moodimodo': 'homaagppbekhjkalcndpojiagijaiefm',
    'mindfirst': 'jeadacoeabffebaeikfdpjgpjbjinobl',
    'energymodo': 'aibgaobhplpnjmcnnmdamabfjnbgflob',
    'quantimodo': true,
    'medimodo': true
};
var pathToIcons = "www/img/icons";
var appHostName = (process.env.APP_HOST_NAME) ? process.env.APP_HOST_NAME : "https://app.quantimo.do";
var appSettings, privateConfig, devCredentials;
var privateConfigDirectoryPath = './www/private_configs/';
var appConfigDirectoryPath = './www/configs/';
var defaultPrivateConfigPath = privateConfigDirectoryPath + 'default.private_config.json';
var devCredentialsPath = privateConfigDirectoryPath + 'dev-credentials.json';
var defaultAppConfigPath = appConfigDirectoryPath + 'default.config.json';
var pathToOutputApks = 'platforms/android/build/outputs/apk';
var pathToCombinedReleaseApk = pathToOutputApks + '/android-release.apk';
var androidArm7ReleaseApkName = 'android-armv7-release';
var pathToReleaseArmv7Apk = pathToOutputApks + '/' + androidArm7ReleaseApkName + '.apk';
var androidX86ReleaseApkName = 'android-x86-release';
var pathToReleasex86Apk = pathToOutputApks + '/' + androidX86ReleaseApkName + '.apk';
var androidArm7DebugApkName = 'android-armv7-debug';
var pathToDebugArmv7Apk = pathToOutputApks + '/' + androidArm7DebugApkName + '.apk';
var androidX86DebugApkName = 'android-x86-debug';
var pathToDebugx86Apk = pathToOutputApks + '/' + androidX86DebugApkName + '.apk';
var buildPath = 'build';
var circleCIPathToRepo = '~/quantimodo-android-chrome-ios-web-app';
var chromeExtensionManifestTemplate = {
    'manifest_version': 2,
    'options_page': 'www/chrome_extension/options/options.html',
    'icons': {
        '16': pathToIcons + '/icon_16.png',
        '48': pathToIcons + '/icon_48.png',
        '128': pathToIcons + '/icon_128.png'
    },
    'permissions': [
        'alarms',
        'notifications',
        'storage',
        'tabs'
    ],
    'browser_action': {
        'default_icon': pathToIcons + '/icon_700.png',
        'default_popup': 'www/templates/chrome/iframe.html'
    },
    'background': {
        'scripts': ['www/js/chrome/background.js'],
        'persistent': false
    }
};
var chromeExtensionBuildPath = buildPath + '/chrome_extension';
var platformCurrentlyBuildingFor;
var paths = {
    sass: ['./www/scss/**/*.scss']
};
function getChromeExtensionZipFilename() {return process.env.QUANTIMODO_CLIENT_ID + '-chrome-extension.zip';}
function getPathToChromeExtensionZip() {return buildPath + '/' + getChromeExtensionZipFilename();}
function getPathToUnzippedChromeExtension() {return buildPath + '/' + process.env.QUANTIMODO_CLIENT_ID + '-chrome-extension';}
function getPatchVersionNumber() {
    var date = new Date();
    var monthNumber = (date.getMonth() + 1).toString();
    var dayOfMonth = ('0' + date.getDate()).slice(-2);
    return monthNumber + dayOfMonth;
}
var date = new Date();
function appendLeadingZero(integer) {
    return ('0' + integer).slice(-2);
}
function getLongDateFormat(){
    return date.getFullYear().toString() + appendLeadingZero(date.getMonth() + 1) + appendLeadingZero(date.getDate());
}
var majorMinorVersionNumbers = '2.7.';
var versionNumbers = {
    iosCFBundleVersion: majorMinorVersionNumbers + getPatchVersionNumber() + '.0',
    //androidVersionCodes: {armV7: getLongDateFormat() + appendLeadingZero(date.getHours()), x86: getLongDateFormat() + appendLeadingZero(date.getHours() + 1)},
    androidVersionCode: getLongDateFormat() + appendLeadingZero(date.getHours()),
    ionicApp: majorMinorVersionNumbers + getPatchVersionNumber()
};
infoLog(JSON.stringify(versionNumbers));
function readDevCredentials(){
    try{
        devCredentials = JSON.parse(fs.readFileSync(devCredentialsPath));
        infoLog("Using dev credentials from " + devCredentialsPath + ". This file is ignored in .gitignore and should never be committed to any repository.");
    } catch (error){
        infoLog('No existing dev credentials found');
        devCredentials = {};
    }
}
function validateJsonFile(filePath) {
    try{
        var parsedOutput = JSON.parse(fs.readFileSync(filePath));
        infoLog(filePath + " is valid json");
    } catch (error){
        errorLog(error);
        throw(filePath + " is NOT valid json!");
    }
}
var s3BaseUrl = 'https://quantimodo.s3.amazonaws.com/';
readDevCredentials();
var camelCase = (function () {
    var DEFAULT_REGEX = /[-_]+(.)?/g;

    function toUpper(match, group1) {
        return group1 ? group1.toUpperCase() : '';
    }
    return function (str, delimiters) {
        return str.replace(delimiters ? new RegExp('[' + delimiters + ']+(.)?', 'g') : DEFAULT_REGEX, toUpper);
    };
})();
function convertToCamelCase(string) {
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
    propertyName = propertyName.replace('.', '_');
    propertyName = camelCase(propertyName);
    //propertyName = convertToCamelCase(propertyName);
    return propertyName;
}
function getS3RelativePath(relative_filename) {
    return  'app_uploads/' + process.env.QUANTIMODO_CLIENT_ID + '/' + relative_filename;
}
function getS3Url(relative_filename) {
    return s3BaseUrl + getS3RelativePath(relative_filename);
}
function uploadBuildToS3(filePath) {
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
function uploadToS3(filePath) {
    if(!process.env.AWS_ACCESS_KEY_ID){
        errorLog("Cannot upload to S3. Please set environmental variable AWS_ACCESS_KEY_ID");
        return;
    }
    if(!process.env.AWS_SECRET_ACCESS_KEY){
        errorLog("Cannot upload to S3. Please set environmental variable AWS_SECRET_ACCESS_KEY");
        return;
    }
    infoLog("Uploading " + filePath);
    return gulp.src([filePath]).pipe(s3({
        Bucket: 'quantimodo',
        ACL: 'public-read',
        keyTransform: function(relative_filename) {
            return getS3RelativePath(relative_filename);
        }
    }, {
        maxRetries: 5,
        logger: console
    }));
}
if(argv.clientSecret){process.env.QUANTIMODO_CLIENT_SECRET = argv.clientSecret;}
function prettyJSONStringify(object) {return JSON.stringify(object, null, '\t');}
function execute(command, callback) {
    debugLog('executing ' + command);
    var my_child_process = exec(command, function (error, stdout, stderr) {
        if (error !== null) {errorLog('ERROR: exec ' + error);}
        callback(error, stdout);
    });
    my_child_process.stdout.pipe(process.stdout);
    my_child_process.stderr.pipe(process.stderr);
}
function executeCommand(command, callback) {
    exec(command, function (err, stdout, stderr) {
        infoLog(stdout);
        infoLog(stderr);
        callback(err);
    });
}
function decryptFile(fileToDecryptPath, decryptedFilePath, callback) {
    if (!process.env.ENCRYPTION_SECRET) {
        errorLog('ERROR: Please set ENCRYPTION_SECRET environmental variable!');
        if (callback) {callback();}
        return;
    }
    infoLog('DECRYPTING ' + fileToDecryptPath + ' to ' + decryptedFilePath);
    var cmd = 'openssl aes-256-cbc -k "' + process.env.ENCRYPTION_SECRET + '" -in "' + fileToDecryptPath + '" -d -a -out "' + decryptedFilePath + '"';
    execute(cmd, function (error) {
        if (error !== null) {errorLog('ERROR: DECRYPTING: ' + error);} else {infoLog('DECRYPTED to ' + decryptedFilePath);}
        fs.stat(decryptedFilePath, function (err, stat) {
            if (!err) {
                infoLog(decryptedFilePath + ' exists');
            } else {
                errorLog('Could not decrypt' + fileToDecryptPath);
                errorLog('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
                errorLog(err);
            }
        });
        if (callback) {callback();}
        //outputSHA1ForAndroidKeystore(decryptedFilePath);
    });
}
function encryptFile(fileToEncryptPath, encryptedFilePath, callback) {
    if (!process.env.ENCRYPTION_SECRET) {
        errorLog('ERROR: Please set ENCRYPTION_SECRET environmental variable!');
        return;
    }
    var cmd = 'openssl aes-256-cbc -k "' + process.env.ENCRYPTION_SECRET + '" -in "' + fileToEncryptPath + '" -e -a -out "' + encryptedFilePath + '"';
    //infoLog('executing ' + cmd);
    execute(cmd, function (error) {
        if (error !== null) {
            errorLog('ERROR: ENCRYPTING: ' + error);
            errorLog('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
        } else {
            infoLog('Encrypted ' + encryptedFilePath);
            if (callback) {callback();}
        }
    });
}
function removeCustomPropertiesFromAppSettings(appSettings) {
    for (var propertyName in appSettings.appDesign) {
        if (appSettings.appDesign.hasOwnProperty(propertyName)){
            if(appSettings.appDesign[propertyName]){
                if (appSettings.appDesign[propertyName].type && appSettings.appDesign[propertyName].type === "custom"){
                    appSettings.appDesign[propertyName].active = appSettings.appDesign[propertyName].custom;
                }
                delete appSettings.appDesign[propertyName].custom;
            } else {
                infoLog("Could not find property " + propertyName + " in appDesign");
            }
        }
    }
    return appSettings;
}
function outputSHA1ForAndroidKeystore(decryptedFilePath) {
    if (decryptedFilePath.indexOf('keystore') === -1) {return;}
    var cmd = 'keytool -exportcert -list -v -alias androiddebugkey -keypass android -keystore ' + decryptedFilePath;
    execute(cmd, function (error) {
        if (error !== null) {
            errorLog('ERROR: ENCRYPTING: ' + error);
        } else {
            infoLog('Should have output SHA1 for the production keystore ' + decryptedFilePath);
        }
    });
}
function encryptPrivateConfig(callback) {
    var encryptedFilePath = privateConfigDirectoryPath + process.env.QUANTIMODO_CLIENT_ID + '.private_config.json.enc';
    var fileToEncryptPath = privateConfigDirectoryPath + process.env.QUANTIMODO_CLIENT_ID + '.private_config.json';
    encryptFile(fileToEncryptPath, encryptedFilePath, callback);
}
function ionicUpload(callback) {
    var commandForGit = 'git log -1 HEAD --pretty=format:%s';
    execute(commandForGit, function (error, output) {
        var commitMessage = output.trim();
        var uploadCommand = 'ionic upload --email m@thinkbnumbers.org --password ' + process.env.IONIC_PASSWORD +
            ' --note "' + commitMessage + '" --deploy ' + process.env.RELEASE_STAGE;
        infoLog('ionic upload --note "' + commitMessage + '" --deploy ' + process.env.RELEASE_STAGE);
        //infoLog('\n' + uploadCommand);
        execute(uploadCommand, function (error, uploadOutput) {
            uploadOutput = uploadOutput.trim();
            if (error) {
                errorLog('ERROR: Failed to ionicUpload: ' + uploadOutput + error);
            }
            if (callback) {
                callback();
            }
        });
    });
}
function zipAFolder(folderPath, zipFileName, destinationFolder) {
    infoLog('If this fails, make sure there are no symlinks.');
    return gulp.src([folderPath + '/**/*'])
        .pipe(zip(zipFileName))
        .pipe(gulp.dest(destinationFolder));
}
function resizeIcon(callback, resolution) {
    var outputIconPath = pathToIcons + '/icon_' + resolution + '.png';
    var command = 'convert resources/icon.png -resize ' + resolution + 'x' + resolution + ' ' + outputIconPath;
    return execute(command, function (error) {
        if (error) {
            errorLog("Please install imagemagick in order to resize icons.  The windows version is here: https://sourceforge.net/projects/imagemagick/?source=typ_redirect");
            errorLog('ERROR: ' + JSON.stringify(error));
        }
        uploadAppImagesToS3(outputIconPath);
        callback();
    });
}
function onWindows(callback) {
    if(process.env.OS && process.env.OS.toLowerCase().indexOf('windows') !== -1){
        infoLog("Cannot do this on windows");
        if(callback){callback();}
        return true;
    }
}
function fastlaneSupply(track, callback) {
    if(onWindows(callback)){return;}
    var apk_paths;
    infoLog("If you have problems uploading to Play, promote any alpha releases to beta, disable the alpha channel, and set xwalkMultipleApk to false");
    /** @namespace appSettings.additionalSettings */
    /** @namespace appSettings.additionalSettings.buildSettings.xwalkMultipleApk */
    if(appSettings.additionalSettings.buildSettings.xwalkMultipleApk) {
        apk_paths = pathToReleaseArmv7Apk + ',' + pathToReleasex86Apk;
    } else {
        apk_paths = pathToCombinedReleaseApk;
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
function debugLog(message, object) {if(buildDebug){infoLog(message, object);}}
function infoLog(message, object) {console.log(obfuscateStringify(message, object));}
function errorLog(message, object) {console.error(obfuscateStringify(message, object));}
function postAppStatus() {
    var options = getPostRequestOptions();
    options.body.appStatus = appSettings.appStatus;
    return makeApiRequest(options);
}
function makeApiRequest(options, successHandler) {
    infoLog(options.uri, options);
    return rp(options).then(function (response) {
        infoLog(options.uri + " response", response);
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
    if(!process.env.QUANTIMODO_CLIENT_ID){process.env.QUANTIMODO_CLIENT_ID = "quantimodo";}
    if(!process.env.QUANTIMODO_CLIENT_SECRET  && process.env.ENCRYPTION_SECRET){process.env.QUANTIMODO_CLIENT_SECRET = process.env.ENCRYPTION_SECRET;}
    if(!process.env.QUANTIMODO_CLIENT_SECRET){errorLog( "Please provide clientSecret parameter or set QUANTIMODO_CLIENT_SECRET env");}
    var options = {
        uri: appHostName + path,
        qs: {clientId: process.env.QUANTIMODO_CLIENT_ID, clientSecret: process.env.QUANTIMODO_CLIENT_SECRET},
        headers: {'User-Agent': 'Request-Promise', 'Content-Type': 'application/json'},
        json: true // Automatically parses the JSON string in the response
    };
    //if(devCredentials.username){options.qs.log = devCredentials.username;}
    //if(devCredentials.password){options.qs.pwd = devCredentials.password;}
    if(process.env.QUANTIMODO_ACCESS_TOKEN){
        options.qs.access_token = process.env.QUANTIMODO_ACCESS_TOKEN;
    } else {
        errorLog("Please add your QUANTIMODO_ACCESS_TOKEN environmental variable from " + appHostName + "/api/v2/account");
    }
    infoLog('Making request to ' + options.uri + ' with clientId: ' + process.env.QUANTIMODO_CLIENT_ID);
    return options;
}
function getAppEditUrl() {return getAppsListUrl() + '/' + appSettings.clientId + '/edit';
}
function getAppsListUrl() {
    return appHostName + '/api/v2/apps';
}
function verifyExistenceOfFile(filePath) {
    return fs.stat(filePath, function (err, stat) {
        if (!err) {infoLog(filePath + ' exists');} else {throw 'Could not create ' + filePath + ': '+ err;}
    });
}
function writeToXmlFile(outputFilePath, parsedXmlFile, callback) {
    var builder = new xml2js.Builder();
    var updatedXml = builder.buildObject(parsedXmlFile);
    fs.writeFile(outputFilePath, updatedXml, 'utf8', function (error) {
        if (error) {
            errorLog('ERROR: error writing to xml file', error);
        } else {
            infoLog('Successfully wrote the xml file: ' + updatedXml);
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
    if(err.response.statusCode === 401){throw "Credentials invalid.  Please correct them in " + devCredentialsPath + " and try again.";}
    errorLog(options.uri + " error response", err.response.body);
}
function getFileNameFromUrl(url) {
    return url.split('/').pop();
}
function downloadEncryptedFile(url, outputFileName) {
    var decryptedFilename = getFileNameFromUrl(url).replace('.enc', '');
    var downloadUrl = appHostName + '/api/v2/download?client_id=' + process.env.QUANTIMODO_CLIENT_ID + '&filename=' + encodeURIComponent(url);
    infoLog("Downloading " + downloadUrl + ' to ' + decryptedFilename);
    return request(downloadUrl + '&accessToken=' + process.env.QUANTIMODO_ACCESS_TOKEN)
        .pipe(fs.createWriteStream(outputFileName));
}
function unzipFile(pathToZipFile, pathToOutputFolder) {
    return gulp.src(pathToZipFile)
        .pipe(unzip())
        .pipe(gulp.dest(pathToOutputFolder));
}
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
// Set the default to the build task
gulp.task('default', ['build']);
// Executes taks specified in winPlatforms, linuxPlatforms, or osxPlatforms based on
// the hardware Gulp is running on which are then placed in platformsToBuild
gulp.task('build', ['scripts', 'sass'], function () {
    infoLog("Be sure to setup your system following the instructions at http://taco.visualstudio.com/en-us/docs/tutorial-gulp-readme/#tacoteambuild");
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
gulp.task('createChromeExtensionManifest', function () {
    appSettings.appStatus.buildStatus.chromeExtension = "BUILDING";
    postAppStatus();
    var chromeExtensionManifest = chromeExtensionManifestTemplate;
    chromeExtensionManifest.name = appSettings.appDisplayName;
    chromeExtensionManifest.description = appSettings.appDescription;
    chromeExtensionManifest.version = versionNumbers.ionicApp;
    chromeExtensionManifest.permissions.push("https://*.quantimo.do/*");
    //chromeExtensionManifest.appSettings = appSettings; // I think adding appSettings to the chrome manifest breaks installation
    chromeExtensionManifest = JSON.stringify(chromeExtensionManifest, null, 2);
    var chromeManifestPath = chromeExtensionBuildPath + '/manifest.json';
    infoLog("Creating chrome manifest at " + chromeManifestPath);
    fs.writeFileSync(chromeManifestPath, chromeExtensionManifest);
});
gulp.task('setClientId', function (callback) {setClientId(callback);});
gulp.task('validateCredentials', ['setClientId'], function () {
    var options = getRequestOptions('/api/v1/user');
    fs.writeFileSync(devCredentialsPath, JSON.stringify(devCredentials));  // TODO:  Save QUANTIMODO_ACCESS_TOKEN instead of username and password
    return makeApiRequest(options);
});
gulp.task('downloadIcon', [], function(){
    /** @namespace appSettings.additionalSettings.appImages.appIcon */
    /** @namespace appSettings.additionalSettings.appImages */
    var iconUrl = (appSettings.additionalSettings.appImages.appIcon) ? appSettings.additionalSettings.appImages.appIcon : appSettings.iconUrl;
    infoLog("Downloading icon " + iconUrl);
    return download(iconUrl)
        .pipe(rename('icon.png'))
        .pipe(gulp.dest("./resources"));
});
gulp.task('downloadSplashScreen', [], function(){
    /** @namespace appSettings.additionalSettings.appImages.splashScreen */
    var splashScreen = (appSettings.additionalSettings.appImages.splashScreen) ? appSettings.additionalSettings.appImages.splashScreen : appSettings.splashScreen;
    infoLog("Downloading splash screen " + splashScreen);
    return download(splashScreen)
        .pipe(rename('splash.png'))
        .pipe(gulp.dest("./resources"));
});
gulp.task('mergeToMasterAndTriggerRebuildsForAllApps', [], function(){
    var options = getRequestOptions('/api/ionic/master/merge');
    options.qs.server = options.qs.currentServerConext = currentServerConext;
    return makeApiRequest(options);
});
gulp.task('getAppConfigs', [], function () {
    if(appSettings){
        infoLog("Already have appSettings for " + appSettings.clientId);
        return;
    }
    var options = getRequestOptions('/api/v1/appSettings');
    function sucessHandler(response) {
        appSettings = response.appSettings;
        appSettings.versionNumber = versionNumbers.ionicApp;
        appSettings.debugMode = isTruthy(process.env.APP_DEBUG);
        //appSettings = removeCustomPropertiesFromAppSettings(appSettings);
        if(process.env.APP_HOST_NAME){appSettings.apiUrl = process.env.APP_HOST_NAME.replace("https://", '');}
        if(!response.privateConfig && devCredentials.username && devCredentials.password){
            errorLog("Could not get privateConfig from " + options.uri + ' Please double check your available client ids at '  + getAppsListUrl() + ' ' + appSettings.additionalSettings.companyEmail + " and ask them to make you a collaborator at "  + getAppsListUrl() +  " and run gulp devSetup again.");
        }
        /** @namespace response.privateConfig */
        if(response.privateConfig){
            privateConfig = response.privateConfig;
            fs.writeFileSync(defaultPrivateConfigPath, prettyJSONStringify(privateConfig));
        }
        fs.writeFileSync(defaultAppConfigPath, prettyJSONStringify(appSettings));
        debugLog("Writing to " + defaultAppConfigPath + ": " + prettyJSONStringify(appSettings));
        infoLog("You can change your app settings at " + getAppEditUrl());
        fs.writeFileSync(appConfigDirectoryPath + process.env.QUANTIMODO_CLIENT_ID + ".config.json", prettyJSONStringify(appSettings));
        /** @namespace response.allConfigs */
        if(response.allConfigs){
            for (var i = 0; i < response.allConfigs.length; i++) {
                fs.writeFileSync(appConfigDirectoryPath + response.allConfigs[i].clientId + ".config.json", prettyJSONStringify(response.allConfigs[i]));
            }
        }
    }
    return makeApiRequest(options, sucessHandler);
});
gulp.task('getAndroidReleaseKeystore', ['getAppConfigs'], function () {
    /** @namespace appSettings.additionalSettings.buildSettings.androidReleaseKeystoreFile */
    if(!appSettings.additionalSettings.buildSettings.androidReleaseKeystoreFile){
        throw "Please upload your Android release keystore at " + getAppEditUrl();
    }
    return downloadEncryptedFile(appSettings.additionalSettings.buildSettings.androidReleaseKeystoreFile, "release.keystore");
});
gulp.task('getAndroidDebugKeystore', ['getAppConfigs'], function () {
    if(!appSettings.additionalSettings.buildSettings.androidReleaseKeystoreFile){
        throw "Please upload your Android release keystore at " + getAppEditUrl();
    }
    return downloadEncryptedFile(appSettings.additionalSettings.buildSettings.androidReleaseKeystoreFile, "debug.keystore");
});
gulp.task('getAndroidManifest', ['getAppConfigs'], function () {
    /** @namespace appSettings.additionalSettings.buildSettings.androidMaifestJsonFile */
    if(!appSettings.additionalSettings.buildSettings.androidMaifestJsonFile){
        errorLog("Please add your Android manifest.json at " + getAppEditUrl() + " to enable Google Play Store subscriptions");
    }
    return downloadEncryptedFile(appSettings.additionalSettings.buildSettings.androidMaifestJsonFile, "www/manifest.json");
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
gulp.task('verifyExistenceOfDefaultConfig', function () {
    return verifyExistenceOfFile(defaultAppConfigPath);
});
gulp.task('verifyExistenceOfAndroidX86ReleaseBuild', function () {
    if(appSettings.additionalSettings.buildSettings.xwalkMultipleApk){
        return verifyExistenceOfFile(pathToReleasex86Apk);
    }
});
gulp.task('verifyExistenceOfAndroidArmV7ReleaseBuild', function () {
    if(appSettings.additionalSettings.buildSettings.xwalkMultipleApk){
        return verifyExistenceOfFile(pathToReleaseArmv7Apk);
    }
});
gulp.task('verifyExistenceOfChromeExtension', function () {
    return verifyExistenceOfFile(getPathToChromeExtensionZip());
});
gulp.task('getCommonVariables', function () {
    infoLog('gulp getCommonVariables...');
    return request({url: appHostName + '/api/v1/public/variables?removeAdvancedProperties=true&limit=200&sort=-numberOfUserVariables&numberOfUserVariables=(gt)3', headers: {'User-Agent': 'request'}})
        .pipe(source('commonVariables.json'))
        .pipe(streamify(jeditor(function (commonVariables) {
            return commonVariables;
        })))
        .pipe(gulp.dest('./www/data/'));
});
gulp.task('getSHA1FromAPK', function () {
    infoLog('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
    var cmd = 'keytool -list -printcert -jarfile ' + pathToReleaseArmv7Apk + ' | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64';
    return execute(cmd, function (error) {
        if (error !== null) {errorLog('ERROR: ' + error);} else {infoLog('DECRYPTED to ' + pathToReleaseArmv7Apk);}
    });
});
function outputVersionCodeForApk(pathToApk) {
    if(onWindows()){return;}
    var cmd = '$ANDROID_HOME/build-tools/24.0.2/aapt dump badging ' + circleCIPathToRepo + '/' + pathToApk;
    // aapt dump badging MyAwesomeApplication.apk |grep version
    return execute(cmd, function (error) {
        if (error !== null) {errorLog('ERROR: ' + error);}
    });
}
gulp.task('outputX86ApkVersionCode', function () {
    if(appSettings.additionalSettings.buildSettings.xwalkMultipleApk){
        return outputVersionCodeForApk(pathToReleasex86Apk);
    }
});
gulp.task('outputArmv7ApkVersionCode', function () {
    if(appSettings.additionalSettings.buildSettings.xwalkMultipleApk){
        return outputVersionCodeForApk(pathToReleaseArmv7Apk);
    }
});
gulp.task('outputCombinedApkVersionCode', function () {
    if(!appSettings.additionalSettings.buildSettings.xwalkMultipleApk){
        return outputVersionCodeForApk(pathToReleaseArmv7Apk);
    }
});
gulp.task('default', ['sass']);
gulp.task('unzipChromeExtension', function () {
    return unzipFile(getPathToChromeExtensionZip(), getPathToUnzippedChromeExtension());
});
gulp.task('sass', function (done) {
    gulp.src('./www/scss/app.scss')  // Can't use "return" because gulp doesn't know whether to respect that or the "done" callback
        .pipe(sass({errLogToConsole: true}))
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});
gulp.task('watch', function () {gulp.watch(paths.sass, ['sass']);});
gulp.task('install', ['git-check'], function () {
    return bower.commands.install().on('log', function (data) {gutil.log('bower', gutil.colors.cyan(data.id), data.message);});
});
gulp.task('deleteNodeModules', function () {
    infoLog('If file is locked in Windows, open Resource Monitor as Administrator.  Then go to CPU -> Associated ' +
        'Handles and search for the locked file.  Then right click to kill all the processes using it.  Then try this ' +
        'task again.');
    return gulp.src('node_modules/*', {read: false}).pipe(clean());
});
gulp.task('getDevUsernameFromUserInput', [], function () {
    var deferred = q.defer();
    if(devCredentials.username){
        infoLog("Using username " + devCredentials.username + " from " + devCredentialsPath);
        deferred.resolve();
        return deferred.promise;
    }
    inquirer.prompt([{
        type: 'input', name: 'username', message: 'Please enter your QuantiModo user name or email'
    }], function (answers) {
        devCredentials.username = answers.username.trim();
        deferred.resolve();
    });
    return deferred.promise;
});
gulp.task('getDevPasswordFromUserInput', [], function () {
    var deferred = q.defer();
    if(devCredentials.password){
        infoLog("Using password from " + devCredentialsPath);
        deferred.resolve();
        return deferred.promise;
    }
    inquirer.prompt([{
        type: 'input', name: 'password', message: 'Please enter your QuantiModo password'
    }], function (answers) {
        devCredentials.password = answers.password.trim();
        deferred.resolve();
    });
    return deferred.promise;
});
gulp.task('devSetup', [], function (callback) {
    runSequence(
        'getDevUsernameFromUserInput',
        'getDevPasswordFromUserInput',
        'getClientIdFromUserInput',
        'configureApp',
        'ionicServe',
        callback);
});
gulp.task('getClientIdFromUserInput', function () {
    var deferred = q.defer();
    inquirer.prompt([{
        type: 'input', name: 'clientId', message: 'Please enter the client id obtained at '  + getAppsListUrl()
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
            infoLog('PLEASE UPDATE IT BEFORE UPLOADING');
            deferred.reject();
        }
    });
    return deferred.promise;
});
gulp.task('copyWwwFolderToChromeApp', ['getUpdatedVersion'], function () {
    return gulp.src(['www/**/*'])
        .pipe(gulp.dest('chromeApps/' + process.env.QUANTIMODO_CLIENT_ID + '/www'));
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
        infoLog('Starting getChromeAuthorizationCode');
        inquirer.prompt([{
            type: 'input', name: 'code', message: 'Please Enter the Code Generated from the opened website'
        }], function (answers) {
            code = answers.code;
            code = code.trim();
            infoLog('code: ', code);
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
            errorLog('ERROR: Failed to generate the access code', error);
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
    if(appSettings.additionalSettings.buildSettings.xwalkMultipleApk){
        return uploadBuildToS3(pathToReleasex86Apk);
    }
});
gulp.task("upload-armv7-release-apk-to-s3", function() {
    if(appSettings.additionalSettings.buildSettings.xwalkMultipleApk){
        return uploadBuildToS3(pathToReleaseArmv7Apk);
    }
});
gulp.task("upload-combined-release-apk-to-s3", function() {
    if(!appSettings.additionalSettings.buildSettings.xwalkMultipleApk){
        return uploadBuildToS3(pathToCombinedReleaseApk);
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
    infoLog('Generated URL for upload operation: ', options.url);
    infoLog('The Access Token: Bearer ' + access_token);
    infoLog('UPLOADING. .. .. Please Wait! .. .');
    source.pipe(request(options, function (error, message, data) {
        if (error) {
            errorLog('ERROR: Error in Uploading Data', error);
            deferred.reject();
        } else {
            infoLog('Upload Response Received');
            data = JSON.parse(data);
            /** @namespace data.uploadState */
            if (data.uploadState === 'SUCCESS') {
                infoLog('Uploaded successfully!');
                deferred.resolve();
            } else {
                infoLog('Failed to upload the zip file');
                infoLog(JSON.stringify(data, 0, 2));
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
            infoLog('Ended without publishing!');
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
            errorLog('ERROR: error in publishing to trusted Users', error);
            deferred.reject();
        } else {
            publishResult = JSON.parse(publishResult);
            if (publishResult.status.indexOf('OK') > -1) {
                infoLog('published successfully');
                deferred.resolve();
            } else {
                infoLog('not published');
                infoLog(publishResult);
                deferred.reject();
            }
        }
    });
    return deferred.promise;
});
gulp.task('chrome', ['publishToGoogleAppStore'], function () {infoLog('Enjoy your day!');});
gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        infoLog(
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
            errorLog('ERROR: REMOVING IOS APP: ' + error);
            deferred.reject();
        } else {
            infoLog('\n***PLATFORM REMOVED****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('encryptWwwManifestJson', [], function (callback) {
    var fileToEncryptPath = 'www/manifest.json';
    var encryptedFilePath = 'www/manifest.json.enc';
    encryptFile(fileToEncryptPath, encryptedFilePath, callback);
});
gulp.task('encryptAndroidKeystore', [], function (callback) {
    var fileToEncryptPath = 'quantimodo.keystore';
    var encryptedFilePath = 'quantimodo.keystore.enc';
    encryptFile(fileToEncryptPath, encryptedFilePath, callback);
});
// keytool -genkey -keyalg RSA -alias androiddebugkey -keystore debug.keystore -storepass android -validity 10000 -keysize 2048
gulp.task('encryptAndroidDebugKeystore', [], function (callback) {
    var fileToEncryptPath = 'debug.keystore';
    var encryptedFilePath = 'debug.keystore.enc';
    encryptFile(fileToEncryptPath, encryptedFilePath, callback);
});
gulp.task('decryptAndroidKeystore', [], function (callback) {
    var fileToDecryptPath = 'quantimodo.keystore.enc';
    var decryptedFilePath = 'quantimodo.keystore';
    decryptFile(fileToDecryptPath, decryptedFilePath, callback);
});
gulp.task('decryptWwwManifestJson', [], function (callback) {
    var decryptedFilePath = 'www/manifest.json';
    var fileToDecryptPath = 'www/manifest.json.enc';
    decryptFile(fileToDecryptPath, decryptedFilePath, callback);
});
gulp.task('decryptAndroidDebugKeystore', [], function (callback) {
    var fileToDecryptPath = 'debug.keystore.enc';
    var decryptedFilePath = 'debug.keystore';
    decryptFile(fileToDecryptPath, decryptedFilePath, callback);
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
gulp.task('encryptPrivateConfig', [], function () {
    encryptPrivateConfig();
});
gulp.task('encryptAllPrivateConfigs', [], function () {
    var glob = require('glob');
    glob(privateConfigDirectoryPath + '*.json', {}, function (er, files) {
        infoLog(JSON.stringify(files));
        for (var i = 0; i < files.length; i++) {
            encryptFile(files[i], files[i] + '.enc');
        }
    });
});
gulp.task('decryptAllPrivateConfigs', [], function () {
    var glob = require('glob');
    glob(privateConfigDirectoryPath + '*.enc', {}, function (er, files) {
        infoLog(JSON.stringify(files));
        for (var i = 0; i < files.length; i++) {
            decryptFile(files[i], files[i].replace('.enc', ''));
        }
    });
});
gulp.task('deleteUnusedFiles', function () { //This doesn't seem to make the app any smaller
    var unusedFiles = [
        'www/lib/angular-material/angular-material.js',
        'www/lib/momentjs/min/tests.js',
        'www/lib/moment/min/tests.js',
        'www/lib/angular/angular.js',
        'www/lib/Ionicons/cheatsheet.html',
        'www/lib/ionic/js/ionic.bundle.js',
        'www/lib/highstock-release/highstock.src.js',
        'www/lib/angular-material/angular-material.css',
        'www/lib/highcharts/highcharts.src.js',
        'www/lib/angular-material/layouts/angular-material.layout-attributes.css',
        'www/lib/angular-material/modules/layouts/angular-material.layouts.css',
        'www/lib/angular-material/modules/closure/core/core.css',
        'www/lib/angular-material/modules/js/core/core.css',
        'www/lib/angular-material/layouts/angular-material.layouts.css',
        'www/lib/ionic/js/ionic.js',
        'www/lib/ionic/js/ionic-angular.js',
        'www/lib/d3/d3.js',
        'www/lib/angular-material/CHANGELOG.md'
    ];
    return gulp.src(unusedFiles, {read: false}).pipe(clean());
});
gulp.task('deleteFacebookPlugin', function (callback) {
    infoLog('If this doesn\'t work, just use gulp cleanPlugins');
    executeCommand('cordova plugin rm phonegap-facebook-plugin', callback);
});
gulp.task('deleteGooglePlusPlugin', function (callback) {
    infoLog('If this doesn\'t work, just use gulp cleanPlugins');
    execute('cordova plugin rm cordova-plugin-googleplus', callback);
});
gulp.task('ionicPlatformAddIOS', function (callback) {
    executeCommand('ionic platform add ios', callback);
});
gulp.task('ionicServe', function (callback) {
    infoLog("The app should open in a new browser tab in a few seconds. If it doesn't, run `ionic serve` from the command line in the root of the repository.");
    executeCommand('ionic serve', callback);
});
gulp.task('ionicStateReset', function (callback) {
    executeCommand('ionic state reset', callback);
});
gulp.task('fastlaneSupplyBeta', ['decryptSupplyJsonKeyForGooglePlay'], function (callback) {
    fastlaneSupply('beta', callback);
});
gulp.task('fastlaneSupplyProduction', ['decryptSupplyJsonKeyForGooglePlay'], function (callback) {
    fastlaneSupply('production', callback);
});
gulp.task('ionicResources', function (callback) {
    executeCommand('ionic resources', callback);
});
gulp.task('androidDebugKeystoreInfo', function (callback) {
    infoLog('androidDebugKeystoreInfo gets stuck for some reason');
    callback();
    //executeCommand("keytool -exportcert -list -v -alias androiddebugkey -keystore debug.keystore", callback);
});
gulp.task('gitPull', function () {
    var commandForGit = 'git pull';
    execute(commandForGit, function (error, output) {
        output = output.trim();
        if (error) {
            errorLog('ERROR: Failed to pull: ' + output, error);
        } else {
            infoLog('Pulled changes ' + output);
        }
    });
});
gulp.task('gitCheckoutAppJs', function () {
    var commandForGit = 'git checkout -- www/js/app.js';
    execute(commandForGit, function (error, output) {
        output = output.trim();
        if (error) {
            errorLog('ERROR: Failed to gitCheckoutAppJs: ' + output, error);
        } else {
            infoLog('gitCheckoutAppJs ' + output);
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
                errorLog('ERROR: THERE WAS AN ERROR:ADDING THE FACEBOOK PLUGIN***', error);
                deferred.reject();
            } else {
                infoLog('\n***FACEBOOK PLUGIN SUCCESSFULLY ADDED***');
                deferred.resolve();
            }
        });
    };
    fs.exists('../fbplugin', function (exists) {
        if (exists) {
            infoLog('FACEBOOK REPO ALREADY CLONED');
            addFacebookPlugin();
        } else {
            infoLog('FACEBOOK REPO NOT FOUND, CLONING https://github.com/Wizcorp/phonegap-facebook-plugin.git NOW');
            var commands = [
                'cd ../',
                'mkdir fbplugin',
                'cd fbplugin',
                'GIT_CURL_VERBOSE=1 GIT_TRACE=1 git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git'
            ].join(' && ');
            /*			//Try this if you get the muliple dex file error still
             infoLog("FACEBOOK REPO NOT FOUND, CLONING https://github.com/Telerik-Verified-Plugins/Facebook.git NOW");
             var commands = [
             "cd ../",
             "mkdir fbplugin",
             "cd fbplugin",
             "GIT_CURL_VERBOSE=1 GIT_TRACE=1 git clone https://github.com/Telerik-Verified-Plugins/Facebook.git"
             ].join(' && ');
             */
            execute(commands, function (error) {
                if (error !== null) {
                    errorLog('ERROR: THERE WAS AN ERROR:DOWNLOADING THE FACEBOOK PLUGIN***', error);
                    deferred.reject();
                } else {
                    infoLog('\n***FACEBOOK PLUGIN DOWNLOADED, NOW ADDING IT TO IONIC PROJECT***');
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
        infoLog('No REVERSED_CLIENT_ID env specified. Falling back to ' + process.env.REVERSED_CLIENT_ID);
    }
    var commands = [
        'cordova -d plugin add https://github.com/mikepsinn/cordova-plugin-googleplus.git#89ac9f2e8d521bacaaf3989a22b50e4d0b5d6d09',
        'REVERSED_CLIENT_ID="' + process.env.REVERSED_CLIENT_ID + '"'
    ].join(' --variable ');
    execute(commands, function (error) {
        if (error !== null) {
            errorLog('ERROR: ADDING THE GOOGLE PLUS PLUGIN***', error);
            deferred.reject();
        } else {
            infoLog('\n***GOOGLE PLUS PLUGIN ADDED****');
            deferred.resolve();
        }
    });
    return deferred.promise;
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
        infoLog('Updated facebook.com');
        var fbcdnDotNet = {};
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net']) {fbcdnDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net'];}
        if (!fbcdnDotNet.NSIncludesSubdomains) {fbcdnDotNet.NSIncludesSubdomains = true;}
        if (!fbcdnDotNet.NSThirdPartyExceptionRequiresForwardSecrecy) {fbcdnDotNet.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net'] = fbcdnDotNet;
        infoLog('Updated fbcdn.net');
        // akamaihd.net
        var akamaihdDotNet = {};
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net']) {
            akamaihdDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net'];
        }
        if (!akamaihdDotNet.NSIncludesSubdomains) {akamaihdDotNet.NSIncludesSubdomains = true;}
        if (!akamaihdDotNet.NSThirdPartyExceptionRequiresForwardSecrecy) {akamaihdDotNet.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net'] = akamaihdDotNet;
        infoLog('Updated akamaihd.net');
    }
    fs.writeFile('platforms/ios/' + appSettings.appDisplayName + '/' + appSettings.appDisplayName + '-Info.plist', plist.build(myPlist), 'utf8', function (err) {
        if (err) {
            errorLog('ERROR: error writing to plist', err);
            deferred.reject();
        } else {
            infoLog('successfully updated plist');
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
                infoLog('no Bugsnag detected');
                gulp.src('./platforms/ios/Podfile')
                    .pipe(change(function (content) {
                        var bugsnag_str = 'target \'' + appSettings.appDisplayName + '\' do \npod \'Bugsnag\', :git => "https://github.com/bugsnag/bugsnag-cocoa.git"';
                        infoLog('Bugsnag Added to Podfile');
                        deferred.resolve();
                        return content.replace(/target.*/g, bugsnag_str);
                    }))
                    .pipe(gulp.dest('./platforms/ios/'));
            } else {
                infoLog('Bugsnag already present in Podfile');
                deferred.resolve();
            }
        });
    };
    fs.exists('./platforms/ios/Podfile', function (exists) {
        if (exists) {
            infoLog('Podfile');
            addBugsnagToPodfile();
        } else {
            infoLog('PODFILE REPO NOT FOUND, Installing it First');
            var commands = [
                'cd ./platforms/ios',
                'pod init'
            ].join(' && ');
            execute(commands, function (error) {
                if (error !== null) {
                    errorLog('ERROR: There was an error detected', error);
                    deferred.reject();
                } else {
                    infoLog('\n***Podfile Added****');
                    addBugsnagToPodfile();
                }
            });
        }
    });
    return deferred.promise;
});
gulp.task('addInheritedToOtherLinkerFlags', function () {
    if (!appSettings.appDisplayName) {infoLog('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            return content.replace(/OTHER_LDFLAGS(\s+)?=(\s+)?(\s+)\(/g, 'OTHER_LDFLAGS = (\n\t\t\t\t\t"$(inherited)",');
        }))
        .pipe(gulp.dest('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/'));
});
gulp.task('addDeploymentTarget', function () {
    if (!appSettings.appDisplayName) {infoLog('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            if (content.indexOf('IPHONEOS_DEPLOYMENT_TARGET') === -1) {
                return content.replace(/ENABLE_BITCODE(\s+)?=(\s+)?(\s+)NO\;/g, 'IPHONEOS_DEPLOYMENT_TARGET = 6.0;\ENABLE_BITCODE = NO;');
            }
            return content;
        }))
        .pipe(change(function (content) {
            infoLog('*****************\n\n\n', content, '\n\n\n*****************');
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
            errorLog('ERROR: There was an error detected', error);
            deferred.reject();
        } else {
            infoLog('\n***Pods Installed****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('addBugsnagInObjC', function () {
    if (!appSettings.appDisplayName) {infoLog('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '/Classes/AppDelegate.m')
        .pipe(change(function (content) {
            if (content.indexOf('Bugsnag') !== -1) {
                infoLog('Bugsnag Already Present');
                return content;
            } else {
                content = content.replace(/#import "MainViewController.h"/g, '#import "MainViewController.h"\n#import "Bugsnag.h"');
                content = content.replace(/self\.window\.rootViewController(\s)?=(\s)?self\.viewController\;/g, '[Bugsnag startBugsnagWithApiKey:@"ae7bc49d1285848342342bb5c321a2cf"];\n\tself.window.rootViewController = self.viewController;');
                infoLog('Bugsnag Added');
            }
            return content;
        }))
        .pipe(gulp.dest('./platforms/ios/' + appSettings.appDisplayName + '/Classes/'));
});
gulp.task('enableBitCode', function () {
    if (!appSettings.appDisplayName) {infoLog('Please export appSettings.appDisplayName');}
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
    return replaceTextInFiles(['www/index.html'], commentedCordovaScript, uncommentedCordovaScript);
});
gulp.task('removeCordovaJsFromIndexHtml', function () {
    return replaceTextInFiles(['www/index.html'], uncommentedCordovaScript, commentedCordovaScript);
});
gulp.task('setVersionNumberInFiles', function () {
    var filesToUpdate = [
        defaultAppConfigPath,
        '.travis.yml',
        'resources/chrome_app/manifest.json'
    ];
    return gulp.src(filesToUpdate, {base: '.'}) // Every file allown.
        .pipe(replace('IONIC_IOS_APP_VERSION_NUMBER_PLACEHOLDER', versionNumbers.iosCFBundleVersion))
        .pipe(replace('IONIC_APP_VERSION_NUMBER_PLACEHOLDER', versionNumbers.ionicApp))
        .pipe(gulp.dest('./'));
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
    return gulp.src('resources/*', {read: false}).pipe(clean());
});
gulp.task('cleanPlugins', [], function () {
    return gulp.src('plugins', {read: false}).pipe(clean());
});
gulp.task('cleanPlatformsAndroid', [], function () {
    return gulp.src('platforms/android', {read: false}).pipe(clean());
});
gulp.task('cleanPlatforms', [], function () {
    return gulp.src('platforms', {read: false}).pipe(clean());
});
gulp.task('cleanChromeBuildFolder', [], function () {
    return gulp.src(chromeExtensionBuildPath + '/*', {read: false}).pipe(clean());
});
gulp.task('cleanBuildFolder', [], function () {
    return gulp.src(buildPath + '/*', {read: false}).pipe(clean());
});
gulp.task('copyAppResources', ['cleanResources'], function () {
    infoLog('If this doesn\'t work, make sure there are no symlinks in the apps folder!');
    return gulp.src(['apps/' + process.env.QUANTIMODO_CLIENT_ID + '/**/*'], {
        base: 'apps/' + process.env.QUANTIMODO_CLIENT_ID
    }).pipe(gulp.dest('.'));
});
gulp.task('copyIconsToWwwImg', [], function () {
    return gulp.src(['apps/' + process.env.QUANTIMODO_CLIENT_ID + '/resources/icon*.png'])
        .pipe(gulp.dest(pathToIcons));
});
gulp.task('copyAndroidLicenses', [], function () {
    if(!process.env.ANDROID_HOME){
        errorLog("Please pass ANDROID_HOME environmental variable to gulp task");
        return;
    }
    return gulp.src(['android-licenses/*'])
        .pipe(gulp.dest(process.env.ANDROID_HOME + '/licenses'));
});
gulp.task('copyAndroidResources', [], function () {
    return gulp.src(['resources/android/**/*'])
        .pipe(gulp.dest('platforms/android'));
});
gulp.task('copyAndroidBuild', [], function () {
    if (!process.env.QUANTIMODO_CLIENT_ID) {throw 'process.env.QUANTIMODO_CLIENT_ID not set!';}
    var buildFolderPath = buildPath + '/apks/' + process.env.QUANTIMODO_CLIENT_ID; // Non-symlinked apk build folder accessible by Jenkins within Vagrant box
    infoLog('Copying from ' + pathToOutputApks + ' to ' + buildFolderPath);
    return gulp.src([pathToOutputApks + '/*.apk']).pipe(gulp.dest(buildFolderPath));
});
gulp.task('copyIonicCloudLibrary', [], function () {
    return gulp.src(['node_modules/@ionic/cloud/dist/bundle/ionic.cloud.min.js']).pipe(gulp.dest('www/lib'));
});
gulp.task('copyWwwFolderToChromeExtension', [], function () {
    return gulp.src(['www/**/*'])
        .pipe(gulp.dest(chromeExtensionBuildPath + '/www'));
});
gulp.task('copyIconsToChromeExtension', [], function () {
    return gulp.src([pathToIcons + "/*"])
        .pipe(gulp.dest(chromeExtensionBuildPath + '/' + pathToIcons));
});
gulp.task('removeTransparentPng', [], function () {
    return gulp.src('resources/icon.png', {read: false}).pipe(clean());
});
gulp.task('removeTransparentPsd', [], function () {
    return gulp.src('resources/icon.psd', {read: false}).pipe(clean());
});
gulp.task('useWhiteIcon', [], function () {
    return gulp.src('./resources/icon_white.png')
        .pipe(rename('icon.png'))
        .pipe(gulp.dest('resources'));
});
gulp.task('bowerInstall', [], function (callback) {
    return execute('bower install', function (error) {
        if (error !== null) {
            errorLog('ERROR:' + error);
        } else {
            callback();
        }
    });
});
gulp.task('ionicResourcesIos', [], function (callback) {
    return execute('ionic resources ios', function (error) {
        if (error !== null) {
            errorLog('ERROR:GENERATING iOS RESOURCES for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            infoLog('\n***iOS RESOURCES GENERATED for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
function addAppSettingsToParsedConfigXml(parsedXmlFile) {
    parsedXmlFile.widget.name[0] = appSettings.appDisplayName;
    parsedXmlFile.widget.description[0] = appSettings.appDescription;
    parsedXmlFile.widget.$.id = appSettings.additionalSettings.appIds.appIdentifier;
    parsedXmlFile.widget.preference.push({$: {name: "xwalkMultipleApk",
        value: (appSettings.additionalSettings.buildSettings.xwalkMultipleApk) ? true : false}});
    return parsedXmlFile;
}
gulp.task('generateConfigXmlFromTemplate', ['setClientId', 'getAppConfigs'], function (callback) {
    generateConfigXmlFromTemplate(callback);
});
function generateConfigXmlFromTemplate(callback) {
    //var configXmlPath = 'config-template-' + platformCurrentlyBuildingFor + '.xml';
    var configXmlPath = 'config-template-shared.xml';
    var xml = fs.readFileSync(configXmlPath, 'utf8');
    /** @namespace appSettings.additionalSettings.appIds.googleReversedClientId */
    if (appSettings.additionalSettings.appIds.googleReversedClientId) {
        xml = xml.replace('REVERSED_CLIENT_ID_PLACEHOLDER', appSettings.additionalSettings.appIds.googleReversedClientId);
    }
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
gulp.task('prepareIosAppIfEnvIsSet', function (callback) {
    if (!process.env.PREPARE_IOS_APP) {
        infoLog('process.env.PREPARE_IOS_APP not true, so not preparing iOS app');
        callback();
        return;
    }
    infoLog('process.env.PREPARE_IOS_APP is true, so going to prepareIosApp');
    runSequence(
        'prepareIosApp',
        callback);
});
gulp.task('prepareIosApp', function (callback) {
    platformCurrentlyBuildingFor = 'ios';
    runSequence(
        'cleanPlugins',
        'configureApp',
        'copyAppResources',
        'uncommentCordovaJsInIndexHtml',
        'generateConfigXmlFromTemplate', // Needs to happen before resource generation so icon paths are not overwritten
        'removeTransparentPng',
        'removeTransparentPsd',
        'useWhiteIcon',
        'ionicResourcesIos',
        'copyIconsToWwwImg',
        callback);
});
gulp.task('symlinkWwwFolderInChromeExtension', [], function () {
    return gulp.src(['www/**/*'])
        .pipe(gulp.dest(chromeExtensionBuildPath + '/www'));
});
gulp.task('removeFacebookFromChromeExtension', [], function () {
    return gulp.src(chromeExtensionBuildPath + '/www/lib/phonegap-facebook-plugin/*',
        {read: false})
        .pipe(clean());
});
gulp.task('removeAndroidManifestFromChromeExtension', [], function () {
    return gulp.src(chromeExtensionBuildPath + '/www/manifest.json',
        {read: false})
        .pipe(clean());
});
gulp.task('zipChromeExtension', [], function () {
    return zipAFolder(chromeExtensionBuildPath, getChromeExtensionZipFilename(), buildPath);
});
// Need configureAppAfterNpmInstall or prepareIosApp results in infinite loop
gulp.task('configureAppAfterNpmInstall', [], function (callback) {
    infoLog('gulp configureAppAfterNpmInstall');
    if (process.env.BUDDYBUILD_SCHEME) {
        infoLog('BUDDYBUILD_SCHEME is ' + process.env.BUDDYBUILD_SCHEME + ' so going to prepareIosApp');
        runSequence(
            'prepareIosApp',
            callback);
    } else if (process.env.BUDDYBUILD_SECURE_FILES) {
        infoLog('Building Android because BUDDYBUILD_SCHEME is not set and we know we\'re on BuddyBuild because BUDDYBUILD_SECURE_FILES is set to: ' + process.env.BUDDYBUILD_SECURE_FILES);
        runSequence(
            'prepareRepositoryForAndroid',
            'prepareAndroidApp',
            //'buildQuantiModoAndroid',  // Had to do this previously because buildAndroid wasn't working
            callback);
    } else {
        runSequence(
            'configureApp',
            callback);
    }
});
gulp.task('configureApp', [], function (callback) {
    infoLog('gulp configureApp');
    runSequence(
        'setClientId',
        'sass',
        'getCommonVariables',
        'getAppConfigs',
        'downloadIcon',
        'downloadSplashScreen',
        'verifyExistenceOfDefaultConfig',
        'copyIconsToWwwImg',
        'setVersionNumberInFiles',
        callback);
});
gulp.task('configureWebApp', [], function (callback) {
    infoLog('gulp configureApp');
    runSequence(
        'configureApp',
        'removeCordovaJsFromIndexHtml',
        callback);
});
gulp.task('configureDefaultApp', [], function (callback) {
    process.env.QUANTIMODO_CLIENT_ID = 'your_quantimodo_client_id_here';
    runSequence(
        'copyAppResources',
        'getAppConfigs',
        callback);
});
gulp.task('buildChromeExtensionWithoutCleaning', [], function (callback) {
    runSequence(
        'configureWebApp',
        'resizeIcons',
        'copyIconsToChromeExtension',
        'createChromeExtensionManifest',
        'removeFacebookFromChromeExtension',
        'removeAndroidManifestFromChromeExtension',
        'zipChromeExtension',
        'unzipChromeExtension',
        'validateChromeManifest',
        'upload-chrome-extension-to-s3',
        'post-app-status',
        callback);
});
gulp.task('buildChromeExtension', [], function (callback) {
    runSequence(
        'prepareRepoForChromeExtension',
        'buildChromeExtensionWithoutCleaning',
        callback);
});
gulp.task('prepareRepoForChromeExtension', [], function (callback) {
    runSequence(
        'cleanChromeBuildFolder',
        'copyWwwFolderToChromeExtension',  //Can't use symlinks
        'removeFacebookFromChromeExtension',
        'removeAndroidManifestFromChromeExtension',
        callback);
});
gulp.task('prepareQuantiModoChromeExtension', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'buildChromeExtension',
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
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        'prepareIosApp',
        callback);
});
gulp.task('buildQuantiModoAndroid', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        callback);
});
gulp.task('buildMediModoAndroid', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        callback);
});
gulp.task('buildAllChromeExtensions', function (callback) {
    runSequence(
        'cleanBuildFolder',
        'setMediModoEnvs',
        'buildChromeExtension',
        'setMoodiModoEnvs',
        'buildChromeExtension',
        'setQuantiModoEnvs',
        'buildChromeExtension',
        callback);
});
gulp.task('buildAllChromeExtensionsAndAndroidApps', function (callback) {
    runSequence(
        'cleanBuildFolder',
        'prepareRepositoryForAndroid',
        'prepareRepoForChromeExtension',
        'setMediModoEnvs',
        'buildChromeExtensionWithoutCleaning',
        'buildAndroidApp',
        'setMoodiModoEnvs',
        'buildChromeExtensionWithoutCleaning',
        'buildAndroidApp',
        'setQuantiModoEnvs',
        'buildChromeExtensionWithoutCleaning',
        'buildAndroidApp',
        callback);
});
gulp.task('buildQuantiModoChromeExtension', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
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
    return execute(command, function (error) {
        if (error !== null) {
            errorLog('ERROR: for ' + command + 'for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            infoLog('\n***' + command + ' for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('xcodeProjectFix', function (callback) {
    var command = 'ruby hooks/after_platform_add.bak/xcodeprojectfix.rb';
    return execute(command, function (error) {
        if (error !== null) {
            errorLog('ERROR: for ' + command + 'for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            infoLog('\n***' + command + ' for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('ionicPlatformAddAndroid', function (callback) {
    infoLog('ionic platform add android@6.1.0');
    return execute('ionic platform add android@6.1.0', function (error) {
        if (error !== null) {
            errorLog('ERROR: for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            infoLog('\n***Android for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('ionicPlatformRemoveAndroid', function (callback) {
    return execute('ionic platform remove android', function (error) {
        if (error !== null) {
            errorLog('ERROR: for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            infoLog('\n***Android for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('cordovaBuildAndroidDebug', function (callback) {
    if(buildDebug){
        appSettings.appStatus.buildStatus[convertFilePathToPropertyName(androidArm7DebugApkName)] = "BUILDING";
        appSettings.appStatus.buildStatus[convertFilePathToPropertyName(androidX86DebugApkName)] = "BUILDING";
        postAppStatus();
        return execute(getCordovaBuildCommand('debug', 'android'), function (error) {
            if (error !== null) {
                errorLog('ERROR: for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
            } else {
                infoLog('\n***Android for ' + process.env.QUANTIMODO_CLIENT_ID);
                callback();
            }
        });
    } else {
        console.log("Not building debug version because process.env.BUILD_DEBUG is not true");
        callback();
    }
});
function getCordovaBuildCommand(releaseStage, platform) {
    var command = 'cordova build --' + releaseStage + ' ' + platform;
    if(buildDebug){command += " --verbose";}
    return command;
}
gulp.task('cordovaBuildAndroidRelease', function (callback) {
    appSettings.appStatus.buildStatus[convertFilePathToPropertyName(androidArm7ReleaseApkName)] = "BUILDING";
    appSettings.appStatus.buildStatus[convertFilePathToPropertyName(androidX86ReleaseApkName)] = "BUILDING";
    postAppStatus();
    return execute(getCordovaBuildCommand('release', 'android'), function (error) {
        if (error !== null) {
            errorLog('ERROR: for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            infoLog('\n***Android for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('prepareQuantiModoIos', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'prepareIosApp',
        callback);
});
gulp.task('generateAndroidResources', [], function (callback) {
    return execute('ionic resources android', function (error) {
        if (error !== null) {
            errorLog('ERROR: GENERATING Android RESOURCES for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            infoLog('\n***Android RESOURCES GENERATED for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('ionicRunAndroid', [], function (callback) {
    return execute('ionic run android', function (error) {
        if (error !== null) {
            errorLog('ERROR: GENERATING Android RESOURCES for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            infoLog('\n***Android RESOURCES GENERATED for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
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
        'setAppEnvs',
        'uncommentCordovaJsInIndexHtml',
        'generateConfigXmlFromTemplate',  // Must be run before addGooglePlusPlugin or running any other cordova commands
        'cleanPlatforms',
        'cleanPlugins',
        'ionicPlatformAddAndroid',
        'decryptAndroidKeystore',
        'decryptAndroidDebugKeystore',
        //'androidDebugKeystoreInfo',
        //'deleteGooglePlusPlugin',  This breaks flow if plugin is not present.  Can't get it to continue on error.  However, cleanPlugins should already do this
        //'addGooglePlusPlugin',
        //'ionicPlatformRemoveAndroid', // This is necessary because the platform version will not necessarily be set to 6.1.0 otherwise (it will just follow platforms.json
        'ionicAddCrosswalk',
        'ionicInfo',
        callback);
});
gulp.task('prepareRepositoryForAndroidWithoutCleaning', function (callback) {
    platformCurrentlyBuildingFor = 'android';
    runSequence(
        'setAppEnvs',
        'generateConfigXmlFromTemplate',  // Must be run before addGooglePlusPlugin or running any other cordova commands
        'ionicPlatformAddAndroid',
        'decryptAndroidKeystore',
        'decryptAndroidDebugKeystore',
        //'androidDebugKeystoreInfo',
        //'deleteGooglePlusPlugin',  This breaks flow if plugin is not present.  Can't get it to continue on error.  However, cleanPlugins should already do this
        //'addGooglePlusPlugin',
        //'ionicPlatformRemoveAndroid', // This is necessary because the platform version will not necessarily be set to 6.1.0 otherwise (it will just follow platforms.json
        'ionicAddCrosswalk',
        'ionicInfo',
        callback);
});
gulp.task('prepareAndroidApp', function (callback) {
    platformCurrentlyBuildingFor = 'android';
    runSequence(
        'configureApp',
        'copyAppResources',
        'generateConfigXmlFromTemplate',
        'cordovaPlatformVersionAndroid',
        'decryptBuildJson',
        'decryptWwwManifestJson',
        'decryptAndroidKeystore',
        'generateAndroidResources',
        'copyAndroidResources',
        'copyIconsToWwwImg',
        callback);
});
gulp.task('buildAndroidApp', function (callback) {
    runSequence(
        'copyAndroidLicenses',
        'prepareAndroidApp',
        'cordovaBuildAndroidRelease',
        'outputArmv7ApkVersionCode',
        'outputX86ApkVersionCode',
        'outputCombinedApkVersionCode',
        'cordovaBuildAndroidDebug',
        //'copyAndroidBuild',
        "upload-x86-release-apk-to-s3",
        "upload-armv7-release-apk-to-s3",
        "upload-combined-release-apk-to-s3",
        "fastlaneSupplyBeta",
        "post-app-status",
        callback);
});
gulp.task('prepareQuantiModoAndroid', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'prepareAndroidApp',
        callback);
});
