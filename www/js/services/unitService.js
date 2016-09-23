angular.module('starter')
    // Measurement Service
    .factory('unitService', function($q, $rootScope, QuantiModo, localStorageService) {
        
        // service methods
        var unitService = {

            getUnits : function(){
                var deferred = $q.defer();

                localStorageService.getItem('units',function(units){
                    if(typeof $rootScope.abbreviatedUnitNames === "undefined"){
                        $rootScope.abbreviatedUnitNames = [];
                    }
                    if(units){
                        units = JSON.parse(units);
                        $rootScope.unitObjects = units;
                        $rootScope.abbreviatedUnitNamesIndexedByUnitId = [];
                        for(var i =0; i< $rootScope.unitObjects.length; i++){
                            $rootScope.abbreviatedUnitNames[i] = $rootScope.unitObjects[i].abbreviatedName;
                            $rootScope.unitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
                            $rootScope.abbreviatedUnitNamesIndexedByUnitId[units[i].id] = $rootScope.unitObjects[i].abbreviatedName;
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
                    $rootScope.abbreviatedUnitNamesIndexedByUnitId = [];
                    for(var i =0; i < $rootScope.unitObjects.length; i++){
                        $rootScope.abbreviatedUnitNames[i] = $rootScope.unitObjects[i].abbreviatedName;
                        $rootScope.unitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
                        $rootScope.abbreviatedUnitNamesIndexedByUnitId[units[i].id] = $rootScope.unitObjects[i].abbreviatedName;
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