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
var git = require('gulp-git'),
    jeditor = require('gulp-json-editor'),
    source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify');
var directoryMap = require('gulp-directory-map');
var argv = require('yargs').argv;
var exec = require('child_process').exec;
var rp = require('request-promise');
var appIds = {
    'moodimodo': 'homaagppbekhjkalcndpojiagijaiefm',
    'mindfirst': 'jeadacoeabffebaeikfdpjgpjbjinobl',
    'energymodo': 'aibgaobhplpnjmcnnmdamabfjnbgflob',
    'quantimodo': true,
    'medimodo': true
};
var appSettings, privateConfig, devCredentials;
var privateConfigDirectoryPath = './www/private_configs/';
var appConfigDirectoryPath = './www/configs/';
var defaultPrivateConfigPath = privateConfigDirectoryPath + 'default.private_config.json';
var devCredentialsPath = privateConfigDirectoryPath + 'dev-credentials.json';
var defaultAppConfigPath = appConfigDirectoryPath + 'default.config.json';
try{
    devCredentials = JSON.parse(fs.readFileSync(devCredentialsPath));
    console.log("Using dev credentials from " + devCredentialsPath + ". This file is ignored in .gitignore and should never be committed to any repository.");
} catch (error){
    console.log('No existing dev credentials found');
    devCredentials = {};
}

var chromeExtensionManifestTemplate = {
    'manifest_version': 2,
    'options_page': 'www/chrome_extension/options/options.html',
    'icons': {
        '16': 'www/img/icons/icon_16.png',
        '48': 'www/img/icons/icon_48.png',
        '128': 'www/img/icons/icon_128.png'
    },
    'permissions': [
        'alarms',
        'notifications',
        'storage',
        'tabs'
    ],
    'browser_action': {
        'default_icon': 'www/img/icons/icon_700.png',
        'default_popup': 'www/templates/chrome/iframe.html'
    },
    'background': {
        'scripts': ['www/js/chrome/background.js'],
        'persistent': false
    }
};
var paths = {
    sass: ['./www/scss/**/*.scss']
};
var date = new Date();
var longDate = date.getFullYear().toString() + (date.getMonth() + 1).toString() + date.getDate().toString();
var monthNumber = (date.getMonth() + 1).toString();
var dayOfMonth = ('0' + date.getDate()).slice(-2);
var majorMinorVersionNumbers = '2.6.';
var patchVersionNumber = monthNumber + dayOfMonth;
if (!process.env.IONIC_IOS_APP_VERSION_NUMBER) {
    process.env.IONIC_IOS_APP_VERSION_NUMBER = majorMinorVersionNumbers + patchVersionNumber + '.0';
    process.env.IONIC_APP_VERSION_NUMBER = majorMinorVersionNumbers + patchVersionNumber;
    console.log('Falling back to IONIC_IOS_APP_VERSION_NUMBER ' + process.env.IONIC_IOS_APP_VERSION_NUMBER);
}
process.env.DEBUG_MODE = (process.env.DEBUG_MODE) ? process.env.DEBUG_MODE : true;
if(argv.clientId){process.env.QUANTIMODO_CLIENT_ID = argv.clientId;}
if(argv.clientSecret){process.env.QUANTIMODO_CLIENT_SECRET = argv.clientSecret;}

function prettyJSONStringify(object) {return JSON.stringify(object, null, '\t');}
function setLowerCaseAppName(callback) {
    if (!process.env.QUANTIMODO_CLIENT_ID) {
        git.revParse({args: '--abbrev-ref HEAD'}, function (err, branch) {
            console.log('current git branch: ' + branch);
            if (!process.env.QUANTIMODO_CLIENT_ID) {
                if (appIds[branch]) {
                    console.info('Setting process.env.QUANTIMODO_CLIENT_ID using branch name ' + branch);
                    process.env.QUANTIMODO_CLIENT_ID = branch;
                } else {
                    process.env.DEBUG_MODE = true;
                    console.warn('No process.env.QUANTIMODO_CLIENT_ID set.  Falling back to default QuantiModo configuration variables');
                    process.env.QUANTIMODO_CLIENT_ID = 'quantimodo';
                }
            }
            if (callback) {callback();}
        });
    } else {
        if (callback) {callback();}
    }
}
function execute(command, callback) {
    if (process.env.DEBUG_MODE) {console.log('executing ' + command);}
    var my_child_process = exec(command, function (error, stdout, stderr) {
        if (error !== null) {console.error('ERROR: exec ' + error);}
        callback(error, stdout);
    });
    my_child_process.stdout.pipe(process.stdout);
    my_child_process.stderr.pipe(process.stderr);
}

gulp.task('createChromeExtensionManifest', function () {
    var chromeExtensionManifest = chromeExtensionManifestTemplate;
    chromeExtensionManifest.name = appSettings.appDisplayName;
    chromeExtensionManifest.description = appSettings.appDescription;
    chromeExtensionManifest.version = process.env.IONIC_APP_VERSION_NUMBER;
    chromeExtensionManifest.permissions.push("https://" + appSettings.clientId + '.quantimo.do/*');
    chromeExtensionManifest.appSettings = appSettings;
    fs.writeFileSync('build/chrome_extension/manifest.json', JSON.stringify(chromeExtensionManifest));
});
gulp.task('setLowerCaseAppName', function (callback) {setLowerCaseAppName(callback);});
function removeCustomPropertiesFromAppSettings(appSettings) {
    for (var propertyName in appSettings.appDesign) {
        if (appSettings.appDesign.hasOwnProperty(propertyName)){
            if(appSettings.appDesign[propertyName]){
                if (appSettings.appDesign[propertyName].type && appSettings.appDesign[propertyName].type === "custom"){
                    appSettings.appDesign[propertyName].active = appSettings.appDesign[propertyName].custom;
                }
                delete appSettings.appDesign[propertyName].custom;
            } else {
                console.log("Could not find property " + propertyName + " in appDesign");
            }
        }
    }
    return appSettings;
}

gulp.task('validateCredentials', function () {
    if(!devCredentials.username || !devCredentials.password){
        console.error("No developer credentials");
        return;
    }
    var options = {
        uri: 'https://app.quantimo.do/api/v1/user',
        qs: {log: devCredentials.username, pwd: devCredentials.password},
        headers: {'User-Agent': 'Request-Promise'},
        json: true // Automatically parses the JSON string in the response
    };
    fs.writeFileSync(devCredentialsPath, JSON.stringify(devCredentials));
    console.log('gulp getAppConfigs from ' + options.uri + ' with clientId: ' + process.env.QUANTIMODO_CLIENT_ID);
    return rp(options).then(function (response) {
        if(!response.accessToken){throw "Could not get user from " + options.uri + ' Please double check your credentials or contact mike@quantimo.do for help.';}
    }).catch(function (err) {
        console.error(err.message);
        if(err.response.statusCode === 401){throw "Credentials invalid.  Please correct them in " + devCredentialsPath + " and try again.";}
    });
});

gulp.task('getAppConfigs', ['validateCredentials'], function () {
    if(!process.env.QUANTIMODO_CLIENT_ID){process.env.QUANTIMODO_CLIENT_ID = "quantimodo";}
    if(!process.env.QUANTIMODO_CLIENT_SECRET  && process.env.ENCRYPTION_SECRET){process.env.QUANTIMODO_CLIENT_SECRET = process.env.ENCRYPTION_SECRET;}
    if(!process.env.QUANTIMODO_CLIENT_SECRET){console.error( "Please provide clientSecret parameter or set QUANTIMODO_CLIENT_SECRET env");}
    var options = {
        uri: 'https://app.quantimo.do/api/v1/appSettings',
        qs: {clientId: process.env.QUANTIMODO_CLIENT_ID, clientSecret: process.env.QUANTIMODO_CLIENT_SECRET},
        headers: {'User-Agent': 'Request-Promise'},
        json: true // Automatically parses the JSON string in the response
    };
    if(devCredentials.username){options.log = devCredentials.username;}
    if(devCredentials.password){options.pwd = devCredentials.password;}
    console.log('gulp getAppConfigs from ' + options.uri + ' with clientId: ' + process.env.QUANTIMODO_CLIENT_ID);
    return rp(options).then(function (response) {
        appSettings = response.appSettings;
        //appSettings = removeCustomPropertiesFromAppSettings(appSettings);
        if(!response.privateConfig && devCredentials.username && devCredentials.password){
            console.error("Could not get privateConfig from " + options.uri + ' Please double check your available client ids at https://app.quantimo.do/api/v2/apps ' + appSettings.additionalSettings.companyEmail + " and ask them to make you a collaborator at https://app.quantimo.do/api/v2/apps and run gulp devSetup again.");
        }
        if(response.privateConfig){
            privateConfig = response.privateConfig;
            fs.writeFileSync(defaultPrivateConfigPath, prettyJSONStringify(privateConfig));
        }
        fs.writeFileSync(defaultAppConfigPath, prettyJSONStringify(appSettings));
        fs.writeFileSync(appConfigDirectoryPath + process.env.QUANTIMODO_CLIENT_ID + ".config.json", prettyJSONStringify(appSettings));
        if(response.allConfigs){
            for (var i = 0; i < response.allConfigs.length; i++) {
                fs.writeFileSync(appConfigDirectoryPath + response.allConfigs[i].clientId + ".config.json", prettyJSONStringify(response.allConfigs[i]));
            }
        }
    }).catch(function (err) {
        throw err;
    });
});
gulp.task('verifyExistenceOfDefaultConfig', function () {
    fs.stat(defaultAppConfigPath, function (err, stat) {
        if (!err) {console.log(defaultAppConfigPath + ' exists');} else {throw 'Could not create ' + defaultAppConfigPath + ': '+ err;}
    });
});
gulp.task('getCommonVariables', function () {
    console.log('gulp getCommonVariables...');
    return request({url: 'https://app.quantimo.do/api/v1/public/variables?removeAdvancedProperties=true&limit=200&sort=-numberOfUserVariables&numberOfUserVariables=(gt)3', headers: {'User-Agent': 'request'}})
        .pipe(source('commonVariables.json'))
        .pipe(streamify(jeditor(function (commonVariables) {
            return commonVariables;
        })))
        .pipe(gulp.dest('./www/data/'));
});
function decryptFile(fileToDecryptPath, decryptedFilePath, callback) {
    console.log('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
    if (!process.env.ENCRYPTION_SECRET) {
        console.error('ERROR: Please set ENCRYPTION_SECRET environmental variable!');
        if (callback) {callback();}
        return;
    }
    console.log('DECRYPTING ' + fileToDecryptPath + ' to ' + decryptedFilePath);
    var cmd = 'openssl aes-256-cbc -k "' + process.env.ENCRYPTION_SECRET + '" -in "' + fileToDecryptPath + '" -d -a -out "' + decryptedFilePath + '"';
    execute(cmd, function (error) {
        if (error !== null) {console.error('ERROR: DECRYPTING: ' + error);} else {console.log('DECRYPTED to ' + decryptedFilePath);}
        fs.stat(decryptedFilePath, function (err, stat) {
            if (!err) {
                console.log(decryptedFilePath + ' exists');
            } else {
                console.log('Could not decrypt' + fileToDecryptPath);
                console.log(err);
            }
        });
        if (callback) {callback();}
        //outputSHA1ForAndroidKeystore(decryptedFilePath);
    });
}
gulp.task('getSHA1FromAPK', function () {
    var pathToAPK = 'android-armv7-release.apk';
    console.log('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
    var cmd = 'keytool -list -printcert -jarfile ' + pathToAPK + ' | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64';
    execute(cmd, function (error) {
        if (error !== null) {console.error('ERROR: ' + error);} else {console.log('DECRYPTED to ' + pathToAPK);}
    });
});
gulp.task('default', ['sass']);
gulp.task('unzipChromeExtension', function () {
    var minimatch = require('minimatch');
    gulp.src('./build/' + process.env.QUANTIMODO_CLIENT_ID + '-Chrome-Extension.zip')
        .pipe(unzip())
        .pipe(gulp.dest('./build/' + process.env.QUANTIMODO_CLIENT_ID + '-Chrome-Extension'));
});
gulp.task('sass', function (done) {
    gulp.src('./www/scss/app.scss')
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
    console.log('If file is locked in Windows, open Resource Monitor as Administrator.  Then go to CPU -> Associated ' +
        'Handles and search for the locked file.  Then right click to kill all the processes using it.  Then try this ' +
        'task again.');
    return gulp.src('node_modules/*', {read: false}).pipe(clean());
});
gulp.task('getDevusernameFromUserInput', [], function () {
    var deferred = q.defer();
    if(devCredentials.username){
        console.log("Using username " + devCredentials.username + " from " + devCredentialsPath);
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
        console.log("Using password from " + devCredentialsPath);
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
        'getDevusernameFromUserInput',
        'getDevPasswordFromUserInput',
        'getClientIdFromUserInput',
        'configureApp',
        'ionicServe',
        callback);
});

gulp.task('getClientIdFromUserInput', function () {
    var deferred = q.defer();
    inquirer.prompt([{
        type: 'input', name: 'clientId', message: 'Please enter the client id obtained at https://app.quantimo.do/api/v2/apps'
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
        if (answers.updatedVersion) {
            updatedVersion = answers.updatedVersion;
            deferred.resolve();
        } else {
            console.log('PLEASE UPDATE IT BEFORE UPLOADING');
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
        console.log('Starting getChromeAuthorizationCode');
        inquirer.prompt([{
            type: 'input', name: 'code', message: 'Please Enter the Code Generated from the opened website'
        }], function (answers) {
            code = answers.code;
            code = code.trim();
            console.log('code: ', code);
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
            console.error('ERROR: Failed to generate the access code', error);
            defer.reject();
        } else {
            response = JSON.parse(response);
            access_token = response.access_token;
            deferred.resolve();
        }
    });
    return deferred.promise;
});
var getAppIds = function () {return appIds;};
gulp.task('uploadChromeApp', ['getAccessTokenFromGoogle'], function () {
    var deferred = q.defer();
    var appIds = getAppIds();
    var source = fs.createReadStream('./chromeApps/zips/' + process.env.QUANTIMODO_CLIENT_ID + '.zip');
    // upload the package
    var options = {
        url: 'https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + appIds[process.env.QUANTIMODO_CLIENT_ID],
        method: 'PUT',
        headers: {'Authorization': 'Bearer ' + access_token, 'x-goog-api-version': '2'}
    };
    console.log('Generated URL for upload operation: ', options.url);
    console.log('The Access Token: Bearer ' + access_token);
    console.log('UPLOADING. .. .. Please Wait! .. .');
    source.pipe(request(options, function (error, message, data) {
        if (error) {
            console.error('ERROR: Error in Uploading Data', error);
            deferred.reject();
        } else {
            console.log('Upload Response Received');
            data = JSON.parse(data);
            if (data.uploadState === 'SUCCESS') {
                console.log('Uploaded successfully!');
                deferred.resolve();
            } else {
                console.log('Failed to upload the zip file');
                console.log(JSON.stringify(data, 0, 2));
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
        if (answers.shouldPublish) {
            shouldPublish = answers.shouldPublish;
            deferred.resolve();
        } else {
            console.log('Ended without publishing!');
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
            console.error('ERROR: error in publishing to trusted Users', error);
            deferred.reject();
        } else {
            publishResult = JSON.parse(publishResult);
            if (publishResult.status.indexOf('OK') > -1) {
                console.log('published successfully');
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
gulp.task('chrome', ['publishToGoogleAppStore'], function () {console.log('Enjoy your day!');});
gulp.task('git-check', function (done) {
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
gulp.task('deleteIOSApp', function () {
    var deferred = q.defer();
    execute('ionic platform rm ios', function (error) {
        if (error !== null) {
            console.error('ERROR: REMOVING IOS APP: ' + error);
            deferred.reject();
        } else {
            console.log('\n***PLATFORM REMOVED****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
var encryptFile = function (fileToEncryptPath, encryptedFilePath, callback) {
    console.log('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
    if (!process.env.ENCRYPTION_SECRET) {
        console.error('ERROR: Please set ENCRYPTION_SECRET environmental variable!');
        return;
    }
    var cmd = 'openssl aes-256-cbc -k "' + process.env.ENCRYPTION_SECRET + '" -in "' + fileToEncryptPath + '" -e -a -out "' + encryptedFilePath + '"';
    //console.log('executing ' + cmd);
    execute(cmd, function (error) {
        if (error !== null) {
            console.error('ERROR: ENCRYPTING: ' + error);
        } else {
            console.log('Encrypted ' + encryptedFilePath);
            if (callback) {
                callback();
            }
        }
    });
};
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
function outputSHA1ForAndroidKeystore(decryptedFilePath) {
    if (decryptedFilePath.indexOf('keystore') === -1) {
        return;
    }
    var cmd = 'keytool -exportcert -list -v -alias androiddebugkey -keypass android -keystore ' + decryptedFilePath;
    execute(cmd, function (error) {
        if (error !== null) {
            console.error('ERROR: ENCRYPTING: ' + error);
        } else {
            console.log('Should have output SHA1 for the production keystore ' + decryptedFilePath);
        }
    });
}
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
function encryptPrivateConfig(callback) {
    var encryptedFilePath = privateConfigDirectoryPath + process.env.QUANTIMODO_CLIENT_ID + '.private_config.json.enc';
    var fileToEncryptPath = privateConfigDirectoryPath + process.env.QUANTIMODO_CLIENT_ID + '.private_config.json';
    encryptFile(fileToEncryptPath, encryptedFilePath, callback);
}
gulp.task('encryptPrivateConfig', [], function () {
    encryptPrivateConfig();
});
gulp.task('encryptAllPrivateConfigs', [], function () {
    var glob = require('glob');
    glob(privateConfigDirectoryPath + '*.json', {}, function (er, files) {
        console.log(JSON.stringify(files));
        for (var i = 0; i < files.length; i++) {
            encryptFile(files[i], files[i] + '.enc');
        }
    });
});
gulp.task('decryptAllPrivateConfigs', [], function () {
    var glob = require('glob');
    glob(privateConfigDirectoryPath + '*.enc', {}, function (er, files) {
        console.log(JSON.stringify(files));
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
    console.log('If this doesn\'t work, just use gulp cleanPlugins');
    executeCommand('cordova plugin rm phonegap-facebook-plugin', callback);
});
gulp.task('deleteGooglePlusPlugin', function (callback) {
    console.log('If this doesn\'t work, just use gulp cleanPlugins');
    execute('cordova plugin rm cordova-plugin-googleplus', callback);
});
gulp.task('ionicPlatformAddIOS', function (callback) {
    executeCommand('ionic platform add ios', callback);
});
var executeCommand = function (command, callback) {
    exec(command, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        callback(err);
    });
};
gulp.task('ionicServe', function (callback) {
    console.log("The app should open in a new browser tab in a few seconds. If it doesn't, run `ionic serve` from the command line in the root of the repository.")
    executeCommand('ionic serve', callback);
});
gulp.task('ionicStateReset', function (callback) {
    executeCommand('ionic state reset', callback);
});
var fastlaneSupply = function (track, callback) {
    var pathToApks = 'dropbox/' + process.env.QUANTIMODO_CLIENT_ID;
    executeCommand('supply' +
        ' --apk_paths ' + pathToApks + '/android-armv7-release.apk,' + pathToApks + '/android-x86-release.apk' +
        ' --track ' + track +
        ' --json_key supply_json_key_for_google_play.json',
        callback);
};
gulp.task('fastlaneSupplyBeta', function (callback) {
    fastlaneSupply('beta', callback);
});
gulp.task('fastlaneSupplyProduction', function (callback) {
    fastlaneSupply('production', callback);
});
gulp.task('ionicResources', function (callback) {
    executeCommand('ionic resources', callback);
});
gulp.task('androidDebugKeystoreInfo', function (callback) {
    console.log('androidDebugKeystoreInfo gets stuck for some reason');
    callback();
    //executeCommand("keytool -exportcert -list -v -alias androiddebugkey -keystore debug.keystore", callback);
});

gulp.task('gitPull', function () {
    var commandForGit = 'git pull';
    execute(commandForGit, function (error, output) {
        output = output.trim();
        if (error) {
            console.error('ERROR: Failed to pull: ' + output, error);
        } else {
            console.log('Pulled changes ' + output);
        }
    });
});
gulp.task('gitCheckoutAppJs', function () {
    var commandForGit = 'git checkout -- www/js/app.js';
    execute(commandForGit, function (error, output) {
        output = output.trim();
        if (error) {
            console.error('ERROR: Failed to gitCheckoutAppJs: ' + output, error);
        } else {
            console.log('gitCheckoutAppJs ' + output);
        }
    });
});
var ionicUpload = function (callback) {
    var commandForGit = 'git log -1 HEAD --pretty=format:%s';
    execute(commandForGit, function (error, output) {
        var commitMessage = output.trim();
        var uploadCommand = 'ionic upload --email m@thinkbnumbers.org --password ' + process.env.IONIC_PASSWORD +
            ' --note "' + commitMessage + '" --deploy ' + process.env.RELEASE_STAGE;
        console.log('ionic upload --note "' + commitMessage + '" --deploy ' + process.env.RELEASE_STAGE);
        //console.log('\n' + uploadCommand);
        execute(uploadCommand, function (error, uploadOutput) {
            uploadOutput = uploadOutput.trim();
            if (error) {
                console.error('ERROR: Failed to ionicUpload: ' + uploadOutput + error);
            }
            if (callback) {
                callback();
            }
        });
    });
};
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
        'setEnergyModoEnvs',
        'configureApp',
        'ionicUploadProduction',
        'setMediModoEnvs',
        'configureApp',
        'ionicUploadProduction',
        'setMindFirstEnvs',
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
                console.error('ERROR: THERE WAS AN ERROR:ADDING THE FACEBOOK PLUGIN***', error);
                deferred.reject();
            } else {
                console.log('\n***FACEBOOK PLUGIN SUCCESSFULLY ADDED***');
                deferred.resolve();
            }
        });
    };
    fs.exists('../fbplugin', function (exists) {
        if (exists) {
            console.log('FACEBOOK REPO ALREADY CLONED');
            addFacebookPlugin();
        } else {
            console.log('FACEBOOK REPO NOT FOUND, CLONING https://github.com/Wizcorp/phonegap-facebook-plugin.git NOW');
            var commands = [
                'cd ../',
                'mkdir fbplugin',
                'cd fbplugin',
                'GIT_CURL_VERBOSE=1 GIT_TRACE=1 git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git'
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
            execute(commands, function (error) {
                if (error !== null) {
                    console.error('ERROR: THERE WAS AN ERROR:DOWNLOADING THE FACEBOOK PLUGIN***', error);
                    deferred.reject();
                } else {
                    console.log('\n***FACEBOOK PLUGIN DOWNLOADED, NOW ADDING IT TO IONIC PROJECT***');
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
        console.log('No REVERSED_CLIENT_ID env specified. Falling back to ' + process.env.REVERSED_CLIENT_ID);
    }
    var commands = [
        'cordova -d plugin add https://github.com/mikepsinn/cordova-plugin-googleplus.git#89ac9f2e8d521bacaaf3989a22b50e4d0b5d6d09',
        'REVERSED_CLIENT_ID="' + process.env.REVERSED_CLIENT_ID + '"'
    ].join(' --variable ');
    execute(commands, function (error) {
        if (error !== null) {
            console.error('ERROR: ADDING THE GOOGLE PLUS PLUGIN***', error);
            deferred.reject();
        } else {
            console.log('\n***GOOGLE PLUS PLUGIN ADDED****');
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
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['facebook.com']) {
            facebookDotCom = myPlist.NSAppTransportSecurity.NSExceptionDomains['facebook.com'];
        }
        if (!facebookDotCom.NSIncludesSubdomains) {facebookDotCom.NSIncludesSubdomains = true;}
        if (!facebookDotCom.NSThirdPartyExceptionRequiresForwardSecrecy) {facebookDotCom.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        myPlist.NSAppTransportSecurity.NSExceptionDomains['facebook.com'] = facebookDotCom;
        console.log('Updated facebook.com');
        var fbcdnDotNet = {};
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net']) {fbcdnDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net'];}
        if (!fbcdnDotNet.NSIncludesSubdomains) {fbcdnDotNet.NSIncludesSubdomains = true;}
        if (!fbcdnDotNet.NSThirdPartyExceptionRequiresForwardSecrecy) {fbcdnDotNet.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net'] = fbcdnDotNet;
        console.log('Updated fbcdn.net');
        // akamaihd.net
        var akamaihdDotNet = {};
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net']) {
            akamaihdDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net'];
        }
        if (!akamaihdDotNet.NSIncludesSubdomains) {akamaihdDotNet.NSIncludesSubdomains = true;}
        if (!akamaihdDotNet.NSThirdPartyExceptionRequiresForwardSecrecy) {akamaihdDotNet.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net'] = akamaihdDotNet;
        console.log('Updated akamaihd.net');
    }
    fs.writeFile('platforms/ios/' + appSettings.appDisplayName + '/' + appSettings.appDisplayName + '-Info.plist', plist.build(myPlist), 'utf8', function (err) {
        if (err) {
            console.error('ERROR: error writing to plist', err);
            deferred.reject();
        } else {
            console.log('successfully updated plist');
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
                console.log('no Bugsnag detected');
                gulp.src('./platforms/ios/Podfile')
                    .pipe(change(function (content) {
                        var bugsnag_str = 'target \'' + appSettings.appDisplayName + '\' do \npod \'Bugsnag\', :git => "https://github.com/bugsnag/bugsnag-cocoa.git"';
                        console.log('Bugsnag Added to Podfile');
                        deferred.resolve();
                        return content.replace(/target.*/g, bugsnag_str);
                    }))
                    .pipe(gulp.dest('./platforms/ios/'));
            } else {
                console.log('Bugsnag already present in Podfile');
                deferred.resolve();
            }
        });
    };
    fs.exists('./platforms/ios/Podfile', function (exists) {
        if (exists) {
            console.log('Podfile');
            addBugsnagToPodfile();
        } else {
            console.log('PODFILE REPO NOT FOUND, Installing it First');
            var commands = [
                'cd ./platforms/ios',
                'pod init'
            ].join(' && ');
            execute(commands, function (error) {
                if (error !== null) {
                    console.error('ERROR: There was an error detected', error);
                    deferred.reject();
                } else {
                    console.log('\n***Podfile Added****');
                    addBugsnagToPodfile();
                }
            });
        }
    });
    return deferred.promise;
});
gulp.task('addInheritedToOtherLinkerFlags', function () {
    if (!appSettings.appDisplayName) {console.log('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            return content.replace(/OTHER_LDFLAGS(\s+)?=(\s+)?(\s+)\(/g, 'OTHER_LDFLAGS = (\n\t\t\t\t\t"$(inherited)",');
        }))
        .pipe(gulp.dest('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/'));
});
gulp.task('addDeploymentTarget', function () {
    if (!appSettings.appDisplayName) {console.log('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            if (content.indexOf('IPHONEOS_DEPLOYMENT_TARGET') === -1) {
                return content.replace(/ENABLE_BITCODE(\s+)?=(\s+)?(\s+)NO\;/g, 'IPHONEOS_DEPLOYMENT_TARGET = 6.0;\ENABLE_BITCODE = NO;');
            }
            return content;
        }))
        .pipe(change(function (content) {
            console.log('*****************\n\n\n', content, '\n\n\n*****************');
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
            console.error('ERROR: There was an error detected', error);
            deferred.reject();
        } else {
            console.log('\n***Pods Installed****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('addBugsnagInObjC', function () {
    if (!appSettings.appDisplayName) {console.log('Please export appSettings.appDisplayName');}
    return gulp.src('./platforms/ios/' + appSettings.appDisplayName + '/Classes/AppDelegate.m')
        .pipe(change(function (content) {
            if (content.indexOf('Bugsnag') !== -1) {
                console.log('Bugsnag Already Present');
                return content;
            } else {
                content = content.replace(/#import "MainViewController.h"/g, '#import "MainViewController.h"\n#import "Bugsnag.h"');
                content = content.replace(/self\.window\.rootViewController(\s)?=(\s)?self\.viewController\;/g, '[Bugsnag startBugsnagWithApiKey:@"ae7bc49d1285848342342bb5c321a2cf"];\n\tself.window.rootViewController = self.viewController;');
                console.log('Bugsnag Added');
            }
            return content;
        }))
        .pipe(gulp.dest('./platforms/ios/' + appSettings.appDisplayName + '/Classes/'));
});
gulp.task('enableBitCode', function () {
    if (!appSettings.appDisplayName) {console.log('Please export appSettings.appDisplayName');}
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
var setVersionNumberInConfigXml = function (configFilePath, callback) {
    var xml = fs.readFileSync(configFilePath, 'utf8');
    parseString(xml, function (err, parsedXmlFile) {
        if (err || !parsedXmlFile) {
            console.log('failed to read xml file or it is empty', err);
        } else {
            parsedXmlFile.widget.$['version'] = process.env.IONIC_APP_VERSION_NUMBER;
            parsedXmlFile.widget.$['ios-CFBundleVersion'] = process.env.IONIC_IOS_APP_VERSION_NUMBER;
            parsedXmlFile.widget.$['ios-CFBundleVersion'] = getIsoString();
            var builder = new xml2js.Builder();
            var updatedXml = builder.buildObject(parsedXmlFile);
            fs.writeFile(configFilePath, updatedXml, 'utf8', function (error) {
                if (error) {
                    console.error('ERROR: error writing to xml file', error);
                } else {
                    console.log('successfully updated the version number xml file');
                    callback();
                }
            });
        }
    });
};
gulp.task('setVersionNumberInConfigXml', [], function (callback) {
    var configFilePath = './config-template.xml';
    setVersionNumberInConfigXml(configFilePath, callback);
});
gulp.task('setVersionNumberInIosConfigXml', [], function (callback) {
    var configFilePath = './config-template-ios.xml';
    setVersionNumberInConfigXml(configFilePath, callback);
});
gulp.task('setVersionNumberInFiles', function () {
    if (!process.env.IONIC_IOS_APP_VERSION_NUMBER) {throw 'Please set process.env.IONIC_IOS_APP_VERSION_NUMBER';}
    if (!process.env.IONIC_APP_VERSION_NUMBER) {throw 'Please set process.env.IONIC_APP_VERSION_NUMBER';}
    var filesToUpdate = [
        defaultAppConfigPath,
        //'gulp.js',
        '.travis.yml',
        //'config.xml',  // This should be done with setVersionNumberInConfigXml to avoid plugin version replacements
        //'config-template.xml',  // This should be done with setVersionNumberInConfigXml to avoid plugin version replacements
        //'config-template-ios.xml',  // This should be done with setVersionNumberInIosConfigXml to avoid plugin version replacements
        'resources/chrome_extension/manifest.json',
        'build/chrome_extension/manifest.json',
        'resources/chrome_app/manifest.json'
    ];
    return gulp.src(filesToUpdate, {base: '.'}) // Every file allown.
        .pipe(replace('IONIC_IOS_APP_VERSION_NUMBER_PLACEHOLDER', process.env.IONIC_IOS_APP_VERSION_NUMBER))
        .pipe(replace('IONIC_APP_VERSION_NUMBER_PLACEHOLDER', process.env.IONIC_APP_VERSION_NUMBER))
        .pipe(gulp.dest('./'));
});
gulp.task('ic_notification', function () {
    gulp.src('./resources/android/res/**')
        .pipe(gulp.dest('./platforms/android/res'));
});
// Setup platforms to build that are supported on current hardware
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
var templateCache = require('gulp-angular-templatecache');
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
        'setLowerCaseAppName',
        'getAppConfigs',
        callback);
});
gulp.task('setEnergyModoEnvs', [], function (callback) {
    process.env.QUANTIMODO_CLIENT_ID = 'energymodo';
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('setMediModoEnvs', [], function (callback) {
    process.env.QUANTIMODO_CLIENT_ID = 'medimodo';
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('setMindFirstEnvs', [], function (callback) {
    process.env.QUANTIMODO_CLIENT_ID = 'mindfirst';
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
gulp.task('setAppEnvs', ['setLowerCaseAppName'], function (callback) {
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
gulp.task('setMindFirstEnvs', [], function (callback) {
    process.env.QUANTIMODO_CLIENT_ID = 'mindfirst';
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('setAndroidEnvs', [], function (callback) {
    process.env.CONFIG_XML_TEMPLATE_PATH = './config-template.xml';
    callback();
});
gulp.task('setIosEnvs', [], function (callback) {
    process.env.CONFIG_XML_TEMPLATE_PATH = './config-template-ios.xml';
    callback();
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
    return gulp.src('build/chrome_extension/*', {read: false}).pipe(clean());
});
gulp.task('cleanBuildFolder', [], function () {
    return gulp.src('build/*', {read: false}).pipe(clean());
});
gulp.task('copyAppResources', ['cleanResources'], function () {
    console.log('If this doesn\'t work, make sure there are no symlinks in the apps folder!');
    return gulp.src(['apps/' + process.env.QUANTIMODO_CLIENT_ID + '/**/*'], {
        base: 'apps/' + process.env.QUANTIMODO_CLIENT_ID
    }).pipe(gulp.dest('.'));
});
gulp.task('copyIconsToWwwImg', [], function () {
    return gulp.src(['apps/' + process.env.QUANTIMODO_CLIENT_ID + '/resources/icon*.png'])
        .pipe(gulp.dest('www/img/icons'));
});
gulp.task('copyIonicCloudLibrary', [], function () {
    return gulp.src(['node_modules/@ionic/cloud/dist/bundle/ionic.cloud.min.js']).pipe(gulp.dest('www/lib'));
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
            console.error('ERROR:' + error);
        } else {
            callback();
        }
    });
});
gulp.task('ionicResourcesIos', [], function (callback) {
    return execute('ionic resources ios', function (error) {
        if (error !== null) {
            console.error('ERROR:GENERATING iOS RESOURCES for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            console.log('\n***iOS RESOURCES GENERATED for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
var getIsoString = function () {
    var rightNow = new Date();
    var nowString = rightNow.toISOString();
    nowString = nowString.replace(/-/g, '');
    nowString = nowString.replace(/T/g, '');
    nowString = nowString.replace(/:/g, '');
    nowString = nowString.slice(0, 14);
    return nowString;
};
gulp.task('generateConfigXmlFromTemplate', ['setLowerCaseAppName', 'getAppConfigs'], function (callback) {
    if (!process.env.CONFIG_XML_TEMPLATE_PATH) {
        process.env.CONFIG_XML_TEMPLATE_PATH = './config-template.xml';
        console.warn('CONFIG_XML_TEMPLATE_PATH not set!  Falling back to ' + process.env.CONFIG_XML_TEMPLATE_PATH);
    } else {console.log('generateConfigXmlFromTemplate using ' + process.env.CONFIG_XML_TEMPLATE_PATH);}
    var xml = fs.readFileSync(process.env.CONFIG_XML_TEMPLATE_PATH, 'utf8');
    if (!xml) {
        console.log('Could not find template at CONFIG_XML_TEMPLATE_PATH ' + process.env.CONFIG_XML_TEMPLATE_PATH);
        return;
    }
    if (appSettings.additionalSettings.googleReversedClientId) {
        xml = xml.replace('REVERSED_CLIENT_ID_PLACEHOLDER', appSettings.additionalSettings.googleReversedClientId);
    }
    parseString(xml, function (err, parsedXmlFile) {
        if (err) {
            throw new Error('ERROR: failed to read xml file', err);
        } else {
            if (appSettings.appDisplayName) {
                parsedXmlFile.widget.name[0] = appSettings.appDisplayName;
                console.log('Setting config.xml name to ' + parsedXmlFile.widget.name[0]);
            } else {throw('APP_DISPLAY_NAME env not set! Falling back to default QuantiModo APP_DISPLAY_NAME');}
            if (appSettings.appDescription) {
                parsedXmlFile.widget.description[0] = appSettings.appDescription;
                console.log('Setting config.xml description to ' + parsedXmlFile.widget.description[0]);
            } else {throw('APP_DESCRIPTION env not set! Falling back to default QuantiModo APP_DESCRIPTION');}
            if (appSettings.additionalSettings.googleReversedClientId) {
                parsedXmlFile.widget.$['id'] = appSettings.additionalSettings.appIds.appIdentifier;
                console.log('Setting config.xml id to ' + parsedXmlFile.widget.$['id']);
            } else {throw('APP_IDENTIFIER env not set! Falling back to default QuantiModo APP_IDENTIFIER');}
            if (process.env.IONIC_APP_VERSION_NUMBER) {
                parsedXmlFile.widget.$['version'] = process.env.IONIC_APP_VERSION_NUMBER;
                console.log('Setting config.xml version to ' + parsedXmlFile.widget.$['version']);
            }
            if (process.env.IONIC_IOS_APP_VERSION_NUMBER) {
                parsedXmlFile.widget.$['ios-CFBundleVersion'] = process.env.IONIC_IOS_APP_VERSION_NUMBER;
                parsedXmlFile.widget.$['ios-CFBundleVersion'] = getIsoString();
                console.log('Setting config.xml ios-CFBundleVersion to ' + parsedXmlFile.widget.$['ios-CFBundleVersion']);
            }
            var builder = new xml2js.Builder();
            var updatedXmlFile = builder.buildObject(parsedXmlFile);
            fs.writeFile('./config.xml', updatedXmlFile, 'utf8', function (error) {
                if (error) {
                    console.error('ERROR: Error updating version number in config.xml', error);
                } else {
                    console.log('Successfully updated config.xml file');
                    callback();
                }
            });
        }
    });
});
gulp.task('bumpIosVersion', function (callback) {
    var xml = fs.readFileSync('./config-template-ios.xml', 'utf8');
    parseString(xml, function (err, parsedXmlFile) {
        if (err) {
            console.log('failed to read xml file', err);
        } else {
            var numberToBumpArr = parsedXmlFile.widget.$['ios-CFBundleVersion'].split('.');
            var numberToBump = numberToBumpArr[numberToBumpArr.length - 1];
            numberToBumpArr[numberToBumpArr.length - 1] = (parseInt(numberToBump) + 1).toString();
            // Lets just use the timestamp to simplify matters
            numberToBumpArr[numberToBumpArr.length - 1] = Math.floor(Date.now() / 1000);
            parsedXmlFile.widget.$['ios-CFBundleVersion'] = numberToBumpArr.join('.');
            parsedXmlFile.widget.$['ios-CFBundleVersion'] = getIsoString();
            var builder = new xml2js.Builder();
            var updatedXml = builder.buildObject(parsedXmlFile);
            fs.writeFile('./config.xml', updatedXml, 'utf8', function (error) {
                if (error) {
                    console.error('ERROR: error writing to xml file', error);
                } else {
                    console.log('successfully updated the version number xml file');
                }
            });
            fs.writeFile('./config-template-ios.xml', updatedXml, 'utf8', function (err) {
                if (err) {
                    console.log('error writing to config-template-ios.xml file', err);
                } else {
                    console.log('successfully updated the version number config-template-ios.xml file');
                    callback();
                }
            });
        }
    });
});
gulp.task('prepareIosAppIfEnvIsSet', function (callback) {
    if (!process.env.PREPARE_IOS_APP) {
        console.log('process.env.PREPARE_IOS_APP not true, so not preparing iOS app');
        callback();
        return;
    }
    console.log('process.env.PREPARE_IOS_APP is true, so going to prepareIosApp');
    runSequence(
        'prepareIosApp',
        callback);
});
gulp.task('prepareIosApp', function (callback) {
    runSequence(
        'setIosEnvs',
        //'gitPull',  Not sure why we needed this
        'cleanPlugins',
        'configureApp',
        'bumpIosVersion',
        'generateConfigXmlFromTemplate', // Needs to happen before resource generation so icon paths are not overwritten
        'removeTransparentPng',
        'removeTransparentPsd',
        'useWhiteIcon',
        'ionicResourcesIos',
        'copyIconsToWwwImg',
        callback);
});
gulp.task('copyWwwFolderToChromeExtension', [], function () {
    return gulp.src(['www/**/*'])
        .pipe(gulp.dest('build/chrome_extension/www'));
});
gulp.task('symlinkWwwFolderInChromeExtension', [], function () {
    return gulp.src(['www/**/*'])
        .pipe(gulp.dest('build/chrome_extension/www'));
});
gulp.task('copyManifestToChromeExtension', [], function () {
    return gulp.src(['resources/chrome_extension/manifest.json'])
        .pipe(gulp.dest('build/chrome_extension'));
});
gulp.task('removeFacebookFromChromeExtension', [], function () {
    return gulp.src('build/chrome_extension/www/lib/phonegap-facebook-plugin/*',
        {read: false})
        .pipe(clean());
});
gulp.task('removeAndroidManifestFromChromeExtension', [], function () {
    return gulp.src('build/chrome_extension/www/manifest.json',
        {read: false})
        .pipe(clean());
});
gulp.task('zipChromeExtension', [], function () {
    console.log('If this fails, make sure there are no symlinks.');
    return gulp.src(['build/chrome_extension/**/*'])
        .pipe(zip(process.env.QUANTIMODO_CLIENT_ID + '-Chrome-Extension.zip'))
        .pipe(gulp.dest('build'));
});
// Need configureAppAfterNpmInstall or prepareIosApp results in infinite loop
gulp.task('configureAppAfterNpmInstall', [], function (callback) {
    console.log('gulp configureAppAfterNpmInstall');
    if (process.env.BUDDYBUILD_SCHEME) {
        console.log('BUDDYBUILD_SCHEME is ' + process.env.BUDDYBUILD_SCHEME + ' so going to prepareIosApp');
        runSequence(
            'prepareIosApp',
            callback);
    } else if (process.env.BUDDYBUILD_SECURE_FILES) {
        console.log('Building Android because BUDDYBUILD_SCHEME is not set and we know we\'re on BuddyBuild because BUDDYBUILD_SECURE_FILES is set to: ' + process.env.BUDDYBUILD_SECURE_FILES);
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
    console.log('gulp configureApp');
    runSequence(
        'setLowerCaseAppName',
        'sass',
        'getCommonVariables',
        'copyAppResources',
        'getAppConfigs',
        'verifyExistenceOfDefaultConfig',
        // templates because of the git changes and weird stuff replacement does to config-template.xml
        //'copyIonicCloudLibrary', I think we just keep it in custom-lib now
        //'resizeIcons',  I don't want to run this here because I think it breaks BuddyBuild and Bitrise iOS builds
        'copyIconsToWwwImg',
        //'generateConfigXmlFromTemplate',  Can't do this here because it will overwrite iOS config on BuildBuddy
        'setVersionNumberInFiles',
        //'prepareIosAppIfEnvIsSet',  Can't run this here because prepareIosApp calls configureApp
        //'deleteUnusedFiles',  //This doesn't seem to make the app any smaller
        callback);
});
gulp.task('configureDefaultApp', [], function (callback) {
    process.env.QUANTIMODO_CLIENT_ID = 'your_quantimodo_client_id_here';
    runSequence(
        'copyAppResources',
        'getAppConfigs',
        callback);
});
gulp.task('buildChromeExtension', [], function (callback) {
    runSequence(
        'cleanChromeBuildFolder',
        'configureApp',
        'resizeIcons',
        'copyIconsToWwwImg',
        'copyWwwFolderToChromeExtension',  //Can't use symlinks
        'createChromeExtensionManifest',
        'removeFacebookFromChromeExtension',
        'removeAndroidManifestFromChromeExtension',
        'zipChromeExtension',
        'unzipChromeExtension',
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
gulp.task('buildMindFirst', function (callback) {
    runSequence(
        'setMindFirstEnvs',
        'buildChromeExtension',
        'buildAndroidApp',
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
gulp.task('buildEnergyModoAndroid', function (callback) {
    runSequence(
        'setEnergyModoEnvs',
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        callback);
});
gulp.task('buildAllChromeExtensions', function (callback) {
    runSequence(
        'cleanBuildFolder',
        'setEnergyModoEnvs',
        'buildChromeExtension',
        'setMediModoEnvs',
        'buildChromeExtension',
        'setMindFirstEnvs',
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
        'setEnergyModoEnvs',
        'buildChromeExtension',
        'buildAndroidApp',
        'setMediModoEnvs',
        'buildChromeExtension',
        'buildAndroidApp',
        'setMindFirstEnvs',
        'buildChromeExtension',
        'buildAndroidApp',
        'setMoodiModoEnvs',
        'buildChromeExtension',
        'buildAndroidApp',
        'setQuantiModoEnvs',
        'buildChromeExtension',
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
            console.error('ERROR: for ' + command + 'for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            console.log('\n***' + command + ' for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('xcodeProjectFix', function (callback) {
    var command = 'ruby hooks/after_platform_add.bak/xcodeprojectfix.rb';
    return execute(command, function (error) {
        if (error !== null) {
            console.error('ERROR: for ' + command + 'for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            console.log('\n***' + command + ' for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('ionicPlatformAddAndroid', function (callback) {
    return execute('ionic platform add android@6.1.0', function (error) {
        if (error !== null) {
            console.error('ERROR: for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            console.log('\n***Android for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('ionicPlatformRemoveAndroid', function (callback) {
    return execute('ionic platform remove android', function (error) {
        if (error !== null) {
            console.error('ERROR: for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            console.log('\n***Android for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('cordovaBuildAndroidDebug', function (callback) {
    return execute('cordova build --debug android', function (error) {
        if (error !== null) {
            console.error('ERROR: for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            console.log('\n***Android for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('cordovaBuildAndroidRelease', function (callback) {
    return execute('cordova build --release android', function (error) {
        if (error !== null) {
            console.error('ERROR: for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            console.log('\n***Android for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('copyAndroidResources', [], function () {
    return gulp.src(['resources/android/**/*'])
        .pipe(gulp.dest('platforms/android'));
});
gulp.task('copyAndroidBuild', [], function () {
    if (!process.env.QUANTIMODO_CLIENT_ID) {throw 'process.env.QUANTIMODO_CLIENT_ID not set!';}
    var pathToApks = 'platforms/android/build/outputs/apk/*.apk';
    var dropboxPath = 'dropbox/' + process.env.QUANTIMODO_CLIENT_ID;
    var buildFolderPath = 'build/apks/' + process.env.QUANTIMODO_CLIENT_ID; // Non-symlinked apk build folder accessible by Jenkins within Vagrant box
    console.log('Copying from ' + pathToApks + ' to ' + dropboxPath + ' and ' + buildFolderPath);
    var copyApksToDropbox = gulp.src([pathToApks]).pipe(gulp.dest(dropboxPath));
    var copyApksToBuildFolder = gulp.src([pathToApks]).pipe(gulp.dest(buildFolderPath));
    return es.concat(copyApksToDropbox, copyApksToBuildFolder);
});
gulp.task('prepareQuantiModoIos', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'prepareIosApp',
        callback);
});
gulp.task('prepareMindFirstIos', function (callback) {
    runSequence(
        'setMindFirstEnvs',
        'prepareIosApp',
        callback);
});
gulp.task('generateAndroidResources', [], function (callback) {
    return execute('ionic resources android', function (error) {
        if (error !== null) {
            console.error('ERROR: GENERATING Android RESOURCES for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            console.log('\n***Android RESOURCES GENERATED for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
gulp.task('ionicRunAndroid', [], function (callback) {
    return execute('ionic run android', function (error) {
        if (error !== null) {
            console.error('ERROR: GENERATING Android RESOURCES for ' + process.env.QUANTIMODO_CLIENT_ID + ': ' + error);
        } else {
            console.log('\n***Android RESOURCES GENERATED for ' + process.env.QUANTIMODO_CLIENT_ID);
            callback();
        }
    });
});
function resizeIcon(callback, resolution) {
    var command = 'convert resources/icon.png -resize ' + resolution + 'x' + resolution +
        ' www/img/icons/icon_' + resolution + '.png';
    console.log('Executing command: ' + command);
    return execute(command, function (error) {
        if (error) {
            console.error('ERROR: ' + JSON.stringify(error));
        }
        callback();
    });
}
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
    runSequence(
        'setAppEnvs',
        'setAndroidEnvs',
        'generateConfigXmlFromTemplate',  // Must be run before addGooglePlusPlugin or running any other cordova commands
        'cleanPlatforms',
        'cleanPlugins',
        //'ionicPlatformRemoveAndroid',
        //'ionicStateReset',  // Need this to install plugins from package.json
        'ionicPlatformAddAndroid',
        'decryptBuildJson',
        'decryptAndroidKeystore',
        'decryptAndroidDebugKeystore',
        //'androidDebugKeystoreInfo',
        //'deleteGooglePlusPlugin',  This breaks flow if plugin is not present.  Can't get it to continue on error.  However, cleanPlugins should already do this
        //'addGooglePlusPlugin',
        //'ionicPlatformRemoveAndroid', // This is necessary because the platform version will not necessarily be set to 6.1.0 otherwise (it will just follow platforms.json
        //'ionicPlatformAddAndroid',
        'ionicAddCrosswalk',
        'ionicInfo',
        callback);
});
gulp.task('prepareAndroidApp', function (callback) {
    runSequence(
        'configureApp',
        'setAndroidEnvs',
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
        'prepareAndroidApp',
        'cordovaBuildAndroidRelease',
        'cordovaBuildAndroidDebug',
        'copyAndroidBuild',
        callback);
});
gulp.task('prepareMindFirstAndroid', function (callback) {
    runSequence(
        'setMindFirstEnvs',
        'prepareAndroidApp',
        callback);
});
gulp.task('prepareQuantiModoAndroid', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'prepareAndroidApp',
        callback);
});