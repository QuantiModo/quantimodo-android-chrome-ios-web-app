angular.module('starter')
	// returns high chart compatible Stubs for line and Bar charts
	.factory('chartService', function(ratingService, localStorageService, $q, $timeout) {
	    var chartService = {};

		chartService.getWeekdayChartConfigForPrimaryOutcome = function () {
			var deferred = $q.defer();
			deferred.resolve(chartService.processDataAndConfigureWeekdayChart(localStorageService.getItemAsObject('allMeasurements'),
				config.appSettings.primaryOutcomeVariableDetails));
			return deferred.promise;
		};

		chartService.generateDistributionArray = function(allMeasurements){
			var distributionArray = [];
			var valueLabel;
			for (var i = 0; i < allMeasurements.length; i++) {
				valueLabel = String(allMeasurements[i].value);
				if(valueLabel.length > 1) {
					valueLabel = String(Number(allMeasurements[i].value.toPrecision(1)));
				}
				if(typeof distributionArray[valueLabel] === "undefined"){
					distributionArray[valueLabel] = 0;
				}
				distributionArray[valueLabel] += 1;
			}
			return distributionArray;
		};

		chartService.generateWeekdayMeasurementArray = function(allMeasurements){
            if(!allMeasurements){
                console.error('No measurements provided to generateWeekdayMeasurementArray');
                return false;
            }
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
		};

		chartService.generateHourlyMeasurementArray = function(allMeasurements){
			var hourlyMeasurementArrays = [];
			for (var i = 0; i < allMeasurements.length; i++) {
				var startTimeMilliseconds = allMeasurements[i].startTimeEpoch * 1000;
				if (typeof hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()] === "undefined") {
					hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()] = [];
				}
				hourlyMeasurementArrays[moment(startTimeMilliseconds).hour()].push(allMeasurements[i]);
			}
			return hourlyMeasurementArrays;
		};

		chartService.calculateAverageValueByHour= function(hourlyMeasurementArrays) {
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
		};

		chartService.calculateAverageValueByWeekday = function(weekdayMeasurementArrays) {
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
		};

		chartService.configureDistributionChart = function(dataAndLabels, variableObject){
			var xAxisLabels = [];
			var xAxisTitle = 'Daily Values (' + variableObject.abbreviatedUnitName + ')';
			var data = [];
			if(variableObject.name === config.appSettings.primaryOutcomeVariableDetails.name){
				data = [0, 0, 0, 0, 0];
			}

			function isInt(n) {
				return parseFloat(n) % 1 === 0;
			}

			var dataAndLabels2 = [];
			for(var propertyName in dataAndLabels) {
				// propertyName is what you want
				// you can get the value like this: myObject[propertyName]
				if(dataAndLabels.hasOwnProperty(propertyName)){
					dataAndLabels2.push({label: propertyName, value: dataAndLabels[propertyName]});
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

			dataAndLabels2.sort(function(a, b) {
				return a.label - b.label;
			});

			xAxisLabels = [];
			data = [];

			for(var i = 0; i < dataAndLabels2.length; i++){
				xAxisLabels.push(dataAndLabels2[i].label);
				data.push(dataAndLabels2[i].value);
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
							enableMouseTracking : true,
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
		};

		chartService.processDataAndConfigureWeekdayChart = function(measurements, variableObject) {
            if(!measurements){
                console.error('No measurements provided to processDataAndConfigureWeekdayChart');
                return false;
            }
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
		};

		chartService.processDataAndConfigureHourlyChart = function(measurements, variableObject) {
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
			var count = 0;
			for(var i = 0; i < hourlyMeasurementArray.length; ++i){
				if(hourlyMeasurementArray[i]) {
					count++;
				}
			}

			if(variableObject.name.toLowerCase().indexOf('daily') !== -1){
				console.debug('Not showing hourly chart because variable name contains daily');
				return false;
			}
			if(count < 3){
				console.debug('Not showing hourly chart because we have less than 3 hours with measurements');
				return false;
			}
			var averageValueByHourArray = this.calculateAverageValueByHour(hourlyMeasurementArray);
			return this.configureHourlyChart(averageValueByHourArray, variableObject);
		};

		chartService.processDataAndConfigureDistributionChart = function(measurements, variableObject) {
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
		};

		chartService.configureWeekdayChart = function(averageValueByWeekdayArray, variableObject){

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
						text : 'Average  ' + variableObject.name + ' by Day of Week'
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
					name : 'Average  ' + variableObject.name + ' by Day of Week',
					data: averageValueByWeekdayArray
				}]
			};
		};

		chartService.configureHourlyChart = function(averageValueByHourArray, variableObject){

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
						text : 'Average  ' + variableObject.name + ' by Hour of Day'
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
					name : 'Average  ' + variableObject.name + ' by Hour of Day',
					data: averageValueByHourArray
				}]
			};
		};

		chartService.processDataAndConfigureLineChart = function(measurements, variableObject) {
			var lineChartData = [];
			var lineChartItem;
			if(!variableObject.abbreviatedUnitName){
				variableObject.abbreviatedUnitName = measurements[0].abbreviatedUnitName;
			}
			for (var i = 0; i < measurements.length; i++) {
				lineChartItem = [measurements[i].startTimeEpoch * 1000, measurements[i].value];
				lineChartData.push(lineChartItem);
			}
			return chartService.configureLineChart(lineChartData, variableObject);
		};

		var ctx = this;
		var origMovingAverage = ctx.movingAverage;

		function isNumber(obj) {
			if (isNaN(obj)) {
				return false;
			}

			return Object.prototype.toString.call(obj) === '[object Number]';
		}

		function maybeCoerce(item) {
			if (! isNumber(item)) {
				item = parseFloat(item) || 0;
			}

			return item;
		}

		function reducer(memo, item, index, arr) {
			Object.defineProperty(memo, 'currentTotal', {
				value: (memo.currentTotal || 0) + item,
				enumerable: false,
				writable: true
			});

			memo.push(memo.currentTotal / (index + 1));
			return memo;
		}

		function movingAverage(items) {
			if (! Array.isArray(items)) {
				items = [];
			}

			return items.map(maybeCoerce).reduce(reducer, []);
		}

		movingAverage.noConflict = function () {
			ctx.movingAverage = origMovingAverage;
			return movingAverage;
		};

		chartService.processDataAndConfigureCorrelationOverTimeChart = function(correlations) {
			var forwardPearsonCorrelationSeries = {
				name : 'Pearson Correlation Coefficient',
				data : [],
				tooltip: {
					valueDecimals: 2
				}
			};

			var forwardSpearmanCorrelationSeries = {
				name : 'Spearman Correlation Coefficient',
				data : [],
				tooltip: {
					valueDecimals: 2
				}
			};

			var qmScoreSeries = {
				name : 'QM Score',
				data : [],
				tooltip: {
					valueDecimals: 2
				}
			};

			var xAxis = [];

			var excludeSpearman = false;
			var excludeQmScoreSeries = false;
			for (var i = 0; i < correlations.length; i++) {
				xAxis.push('Day ' + correlations[i].onsetDelay/(60 * 60 * 24));
				forwardPearsonCorrelationSeries.data.push(correlations[i].correlationCoefficient);
				forwardSpearmanCorrelationSeries.data.push(correlations[i].forwardSpearmanCorrelationCoefficient);
				if(correlations[i].forwardSpearmanCorrelationCoefficient === null){
					excludeSpearman = true;
				}
				qmScoreSeries.data.push(correlations[i].qmScore);
				if(correlations[i].qmScore === null){
					excludeQmScoreSeries = true;
				}
			}

			var seriesToChart = [];
			seriesToChart.push(forwardPearsonCorrelationSeries);
			if(!excludeSpearman){
				seriesToChart.push(forwardSpearmanCorrelationSeries);
			}
			if(!excludeQmScoreSeries){
				seriesToChart.push(qmScoreSeries);
			}
			var minimumTimeEpochMilliseconds = correlations[0].onsetDelay * 1000;
			var maximumTimeEpochMilliseconds = correlations[correlations.length - 1].onsetDelay * 1000;
			var millisecondsBetweenLatestAndEarliest = maximumTimeEpochMilliseconds - minimumTimeEpochMilliseconds;

			if(millisecondsBetweenLatestAndEarliest < 86400*1000){
				console.warn('Need at least a day worth of data for line chart');
				return;
			}

			var config = {
				title: {
					text: 'Correlations Over Onset Delays',
					//x: -20 //center
				},
				subtitle: {
					text: '',
					//text: 'Effect of ' + correlations[0].causeVariableName + ' on ' + correlations[0].effectVariableName + ' Over Time',
					//x: -20
				},
				legend : {
					enabled : false
				},
				xAxis: {
					title: {
						text: 'Onset Delay (Time Shift in Days Relative to Stimulus Event)'
					},
					categories: xAxis
				},
				yAxis: {
					title: {
						text: 'Value'
					},
					plotLines: [{
						value: 0,
						width: 1,
						color: '#808080'
					}]
				},
				tooltip: {
					valueSuffix: ''
				},
				series : seriesToChart
			};

			return config;
		};

		chartService.createScatterPlot = function (params, pairs) {
			var scatterplotOptions = {
				options: {
					chart: {
						type: 'scatter',
						zoomType: 'xy'
					},
					plotOptions: {
						scatter: {
							marker: {
								radius: 5,
								states: {
									hover: {
										enabled: true,
										lineColor: 'rgb(100,100,100)'
									}
								}
							},
							states: {
								hover: {
									marker: {
										enabled: false
									}
								}
							},
							tooltip: {
								//headerFormat: '<b>{series.name}</b><br>',
								pointFormat: '{point.x} ' + params.causeVariableName + ', {point.y} ' + params.effectVariableName
							}
						}
					},
					credits: {
						enabled: false
					}
				},
				xAxis: {
					title: {
						enabled: true,
						text: 'Height (cm)'
					},
					startOnTick: true,
					endOnTick: true,
					showLastLabel: true
				},
				yAxis: {
					title: {
						text: 'Weight (kg)'
					}
				},

				series: [{
					name: params.effectVariableName + ' by ' + params.causeVariableName,
					color: 'rgba(223, 83, 83, .5)',
					data: []
				}],
				title: {
					text: params.effectVariableName + ' by ' + params.causeVariableName
				},
				subtitle: {
					text: ''
				},
				loading: false
			};

			var xyVariableValues = [];

			for(var i = 0; i < pairs.length; i++ ){
				xyVariableValues.push([pairs[i].causeMeasurementValue, pairs[i].effectMeasurementValue]);
			}

			scatterplotOptions.series[0].data = xyVariableValues;
			scatterplotOptions.xAxis.title.text = params.causeVariableName + ' (' + pairs[0].causeAbbreviatedUnitName + ')';
			scatterplotOptions.yAxis.title.text = params.effectVariableName + ' (' + pairs[0].effectAbbreviatedUnitName + ')';
			scatterplotOptions.options.plotOptions.scatter.tooltip.pointFormat = '{point.x}' + pairs[0].causeAbbreviatedUnitName + ', {point.y}' + pairs[0].effectAbbreviatedUnitName;
			return scatterplotOptions;


		};

		chartService.configureLineChartForCause  = function(params, pairs) {
			var variableObject = {
				abbreviatedUnitName: pairs[0].causeAbbreviatedUnitName,
				name: params.causeVariableName
			};
			
			var data = [];
			
			for (var i = 0; i < pairs.length; i++) {
				data[i] = [pairs[i].timestamp * 1000, pairs[i].causeMeasurementValue];
			}
			
			return chartService.configureLineChart(data, variableObject);
		};

		chartService.configureLineChartForEffect  = function(params, pairs) {
			var variableObject = {
				abbreviatedUnitName: pairs[0].effectAbbreviatedUnitName,
				name: params.effectVariableName
			};

			var data = [];

			for (var i = 0; i < pairs.length; i++) {
				data[i] = [pairs[i].timestamp * 1000, pairs[i].effectMeasurementValue];
			}

			return chartService.configureLineChart(data, variableObject);
		};

		chartService.configureLineChartForPairs = function(params, pairs) {
			var inputColor = '#26B14C', outputColor = '#3284FF', mixedColor = '#26B14C', linearRegressionColor = '#FFBB00';

			if(!params.causeVariableName){
				console.error("ERROR: No variable name provided to configureLineChart");
				return;
			}
			if(pairs.length < 1){
				console.error("ERROR: No data provided to configureLineChart");
				return;
			}
			var date = new Date();
			var timezoneOffsetHours = (date.getTimezoneOffset())/60;
			var timezoneOffsetMilliseconds = timezoneOffsetHours*60*60*1000; // minutes, seconds, milliseconds

			var causeSeries = [];
			var effectSeries = [];

			for (var i = 0; i < pairs.length; i++) {
				causeSeries[i] = [pairs[i].timestamp * 1000 - timezoneOffsetMilliseconds, pairs[i].causeMeasurementValue];
				effectSeries[i] = [pairs[i].timestamp * 1000 - timezoneOffsetMilliseconds, pairs[i].effectMeasurementValue];
			}

			var minimumTimeEpochMilliseconds = pairs[0].timestamp * 1000 - timezoneOffsetMilliseconds;
			var maximumTimeEpochMilliseconds = pairs[pairs.length-1].timestamp * 1000 - timezoneOffsetMilliseconds;
			var millisecondsBetweenLatestAndEarliest = maximumTimeEpochMilliseconds - minimumTimeEpochMilliseconds;

			if(millisecondsBetweenLatestAndEarliest < 86400 * 1000){
				console.warn('Need at least a day worth of data for line chart');
				return;
			}

			var tlSmoothGraph, tlGraphType; // Smoothgraph true = graphType spline
			var tlEnableMarkers;
			var tlEnableHorizontalGuides = 1;
			tlSmoothGraph = true;
			tlGraphType = tlSmoothGraph === true ? 'spline' : 'line'; // spline if smoothGraph = true
			tlEnableMarkers = true; // On by default

			return  {
				chart: {renderTo: 'timeline', zoomType: 'x'},
				title: {
					text: params.causeVariableName + ' & ' + params.effectVariableName + ' Over Time'
				},
				//subtitle: {text: 'Longitudinal Timeline' + resolution, useHTML: true},
				legend: {enabled: false},
				scrollbar: {
					barBackgroundColor: '#eeeeee',
					barBorderRadius: 0,
					barBorderWidth: 0,
					buttonBackgroundColor: '#eeeeee',
					buttonBorderWidth: 0,
					buttonBorderRadius: 0,
					trackBackgroundColor: 'none',
					trackBorderWidth: 0.5,
					trackBorderRadius: 0,
					trackBorderColor: '#CCC'
				},
				navigator: {
					adaptToUpdatedData: true,
					margin: 10,
					height: 50,
					handles: {
						backgroundColor: '#eeeeee'
					}
				},
				xAxis: {
					type: 'datetime',
					gridLineWidth: false,
					dateTimeLabelFormats: {
						millisecond: '%H:%M:%S.%L',
						second: '%H:%M:%S',
						minute: '%H:%M',
						hour: '%H:%M',
						day: '%e. %b',
						week: '%e. %b',
						month: '%b \'%y',
						year: '%Y'
					},
					min: minimumTimeEpochMilliseconds,
					max: maximumTimeEpochMilliseconds
				},
				yAxis: [
					{
						gridLineWidth: tlEnableHorizontalGuides,
						title: {text: '', style: {color: inputColor}},
						labels: {
							formatter: function () {
								return this.value;
							}, style: {color: inputColor}
						}
					},
					{
						gridLineWidth: tlEnableHorizontalGuides,
						title: {text: 'Data is coming down the pipes!', style: {color: outputColor}},
						labels: {
							formatter: function () {
								return this.value;
							}, style: {color: outputColor}
						},
						opposite: true
					}
				],
				plotOptions: {
					series: {
						lineWidth: 1,
						states: {
							hover: {
								enabled: true,
								lineWidth: 1.5
							}
						}
					}
				},
				series: [
					{
						yAxis: 0,
						name : params.causeVariableName,
						type: tlGraphType,
						color: inputColor,
						data: causeSeries,
						marker: {enabled: tlEnableMarkers, radius: 3}
					},
					{
						yAxis: 1,
						name : params.effectVariableName,
						type: tlGraphType,
						color: outputColor,
						data: effectSeries,
						marker: {enabled: tlEnableMarkers, radius: 3}
					}
				],
				credits: {
					enabled: false
				},
				rangeSelector: {
					inputBoxWidth: 120,
					inputBoxHeight: 18
				}
			};
		};

		chartService.configureLineChart = function(data, variableObject) {
			if(!variableObject.name){
				if(variableObject.variableName){
					variableObject.name = variableObject.variableName;
				} else {
					console.error("ERROR: No variable name provided to configureLineChart");
					return;
				}
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

			var minimumTimeEpochMilliseconds = data[0][0] - timezoneOffsetMilliseconds;
			var maximumTimeEpochMilliseconds = data[data.length-1][0] - timezoneOffsetMilliseconds;
			var millisecondsBetweenLatestAndEarliest = maximumTimeEpochMilliseconds - minimumTimeEpochMilliseconds;

			if(millisecondsBetweenLatestAndEarliest < 86400*1000){
				console.warn('Need at least a day worth of data for line chart');
				return;
			}

			return {
				useHighStocks: true,
				options : {
					legend : {
						enabled : false
					},
					title: {
						text: variableObject.name + ' Over Time (' + variableObject.abbreviatedUnitName + ')'
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
						min: minimumTimeEpochMilliseconds,
						max: maximumTimeEpochMilliseconds
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
					marker: {
						enabled: true,
						radius: 2
					},
					tooltip: {
						valueDecimals: 2
					},
					lineWidth: 0,
					states: {
						hover: {
							lineWidthPlus: 0
						}
					}
				}]
			};
		};

		return chartService;
});