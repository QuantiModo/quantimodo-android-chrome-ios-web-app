angular.module('starter')
    // Measurement Service
    .factory('bugsnagService', function($state, $ionicHistory){
        
        // service methods
        var bugsnagService = {

            reportError : function(exception){
                var message = exception.toString();
                var ionicViewHistory = {};
                var stacktrace;
                if(typeof exception.stack !== 'undefined'){
                    stacktrace = exception.stack.toLocaleString();
                } else {
                    stacktrace = "No stack trace provided with exception";
                }
                Bugsnag.apiKey = window.private_keys.bugsnag_key;
                if(typeof $ionicHistory !== "undefined"){
                    ionicViewHistory = $ionicHistory.viewHistory();
                } else {
                    ionicViewHistory = "$ionicHistory is undefined in fabric.js";
                }
                Bugsnag.notify("ERROR: "+$state.current.name, "ionic history backView: "+ JSON.stringify(ionicViewHistory), ionicViewHistory, "error");
                Bugsnag.notify("ERROR: "+message, "Stacktrace: "+stacktrace, {}, "error");
            }
        };

        return bugsnagService;
    });