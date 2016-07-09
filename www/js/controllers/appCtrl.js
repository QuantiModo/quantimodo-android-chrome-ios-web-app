angular.module('starter')
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $ionicModal, $timeout, $injector, utilsService, authService,
                                    measurementService, $ionicPopover, $ionicLoading, $state, $ionicHistory,
                                    QuantiModo, notificationService, $rootScope, localStorageService, reminderService,
                                    $ionicPopup, $ionicSideMenuDelegate, ratingService, migrationService,
                                    ionicDatePicker, unitService) {

        $rootScope.loaderImagePath = config.appSettings.loaderImagePath;
        $scope.appVersion = 1489;
        if(!$rootScope.loaderImagePath){
            $rootScope.loaderImagePath = 'img/circular-loader.gif';
        }
        $scope.controller_name = "AppCtrl";
        $scope.menu = config.appSettings.menu;
        $scope.appSettings = config.appSettings;
        $scope.showTrackingSubMenu = false;
        $rootScope.allowOffline = config.appSettings.allowOffline;
        $scope.showReminderSubMenu = false;
        $scope.primaryOutcomeVariableDetails = config.appSettings.primaryOutcomeVariableDetails;
        // Not used
        //$scope.ratingInfo = ratingService.getRatingInfo();
        $scope.closeMenu = function() {
            $ionicSideMenuDelegate.toggleLeft(false);
        };
        $scope.floatingMaterialButton = config.appSettings.floatingMaterialButton;
        
        $scope.hideAddTreatmentRemindersCard = localStorageService.getItemSync('hideAddTreatmentRemindersCard');
        $scope.hideAddFoodRemindersCard = localStorageService.getItemSync('hideAddFoodRemindersCard');
        $scope.hideAddSymptomRemindersCard = localStorageService.getItemSync('hideAddSymptomRemindersCard');
        $scope.hideAddEmotionRemindersCard = localStorageService.getItemSync('hideAddEmotionRemindersCard');
        $scope.hideImportDataCard = localStorageService.getItemSync('hideImportDataCard');

        //  Calendar and  Date picker

        // will update from showCalendarPopup
        $scope.fromDate = new Date();
        $scope.toDate = new Date();

        // "from" datepicker config
        $scope.fromDatePickerObj = {
            callback: function (val) {
                if (typeof(val)==='undefined') {
                    console.log('Date not selected');
                } else {
                    $scope.fromDate = new Date(val);
                    $scope.saveDates();
                }
            },
            inputDate: $scope.fromDate, // previously selected value
            from: new Date(2012, 8, 1),
            to: $scope.toDate // don't allow fromDate to be after toDate
        };

        // "to" datepicker config
        $scope.toDatePickerObj = {
            callback: function(val) {
                if (typeof(val)==='undefined') {
                    console.log('Date not selected');
                } else {
                    $scope.toDate = new Date(val);
                    $scope.saveDates();
                }
            },
            inputDate: $scope.toDate, // previously selected value
            from: $scope.fromDate, // don't allow toDate to be after fromDate
            to: new Date() //today
        };

        $scope.goToState = function(state, stateParameters){
            var variableCategoryName = null;
            if(stateParameters &&  stateParameters.variableCategoryName){
                variableCategoryName =  stateParameters.variableCategoryName;
            }
            $state.go(state, {
                fromState: $state.current.name,
                fromUrl: window.location.href,
                variableCategoryName:  variableCategoryName
            });
        };

        $scope.setLocalStorageFlagTrue = function(flagName){
            localStorageService.setItem(flagName, true);
            $scope[flagName] = true;
        };

        // open datepicker for "from" date
        $scope.openFromDatePicker = function(){
            ionicDatePicker.openDatePicker($scope.fromDatePickerObj);
        };

        // open datepicker for "to" date
        $scope.openToDatePicker = function(){
            ionicDatePicker.openDatePicker($scope.toDatePickerObj);
        };

        // update dates selected from calendar
        $scope.saveDates = function(){
            $scope.updateDatesLocalStorage();
            $scope.updateDatePickerObjects();
            $scope.popover.hide();
            $scope.init();
        };
        
        // update fromDate and toDate in datepicker objects
        $scope.updateDatePickerObjects = function() {
            $scope.fromDatePickerObj.to = $scope.toDate;
            $scope.toDatePickerObj.from = $scope.fromDate;
            $scope.fromDatePickerObj.inputDate = $scope.fromDate;
            $scope.toDatePickerObj.inputDate = $scope.toDate;
        };
        
        $scope.updateDatesLocalStorage = function() {
            var to = moment($scope.toDate).unix()*1000;
            var from = moment($scope.fromDate).unix()*1000;
            measurementService.setDates(to, from);
        };

        // show main calendar popup (from and to)
        $scope.showCalendarPopup = function($event){
            $scope.popover.show($event);
            measurementService.getToDate(function(endDate){
                $scope.toDate = new Date(endDate);
                $scope.fromDatePickerObj.to = $scope.toDate;
                measurementService.getFromDate(function(fromDate){
                    $scope.fromDate = new Date(fromDate);
                    $scope.toDatePickerObj.from = $scope.fromDate;
                });
            });
        };
        
        var helpPopupMessages = config.appSettings.helpPopupMessages || false;

        $scope.showHelpInfoPopupIfNecessary = function(e) {
            localStorageService.getItem('isWelcomed',function(isWelcomed) {
                if(isWelcomed  === true || isWelcomed === "true"){
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
                }
            });
        };

        $scope.$on('$ionicView.enter', function(e) {
            //$scope.showHelpInfoPopupIfNecessary(e);
        });

        $scope.closeMenuIfNeeded = function(menuItem){
            if(menuItem.click){
                $scope[menuItem.click] && $scope[menuItem.click]();
            }
            else if(!menuItem.isSubMenuParent){
                $scope.closeMenu();
            }
        };
        $scope.showHistorySubMenu = false;
        $scope.shoppingCartEnabled = config.shoppingCartEnabled;
        $rootScope.isSyncing = false;

        setPlatformVariables();

        /*Wrapper Config*/
        $scope.viewTitle = config.appSettings.appName;
        $scope.primaryOutcomeVariable = config.appSettings.primaryOutcomeVariable;
        $scope.positiveRatingOptions = ratingService.getPositiveRatingOptions();
        $scope.negativeRatingOptions = ratingService.getNegativeRatingOptions();
        $scope.numericRatingOptions = ratingService.getNumericRatingOptions();
        $scope.welcomeText = config.appSettings.welcomeText;
        $scope.primaryOutcomeVariableTrackingQuestion = config.appSettings.primaryOutcomeVariableTrackingQuestion;
        $scope.primaryOutcomeVariableAverageText = config.appSettings.primaryOutcomeVariableAverageText;
        /*Wrapper Config End*/

        // when view is changed
        $scope.$on('$ionicView.enter', function(e) {
            if(e.targetScope && e.targetScope.controller_name && e.targetScope.controller_name === "TrackPrimaryOutcomeCtrl"){
                $scope.showCalendarButton = true;
            } else {
                $scope.showCalendarButton = false;
            }
        });

        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });
        
        var scheduleReminder = function(){
            if($rootScope.reminderToSchedule){

                var trackingReminder = {
                    variableId: $rootScope.reminderToSchedule.id,
                    defaultValue: $rootScope.reminderToSchedule.reportedVariableValue,
                    variableName: $rootScope.reminderToSchedule.name,
                    frequency: $rootScope.reminderToSchedule.interval,
                    variableCategoryName: $rootScope.reminderToSchedule.category,
                    abbreviatedUnitName: $rootScope.reminderToSchedule.unit,
                    combinationOperation: $rootScope.reminderToSchedule.combinationOperation
                };

                reminderService.addNewReminder(trackingReminder)
                .then(function(){
                    console.log('reminder scheduled', $rootScope.reminderToSchedule);
                    delete $rootScope.reminderToSchedule;
                }, function(err){
                    Bugsnag.notify("reminderService.addNewReminder", JSON.stringify(trackingReminder), {}, "error");
                    console.log(err);
                });
            }
        };

        // when work on this activity is complete
        function hideNavigationMenuIfSetInUrlParameter() {
            if (location.href.toLowerCase().indexOf('hidemenu=true') !== -1) {
                $rootScope.hideNavigationMenu = true;
            }
        }

        function goToDefaultStateShowMenuClearIntroHistoryAndRedraw() {

            if ($state.current.name === "app.welcome") {
                $rootScope.hideNavigationMenu = false;
                console.debug('goToDefaultStateShowMenuClearIntroHistoryAndRedraw: Going to default state...');
                $state.go(config.appSettings.defaultState);
            }

            if ($state.current.name === "app.login" && $rootScope.user) {
                $rootScope.hideNavigationMenu = false;
                console.debug('goToDefaultStateShowMenuClearIntroHistoryAndRedraw: Going to default state...');
                $state.go(config.appSettings.defaultState);
            }

            if (config.appSettings.allowOffline) {
                console.debug('goToDefaultStateShowMenuClearIntroHistoryAndRedraw: Going to default state...');
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.defaultState);
            }
            
            // don't animate, clear back history
            $ionicHistory.nextViewOptions({
                disableAnimate: false,
                disableBack: true
            });

            // redraw everything according to updated appstate
            measurementService.syncPrimaryOutcomeVariableMeasurementsAndUpdateCharts();
        }

        $scope.goToDefaultStateIfWelcomed = function(){
            console.debug('appCtrl: user has seen the welcome screen before...');
            localStorageService.getItem('isWelcomed',function(isWelcomed) {
                if(isWelcomed  === true || isWelcomed === "true"){
                    $rootScope.isWelcomed = true;
                    console.debug('goToDefaultStateIfWelcomed: Going to default state...');
                    goToDefaultStateShowMenuClearIntroHistoryAndRedraw();
                }
            });
        };

        var goToDefaultStateIfLoggedInOnLoginState = function(){
            var loginState = 'app.login';
            if(loginState.indexOf($state.current.name) !== -1 && $rootScope.user){
                $rootScope.hideNavigationMenu = false;
                console.debug('goToDefaultStateIfLoggedInOnLoginState: Going to default state...');
                $state.go(config.appSettings.defaultState);
            }
        };

        $scope.getUnits = function () {
            $rootScope.abbreviatedUnitNames = [];
            unitService.getUnits().then(function (unitObjects) {
                $rootScope.unitObjects = unitObjects;
                console.debug("Got units", $rootScope.unitObjects);
                for(var i =0; i< $rootScope.unitObjects.length; i++){
                    $rootScope.abbreviatedUnitNames[i] = $rootScope.unitObjects[i].abbreviatedName;
                }
            });
        };
        
        $scope.init = function () {
            console.log("Main Constructor Start");
            if(!$rootScope.user){
                $rootScope.user = localStorageService.getItemAsObject('user');
            }
            if(!$rootScope.user && config.getClientId() === 'oAuthDisabled'){
                $rootScope.getUserAndSetInLocalStorage();
            }
            if($rootScope.user){
                    $rootScope.setUserForIntercom($rootScope.user);
                    $rootScope.setUserForBugsnag($rootScope.user);
                $scope.getUnits();
            }
            migrationService.version1466();
            hideNavigationMenuIfSetInUrlParameter();
            //goToWelcomeStateIfNotWelcomed();
            scheduleReminder();
            goToDefaultStateIfLoggedInOnLoginState();
        };

        $scope.$on('callAppCtrlInit', function(){
            console.log("calling init");
            $scope.init();
        });

        $scope.togglePrimaryOutcomeSubMenu = function(){
            $scope.showPrimaryOutcomeSubMenu = !$scope.showPrimaryOutcomeSubMenu;
        };

        $scope.toggleEmotionsSubMenu = function(){
            $scope.showEmotionsSubMenu = !$scope.showEmotionsSubMenu;
        };

        $scope.toggleDietSubMenu = function(){
            $scope.showDietSubMenu = !$scope.showDietSubMenu;
        };

        $scope.toggleTreatmentsSubMenu = function(){
            $scope.showTreatmentsSubMenu = !$scope.showTreatmentsSubMenu;
        };

        $scope.toggleSymptomsSubMenu = function(){
            $scope.showSymptomsSubMenu = !$scope.showSymptomsSubMenu;
        };

        $scope.togglePhysicalActivitySubMenu = function(){
            $scope.showPhysicalActivitySubMenu= !$scope.showPhysicalActivitySubMenu;
        };

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

        function setPlatformVariables() {
            $rootScope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
            $rootScope.isAndroid = ionic.Platform.isAndroid();
            $rootScope.isMobile = ionic.Platform.isAndroid() || ionic.Platform.isIPad() || ionic.Platform.isIOS();
            $rootScope.isChrome = window.chrome ? true : false;

            var currentUrl =  window.location.href;
            console.log('currentUrl is ' + currentUrl );
            if (currentUrl.indexOf('chrome-extension') !== -1) {
                $rootScope.isChromeExtension = true;
                $rootScope.isChromeApp = false;
            } 

            if ($rootScope.isChrome && chrome.identity) {
                $rootScope.isChromeExtension = false;
                $rootScope.isChromeApp = true;
            }
        }

        $rootScope.getUserAndSetInLocalStorage = function(){
            
            var successHandler = function(userObject) {
                if (userObject) {
                    // set user data in local storage
                    console.log('Setting user in getUserAndSetInLocalStorage');
                    localStorageService.setItem('user', JSON.stringify(userObject));
                    $rootScope.user = userObject;
                    $rootScope.setUserForIntercom($rootScope.user);
                    $rootScope.setUserForBugsnag($rootScope.user);
                    //$rootScope.$broadcast('updateChartsAndSyncMeasurements');
                    var currentStateName = $state.current.name;
                    console.log('Current state is  ' + currentStateName);
                    if (currentStateName === 'app.login') {
                        goToDefaultStateShowMenuClearIntroHistoryAndRedraw();
                    }
                    return userObject;
                }
            };
            
            authService.apiGet('api/user/me',
                [],
                {},
                successHandler,
                function(err){
                    Bugsnag.notify(err, JSON.stringify(err), {}, "error");
                    console.log(err);
                }
            );
        };

        $rootScope.setUserForIntercom = function(userObject) {
            if(userObject){
                window.intercomSettings = {
                    app_id: "uwtx2m33",
                    name: userObject.displayName,
                    email: userObject.email,
                    user_id: userObject.id
                };
            }
            return userObject;
        };

        $rootScope.setUserForBugsnag = function(userObject) {
            Bugsnag.metaData = {
                user: {
                    name: userObject.displayName,
                    email: userObject.email
                }
            };
            return userObject;
        };

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase === '$apply' || phase === '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        $scope.showLoader = function (loadingText) {
            $rootScope.isSyncing = true;
            $rootScope.syncDisplayText = loadingText;
            console.debug('Showing Loader');
            if(!loadingText){
                loadingText = '';
            }
            $scope.loading = true;
/*            $ionicLoading.show({
                template: loadingText+ '<br><br><img src={{loaderImagePath}}>',
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 1000,
                showDelay: 0,
                noBackdrop: true,
                hideOnStateChange: true,
                duration: 15000
            });
            */
            $timeout(function () {
                $rootScope.isSyncing = false;
                $ionicLoading.hide();

            }, 15000);

        };
        

        $scope.hideLoader = function () {
            $rootScope.isSyncing = false;
            $scope.loading = false;
            $ionicLoading.hide();
        };
        
        $scope.init();
    });
