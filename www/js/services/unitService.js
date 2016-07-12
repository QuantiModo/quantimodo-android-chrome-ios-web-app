angular.module('starter')
    // Measurement Service
    .factory('unitService', function($http, $q, QuantiModo, localStorageService, $rootScope){
        
        // service methods
        var unitService = {
            
            // get units
            getUnits : function(){
                var deferred = $q.defer();

                localStorageService.getItem('units',function(units){
                    if(typeof $rootScope.abbreviatedUnitNames === "undefined"){
                        $rootScope.abbreviatedUnitNames = [];
                    }
                    if(units){
                        units = JSON.parse(units);
                        $rootScope.unitObjects = units;
                        for(var i =0; i< $rootScope.unitObjects.length; i++){
                            $rootScope.abbreviatedUnitNames[i] = $rootScope.unitObjects[i].abbreviatedName;
                        }
                        deferred.resolve(units);
                    } else {
                        QuantiModo.getUnits(function(units){
                            localStorageService.setItem('units', JSON.stringify(units));
                            $rootScope.unitObjects = units;
                            for(var i =0; i< $rootScope.unitObjects.length; i++){
                                $rootScope.abbreviatedUnitNames[i] = $rootScope.unitObjects[i].abbreviatedName;
                            }
                            deferred.resolve(units);
                        }, function(){
                            deferred.reject(false);
                        });
                    }
                });
                
                return deferred.promise;
            }
        };

        return unitService;
    });