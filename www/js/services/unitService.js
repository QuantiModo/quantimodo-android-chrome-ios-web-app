angular.module('starter')
    // Measurement Service
    .factory('unitService', function($q, $rootScope, QuantiModo, localStorageService) {
        
        // service methods
        function addUnitsToRootScope(units) {
            $rootScope.unitObjects = units;
            $rootScope.abbreviatedUnitNamesIndexedByUnitId = [];
            $rootScope.nonAdvancedAbbreviatedUnitNames = [];
            $rootScope.nonAdvancedUnitsIndexedByAbbreviatedName = [];
            $rootScope.nonAdvancedAbbreviatedUnitNamesIndexedByUnitId = [];
            $rootScope.nonAdvancedUnitObjects = [];
            for (var i = 0; i < units.length; i++) {
                $rootScope.abbreviatedUnitNames[i] = units[i].abbreviatedName;
                $rootScope.unitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
                $rootScope.abbreviatedUnitNamesIndexedByUnitId[units[i].id] = units[i].abbreviatedName;

                if(!units[i].advanced){
                    $rootScope.nonAdvancedAbbreviatedUnitNames.push(units[i].abbreviatedName);
                    $rootScope.nonAdvancedUnitObjects.push(units[i]);
                    $rootScope.nonAdvancedUnitsIndexedByAbbreviatedName[units[i].abbreviatedName] = units[i];
                    $rootScope.nonAdvancedAbbreviatedUnitNamesIndexedByUnitId[units[i].id] = units[i].abbreviatedName;
                }
            }
        }

        var unitService = {

            getUnits : function(){
                var deferred = $q.defer();

                localStorageService.getItem('units',function(units){
                    if(typeof $rootScope.abbreviatedUnitNames === "undefined"){
                        $rootScope.abbreviatedUnitNames = [];
                    }
                    if(units && units !== null && units !== "null" && typeof(units[0].advanced) !== "undefined"){
                        units = JSON.parse(units);
                        addUnitsToRootScope(units);
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
                    addUnitsToRootScope(units);
                    deferred.resolve(units);
                }, function(error){
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        };

        return unitService;
    });