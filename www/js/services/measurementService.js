angular.module('starter')
	// Measurement Service
	.factory('measurementService', function($http, $q, QuantiModo, localStorageService, $rootScope){

		// sync the measurements in queue with QuantiModo API
		var syncQueue = function(measurementsQueue){
			var defer = $q.defer();

			// measurements set
			var measurements = [
				{					
                    name: config.appSettings.primaryOutcomeVariableDetails.name,
                    source: config.get('clientSourceName'),
                    category: config.appSettings.primaryOutcomeVariableDetails.category,
                    combinationOperation: config.appSettings.primaryOutcomeVariableDetails.combinationOperation,
                    unit: config.appSettings.primaryOutcomeVariableDetails.unit,
                    measurements : measurementsQueue
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

            var allLocalMeasurements;

            localStorageService.getItem('allLocalMeasurements',function(measurementsFromLocalStorage){

                allLocalMeasurements = measurementsFromLocalStorage;

                // filtered measurements
                var returnFiltered = function(start, end){
                    
                    allLocalMeasurements = allLocalMeasurements.sort(function(a, b){
                        return a.timestamp - b.timestamp;
                    });

                    var filtered = allLocalMeasurements.filter(function(x){
                        return x.timestamp >= start && x.timestamp <= end;
                    });
                    
                    return callback(filtered);
                };

                if(!allLocalMeasurements){
                    return callback(false);
                }

                allLocalMeasurements = JSON.parse(allLocalMeasurements);

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
			updatePrimaryOutcomeVariableLocally : function(ratingValue){
                console.log("reported", ratingValue);
                var deferred = $q.defer();
				var reportTime = Math.floor(new Date().getTime()/1000);

                // if val is string (needs conversion)
                if(isNaN(parseFloat(ratingValue))){
                    ratingValue = config.appSettings.primaryOutcomeValueConversionDataSetReversed[ratingValue] ?
                        config.appSettings.primaryOutcomeValueConversionDataSetReversed[ratingValue] : false;
                } 

                function checkSync(){
                    if(!isSyncing){
                        console.log('isSync false');
                        reportPrimaryOutcomeVariableValue(ratingValue);
                    }else{
                        console.log('isSync true');
                        setTimeout(function(){
                            console.log('checking sync');
                            checkSync();
                        },1000)
                    }
                }

                function reportPrimaryOutcomeVariableValue(ratingValue){
                    // only if we found a result for the reported val
                    if(ratingValue){

                        // update localStorage
                        localStorageService.setItem('lastReportedPrimaryOutcomeVariableValue', ratingValue);

                        // update full data
                        localStorageService.getItem('allLocalMeasurements',function(allMeasurementsInLocalStorage){

                            var newMeasurementObject = {
                                variableId : config.appSettings.primaryOutcomeVariableDetails.id,
                                value : ratingValue,
                                timestamp : reportTime,
                                humanTime : {
                                    date : new Date().toISOString()
                                },
                                unitId: config.appSettings.primaryOutcomeVariableDetails.unit
                            };

                            if(!allMeasurementsInLocalStorage){
                                allMeasurementsInLocalStorage = "[]";
                            }
                            var measurementsToSaveInLocalStorage = JSON.parse(allMeasurementsInLocalStorage);
                            measurementsToSaveInLocalStorage.push(newMeasurementObject);

                            localStorageService.setItem('allLocalMeasurements', JSON.stringify(measurementsToSaveInLocalStorage));

                            // update Bar chart data
                            localStorageService.getItem('barChartData',function(barChartData){
                                if(barChartData){
                                    barChartData = JSON.parse(barChartData);
                                    barChartData[ratingValue-1]++;
                                    localStorageService.setItem('barChartData',JSON.stringify(barChartData));
                                }
                            });

                            // update Line chart data
                            localStorageService.getItem('lineChartData',function(lineChartData){
                                if(lineChartData){
                                    lineChartData = JSON.parse(lineChartData);
                                    lineChartData.push([reportTime*1000, (ratingValue-1)*25]);
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
			updatePrimaryOutcomeVariable : function(ratingValue){

				var reportTime  = new Date().getTime();
                
                var ratingValue = ratingValue;

                // if val is string (needs conversion)
                if(isNaN(parseFloat(ratingValue))){
                    ratingValue = config.appSettings.primaryOutcomeValueConversionDataSetReversed[ratingValue] ?
                    config.appSettings.primaryOutcomeValueConversionDataSetReversed[ratingValue] : false;
                } 

                if(ratingValue){
                    localStorageService.setItem('lastReportedPrimaryOutcomeVariableValue', ratingValue);
                    
                    // check queue
                    localStorageService.getItem('measurementsQueue',function(measurementsQueue){
                        measurementsQueue = measurementsQueue? JSON.parse(measurementsQueue) : [];

                        // add to queue
                        measurementsQueue.push({
                            timestamp:  Math.floor(reportTime / 1000),
                            value: ratingValue,
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

                localStorageService.getItem('allLocalMeasurements', function(allLocalMeasurements){
                    allLocalMeasurements = allLocalMeasurements? JSON.parse(allLocalMeasurements) : [];

                    // add to queue
                    allLocalMeasurements.push(measurementObject);

                    //resave queue
                    localStorageService.setItem('allLocalMeasurements', JSON.stringify(allLocalMeasurements));

                    deferred.resolve();
                });

                return deferred.promise;
            },

			// post a singe measurement
			postTrackingMeasurement : function(epoch, variable, val, unit, isAvg, category, note, usePromise){

                var deferred = $q.defer();

                if(note === ""){
                    note = null;
                }

                // measurements set
                var measurements = [
                    {
                        name: variable,
                	   	source: config.get('clientSourceName'),
                	   	category: category,
                	   	unit: unit,
                        combinationOperation : isAvg? "MEAN" : "SUM",
                	   	measurements : [
                		   	{
                		   		timestamp:  epoch / 1000,
                		   		value: val,
                		   		note : note
                		   	}
                	   	]
                    }
                ];

                // for local
                var measurement = {
                    name: variable,
                    source: config.get('clientSourceName'),
                    unit: unit,
                    timestamp:  epoch / 1000,
                    value: val,
                    category : category,
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

                if(usePromise) return deferred.promise;
			},

			// edit existing measurement
			editPrimaryOutcomeVariable : function(timestamp, val, note){
				var deferred = $q.defer();
				// measurements set
				var measurements = [
					{
					   	name: config.appSettings.primaryOutcomeVariableDetails.name,
                        source: config.get('clientSourceName'),
                        category: config.appSettings.primaryOutcomeVariableDetails.category,
                        combinationOperation: config.appSettings.primaryOutcomeVariableDetails.combinationOperation,
                        unit: config.appSettings.primaryOutcomeVariableDetails.unit,
					   	measurements : [{
					   		timestamp:  timestamp,
					   		value: val,
					   		note : (note && note !== null)? note : null
					   	}]
					}
				];

			   console.log(measurements);

			   var measurementDataSet;
               localStorageService.getItem('allLocalMeasurements',function(allLocalMeasurements){
                   measurementDataSet = JSON.parse(allLocalMeasurements);
                   // extract the measurement from localStorage
                   var selectedMeasurementDataSetItems = measurementDataSet.filter(function(x){return x.timestamp == timestamp;});

                   // update localstorage data
                   var selectedMeasurementItem = selectedMeasurementDataSetItems[0];

                   // extract value
                   selectedMeasurementItem.value = val;
                   selectedMeasurementItem.note = (selectedMeasurementItem.note && selectedMeasurementItem.note !== null)? selectedMeasurementItem.note : null;

                   // update localstorage
                   localStorageService.setItem('allLocalMeasurements',JSON.stringify(measurementDataSet));

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
			syncData : function(){
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
                    console.log("syncData",params);
                });

				// send request
				var getMeasurements = function(){

                    localStorageService.getItem('isLoggedIn', function(isLoggedIn){
                        if(!isLoggedIn){
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
                                var allLocalMeasurements;
                                localStorageService.getItem('allLocalMeasurements',function(val){
                                   allLocalMeasurements = val ? JSON.parse(val) : [];

                                    if(!lastSyncTime || allLocalMeasurements.length === 0) {
                                        
                                        allLocalMeasurements = allLocalMeasurements.concat(response);
                                    }
                                    else{
                                        //to remove duplicates since the server would also return the records that we already have in allDate
                                        var lastSyncTimeTimestamp = new Date(lastSyncTime).getTime()/1000;
                                        allLocalMeasurements = allLocalMeasurements.filter(function(x){
                                            return x.timestamp < lastSyncTimeTimestamp;
                                        });
                                        //Extracting New Records
                                        var newRecords = response.filter(function (elem) {
                                            return elem['timestamp'] > lastSyncTimeTimestamp;
                                        });
                                        console.log('new record');
                                        console.log(newRecords);
                                        //Handling case if a primary outcome variable is updated
                                        //Extracting Updated Records
                                        var updatedRecords = response.filter(function(elem){
                                            var updatedAtTimestamp =  moment.utc(elem['updatedTime']*1000).unix();
                                            var createdAtTimestamp =  moment.utc(elem['createdTime']*1000).unix();
                                            //Criteria for updated records
                                            return (updatedAtTimestamp > lastSyncTimeTimestamp && createdAtTimestamp != updatedAtTimestamp) ;
                                        });
                                        //Replacing primary outcome variable object in original allLocalMeasurements object
                                        allLocalMeasurements.map(function(x,index) {
                                            updatedRecords.forEach(function(elem){
                                                if (x['timestamp'] === elem['timestamp'] && x.source === config.get('clientSourceName')) {
                                                    console.log('found at ' + index);
                                                    x = elem;
                                                }
                                            });
                                        });
                                        console.log('updated records');
                                        console.log(updatedRecords);
                                        allLocalMeasurements = allLocalMeasurements.concat(newRecords);
                                    }

                                    var s  = 9999999999999; 
                                    allLocalMeasurements.forEach(function(x){if(x.timestamp <= s){s = x.timestamp;}});

                                    measurementService.setDates(new Date().getTime(),s*1000);
                                    //updating last updated time and data in local storage so that we syncing should continue from this point
                                    //if user restarts the app or refreshes the page.
                                    localStorageService.setItem('allLocalMeasurements',JSON.stringify(allLocalMeasurements));
                                    localStorageService.setItem('lastSyncTime',moment(allLocalMeasurements[allLocalMeasurements.length-1].timestamp*1000).utc().format('YYYY-MM-DDTHH:mm:ss'));
                                });

                            }
                        } else {
                            localStorageService.getItem('isLoggedIn', function(isLoggedIn){
                                if(isLoggedIn == "false" || isLoggedIn == false){
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
                        var measurementsQueue = JSON.parse(measurementsQueue);
                        if(measurementsQueue.length > 0)
                        {
                            syncQueue(measurementsQueue).then(
                                function(){
                                    if(!lastSyncTime){
                                        //we will get all the data from server
                                        localStorageService.setItem('allLocalMeasurements','[]');
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
                getAllLocalMeasurements(false,function(allLocalMeasurements){
                    data = allLocalMeasurements;
                    // check if data is present to calculate primary outcome variable from
                    if(!data && data.length == 0) deferred.reject(false);
                    else {
                        var sum = 0;
                        var zeroes = 0;

                        // loop through calculating average
                        for(var i in data){
                            if(data[i].value === 0 || data[i].value === "0") zeroes++;
                            else sum+= data[i].value;
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
                    if(averagePrimaryOutcomeVariableValue) deferred.resolve(averagePrimaryOutcomeVariableValue);
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

			// calculate bar chart values
			calculateBarChart : function(){
				var deferred = $q.defer();

                localStorageService.getItem('allLocalMeasurements', function(allLocalMeasurements){
                    if(!allLocalMeasurements){
                        deferred.reject(false);
                    } else {
                        var data = JSON.parse(allLocalMeasurements);
                        var barChartArray = [0,0,0,0,0];

                        for(var i = 0; i<data.length; i++){
                            if(data[i].unit == config.appSettings.primaryOutcomeVariableDetails.unit && ( Math.ceil(data[i].value)-1) <= 4 ){
                                barChartArray[Math.ceil(data[i].value)-1]++;
                            }
                        }

                        localStorageService.setItem('barChartData', JSON.stringify(barChartArray));
                        deferred.resolve(barChartArray);
                    }
                });

				return deferred.promise;
			},

			// getter for bar charts data
			getMeasurementsBarChartsData : function(){
				var deferred = $q.defer();

                localStorageService.getItem('barChartData', function(barChartData){
                    if(barChartData) {
                        deferred.resolve(JSON.parse(barChartData));
                    }
                    else {
                        deferred.reject(false);
                    }
                });

                return deferred.promise;
			},

			// calculate line chart values
			calculateLineChart : function(){
				var deferred = $q.defer();

                localStorageService.getItem('allLocalMeasurements', function(allLocalMeasurements){
                    if(!allLocalMeasurements){
                        deferred.reject(false);
                    } else {
                        var data = JSON.parse(allLocalMeasurements);
                        var lineChartArray = [];

                        for(var i = 0; i<data.length; i++)
                        {
                            var currentValue = currentValue;
                            if(data[i].unit == config.appSettings.primaryOutcomeVariableDetails.unit && (currentValue-1) <= 4 && (currentValue-1) >= 0){
                                lineChartArray.push([moment(data[i].humanTime.date).unix(), (currentValue-1)*25] );
                            }
                        }

                        localStorageService.setItem('lineChartData', JSON.stringify(lineChartArray));
                        deferred.resolve(lineChartArray);
                    }

                });

				return deferred.promise;
			},

			// getter for line charts data
			getMeasurementsLineChartsData : function(){
				var deferred = $q.defer();

                localStorageService.getItem('lineChartData', function(lineChartData){                    
                    if(lineChartData) {
                        deferred.resolve(JSON.parse(lineChartData));
                    }
                    else {
                        deferred.reject(false);
                    }
                });

                return deferred.promise;
			},

			// calculate both charts in same iteration
			calculateBothChart : function(){
				var deferred = $q.defer();
                
                getAllLocalMeasurements(false,function(data){
                    if(!data && data.length === 0){
                        deferred.reject(false);
                    } else {
                        var lineArr = [];
                        var barArr = [0,0,0,0,0];

                        for(var i = 0; i<data.length; i++){
                            var currentValue = Math.ceil(data[i].value);
                            if(data[i].unit == config.appSettings.primaryOutcomeVariableDetails.unit && (currentValue-1) <= 4 && (currentValue-1) >= 0){
                                lineArr.push([moment(data[i].humanTime.date).unix()*1000, (currentValue-1)*25] );
                                barArr[currentValue-1]++;
                            }
                        }
                        localStorageService.setItem('lineChartData',JSON.stringify(lineArr));
                        localStorageService.setItem('barChartData',JSON.stringify(barArr));
                        deferred.resolve([lineArr, barArr]);
                    }
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