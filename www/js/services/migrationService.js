angular.module('starter')
	// Measurement Service
	.factory('migrationService', function($http, $q, QuantiModo, localStorageService, measurementService, $rootScope){
        
		// service methods
		var migrationService = {
			// get public variables
			version1466 : function(){
                var storedVersion = localStorageService.getItemAsObject('appVersion');
                if($rootScope.user && storedVersion < 1466){
                    console.debug('Running migration version version1466...');
                    localStorageService.deleteItem('allMeasurements');
                    localStorageService.deleteItem('lastSyncTime');
                    measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                        console.log("Measurement sync complete!");
                        $rootScope.isSyncing = false;
                    });
                    localStorageService.setItem('appVersion', 1466);
                }
			}
		};

		return migrationService;
	});