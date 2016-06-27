angular.module('starter')
	// Measurement Service
	.factory('measurementService', function($http, $q, QuantiModo, localStorageService, $rootScope, $ionicLoading){

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
                    	if (measurementsQueue) {
                    		allMeasurements = measurementsFromLocalStorage.concat(measurementsQueue);
                    	}
                    	else {
                    		allMeasurements = measurementsFromLocalStorage;
                    	}    
                    }
                    else {
                        allMeasurements = measurementsQueue;
                    }

                    // filtered measurements
                    var returnSorted = function(start, end){

                        allMeasurements = allMeasurements.sort(function(a, b){
                        	if (a === null) {
                        		return 1;
                        	}
                        	if (b === null) {
                        		return 0;
                        	}
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
                    'lastUpdated':'(ge)'+ paramTime ,
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
                        console.log("Measurement sync complete!");
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
                                $rootScope.$broadcast('updateCharts');
                                /*
                                $rootScope.lastSyncTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
                                localStorageService.setItem('lastSyncTime', $rootScope.lastSyncTime);
                                console.log("lastSyncTime is " + $rootScope.lastSyncTime);
                                */

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

            syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts : function(){
                var deferred = $q.defer();

                if($rootScope.user){
                    $rootScope.isSyncing = true;
                    console.log('Syncing primary outcome measurements...');

                    measurementService.syncPrimaryOutcomeVariableMeasurements().then(function(){
                        $rootScope.isSyncing = false;
                        $ionicLoading.hide();
                        deferred.resolve();
                    });
                }
                else {
                    $rootScope.$broadcast('updateCharts');
                    deferred.resolve();
                }
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
                        measurementService.getMeasurements();
                        //$rootScope.$broadcast('updateCharts');
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
                var oldFromDate = localStorageService.getItemSync('fromDate');
                var oldToDate = localStorageService.getItemSync('toDate');
                localStorageService.setItem('fromDate',parseInt(from));
				localStorageService.setItem('toDate',parseInt(to));
                // if date range changed, update charts
                if (parseInt(oldFromDate) !== parseInt(from) || parseInt(oldToDate) !== parseInt(to)) {
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
                    note: ""  
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
                        note: measurementObject.note
                    });
                    //resave queue
                    localStorageService.setItem('measurementsQueue', JSON.stringify(measurementsQueue));
                });
                return deferred.promise;
            },

            // post a single measurement
            postTrackingMeasurement : function(measurementInfo, usePromise){

                var deferred = $q.defer();

                /*
                if(measurementInfo.note === ""){
                    measurementInfo.note = null;
                }
                */

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
                        localStorageService.setItem('allMeasurements',JSON.stringify(newAllMeasurements));
                        var editedMeasurement = {
                            id: measurementInfo.id,
                            variableName: measurementInfo.variableName,
                            source: config.get('clientSourceName'),
                            abbreviatedUnitName: measurementInfo.unit,
                            startTimeEpoch:  measurementInfo.startTimeEpoch,
                            value: measurementInfo.value,
                            variableCategoryName : measurementInfo.variableCategoryName,
                            note : measurementInfo.note,
                            combinationOperation : measurementInfo.isAvg? "MEAN" : "SUM"
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
                            combinationOperation : measurementInfo.isAvg? "MEAN" : "SUM"
                        };
                        measurementService.addToMeasurementsQueue(newMeasurement);
                    }

                    measurementService.syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts()
                        .then(function() {
                            if(usePromise) {
                                deferred.resolve();
                            }
                        });
                }
                else {
                    // Non primary outcome variable, post immediately

                    // measurements set
                    var measurements = [
                        {
                            variableName: measurementInfo.variableName,
                            source: config.get('clientSourceName'),
                            variableCategoryName: measurementInfo.variableCategoryName,
                            abbreviatedUnitName: measurementInfo.abbreviatedUnitName,
                            combinationOperation : measurementInfo.isAvg? "MEAN" : "SUM",
                            measurements : [
                                {
                                    startTimeEpoch:  measurementInfo.startTimeEpoch,
                                    value: measurementInfo.value,
                                    note : measurementInfo.note
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
                        combinationOperation : measurementInfo.isAvg? "MEAN" : "SUM"
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
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    console.log(error);
                });
            },

            deleteMeasurementFromLocalStorage : function(measurement) {
                var deferred = $q.defer();
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
                        deferred.resolve();
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
                        deferred.resolve();
                    }
                }
                if (!found){
                    console.debug("deleted measurement not found in local storage");
                    deferred.reject();
                }
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