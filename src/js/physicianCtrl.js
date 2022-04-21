angular.module('starter').controller('PhysicianCtrl', function($state, $scope, $ionicPopover, $ionicPopup, $rootScope,
                                                                   qmService, configurationService,
                                                                   $ionicModal, $timeout,
                                                                   Upload, $ionicActionSheet, $mdDialog, $stateParams, $sce){
    $scope.controller_name = "PhysicianCtrl";
    qmService.login.sendToLoginIfNecessaryAndComeBack("initial load in " + $state.current.name);
    $scope.state = {
        users: null,
        loading: true,
        link: null,
        invitePatient: function(){
            qmLog.info("invitePatient to "+$scope.state.link);
            //var win = window.open($scope.state.link, '_blank');
            //win.focus();
            qmService.email.postInvitation(null, $scope);
        },
        reminderCard: {
            title: "Default Tracking Reminders",
            content: "If you add a default tracking reminder, notifications will prompt your users to regularly enter their data for that variable.",
            ionIcon: "ion-android-notifications-none",
            buttons: [
                {
                    text: "Add a Reminder",
                    ionIcon: "ion-android-notifications-none",
                    clickHandler: function(){
                        configurationService.reminders.addReminder($state);
                    }
                }
            ]
        }
    };
    $scope.typeOf = function(value){
        return typeof value;
    };
    $scope.$on('$ionicView.beforeEnter', function(e){
        if (document.title !== "Dashboard") {document.title = "Dashboard";}
        qmLog.info("beforeEnter configuration state!");
        $scope.loadUserList();
        // Why do we need physician app settings?  We should get other app settings (kiddomodo, foodimodo) so
        // that we use physican/patient aliases like
        // getPhysicianAppSettings(function(appSettings){
        //     $scope.loadUserList();
        // }, function(){
        //     qmService.login.sendToLoginIfNecessaryAndComeBack("Physician needs to be logged in");
        // });
    });
    $scope.$on('$ionicView.afterEnter', function(e){
        qmService.navBar.showNavigationMenu();
    });
    $scope.$on('$ionicView.beforeLeave', function(e){
        qmLog.info("Leaving configuration state!");
    });
    function hideLoader(){
        qmService.hideLoader();
        $scope.state.loading = false;
    }
    $scope.loadUserList = function(){ // Delay loading user list because it's so big
        qmService.showBasicLoader();
        qm.userHelper.getUsersFromApi(function(response){
            hideLoader();
            $scope.state.card = response.card;
            $scope.state.link = response.link;
            qmLog.info("Set $scope.state.link to "+$scope.state.link);
            if(response.users){
                $scope.state.users = response.users;
            }else{
                qmLog.error("No users!");
            }
        }, function(error){
            hideLoader();
            //qmService.showMaterialAlert("Error", error);
            qmLog.info(error); // Maybe not logged in yet
        });
    };
    $scope.switchToPatientInIFrame = function(user){
        qmService.showBasicLoader();
        qmService.navBar.hideNavigationMenu();
        $scope.iframeUrl = $sce.trustAsResourceUrl(qm.urlHelper.getPatientHistoryUrl(user.accessToken));
        qmService.rootScope.setProperty(qm.items.patientUser, user, function(){qmService.hideLoader();});
    };
    $scope.switchToPatientInNewTab = qm.patient.switchToPatientInNewTab;
    $scope.switchBackFromPatient = function(){
        qmService.patient.switchBackFromPatient($scope);
    };
    $scope.sendEmail = qmService.sendEmail;
    $scope.addReminder = function(){
        configurationService.reminders.addReminder($state);
    };
    $scope.editReminder = function(reminder){
        configurationService.reminders.editReminder(reminder, $state);
    };
    $scope.deleteReminder = function(reminderToDelete){
        configurationService.reminders.deleteReminder(reminderToDelete);
    };
    function getPhysicianAppSettings(successHandler, errorHandler){
        qm.getUser(function(user){
            var currentAppSettings  = qm.appsManager.getAppSettingsFromMemory();
            if(appSettingsMatchPhysicianClientId(user, currentAppSettings)){
                if(successHandler){successHandler(currentAppSettings);}
                return currentAppSettings;
            }
            var physicianClientId = getPhysicianClientId(user);
            qm.appsManager.getAppSettingsFromApi(physicianClientId, function(appSettings){
                qmService.processAndSaveAppSettings(appSettings, successHandler);
            }, errorHandler);
        }, errorHandler);
    }
    function getPhysicianClientId(user){
        if(!user){return "me";}
        return user.loginName;
    }
    function appSettingsMatchPhysicianClientId(user, appSettings){
        var username = qm.stringHelper.slugify(user.loginName);
        if(appSettings.clientId === username){return true;}
        var email = qm.stringHelper.slugify(user.email);
        if(appSettings.clientId === email){return true;}
        return false;
    }
});

