angular.module('starter')
	// Measurement Service
	.factory('connectorsService', function($q, $rootScope, QuantiModo, timeService, localStorageService) {

		var connectorsService = {};

		connectorsService.getConnectors = function(){
			var deferred = $q.defer();
			localStorageService.getItem('connectors', function(connectors){
				if(connectors){
					connectors = JSON.parse(connectors);
					connectors = connectorsService.hideBrokenConnectors(connectors);
					deferred.resolve(connectors);
				} else {
					connectorsService.refreshConnectors().then(function(){
						deferred.resolve(connectors);
					});
				}
			});
			return deferred.promise;

		};

		connectorsService.refreshConnectors = function(){
			var deferred = $q.defer();
			QuantiModo.getConnectors(function(connectors){
				localStorageService.setItem('connectors', JSON.stringify(connectors));
				connectors = connectorsService.hideBrokenConnectors(connectors);
				deferred.resolve(connectors);
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

		connectorsService.connectWithParams = function(params, lowercaseConnectorName){
			var deferred = $q.defer();
			QuantiModo.connectConnectorWithParams(params, lowercaseConnectorName, function(){
				connectorsService.refreshConnectors();
			}, function(){
				deferred.reject(false);
			});
			return deferred.promise;
		};

		connectorsService.connectWithToken = function(body){
			var deferred = $q.defer();
			QuantiModo.connectConnectorWithToken(body, function(){
				connectorsService.refreshConnectors();
			}, function(){
				deferred.reject(false);
			});
			return deferred.promise;
		};

		connectorsService.connectWithAuthCode = function(code, lowercaseConnectorName){
			var deferred = $q.defer();
			QuantiModo.connectWithAuthCode(code, lowercaseConnectorName, function(){
				connectorsService.refreshConnectors();
			}, function(){
				deferred.reject(false);
			});
			return deferred.promise;
		};

		connectorsService.hideBrokenConnectors = function(connectors){
			for(var i = 0; i < connectors.length; i++){
				if(connectors[i].name === 'facebook' && $rootScope.isAndroid) {
					connectors[i].hide = true;
				}
			}
			return connectors;
		};

		return connectorsService;
	});