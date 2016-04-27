angular.module('starter')
    // Variable Category Service
    .factory('variablesService', function($filter){

        var variablesService = {
            populateVariableSearchResults: function (variableCategoryName) {

                utils.startLoading();
                // get user token
                authService.getAccessTokenFromAnySource().then(function(token){

                    if(!variableCategoryName){
                        // get all variables
                        console.log('Get most recent anything variables');
                        measurementService.searchVariablesIncludePublic('*').then(function(variables){
                            
                            $scope.variableSearchResults = variables;
                            utils.stopLoading();

                        }, function(){
                            utils.stopLoading();
                        });
                    } else {
                        console.log('get all variables by category');
                        measurementService.searchVariablesIncludePublic('*', $scope.state.variableCategoryName).then(function(variables){
                            
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

        return variablesService;
    });