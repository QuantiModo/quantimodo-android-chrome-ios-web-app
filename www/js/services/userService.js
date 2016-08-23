angular.module('starter')
    // Measurement Service
    .factory('userService', function($q, $rootScope, QuantiModo, localStorageService, pushNotificationService, $ionicPlatform) {
        
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
            },

            setUserInLocalStorageBugsnagAndRegisterDeviceForPush : function(userData){
                Bugsnag.metaData = {
                    user: {
                        name: userData.displayName,
                        email: userData.email
                    }
                };
                localStorageService.setItem('user', JSON.stringify(userData));
                $rootScope.user = userData;
                window.intercomSettings = {
                    app_id: "uwtx2m33",
                    name: userData.displayName,
                    email: userData.email,
                    user_id: userData.id,
                    app_name: config.appSettings.appName,
                    app_version: $rootScope.appVersion,
                    platform: $rootScope.currentPlatform,
                    platform_version: $rootScope.currentPlatformVersion
                };

                $ionicPlatform.ready(function() {
                    if (ionic.Platform.isAndroid() || ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
                        console.debug("Going to try to register push");
                        var push = new Ionic.Push({"debug": true});

                        push.register(function (deviceToken) {
                            console.debug("Got device token for push notifications: " + deviceToken.token);
                            $rootScope.deviceToken = localStorageService.getItemSync('deviceToken');
                            push.saveToken(deviceToken);
                            //if($rootScope.deviceToken !== deviceToken.token){
                            pushNotificationService.registerDeviceToken(deviceToken.token);
                            //}
                        });
                    }
                });
            }
        };

        return userService;
    });