angular.module('starter')
	// Measurement Service
	.factory('variableService', function($http, $q, QuantiModo, localStorageService, $rootScope){

        
		// service methods
		var variableService = {

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

		return variableService;
	});