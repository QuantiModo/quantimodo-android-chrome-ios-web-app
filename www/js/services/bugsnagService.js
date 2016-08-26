angular.module('starter')
    // Measurement Service
    .factory('bugsnagService', function(utilsService) {
        
        // service methods
        var bugsnagService = {

            reportError : function(exception){
                var message = exception.toString();
                console.error('ERROR: ' + message);
                var stacktrace;
                if(typeof exception.stack !== 'undefined'){
                    stacktrace = exception.stack.toLocaleString();
                } else {
                    stacktrace = "No stack trace provided with exception";
                }

                //$rootScope.bugsnagApiKey = window.private_keys.bugsnag_key;
                $rootScope.bugsnagApiKey = "ae7bc49d1285848342342bb5c321a2cf";
                Bugsnag.releaseStage = utilsService.getEnv();
                Bugsnag.apiKey = $rootScope.bugsnagApiKey;
                Bugsnag.notify("ERROR: "+message, "Stacktrace: "+stacktrace, {}, "error");
            }
        };

        return bugsnagService;
    });