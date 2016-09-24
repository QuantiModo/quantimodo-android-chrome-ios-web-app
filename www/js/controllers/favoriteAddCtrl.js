angular.module('starter')

	// Controls the History Page of the App.
	.controller('FavoriteAddCtrl', function($scope, $state, $stateParams, $ionicLoading, $timeout, $rootScope, 
                                            $ionicActionSheet, $ionicHistory, authService, localStorageService, 
                                            utilsService, reminderService, variableCategoryService, variableService, unitService) {

	    $scope.controller_name = "FavoriteAddCtrl";

	    $scope.state = {
            showAddVariableCard : false,
            showUnits: false,
            selectedReminder : false,
            defaultValueLabel : 'Default Value',
            defaultValuePlaceholderText : 'Enter typical value',
            showInstructionsField : false,
            title : "Add Favorite"
        };

	    // when a search result is selected
	    $scope.onVariableSelect = function(selectedVariable){
	    	console.log("favoriteAdd.onVariableSelect:  " + JSON.stringify(selectedVariable));

            $scope.state.trackingReminder = $stateParams.variableObject;
            setupVariableCategory(selectedVariable.variableCategoryName);
            if (selectedVariable.id) {
                $scope.state.trackingReminder.variableId = selectedVariable.id;
                $scope.state.trackingReminder.id = null;
            }
            if (selectedVariable.name) {
                $scope.state.trackingReminder.variableName = selectedVariable.name;
            }
            if (selectedVariable.description) {
                $scope.state.trackingReminder.variableDescription = selectedVariable.description;
            }
            if ($scope.state.trackingReminder.abbreviatedUnitName === "/5") {
                $scope.state.trackingReminder.defaultValue = 3;
            }
	    };

	    $scope.cancel = function(){
            $ionicHistory.goBack();
	    };

	    // when the reminder is saved/edited
	    $scope.save = function(){

            if($scope.state.trackingReminder.abbreviatedUnitName === '/5' && !$scope.state.trackingReminder.defaultValue){
                $scope.state.trackingReminder.defaultValue = 3;
            }

            if(!$scope.state.trackingReminder.variableCategoryName) {
                utilsService.showAlert('Please select a variable category');
                return;
            }

            if(!$scope.state.trackingReminder.variableName) {
                utilsService.showAlert('Please enter a variable name');
                return;
            }

            if(!$scope.state.trackingReminder.abbreviatedUnitName) {
                utilsService.showAlert('Please select a unit');
                return;
            }

            if(!$scope.state.trackingReminder.defaultValue && $scope.state.trackingReminder.defaultValue !== 0) {
                utilsService.showAlert('Please enter a default value');
                return;
            }

            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue !== null)
            {
                if($scope.state.trackingReminder.defaultValue <
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue){
                    utilsService.showAlert($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].minimumValue +
                        ' is the smallest possible value for the unit ' +
                        $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].name +
                        ".  Please select another unit or value.");
                    return;
                }
            }

            if($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName] &&
                typeof $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue !== "undefined" &&
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue !== null)
            {
                if($scope.state.trackingReminder.defaultValue >
                    $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue){
                    utilsService.showAlert($rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].maximumValue +
                        ' is the largest possible value for the unit ' +
                        $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].name +
                        ".  Please select another unit or value.");
                    return;
                }
            }

            $scope.state.trackingReminder.reminderFrequency = 0;
            $scope.state.trackingReminder.valueAndFrequencyTextDescription = "As Needed";

            localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('trackingReminders', $scope.state.trackingReminder)
                .then(function(){
                    reminderService.postTrackingReminders($scope.state.trackingReminder)
                        .then(function(){

                        }, function(err){
                            console.log(err);
                            $ionicLoading.hide();
                            $scope.loading = false;
                            utilsService.showAlert('Failed to add favorite! Please contact info@quantimo.do', 'assertive');
                        });
                    var backView = $ionicHistory.backView();
                    if(backView.stateName.toLowerCase().indexOf('search') > -1){
                        $ionicHistory.goBack(-2);
                    } else {
                        $ionicHistory.goBack();
                    }
                });
	    };


	    // setup editing view
	    var setupEditReminder = function(trackingReminder){
            $scope.state.trackingReminder = trackingReminder;
	    	$scope.state.title = "Edit " +  trackingReminder.variableName + " to Favorites";
	    };

        $scope.variableCategorySelectorChange = function(variableCategoryName) {
            $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
            $scope.state.trackingReminder.abbreviatedUnitName = $scope.state.variableCategoryObject.defaultAbbreviatedUnitName;
            $scope.state.defaultValuePlaceholderText = 'Enter most common value';
            $scope.state.defaultValueLabel = 'Default Value';
            setupVariableCategory(variableCategoryName);
        };

	    // setup category view
	    var setupVariableCategory = function(variableCategoryName){
            console.log("variableCategoryName  is " + variableCategoryName);
            if(!variableCategoryName){
                variableCategoryName = '';
            }
            $scope.state.trackingReminder.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = variableCategoryService.getVariableCategoryInfo(variableCategoryName);
            $scope.state.trackingReminder.abbreviatedUnitName = $scope.state.variableCategoryObject.defaultAbbreviatedUnitName;
            $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
            if($scope.state.variableCategoryObject.defaultValueLabel){
                $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
            }
            if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
                $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
            }
            if(variableCategoryName === 'Treatments'){
                $scope.state.showInstructionsField = true;
            }
	    };

        function setupReminderEditingFromVariableId(variableId) {
            if(variableId){
                variableService.getVariableById(variableId)
                    .then(function (variables) {
                        $scope.variableObject = variables[0];
                        console.log($scope.variableObject);
                        $scope.onVariableSelect($scope.variableObject);
                        $ionicLoading.hide();
                        $scope.loading = false;
                    }, function () {
                        $ionicLoading.hide();
                        $scope.loading = false;
                        console.log("failed to get variable");
                    });

            }
        }

        function setupReminderEditingFromUrlParameter(reminderIdUrlParameter) {
            reminderService.getTrackingReminderById(reminderIdUrlParameter)
                .then(function (reminders) {
                    if (reminders.length !== 1) {
                        utilsService.showAlert("Reminder id " + reminderIdUrlParameter + " not found!", 'assertive');
                        if($stateParams.fromUrl){
                            window.location = $stateParams.fromUrl;
                        } else if  ($stateParams.fromState) {
                            $state.go($stateParams.fromState);
                        } else {
                            $state.go('app.remindersManage');
                        }
                    }
                    $stateParams.reminderNotification = reminders[0];
                    setupEditReminder($stateParams.reminderNotification);
                    $ionicLoading.hide();
                    $scope.loading = false;
                }, function () {
                    $ionicLoading.hide();
                    $scope.loading = false;
                    console.log("failed to get reminders");
                });
        }

        // when view is changed
    	$scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
    	});

        $scope.deleteReminder = function(){
            localStorageService.deleteElementOfItemById('trackingReminders', $scope.state.trackingReminder.id)
                .then(function(){
                    $state.go('app.favorites');
            });

            reminderService.deleteReminder($scope.state.trackingReminder.id)
                .then(function(){

                }, function(err){
                    $ionicLoading.hide();
                    $scope.loading = false;
                    console.error('Failed to Delete favorite, Try again!', 'assertive');
                });
        };

        $scope.unitSelected = function(){
            console.log("selecting_unit", $scope.state.trackingReminder.abbreviatedUnitName);
            $scope.state.trackingReminder.unitName =
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].name;
            $scope.state.trackingReminder.unitId =
                $rootScope.unitsIndexedByAbbreviatedName[$scope.state.trackingReminder.abbreviatedUnitName].id;
        };

        $scope.toggleShowUnits = function(){
            $scope.state.showUnits=!$scope.state.showUnits;
        };

        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };

        $rootScope.showActionSheetMenu = function() {
            $scope.state.variableObject = $scope.state.trackingReminder;
            $scope.state.variableObject.id = $scope.state.trackingReminder.variableId;
            $scope.state.variableObject.name = $scope.state.trackingReminder.variableName;
            
            console.debug("favoriteAddCtrl.showActionSheetMenu: $scope.state.variableObject: ", $scope.state.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-compose"></i>Record Measurement'},
                    { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History'},
                    { text: '<i class="icon ion-settings"></i>' + 'Settings'},
                    { text: '<i class="icon ion-arrow-up-a"></i>Positive Predictors'},
                    { text: '<i class="icon ion-arrow-down-a"></i>Negative Predictors'}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete Reminder',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.log('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.log('BUTTON CLICKED', index);
                    if(index === 0){
                        $scope.goToAddMeasurementForVariableObject($scope.state.variableObject);
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
                        $state.go('app.variableSettings',
                            {variableName: $scope.state.trackingReminder.variableName});
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
                    $scope.deleteReminder();
                    return true;
                }
            });


            $timeout(function() {
                hideSheet();
            }, 20000);

        };

        var init = function(){
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            console.debug('$ionicView.beforeEnter state ' + $state.current.name + '. Getting units now...');
            unitService.getUnits().then(function () {
                console.debug("Got units in " + $state.current.name);
                var reminderIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'reminderId');
                var variableIdUrlParameter = utilsService.getUrlParameter(window.location.href, 'variableId');
                if ($stateParams.reminderNotification && $stateParams.reminderNotification !== null) {
                    setupEditReminder($stateParams.reminderNotification);
                } else if(reminderIdUrlParameter) {
                    setupReminderEditingFromUrlParameter(reminderIdUrlParameter);
                } else if(variableIdUrlParameter){
                    setupReminderEditingFromVariableId(variableIdUrlParameter);
                } else if ($stateParams.variableObject) {
                    $scope.onVariableSelect($stateParams.variableObject);
                }
            });
        };

        $scope.$on('$ionicView.beforeEnter', function(){
            init();
        });
	});