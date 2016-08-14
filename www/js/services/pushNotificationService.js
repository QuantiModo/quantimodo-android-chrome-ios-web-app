angular.module('starter')
    // Measurement Service
    .factory('pushNotificationService', function($http, $q, QuantiModo, localStorageService, $rootScope){

        var pushNotificationService = {
            registerDeviceToken : function(deviceToken){
                var deferred = $q.defer();

                localStorageService.setItem('deviceToken', deviceToken);
                $rootScope.deviceToken = deviceToken;
                console.debug("Posting deviceToken to server: ", deviceToken);
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