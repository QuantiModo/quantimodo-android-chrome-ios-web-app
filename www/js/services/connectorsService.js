angular.module('starter')
	// Measurement Service
	.factory('connectorsService', function($q, $rootScope, QuantiModo, timeService, notificationService,
										 localStorageService) {

		var connectorsService = {};
		
		connectorsService.deleteReminder = function(reminderId){
			var deferred = $q.defer();

			localStorageService.deleteElementOfItemById('trackingReminders', reminderId);

			QuantiModo.deleteTrackingReminder(reminderId, function(response){
				if(response.success) {
					//update alarms and local notifications
					console.debug("remindersService:  Finished deleteReminder so now refreshTrackingRemindersAndScheduleAlarms");
					connectorsService.refreshTrackingRemindersAndScheduleAlarms();
					deferred.resolve();
				}
				else {
					deferred.reject();
				}
			}, function(err){
				if (typeof Bugsnag !== "undefined") {
					Bugsnag.notify(err, JSON.stringify(err), {}, "error");
				}
				deferred.reject(err);
			});

			return deferred.promise;
		};

		connectorsService.getConnectors = function(){

			var deferred = $q.defer();

			localStorageService.getItem('connectors', function(connectors){
				if(connectors){
					$rootScope.connectors = JSON.parse(connectors);
					deferred.resolve($rootScope.connectors);
				} else {
					connectorsService.refreshConnectors().then(function(){
						deferred.resolve($rootScope.connectors);
					});
				}
			});

			return deferred.promise;

		};

		connectorsService.refreshConnectors = function(){
			var deferred = $q.defer();
			QuantiModo.getConnectors(function(connectors){
				localStorageService.setItem('connectors', JSON.stringify(connectors));
				$rootScope.connectors = connectors;
				deferred.resolve($rootScope.connectors);
			}, function(){
				deferred.reject(false);
			});
			return deferred.promise;
		};

		connectorsService.disconnect = function(name){
			var deferred = $q.defer();
			QuantiModo.disconnectConnector(name, function(){
				connectorsService.refreshConnectors();
			}, function(){
				deferred.reject(false);
			});
			return deferred.promise;
		};

		connectorsService.connect = function(body){
			var deferred = $q.defer();
			QuantiModo.connectConnector(body, function(){
				connectorsService.refreshConnectors();
			}, function(){
				deferred.reject(false);
			});
			return deferred.promise;
		};

		connectorsService.getAccessTokenAndConnect = function(code, lowercaseConnectorName){
			var deferred = $q.defer();
			QuantiModo.getAccessTokenAndConnect(code, lowercaseConnectorName, function(){
				connectorsService.refreshConnectors();
			}, function(){
				deferred.reject(false);
			});
			return deferred.promise;
		};

		return connectorsService;
	});