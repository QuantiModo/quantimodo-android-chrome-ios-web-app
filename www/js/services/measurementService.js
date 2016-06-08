angular.module('starter')
	// Measurement Service
	.factory('measurementService', function($http, $q, QuantiModo, localStorageService, $rootScope){

        //flag to indicate if data syncing is in progress
        var isSyncing = false;

		// service methods
		var measurementService = {

            // get all data from date range to date range
            getAllLocalMeasurements : function(tillNow, callback){

                var allMeasurements;

                localStorageService.getItem('allMeasurements',function(measurementsFromLocalStorage){

                    measurementsFromLocalStorage = JSON.parse(measurementsFromLocalStorage);

                    var measurementsQueue = localStorageService.getItemAsObject('measurementsQueue');

                    if (measurementsFromLocalStorage) {
                        allMeasurements = measurementsFromLocalStorage.concat(measurementsQueue);
                    }
                    else {
                        allMeasurements = measurementsQueue;
                    }

                    // filtered measurements
                    var returnSorted = function(start, end){

                        allMeasurements = allMeasurements.sort(function(a, b){
                            if(!a.startTimeEpoch){
                                a.startTimeEpoch = a.timestamp;
                            }

                            if(!b.startTimeEpoch){
                                b.startTimeEpoch = b.timestamp;
                            }
                            return a.startTimeEpoch - b.startTimeEpoch;
                        });
						/*
                        var filtered = allMeasurements.filter(function(measurement){
                            if(!measurement.startTimeEpoch){
                                measurement.startTimeEpoch = measurement.timestamp;
                            }
                            return measurement.startTimeEpoch >= start && measurement.startTimeEpoch <= end;
                        });
                        */

                        return callback(allMeasurements);
                    };

                    if(!allMeasurements){
                        return callback(false);
                    }

                    // params
                    measurementService.getFromDate(function(start){
                        start = start / 1000;

                        var end;

                        if(tillNow){
                            end = Math.floor(Date.now()/1000);
                            returnSorted(start,end);
                        } else {
                            measurementService.getToDate(function(end){
                                end = end / 1000;
                                returnSorted(start,end);
                            });
                        }
                    });

                });
            },

            // get data from QuantiModo API
            getMeasurements : function(){
                var deferred = $q.defer();
                isSyncing = true;

                $rootScope.lastSyncTime = 0;

                localStorageService.getItem('lastSyncTime',function(lastSyncTime){
                    var nowDate = new Date();
                    var lastSyncDate = new Date(lastSyncTime);
                    var milliSecondsSinceLastSync = nowDate - lastSyncDate;
                    if(milliSecondsSinceLastSync < 5 * 60 * 1000){
                        deferred.resolve();
                        return deferred.promise;
                    }
                    if (lastSyncTime) {
                        $rootScope.lastSyncTime = lastSyncTime;
                    }

                });

                // send request
                var params;
                params = {
                    variableName : config.appSettings.primaryOutcomeVariableDetails.name,
                    'lastUpdated':'(ge)'+ $rootScope.lastSyncTime ,
                    sort : '-startTimeEpoch',
                    limit:200,
                    offset:0
                };

                localStorageService.getItem('user', function(user){
                    if(!user){
                        isSyncing = false;
                        deferred.resolve();
                    }
                });

                // send request
                QuantiModo.getMeasurements(params).then(function(response){
                    if(response){
                        localStorageService.setItem('lastSyncTime',moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
                        localStorageService.getItem('lastSyncTime',function(val){
                            $rootScope.lastSyncTime = val;
                            console.log("lastSyncTime is " + $rootScope.lastSyncTime);
                        });
                        // set flag
                        isSyncing = false;
                        deferred.resolve(response);
                        $rootScope.$broadcast('updateCharts');
                    }
                    else {
                        deferred.reject(false);
                    }
                }, function(response){
                    isSyncing = false;
                    $rootScope.isSyncing = false;
                    deferred.reject(false);
                }, function(response){
                    if(response){
                        if(response.length > 0){
                            // update local data
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

                                measurementService.setDates(new Date().getTime(),s*1000);
                                //updating last updated time and data in local storage so that we syncing should continue from this point
                                //if user restarts the app or refreshes the page.
                                localStorageService.setItem('allMeasurements',JSON.stringify(allMeasurements));
                                $rootScope.lastSyncTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
                                localStorageService.setItem('lastSyncTime', $rootScope.lastSyncTime);
                                console.log("lastSyncTime is " + $rootScope.lastSyncTime);

                            });

                        }
                    } else {
                        localStorageService.getItem('user', function(user){
                            if(!user){
                                isSyncing = false;
                                deferred.resolve();
                            }
                        });
                    }
                });
                
                return deferred.promise;
            },

            // sync the measurements in queue with QuantiModo API
            syncPrimaryOutcomeVariableMeasurements : function(){
                var defer = $q.defer();

                localStorageService.getItem('measurementsQueue',function(measurementsQueue) {

                    var measurementObjects = JSON.parse(measurementsQueue);

                    if(!measurementObjects || measurementObjects.length < 1){
                        defer.resolve();
                        console.debug('No measurements to sync!');
                        $rootScope.$broadcast('updateCharts');
                        return defer.promise;
                    }

                    // measurements set
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

                    // send request
                    QuantiModo.postMeasurementsV2(measurements, function (response) {
                        // success
                        measurementService.getMeasurements();
                        // clear queue
                        localStorageService.setItem('measurementsQueue', JSON.stringify([]));
                        defer.resolve();
                        console.log("success", response);

                    }, function (response) {
                        // error

                        // resave queue
                        localStorageService.setItem('measurementsQueue', JSON.stringify(measurementsQueue));
                        console.log("error", response);
                        defer.resolve();


                    });

                });

                return defer.promise;
            },

			// date setter from - to
			setDates : function(to, from){
				localStorageService.setItem('toDate',parseInt(to));
                localStorageService.setItem('fromDate',parseInt(from));
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

			// update primary outcome variable in local storage
            addToMeasurementsQueue : function(numericRatingValue){
                console.log("reported", numericRatingValue);
                var deferred = $q.defer();

                // if val is string (needs conversion)
                if(isNaN(parseFloat(numericRatingValue))){
                    numericRatingValue = config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] ?
                        config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] : false;
                }

                localStorageService.setItem('lastReportedPrimaryOutcomeVariableValue', numericRatingValue);
                //add to measurementsQueue to be synced later
                var startTimeEpoch  = new Date().getTime();
                // check queue
                localStorageService.getItem('measurementsQueue',function(measurementsQueue) {
                    measurementsQueue = measurementsQueue ? JSON.parse(measurementsQueue) : [];

                    // add to queue
                    measurementsQueue.push({
                        name: config.appSettings.primaryOutcomeVariableDetails.name,
                        variableDescription: config.appSettings.primaryOutcomeVariableDetails.description,
                        startTimeEpoch: Math.floor(startTimeEpoch / 1000),
                        abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                        value: numericRatingValue,
                        note: ""
                    });
                    //resave queue
                    localStorageService.setItem('measurementsQueue', JSON.stringify(measurementsQueue));
                });

                return deferred.promise;
            },

            // used when updating a measurement through the queue
            addExistingMeasurementToMeasurementsQueue : function(measurementObject){
                console.log("added existing measurement to measurementsQueue: " + measurementObject.id);
                var deferred = $q.defer();

                localStorageService.getItem('measurementsQueue',function(measurementsQueue) {
                    measurementsQueue = measurementsQueue ? JSON.parse(measurementsQueue) : [];
                    // add to queue
                    measurementsQueue.push({
                        //FIXME
                        id: measurementObject.id,
                        name: config.appSettings.primaryOutcomeVariableDetails.name,
                        variableDescription: config.appSettings.primaryOutcomeVariableDetails.description,
                        startTimeEpoch: measurementObject.startTimeEpoch,
                        abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                        value: measurementObject.value,
                        note: measurementObject.note
                    });
                    //resave queue
                    localStorageService.setItem('measurementsQueue', JSON.stringify(measurementsQueue));
                });
                return deferred.promise;
            },

            // adds to allMeasurements directly - not used for primary outcome variables
            postTrackingMeasurementLocally : function(measurementObject){
                var deferred = $q.defer();

                localStorageService.getItem('allMeasurements', function(allMeasurements){
                    allMeasurements = allMeasurements? JSON.parse(allMeasurements) : [];

                    // add to queue
                    allMeasurements.push(measurementObject);

                    //resave queue
                    localStorageService.setItem('allMeasurements', JSON.stringify(allMeasurements));

                    deferred.resolve();
                });

                return deferred.promise;
            },

            // post a single measurement
            postTrackingMeasurement : function(id, prevStartTimeEpoch, startTimeEpoch, variableName, value, unit,
                                               isAvg, variableCategoryName, note, usePromise){

                var deferred = $q.defer();

                if(note === ""){
                    note = null;
                }

                // make sure startTimeEpoch isn't in milliseconds
                var nowMilliseconds = new Date();
                var oneWeekInFuture = nowMilliseconds.getTime()/1000 + 7 * 86400;
                if(startTimeEpoch > oneWeekInFuture){
                    startTimeEpoch = startTimeEpoch / 1000;
                    console.warn('Assuming startTime is in milliseconds since it is more than 1 week in the future');
                }

                if (variableName === config.appSettings.primaryOutcomeVariableDetails.name) {
                    // Primary outcome variable - update through measurementsQueue
                    var found = false;
                    if (prevStartTimeEpoch) {
                        localStorageService.getItemAsObject('measurementsQueue',function(measurementsQueue) {
                            var i = 0;
                            while (!found && i < measurementsQueue.length) {
                                if (measurementsQueue[i].startTimeEpoch === prevStartTimeEpoch) {
                                    found = true;
                                    measurementsQueue[i].startTimeEpoch = startTimeEpoch;
                                    measurementsQueue[i].value =  value;
                                    measurementsQueue[i].note = note;
                                }
                            }
                            localStorageService.setItem('measurementsQueue',JSON.stringify(measurementsQueue));
                        });

                    } else if(id) {
                        var newAllMeasurements = [];
                        localStorageService.getItemAsObject('allMeasurements',function(oldAllMeasurements) {
                            oldAllMeasurements.forEach(function (storedMeasurement) {
                                // look for edited measurement based on IDs
                                if (found || storedMeasurement.id !== id) {
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
                        localStorageService.setItem('allMeasurements',JSON.stringify(newAllMeasurements));
                        var editedMeasurement = {
                            id: id,
                            variableName: variableName,
                            source: config.get('clientSourceName'),
                            abbreviatedUnitName: unit,
                            startTimeEpoch:  startTimeEpoch,
                            value: value,
                            variableCategoryName : variableCategoryName,
                            note : "",
                            combinationOperation : isAvg? "MEAN" : "SUM"
                        };
                        measurementService.addExistingMeasurementToMeasurementsQueue(editedMeasurement);

                    } else {
                        console.debug("error editing primary outcome variable measurement");
                    }
                    $rootScope.$broadcast('updateChartsAndSyncMeasurements');
                }
                else {
                    // Non primary outcome variable, post immediately

                    // measurements set
                    var measurements = [
                        {
                            variableName: variableName,
                            source: config.get('clientSourceName'),
                            variableCategoryName: variableCategoryName,
                            abbreviatedUnitName: unit,
                            combinationOperation : isAvg? "MEAN" : "SUM",
                            measurements : [
                                {
                                    startTimeEpoch:  startTimeEpoch,
                                    value: value,
                                    note : note
                                }
                            ]
                        }
                    ];

                    // for local
                    var measurement = {
                        variableName: variableName,
                        source: config.get('clientSourceName'),
                        abbreviatedUnitName: unit,
                        startTimeEpoch:  startTimeEpoch,
                        value: value,
                        variableCategoryName : variableCategoryName,
                        note : "",
                        combinationOperation : isAvg? "MEAN" : "SUM"
                    };

                    measurementService.postTrackingMeasurementLocally(measurement)
                        .then(function(){
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
                        });

                    if(usePromise) {
                        return deferred.promise;
                    }
                }
            },

            // edit existing measurement - NEVER USED
			editPrimaryOutcomeVariable : function(startTimeEpoch, val, note){
				var deferred = $q.defer();
				// measurements set
				var measurements = [
					{
					   	name: config.appSettings.primaryOutcomeVariableDetails.name,
                        source: config.get('clientSourceName'),
                        category: config.appSettings.primaryOutcomeVariableDetails.category,
                        combinationOperation: config.appSettings.primaryOutcomeVariableDetails.combinationOperation,
                        unit: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
					   	measurements : [{
					   		startTimeEpoch:  startTimeEpoch,
					   		value: val,
					   		note : (note && note !== null)? note : null
					   	}]
					}
				];

			   console.log(measurements);

			   var measurementDataSet;
               localStorageService.getItem('allMeasurements',function(allMeasurements){
                   measurementDataSet = JSON.parse(allMeasurements);
                   // extract the measurement from localStorage
                   var selectedMeasurementDataSetItems = measurementDataSet.filter(function(x){return x.startTimeEpoch === startTimeEpoch;});

                   // update localstorage data
                   var selectedMeasurementItem = selectedMeasurementDataSetItems[0];

                   // extract value
                   selectedMeasurementItem.value = val;
                   selectedMeasurementItem.note = (selectedMeasurementItem.note && selectedMeasurementItem.note !== null)? selectedMeasurementItem.note : null;

                   // update localstorage
                   localStorageService.setItem('allMeasurements',JSON.stringify(measurementDataSet));

                   // send request
                   QuantiModo.postMeasurementsV2(measurements, function(response){

                       console.log("success", response);
                       deferred.resolve();

                   }, function(response){

                       console.log("error", response);
                       //save in measurementsQueue
                       localStorageService.getItem('measurementsQueue',function(queue){
                          queue.push(measurements);
                          deferred.resolve();

                       });

                   });
               });

				return deferred.promise;
			},

            getHistoryMeasurements : function(params){
                var deferred = $q.defer();

                QuantiModo.getV1Measurements(params, function(response){
                    deferred.resolve(response);
                }, function(error){
                    deferred.reject(error);
                });

                return deferred.promise;
            },

            getMeasurementById : function(measurementId){
                var params = {id : measurementId};
                QuantiModo.getV1Measurements(params, function(response){
                    var measurementArray = response.data;
                    if(!measurementArray[0]){
                        console.log('Could not get measurement with id: ' + measurementId);
                        return;
                    }
                    var measurementObject = measurementArray[0];
                    return measurementObject;
                }, function(error){
                    console.log(error);
                });
            },

            deleteMeasurement : function(measurement){
                QuantiModo.deleteV1Measurements(measurement, function(response){
                    console.log("success", response);
                    // update local data
                    var found = false;
                    if (measurement.id) {
                        var newAllMeasurements = [];
                        localStorageService.getItem('allMeasurements',function(oldAllMeasurements) {
                            oldAllMeasurements = oldAllMeasurements ? JSON.parse(oldAllMeasurements) : [];

                            oldAllMeasurements.forEach(function (storedMeasurement) {
                                // look for deleted measurement based on IDs
                                if (storedMeasurement.id !== measurement.id) {
                                    // copy non-deleted measurements to newAllMeasurements
                                    newAllMeasurements.push(storedMeasurement);
                                }
                                else {
                                    console.debug("deleted measurement found in allMeasurements");
                                    found = true;
                                }
                            });
                        });
                        if (found) {
                            localStorageService.setItem('allMeasurements',JSON.stringify(newAllMeasurements));
                        }
                    }
                    else {
                        var newMeasurementsQueue = [];
                        localStorageService.getItemAsObject('measurementsQueue',function(oldMeasurementsQueue) {
                            oldMeasurementsQueue.forEach(function(queuedMeasurement) {
                                // look for deleted measurement based on startTimeEpoch and FIXME value
                                if (found || queuedMeasurement.startTimeEpoch !== measurement.startTimeEpoch) {
                                    newMeasurementsQueue.push(queuedMeasurement);
                                }
                                else {
                                    console.debug("deleted measurement found in measurementsQueue");
                                    // don't copy
                                    found = true;
                                }
                            });
                        });
                        if (found) {
                            localStorageService.setItem('measurementsQueue',JSON.stringify(newMeasurementsQueue));
                        }
                    }
                    if (!found){
                        console.debug("error: deleted measurement not found");
                    }


                }, function(response){
                    console.log("error", response);
                });
            },
		};
		return measurementService;
	});