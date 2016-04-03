angular.module('starter')
	// Measurement Service
	.factory('measurementService', function($http, $q, QuantiModo,localStorageService){

		// sync the measurements in queue with QuantiModo API
		var syncQueue = function(measurementsQueue){
			var defer = $q.defer();

			// measurements set
			var measurements = [
				{					
                    name: config.appSettings.primary_outcome_variable_details.name,
                    source: config.get('client_source_name'),
                    category: config.appSettings.primary_outcome_variable_details.category,
                    combinationOperation: config.appSettings.primary_outcome_variable_details.combinationOperation,
                    unit: config.appSettings.primary_outcome_variable_details.unit,
                    measurements : measurementsQueue
				}
			];

			// send request
			QuantiModo.postMeasurementsV2(measurements, function(response){
					// success

				// clear queue
				localStorageService.setItem('measurementsQueue',JSON.stringify([]));
				defer.resolve()
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
		var getAllData = function(tillNow, callback){

            var allData;

            localStorageService.getItem('allData',function(val){

                allData=val;

                // filtered measurements
                var returnFiltered = function(start,end){
                    
                    allData = allData.sort(function(a, b){
                        return a.timestamp - b.timestamp;
                    });

                    var filtered = allData.filter(function(x){
                        return x.timestamp >= start && x.timestamp <= end;
                    });
                    
                    return callback(filtered);
                };

                if(!allData){
                    return callback(false);
                }

                allData = JSON.parse(allData);

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

		// flag wether the Service is in a synced state
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
			updatePrimaryOutcomeVariableLocally : function(primary_outcome_variable){
                console.log("reported", primary_outcome_variable);
                var deferred = $q.defer();

				var report_time = Math.floor(new Date().getTime()/1000);
                var val = primary_outcome_variable;

                // if val is string (needs conversion)
                if(isNaN(parseFloat(primary_outcome_variable))){
                    val = config.appSettings.conversion_dataset_reversed[primary_outcome_variable] ?
                        config.appSettings.conversion_dataset_reversed[primary_outcome_variable] : false;
                } 

                function checkSync(){
                    if(!isSyncing){
                        console.log('isSync false')
                        report();
                    }else{
                        console.log('isSync true')
                        setTimeout(function(){
                            console.log('checking sync')
                            checkSync();
                        },1000)
                    }
                }

                function report(){
                    // only if we found a result for the reported val
                    if(val){

                        // update localStorage
                        localStorageService.setItem('lastReportedPrimaryOutcomeVariableValue', val);

                        // update full data
                        localStorageService.getItem('allData',function(allData){
                            if(allData){

                                var allDataObject = {
                                    storedValue : val,
                                    value : val,
                                    timestamp : report_time,
                                    humanTime : {
                                        date : new Date().toISOString()
                                    },
                                    unit: config.appSettings.primary_outcome_variable_details.unit
                                };

                                allData = JSON.parse(allData);
                                allData.push(allDataObject);
                                localStorageService.setItem('allData', JSON.stringify(allData));

                                // update Bar chart data
                                localStorageService.getItem('barChartData',function(barChartData){
                                    if(barChartData){
                                        barChartData = JSON.parse(barChartData);
                                        barChartData[val-1]++;
                                        localStorageService.setItem('barChartData',JSON.stringify(barChartData));
                                    }
                                });

                                // update Line chart data
                                localStorageService.getItem('lineChartData',function(lineChartData){
                                    if(lineChartData){
                                        lineChartData = JSON.parse(lineChartData);
                                        lineChartData.push([report_time*1000, (val-1)*25]);
                                        localStorageService.setItem('lineChartData',JSON.stringify(lineChartData));
                                    }
                                    deferred.resolve();
                                });
                            }
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
			updatePrimaryOutcomeVariable : function(primary_outcome_variable){

				var report_time  = new Date().getTime();
                
                var val = primary_outcome_variable;

                // if val is string (needs conversion)
                if(isNaN(parseFloat(primary_outcome_variable))){
                    val = config.appSettings.conversion_dataset_reversed[primary_outcome_variable] ?
                    config.appSettings.conversion_dataset_reversed[primary_outcome_variable] : false;
                } 

                if(val){
                    localStorageService.setItem('lastReportedPrimaryOutcomeVariableValue', val);
                    
                    // check queue
                    localStorageService.getItem('measurementsQueue',function(measurementsQueue){
                        measurementsQueue = measurementsQueue? JSON.parse(measurementsQueue) : [];

                        // add to queue
                        measurementsQueue.push({
                            timestamp:  Math.floor(report_time / 1000),
                            value: val,
                            note : ""
                        });

                        //resave queue
                        localStorageService.setItem('measurementsQueue', JSON.stringify(measurementsQueue));

                        // sync queue with server
                        syncQueue(measurementsQueue);
                    });
                }
			},

            post_tracking_measurement_locally : function(measurement_object){
                var deferred = $q.defer();

                localStorageService.getItem('allTrackingData', function(allTrackingData){
                    var allTrackingData = allTrackingData? JSON.parse(allTrackingData) : [];

                    // add to queue
                    allTrackingData.push(measurement_object);

                    //resave queue
                    localStorageService.setItem('allTrackingData', JSON.stringify(allTrackingData));

                    deferred.resolve();
                });

                return deferred.promise;
            },

			// post a singe measurement
			post_tracking_measurement : function(epoch, variable, val, unit, isAvg, category, usePromise){

                var deferred = $q.defer();

                // measurements set
                var measurements = [
                    {
                        name: variable,
                	   	source: config.get('client_source_name'),
                	   	category: category,
                	   	unit: unit,
                        combinationOperation : isAvg? "MEAN" : "SUM",
                	   	measurements : [
                		   	{
                		   		timestamp:  epoch / 1000,
                		   		value: val,
                		   		note : ""
                		   	}
                	   	]
                    }
                ];

                // for local
                var measurement = {
                    name: variable,
                    source: config.get('client_source_name'),
                    unit: unit,
                    timestamp:  epoch / 1000,
                    value: val,
                    category : category,
                    note : "",
                    combinationOperation : isAvg? "MEAN" : "SUM"
                };

                measurementService.post_tracking_measurement_locally(measurement)
                .then(function(){
                    // send request
                    QuantiModo.postMeasurementsV2(measurements, function(response){
                        if(response.success) {
                            console.log("success", response);
                            if(usePromise) deferred.resolve();
                        } else {
                            console.log("error", response);
                            if(usePromise) deferred.reject(response.message? response.message.split('.')[0] : "Can't post measurement right now!");
                        }
                    }, function(response){
                        console.log("error", response);
                        if(usePromise) deferred.reject(response.message? response.message.split('.')[0] : "Can't post measurement right now!");
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
					   	name: config.appSettings.primary_outcome_variable_details.name,
                        source: config.get('client_source_name'),
                        category: config.appSettings.primary_outcome_variable_details.category,
                        combinationOperation: config.appSettings.primary_outcome_variable_details.combinationOperation,
                        unit: config.appSettings.primary_outcome_variable_details.unit,
					   	measurements : [{
					   		timestamp:  timestamp,
					   		value: val,
					   		note : (note && note !== null)? note : null
					   	}]
					}
				];

			   console.log(measurements);

			   var data_set;
               localStorageService.getItem('allData',function(allData){
                   data_set = JSON.parse(allData);
                   // extract the measurement from localStorage
                   var selected_dataset_items = data_set.filter(function(x){return x.timestamp == timestamp;});

                   // update localstorage data
                   var selected_dataset_item = selected_dataset_items[0];

                   // extract value
                   selected_dataset_item.value = val;
                   selected_dataset_item.note = (selected_dataset_item.note && selected_dataset_item.note !== null)? selected_dataset_item.note : null;

                   // update localstorage
                   localStorageService.setItem('allData',JSON.stringify(data_set));

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
			sync_data : function(){
				var deferred = $q.defer();
                isSyncing = true;
                var params;
                var lastUpdated;

                localStorageService.getItem('lastUpdated',function(val){
                    lastUpdated = val || 0;
                    params = {
                        variableName : config.appSettings.primary_outcome_variable_details.name,
                        // 'lastUpdated':'(ge)'+lastUpdated ,
                        sort : '-startTime',
                        limit:200,
                        offset:0
                    };
                    console.log("sync_data",params);
                });

				// send request
				var get_measurements = function(){

					// if the data is already synced
					if(isSynced){
						isSyncing = false;
                        deferred.resolve();
						return;
					}

					// send request
					QuantiModo.getMeasurements(params).then(function(response){
						if(response){
                            localStorageService.setItem('lastUpdated',moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
                            // set flag
							isSynced = true;
                            isSyncing = false;
							deferred.resolve(response);
						}
						else deferred.reject(false);
					}, function(response){
                        deferred.reject(false);
                    }, function(response){
                        if(response){
                            if(response.length > 0){
                                // update local data
                                var allData;
                                localStorageService.getItem('allData',function(val){
                                   allData = val ? JSON.parse(val) : [];
                                    if(lastUpdated == 0) {
                                        allData = allData.concat(response);
                                    }
                                    else{
                                        //to remove duplicates since the server would also return the records that we already have in allDate
                                        var lastUpdatedTimestamp = new Date(lastUpdated).getTime()/1000;
                                        allData = allData.filter(function(x){
                                            return x.timestamp < lastUpdatedTimestamp;
                                        });
                                        //Extracting New Records
                                        var new_records = response.filter(function (elem) {
                                            return elem['timestamp'] > lastUpdatedTimestamp;
                                        });
                                        console.log('new record');
                                        console.log(new_records);
                                        //Handling case if a primary outcome variable is updated
                                        //Extracting Updated Records
                                        var updated_records = response.filter(function(elem){
                                            var updated_at_timestamp =  moment.utc(elem['updatedTime']*1000).unix();
                                            var created_at_timestamp =  moment.utc(elem['createdTime']*1000).unix();
                                            //Criteria for updated records
                                            return (updated_at_timestamp > lastUpdatedTimestamp && created_at_timestamp != updated_at_timestamp) ;
                                        });
                                        //Replacing primary outcome variable object in original allData object
                                        allData.map(function(x,index) {
                                            updated_records.forEach(function(elem){
                                                if (x['timestamp'] === elem['timestamp'] && x.source === config.get('client_source_name')) {
                                                    console.log('found at ' + index);
                                                    x = elem;
                                                }
                                            });
                                        });
                                        console.log('updated records');
                                        console.log(updated_records);
                                        allData = allData.concat(new_records);
                                    }

                                    var s  = 9999999999999; 
                                    allData.forEach(function(x){if(x.timestamp <= s){s = x.timestamp;}});

                                    measurementService.setDates(new Date().getTime(),s*1000);
                                    //updating last updated time and data in local storage so that we syncing should continue from this point
                                    //if user restarts the app or refreshes the page.
                                    localStorageService.setItem('allData',JSON.stringify(allData));
                                    localStorageService.setItem('lastUpdated',moment(allData[allData.length-1].timestamp*1000).utc().format('YYYY-MM-DDTHH:mm:ss'));
                                });

                            }
                        } 
                    });
				};

				//sync queue
                localStorageService.getItem('measurementsQueue',function(measurementsQueue){
                    if(measurementsQueue){
                        // if measurement queues is present
                        var measurementsQueue = JSON.parse(measurementsQueue);
                        if(measurementsQueue.length > 0)
                        // synch queues
                            syncQueue(measurementsQueue).then(function(){
                                if(lastUpdated == 0){
                                    //we will get all the data from server
                                    localStorageService.setItem('allData','[]');
                                }
                                setTimeout(function(){
                                    get_measurements();
                                },100);
                            });
                        else get_measurements();
                    } else get_measurements();

                });

				return deferred.promise;
			},

			// calculate average from local data
			calculateAveragePrimaryOutcomeVariableValue : function(){
				var deferred = $q.defer();
				var data;
                getAllData(false,function(allData){
                    data = allData;
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
                    if(averagePrimaryOutcomeVariableValue) deferred.resolve(averagePrimaryOutcomeVariableValue)
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

                localStorageService.getItem('allData', function(allData){
                    if(!allData){
                        deferred.reject(false);
                    } else {
                        var data = JSON.parse(allData);
                        var barChartArray = [0,0,0,0,0];

                        for(var i = 0; i<data.length; i++){
                            if(data[i].unit == config.appSettings.primary_outcome_variable_details.unit && ( Math.ceil(data[i].value)-1) <= 4 ){
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
                    if(barChartData)
                        deferred.resolve(JSON.parse(barChartData))
                    else
                        deferred.reject(false);
                });

				return deferred.promise;
			},

			// calculate line chart values
			calculateLineChart : function(){
				var deferred = $q.defer();

                localStorageService.getItem('allData', function(allData){
                    if(!allData){
                        deferred.reject(false);
                    } else {
                        var data = JSON.parse(allData);
                        var lineChartArray = [];

                        for(var i = 0; i<data.length; i++)
                        {
                            var current_value = current_value;
                            if(data[i].unit == config.appSettings.primary_outcome_variable_details.unit && (current_value-1) <= 4 && (current_value-1) >= 0){
                                lineChartArray.push([moment(data[i].humanTime.date).unix(), (current_value-1)*25] );
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
                    if(lineChartData)
                        deferred.resolve(JSON.parse(lineChartData))
                    else
                        deferred.reject(false);
                });

				return deferred.promise;
			},

			// calculate both charts in same iteration
			calculateBothChart : function(){
				var deferred = $q.defer();
                
                getAllData(false,function(data){
                    if(!data && data.length == 0){
                        deferred.reject(false);
                    } else {
                        var lineArr = [];
                        var barArr = [0,0,0,0,0];

                        for(var i = 0; i<data.length; i++){
                            var current_value = Math.ceil(data[i].value);
                            if(data[i].unit == config.appSettings.primary_outcome_variable_details.unit && (current_value-1) <= 4 && (current_value-1) >= 0){
                                lineArr.push([moment(data[i].humanTime.date).unix()*1000, (current_value-1)*25] );
                                barArr[current_value-1]++;
                            }
                        }
                        localStorageService.setItem('lineChartData',JSON.stringify(lineArr));
                        localStorageService.setItem('barChartData',JSON.stringify(barArr));
                        deferred.resolve([lineArr, barArr]);
                    }
                });



		       return deferred.promise;
			},

			// get public variables
			searchVariablesIncludePublic : function(str){
				var deferred = $q.defer();

				QuantiModo.searchVariablesIncludePublic(str, function(vars){
					deferred.resolve(vars);
				}, function(){
					deferred.reject(false);
				});

				return deferred.promise;
			},

            searchVariablesByCategoryIncludePublic : function(str,category){
                var deferred = $q.defer();

                QuantiModo.searchVariablesByCategoryIncludePublic(str,category, function(vars){
                    deferred.resolve(vars);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },

			// refresh localstorage with updated variables from QuantiModo API
			refreshVariables : function(){
				var deferred = $q.defer();

				QuantiModo.getVariables(function(vars){

                    localStorageService.setItem('variables', JSON.stringify(vars));
					deferred.resolve(vars);
                    
				}, function(){
					deferred.reject(false);
				});

				return deferred.promise;
			},

            getVariablesByName : function(name){
                var deferred = $q.defer();

                // refresh always
                QuantiModo.getVariable(name, function(variable){
                    deferred.resolve(variable);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },            

			// get variables locally
			getVariables : function(){
				var deferred = $q.defer();

				// refresh always
		       	QuantiModo.getVariables(function(vars){
		       		localStorageService.setItem('variables',JSON.stringify(vars));
		       		console.log(vars);
		       		deferred.resolve(vars);
		       	}, function(){
		       		deferred.reject(false);
		       	});

		       return deferred.promise;
		   	},

            getVariablesByCategory : function(category){
                var deferred = $q.defer();

                // refresh always
                QuantiModo.getVariablesByCategory(category,function(vars){
                    localStorageService.setItem('variables',JSON.stringify(vars));
                    console.log(vars);
                    deferred.resolve(vars);
                }, function(){
                    deferred.reject(false);
                });

                return deferred.promise;
            },

            getHistoryMeasurements : function(params){
                var deferred = $q.defer();

                QuantiModo.getV1Measurements(params, function(response){
                    deferred.resolve(response);
                }, function(error){
                    deferred.reject(error)
                });

                return deferred.promise;
            },

		   	// get variable categories
			getVariableCategories : function(){
				var deferred = $q.defer();

                localStorageService.getItem('variableCategories',function(variableCategories){
                    if(variableCategories){
                        deferred.resolve(JSON.parse(variableCategories));
                    } else {
                        QuantiModo.getVariableCategories(function(vars){
                            localStorageService.setItem('variableCategories', JSON.stringify(vars));
                            deferred.resolve(vars);
                        }, function(){
                            deferred.reject(false);
                        });
                    }
                });



				return deferred.promise;
			},

			// refresh local variable categroies with QuantiModo API
			refreshVariableCategories : function(){
				var deferred = $q.defer();

				QuantiModo.getVariableCategories(function(vars){
					localStorageService.setItem('variableCategories',JSON.stringify(vars));
					deferred.resolve(vars);
				}, function(){
					deferred.reject(false);
				});

				return deferred.promise;
			},

			// get units
			getUnits : function(){
				var deferred = $q.defer();

                localStorageService.getItem('units',function(units){
                    if(units){
                        deferred.resolve(JSON.parse(units));
                    } else {
                        QuantiModo.getUnits(function(units){
                            localStorageService.setItem('units',JSON.stringify(units));
                            deferred.resolve(units);
                        }, function(){
                            deferred.reject(false);
                        });
                    }
                });



				return deferred.promise;
			},

			// refresh local untis with QuantiModo API
			refreshUnits : function(){
				var deferred = $q.defer();

				QuantiModo.getUnits(function(units){
					localStorageService.setItem('units',JSON.stringify(units));
					deferred.resolve(units);
				}, function(){
					deferred.reject(false);
				});

				return deferred.promise;
            },

            resetSyncFlag:function(){
              isSynced = false;
            }
		};

		return measurementService;
	});