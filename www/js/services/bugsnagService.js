angular.module('starter')
    // Measurement Service
    .factory('bugsnagService', function(utilsService, $q) {


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
                    Bugsnag.notify(stringifiedExceptionOrError, stacktrace, {}, "error");
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
                return deferred.promise;
            }
        };

        return bugsnagService;
    });