angular.module('starter')
	// returns high chart compatible Stubs for line and Bar charts
	.factory('chartService', function(){
	    var chartService = {

	    	// generate bar chart stub with data
	        getBarChartStub : function(data){
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
	                        text : config.appSettings.tracking_factor+ ' Distribution'
	                    },
	                    xAxis : {
	                        categories : config.getTrackingFactorOptionLabels()
	                    },
	                    yAxis : {
	                        title : {
	                            text : ''
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

	                    colors : [ "#55000000", "#5D83FF", "#68B107", "#ffbd40", "#CB0000" ]
	                },
	                series: [{
	                    name : config.appSettings.tracking_factor,
	                    data: data
	                }]
	            };
	        },

	        // generate line chart stub with data
	        getLineChartStub : function(data){
	            return {
	                options : {
	                    chart: {
	                        type: 'spline',
	                        height : 400,
	                        spacingBottom : 0,
	                        spacingLeft : 0,
	                        spacingRight : 0,
	                        renderTo: 'LineContainer'
	                    },
	                    legend : {
	                        enabled : false
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
	                    title: {
	                        text: config.appSettings.tracking_factor+' Over Time'
	                    },        
	                    xAxis: {
	                        type: 'datetime',
	                        title: {
	                           text: 'Date'
	                        }
	                    },
	                    yAxis: {
	                        title: {
	                           text: config.appSettings.tracking_factor
	                        }
	                    },
	                    plotOptions : {
	                        spline : {
	                            lineWidth : 2,
	                            allowPointSelect : false,
	                            marker : {
	                                enabled : false
	                            },
	                            enableMouseTracking : false,
	                            size : '100%',
	                            dataLabels : {
	                                enabled : false
	                            }
	                        }
	                    },
	                    credits: {
	                        enabled: false
	                    }
	                },
	                series: [{
	                    name: config.appSettings.tracking_factor,
	                    data: data
	                }]
	            };
	        }
	    };

	    return chartService;
	});