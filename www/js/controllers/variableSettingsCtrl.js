angular.module('starter')
    
    // Controls the variable settings editing Page
    .controller('VariableSettingsCtrl',
        function($scope, $state, $rootScope, $timeout, $ionicPopup, $q, $stateParams, $ionicHistory, $ionicActionSheet,
                 QuantiModo, measurementService, localStorageService, variableService, $ionicLoading) {

        $scope.controller_name = "VariableSettingsCtrl";
        $rootScope.showFilterBarSearchIcon = false;

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
            $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
            variableService.resetUserVariable($rootScope.variableObject.id).then(function() {
                $scope.getVariableByName();
            });
        };

        $scope.save = function(){
            var params = {
                variableId: $rootScope.variableObject.id,
                durationOfAction: $rootScope.variableObject.durationOfAction*60*60,
                fillingValue: $rootScope.variableObject.fillingValue,
                //joinWith
                maximumAllowedValue: $rootScope.variableObject.maximumAllowedValue,
                minimumAllowedValue: $rootScope.variableObject.minimumAllowedValue,
                onsetDelay: $rootScope.variableObject.onsetDelay*60*60,
                combinationOperation: $rootScope.variableObject.combinationOperation
                //userVariableAlias: $scope.state.userVariableAlias
                //experimentStartTime
                //experimentEndTime
            };

            console.debug('Saving variable settings ' + JSON.stringify(params));
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
            variableService.postUserVariable(params).then(function() {
                console.debug("variableService.postUserVariable: success: " + JSON.stringify(params));
                $ionicLoading.hide();
                $ionicHistory.goBack();
            }, function(error) {
                $ionicLoading.hide();
                console.error(error);
            });
        };

        $rootScope.showActionSheetMenu = function() {

            console.debug("variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $rootScope.variableObject: ", $rootScope.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                    { text: '<i class="icon ion-compose"></i>Record Measurement'},
                    { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'},
                    { text: '<i class="icon ion-arrow-graph-up-right"></i>' + 'Visualize'},
                    { text: '<i class="icon ion-ios-list-outline"></i>History'},
                    { text: '<i class="icon ion-pricetag"></i>Tag ' + $rootScope.variableObject.name},
                    { text: '<i class="icon ion-pricetag"></i>Tag Another Variable '}

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
                    if (index === 5) {
                        $scope.addTag($rootScope.variableObject);
                    }
                    if(index === 6) {
                        console.debug('variableSettingsCtrl going to history' + JSON.stringify($rootScope.variableObject));
                        $scope.tagAnotherVariable($rootScope.variableObject);
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
            if (variableObject.abbreviatedUnitName === "/5") {
                // FIXME hide other fixed range variables as well
                $scope.state.hideMinMax = true;
            }

            $rootScope.variableObject.onsetDelay = $rootScope.variableObject.onsetDelay/3600;
            $rootScope.variableObject.durationOfAction = $rootScope.variableObject.durationOfAction/3600;

            $scope.state.loading = false;
            $scope.hideLoader() ;
        }

        $scope.getVariableByName = function () {
            $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
            var params = {includeTags : true};
            variableService.getVariablesByName($stateParams.variableName, params).then(function(variableObject){
                $ionicLoading.hide();
                $rootScope.variableObject = variableObject;
                setupByVariableObject(variableObject);
            });
        };

        $scope.init = function(){
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.state.loading = true;
            $scope.showLoader('Getting variable details');
            $scope.showHelpInfoPopupIfNecessary();
            if($stateParams.variableObject){
                setupByVariableObject($stateParams.variableObject);
            } else if ($stateParams.variableName) {
                $scope.state.title = $stateParams.variableName + ' Variable Settings';
                $rootScope.variableName = $stateParams.variableName;
                $scope.getVariableByName();
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
