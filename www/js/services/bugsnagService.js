angular.module('starter')
    // Measurement Service
    .factory('bugsnagService', function(utilsService, $q, $rootScope) {


        var bugsnagService = {

            reportError : function(exceptionOrError){
                var deferred = $q.defer();
                var stringifiedExceptionOrError = 'No error or exception data provided to bugsnagService';
                var stacktrace = 'No stacktrace provided to bugsnagService';
                if(exceptionOrError){
                    stringifiedExceptionOrError = JSON.stringify(exceptionOrError);
                    if(typeof exceptionOrError.stack !== 'undefined'){
                        stacktrace = exceptionOrError.stack.toLocaleString();
                    } else {
                        stacktrace = stringifiedExceptionOrError;
                    }
                }
                console.error('ERROR: ' + stringifiedExceptionOrError);
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.releaseStage = utilsService.getEnv();
                    Bugsnag.notify(stringifiedExceptionOrError, stacktrace, {groupingHash: stringifiedExceptionOrError}, "error");
                    deferred.resolve();
                } else {
                    deferred.reject('Bugsnag is not defined');
                }
                return deferred.promise;
            }
        };

        bugsnagService.setupBugsnag = function(){
            var deferred = $q.defer();
            if (typeof Bugsnag !== "undefined") {
                //Bugsnag.apiKey = "ae7bc49d1285848342342bb5c321a2cf";
                //Bugsnag.notifyReleaseStages = ['Production','Staging'];
                Bugsnag.releaseStage = utilsService.getEnv();
                Bugsnag.appVersion = $rootScope.appVersion;
                Bugsnag.metaData = {
                    platform: ionic.Platform.platform(),
                    platformVersion: ionic.Platform.version(),
                    appName: config.appSettings.appName
                };
                deferred.resolve();
            } else {
                deferred.reject('Bugsnag is not defined');
            }
            return deferred.promise;
        };

        return bugsnagService;
    });