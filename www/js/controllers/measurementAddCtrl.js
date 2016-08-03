angular.module('starter')

    .controller('MeasurementAddCtrl', function($scope, $q, $timeout, $state, $rootScope, $stateParams, $filter,
                                               $ionicActionSheet, $ionicHistory, authService, measurementService,
                                               utilsService, localStorageService, variableCategoryService,
                                               ionicTimePicker, ionicDatePicker, unitService, QuantiModo,
                                               variableService) {

        $scope.controller_name = "MeasurementAddCtrl";

        var variableCategoryName = $stateParams.variableCategoryName;
        var variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
        var currentTime = new Date();

        $scope.state = {
            measurementIsSetup : false,
            showAddVariable: false,
            showVariableCategorySelector: false,
            showUnits: false,
            unitCategories : [],
            variableCategoryName: variableCategoryName,
            variableCategoryObject : variableCategoryObject,
            // variables
            variableName : "",
            measurementStartTimeEpochTime : currentTime.getTime() / 1000,
            helpText: variableCategoryObject.helpText,
            abbreviatedUnitName : '',
            measurement : {},
            // default operation
            sumAvg : "avg",
            searchedUnits : [],
            defaultValueLabel : 'Value',
            defaultValuePlaceholderText : 'Enter a value',
            variableCategories : [
                { id : 1, name : 'Emotions' },
                { id : 2, name : 'Symptoms' },
                { id : 3, name : 'Treatments' },
                { id : 4, name : 'Foods' },
                { id : 5, name : 'Vital Signs' },
                { id : 6, name : 'Physical Activity' },
                { id : 7, name : 'Sleep' },
                { id : 8, name : 'Miscellaneous' }
            ],
            hideReminderMeButton : false,
            showMoreMenuButton: true,
            editReminder : false
        };

        $scope.openMeasurementStartTimePicker = function() {

            var secondsSinceMidnightLocal = ($scope.selectedHours * 60 * 60) + ($scope.selectedMinutes * 60);

            $scope.state.timePickerConfiguration = {
                callback: function (val) {
                    if (typeof (val) === 'undefined') {
                        console.log('Time not selected');
                    } else {
                        var selectedDateTime = new Date(val * 1000);
                        $scope.selectedHours = selectedDateTime.getUTCHours();
                        $scope.selectedMinutes = selectedDateTime.getUTCMinutes();
                        $scope.selectedDate.setHours($scope.selectedHours);
                        $scope.selectedDate.setMinutes($scope.selectedMinutes);

                        console.log('Selected epoch is : ', val, 'and the time is ',
                            $scope.selectedHours, 'H :', $scope.selectedMinutes, 'M');
                    }
                },
                inputTime: secondsSinceMidnightLocal,
                step: 1,
                closeLabel: 'Cancel'
            };
            ionicTimePicker.openTimePicker($scope.state.timePickerConfiguration);
        };

        $scope.openMeasurementDatePicker = function() {
            $scope.state.datePickerConfiguration = {
                callback: function(val) {
                    if (typeof(val)==='undefined') {
                        console.log('Date not selected');
                    } else {
                        // clears out hours and minutes
                        $scope.selectedDate = new Date(val);
                        $scope.selectedDate.setHours($scope.selectedHours);
                        $scope.selectedDate.setMinutes($scope.selectedMinutes);
                    }
                },
                inputDate: $scope.selectedDate,
                from:new Date(2012, 8, 1),
                to: new Date()
            };
            ionicDatePicker.openDatePicker($scope.state.datePickerConfiguration);
        };

        // cancel activity
        $scope.cancel = function(){
            $ionicHistory.goBack();
        };

        // delete measurement
        $scope.deleteMeasurement = function(){
            var measurementToDelete = {
                id : $scope.state.measurement.id,
                variableName : $scope.state.measurement.variableName,
                startTimeEpoch : $scope.state.measurement.startTimeEpoch
            };
            measurementService.deleteMeasurementFromLocalStorage(measurementToDelete).then(
                function() {
                    console.log("About to delete measurement on server");
                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.fromState){
                        $state.go($stateParams.fromState);
                    } else {
                        $rootScope.hideNavigationMenu = false;
                        $state.go(config.appSettings.defaultState);
                    }
                    measurementService.deleteMeasurementFromServer(measurementToDelete);
                },
                function() {
                    console.log("Cannot delete measurement from local storage");
                    measurementService.deleteMeasurementFromServer(measurementToDelete);
                    if($stateParams.fromUrl){
                        window.location = $stateParams.fromUrl;
                    } else if ($stateParams.fromState){
                        $state.go($stateParams.fromState);
                    } else {
                        $rootScope.hideNavigationMenu = false;
                        $state.go(config.appSettings.defaultState);
                    }
                }
            );
        };

        $scope.onMeasurementStart = function(){
            localStorageService.getItem('allTrackingData', function(allTrackingData){
                allTrackingData = allTrackingData? JSON.parse(allTrackingData) : [];

                var matched = allTrackingData.filter(function(x){
                    return x.abbreviatedUnitName === $scope.state.measurement.abbreviatedUnitName;
                });

                setTimeout(function(){
                    var value = matched[matched.length-1]? matched[matched.length-1].value : $scope.state.variableObject.mostCommonValue;
                    if(value) {
                        $scope.state.measurement.value = value;
                    }
                    console.debug('onMeasurementStart: redrawing view...');
                    $scope.safeApply();
                }, 500);
            });
        };

        $scope.done = function(){

            // Validation
            if($scope.state.measurement.value === '' || typeof $scope.state.measurement.value === 'undefined'){
                utilsService.showAlert('Please enter a value');
                return;
            }
            if(!$scope.state.measurement.variableName || $scope.state.measurement.variableName === ""){
                utilsService.showAlert('Please enter a variable name');
                return;
            }
            if(!$scope.state.measurement.variableCategoryName){
                utilsService.showAlert('Please select a variable category');
                return;
            }
            if(!$scope.state.measurement.abbreviatedUnitName && !$scope.abbreviatedUnitName){
                utilsService.showAlert('Please select a unit');
                return;
            }

            if(!$scope.state.measurement.abbreviatedUnitName && !$scope.abbreviatedUnitName){
                utilsService.showAlert('Please select a unit');
                return;
            }

            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].minimumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].minimumValue !== null)
            {
                if($scope.state.measurement.value <
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].minimumValue){
                        utilsService.showAlert($rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].minimumValue +
                            ' is the smallest possible value for the unit ' +
                            $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].name +
                        ".  Please select another unit or value.");
                        return;
                }
            }

            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].maximumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].maximumValue !== null)
            {
                if($scope.state.measurement.value >
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].maximumValue){
                    utilsService.showAlert($rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].maximumValue +
                        ' is the largest possible value for the unit ' +
                        $rootScope.unitsIndexedByAbbreviatedName[$scope.state.measurement.abbreviatedUnitName].name +
                        ".  Please select another unit or value.");
                    return;
                }
            }

            if ($state.editReminder) {
                // If "record a different value/time was pressed", skip reminder upon save
                var params = {
                    trackingReminderNotificationId: $stateParams.reminderNotification.id
                };
                QuantiModo.skipTrackingReminderNotification(params, function(response){
                    console.debug(response);
                }, function(err){
                    console.error(err);
                    Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                });
            }

            // Combine selected date and time
            $scope.state.measurement.startTimeEpoch = $scope.selectedDate.getTime()/1000;

            // Populate measurementInfo (formerly params)
            var measurementInfo = {
                id : $scope.state.measurement.id,
                variableName : $scope.state.measurement.variableName || jQuery('#variableName').val(),
                value : $scope.state.measurement.value,
                note : $scope.state.measurement.note || jQuery('#note').val(),
                prevStartTimeEpoch : $scope.state.measurement.prevStartTimeEpoch,
                startTimeEpoch : $scope.state.measurement.startTimeEpoch,
                abbreviatedUnitName : $scope.state.showAddVariable ? (typeof $scope.abbreviatedUnitName ===
                    "undefined" || $scope.abbreviatedUnitName === "" ) ?
                    $scope.state.measurement.abbreviatedUnitName :
                    $scope.abbreviatedUnitName :
                    $scope.state.measurement.abbreviatedUnitName,
                variableCategoryName : $scope.state.measurement.variableCategoryName,
                isAvg : $scope.state.sumAvg === "avg"? true : false
            };

            // Assign measurement value if it does not exist
            if(!measurementInfo.value && measurementInfo.value !== 0){
                measurementInfo.value = jQuery('#measurementValue').val();
            }

            console.log(measurementInfo);

            // Measurement only - post measurement. This is for adding or editing
            measurementService.postTrackingMeasurement(measurementInfo, true);
            //.then(function() {});

            if($stateParams.fromUrl){
                window.location = $stateParams.fromUrl;
            } else if ($stateParams.fromState){
                var variableName = $scope.state.measurement.variableName;
                var variableObject = $scope.state.variableObject;
                $state.go($stateParams.fromState, {
                    variableObject: variableObject,
                    variableName: variableName,
                    measurementInfo: measurementInfo
                });
            } else {
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.defaultState);
            }

        };

        // setup category view
        $scope.setupVariableCategory = function(variableCategoryName){
            console.log("variableCategoryName  is " + variableCategoryName);
            //$scope.state.showVariableCategorySelector = false;
            if(!variableCategoryName){
                variableCategoryName = '';
            }
            $scope.state.measurement.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
            if(!$scope.state.measurement.abbreviatedUnitName && $scope.state.variableCategoryObject.defaultAbbreviatedUnitName){
                $scope.state.measurement.abbreviatedUnitName = $scope.state.variableCategoryObject.defaultAbbreviatedUnitName;
            }
            $scope.state.title = "Add " + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + " Measurement";
            $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
            if($scope.state.variableCategoryObject.defaultValueLabel){
                $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
            }
            if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
                $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
            }
            $scope.state.variableSearchPlaceholderText = 'Search for a ' + $filter('wordAliases')(pluralize(variableCategoryName, 1)) + '...';
            setupValueFieldType($scope.state.variableCategoryObject.defaultAbbreviatedUnitName, null);
            
            // Fill in default value as last value if not /5
            if ($scope.state.measurement.abbreviatedUnitName !== '/5') {
                variableService.getVariablesByName($scope.state.measurement.variableName).then(function(variableObject){
                    $scope.state.measurement.value = parseFloat(variableObject.lastValue);
                });
            }
        };

        // constructor
        $scope.init = function(){
            Bugsnag.context = "measurementAdd";
                var isAuthorized = authService.checkAuthOrSendToLogin();
                if(isAuthorized){
                    unitService.getUnits().then(function () {
                        if($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined") {
                            console.debug("Setting $scope.state.measurement.abbreviatedUnitName by variableObject: " + $stateParams.variableObject.abbreviatedUnitName);
                            if (jQuery.inArray($stateParams.variableObject.abbreviatedUnitName, $rootScope.abbreviatedUnitNames) === -1)
                            {
                                // Note: will occur for new variable
                                console.warn('Invalid unit name! allowed parameters: ' + $rootScope.abbreviatedUnitNames.toString());
                            }
                            $scope.state.measurement.abbreviatedUnitName = $stateParams.variableObject.abbreviatedUnitName;
                            //$scope.unitObject.abbreviatedName = $stateParams.variableObject.abbreviatedUnitName;
                        }
                        if($stateParams.reminderNotification !== null && typeof $stateParams.reminderNotification !== "undefined") {
                            console.debug("Setting $scope.state.measurement.abbreviatedUnitName by reminder: " + $stateParams.reminderNotification.abbreviatedUnitName);
                            if (jQuery.inArray($stateParams.reminderNotification.abbreviatedUnitName, $rootScope.abbreviatedUnitNames) === -1)
                            {
                                console.error('Invalid unit name! allowed parameters: ' + $rootScope.abbreviatedUnitNames.toString());
                            }
                            $scope.state.measurement.abbreviatedUnitName = $stateParams.reminderNotification.abbreviatedUnitName;
                        }
                        if(!$scope.state.measurementIsSetup){
                            setupFromUrlParameters();
                        }
                        if(!$scope.state.measurementIsSetup) {
                            setupFromMeasurementStateParameter();
                        }
                        if(!$scope.state.measurementIsSetup) {
                            setupFromMeasurementObjectInUrl();
                        }
                        if(!$scope.state.measurementIsSetup) {
                            setupFromVariableStateParameter();
                        }
                        if(!$scope.state.measurementIsSetup) {
                            setupFromReminderObjectInUrl();
                        }
                        if(!$scope.state.measurementIsSetup) {
                            setupFromReminderStateParameter();
                        }
                        if(!$scope.state.measurementIsSetup){
                            setMeasurementVariablesByMeasurementId().then(function() {
                                if(!$scope.state.measurementIsSetup){
                                    // Not set up, go to different state
                                    if($stateParams.fromUrl){
                                        window.location = $stateParams.fromUrl;
                                    } else if ($stateParams.fromState){
                                        $state.go($stateParams.fromState);
                                    } else {
                                        $rootScope.hideNavigationMenu = false;
                                        $state.go(config.appSettings.defaultState);
                                    }
                                }
                            });
                        }
                    });
                    if (typeof analytics !== 'undefined')  { analytics.trackView("Add Measurement Controller"); }
                }


        };
        
        $scope.selectedDate = new Date();
        $scope.selectedHours = $scope.selectedDate.getHours();
        $scope.selectedMinutes = $scope.selectedDate.getMinutes();

        // update data when view is navigated to
        $scope.$on('$ionicView.enter', function(e) {
            $scope.hideLoader();
            $scope.init();
        });

        $scope.selectPrimaryOutcomeVariableValue = function($event, val){
            // remove any previous primary outcome variables if present
            jQuery('.primary-outcome-variable-rating-buttons .active-primary-outcome-variable-rating-button').removeClass('active-primary-outcome-variable-rating-button');

            // make this primary outcome variable glow visually
            jQuery($event.target).addClass('active-primary-outcome-variable-rating-button');

            jQuery($event.target).parent().removeClass('primary-outcome-variable-history').addClass('primary-outcome-variable-history');

            // update view
            $scope.state.measurement.value = val;
        };

        $scope.toggleShowUnits = function(){
            $scope.state.showUnits = !$scope.state.showUnits;
        };

        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };

        var setupFromUrlParameters = function() {
            var unit = utilsService.getUrlParameter(location.href, 'unit', true);
            var variableName = utilsService.getUrlParameter(location.href, 'variableName', true);
            var startTimeEpoch = utilsService.getUrlParameter(location.href, 'startTimeEpoch', true);
            var value = utilsService.getUrlParameter(location.href, 'value', true);

            if (unit || variableName || startTimeEpoch || value) {
                var measurementObject = {};
                measurementObject.abbreviatedUnitName = unit;
                measurementObject.variableName = variableName;
                measurementObject.startTimeEpoch = startTimeEpoch;
                measurementObject.value = value;
                setupTrackingByMeasurement(measurementObject);
            }
        };

        var setupFromMeasurementStateParameter = function(){
            if($stateParams.measurement !== null && typeof $stateParams.measurement !== "undefined"){
                setupTrackingByMeasurement($stateParams.measurement);
            }
        };

        var setupFromReminderStateParameter = function(){
            if($stateParams.reminderNotification !== null && typeof $stateParams.reminderNotification !== "undefined"){
                setupTrackingByReminderNotification();
            }
        };

        var setupFromReminderObjectInUrl = function(){
            console.debug("setupFromReminderObjectInUrl: ");
            if(!$stateParams.reminderNotification){
                var reminderFromURL =  utilsService.getUrlParameter(window.location.href, 'trackingReminderObject', true);
                if(reminderFromURL){
                    $stateParams.reminderNotification = JSON.parse(reminderFromURL);
                    console.debug("setupFromReminderObjectInUrl: ", $stateParams.reminderNotification);
                    setupTrackingByReminderNotification();
                }
            }
        };

        var setupFromMeasurementObjectInUrl = function(){
            console.debug("setupFromMeasurementObjectInUrl: ");
            if(!$stateParams.measurement){
                var measurementFromURL =  utilsService.getUrlParameter(window.location.href, 'measurementObject', true);
                if(measurementFromURL){
                    measurementFromURL = JSON.parse(measurementFromURL);
                    console.debug("setupFromMeasurementObjectInUrl: ", measurementFromURL);
                    setupTrackingByMeasurement(measurementFromURL);
                }
            }
        };

        var setupFromVariableStateParameter = function(){
            console.log('variableObject is ' + $stateParams.variableObject);
            if($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined") {
                $scope.state.variableObject = $stateParams.variableObject;
                $scope.state.title = "Record Measurement";
                $scope.state.measurement.variableName = $stateParams.variableObject.name;
                if (!$scope.state.measurement.variableName) {
                    $scope.state.measurement.variableName = $stateParams.variableObject.variableName;
                }
                if($stateParams.variableObject.category){
                    $scope.state.measurement.variableCategoryName = $stateParams.variableObject.category;
                    $scope.setupVariableCategory($scope.state.measurement.variableCategoryName);
                } else if($stateParams.variableObject.variableCategoryName) {
                    $scope.state.measurement.variableCategoryName = $stateParams.variableObject.variableCategoryName;
                    $scope.setupVariableCategory($scope.state.measurement.variableCategoryName);
                } else {
                    $scope.state.showVariableCategorySelector = true;
                }
                if($stateParams.variableObject.combinationOperation){
                    $scope.state.measurement.combinationOperation = $stateParams.variableObject.combinationOperation;
                } else {
                    $stateParams.variableObject.combinationOperation = 'MEAN';
                }
                $scope.state.measurement.startTimeEpoch = currentTime.getTime() / 1000;
                $scope.state.measurementIsSetup = true;
                setupValueFieldType($stateParams.variableObject.abbreviatedUnitName, $stateParams.variableObject.description);
            }
        };

        var setMeasurementVariablesByMeasurementId = function(){
            var deferred = $q.defer();
            var measurementId = utilsService.getUrlParameter(location.href, 'measurementId', true);
            if(measurementId){
                var measurementObject;
                measurementService.getMeasurementById(measurementId).then(
                    function(response) {
                        $scope.state.measurementIsSetup = true;
                        console.log("Success response");
                        measurementObject = response;
                        setupTrackingByMeasurement(measurementObject);
                        deferred.resolve();
                    },
                    function(response) {
                        console.log("Error response");
                        deferred.resolve();
                    }
                );
            }
            return deferred.promise;
        };

        $scope.goToAddReminder = function(){
            $state.go('app.reminderAdd', {
                variableObject: $scope.state.variableObject,
                fromState: $state.current.name,
                fromUrl: window.location.href,
                measurement: $stateParams.measurement
            });
        };

        function setupValueFieldType(abbreviatedUnitName, variableDescription) {
            if (abbreviatedUnitName === '/5') {
                if (!variableDescription) {
                    $scope.showNumericRatingNumberButtons = true;
                    $scope.showNegativeRatingFaceButtons = false;
                    $scope.showValueBox = false;
                    $scope.showPositiveRatingFaceButtons = false;
                } else if (variableDescription.toLowerCase().indexOf('positive') > -1) {
                    $scope.showPositiveRatingFaceButtons = true;
                    $scope.showNumericRatingNumberButtons = false;
                    $scope.showNegativeRatingFaceButtons = false;
                    $scope.showValueBox = false;
                } else if (variableDescription.toLowerCase().indexOf('negative') > -1) {
                    $scope.showNegativeRatingFaceButtons = true;
                    $scope.showValueBox = false;
                    $scope.showPositiveRatingFaceButtons = false;
                    $scope.showNumericRatingNumberButtons = false;
                }
            } else {
                $scope.showValueBox = true;
                $scope.showNegativeRatingFaceButtons = false;
                $scope.showPositiveRatingFaceButtons = false;
                $scope.showNumericRatingNumberButtons = false;
            }
        }

        function setVariableObjectFromMeasurement() {
            $scope.state.variableObject = {
                abbreviatedUnitName: $scope.state.measurement.abbreviatedUnitName,
                variableCategoryName: $scope.state.measurement.variableCategoryName ?
                    $scope.state.measurement.variableCategoryName : null,
                id: $scope.state.measurement.variableId ? $scope.state.measurement.variableId : null,
                name: $scope.state.measurement.variableName,
                description: $scope.state.measurement.variableDescription
            };
        }

        function setVariableObject() {
            if (!$scope.state.variableObject) {
                if ($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined") {
                    $scope.state.variableObject = $stateParams.variableObject;
                }
                else {
                    setVariableObjectFromMeasurement();
                }
            }
        }

        var setupTrackingByMeasurement = function(measurementObject){

            if(isNaN(measurementObject.startTimeEpoch)){
                measurementObject.startTimeEpoch = moment(measurementObject.startTimeEpoch).unix();
            }

            if (!measurementObject.id) {
                measurementObject.prevStartTimeEpoch = measurementObject.startTimeEpoch;
            }

            $scope.selectedDate = new Date(measurementObject.startTimeEpoch * 1000);
            $scope.selectedHours = $scope.selectedDate.getHours();
            $scope.selectedMinutes = $scope.selectedDate.getMinutes();
            $scope.state.title = "Edit Measurement";
            $scope.state.measurement = measurementObject;
            $scope.state.measurementIsSetup = true;
            setupValueFieldType($scope.state.measurement.abbreviatedUnitName,
                $scope.state.measurement.variableDescription);
            if ($scope.state.measurement.variable) {
                $scope.state.measurement.variableName = $scope.state.measurement.variable;
            }
            setVariableObject();
        };

        var setupTrackingByReminderNotification = function(){
            $state.editReminder = true;
            if($stateParams.reminderNotification !== null && typeof $stateParams.reminderNotification !== "undefined"){
                $scope.state.title = "Record Measurement";
                if(!$scope.state.measurement.abbreviatedUnitName){
                    $scope.state.measurement.abbreviatedUnitName = $stateParams.reminderNotification.abbreviatedUnitName;
                }
                $scope.state.hideRemindMeButton = true;
                $scope.state.measurement.value = $stateParams.reminderNotification.defaultValue;
                $scope.state.measurement.variableName = $stateParams.reminderNotification.variableName;

                $scope.state.measurement.variableCategoryName = $stateParams.reminderNotification.variableCategoryName;
                $scope.state.measurement.combinationOperation = $stateParams.reminderNotification.combinationOperation;
                if($stateParams.reminderNotification.trackingReminderNotificationTimeEpoch !== "undefined" && $stateParams.reminderNotification.trackingReminderNotificationTimeEpoch){
                    $scope.selectedDate = new Date($stateParams.reminderNotification.trackingReminderNotificationTimeEpoch * 1000);
                    $scope.selectedHours = $scope.selectedDate.getHours();
                    $scope.selectedMinutes = $scope.selectedDate.getMinutes();
                    $scope.state.measurement.startTimeEpoch = $stateParams.reminderNotification.trackingReminderNotificationTimeEpoch;
                } else {
                    $scope.state.measurement.startTimeEpoch = currentTime.getTime() / 1000;
                }

                $scope.state.measurementIsSetup = true;
                setupValueFieldType($stateParams.reminderNotification.abbreviatedUnitName,
                    $stateParams.reminderNotification.variableDescription);
                setVariableObject();
            }
            // Create variableObject
            if (!$scope.state.variableObject) {
                if($stateParams.variableObject !== null && typeof $stateParams.variableObject !== "undefined") {
                    $scope.state.variableObject = $stateParams.variableObject;
                }
                else if ($stateParams.reminderNotification) {
                    $scope.state.variableObject = {
                        abbreviatedUnitName : $stateParams.reminderNotification.abbreviatedUnitName,
                        combinationOperation : $stateParams.reminderNotification.combinationOperation,
                        userId : $stateParams.reminderNotification.userId,
                        variableCategoryName : $stateParams.reminderNotification.variableCategoryName,
                        id : $stateParams.reminderNotification.variableId,
                        name : $stateParams.reminderNotification.variableName
                    };
                }
            }
        };

        $rootScope.showActionSheetMenu = function() {

            console.debug("measurementAddCtrl.showActionSheetMenu:  $scope.state.variableObject: ", $scope.state.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-ios-star"></i>Add to Favorites' },
                    { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History' },
                    { text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
                    { text: '<i class="icon ion-arrow-up-a"></i>Positive Predictors'},
                    { text: '<i class="icon ion-arrow-down-a"></i>Negative Predictors'}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.log('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.log('BUTTON CLICKED', index);
                    if(index === 0){
                        $scope.addToFavoritesUsingStateVariableObject($scope.state.variableObject);
                    }
                    if(index === 1){
                        $scope.goToAddReminderForVariableObject($scope.state.variableObject);
                    }
                    if(index === 2){
                        $scope.goToChartsPageForVariableObject($scope.state.variableObject);
                    }
                    if(index === 3) {
                        $scope.goToHistoryForVariableObject($scope.state.variableObject);
                    }
                    if (index === 4) {
                        $scope.goToSettingsForVariableObject($scope.state.variableObject);
                    }
                    if(index === 5){
                        $state.go('app.predictors',
                            {
                                variableObject: $scope.state.variableObject,
                                requestParams: {
                                    effect:  $scope.state.variableObject.name,
                                    correlationCoefficient: "(gt)0"
                                }
                            });
                    }
                    if(index === 6){
                        $state.go('app.predictors',
                            {
                                variableObject: $scope.state.variableObject,
                                requestParams: {
                                    effect:  $scope.state.variableObject.name,
                                    correlationCoefficient: "(lt)0"
                                }
                            });
                    }

                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.deleteMeasurement();
                    return true;
                }
            });


            $timeout(function() {
                hideSheet();
            }, 20000);

        };

    });