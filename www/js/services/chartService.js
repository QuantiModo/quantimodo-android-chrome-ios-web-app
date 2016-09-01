angular.module('starter')
	// returns high chart compatible Stubs for line and Bar charts
	.factory('chartService', function(ratingService) {
	    var chartService = {

			generateDistributionArray : function(allMeasurements){
				var distributionArray = [];
				for (var i = 0; i < allMeasurements.length; i++) {
					if(typeof distributionArray[String(allMeasurements[i].value.toPrecision(2))] === "undefined"){
						distributionArray[String(allMeasurements[i].value.toPrecision(2))] = 0;
					}
					distributionArray[String(allMeasurements[i].value.toPrecision(2))] += 1;
				}
				return distributionArray;
			},

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
						//console.debug("No data for hour " + k);
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
						//console.debug("No data for day " + k);
					}
				}
				return averageValueByWeekdayArray;
			},

	    	// generate bar chart stub with data
	        configureDistributionChart : function(dataAndLabels, variableObject){
				var xAxisLabels = [];
				var xAxisTitle = 'Daily Values (' + variableObject.abbreviatedUnitName + ')';
				var data = [];
				if(variableObject.name === config.appSettings.primaryOutcomeVariableDetails.name){
					data = [0, 0, 0, 0, 0];
				}

				function isInt(n) {
					return parseFloat(n) % 1 === 0;
				}

				for(var propertyName in dataAndLabels) {
					// propertyName is what you want
					// you can get the value like this: myObject[propertyName]
					if(dataAndLabels.hasOwnProperty(propertyName)){
						xAxisLabels.push(propertyName);
						if(variableObject.name === config.appSettings.primaryOutcomeVariableDetails.name){
							if(isInt(propertyName)){
								data[parseInt(propertyName) - 1] = dataAndLabels[propertyName];
							}
						} else {
							data.push(dataAndLabels[propertyName]);
						}
					}
				}

				if(variableObject.name === config.appSettings.primaryOutcomeVariableDetails.name) {
					xAxisLabels = ratingService.getPrimaryOutcomeVariableOptionLabels();
					xAxisTitle = '';
				}
	            return {
	                options: {
	                    chart: {
	                        height : 300,
	                        type : 'column',
	                        renderTo : 'BarContainer',
	                        animation: {
	                            duration: 0
	                        }
	                    },
	                    title : {
	                        text : variableObject.name + ' Distribution'
	                    },
	                    xAxis : {
							title : {
								text : xAxisTitle
							},
	                        categories : xAxisLabels
	                    },
	                    yAxis : {
	                        title : {
	                            text : 'Number of Measurements'
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
	                            pointWidth : 40 * 5 / xAxisLabels.length,
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
	                    name : variableObject.name + ' Distribution',
	                    data: data
	                }]
	            };
	        },

			processDataAndConfigureWeekdayChart : function(measurements, variableObject) {
				if(!variableObject.name){
					console.error("ERROR: No variable name provided to processDataAndConfigureWeekdayChart");
					return;
				}
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
				if(!variableObject.name){
					console.error("ERROR: No variable name provided to processDataAndConfigureHourlyChart");
					return;
				}

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

			processDataAndConfigureDistributionChart : function(measurements, variableObject) {
				if(!variableObject.name){
					console.error("ERROR: No variable name provided to processDataAndConfigureHourlyChart");
					return;
				}

				if(!variableObject.unitName){
					variableObject.unitName = measurements[0].unitName;
				}
				if(!variableObject.unitName){
					variableObject.unitName = measurements[0].abbreviatedUnitName;
				}
				var distributionArray = this.generateDistributionArray(measurements);
				return this.configureDistributionChart(distributionArray, variableObject);
			},

			configureWeekdayChart : function(averageValueByWeekdayArray, variableObject){

				if(!variableObject.name){
					console.error("ERROR: No variable name provided to configureWeekdayChart");
					return;
				}

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
							text : variableObject.name + ' by Day of Week'
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
								pointWidth : 40 * 5 / xAxisLabels.length,
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
						name : variableObject.name + ' by Day of Week',
						data: averageValueByWeekdayArray
					}]
				};
			},

			configureHourlyChart : function(averageValueByHourArray, variableObject){

				if(!variableObject.name){
					console.error("ERROR: No variable name provided to configureHourlyChart");
					return;
				}

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
							text : variableObject.name + ' by Hour of Day'
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
								pointWidth : 40 * 5 / xAxisLabels.length,
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
						name : variableObject.name + ' by Hour of Day',
						data: averageValueByHourArray
					}]
				};
			},

			processDataAndConfigureLineChart: function(measurements, variableObject) {
				var lineChartData = [];
				var lineChartItem;
				for (var i = 0; i < measurements.length; i++) {
					lineChartItem = [measurements[i].startTimeEpoch * 1000, measurements[i].value];
					lineChartData.push(lineChartItem);
				}
				return chartService.configureLineChart(lineChartData, variableObject);
			},

	        // generate stock chart
	        configureLineChart : function(data, variableObject) {
				if(!variableObject.name){
					console.error("ERROR: No variable name provided to configureLineChart");
					return;
				}
				if(data.length < 1){
					console.error("ERROR: No data provided to configureLineChart");
					return;
				}
				var date = new Date();
				var timezoneOffsetHours = (date.getTimezoneOffset())/60;
				var timezoneOffsetMilliseconds = timezoneOffsetHours*60*60*1000; // minutes, seconds, milliseconds

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
	        			    text: variableObject.name + ' Over Time'
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
			            name : variableObject.name + ' Over Time',
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