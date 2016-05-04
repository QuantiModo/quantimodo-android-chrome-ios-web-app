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

            searchVariablesByCategoryIncludePublic : function(variableSearchQuery, category){
                var deferred = $q.defer();



                return deferred.promise;
            },

			// refresh localstorage with updated variables from QuantiModo API
			refreshVariables : function(){
				var deferred = $q.defer();

				QuantiModo.getVariables(function(vars){

                    localStorageService.setItem('variables', JSON.stringify(vars));
					deferred.resolve(vars);
                    
				}, function(){
					deferred.reject(false);
				});

				return deferred.promise;
			},

            getVariablesByName : function(name){
                var deferred = $q.defer();

                // refresh always
                QuantiModo.getVariable(name, function(variable){
                    deferred.resolve(variable);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },            

			// get variables locally
			getVariables : function(){
				var deferred = $q.defer();

				// refresh always
		       	QuantiModo.getVariables(function(vars){
		       		localStorageService.setItem('variables',JSON.stringify(vars));
		       		console.log(vars);
		       		deferred.resolve(vars);
		       	}, function(){
		       		deferred.reject(false);
		       	});

		       return deferred.promise;
		   	},

            getVariablesByCategory : function(category){
                var deferred = $q.defer();

                // refresh always
                QuantiModo.getVariablesByCategory(category,function(vars){
                    localStorageService.setItem('variables',JSON.stringify(vars));
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