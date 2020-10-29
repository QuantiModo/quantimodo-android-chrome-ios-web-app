angular.module('starter').controller('RemindersManageCtrl', ["$scope", "$state", "$stateParams", "$ionicPopup", "$rootScope",
    "$timeout", "$ionicLoading", "$filter", "$ionicActionSheet", "qmService",
    function($scope, $state, $stateParams, $ionicPopup, $rootScope, $timeout, $ionicLoading, $filter, $ionicActionSheet,
             qmService){
        $scope.controller_name = "RemindersManageCtrl";
        qmLog.debug('Loading ' + $scope.controller_name, null);
        qmService.navBar.setFilterBarSearchIcon(false);
        qmService.login.sendToLoginIfNecessaryAndComeBack("initial load in " + $state.current.name);
        $scope.state = {
            searchText: '',
            search: null,
            showButtons: false,
            variableCategory: getVariableCategoryName(),
            showMeasurementBox: false,
            selectedReminder: false,
            reminderDefaultValue: "",
            selected1to5Value: false,
            trackingReminders: [],
            measurementDate: new Date(),
            slots: {
                epochTime: new Date().getTime() / 1000,
                format: 12,
                step: 1,
                closeLabel: 'Cancel'
            },
            variable: {},
            isDisabled: false,
            loading: true,
            showTreatmentInfoCard: false,
            showSymptomInfoCard: false,
            noRemindersTitle: "Add Some Variables",
            noRemindersText: "You don't have any reminders, yet.",
            noRemindersIcon: "ion-android-notifications-none",
            title: "Manage Reminders"
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.info('beforeEnter RemindersManageCtrl', null);
            qmService.showBasicLoader();
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            $scope.stateParams = $stateParams;
            var actionButtons = [
                {text: '<i class="icon ion-arrow-down-c"></i>Sort by Name'},
                {text: '<i class="icon ion-clock"></i>Sort by Time'}
            ];
            var cat = getVariableCategoryName();
            if(!cat){
                if(!$scope.stateParams.title){
                    $scope.stateParams.title = ($rootScope.platform.isMobile) ?  "Reminders" : "Manage Reminders";
                }
                if(!$scope.stateParams.addButtonText){$scope.stateParams.addButtonText = "Add a Reminder";}
                if(!$scope.stateParams.addMeasurementButtonText){$scope.stateParams.addMeasurementButtonText = "Record Measurement";}
                actionButtons[2] = qmService.actionSheets.actionSheetButtons.historyAllCategory;
                actionButtons[3] = qmService.actionSheets.actionSheetButtons.reminderSearch;
            }else{
                $scope.state.noRemindersTitle = "Add " + cat;
                $scope.state.noRemindersText = "You haven't saved any " + cat.toLowerCase() + " favorites or reminders here, yet.";
                $scope.state.noRemindersIcon = qm.variableCategoryHelper.findByNameIdObjOrUrl(cat).ionIcon;
                $scope.stateParams.title = document.title = cat;
                if(!$scope.stateParams.addButtonText){
                    $scope.stateParams.addButtonText = 'Add New ' + pluralize($filter('wordAliases')(cat), 1) + " Reminder";
                }
                $scope.stateParams.addMeasurementButtonText = "Add  " + pluralize($filter('wordAliases')(cat), 1) + " Measurement";
                actionButtons[2] = {
                    text: '<i class="icon ' + ionIcons.history + '"></i>' + cat + ' History'
                };
                actionButtons[3] = {text: '<i class="icon ' + ionIcons.reminder + '"></i>' + $scope.stateParams.addButtonText};
            }
            actionButtons[4] = qmService.actionSheets.actionSheetButtons.measurementAddSearch;
            actionButtons[5] = qmService.actionSheets.actionSheetButtons.charts;
            actionButtons[6] = qmService.actionSheets.actionSheetButtons.refresh;
            actionButtons[7] = qmService.actionSheets.actionSheetButtons.settings;
            $scope.state.showButtons = true;
            getTrackingReminders();
            qmService.rootScope.setShowActionSheetMenu(function(){
                var hideSheet = $ionicActionSheet.show({
                    buttons: actionButtons,
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function(){
                        qmLog.debug('CANCELLED', null);
                    },
                    buttonClicked: function(index, button){
                        qmLog.debug('BUTTON CLICKED', null, index);
                        if(index === 0){
                            $rootScope.reminderOrderParameter = 'variableName';
                        }
                        if(index === 1){
                            $rootScope.reminderOrderParameter = 'reminderStartTimeLocal';
                        }
                        if(index === 2){
                            qmService.goToState('app.historyAll', {variableCategoryName: cat});
                        }
                        if(index === 3){
                            qmService.goToState('app.reminderSearch', {variableCategoryName: cat});
                        }
                        if(index === 4){
                            qmService.goToState('app.measurementAddSearch', {variableCategoryName: cat});
                        }
                        if(index === 5){
                            qmService.goToState('app.chartSearch', {variableCategoryName: cat});
                        }
                        if(index === 6){
                            $scope.refreshReminders();
                        }
                        if(index === 7){
                            qmService.goToState(qm.staticData.stateNames.settings);
                        }
                        return true;
                    }
                });
                $timeout(function(){
                    hideSheet();
                }, 20000);
            });
        });
        if(!$rootScope.reminderOrderParameter){
            $rootScope.reminderOrderParameter = 'variableName';
        }
        function getVariableCategoryName(){
            var categoryName = qm.variableCategoryHelper.getNameFromStateParamsOrUrl($stateParams);
            if(categoryName){$stateParams.variableCategoryName = categoryName;}
            return categoryName;
        }
        function hideLoader(){
            $scope.$broadcast('scroll.refreshComplete'); //Stop the ion-refresher from spinning
            qmService.hideLoader();
        }
        function addRemindersToScope(allTypes){
            hideLoader();
            var favoritesActiveAndArchived = allTypes.allTrackingReminders || [];
            var favorites = allTypes.favorites || [];
            var active = allTypes.active || [];
            var archived = allTypes.archivedTrackingReminders || [];
            var variableCategoryName = getVariableCategoryName();
            if(!favoritesActiveAndArchived || !favoritesActiveAndArchived.length){
                $scope.state.showNoRemindersCard = true;
                return;
            }
            qmLog.info('Got '+favoritesActiveAndArchived.length+" favoritesActiveAndArchived! Category: "+ variableCategoryName);
            qmLog.info('Got ' + active.length + ' active reminders');
            $scope.state.showNoRemindersCard = false;
            $scope.state.favoritesArray = favorites;
            $scope.state.trackingReminders = active;
            $scope.state.archivedTrackingReminders = archived;
            var noReminders = !favoritesActiveAndArchived.length;
            $scope.state.showTreatmentInfoCard = noReminders && variableCategoryName === 'Treatments';
            $scope.state.showSymptomInfoCard = noReminders && variableCategoryName === 'Symptom';
        }
        $scope.refreshReminders = function(){
            qmService.showInfoToast('Syncing...');
            qm.reminderHelper.syncReminders(true).then(function(){
                hideLoader();
                getTrackingReminders();
            });
        };
        var getTrackingReminders = function(){
            var cat = getVariableCategoryName();
            qmLog.info('Getting ' + cat + ' category reminders', null);
            qm.reminderHelper.getRemindersFavoritesArchived(cat).then(function(allTrackingReminderTypes){
                addRemindersToScope(allTrackingReminderTypes);
            });
        };
        $scope.showMoreNotificationInfoPopup = function(){
            var moreNotificationInfoPopup = $ionicPopup.show({
                title: "Individual Notifications Disabled",
                subTitle: 'Currently, you will only get one non-specific repeating device notification at a time.',
                scope: $scope,
                template: "It is possible to instead get a separate device notification for each tracking reminder that " +
                    "you create.  You can change this setting or update the notification frequency on the settings page.",
                buttons: [
                    {
                        text: 'Settings', type: 'button-positive', onTap: function(e){
                            qmService.goToState('app.settings');
                        }
                    },
                    {text: 'OK', type: 'button-assertive'}
                ]
            });
            moreNotificationInfoPopup.then(function(res){
                qmLog.debug('Tapped!', null, res);
            });
        };
        $scope.edit = function(trackingReminder){
            trackingReminder.fromState = $state.current.name;
            qmService.goToState('app.reminderAdd', {reminder: trackingReminder, fromUrl: window.location.href});
        };
        function goToState(stateName){
            var params = {fromUrl: window.location.href}
            if(getVariableCategoryName()){params.variableCategoryName = getVariableCategoryName()}
            qmService.goToState(stateName, params);
        }
        $scope.addNewReminderButtonClick = function(){goToState('app.reminderSearch');};
        $scope.addNewMeasurementButtonClick = function(){goToState('app.measurementAddSearch');};
        $scope.addMeasurementForReminder = function(trackingReminder){
            qmService.goToState('app.measurementAdd', {
                trackingReminder: trackingReminder,
                variableName: trackingReminder.variableName
            });
        };
        $scope.deleteReminder = function(reminder){
            reminder.hide = true;
            qmService.storage.deleteById('trackingReminders', reminder.trackingReminderId);
            //.then(function(){getTrackingReminders();});
            qm.reminderHelper.deleteReminder(reminder).then(function(){
                qmLog.debug('Reminder deleted', null);
            }, function(error){
                qmLog.error('Failed to Delete Reminder: ', error);
            });
        };
        $scope.showActionSheet = function(trackingReminder){
            var variableObject = qmService.convertTrackingReminderToVariableObject(trackingReminder);
            var buttons = [
                {text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
                qmService.actionSheets.actionSheetButtons.measurementAdd,
                qmService.actionSheets.actionSheetButtons.charts,
                qmService.actionSheets.actionSheetButtons.historyAllVariable,
                qmService.actionSheets.actionSheetButtons.variableSettings
            ];
            buttons.push(qmService.actionSheets.actionSheetButtons.compare);
            if(variableObject.outcome){
                buttons.push(qmService.actionSheets.actionSheetButtons.predictors);
            }else{
                buttons.push(qmService.actionSheets.actionSheetButtons.outcomes);
            }
            buttons = qmService.actionSheets.addActionArrayButtonsToActionSheet(trackingReminder.actionArray, buttons);
            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                destructiveText: '<i class="icon ion-trash-a"></i>Delete',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function(){
                },
                buttonClicked: function(index, button){
                    if(index === 0){
                        $scope.edit(trackingReminder);
                    }
                    if(index === 1){
                        qmService.goToState('app.measurementAdd', {variableObject: variableObject});
                    }
                    if(index === 2){
                        qmService.goToState('app.charts', {variableObject: variableObject});
                    }
                    if(index === 3){
                        qmService.goToState('app.historyAllVariable', {variableObject: variableObject});
                    }
                    if(index === 4){
                        qmService.goToVariableSettingsByObject(variableObject);
                    }
                    if(index === 5){
                        qmService.goToCorrelationsListForVariable(variableObject);
                    }
                    if(index === 6 && variableObject){
                        qmService.goToStudyCreationForVariable(variableObject);
                    }
                    var buttonIndex = 7;
                    for(var i = 0; i < trackingReminder.actionArray.length; i++){
                        if(trackingReminder.actionArray[i].action !== "snooze"){
                            if(index === buttonIndex){
                                qm.measurements.postMeasurementByReminder(trackingReminder, trackingReminder.actionArray[i].modifiedValue)
                                    .then(function(){
                                        qmLog.debug('Successfully qmService.postMeasurementByReminder');
                                    }, function(error){
                                        qmLog.error(error);
                                        qmLog.error('Failed to Track by favorite! ', trackingReminder);
                                    });
                            }
                            buttonIndex++;
                        }
                    }
                    return true;
                },
                destructiveButtonClicked: function(){
                    $scope.deleteReminder(trackingReminder);
                    return true;
                }
            });
        };
        $rootScope.$on('broadcastGetTrackingReminders', function(){
            qmLog.info('broadcastGetTrackingReminders broadcast received..');
            getTrackingReminders();
        });
    }]);
