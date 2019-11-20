angular.module('starter').controller('PhysicianCtrl', function($state, $scope, $ionicPopover, $ionicPopup, $rootScope,
                                                                   qmService, configurationService, qmLogService,
                                                                   $ionicModal, $timeout,
                                                                   Upload, $ionicActionSheet, $mdDialog, $stateParams, $sce){
    $scope.controller_name = "SharersCtrl";
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
            qmService.showMaterialAlert("Error", error);
        });
    };
    $scope.switchToPatientUser = function(user, newWindow){
        qmService.showBasicLoader();
        qmService.navBar.hideNavigationMenu();
        var iframeUrl = "https://web.quantimo.do/#/app/history-all-category/Anything?accessToken=" + user.accessToken;
        if(newWindow){
            $scope.openUrl(iframeUrl);
            return;
        }
        $scope.iframeUrl = $sce.trustAsResourceUrl(
            iframeUrl
        );
        qmService.rootScope.setProperty(qm.items.patientUser, user, function(){
            qmService.hideLoader();
        });
    };
    $scope.switchBackFromPatientUser = function(){
        qmService.rootScope.setProperty(qm.items.patientUser, null);
        $scope.iframeUrl = null;
        qmService.navBar.showNavigationMenu();
    };
    $scope.sendEmail = function(subjectLine, emailAddress, emailBody){
        if($rootScope.isMobile){
            qmService.sendWithEmailComposer(subjectLine, emailBody, emailAddress);
        }else{
            qmService.sendWithMailTo(subjectLine, emailBody, emailAddress);
        }
    };
    $scope.openEmbedPreview = function(){
        function openInNewTab(url){
            var win = window.open(url, '_blank');
            win.focus();
        }
        openInNewTab('/qm-connect/fab-preview.html?clientId=' + $rootScope.appSettings.clientId +
            "&previewUrl=" + $rootScope.appSettings.homepageUrl.replace('https://', '').replace('http://', ''));
    };
    $scope.addReminder = function(){
        configurationService.reminders.addReminder($state);
    };
    $scope.editReminder = function(reminder){
        configurationService.reminders.editReminder(reminder, $state);
    };
    $scope.deleteReminder = function(reminderToDelete){
        configurationService.reminders.deleteReminder(reminderToDelete);
    };
});

