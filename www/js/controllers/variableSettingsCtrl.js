angular.module('starter')
    
    // Controls the variable settings editing Page
    .controller('VariableSettingsCtrl',
        function($scope, $state, $rootScope, $timeout, $ionicPopup, $q, $stateParams, $ionicHistory, $ionicActionSheet,
                 QuantiModo, measurementService, localStorageService, variableService, $ionicLoading) {

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
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

            variableService.getPublicVariablesByName($rootScope.variableObject.name).then(function(variableArray) {
                $ionicLoading.hide();
                var originalVariableObject = variableArray[0];
                console.debug("variableService.getPublicVariablesByName: Original variable object: " +
                    JSON.stringify(originalVariableObject));

                if (originalVariableObject) {
                    if ($rootScope.variableObject.abbreviatedUnitName !== "/5") {
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

        $scope.showExplanationsPopup = function(settingName) {
            var explanationText = {
                "Minimum value": "The minimum allowed value for measurements. " +
                    "While you can record a value below this minimum, it will be " +
                    "excluded from the correlation analysis.",
                "Maximum value": "The maximum allowed value for measurements. " +
                    "While you can record a value above this maximum, it will be " +
                    "excluded from the correlation analysis.",
                "Onset delay": "An outcome is always preceded by the predictor or stimulus. " +
                    "The amount of time that elapses after the predictor/stimulus event " +
                    "before the outcome as perceived by a self-tracker is known as the “onset delay”.  " +
                    "For example, the “onset delay” between the time a person takes an aspirin " +
                    "(predictor/stimulus event) and the time a person perceives a change in their" +
                    " headache severity (outcome) is approximately 30 minutes.",
                "Duration of action": "The amount of time over " +
                    "which a predictor/stimulus event can exert an observable influence " +
                    "on an outcome variable’s value. For instance, aspirin (stimulus/predictor) " +
                    "typically decreases headache severity for approximately four hours" +
                    " (duration of action) following the onset delay.",
                "Filling value": "When it comes to analysis to determine the effects of this variable," +
                    " knowing when it did not occur is as important as knowing when it did occur. " +
                    "For example, if you are tracking a medication, it is important to know " +
                    "when you did not take it, but you do not have to log zero values for " +
                    "all the days when you haven't taken it. Hence, you can specify a filling value " +
                    "(typically 0) to insert whenever data is missing.",
                "Combination Method": "How multiple measurements are combined over time.  We use the average (or mean) for things like your weight.  Summing is used for things like number of apples eaten. "
            };

            $ionicPopup.show({
                title: settingName,
                subTitle: explanationText[settingName],
                scope: $scope,
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive'
                    }
                ]
            });

        };

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
                variableId: $rootScope.variableObject.id,
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
            console.debug(params);
            variableService.postUserVariable(params).then(function() {
                console.debug("variableService.postUserVariable: success: " + JSON.stringify(params));
            },
            function(error) {
                console.error(error);
            });

            $ionicHistory.goBack();

        };

        $rootScope.showActionSheetMenu = function() {

            console.debug("variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $rootScope.variableObject: ", $rootScope.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                    { text: '<i class="icon ion-compose"></i>Record Measurement'},
                    { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>' + 'Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History'}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.debug('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.debug('variableSettingsCtrl BUTTON CLICKED: ' + index);
                    if(index === 0){
                        $scope.addToFavoritesUsingVariableObject($rootScope.variableObject);
                    }
                    if(index === 1){
                        $scope.goToAddMeasurementForVariableObject($rootScope.variableObject);
                    }
                    if(index === 2){
                        $scope.goToAddReminderForVariableObject($rootScope.variableObject);
                    }
                    if (index === 3) {
                        $scope.goToChartsPageForVariableObject($rootScope.variableObject);
                    }
                    if(index === 4) {
                        console.debug('variableSettingsCtrl going to history' + JSON.stringify($rootScope.variableObject));
                        $scope.goToHistoryForVariableObject($rootScope.variableObject);
                    }

                    return true;
                },
                destructiveButtonClicked: function() {
                    $scope.showDeleteAllMeasurementsForVariablePopup();
                    return true;
                }
            });

            console.debug('Setting hideSheet timeout');
            $timeout(function() {
                hideSheet();
            }, 20000);

        };

        function setupByVariableObject(variableObject) {
            $scope.state.title = variableObject.name + ' Variable Settings';
            $rootScope.variableName = variableObject.name;
            $rootScope.variableObject = variableObject;
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
                $rootScope.variableName = $stateParams.variableName;
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                variableService.getVariablesByName($stateParams.variableName).then(function(variableObject){
                    $ionicLoading.hide();
                    $rootScope.variableObject = variableObject;
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
