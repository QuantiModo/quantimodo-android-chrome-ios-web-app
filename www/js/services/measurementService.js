angular.module('starter')
	// Measurement Service
	.factory('measurementService', function($q, $rootScope, $ionicLoading, QuantiModo, localStorageService, ratingService) {

        //flag to indicate if data syncing is in progress
        var isSyncing = false;

		// service methods
		var measurementService = {

            getAllLocalMeasurements : function(){
                var primaryOutcomeMeasurements = localStorageService.getItemAsObject('allMeasurements');
                var measurementsQueue = localStorageService.getItemAsObject('measurementsQueue');
                if(measurementsQueue){
                    primaryOutcomeMeasurements = primaryOutcomeMeasurements.concat(measurementsQueue);
                }
                primaryOutcomeMeasurements = primaryOutcomeMeasurements.sort(function(a,b){
                    if(a.startTimeEpoch < b.startTimeEpoch){
                        return 1;}
                    if(a.startTimeEpoch> b.startTimeEpoch)
                    {return -1;}
                    return 0;
                });
                return ratingService.addInfoAndImagesToMeasurements(primaryOutcomeMeasurements);
            },

            // get data from QuantiModo API
            getMeasurements : function(){
                var deferred = $q.defer();
                isSyncing = true;

                $rootScope.lastSyncTime = localStorageService.getItemSync('lastSyncTime');
                if (!$rootScope.lastSyncTime) {
                	$rootScope.lastSyncTime = 0;
                }
                var nowDate = new Date();
                var lastSyncDate = new Date($rootScope.lastSyncTime);
                var milliSecondsSinceLastSync = nowDate - lastSyncDate;
                /*
                if(milliSecondsSinceLastSync < 5 * 60 * 1000){
                	$rootScope.$broadcast('updateCharts');
                	deferred.resolve();
               		return deferred.promise;
                }
                */

                // send request
                var params;
                var paramTime = moment($rootScope.lastSyncTime).subtract(15, 'minutes').format("YYYY-MM-DDTHH:mm:ss");
                params = {
                    variableName : config.appSettings.primaryOutcomeVariableDetails.name,
                    'updatedAt':'(ge)'+ paramTime ,
                    sort : '-startTimeEpoch',
                    limit:200,
                    offset:0
                };

                localStorageService.getItem('user', function(user){
                    if(!user){
                        deferred.resolve();
                    }
                });

                var getPrimaryOutcomeVariableMeasurements = function(params) {
                    QuantiModo.getV1Measurements(params, function(response){
                        // Do the stuff with adding to allMeasurements
                        if (response.length > 0 && response.length <= 200) {
                            // Update local data
                            var allMeasurements;
                            localStorageService.getItem('allMeasurements',function(allMeasurements){
                                allMeasurements = allMeasurements ? JSON.parse(allMeasurements) : [];

                                var filteredStoredMeasurements = [];
                                allMeasurements.forEach(function(storedMeasurement) {
                                    var found = false;
                                    var i = 0;
                                    while (!found && i < response.length) {
                                        var responseMeasurement = response[i];
                                        if (storedMeasurement.startTimeEpoch === responseMeasurement.startTimeEpoch &&
                                            storedMeasurement.id === responseMeasurement.id) {
                                            found = true;
                                        }
                                        i++;
                                    }
                                    if (!found) {
                                        filteredStoredMeasurements.push(storedMeasurement);
                                    }
                                });
                                allMeasurements = filteredStoredMeasurements.concat(response);

                                var s  = 9999999999999;
                                allMeasurements.forEach(function(x){
                                    if(!x.startTimeEpoch){
                                        x.startTimeEpoch = x.timestamp;
                                    }
                                    if(x.startTimeEpoch <= s){
                                        s = x.startTimeEpoch;
                                    }
                                });

                                // FIXME Is this right? Doesn't do what is described
                                // updating last updated time and data in local storage so that we syncing should continue from this point
                                // if user restarts the app or refreshes the page.
                                console.log("getPrimaryOutcomeVariableMeasurements is calling measurementService.setDates");
                                //measurementService.setDates(new Date().getTime(),s*1000);
                                console.debug("getPrimaryOutcomeVariableMeasurements: allMeasurements length is " + allMeasurements.length);
                                console.debug("getPrimaryOutcomeVariableMeasurements:  Setting allMeasurements to: ", allMeasurements);
                                localStorageService.setItem('allMeasurements', JSON.stringify(allMeasurements));
                                console.log("getPrimaryOutcomeVariableMeasurements broadcasting to update charts");
                                $rootScope.$broadcast('updateCharts');
                            });
                        }

                        if (response.length < 200 || params.offset > 2000) {
                            $rootScope.lastSyncTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
                            localStorageService.setItem('lastSyncTime', $rootScope.lastSyncTime);
                            console.log("Measurement sync completed and lastSyncTime set to " + $rootScope.lastSyncTime);
                            deferred.resolve(response);
                        } else if (response.length === 200 && params.offset < 2001) {
                            // Keep querying
                            params = {
                                variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                                'updatedAt':'(ge)'+ paramTime ,
                                sort : '-startTimeEpoch',
                                limit: 200,
                                offset: params.offset + 200
                            };
                            console.log('Keep querying because response.length === 200 && params.offset < 2001');
                            getPrimaryOutcomeVariableMeasurements(params);
                        }
                        else {
                            // More than 200 measurements returned, something is wrong
                            deferred.reject(false);
                        }

                    }, function(error){
                        deferred.reject(error);
                    });
                };

                getPrimaryOutcomeVariableMeasurements(params);
                
                return deferred.promise;
            },

            syncPrimaryOutcomeVariableMeasurements : function(){
                var defer = $q.defer();

                if(!$rootScope.user){
                    console.log('Not doing syncPrimaryOutcomeVariableMeasurements because we do not have a $rootScope.user');
                    defer.resolve();
                    return defer;
                }

                localStorageService.getItem('measurementsQueue',function(measurementsQueue) {

                    var measurementObjects = JSON.parse(measurementsQueue);

                    if(!measurementObjects || measurementObjects.length < 1){
                        console.debug('No measurements to sync!');
                        measurementService.getMeasurements().then(function(){
                            defer.resolve();
                        });
                    } else {
                        var measurements = [
                            {
                                variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                                source: config.get('clientSourceName'),
                                variableCategoryName: config.appSettings.primaryOutcomeVariableDetails.category,
                                combinationOperation: config.appSettings.primaryOutcomeVariableDetails.combinationOperation,
                                abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                                measurements: measurementObjects
                            }
                        ];

                        console.debug('Syncing ', measurementObjects);

                        QuantiModo.postMeasurementsV2(measurements, function (response) {
                            localStorageService.setItem('measurementsQueue', JSON.stringify([]));
                            measurementService.getMeasurements().then(function() {
                                defer.resolve();
                                console.log("success", response);
                            });
                        }, function (response) {
                            console.log("error", response);
                            defer.resolve();
                        });
                    }
                });

                return defer.promise;
            },

			// date setter from - to
			setDates : function(to, from){
                var oldFromDate = localStorageService.getItemSync('fromDate');
                var oldToDate = localStorageService.getItemSync('toDate');
                localStorageService.setItem('fromDate',parseInt(from));
				localStorageService.setItem('toDate',parseInt(to));
                // if date range changed, update charts
                if (parseInt(oldFromDate) !== parseInt(from) || parseInt(oldToDate) !== parseInt(to)) {
                    console.log("setDates broadcasting to update charts");
                    $rootScope.$broadcast('updateCharts');
                }

			},

			// retrieve date to end on
			getToDate : function(callback){
                localStorageService.getItem('toDate',function(toDate){
                    if(toDate){
                        callback(parseInt(toDate));
                    }else{
                        callback(parseInt(Date.now()));
                    }
                });

			},

			// retrieve date to start from
			getFromDate : function(callback){
                localStorageService.getItem('fromDate',function(fromDate){
                    if(fromDate){
                        callback(parseInt(fromDate));
                    }else{
                        var date = new Date();

                        // Threshold 20 Days if not provided
                        date.setDate(date.getDate()-20);

                        console.log("The date returned is ", date.toString());
                        callback(parseInt(date.getTime()));
                    }
                });
			},
            
            createPrimaryOutcomeMeasurement : function(numericRatingValue) {
                // if val is string (needs conversion)
                if(isNaN(parseFloat(numericRatingValue))){
                    numericRatingValue = config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] ?
                        config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] : false;
                }
                var startTimeEpoch  = new Date().getTime();
                var measurementObject = {
                    id: null,
                    variable: config.appSettings.primaryOutcomeVariableDetails.name,
                    variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                    variableCategoryName: config.appSettings.primaryOutcomeVariableDetails.category,
                    variableDescription: config.appSettings.primaryOutcomeVariableDetails.description,
                    startTimeEpoch: Math.floor(startTimeEpoch / 1000),
                    abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                    value: numericRatingValue,
                    note: "",
                    latitude: $rootScope.lastLatitude,
                    longitude: $rootScope.lastLongitude,
                    location: $rootScope.lastLocationNameAndAddress
                };
                return measurementObject;
            },

            // used when adding a new measurement from record measurement OR updating a measurement through the queue
            addToMeasurementsQueue : function(measurementObject){
                console.log("added to measurementsQueue: id = " + measurementObject.id);
                var deferred = $q.defer();

                localStorageService.getItem('measurementsQueue',function(measurementsQueue) {
                    measurementsQueue = measurementsQueue ? JSON.parse(measurementsQueue) : [];
                    // add to queue
                    measurementsQueue.push({
                        id: measurementObject.id,
                        variable: config.appSettings.primaryOutcomeVariableDetails.name,
                        variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                        variableCategoryName: measurementObject.variableCategoryName,
                        variableDescription: config.appSettings.primaryOutcomeVariableDetails.description,
                        startTimeEpoch: measurementObject.startTimeEpoch,
                        abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                        value: measurementObject.value,
                        note: measurementObject.note,
                        latitude: $rootScope.lastLatitude,
                        longitude: $rootScope.lastLongitude,
                        location: $rootScope.lastLocationNameAndAddress
                    });
                    //resave queue
                    localStorageService.setItem('measurementsQueue', JSON.stringify(measurementsQueue));
                });
                return deferred.promise;
            },

            // post a single measurement
            postTrackingMeasurement : function(measurementInfo, usePromise){

                var deferred = $q.defer();

                // make sure startTimeEpoch isn't in milliseconds
                var nowMilliseconds = new Date();
                var oneWeekInFuture = nowMilliseconds.getTime()/1000 + 7 * 86400;
                if(measurementInfo.startTimeEpoch > oneWeekInFuture){
                    measurementInfo.startTimeEpoch = measurementInfo.startTimeEpoch / 1000;
                    console.warn('Assuming startTime is in milliseconds since it is more than 1 week in the future');
                }

                if (measurementInfo.variableName === config.appSettings.primaryOutcomeVariableDetails.name) {
                    // Primary outcome variable - update through measurementsQueue
                    var found = false;
                    if (measurementInfo.prevStartTimeEpoch) {
                        localStorageService.getItemAsObject('measurementsQueue',function(measurementsQueue) {
                            var i = 0;
                            while (!found && i < measurementsQueue.length) {
                                if (measurementsQueue[i].startTimeEpoch === measurementInfo.prevStartTimeEpoch) {
                                    found = true;
                                    measurementsQueue[i].startTimeEpoch = measurementInfo.startTimeEpoch;
                                    measurementsQueue[i].value =  measurementInfo.value;
                                    measurementsQueue[i].note = measurementInfo.note;
                                }
                            }
                            localStorageService.setItem('measurementsQueue',JSON.stringify(measurementsQueue));
                        });

                    } else if(measurementInfo.id) {
                        var newAllMeasurements = [];
                        localStorageService.getItem('allMeasurements',function(oldAllMeasurements) {
                        	oldAllMeasurements = oldAllMeasurements ? JSON.parse(oldAllMeasurements) : [];
                            oldAllMeasurements.forEach(function (storedMeasurement) {
                                // look for edited measurement based on IDs
                                if (found || storedMeasurement.id !== measurementInfo.id) {
                                    // copy non-edited measurements to newAllMeasurements
                                    newAllMeasurements.push(storedMeasurement);
                                }
                                else {
                                    console.debug("edited measurement found in allMeasurements");
                                    // don't copy
                                    found = true;
                                }
                            });
                        });
                        console.debug("postTrackingMeasurement: newAllMeasurements length is " + newAllMeasurements.length);
                        console.debug("postTrackingMeasurement:  Setting allMeasurements to: ", newAllMeasurements);
                        localStorageService.setItem('allMeasurements', JSON.stringify(newAllMeasurements));
                        var editedMeasurement = {
                            id: measurementInfo.id,
                            variableName: measurementInfo.variableName,
                            source: config.get('clientSourceName'),
                            abbreviatedUnitName: measurementInfo.unit,
                            startTimeEpoch:  measurementInfo.startTimeEpoch,
                            value: measurementInfo.value,
                            variableCategoryName : measurementInfo.variableCategoryName,
                            note : measurementInfo.note,
                            combinationOperation : measurementInfo.isAvg? "MEAN" : "SUM",
                            latitude: $rootScope.lastLatitude,
                            longitude: $rootScope.lastLongitude,
                            location: $rootScope.lastLocationNameAndAddress
                        };
                        measurementService.addToMeasurementsQueue(editedMeasurement);

                    } else {
                        // adding primary outcome variable measurement from record measurements page
                        var newMeasurement = {
                            id: null,
                            variableName: measurementInfo.variableName,
                            source: config.get('clientSourceName'),
                            abbreviatedUnitName: measurementInfo.unit,
                            startTimeEpoch:  measurementInfo.startTimeEpoch,
                            value: measurementInfo.value,
                            variableCategoryName : measurementInfo.variableCategoryName,
                            note : measurementInfo.note,
                            combinationOperation : measurementInfo.isAvg? "MEAN" : "SUM",
                            latitude: $rootScope.lastLatitude,
                            longitude: $rootScope.lastLongitude,
                            location: $rootScope.lastLocationNameAndAddress
                        };
                        measurementService.addToMeasurementsQueue(newMeasurement);
                    }

                    measurementService.syncPrimaryOutcomeVariableMeasurements()
                        .then(function() {
                            if(usePromise) {
                                deferred.resolve();
                            }
                        });
                }
                else {
                    // Non primary outcome variable, post immediately
                    var measurementSourceName = config.get('clientSourceName');
                    if(measurementInfo.sourceName){
                        measurementSourceName = measurementInfo.sourceName;
                    }
                    // measurements set
                    var measurements = [
                        {
                            variableName: measurementInfo.variableName,
                            source: measurementSourceName,
                            variableCategoryName: measurementInfo.variableCategoryName,
                            abbreviatedUnitName: measurementInfo.abbreviatedUnitName,
                            combinationOperation : measurementInfo.isAvg? "MEAN" : "SUM",
                            measurements : [
                                {
                                    id: measurementInfo.id,
                                    startTimeEpoch:  measurementInfo.startTimeEpoch,
                                    value: measurementInfo.value,
                                    note : measurementInfo.note,
                                    latitude: $rootScope.lastLatitude,
                                    longitude: $rootScope.lastLongitude,
                                    location: $rootScope.lastLocationNameAndAddress
                                }
                            ]
                        }
                    ];

                    // for local
                    var measurement = {
                        variableName: measurementInfo.variableName,
                        source: config.get('clientSourceName'),
                        abbreviatedUnitName: measurementInfo.unit,
                        startTimeEpoch:  measurementInfo.startTimeEpoch,
                        value: measurementInfo.value,
                        variableCategoryName : measurementInfo.variableCategoryName,
                        note : measurementInfo.note,
                        combinationOperation : measurementInfo.isAvg? "MEAN" : "SUM",
                        latitude: $rootScope.lastLatitude,
                        longitude: $rootScope.lastLongitude,
                        location: $rootScope.lastLocationNameAndAddress
                    };

                    // send request
                    QuantiModo.postMeasurementsV2(measurements, function(response){
                        if(response.success) {
                            console.log("success", response);
                            if(usePromise) {
                                deferred.resolve();
                            }
                        } else {
                            console.log("error", response);
                            if(usePromise) {
                                deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");
                            }
                        }
                    }, function(response){
                        console.log("error", response);
                        if(usePromise) {
                            deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");
                        }
                    });
                }
                if(usePromise) {
                    return deferred.promise;
                }
            },

            postMeasurementByReminder: function(trackingReminder, modifiedValue) {

                // send request
                var value = trackingReminder.defaultValue;
                if(typeof modifiedValue !== "undefined" && modifiedValue !== null){
                    value = modifiedValue;
                }

                var startTimeEpochMilliseconds = new Date();
                var startTimeEpochSeconds = startTimeEpochMilliseconds/1000;
                // measurements set
                var measurementSet = [
                    {
                        variableName: trackingReminder.variableName,
                        source: config.get('clientSourceName'),
                        variableCategoryName: trackingReminder.variableCategoryName,
                        abbreviatedUnitName: trackingReminder.abbreviatedUnitName,
                        measurements : [
                            {
                                startTimeEpoch:  startTimeEpochSeconds,
                                value: value,
                                note : null,
                                latitude: $rootScope.lastLatitude,
                                longitude: $rootScope.lastLongitude,
                                location: $rootScope.lastLocationNameAndAddress
                            }
                        ]
                    }
                ];

                var deferred = $q.defer();

                QuantiModo.postMeasurementsV2(measurementSet, function(response){
                    if(response.success) {
                        console.log("success", response);
                        deferred.resolve();
                    } else {
                        deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");
                    }
                });

                return deferred.promise;
            },

            getHistoryMeasurements : function(params){
                var deferred = $q.defer();

                QuantiModo.getV1Measurements(params, function(response){
                    deferred.resolve(response);
                }, function(error){
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    deferred.reject(error);
                });

                return deferred.promise;
            },

            getMeasurementById : function(measurementId){
                var deferred = $q.defer();
                var params = {id : measurementId};
                QuantiModo.getV1Measurements(params, function(response){
                    var measurementArray = response;
                    if(!measurementArray[0]){
                        console.log('Could not get measurement with id: ' + measurementId);
                        deferred.reject();
                    }
                    var measurementObject = measurementArray[0];
                    deferred.resolve(measurementObject);
                }, function(error){
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    console.log(error);
                    deferred.reject();
                });
                return deferred.promise;
               
            },

            deleteMeasurementFromLocalStorage : function(measurement) {
                var deferred = $q.defer();
                localStorageService.deleteElementOfItemById('allMeasurements', measurement.id).then(function(){
                    deferred.resolve();
                });
                localStorageService.deleteElementOfItemByProperty('measurementQueue', 'startTimeEpoch',
                    measurement.startTimeEpoch).then(function (){
                    deferred.resolve();
                });
                return deferred.promise;
            },

            deleteMeasurementFromServer : function(measurement){
                var deferred = $q.defer();
                QuantiModo.deleteV1Measurements(measurement, function(response){
                    console.log("success", response);
                    deferred.resolve(response);
                }, function(response){
                    console.log("error", response);
                    deferred.reject();
                });
                return deferred.promise;
            },
		};
		return measurementService;
	});