angular.module('starter')
	// Measurement Service
	.factory('measurementService', function($http, $q, QuantiModo, localStorageService, $rootScope){


		// flag whether the Service is in a synced state
		var isSynced = false;

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

                    allMeasurements = measurementsFromLocalStorage.concat(measurementsQueue);

                    // filtered measurements
                    var returnFiltered = function(start, end){

                        allMeasurements = allMeasurements.sort(function(a, b){
                            if(!a.startTimeEpoch){
                                a.startTimeEpoch = a.timestamp;
                            }

                            if(!b.startTimeEpoch){
                                b.startTimeEpoch = b.timestamp;
                            }
                            return a.startTimeEpoch - b.startTimeEpoch;
                        });

                        var filtered = allMeasurements.filter(function(measurement){
                            if(!measurement.startTimeEpoch){
                                measurement.startTimeEpoch = measurement.timestamp;
                            }
                            return measurement.startTimeEpoch >= start && measurement.startTimeEpoch <= end;
                        });

                        return callback(filtered);
                    };

                    if(!allMeasurements){
                        return callback(false);
                    }

                    // params
                    measurementService.getFromDate(function(start){
                        start = start / 1000;

                        var end;

                        if(tillNow){
                            end = Date.now()/1000;
                            returnFiltered(start,end);
                        } else {
                            measurementService.getToDate(function(end){
                                end = end / 1000;
                                returnFiltered(start,end);
                            });
                        }
                    });

                });
            },


        // sync the measurements in queue with QuantiModo API
            syncQueueToServer : function(){
                var defer = $q.defer();

                localStorageService.getItem('measurementsQueue',function(measurementsQueue) {

                    var measurementObjects = JSON.parse(measurementsQueue);

                    if(measurementObjects.length < 1){
                        defer.resolve();
                        console.debug('No measurements to sync!');
                        return defer.promise;
                    }

                    if(measurementObjects.length > 0) {

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
                        value: numericRatingValue,
                        note: ""
                    });
                    //resave queue
                    localStorageService.setItem('measurementsQueue', JSON.stringify(measurementsQueue));
                });

                return deferred.promise;
            },

			// edit existing measurement
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

			// get data from QuantiModo API
			syncPrimaryOutcomeVariableMeasurements : function(){
				var deferred = $q.defer();
                isSyncing = true;
                var params;
                $rootScope.lastSyncTime = 0;

                localStorageService.getItem('lastSyncTime',function(val){
                    if (val) {
                    	$rootScope.lastSyncTime = val;	
                    }
                    params = {
                        variableName : config.appSettings.primaryOutcomeVariableDetails.name,
                        'lastUpdated':'(ge)'+ $rootScope.lastSyncTime ,
                        sort : '-startTimeEpoch',
                        limit:200,
                        offset:0
                    };
                    console.log("syncPrimaryOutcomeVariableMeasurements",params);
                });

				// send request
				var getMeasurements = function(){

                    localStorageService.getItem('user', function(user){
                        if(!user){
                            isSyncing = false;
                            deferred.resolve();
                        }
                    });

					// if the data is already synced
					if(isSynced){
						isSyncing = false;
                        deferred.resolve();
						return;
					}

					// send request
					QuantiModo.getMeasurements(params).then(function(response){
						if(response){
                            localStorageService.setItem('lastSyncTime',moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
                            localStorageService.getItem('lastSyncTime',function(val){
                                $rootScope.lastSyncTime = val;
                                console.log("lastSyncTime is " + $rootScope.lastSyncTime);
                            });
                            // set flag
							isSynced = true;
                            isSyncing = false;
							deferred.resolve(response);
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
                                localStorageService.getItem('allMeasurements',function(val){
                                   allMeasurements = val ? JSON.parse(val) : [];

                                    if(!$rootScope.lastSyncTime || allMeasurements.length === 0 || allMeasurements === '[]') {
                                        
                                        allMeasurements = allMeasurements.concat(response);
                                    }
                                    else{
                                        //to remove duplicates since the server would also return the records that we already have in allDate
                                        var lastSyncTimeTimestamp = new Date($rootScope.lastSyncTime).getTime()/1000;
                                        allMeasurements = allMeasurements.filter(function(measurement){
                                            if(!measurement.startTimeEpoch){
                                                measurement.startTimeEpoch = measurement.timestamp;
                                            }
                                            return measurement.startTimeEpoch < lastSyncTimeTimestamp;
                                        });
                                        //Extracting New Records
                                        var newRecords = response.filter(function (measurement) {
                                            if(!measurement.startTimeEpoch){
                                                measurement.startTimeEpoch = measurement.timestamp;
                                            }
                                            return measurement.startTimeEpoch > lastSyncTimeTimestamp;
                                        });
                                        if (newRecords.length > 0) {
                                        	console.log('new record');
                                        	console.log(newRecords);
                                        }
                                        //Handling case if a primary outcome variable is updated
                                        //Extracting Updated Records
                                        var updatedRecords = response.filter(function(measurement){
                                            var updatedAtTimestamp =  moment.utc(measurement.updatedTime * 1000).unix();
                                            var createdAtTimestamp =  moment.utc(measurement.createdTime * 1000).unix();
                                            //Criteria for updated records
                                            return (updatedAtTimestamp > lastSyncTimeTimestamp && createdAtTimestamp !== updatedAtTimestamp) ;
                                        });
                                        //Replacing primary outcome variable object in original allMeasurements object
                                        allMeasurements.map(function(x,index) {
                                            updatedRecords.forEach(function(elem){
                                                if(!x.startTimeEpoch){
                                                    x.startTimeEpoch = x.timestamp;
                                                }
                                                if(!elem.startTimeEpoch){
                                                    elem.startTimeEpoch = elem.timestamp;
                                                }
                                                if (x.startTimeEpoch  === elem.startTimeEpoch  && x.source === config.get('clientSourceName')) {
                                                    console.log('found at ' + index);
                                                    x = elem;
                                                }
                                            });
                                        });
                                        //console.log('updated records');
                                        //console.log(updatedRecords);
                                        allMeasurements = allMeasurements.concat(newRecords);
                                    }

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
                                    localStorageService.setItem('lastSyncTime',moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
                                    localStorageService.getItem('lastSyncTime',function(val){
                                        $rootScope.lastSyncTime = val;
                                        console.log("lastSyncTime is " + $rootScope.lastSyncTime);
                                    });
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
				};

				//sync queue
                localStorageService.getItem('measurementsQueue',function(measurementsQueue){

                    if(measurementsQueue && measurementsQueue.length > 0){
                        // if measurement queues is present
                        measurementsQueue = JSON.parse(measurementsQueue);
                        measurementService.syncQueueToServer(measurementsQueue).then(
                            function(){
                                if(!$rootScope.lastSyncTime){
                                    //we will get all the data from server
                                    localStorageService.setItem('allMeasurements','[]');
                                }
                                setTimeout(
                                    function()
                                    {
                                        getMeasurements();
                                    },
                                    100
                                );
                            }
                        );
                    } else {
                        getMeasurements();
                    }
                });

				return deferred.promise;
			},

			// calculate average from local data
			calculateAveragePrimaryOutcomeVariableValue : function(){
				var deferred = $q.defer();
				var data;
                measurementService.getAllLocalMeasurements(false,function(allMeasurements){
                    data = allMeasurements;
                    // check if data is present to calculate primary outcome variable from
                    if(!data && data.length === 0) {
                        deferred.reject(false);
                    }
                    else {
                        var sum = 0;
                        var zeroes = 0;

                        // loop through calculating average
                        for(var i in data){
                            if(data[i].value === 0 || data[i].value === "0") {
                                zeroes++;
                            }
                            else {
                                sum+= data[i].value;
                            }
                        }

                        var avgVal = Math.round(sum/(data.length-zeroes));

                        // set localstorage values
                        localStorageService.setItem('averagePrimaryOutcomeVariableValue',avgVal);
                        deferred.resolve(avgVal);
                    }
                });
			   	return deferred.promise;
			},

			// get average primary outcome variable from local stroage
			getPrimaryOutcomeVariableValue : function(){
				var deferred = $q.defer();

				// return from localstorage if present
                localStorageService.getItem('averagePrimaryOutcomeVariableValue',function(averagePrimaryOutcomeVariableValue){
                    if(averagePrimaryOutcomeVariableValue) {
                        deferred.resolve(averagePrimaryOutcomeVariableValue);
                    }
                    else {
                        // calculate it again if not found
                        measurementService.calculateAveragePrimaryOutcomeVariableValue()
                            .then(function(val){
                                deferred.resolve(val);
                            }, function(){
                                deferred.reject(false);
                            });
                    }
                });


				return deferred.promise;
			},

            generateLineAndBarChartArrays : function (measurements) {
                var lineArr = [];
                var barArr = [0, 0, 0, 0, 0];

                for (var i = 0; i < measurements.length; i++) {
                    var currentValue = Math.ceil(measurements[i].value);
                    if (measurements[i].abbreviatedUnitName === config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName &&
                        (currentValue - 1) <= 4 && (currentValue - 1) >= 0) {
                        lineArr.push([moment(measurements[i].startTimeEpoch).unix() * 1000, (currentValue - 1) * 25]);
                        barArr[currentValue - 1]++;
                    }
                }
                return {lineArr: lineArr, barArr: barArr};
            },

            // calculate both charts in same iteration
			calculateBothChart : function(){
				var deferred = $q.defer();

                measurementService.getAllLocalMeasurements(false,function(data){
                    if(!data && data.length === 0){
                        deferred.reject(false);
                    } else {
                        var __ret = measurementService.generateLineAndBarChartArrays(data);
                        var lineArr = __ret.lineArr;
                        var barArr = __ret.barArr;
                        deferred.resolve([lineArr, barArr]);
                    }
                });
                
		       return deferred.promise;
			},
            
            getLineAndBarChartData : function () {
                var lineArr = [];
                var barArr = [0, 0, 0, 0, 0];
                var allMeasurements = localStorageService.getItemSync('allMeasurements');
                if(allMeasurements){
					allMeasurements = JSON.parse(allMeasurements);
					for (var i = 0; i < allMeasurements.length; i++) {
						var currentValue = Math.ceil(allMeasurements[i].value);
						if (allMeasurements[i].abbreviatedUnitName === config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName &&
							(currentValue - 1) <= 4 && (currentValue - 1) >= 0) {
							var startTimeMilliseconds = moment(allMeasurements[i].startTimeEpoch).unix() * 1000;
							var percentValue = (currentValue - 1) * 25;
							var lineChartItem = [startTimeMilliseconds, percentValue];
							lineArr.push(lineChartItem);
							barArr[currentValue - 1]++;
						}
					}
					return {lineArr: lineArr, barArr: barArr};
                }
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
                }, function(response){
                    console.log("error", response);
                });
            },

            resetSyncFlag:function(){
              isSynced = false;
            }
		};

		return measurementService;
	});