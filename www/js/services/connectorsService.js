angular.module('starter')
	// Measurement Service
	.factory('connectorsService', function($q, $rootScope, QuantiModo, timeService, localStorageService) {

		var connectorsService = {};

		connectorsService.getConnectors = function(){
			var deferred = $q.defer();
			localStorageService.getItem('connectors', function(connectors){
				if(connectors){
					$rootScope.connectors = JSON.parse(connectors);
					connectorsService.hideBrokenConnectors($rootScope.connectors);
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
				connectorsService.hideBrokenConnectors(connectors);
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
			$rootScope.connectors = connectors;
			for(var i = 0; i < $rootScope.connectors.length; i++){
				if($rootScope.connectors[i].name === 'facebook' && $rootScope.isAndroid) {
					$rootScope.connectors[i].hide = true;
				}
			}
		};

		return connectorsService;
	});