angular.module('starter')
	// returns high chart compatible Stubs for line and Bar charts
	.factory('chartService', function(ratingService){
	    var chartService = {

	    	generateWeekdayMeasurementArray : function(allMeasurements){
				var weekdayMeasurementArrays = [];
				var startTimeMilliseconds = null;
				for (var i = 0; i < allMeasurements.length; i++) {
					startTimeMilliseconds = allMeasurements[i].startTimeEpoch * 1000;
					if(typeof weekdayMeasurementArrays[moment(startTimeMilliseconds).day()] === "undefined"){
						weekdayMeasurementArrays[moment(startTimeMilliseconds).day()] = [];
					}
					weekdayMeasurementArrays[moment(startTimeMilliseconds).day()].push(allMeasurements[i]);
				}
				return weekdayMeasurementArrays;
			},

			generateHourlyMeasurementArray : function(allMeasurements){
				var hourlyMeasurementArrays = [];
				for (var i = 0; i < allMeasurements.length; i++) {
					var startTimeMilliseconds = allMeasurements[i].startTimeEpoch * 1000;
					if (typeof hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()] === "undefined") {
						hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()] = [];
					}
					hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()].push(allMeasurements[i]);
				}
				return hourlyMeasurementArrays;
			},

			calculateAverageValueByHour: function(hourlyMeasurementArrays) {
				var sumByHour = [];
				var averageValueByHourArray = [];
				for (var k = 0; k < 23; k++) {
					if (typeof hourlyMeasurementArrays[k] !== "undefined") {
						for (var j = 0; j < hourlyMeasurementArrays[k].length; j++) {
							if (typeof sumByHour[k] === "undefined") {
								sumByHour[k] = 0;
							}
							sumByHour[k] = sumByHour[k] + hourlyMeasurementArrays[k][j].value;
						}
						averageValueByHourArray[k] = sumByHour[k] / (hourlyMeasurementArrays[k].length);
					} else {
						averageValueByHourArray[k] = null;
						console.debug("No data for hour " + k);
					}
				}
				return averageValueByHourArray;
			},

			calculateAverageValueByWeekday : function(weekdayMeasurementArrays) {
				var sumByWeekday = [];
				var averageValueByWeekdayArray = [];
				for (var k = 0; k < 7; k++) {
					if (typeof weekdayMeasurementArrays[k] !== "undefined") {
						for (var j = 0; j < weekdayMeasurementArrays[k].length; j++) {
							if (typeof sumByWeekday[k] === "undefined") {
								sumByWeekday[k] = 0;
							}
							sumByWeekday[k] = sumByWeekday[k] + weekdayMeasurementArrays[k][j].value;
						}
						averageValueByWeekdayArray[k] = sumByWeekday[k] / (weekdayMeasurementArrays[k].length);
					} else {
						averageValueByWeekdayArray[k] = null;
						console.debug("No data for day " + k);
					}
				}
				return averageValueByWeekdayArray;
			},

	    	// generate bar chart stub with data
	        configureBarChart : function(data, variableName){
				var displayVariableName;
				var xAxisLabels;
				if (variableName) {
					displayVariableName = variableName + ' distribution';
					xAxisLabels = ["1", "2", "3", "4", "5"];
				}
				else {
					displayVariableName = config.appSettings.primaryOutcomeVariable + ' Distribution';
					xAxisLabels = ratingService.getPrimaryOutcomeVariableOptionLabels();
				}
	            return {
	                options: {
	                    chart: {
	                        height : 300,
	                        type : 'column',
	                        renderTo : 'BarContainer',
	                        animation: {
	                            duration: 1000
	                        }
	                    },
	                    title : {
	                        text : displayVariableName
	                    },
	                    xAxis : {
	                        categories : xAxisLabels
	                    },
	                    yAxis : {
	                        title : {
	                            text : 'Number of ratings'
	                        },
	                        min : 0
	                    },
	                    lang: {
	                        loading: ''
	                    },
	                    loading: {
	                        style: {
	                            background: 'url(/res/loading3.gif) no-repeat center'
	                        },
	                        hideDuration: 10,
	                        showDuration: 10
	                    },
	                    legend : {
	                        enabled : false
	                    },

	                    plotOptions : {
	                        column : {
	                            pointPadding : 0.2,
	                            borderWidth : 0,
	                            pointWidth : 40,
	                            enableMouseTracking : false,
	                            colorByPoint : true
	                        }
	                    },
	                    credits: {
	                        enabled: false
	                    },

	                    colors : [ "#000000", "#5D83FF", "#68B107", "#ffbd40", "#CB0000" ]
	                },
	                series: [{
	                    name : displayVariableName,
	                    data: data
	                }]
	            };
	        },

			processDataAndConfigureWeekdayChart : function(measurements, variableObject) {
	        	if(!variableObject.unitName){
					variableObject.unitName = measurements[0].unitName;
					console.error("Please provide unit name with variable object!");
				}
				if(!variableObject.unitName){
					variableObject.unitName = measurements[0].abbreviatedUnitName;
					console.error("Please provide unit name with variable object!");
				}
				var weekdayMeasurementArray = this.generateWeekdayMeasurementArray(measurements);
				var averageValueByWeekdayArray = this.calculateAverageValueByWeekday(weekdayMeasurementArray);
				return this.configureWeekdayChart(averageValueByWeekdayArray, variableObject);

			},

			processDataAndConfigureHourlyChart : function(measurements, variableObject) {
				if(!variableObject.unitName){
					variableObject.unitName = measurements[0].unitName;
				}
				if(!variableObject.unitName){
					variableObject.unitName = measurements[0].abbreviatedUnitName;
				}
				var hourlyMeasurementArray = this.generateHourlyMeasurementArray(measurements);
				var averageValueByHourArray = this.calculateAverageValueByHour(hourlyMeasurementArray);
				return this.configureHourlyChart(averageValueByHourArray, variableObject);
			},

			configureWeekdayChart : function(averageValueByWeekdayArray, variableObject){
	        	var maximum = 0;
				var minimum = 99999999999999999999999999999999;
				var xAxisLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
				for(var i = 0; i < averageValueByWeekdayArray.length; i++){
					if(averageValueByWeekdayArray[i] > maximum){
						maximum = averageValueByWeekdayArray[i];
					}
					if(averageValueByWeekdayArray[i] < minimum){
						minimum = averageValueByWeekdayArray[i];
					}
				}
				return {
					options: {
						chart: {
							height : 300,
							type : 'column',
							renderTo : 'BarContainer',
							animation: {
								duration: 1000
							}
						},
						title : {
							text : variableObject.variableName + ' by Day of Week'
						},
						xAxis : {
							categories : xAxisLabels
						},
						yAxis : {
							title : {
								text : 'Average Value (' + variableObject.unitName + ')'
							},
							min : minimum,
							max : maximum
						},
						lang: {
							loading: ''
						},
						loading: {
							style: {
								background: 'url(/res/loading3.gif) no-repeat center'
							},
							hideDuration: 10,
							showDuration: 10
						},
						legend : {
							enabled : false
						},

						plotOptions : {
							column : {
								pointPadding : 0.2,
								borderWidth : 0,
								pointWidth : 40 * 5 / 7,
								enableMouseTracking : true,
								colorByPoint : true
							}
						},
						credits: {
							enabled: false
						},

						colors : [ "#5D83FF", "#68B107", "#ffbd40", "#CB0000" ]
					},
					series: [{
						name : variableObject.variableName + ' by Day of Week',
						data: averageValueByWeekdayArray
					}]
				};
			},

			configureHourlyChart : function(averageValueByHourArray, variableObject){

				var maximum = 0;
				var minimum = 99999999999999999999999999999999;
				var xAxisLabels = [
					'12 AM',
					'1 AM',
					'2 AM',
					'3 AM',
					'4 AM',
					'5 AM',
					'6 AM',
					'7 AM',
					'8 AM',
					'9 AM',
					'10 AM',
					'11 AM',
					'12 PM',
					'1 PM',
					'2 PM',
					'3 PM',
					'4 PM',
					'5 PM',
					'6 PM',
					'7 PM',
					'8 PM',
					'9 PM',
					'10 PM',
					'11 PM'
				];

				for(var i = 0; i < averageValueByHourArray.length; i++){
					if(averageValueByHourArray[i] > maximum){
						maximum = averageValueByHourArray[i];
					}
					if(averageValueByHourArray[i] < minimum){
						minimum = averageValueByHourArray[i];
					}
				}
				return {
					options: {
						chart: {
							height : 300,
							type : 'column',
							renderTo : 'BarContainer',
							animation: {
								duration: 1000
							}
						},
						title : {
							text : variableObject.variableName + ' by Hour of Day'
						},
						xAxis : {
							categories : xAxisLabels
						},
						yAxis : {
							title : {
								text : 'Average Value (' + variableObject.unitName + ')'
							},
							min : minimum,
							max : maximum
						},
						lang: {
							loading: ''
						},
						loading: {
							style: {
								background: 'url(/res/loading3.gif) no-repeat center'
							},
							hideDuration: 10,
							showDuration: 10
						},
						legend : {
							enabled : false
						},

						plotOptions : {
							column : {
								pointPadding : 0.2,
								borderWidth : 0,
								pointWidth : 40 * 5 / 24,
								enableMouseTracking : true,
								colorByPoint : true
							}
						},
						credits: {
							enabled: false
						},

						colors : [ "#5D83FF", "#68B107", "#ffbd40", "#CB0000"]
					},
					series: [{
						name : variableObject.variableName + ' by Hour of Day',
						data: averageValueByHourArray
					}]
				};
			},

	        // generate stock chart
	        configureLineChart : function(data, variableName) {
				var date = new Date();
				var timezoneOffsetHours = (date.getTimezoneOffset())/60;
				var timezoneOffsetMilliseconds = timezoneOffsetHours*60*60*1000; // minutes, seconds, milliseconds
				var displayVariableName;
				if (variableName) {
					displayVariableName = variableName + ' over time';
				}
				else {
					displayVariableName = config.appSettings.primaryOutcomeVariable + ' Over Time';
				}


				data = data.sort(function(a, b){
					return a[0] - b[0];
				});

				for (var i = 0; i < data.length; i++) {
					data[i][0] = data[i][0] - timezoneOffsetMilliseconds;
				}

	        	return {
	        		useHighStocks: true,
	        		options : {
	        			legend : {
	        			    enabled : false
	        			},
	        			title: {
	        			    text: displayVariableName
	        			},
	        			xAxis : {
	        				type: 'datetime',
							dateTimeLabelFormats : {
                    	        millisecond : '%I:%M %p',
                    	        second : '%I:%M %p',
                    	        minute: '%I:%M %p',
                    	        hour: '%I %p',
                	        	day: '%e. %b',
                	        	week: '%e. %b',
                	        	month: '%b \'%y',
                	        	year: '%Y'
                    	    },
                    	    min: (data[0][0]) - timezoneOffsetMilliseconds,
                    	    max: (data[data.length-1][0]) - timezoneOffsetMilliseconds
	        			},
	                    credits: {
	                        enabled: false
	                    },
	                    rangeSelector: {
                            enabled: true
                        },
                        navigator: {
                            enabled: true,
                            xAxis: {
                            	type : 'datetime',
                            	dateTimeLabelFormats : {
	                    	        millisecond : '%I:%M %p',
	                    	        second : '%I:%M %p',
	                    	        minute: '%I:%M %p',
	                    	        hour: '%I %p',
	                	        	day: '%e. %b',
	                	        	week: '%e. %b',
	                	        	month: '%b \'%y',
	                	        	year: '%Y'
	                    	    }
							}
                        }
	        		},
	        		series :[{
			            name : displayVariableName,
			            data : data,
			            tooltip: {
			                valueDecimals: 2
			            }
			        }]
	        	};
	        }
	    };

	    return chartService;
	});