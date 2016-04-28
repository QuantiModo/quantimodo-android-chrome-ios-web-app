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
            },

            populateVariableSearchResults: function (variableCategoryName) {

                utils.startLoading();
                // get user token
                authService.getAccessTokenFromAnySource().then(function(token){

                    if(!variableCategoryName){
                        // get all variables
                        console.log('Get most recent anything variables');
                        variableService.searchVariablesIncludePublic('*').then(function(variables){

                            $scope.variableSearchResults = variables;
                            utils.stopLoading();

                        }, function(){
                            utils.stopLoading();
                        });
                    } else {
                        console.log('get all variables by category');
                        variableService.searchVariablesIncludePublic('*', $scope.state.variableCategoryName).then(function(variables){

                            $scope.variableSearchResults = variables;

                            utils.stopLoading();

                        }, function(){
                            utils.stopLoading();
                        });
                    }

                }, function(){
                    utilsService.showLoginRequiredAlert($scope.login);
                    utils.stopLoading();

                });

            }
		};

		return variableService;
	});