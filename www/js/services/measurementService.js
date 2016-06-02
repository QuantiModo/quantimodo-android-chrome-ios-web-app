angular.module('starter')
	// Measurement Service
	.factory('measurementService', function($http, $q, QuantiModo, localStorageService, $rootScope){

		// sync the measurements in queue with QuantiModo API
		var syncQueue = function(measurementsQueue){
			var defer = $q.defer();

			// measurements set
			var measurements = [
				{					
                    variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                    source: config.get('clientSourceName'),
                    variableCategoryName: config.appSettings.primaryOutcomeVariableDetails.category,
                    combinationOperation: config.appSettings.primaryOutcomeVariableDetails.combinationOperation,
                    abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                    measurements: measurementsQueue
				}
			];

			// send request
			QuantiModo.postMeasurementsV2(measurements, function(response){
					// success

				// clear queue
				localStorageService.setItem('measurementsQueue',JSON.stringify([]));
				defer.resolve();
				console.log("success", response);

			}, function(response){
					// error

				// resave queue
                localStorageService.setItem('measurementsQueue',JSON.stringify(measurementsQueue));
				console.log("error", response);
				defer.resolve();
			});

			return defer.promise;
		};

		// get all data from date range to date range
		var getAllLocalMeasurements = function(tillNow, callback){

            var allMeasurements;

            localStorageService.getItem('allMeasurements',function(measurementsFromLocalStorage){

                allMeasurements = measurementsFromLocalStorage;

                // filtered measurements
                var returnFiltered = function(start, end){
                    
                    allMeasurements = allMeasurements.sort(function(a, b){
                        if(!a.startTime){
                            a.startTime = a.timestamp;
                        }

                        if(!b.startTime){
                            b.startTime = b.timestamp;
                        }
                        return a.startTime - b.startTime;
                    });

                    var filtered = allMeasurements.filter(function(measurement){
                        if(!measurement.startTime){
                            measurement.startTime = measurement.timestamp;
                        }
                        return measurement.startTime >= start && measurement.startTime <= end;
                    });
                    
                    return callback(filtered);
                };

                if(!allMeasurements){
                    return callback(false);
                }

                allMeasurements = JSON.parse(allMeasurements);

                // params
                measurementService.getFromDate(function(start){
                    start = start / 1000;

                    var end;

                    if(tillNow){
                        end = Date.now()/1000;
                        returnFiltered(start,end);
                    }else{
                        measurementService.getToDate(function(end){
                           end = end / 1000;
                           returnFiltered(start,end);
                        });
                    }
                });

            });
		};

		// flag whether the Service is in a synced state
		var isSynced = false;

        //flag to indicate if data syncing is in progress
        var isSyncing = false;

		// service methods
		var measurementService = {

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
			updatePrimaryOutcomeVariableLocally : function(numericRatingValue){
                console.log("reported", numericRatingValue);
                var deferred = $q.defer();
				var reportTime = Math.floor(new Date().getTime()/1000);

                // if val is string (needs conversion)
                if(isNaN(parseFloat(numericRatingValue))){
                    numericRatingValue = config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] ?
                        config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] : false;
                } 

                function checkSync(){
                    if(!isSyncing){
                        console.log('isSync false');
                        reportPrimaryOutcomeVariableValue(numericRatingValue);
                    }else{
                        console.log('isSync true');
                        setTimeout(function(){
                            console.log('checking sync');
                            checkSync();
                        },1000);
                    }
                }

                function reportPrimaryOutcomeVariableValue(numericRatingValue){
                    // only if we found a result for the reported val
                    if(numericRatingValue){

                        // update localStorage
                        localStorageService.setItem('lastReportedPrimaryOutcomeVariableValue', numericRatingValue);

                        // update full data
                        localStorageService.getItem('allMeasurements',function(allMeasurementsInLocalStorage){

                            var newMeasurementObject = {
                                variableId : config.appSettings.primaryOutcomeVariableDetails.id,
                                value : numericRatingValue,
                                startTime : reportTime,
                                humanTime : {
                                    date : new Date().toISOString()
                                },
                                abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName
                            };

                            if(!allMeasurementsInLocalStorage){
                                allMeasurementsInLocalStorage = "[]";
                            }
                            var measurementsToSaveInLocalStorage = JSON.parse(allMeasurementsInLocalStorage);
                            measurementsToSaveInLocalStorage.push(newMeasurementObject);

							// append here
                            localStorageService.setItem('allMeasurements', JSON.stringify(measurementsToSaveInLocalStorage));

                            // update Bar chart data
                            localStorageService.getItem('barChartData',function(barChartData){
                                if(barChartData){
                                    barChartData = JSON.parse(barChartData);
                                    barChartData[numericRatingValue-1]++;
                                    localStorageService.setItem('barChartData',JSON.stringify(barChartData));
                                }
                            });

                            // update Line chart data
                            localStorageService.getItem('lineChartData',function(lineChartData){
                                if(lineChartData){
                                    lineChartData = JSON.parse(lineChartData);
                                    lineChartData.push([reportTime*1000, (numericRatingValue-1)*25]);
                                    localStorageService.setItem('lineChartData',JSON.stringify(lineChartData));
                                }
                                deferred.resolve();
                            });

                        });
                    } else {
                        console.log("trying to report primary outcome variable: false");
                        deferred.reject(false);
                    }
                }

                checkSync();

                return deferred.promise;
			},

			// update primary outcome variable request to QuantiModo API
			updatePrimaryOutcomeVariableOnServer : function(numericRatingValue){

				var reportTime  = new Date().getTime();

                // if val is string (needs conversion)
                if(isNaN(parseFloat(numericRatingValue))){
                    numericRatingValue = config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] ?
                    config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] : false;
                } 

                if(numericRatingValue){
                    localStorageService.setItem('lastReportedPrimaryOutcomeVariableValue', numericRatingValue);
                    
                    // check queue
                    localStorageService.getItem('measurementsQueue',function(measurementsQueue){
                        measurementsQueue = measurementsQueue? JSON.parse(measurementsQueue) : [];

                        // add to queue
                        measurementsQueue.push({
                            startTime:  Math.floor(reportTime / 1000),
                            value: numericRatingValue,
                            note : ""
                        });

                        //resave queue
                        localStorageService.setItem('measurementsQueue', JSON.stringify(measurementsQueue));

                        // sync queue with server
                        syncQueue(measurementsQueue);
                    });
                }
			},

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

			// post a singe measurement
			postTrackingMeasurement : function(startTimeEpoch, variableName, value, unit, isAvg, variableCategoryName, note, usePromise){

                var deferred = $q.defer();

                if(note === ""){
                    note = null;
                }

                var nowMilliseconds = new Date();
                var oneWeekInFuture = nowMilliseconds.getTime()/1000 + 7 * 86400;
                if(startTimeEpoch > oneWeekInFuture){
                    startTimeEpoch = startTimeEpoch / 1000;
                    console.warn('Assuming startTime is in milliseconds since it is more than 1 week in the future');
                }

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
                		   		startTime:  startTimeEpoch,
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
                    startTime:  startTimeEpoch,
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
			},

			// edit existing measurement
			editPrimaryOutcomeVariable : function(startTime, val, note){
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
					   		startTime:  startTime,
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
                   var selectedMeasurementDataSetItems = measurementDataSet.filter(function(x){return x.startTime === startTime;});

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

			// sync local data to QuantiModo API
			syncPrimaryOutcomeVariableMeasurements : function(){
				var deferred = $q.defer();
                isSyncing = true;
                var params;
                var lastSyncTime;

                localStorageService.getItem('lastSyncTime',function(val){
                    lastSyncTime = val || 0;
                    params = {
                        variableName : config.appSettings.primaryOutcomeVariableDetails.name,
                        'lastUpdated':'(ge)'+ lastSyncTime ,
                        sort : '-startTime',
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

                                    if(!lastSyncTime || allMeasurements.length === 0 || allMeasurements === '[]') {
                                        
                                        allMeasurements = allMeasurements.concat(response);
                                    }
                                    else{
                                        //to remove duplicates since the server would also return the records that we already have in allDate
                                        var lastSyncTimeTimestamp = new Date(lastSyncTime).getTime()/1000;
                                        allMeasurements = allMeasurements.filter(function(measurement){
                                            if(!measurement.startTime){
                                                measurement.startTime = measurement.timestamp;
                                            }
                                            return measurement.startTime < lastSyncTimeTimestamp;
                                        });
                                        //Extracting New Records
                                        var newRecords = response.filter(function (measurement) {
                                            if(!measurement.startTime){
                                                measurement.startTime = measurement.timestamp;
                                            }
                                            return measurement.startTime > lastSyncTimeTimestamp;
                                        });
                                        console.log('new record');
                                        console.log(newRecords);
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
                                                if(!x.startTime){
                                                    x.startTime = x.timestamp;
                                                }
                                                if(!elem.startTime){
                                                    elem.startTime = elem.timestamp;
                                                }
                                                if (x.startTime  === elem.startTime  && x.source === config.get('clientSourceName')) {
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
                                        if(!x.startTime){
                                            x.startTime = x.timestamp;
                                        }
                                        if(x.startTime <= s){
                                            s = x.startTime;
                                        }
                                    });

                                    measurementService.setDates(new Date().getTime(),s*1000);
                                    //updating last updated time and data in local storage so that we syncing should continue from this point
                                    //if user restarts the app or refreshes the page.
                                    localStorageService.setItem('allMeasurements',JSON.stringify(allMeasurements));
                                    localStorageService.setItem('lastSyncTime',moment(allMeasurements[allMeasurements.length-1].startTime*1000).utc().format('YYYY-MM-DDTHH:mm:ss'));
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
                    if(measurementsQueue){
                        // if measurement queues is present
                        measurementsQueue = JSON.parse(measurementsQueue);
                        if(measurementsQueue.length > 0)
                        {
                            syncQueue(measurementsQueue).then(
                                function(){
                                    if(!lastSyncTime){
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
                        }
                        else {
                            getMeasurements();
                        }
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
                getAllLocalMeasurements(false,function(allMeasurements){
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
                        lineArr.push([moment(measurements[i].startTime).unix() * 1000, (currentValue - 1) * 25]);
                        barArr[currentValue - 1]++;
                    }
                }
                //localStorageService.setItem('lineChartData', JSON.stringify(lineArr));
                localStorageService.setItem('barChartData', JSON.stringify(barArr));
                return {lineArr: lineArr, barArr: barArr};
            },

            // calculate both charts in same iteration
			calculateBothChart : function(){
				var deferred = $q.defer();
                
                getAllLocalMeasurements(false,function(data){
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
							var startTimeMilliseconds = moment(allMeasurements[i].startTime).unix() * 1000;
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