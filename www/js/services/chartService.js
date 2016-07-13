angular.module('starter')
	// returns high chart compatible Stubs for line and Bar charts
	.factory('chartService', function(ratingService){
	    var chartService = {

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
	                        height : 400,
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

			configureWeekdayChart : function(data, variableName){
	        	var maximum = 0;
				var minimum = 99999999999999999999999999999999;
				var displayVariableName = variableName + ' by Day of Week';
				var xAxisLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
				for(var i = 0; i < data.length; i++){
					if(data[i] > maximum){
						maximum = data[i];
					}
					if(data[i] < minimum){
						minimum = data[i];
					}
				}
				return {
					options: {
						chart: {
							height : 400,
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
								text : 'Average Value'
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
						name : displayVariableName,
						data: data
					}]
				};
			},

			configureHourlyChart : function(data, variableName){
				var maximum = 0;
				var minimum = 99999999999999999999999999999999;
				var displayVariableName = variableName + ' by Hour of Day';
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

				for(var i = 0; i < data.length; i++){
					if(data[i] > maximum){
						maximum = data[i];
					}
					if(data[i] < minimum){
						minimum = data[i];
					}
				}
				return {
					options: {
						chart: {
							height : 400,
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
								text : 'Average Value'
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
						name : displayVariableName,
						data: data
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