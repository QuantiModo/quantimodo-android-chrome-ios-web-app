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
                            $rootScope.unitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
                        }
                        deferred.resolve(units);
                    } else {
                        unitService.refreshUnits().then(function(){
                            deferred.resolve(units);
                        });
                    }
                });
                
                return deferred.promise;
            },

            refreshUnits : function(){
                var deferred = $q.defer();
                QuantiModo.getUnits(function(units){
                    if(typeof $rootScope.abbreviatedUnitNames === "undefined"){
                        $rootScope.abbreviatedUnitNames = [];
                    }
                    localStorageService.setItem('units', JSON.stringify(units));
                    $rootScope.unitObjects = units;
                    for(var i =0; i < $rootScope.unitObjects.length; i++){
                        $rootScope.abbreviatedUnitNames[i] = $rootScope.unitObjects[i].abbreviatedName;
                        $rootScope.unitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
                    }
                    deferred.resolve(units);
                }, function(){
                    deferred.reject(false);
                });
                return deferred.promise;
            }
        };

        return unitService;
    });