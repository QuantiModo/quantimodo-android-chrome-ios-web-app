angular.module('starter')
	// Measurement Service
	.factory('variableService', function($http, $q, QuantiModo, localStorageService, authService, utilsService){

        
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

            getUserVariables : function(variableCategoryName){
                var deferred = $q.defer();

                var userVariables = localStorageService.getElementsFromItemWithFilters(
                    'userVariables', 'variableCategoryName', variableCategoryName);
                if(userVariables && userVariables.length > 0){
                    deferred.resolve(userVariables);
                    return deferred.promise;
                }

                QuantiModo.getUserVariables(variableCategoryName, function(userVariables){
                    localStorageService.setItem('userVariables', JSON.stringify(userVariables));
                    console.log(vars);
                    deferred.resolve(vars);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            }
		};

		return variableService;
	});