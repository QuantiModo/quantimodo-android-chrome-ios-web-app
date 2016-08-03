angular.module('starter')
    // Measurement Service
    .factory('pushNotificationService', function($http, $q, QuantiModo){

        var pushNotificationService = {
            registerDeviceToken : function(deviceToken){
                var deferred = $q.defer();
                console.debug("Posing deviceToken to server: ", deviceToken);
                QuantiModo.postDeviceToken(deviceToken, function(response){
                    console.debug(response);
                    deferred.resolve();
                }, function(err){
                    Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        };

        return pushNotificationService;
    });