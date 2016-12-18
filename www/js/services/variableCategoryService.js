angular.module('starter')
    // Variable Category Service
    .factory('variableCategoryService', function($filter, $q, quantimodoService, localStorageService) {

        // service methods
        return {

            // refresh local variable categories with quantimodoService API
            refreshVariableCategories : function(){
                var deferred = $q.defer();

                quantimodoService.getVariableCategories(function(vars){
                    localStorageService.setItem('variableCategories',JSON.stringify(vars));
                    deferred.resolve(vars);
                }, function(error){
                    deferred.reject(error);
                });

                return deferred.promise;
            },

            // get variable categories
            getVariableCategories : function(){
                var deferred = $q.defer();

                localStorageService.getItem('variableCategories',function(variableCategories){
                    if(variableCategories){
                        deferred.resolve(JSON.parse(variableCategories));
                    } else {
                        quantimodoService.getVariableCategories(function(variableCategories){
                            localStorageService.setItem('variableCategories', JSON.stringify(variableCategories));
                            deferred.resolve(variableCategories);
                        }, function(error){
                            deferred.reject(error);
                        });
                    }
                });

                return deferred.promise;
            },
            
            getVariableCategoryIcon : function(variableCategoryName){
                var variableCategoryInfo = quantimodoService.getVariableCategoryInfo(variableCategoryName);
                if(variableCategoryInfo.icon){
                    return variableCategoryInfo.icon;
                } else {
                    console.warn('Could not find icon for variableCategoryName ' + variableCategoryName);
                    return 'ion-speedometer';
                }
                
            }
        };

    });