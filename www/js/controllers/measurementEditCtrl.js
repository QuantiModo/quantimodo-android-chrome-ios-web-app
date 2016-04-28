angular.module('starter')

	.controller('MeasurementEditCtrl', function($scope, authService, $ionicPopup, localStorageService, $state, 
											   measurementService, $ionicLoading, variableService, utilsService, 
											   $stateParams){

	    $scope.controller_name = "MeasurementEditCtrl";

		var measurementId = $stateParams.measurementId;

		console.log('Loading ' + $scope.controller_name);
		
	    $scope.state = {
			measurementId : measurementId,
			showButtons : true,
	    	showMeasurementBox : false,
	    	selectedReminder : false,
	    	measurementDefaultValue : "",
	    	selected1to5Value : false,
	    	allReminders : [
	    	],
	    	trackingRemindersNotifications : [
	    	],
	    	filteredReminders : [
	    	],
	    	measurementDate : new Date(),
	    	measurementStartTimeObject : {
				epochTime: new Date().getTime()/1000,
				format: 12,
				step: 1
			},
			variable : {},
			isDisabled : false,
            measurementIsSetup: false
	    };
		
	    $scope.select_primary_outcome_variable = function($event, val){
	        // remove any previous primary outcome variables if present
	        jQuery('.primary_outcome_variables .active_primary_outcome_variable').removeClass('active_primary_outcome_variable');

	        // make this primary outcome variable glow visually
	        jQuery($event.target).addClass('active_primary_outcome_variable');

	        jQuery($event.target).parent().removeClass('primary_outcome_variable_history').addClass('primary_outcome_variable_history');

	        $scope.state.selected1to5Value = val;

		};
		
	    var utils = {
    	    startLoading : function(){
    	    	// show spinner
    			$ionicLoading.show({
    				noBackdrop: true,
    				template: '<p class="item-icon-left">Fetching your measurements...<ion-spinner icon="lines"/></p>'
    		    });
    	    },

    	    stopLoading : function(){
    	    	// hide spinner
    	    	$ionicLoading.hide();
    	    },

    	    // alert box
	        showAlert : function(title, cssClass) {
				return $ionicPopup.alert({
					cssClass : cssClass? cssClass : 'calm',
					okType : cssClass? 'button-'+cssClass : 'button-calm',
					title: title
				});
	        }
	    };

	    var getVariable = function(variableName){
	    	variableService.getVariablesByName(variableName)
	    	.then(function(variable){
	    		$scope.state.variable = variable;
	    	}, function(){
	    		utils.showAlert('Can\'t find variable. Try again!', 'assertive').then(function(){
	    			$state.go('app.historyAll');
	    		});
	    	});
	    };
		
	    $scope.cancel = function(){
	    	$scope.state.showMeasurementBox = !$scope.state.showMeasurementBox;
	    	
	    	if($scope.state.title === "Edit Measurement"){
				$state.go('app.historyAll');
			}
	    };
		

	    // when date is updated
	    $scope.currentDatePickerCallback = function (val) {
	    	if(typeof(val)==='undefined'){
	    		console.log('Date not selected');
	    	} else {
	    		$scope.state.measurementDate = new Date(val);
	    	}
	    };

		// when time is changed
		$scope.currentTimePickerCallback = function (val) {
			if (typeof (val) === 'undefined') {
				console.log('Time not selected');
			} else {
				var a = new Date();
				a.setHours(val.hours);
				a.setMinutes(val.minutes);
				$scope.state.measurementStartTimeEpoch = a.getTime()/1000;
			}
		};


	    var setupTracking = function(unit, variableName, dateTime, value){
	    	console.log('track : ' , unit, variableName, dateTime, value);

	    	if(dateTime.indexOf(" ") !== -1) 
	    		dateTime = dateTime.replace(/\ /g,'+');

	    	$scope.state.title = "Edit Measurement";
	    	$scope.state.showMeasurementBox = true;

	    	$scope.state.measurement = {
	    		variableName : variableName,
	    		abbreviatedUnitName : unit
	    	};
	    	$scope.state.measurementDefaultValue = value;
	    	$scope.state.measurementStartTimeEpoch = moment(dateTime).unix();
	    	$scope.state.measurementDate = moment(dateTime)._d;
	    	getVariable(variableName);
            $scope.state.measurementIsSetup = true;
	    };

	    // constructor
	    $scope.init = function(){

			// get user token
			authService.getAccessTokenFromAnySource().then(function(token){
                if(!$scope.state.measurementIsSetup){
                    setMeasurementVariablesFromUrlParameters();
                }

                if(!$scope.state.measurementIsSetup) {
                    setMeasurementVariablesFromStateParameters();
                }

                if(!$scope.state.measurementIsSetup){
                    setMeasurementVariablesFromId();
                }

                utils.showAlert('Missing Parameters, need unit, variableName, dateTime and value!','assertive');

			}, function(){
				$ionicLoading.hide();
				console.log("need to log in");
				//utilsService.showLoginRequiredAlert($scope.login);
			});
			
	    };

	    $scope.saveMeasurement = function(){

	    	var dateFromDate = $scope.state.measurementDate;
	    	var timeFromDate = new Date($scope.state.measurementStartTimeEpoch * 1000);

	    	dateFromDate.setHours(timeFromDate.getHours());
	    	dateFromDate.setMinutes(timeFromDate.getMinutes());
	    	dateFromDate.setSeconds(timeFromDate.getSeconds());

	    	console.log("reported time: ", moment(dateFromDate).unix());

	    	if($scope.state.measurement.variableCategoryName) {
	    		var category = $scope.state.measurement.variableCategoryName
	    	}
	    	if($scope.state.variable.category) {
	    		category = $scope.state.variable.category
	    	}

	    	console.log("selected Category: ", category);

	    	var isAvg = true;
	    	if($scope.state.measurement.combinationOperation) {
	    		isAvg = $scope.state.measurement.combinationOperation == "MEAN" ? false : true;
	    	}
	    	if($scope.state.variable.combinationOperation) {
	    		isAvg = $scope.state.variable.combinationOperation == "MEAN" ? false : true;
	    	}

	    	console.log("selected combinationOperation is Average?: ", isAvg);
	    	
	    	// populate params
	    	var params = {
	    	    variable : $scope.state.measurement.variableName,
	    	    value : $scope.state.measurementDefaultValue,
	    	    epoch : moment(dateFromDate).valueOf(),
	    	    unit : $scope.state.measurement.abbreviatedUnitName,
	    	    category : category,
				note : null,
				isAvg : isAvg
	    	};

	    	if($scope.state.measurement.abbreviatedUnitName === '/5') 
	    		params.value = $scope.state.selected1to5Value;

	    	utils.startLoading();
    		var usePromise = true;
    	    // post measurement
    	    measurementService.post_tracking_measurement(params.epoch,
    	        params.variable,
    	        params.value,
    	        params.unit,
    	        params.isAvg,
    	        params.category,
				params.note,
				usePromise)
    	    .then(function(){
    	    	if($scope.state.title === "Edit Measurement"){
    	    		utils.stopLoading();
    	    		utils.showAlert('Measurement Updated!').then(function(){
    	    			$state.go('app.historyAll');
    	    		});
    	    	} else {
    	    		$scope.state.showMeasurementBox = false;
    	    		$scope.skip($scope.state.measurement);
    	    		$scope.init();
    	    	}
    	    }, function(){
    	    	utils.stopLoading();
    	    	utils.showAlert('Failed to post measuement, Try again!','assertive');
    	    });

	    };

	    $scope.editMeasurement = function(measurement){

	    	$scope.state.showMeasurementBox = true;
	    	$scope.state.measurement = measurement;
	    	$scope.state.measurementDefaultValue = measurement.defaultValue;
	    	$scope.state.measurementStartTimeEpoch = moment.utc(measurement.trackingReminderNotificationTime).unix();
	    	$scope.state.measurementDate = new Date(measurement.trackingReminderNotificationTime);

	    	if($scope.state.measurement.abbreviatedUnitName === '/5'){
	    		setTimeout(function(){
	    			jQuery('.primary_outcome_variables .active_primary_outcome_variable').removeClass('active_primary_outcome_variable');
	    			jQuery('.primary_outcome_variables img:nth-child('+ measurement.defaultValue +')').addClass('active_primary_outcome_variable');
	    			jQuery('.primary_outcome_variables img:nth-child('+ measurement.defaultValue +')').parent().removeClass('primary_outcome_variable_history').addClass('primary_outcome_variable_history');
	    		}, 500);

	    		$scope.state.selected1to5Value = measurement.defaultValue;
	    	}
	    };

        var setMeasurementVariablesFromUrlParameters = function() {
            var unit = utilsService.getUrlParameter(location.href, 'unit', true);
            var variableName = utilsService.getUrlParameter(location.href, 'variableName', true);
            var dateTime = utilsService.getUrlParameter(location.href, 'dateTime', true);
            var value = utilsService.getUrlParameter(location.href, 'value', true);

            if (unit || variableName || dateTime || value) {
                if (unit && variableName && dateTime && value) {
                    setupTracking(unit,
                        variableName,
                        dateTime,
                        value);
                }
            }
        };

        setMeasurementVariablesFromStateParameters = function(){
            if($stateParams.unit !== null && typeof $stateParams.unit !== "undefined"
                && $stateParams.variableName !== null && typeof $stateParams.variableName !== "undefined"
                && $stateParams.dateTime !== null && typeof $stateParams.dateTime !== "undefined"
                && $stateParams.value !== null && typeof $stateParams.value !== "undefined"){

                setupTracking($stateParams.unit,
                    $stateParams.variableName,
                    $stateParams.dateTime,
                    $stateParams.value);

            }
        };

        var setMeasurementVariablesFromId = function(){
            if($stateParams.measurementId){

                var measurementArray = measurementService.getHistoryMeasurements({id : $stateParams.measurementId})

                if(!measurementArray[0]){
                    console.log('Could not get measurement with id: ' + $stateParams.measurementId)
                    return;
                }

                setupTracking($stateParams.unit,
                    $stateParams.variableName,
                    $stateParams.dateTime,
                    $stateParams.value);

            }
        };

        var setMeasurementVariablesFromStateParameters = function(){
            if($stateParams.unit !== null && typeof $stateParams.unit !== "undefined"
                && $stateParams.variableName !== null && typeof $stateParams.variableName !== "undefined"
                && $stateParams.dateTime !== null && typeof $stateParams.dateTime !== "undefined"
                && $stateParams.value !== null && typeof $stateParams.value !== "undefined"){

                setupTracking($stateParams.unit,
                    $stateParams.variableName,
                    $stateParams.dateTime,
                    $stateParams.value);

            }
        };

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e){
    		$scope.init();
    	});

	});
