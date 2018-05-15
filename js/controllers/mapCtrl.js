angular.module('starter') // Controls the settings page
.controller('MapCtrl', ["$scope", "$cordovaGeolocation", "$ionicLoading", "$ionicPlatform", "$rootScope", function($scope, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $rootScope) {
	$ionicPlatform.ready(function() {

		qmService.navBar.setFilterBarSearchIcon(false);

		$ionicLoading.show({template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'});

		function callback(results, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var place = results[i];
					//createMarker(results[i]);
					window.qmLog.debug('Place is ', null, place);
				}
			}
		}

		var posOptions = {
			enableHighAccuracy: true,
			timeout: 20000,
			maximumAge: 0
		};

		$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
			var lat  = position.coords.latitude;
			var long = position.coords.longitude;

			var myLatlng = new google.maps.LatLng(lat, long);

			var mapOptions = {
				center: myLatlng,
				zoom: 16,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};

			var map = new google.maps.Map(document.getElementById("map"), mapOptions);

			$scope.map = map;

			var request = {
				location: myLatlng,
				radius: '100',
				//types: ['store']
			};

			var service = new google.maps.places.PlacesService(map);
			service.nearbySearch(request, callback);

			qmService.hideLoader();

		}, function(error) {
			qmService.hideLoader();
			qmLogService.error(null, error);
		});


	});
}]);
