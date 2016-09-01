angular.module('starter')
	// Measurement Service
    .factory('migrationService', function($http, $q, QuantiModo, localStorageService, measurementService, $rootScope){


        // service methods
		var migrationService = {
			// get public variables
			version1466 : function(){
                var storedVersion = localStorageService.getItemAsObject('appMigrationVersion');
                if (!$rootScope.user && !storedVersion) {
                    localStorageService.setItem('appMigrationVersion', 1489);
                }
                else if (storedVersion < 1489){
                    console.debug('Running migration version version1489...');
                    localStorageService.getItem('allMeasurements',function(allMeasurements) {
                        if (typeof Bugsnag !== "undefined") {
                            Bugsnag.user = $rootScope.user;
                            Bugsnag.notify('Backing up user measurements', allMeasurements, {}, "error");
                        }
                        localStorageService.setItem('allMeasurementsBackup1489', allMeasurements);
                    });
                    localStorageService.deleteItem('allMeasurements');
                    localStorageService.deleteItem('lastSyncTime');
                    $scope.showLoader("Syncing ' + config.appSettings.primaryOutcomeVariableDetails.name + ' measurements...")
                    measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                        console.log("Measurement sync complete!");
                        $scope.hideLoader();
                    });
                    localStorageService.setItem('appMigrationVersion', 1489);
                }
			}
		};

		return migrationService;
	});