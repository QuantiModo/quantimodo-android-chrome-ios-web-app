angular.module('starter')
	.factory('variableService', function($q, $rootScope, QuantiModo, localStorageService, $timeout) {

	    var variableService = {};


        // get user variables (without public)
        variableService.searchUserVariables = function(variableSearchQuery, params){

            if($rootScope.lastSearchUserVariablesPromise){
                var message = 'Got new search request before last one completed';
                console.debug(message);
                $rootScope.lastSearchUserVariablesPromise.reject();
                $rootScope.lastSearchUserVariablesPromise = null;
            }

            $rootScope.lastSearchUserVariablesPromise = $q.defer();

            if(!variableSearchQuery){
                variableSearchQuery = '*';
            }

            QuantiModo.searchUserVariables(variableSearchQuery, params, function(vars){
                if($rootScope.lastSearchUserVariablesPromise){
                    $rootScope.lastSearchUserVariablesPromise.resolve(vars);
                    $rootScope.lastSearchUserVariablesPromise = null;
                }
            }, function(error){
                $rootScope.lastSearchUserVariablesPromise.reject(error);
                $rootScope.lastSearchUserVariablesPromise = null;
            });

            return $rootScope.lastSearchUserVariablesPromise.promise;
        };

        variableService.getVariablesByName = function(name, params){
            var deferred = $q.defer();

            // refresh always
            QuantiModo.getVariablesByName(name, params, function(variable){
                deferred.resolve(variable);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        };

        variableService.getPublicVariablesByName = function(name) {
            var deferred = $q.defer();
            QuantiModo.getPublicVariablesByName(name, function(variable){
                deferred.resolve(variable);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;

        };

        // post changes to user variable settings
        variableService.postUserVariable = function(userVariable) {
            var deferred = $q.defer();
            QuantiModo.postUserVariable(userVariable, function(userVariable) {
                deferred.resolve(userVariable);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        };

        variableService.resetUserVariable = function(variableId) {
            var deferred = $q.defer();
            var body = {variableId: variableId};
            QuantiModo.resetUserVariable(body, function(userVariable) {
                deferred.resolve(userVariable);
            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        };

        variableService.getVariableById = function(variableId){
            var deferred = $q.defer();

            // refresh always
            QuantiModo.getVariableById(variableId, function(variable){
                deferred.resolve(variable);
            }, function(error){
                deferred.reject(error);
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
                if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); }
                console.error('Error deleting all measurements for variable: ', error);
                deferred.reject(error);
            });

            return deferred.promise;
        };

        variableService.getUserVariables = function(params){
            var deferred = $q.defer();
            var userVariables = localStorageService.getElementsFromItemWithRequestParams(
                'userVariables', params);

            if(userVariables && userVariables.length > 0){
                deferred.resolve(userVariables);
                return deferred.promise;
            }

            if(localStorageService.getItemSync('userVariables') === "[]"){
                deferred.resolve([]);
                return deferred.promise;
            }

            userVariables = JSON.parse(localStorageService.getItemSync('userVariables'));
            if(userVariables && userVariables.length && typeof userVariables[0].manualTracking !== "undefined"){
                console.debug("We already have userVariables that didn't match filters so no need to refresh them");
                deferred.resolve([]);
                return deferred.promise;
            }

            variableService.refreshUserVariables().then(function () {
                userVariables = localStorageService.getElementsFromItemWithRequestParams(
                    'userVariables', params);
                deferred.resolve(userVariables);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        variableService.refreshUserVariables = function(){
            var deferred = $q.defer();
            if($rootScope.syncingUserVariables){
                console.warn('Already called refreshUserVariables within last 10 seconds!  Rejecting promise!');
                deferred.reject('Already called refreshUserVariables within last 10 seconds!  Rejecting promise!');
                return deferred.promise;
            }

            if(!$rootScope.syncingUserVariables){
                $rootScope.syncingUserVariables = true;
                console.debug('Setting refreshUserVariables timeout');
                $timeout(function() {
                    // Set to false after 10 seconds because it seems to get stuck on true sometimes for some reason
                    $rootScope.syncingUserVariables = false;
                }, 10000);

                var parameters = {
                    limit: 200,
                    sort: "-latestMeasurementTime"
                };

                QuantiModo.getUserVariables(parameters, function(userVariables){
                    localStorageService.setItem('userVariables', JSON.stringify(userVariables))
                        .then(function () {
                            $rootScope.$broadcast('populateUserVariables');
                            $rootScope.syncingUserVariables = false;
                        });
                    deferred.resolve(userVariables);
                }, function(error){
                    $rootScope.syncingUserVariables = false;
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        };

        variableService.getCommonVariables = function(params){
            var deferred = $q.defer();
            var commonVariables = localStorageService.getElementsFromItemWithRequestParams(
                'commonVariables', params);

            if(commonVariables && commonVariables.length && typeof commonVariables[0].manualTracking !== "undefined"){
                deferred.resolve(commonVariables);
                return deferred.promise;
            }

            commonVariables = JSON.parse(localStorageService.getItemSync('commonVariables'));
            if(commonVariables && commonVariables.length && typeof commonVariables[0].manualTracking !== "undefined"){
                console.debug("We already have commonVariables that didn't match filters so no need to refresh them");
                deferred.resolve([]);
                return deferred.promise;
            }

            variableService.refreshCommonVariables().then(function () {
                commonVariables = localStorageService.getElementsFromItemWithRequestParams(
                    'commonVariables', params);
                deferred.resolve(commonVariables);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        variableService.refreshCommonVariables = function(){
            var deferred = $q.defer();
            if($rootScope.syncingCommonVariables){
                console.warn('Already called refreshCommonVariables within last 10 seconds!  Rejecting promise!');
                deferred.reject('Already called refreshCommonVariables within last 10 seconds!  Rejecting promise!');
                return deferred.promise;
            }

            if(!$rootScope.syncingCommonVariables){
                $rootScope.syncingCommonVariables = true;
                console.debug('Setting refreshCommonVariables timeout');
                $timeout(function() {
                    // Set to false after 10 seconds because it seems to get stuck on true sometimes for some reason
                    $rootScope.syncingCommonVariables = false;
                }, 10000);

                var successHandler = function(commonVariables) {
                    localStorageService.setItem('commonVariables', JSON.stringify(commonVariables)).then(function () {
                        $rootScope.$broadcast('populateCommonVariables');
                    });
                    $rootScope.syncingCommonVariables = false;
                    deferred.resolve(commonVariables);
                };

                var errorHandler = function(error) {
                    $rootScope.syncingCommonVariables = false;
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify("ERROR: " + JSON.stringify(error), JSON.stringify(error), {}, "error"); } console.error(error);
                    deferred.reject(error);
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