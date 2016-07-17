angular.module('starter')
    // Measurement Service
    .factory('qmLocationService', function($http, $q){
        
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

            geocode : function($http) {
                var GOOGLE_MAPS_API_KEY = window.private_keys.GOOGLE_MAPS_API_KEY;

                if(!GOOGLE_MAPS_API_KEY){
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

           foursquare : function($http) {

               var FOURSQUARE_CLIENT_ID = window.private_keys.FOURSQUARE_CLIENT_ID;
               var FOURSQUARE_CLIENT_SECRET = window.private_keys.FOURSQUARE_CLIENT_SECRET;

               if(!FOURSQUARE_CLIENT_ID){
                   console.error('Please add FOURSQUARE_CLIENT_ID & FOURSQUARE_CLIENT_SECRET to private config');
               }

               function whatsAt(long,lat) {
                    return $http.get('https://api.foursquare.com/v2/venues/search?ll='+lat+','+long+
                        '&intent=browse&radius=30&client_id='+FOURSQUARE_CLIENT_ID+'&client_secret='+
                        FOURSQUARE_CLIENT_SECRET+'&v=20151201');
                }

                return {
                    whatsAt:whatsAt
                };
            },

        // get units
            trackLocationInBackground : function(){
                /**
                 * This callback will be executed every time a geolocation is recorded in the background.
                 */
                var callbackFn = function(location) {
                    console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);

                    // Do your HTTP request here to POST location to your server.
                    // jQuery.post(url, JSON.stringify(location));

                    /*
                     IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                     and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
                     IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                     */
                    backgroundGeolocation.finish();
                };

                var failureFn = function(error) {
                    console.log('BackgroundGeolocation error');
                };

                // BackgroundGeolocation is highly configurable. See platform specific configuration options
                backgroundGeolocation.configure(callbackFn, failureFn, {
                    desiredAccuracy: 10,
                    stationaryRadius: 20,
                    distanceFilter: 30,
                    debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
                    stopOnTerminate: false, // <-- enable this to clear background location settings when the app terminates
                });

                // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
                backgroundGeolocation.start();

                // If you wish to turn OFF background-tracking, call the #stop method.
                // backgroundGeolocation.stop();
            }
        };

        return qmLocationService;
    });