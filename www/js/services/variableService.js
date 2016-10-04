angular.module('starter')
	.factory('variableService', function($q, $rootScope, QuantiModo, localStorageService) {

	    var variableService = {};


        // get user variables (without public)
        variableService.searchUserVariables = function(variableSearchQuery, params){
            var deferred = $q.defer();

            if(!variableSearchQuery){
                variableSearchQuery = '*';
            }

            QuantiModo.searchUserVariables(variableSearchQuery, params, function(vars){
                deferred.resolve(vars);
            }, function(){
                deferred.reject(false);
            });

            return deferred.promise;
        };

        variableService.getVariablesByName = function(name){
            var deferred = $q.defer();

            // refresh always
            QuantiModo.getVariablesByName(name, function(variable){
                deferred.resolve(variable);
            }, function(){
                deferred.reject(false);
            });

            return deferred.promise;
        };

        variableService.getPublicVariablesByName = function(name) {
            var deferred = $q.defer();
            QuantiModo.getPublicVariablesByName(name, function(variable){
                deferred.resolve(variable);
            }, function(){
                deferred.reject(false);
            });

            return deferred.promise;

        };

        // post changes to user variable settings
        variableService.postUserVariable = function(userVariable) {
            var deferred = $q.defer();
            QuantiModo.postUserVariable(userVariable, function(userVariable) {
                deferred.resolve(userVariable);
            }, function(){
                deferred.reject(false);
            });

            return deferred.promise;
        };

        variableService.resetUserVariable = function(variableId) {
            var deferred = $q.defer();
            var body = {variableId: variableId};
            QuantiModo.resetUserVariable(body, function(userVariable) {
                deferred.resolve(userVariable);
            }, function(){
                deferred.reject(false);
            });

            return deferred.promise;
        };

        variableService.getVariableById = function(variableId){
            var deferred = $q.defer();

            // refresh always
            QuantiModo.getVariableById(variableId, function(variable){
                deferred.resolve(variable);
            }, function(){
                deferred.reject(false);
            });

            return deferred.promise;
        };

        variableService.deleteAllMeasurementsForVariable = function(variableId) {
            var deferred = $q.defer();
            QuantiModo.deleteUserVariableMeasurements(variableId, function() {
                // Delete user variable from local storage
                localStorageService.deleteElementOfItemById('userVariables', variableId);
                deferred.resolve();
            }, function(error) {
                if (typeof Bugsnag !== "undefined") {
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                }
                console.log('Error deleting all measurements for variable: ', error);
                deferred.reject(error);
            });

            return deferred.promise;
        };

        variableService.getUserVariables = function(){
            var deferred = $q.defer();
            localStorageService.getElementsFromItemWithFilters('userVariables', function(userVariables){
                if(userVariables){
                    deferred.resolve(userVariables);
                } else {
                    variableService.refreshUserVariables().then(function (userVariables) {
                        deferred.resolve(userVariables);
                    });
                }
            }, function(){
                $rootScope.syncingUserVariables = false;
                deferred.reject(false);
            });
            return deferred.promise;
        };

        variableService.refreshUserVariables = function(){
            var deferred = $q.defer();
            if($rootScope.syncingUserVariables){
                console.log('Already called refreshUserVariables within last 10 seconds!  Rejecting promise!');
                deferred.reject('Already called refreshUserVariables within last 10 seconds!  Rejecting promise!');
                return deferred.promise;
            }

            if(!$rootScope.syncingUserVariables){
                $rootScope.syncingUserVariables = true;
                $timeout(function() {
                    // Set to false after 10 seconds because it seems to get stuck on true sometimes for some reason
                    $rootScope.syncingUserVariables = false;
                }, 10000);

                QuantiModo.getUserVariables(null, function(userVariables){
                    localStorageService.setItem('userVariables', JSON.stringify(userVariables))
                        .then(function () {
                            $rootScope.$broadcast('populateUserVariables');
                            $rootScope.syncingUserVariables = false;
                        });
                    deferred.resolve(userVariables);
                }, function(){
                    $rootScope.syncingUserVariables = false;
                    deferred.reject(false);
                });

                return deferred.promise;
            }
        };

        variableService.getCommonVariables = function(){
            var deferred = $q.defer();
            localStorageService.getElementsFromItemWithFilters('commonVariables', function(commonVariables){
                if(commonVariables){
                    deferred.resolve(commonVariables);
                } else {
                    variableService.refreshCommonVariables().then(function (commonVariables) {
                        deferred.resolve(commonVariables);
                    });
                }
            }, function(){
                $rootScope.syncingUserVariables = false;
                deferred.reject(false);
            });
            return deferred.promise;
        };

        variableService.refreshCommonVariables = function(){
            var deferred = $q.defer();
            if($rootScope.syncingCommonVariables){
                console.log('Already called refreshCommonVariables within last 10 seconds!  Rejecting promise!');
                deferred.reject('Already called refreshCommonVariables within last 10 seconds!  Rejecting promise!');
                return deferred.promise;
            }

            if(!$rootScope.syncingCommonVariables){
                $rootScope.syncingCommonVariables = true;
                $timeout(function() {
                    // Set to false after 10 seconds because it seems to get stuck on true sometimes for some reason
                    $rootScope.syncingCommonVariables = false;
                }, 10000);

                var successHandler = function(commonVariables) {
                    localStorageService.setItem('commonVariables', JSON.stringify(commonVariables));
                    $rootScope.syncingCommonVariables = false;
                    deferred.resolve(commonVariables);
                };

                var errorHandler = function(err) {
                    $rootScope.syncingCommonVariables = false;
                    console.error(err);
                    if (typeof Bugsnag !== "undefined") {
                        Bugsnag.notify("ERROR: " + err, err, {}, "error");
                    }
                    deferred.reject(false);
                };

                var parameters = {
                    limit: 200,
                    sort: "-numberOfUserVariables",
                    numberOfUserVariables: "(gt)3"
                };


                QuantiModo.get('api/v1/public/variables',
                    ['category', 'includePublic', 'numberOfUserVariables'],
                    parameters,
                    successHandler,
                    errorHandler);

                return deferred.promise;
            }
        };

		return variableService;

	});