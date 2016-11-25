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
            var showMoreUnitsObject = {
                name: "Show more units",
                abbreviatedName: "Show more units"
            };
            $rootScope.nonAdvancedAbbreviatedUnitNames.push(showMoreUnitsObject.abbreviatedName);
            $rootScope.nonAdvancedUnitObjects.push(showMoreUnitsObject);
            $rootScope.nonAdvancedUnitsIndexedByAbbreviatedName["Show more units"] = showMoreUnitsObject;
        }

        var unitService = {

            getUnits : function(){
                var deferred = $q.defer();

                localStorageService.getItem('units', function(unitsString){
                    if(typeof $rootScope.abbreviatedUnitNames === "undefined"){
                        $rootScope.abbreviatedUnitNames = [];
                    }
                    var unitObjects = JSON.parse(unitsString);

                    if(unitObjects && typeof(unitObjects[0].advanced) !== "undefined"){
                        addUnitsToRootScope(unitObjects);
                        deferred.resolve(unitObjects);
                    } else {
                        unitService.refreshUnits().then(function(unitObjects){
                            deferred.resolve(unitObjects);
                        });
                    }
                });
                
                return deferred.promise;
            },

            refreshUnits : function(){
                var deferred = $q.defer();
                QuantiModo.getUnits(function(unitObjects){
                    if(typeof $rootScope.abbreviatedUnitNames === "undefined"){
                        $rootScope.abbreviatedUnitNames = [];
                    }
                    localStorageService.setItem('units', JSON.stringify(unitObjects));
                    addUnitsToRootScope(unitObjects);
                    deferred.resolve(unitObjects);
                }, function(error){
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        };

        return unitService;
    });