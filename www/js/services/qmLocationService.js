angular.module('starter')
    // Measurement Service
    .factory('qmLocationService', function($http, $q, $rootScope, localStorageService, measurementService,
                                           $cordovaGeolocation, $ionicPlatform){
        
        // service methods
        var qmLocationService = {

            getInfo: function (long, lat) {
                console.log('ok, in getInfo with ' + long + ',' + lat);
                var deferred = $q.defer();
                qmLocationService.foursquare($http).whatsAt(long, lat).then(function (result) {
                    //console.log('back from fq with '+JSON.stringify(result));
                    if (result.status === 200 && result.data.response.venues.length >= 1) {
                        var bestMatch = result.data.response.venues[0];
                        //convert the result to something the caller can use consistently
                        result = {
                            type: "foursquare",
                            name: bestMatch.name,
                            address: bestMatch.location.formattedAddress.join(", ")
                        };
                        console.dir(bestMatch);
                        deferred.resolve(result);
                    } else {
                        //ok, time to try google
                        qmLocationService.geocode($http).lookup(long, lat).then(function (result) {
                            console.log('back from google with ');
                            if (result.data && result.data.results && result.data.results.length >= 1) {
                                console.log('did i come in here?');
                                var bestMatch = result.data.results[0];
                                console.log(JSON.stringify(bestMatch));
                                result = {
                                    type: "geocode",
                                    address: bestMatch.formatted_address
                                };
                                deferred.resolve(result);
                            }
                        });
                    }
                });

                return deferred.promise;
            },

            geocode: function ($http) {
                var GOOGLE_MAPS_API_KEY = window.private_keys.GOOGLE_MAPS_API_KEY;

                if (!GOOGLE_MAPS_API_KEY) {
                    console.error('Please add GOOGLE_MAPS_API_KEY to private config');
                }

                function lookup(long, lat) {
                    return $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' +
                        long + '&key=' + GOOGLE_MAPS_API_KEY);
                }

                return {
                    lookup: lookup
                };
            },

            foursquare: function ($http) {

                var FOURSQUARE_CLIENT_ID = window.private_keys.FOURSQUARE_CLIENT_ID;
                var FOURSQUARE_CLIENT_SECRET = window.private_keys.FOURSQUARE_CLIENT_SECRET;

                if (!FOURSQUARE_CLIENT_ID) {
                    console.error('Please add FOURSQUARE_CLIENT_ID & FOURSQUARE_CLIENT_SECRET to private config');
                }

                function whatsAt(long, lat) {
                    return $http.get('https://api.foursquare.com/v2/venues/search?ll=' + lat + ',' + long +
                        '&intent=browse&radius=30&client_id=' + FOURSQUARE_CLIENT_ID + '&client_secret=' +
                        FOURSQUARE_CLIENT_SECRET + '&v=20151201');
                }

                return {
                    whatsAt: whatsAt
                };
            },

            setLocationVariables: function (result, currentTimeEpochSeconds) {
                if (result.name && result.name !== "undefined") {
                    $rootScope.lastLocationName = result.name;
                    localStorageService.setItem('lastLocationName', result.name);
                } else if (result.address && result.address !== "undefined") {
                    $rootScope.lastLocationName = result.address;
                    localStorageService.setItem('lastLocationName', result.address);
                } else {
                    console.error("Where's the damn location info?");
                }
                if (result.address) {
                    $rootScope.lastLocationAddress = result.address;
                    localStorageService.setItem('lastLocationAddress', result.address);
                    $rootScope.lastLocationResultType = result.type;
                    localStorageService.setItem('lastLocationResultType', result.type);
                    $rootScope.lastLocationUpdateTimeEpochSeconds = currentTimeEpochSeconds;
                    localStorageService.setItem('lastLocationUpdateTimeEpochSeconds', currentTimeEpochSeconds);
                    if($rootScope.lastLocationAddress === $rootScope.lastLocationName){
                        $rootScope.lastLocationNameAndAddress = $rootScope.lastLocationAddress;
                    } else{
                        $rootScope.lastLocationNameAndAddress = $rootScope.lastLocationName + " (" + $rootScope.lastLocationAddress + ")";
                    }
                    localStorageService.setItem('lastLocationNameAndAddress', $rootScope.lastLocationNameAndAddress);
                }
            },

            postLocationMeasurementAndSetLocationVariables : function (currentTimeEpochSeconds, result) {
                var variableName = false;
                if ($rootScope.lastLocationName && $rootScope.lastLocationName !== "undefined") {
                    variableName = $rootScope.lastLocationName;
                } else if ($rootScope.lastLocationAddress && $rootScope.lastLocationAddress !== "undefined") {
                    variableName = $rootScope.lastLocationAddress;
                } else {
                    console.error("Where's the damn location info?");
                }
                var secondsAtLocation = currentTimeEpochSeconds - $rootScope.lastLocationUpdateTimeEpochSeconds;
                var hoursAtLocation = Math.round(secondsAtLocation/3600 * 100) / 100;
                if (variableName && variableName !== "undefined" && secondsAtLocation > 60) {
                    var newMeasurement = {
                        variableName: variableName,
                        abbreviatedUnitName: 'h',
                        startTimeEpoch: $rootScope.lastLocationUpdateTimeEpochSeconds,
                        sourceName: $rootScope.lastLocationResultType,
                        value: hoursAtLocation,
                        variableCategoryName: 'Location',
                        note: $rootScope.lastLocationAddress,
                        combinationOperation: "SUM"
                    };
                    measurementService.postTrackingMeasurement(newMeasurement);
                    qmLocationService.setLocationVariables(result, currentTimeEpochSeconds);
                }
            },

            getLocationVariablesFromLocalStorage : function () {
                localStorageService.getItem('trackLocation', function(trackLocation){
                    console.debug("trackLocation from local storage is " + trackLocation);
                    if(trackLocation === "null"){
                        localStorageService.setItem('trackLocation', false);
                        $rootScope.trackLocation = false;
                    }
                    $rootScope.trackLocation = trackLocation === "true";
                });
                if($rootScope.trackLocation){
                    $rootScope.lastLocationName = localStorageService.getItemSync('lastLocationName');
                    $rootScope.lastLocationAddress = localStorageService.getItemSync('lastLocationAddress');
                    $rootScope.lastLocationResultType = localStorageService.getItemSync('lastLocationResultType');
                    $rootScope.lastLocationUpdateTimeEpochSeconds = localStorageService.getItemSync('lastLocationUpdateTimeEpochSeconds');
                    $rootScope.lastLocationNameAndAddress = localStorageService.getItemSync('lastLocationNameAndAddress');
                }

            },

            updateLocationVariablesAndPostMeasurementIfChanged : function () {
                qmLocationService.getLocationVariablesFromLocalStorage();
                if(!$rootScope.trackLocation){
                    return;
                }
                $ionicPlatform.ready(function() {
                    var posOptions = {
                        enableHighAccuracy: true,
                        timeout: 20000,
                        maximumAge: 0
                    };

                    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                        $rootScope.lastLatitude  = position.coords.latitude;
                        localStorageService.setItem('lastLatitude', position.coords.latitude);
                        $rootScope.lastLongitude = position.coords.longitude;
                        localStorageService.setItem('lastLongitude', position.coords.longitude);

                        qmLocationService.getInfo($rootScope.lastLongitude, $rootScope.lastLatitude).then(function(result) {
                            console.log('Result was '+JSON.stringify(result));
                            if(result.type === 'foursquare') {
                                console.log('Foursquare location name is ' + result.name + ' located at ' + result.address);
                            } else if (result.type === 'geocode') {
                                console.log('geocode address is ' + result.address);
                            } else {
                                var map = 'https://maps.googleapis.com/maps/api/staticmap?center='+
                                    $rootScope.lastLatitude+','+$rootScope.lastLongitude+
                                    'zoom=13&size=300x300&maptype=roadmap&markers=color:blue%7Clabel:X%7C'+
                                    $rootScope.lastLatitude+','+$rootScope.lastLongitude;
                                console.log('Sorry, I\'ve got nothing. But here is a map!');
                            }

                            var currentTimeEpochMilliseconds = new Date().getTime();
                            var currentTimeEpochSeconds = Math.round(currentTimeEpochMilliseconds/1000);
                            if(!$rootScope.lastLocationUpdateTimeEpochSeconds && result.address && result.address !== "undefined"){
                                qmLocationService.setLocationVariables(result, currentTimeEpochSeconds);
                            } else {
                                if(result.address && result.address !== "undefined" &&
                                    ($rootScope.lastLocationAddress !== result.address || $rootScope.lastLocationName !== result.name)){
                                    qmLocationService.postLocationMeasurementAndSetLocationVariables(currentTimeEpochSeconds, result);
                                }
                            }
                        });

                        console.debug("My coordinates are: ", position.coords);

                    }, function(err) {
                        console.log(err);
                    });

                });
            }
        };

        return qmLocationService;
    });