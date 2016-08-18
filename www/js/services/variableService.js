angular.module('starter')
	// Measurement Service
	.factory('variableService', function($q, $rootScope, QuantiModo, localStorageService) {

        
		// service methods
		return {

			// get public variables
			searchVariablesIncludePublic : function(variableSearchQuery, variableCategoryName){
				var deferred = $q.defer();

                if(!variableSearchQuery){
                    variableSearchQuery = '*';
                }

                if(variableCategoryName){
                    QuantiModo.searchVariablesByCategoryIncludePublic(variableSearchQuery, variableCategoryName, function(vars){
                        deferred.resolve(vars);
                    }, function(){
                        deferred.reject(false);
                    });
                } else {
                    QuantiModo.searchVariablesIncludePublic(variableSearchQuery, function(vars){
                        deferred.resolve(vars);
                    }, function(){
                        deferred.reject(false);
                    });
                }
                
				return deferred.promise;
			},


            // get user variables (without public)
            searchUserVariables : function(variableSearchQuery, variableCategoryName){
                var deferred = $q.defer();

                if(!variableSearchQuery){
                    variableSearchQuery = '*';
                }

                if(variableCategoryName){
                    QuantiModo.searchUserVariablesByCategory(variableSearchQuery, variableCategoryName, function(vars){
                        deferred.resolve(vars);
                    }, function(){
                        deferred.reject(false);
                    });
                } else {
                    QuantiModo.searchUserVariables(variableSearchQuery, function(vars){
                        deferred.resolve(vars);
                    }, function(){
                        deferred.reject(false);
                    });
                }

                return deferred.promise;
            },

            getVariablesByName : function(name){
                var deferred = $q.defer();

                // refresh always
                QuantiModo.getVariablesByName(name, function(variable){
                    deferred.resolve(variable);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },
            
            getPublicVariablesByName : function(name) {
                var deferred = $q.defer();
                QuantiModo.getPublicVariablesByName(name, function(variable){
                    deferred.resolve(variable);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
                
            },

            // post changes to user variable settings
            postUserVariable : function(userVariable) {
                var deferred = $q.defer();
                QuantiModo.postUserVariable(userVariable, function(userVariable) {
                    deferred.resolve(userVariable);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },

            resetUserVariable : function(variableId) {
                var deferred = $q.defer();
                var body = {variableId: variableId};
                QuantiModo.resetUserVariable(body, function(userVariable) {
                    deferred.resolve(userVariable);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },

            getVariableById : function(variableId){
                var deferred = $q.defer();

                // refresh always
                QuantiModo.getVariableById(variableId, function(variable){
                    deferred.resolve(variable);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },

            deleteAllMeasurementsForVariable : function(variableId) {
                var deferred = $q.defer();
                QuantiModo.deleteUserVariableMeasurements(variableId, function() {
                    // Delete user variable from local storage
                    localStorageService.deleteElementOfItemById('userVariables', variableId);
                    deferred.resolve();
                }, function(error) {
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    console.log('Error deleting all measurements for variable: ', error);
                    deferred.reject(error);
                });
                
                return deferred.promise;
            },

            refreshUserVariables : function(){
                if(!$rootScope.syncingUserVariables){
                    $rootScope.syncingUserVariables = true;
                    var deferred = $q.defer();

                    QuantiModo.getUserVariables(null, function(userVariables){
                        localStorageService.setItem('userVariables', JSON.stringify(userVariables));
                        $rootScope.syncingUserVariables = false;
                        deferred.resolve(userVariables);
                    }, function(){
                        $rootScope.syncingUserVariables = false;
                        deferred.reject(false);
                    });

                    return deferred.promise;
                }
            },

            refreshCommonVariables : function(){
                if(!$rootScope.syncingCommonVariables){
                    $rootScope.syncingCommonVariables = true;
                    var deferred = $q.defer();

                    var successHandler = function(commonVariables) {
                        localStorageService.setItem('commonVariables', JSON.stringify(commonVariables));
                        $rootScope.syncingCommonVariables = false;
                        deferred.resolve(commonVariables);
                    };

                    var errorHandler = function(err) {
                        $rootScope.syncingCommonVariables = false;
                        console.error(err);
                        Bugsnag.notify("ERROR: "+ err, err, {}, "error");
                        deferred.reject(false);
                    };
                    
                    var parameters = {
                        limit: 200,
                        sort: "-numberOfUserVariables",
                        numberOfUserVariables: "(gt)5"
                    };
                    

                    QuantiModo.get('api/v1/public/variables',
                        ['category', 'includePublic', 'numberOfUserVariables'],
                        parameters,
                        successHandler,
                        errorHandler);

                    return deferred.promise;
                }
            }
		};

	});