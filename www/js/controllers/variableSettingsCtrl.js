angular.module('starter')
    
    // Controls the variable settings editing Page
    .controller('VariableSettingsCtrl',
        function($scope, $ionicModal, $timeout, $ionicPopup ,$ionicLoading, authService,
                                                measurementService, $state, $rootScope, utilsService,
                                                localStorageService, $filter, $stateParams, $ionicHistory,
                                                variableService, $q, QuantiModo, $ionicActionSheet){

        $scope.controller_name = "VariableSettingsCtrl";

        // state
        $scope.state = {
            // category object,
            unitCategories : {},
            searchedUnits : [],
            offset : 0
        };
        $scope.state.title = $stateParams.variableName + ' Variable Settings';
        $scope.state.variableName = $stateParams.variableName;

        // cancel activity
        $scope.cancel = function(){
            $ionicHistory.goBack();
        };

        $scope.resetToDefaultSettings = function() {
            // Use v1/variables, then populate fields
            // User still has to press "save"
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
                        type: 'button-assertive',
                    }
                ]

            });
        };

        $scope.deleteAllMeasurementsForVariable = function() {
            // Get measurements from server and delete
            // If primary outcome variable, also clear local storage

            var params = {
                offset: $scope.state.offset,
                sort: "startTimeEpoch",
                variableName: $scope.state.variableName,
                limit: 200
            };

            $scope.getMeasurementsAndDelete(params).then(function() {
                if ($scope.state.variableName === config.appSettings.primaryOutcomeVariableDetails.name) {
                    // Delete local storage measurements
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
                user: $scope.variableObject.userId,
                variableId: $scope.variableObject.id,
                durationOfAction: $scope.state.durationOfAction*60*60,
                fillingValue: fillingValue,
                //joinWith
                maximumAllowedValue: maximumAllowedValue,
                minimumAllowedValue: minimumAllowedValue,
                onsetDelay: $scope.state.delayBeforeOnset*60*60,
                //experimentStartTime
                //experimentEndTime
            };
            console.log(params);
            variableService.postUserVariable(params).then(function() {
                console.log("success");
            },
            function() {
                console.log("error");
            });

            $ionicHistory.goBack();

        };

        $rootScope.showActionSheetMenu = function() {

            console.debug("Show the action sheet!  $scope.state.variableObject: ", $scope.state.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                    { text: '<i class="icon ion-compose"></i>Record Measurement'},
                    { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>' + 'Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History'},
                    { text: '<i class="icon ion-arrow-up-a"></i>Positive Predictors'},
                    { text: '<i class="icon ion-arrow-down-a"></i>Negative Predictors'}
                ],
                //destructiveText: '<i class="icon ion-trash-a"></i>Delete Favorite',
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
                        $scope.goToAddMeasurement();
                    }
                    if(index === 2){
                        $scope.goToAddReminderForVariableObject($scope.state.variableObject);
                    }
                    if (index === 3) {
                        $scope.goToChartsPageForVariableObject($scope.state.variableObject);
                    }
                    if(index === 4) {
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
                    $scope.deleteReminder();
                    return true;
                }
            });


            $timeout(function() {
                hideSheet();
            }, 20000);

        };

        // constructor
        $scope.init = function(){
            Bugsnag.context = "variableSettings";
            $scope.loading = true;
            $scope.showLoader();
            var isAuthorized = authService.checkAuthOrSendToLogin();
            if (typeof analytics !== 'undefined')  { analytics.trackView("Variable Settings Controller"); }
            if(isAuthorized){
                $scope.showHelpInfoPopupIfNecessary();
                $scope.loading = true;
                $scope.state.sumAvg = "avg"; // FIXME should this be the default?
                variableService.getVariablesByName($stateParams.variableName).then(function(variableObject){
                    $scope.state.variableObject = variableObject;
                    console.log(variableObject);
                    $scope.variableObject = variableObject;
                    $scope.state.sumAvg = variableObject.combinationOperation === "MEAN"? "avg" : "sum";
                    $scope.state.variableCategory = variableObject.category;
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

                    $scope.state.delayBeforeOnset = variableObject.onsetDelay/(60*60); // seconds -> hours
                    $scope.state.durationOfAction = variableObject.durationOfAction/(60*60); // seconds - > hours

                });
                $ionicLoading.hide();
            } 
        };
        
        // update data when view is navigated to
        $scope.$on('$ionicView.enter', $scope.init);

    }
    );