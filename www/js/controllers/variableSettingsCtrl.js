angular.module('starter')
    
    // Controls the variable settings editing Page
    .controller('VariableSettingsCtrl',
        function($scope, $state, $rootScope, $timeout, $ionicPopup, $q, $stateParams, $ionicHistory, $ionicActionSheet) {

        $scope.controller_name = "VariableSettingsCtrl";
        $rootScope.showFilterBarSearchIcon = false;

        $scope.cancel = function(){
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

        $scope.$on('$ionicView.enter', function(e) { console.debug("Entering state " + $state.current.name);
            console.debug($state.current.name + ' initializing...');
            $rootScope.stateParams = $stateParams;
            if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
            if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
            $scope.state.loading = true;
            $scope.showLoader('Getting variable details');
            $scope.showHelpInfoPopupIfNecessary();
            if($stateParams.variableObject){
                $scope.setupVariableByVariableObject($stateParams.variableObject);
            } else if ($stateParams.variableName) {
                $rootScope.variableName = $stateParams.variableName;
                $scope.getVariableByName($rootScope.variableName);
            } else {
                console.error("Variable name not provided to variable settings controller!");
                $ionicHistory.goBack();
            }
        });
    });
