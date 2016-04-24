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
                var query = $scope.state.unit_text;
                if(query !== ""){
                    $scope.flags.show_units = true;
                    var matches = $scope.state.units.filter(function(unit) {
                        return unit.abbreviatedName.toLowerCase().indexOf(query.toLowerCase()) !== -1;
                    });

                    $timeout(function() {
                        $scope.state.searchedUnits = matches;
                    }, 100);


                } else $scope.state.show_units = false;
            }
        };

        return unitService;
    });