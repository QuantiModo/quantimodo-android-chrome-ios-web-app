angular.module('starter')
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $ionicModal, $timeout, $injector, utilsService, authService,
                                    measurementService, $ionicPopover, $ionicLoading, $state, $ionicHistory,
                                    QuantiModo, notificationService, $rootScope, localStorageService, reminderService,
                                    $ionicPopup, $ionicSideMenuDelegate) {

        // flags
        $scope.controller_name = "AppCtrl";
        $scope.menu = config.appSettings.menu;
        $scope.showTrackingSubMenu = false;
        $rootScope.allowOffline = config.appSettings.allowOffline;
        $scope.showReminderSubMenu = false;
        $scope.closeMenu = function() {
            $ionicSideMenuDelegate.toggleLeft(false);
        };

        var helpPopupMessages = config.appSettings.helpPopupMessages || false;

        $scope.showHelpInfoPopupIfNecessary = function(e) {
            if (helpPopupMessages && typeof helpPopupMessages[location.hash] !== "undefined") {
                localStorageService.getItem('notShowHelpPopup', function (val) {
                    $scope.notShowHelpPopup = val ? JSON.parse(val) : false;

                    // Had to add "&& e.targetScope !== $scope" to prevent duplicate popups
                    //if (!$scope.notShowHelpPopup && e.targetScope !== $scope) {
                    if (!$scope.notShowHelpPopup) {
                        $rootScope.helpPopup = $ionicPopup.show({
                            title: helpPopupMessages[location.hash],
                            subTitle: '',
                            scope: $scope,
                            template: '<label><input type="checkbox" ng-model="$parent.notShowHelpPopup" class="show-again-checkbox">Don\'t show these tips</label>',
                            buttons: [
                                {
                                    text: 'OK',
                                    type: 'button-positive',
                                    onTap: function () {
                                        localStorageService.setItem('notShowHelpPopup', JSON.stringify($scope.notShowHelpPopup));
                                    }
                                }
                            ]
                        });
                    }
                });
            }
        };

        $scope.$on('$ionicView.enter', function(e) {
            //$scope.showHelpInfoPopupIfNecessary(e);
        });

        $scope.closeMenuIfNeeded = function(menuItem){
            if(menuItem.click){
                $scope[menuItem.click] && $scope[menuItem.click]();
            }
            else if(!menuItem.subMenuPanel){
                $scope.closeMenu();
            }
        };
        $scope.showHistorySubMenu = false;
        $scope.shoppingCartEnabled = config.shoppingCarEnabled;
        $rootScope.isSyncing = false;


        $scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
        $scope.isAndroid = ionic.Platform.isAndroid();
        $scope.isChrome = window.chrome ? true : false;


        /*Wrapper Config*/
        $scope.viewTitle = config.appSettings.appName;
        $scope.primaryOutcomeVariable = config.appSettings.primaryOutcomeVariable;
        $scope.primaryOutcomeVariableRatingOptions = config.getPrimaryOutcomeVariableOptions();
        $scope.primaryOutcomeVariableNumbers = config.getPrimaryOutcomeVariableOptions(true);
        $scope.welcomeText = config.appSettings.welcomeText;
        $scope.primaryOutcomeVariableTrackingQuestion = config.appSettings.primaryOutcomeVariableTrackingQuestion;
        $scope.primaryOutcomeVariableAverageText = config.appSettings.primaryOutcomeVariableAverageText;
        /*Wrapper Config End*/

        // when view is changed
        $scope.$on('$ionicView.enter', function(e) {
            if(e.targetScope && e.targetScope.controller_name && e.targetScope.controller_name === "TrackPrimaryOutcomeCtrl"){
                $scope.showCalenderButton = true;
            } else {
                $scope.showCalenderButton = false;
            }
        });

        // load the calender popup
        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.fromDate = new Date();
        $scope.toDate = new Date();

        // when date is updated
        $scope.datePickerFromCallback = function (val) {
            if(typeof(val)==='undefined'){
                console.log('Date not selected');
            }else{
                $scope.fromDate = new Date(val);
                $scope.saveDates();
            }
        };
        // update dates selected from calender
        $scope.saveDates = function(){
            var to = moment($scope.toDate).unix()*1000;
            var from = moment($scope.fromDate).unix()*1000;

            measurementService.setDates(to, from);
            $scope.popover.hide();
            $scope.init();
        };

        // show calender popup
        $scope.showCalenderPopup = function($event){
            $scope.popover.show($event);
            measurementService.getToDate(function(endDate){
                $scope.toDate = new Date(endDate);
                measurementService.getFromDate(function(fromDate){
                    $scope.fromDate = new Date(fromDate);
                });
            });
        };

        var scheduleReminder = function(){
            if($rootScope.reminderToSchedule){

                reminderService.addNewReminder(
                    $rootScope.reminderToSchedule.id,
                    $rootScope.reminderToSchedule.reportedVariableValue,
                    $rootScope.reminderToSchedule.interval,
                    $rootScope.reminderToSchedule.name,
                    $rootScope.reminderToSchedule.category,
                    $rootScope.reminderToSchedule.unit,
                    $rootScope.reminderToSchedule.combinationOperation)
                .then(function(){
                    delete $rootScope.reminderToSchedule;
                    console.log('reminder scheduled');
                }, function(err){
                    console.log(err);
                });
            }
        };

        // when work on this activity is complete
        function hideMenuIfSetInUrlParameter() {
            if (location.href.toLowerCase().indexOf('hidemenu=true') !== -1) {
                $rootScope.hideNavigationMenu = true;
            }
        }

        function goToDefaultStateShowMenuClearIntroHistoryAndRedraw() {

            if ($state.current.name === "app.welcome") {
                $state.go(config.appSettings.defaultState);
                $rootScope.hideMenu = false;
            }

            if ($state.current.name === "app.login" && $rootScope.user) {
                $state.go(config.appSettings.defaultState);
                $rootScope.hideMenu = false;
            }

            if (config.appSettings.allowOffline) {
                $state.go(config.appSettings.defaultState);
                $rootScope.hideMenu = false;
            }


            // don't animate, clear back history
            $ionicHistory.nextViewOptions({
                disableAnimate: false,
                disableBack: true
            });

            // redraw everything according to updated appstate
            $rootScope.$broadcast('redraw');
        }

        $scope.goToDefaultStateIfWelcomed = function(){
            // if user has seen the welcome screen before
            localStorageService.getItem('isWelcomed',function(isWelcomed) {
                if(isWelcomed  === true || isWelcomed === "true"){
                    $rootScope.isWelcomed = true;
                    goToDefaultStateShowMenuClearIntroHistoryAndRedraw();
                }
            });
        };

        var goToDefaultStateIfLoggedInOnLoginState = function(){
            var loginState = 'app.login';
            if(loginState.indexOf($state.current.name) !== -1 && $rootScope.user){
                $state.go(config.appSettings.defaultState);
            }
        };

        // hide loader and move to next page
        var hideLoaderMove = function(){
            $ionicLoading.hide();
            $scope.goToDefaultStateIfWelcomed();
        };
        

        $scope.init = function () {
            console.log("Main Constructor Start");
            hideMenuIfSetInUrlParameter();
            if(!$rootScope.user){
                $rootScope.user = localStorageService.getItemAsObject('user');
            }
            scheduleReminder();

            $ionicLoading.hide();
            goToDefaultStateIfLoggedInOnLoginState();
        };

        $scope.$on('callAppCtrlInit', function(){
            console.log("calling init");
            $scope.init();
        });


        $scope.toggleTrackingSubMenu = function(){
            $scope.showTrackingSubMenu = !$scope.showTrackingSubMenu;
        };

        $scope.togglePredictorSearchSubMenu = function(){
            $scope.showPredictorSearchSubMenu = !$scope.showPredictorSearchSubMenu;
        };

        $scope.toggleOutcomePredictorSubMenu = function(){
            $scope.showOutcomePredictorSubMenu = !$scope.showOutcomePredictorSubMenu;
        };

        $scope.toggleHistorySubMenu = function(){
            $scope.showHistorySubMenu = !$scope.showHistorySubMenu;
        };

        $scope.toggleReminderSubMenu = function(){
            $scope.showReminderSubMenu = !$scope.showReminderSubMenu;
        };

        // call constructor
        $scope.init();
        

    });
