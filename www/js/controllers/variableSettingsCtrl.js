angular.module('starter')
    
    // Controls the variable settings editing Page
    .controller('VariableSettingsCtrl',
        function($scope, $state, $rootScope, $timeout, $ionicPopup, $q, $stateParams, $ionicHistory, $ionicActionSheet,
                 authService, measurementService, localStorageService, variableService) {

        $scope.controller_name = "VariableSettingsCtrl";

        $scope.state = {
            unitCategories : {},
            searchedUnits : [],
            offset : 0
        };

        $scope.cancel = function(){
            $ionicHistory.goBack();
        };

        $scope.resetToDefaultSettings = function() {
            // Populate fields with original settings for variable

            variableService.getPublicVariablesByName($scope.state.variableObject.name).then(function(variableArray) {
                var originalVariableObject = variableArray[0];
                console.log("variableService.getPublicVariablesByName: Original variable object: " +
                    JSON.stringify(originalVariableObject));

                if (originalVariableObject) {
                    if ($scope.state.variableObject.abbreviatedUnitName !== "/5") {
                        if (originalVariableObject.minimumAllowedValue !== "-Infinity") {
                            $scope.state.minimumAllowedValue = originalVariableObject.minimumAllowedValue;
                        }
                        else {
                            $scope.state.minimumAllowedValue = "";
                        }
                        if (originalVariableObject.maximumAllowedValue !== "Infinity") {
                            $scope.state.maximumAllowedValue = originalVariableObject.maximumAllowedValue;
                        }
                        else {
                            $scope.state.maximumAllowedValue = "";
                        }
                    }
                    if (originalVariableObject.fillingValue === null) {
                        $scope.state.fillingValue = "";
                    }
                    else {
                        $scope.state.fillingValue = originalVariableObject.fillingValue;
                    }

                    $scope.state.sumAvg = originalVariableObject.combinationOperation === "MEAN"? "avg" : "sum";
                    $scope.state.onsetDelay = originalVariableObject.onsetDelay/(60*60); // seconds -> hours
                    $scope.state.durationOfAction = originalVariableObject.durationOfAction/(60*60); // seconds - > hours
                    //$scope.state.userVariableAlias = $stateParams.variableName;
                }
            });

        };

        $scope.showDeleteAllMeasurementsForVariablePopup = function(){
            $ionicPopup.show({
                title:'Delete all ' + $scope.state.variableName + " measurements?",
                subTitle: 'This cannot be undone!',
                scope: $scope,
                buttons:[
                    {
                        text: 'Yes',
                        type: 'button-positive',
                        onTap: $scope.deleteAllMeasurementsForVariable
                    },
                    {
                        text: 'No',
                        type: 'button-assertive'
                    }
                ]

            });
        };

        $scope.showExplanationsPopup = function(setting) {
            var explanationText = "";
            if (setting === "Minimum value") {
                explanationText = "The minimum allowed value for measurements. " +
                    "While you can record a value below this minimum, it will be " +
                    "excluded from the correlation analysis.";
            }
            else if (setting === "Maximum value") {
                explanationText = "The maximum allowed value for measurements. " +
                    "While you can record a value above this maximum, it will be " +
                    "excluded from the correlation analysis.";
            }
            else if (setting === "Onset delay") {
                explanationText = "An outcome is always preceded by the predictor or stimulus. " +
                    "The amount of time that elapses after the predictor/stimulus event " +
                    "before the outcome as perceived by a self-tracker is known as the “onset delay”.  " +
                    "For example, the “onset delay” between the time a person takes an aspirin " +
                    "(predictor/stimulus event) and the time a person perceives a change in their" +
                    " headache severity (outcome) is approximately 30 minutes.";

            }
            else if (setting === "Duration of action") {
                explanationText = "The amount of time over " +
                    "which a predictor/stimulus event can exert an observable influence " +
                    "on an outcome variable’s value. For instance, aspirin (stimulus/predictor) " +
                    "typically decreases headache severity for approximately four hours" +
                    " (duration of action) following the onset delay.";

            }
            else if (setting === "Filling value") {
                explanationText = "When it comes to analysis to determine the effects of this variable," +
                    " knowing when it did not occur is as important as knowing when it did occur. " +
                    "For example, if you are tracking a medication, it is important to know " +
                    "when you did not take it, but you do not have to log zero values for " +
                    "all the days when you haven't taken it. Hence, you can specify a filling value " +
                    "(typically 0) to insert whenever data is missing.";
            }

            $ionicPopup.show({
                title: setting,
                subTitle: explanationText,
                scope: $scope,
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive'
                    }
                ]
            });

        };

        $scope.deleteAllMeasurementsForVariable = function() {
            // Delete all measurements for a variable
            variableService.deleteAllMeasurementsForVariable($scope.state.variableObject.id).then(function() {
                // If primaryOutcomeVariable, delete local storage measurements
                if ($scope.state.variableName === config.appSettings.primaryOutcomeVariableDetails.name) {
                    localStorageService.setItem('allMeasurements',[]);
                    localStorageService.setItem('measurementsQueue',[]);
                    localStorageService.setItem('averagePrimaryOutcomeVariableValue',0);
                    localStorageService.setItem('lastSyncTime',0);
                }
                console.log("All measurements for " + $scope.state.variableName + " deleted!");
            }, function(error) {
                console.log('Error deleting measurements: ', error);
            });
        };

        // Deprecated
        /*
        $scope.getMeasurementsAndDelete = function(params) {
            var deferred = $q.defer();
            QuantiModo.getV1Measurements(params, function(measurements){
                var i;
                for (i in measurements) {
                    var measurementToDelete = {
                        id : measurements[i].id,
                        variableName : measurements[i].variable,
                        startTimeEpoch : measurements[i].startTimeEpoch
                    };
                    measurementService.deleteMeasurementFromServer(measurementToDelete);
                }
                if(measurements.length === 200){
                    $scope.state.offset = $scope.state.offset + 200;
                    params = {
                        offset: $scope.state.offset,
                        sort: "startTimeEpoch",
                        variableName: $scope.state.variableName,
                        limit: 200
                    };
                    $scope.getMeasurementsAndDelete(params);
                }
                deferred.resolve();
            }, function(error) {
                Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                console.log('Error getting measurements and deleting: ', error);
                deferred.reject(error);
            });
            return deferred.promise;
        };
        */

        $scope.save = function(){
            var maximumAllowedValue = $scope.state.maximumAllowedValue;
            var minimumAllowedValue = $scope.state.minimumAllowedValue;
            var fillingValue = $scope.state.fillingValue;
            if (maximumAllowedValue === "" || maximumAllowedValue === null) {
                maximumAllowedValue = "Infinity";
            }
            if (minimumAllowedValue === "" || minimumAllowedValue === null) {
                minimumAllowedValue = "-Infinity";
            }
            if (fillingValue === "" || fillingValue === null) {
                fillingValue = -1;
            }

            // populate params
            var params = {
                variableId: $scope.state.variableObject.id,
                durationOfAction: $scope.state.durationOfAction*60*60,
                fillingValue: fillingValue,
                //joinWith
                maximumAllowedValue: maximumAllowedValue,
                minimumAllowedValue: minimumAllowedValue,
                onsetDelay: $scope.state.onsetDelay*60*60
                //userVariableAlias: $scope.state.userVariableAlias
                //experimentStartTime
                //experimentEndTime
            };
            console.log(params);
            variableService.postUserVariable(params).then(function() {
                console.log("variableService.postUserVariable: success: " + JSON.stringify(params));
            },
            function() {
                console.log("error");
            });

            $ionicHistory.goBack();

        };

        $rootScope.showActionSheetMenu = function() {

            console.debug("variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $scope.state.variableObject: ", $scope.state.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                    { text: '<i class="icon ion-compose"></i>Record Measurement'},
                    { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>' + 'Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History'},
                    // { text: '<i class="icon ion-arrow-up-a"></i>Positive Predictors'},
                    // { text: '<i class="icon ion-arrow-down-a"></i>Negative Predictors'},

                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.log('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.log('variableSettingsCtrl BUTTON CLICKED: ' + index);
                    if(index === 0){
                        $scope.addToFavoritesUsingVariableObject($scope.state.variableObject);
                    }
                    if(index === 1){
                        $scope.goToAddMeasurementForVariableObject($scope.state.variableObject);
                    }
                    if(index === 2){
                        $scope.goToAddReminderForVariableObject($scope.state.variableObject);
                    }
                    if (index === 3) {
                        $scope.goToChartsPageForVariableObject($scope.state.variableObject);
                    }
                    if(index === 4) {
                        console.log('variableSettingsCtrl going to history' + JSON.stringify($scope.state.variableObject));
                        $scope.goToHistoryForVariableObject($scope.state.variableObject);
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
                    $scope.showDeleteAllMeasurementsForVariablePopup();
                    return true;
                }
            });

            $timeout(function() {
                hideSheet();
            }, 20000);

        };

        function setupByVariableObject(variableObject) {
            $scope.state.title = variableObject.name + ' Variable Settings';
            $scope.state.variableName = variableObject.name;
            $scope.state.variableObject = variableObject;
            $scope.state.sumAvg = variableObject.combinationOperation === "MEAN" ? "avg" : "sum";
            if (variableObject.abbreviatedUnitName === "/5") {
                // FIXME hide other fixed range variables as well
                $scope.state.hideMinMax = true;
            }
            else {
                if (variableObject.minimumAllowedValue !== "-Infinity") {
                    $scope.state.minimumAllowedValue = variableObject.minimumAllowedValue;
                }
                else {
                    $scope.state.minimumAllowedValue = "";
                }
                if (variableObject.maximumAllowedValue !== "Infinity") {
                    $scope.state.maximumAllowedValue = variableObject.maximumAllowedValue;
                }
                else {
                    $scope.state.maximumAllowedValue = "";
                }
            }
            if (variableObject.fillingValue === null) {
                $scope.state.fillingValue = "";
            }
            else {
                $scope.state.fillingValue = variableObject.fillingValue;
            }
            /*
             if (variableObject.userVariableAlias) {
             $scope.state.userVariableAlias = variableObject.userVariableAlias;
             }
             else {
             $scope.state.userVariableAlias = $stateParams.variableName;
             }
             */

            $scope.state.onsetDelay = variableObject.onsetDelay / (60 * 60); // seconds -> hours
            $scope.state.durationOfAction = variableObject.durationOfAction / (60 * 60); // seconds - > hours
            $scope.state.loading = false;
            $scope.hideLoader() ;
        }

        $scope.init = function(){
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.state.loading = true;
            $scope.showLoader('Getting variable details');
            $scope.showHelpInfoPopupIfNecessary();
            $scope.state.sumAvg = "avg"; // FIXME should this be the default?
            if($stateParams.variableObject){
                setupByVariableObject($stateParams.variableObject);
            } else if ($stateParams.variableName) {
                $scope.state.title = $stateParams.variableName + ' Variable Settings';
                $scope.state.variableName = $stateParams.variableName;
                variableService.getVariablesByName($stateParams.variableName).then(function(variableObject){
                    $scope.state.variableObject = variableObject;
                    setupByVariableObject(variableObject);
                });
            } else {
                console.error("Variable name not provided to variable settings controller!");
                $ionicHistory.goBack();
            }
        };
        
        // update data when view is navigated to
        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            $scope.hideLoader();
            $scope.init();
        });
    });
