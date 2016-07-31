angular.module('starter')
    // Measurement Service
    .factory('userService', function($http, $q, QuantiModo, localStorageService, $rootScope){
        
        // service methods
        var userService = {
            
            // get user
            getUser : function(){
                var deferred = $q.defer();

                localStorageService.getItem('user',function(user){
                    if(user){
                        user = JSON.parse(user);
                        $rootScope.user = user;
                        deferred.resolve(user);
                    } else {
                        userService.refreshUser().then(function(){
                            deferred.resolve(user);
                        });
                    }
                });
                
                return deferred.promise;
            },

            refreshUser : function(){
                var deferred = $q.defer();
                QuantiModo.getUser(function(user){
                    localStorageService.setItem('user', JSON.stringify(user));
                    $rootScope.user = user;
                    deferred.resolve(user);
                }, function(){
                    deferred.reject(false);
                });
                return deferred.promise;
            },

            updateUserSettings : function(params){
                var deferred = $q.defer();
                QuantiModo.updateUserSettings(params, function(response){
                    userService.refreshUser();
                    deferred.resolve(response);
                }, function(response){
                    deferred.reject(response);
                });
                return deferred.promise;
            }
        };

        return userService;
    });