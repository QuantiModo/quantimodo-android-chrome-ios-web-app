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

	                    colors : [ "#55000000", "#5D83FF", "#68B107", "#ffbd40", "#CB0000" ]
	                },
	                series: [{
	                    name : config.appSettings.tracking_factor,
	                    data: data
	                }]
	            };
	        },

	        // generate stock chart
	        getLineChartStub : function(data){
	        	return {
	        		useHighStocks: true,
	        		options : {
	        			legend : {
	        			    enabled : false
	        			},
	        			title: {
	        			    text: config.appSettings.tracking_factor+' Over Time'
	        			},
	                    credits: {
	                        enabled: false
	                    },
	                    rangeSelector: {
                            enabled: true
                        },
                        navigator: {
                            enabled: true
                        }
	        		},
	        		series :[{
			            name : config.appSettings.tracking_factor,
			            data : data,
			            tooltip: {
			                valueDecimals: 2
			            }
			        }]
	        	}
	        }
	    };

	    return chartService;
	});