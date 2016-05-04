angular.module('starter')
    // Measurement Service
    .factory('unitService', function($http, $q, QuantiModo, localStorageService, $rootScope){
        
        // service methods
        var unitService = {
            
            // get units
            getUnits : function(){
                var deferred = $q.defer();

                localStorageService.getItem('units',function(units){
                    if(units){
                        deferred.resolve(JSON.parse(units));
                    } else {
                        QuantiModo.getUnits(function(units){
                            localStorageService.setItem('units',JSON.stringify(units));
                            deferred.resolve(units);
                        }, function(){
                            deferred.reject(false);
                        });
                    }
                });



                return deferred.promise;
            },

            // refresh local units with QuantiModo API
            refreshUnits : function(){
                localStorage.removeItem('units');
                var deferred = $q.defer();

                QuantiModo.getUnits(function(units){
                    localStorageService.setItem('units',JSON.stringify(units));
                    deferred.resolve(units);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },

            searchUnits:function(){
                var query = $scope.state.abbreviatedUnitName;
                if(query !== ""){
                    $scope.state.showUnits = true;
                    var matches = $scope.state.unitObjects.filter(function(unit) {
                        return unit.abbreviatedName.toLowerCase().indexOf(query.toLowerCase()) !== -1;
                    });

                    $timeout(function() {
                        $scope.state.searchedUnits = matches;
                    }, 100);


                } else $scope.state.showUnits = false;
            }
        };

        return unitService;
    });