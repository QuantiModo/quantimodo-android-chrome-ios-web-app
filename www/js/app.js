// Database
//var db = null;
angular.module('starter',
    [
        'ionic',
        //'ionic.service.core',
        //'ionic.cloud',
        //'ionic.service.push',
        //'ionic.service.analytics',
        'oc.lazyLoad',
        'highcharts-ng',
        'ngCordova',
        'ionic-datepicker',
        'ionic-timepicker',
        'ngIOS9UIWebViewPatch',
        'ng-mfb',
        //'templates',
        //'fabric',  // Not sure if this does anything.  We might want to enable for native error logging sometime.
        'ngCordovaOauth',
        'jtt_wikipedia',
        'angular-clipboard',
        'angular-google-analytics',
        //'angular-google-adsense',
        'ngMaterialDatePicker',
        'ngMaterial',
        'ngMessages',
        'angular-cache',
        'angular-d3-word-cloud',
        'ngFileUpload'
        //'ui-iconpicker'
    ]
)
.run(function($ionicPlatform, $ionicHistory, $state, $rootScope, qmService) {
    window.developmentMode = window.location.href.indexOf("://localhost:") !== -1;
    qmService.getPrivateConfigs();
    qmService.showBlackRingLoader();
    if(appsManager.getUrlParameter('logout')){localStorage.clear(); $rootScope.user = null;}
    qmService.setPlatformVariables();
    $ionicPlatform.ready(function() {
        //$ionicAnalytics.register();
        if(ionic.Platform.isIPad() || ionic.Platform.isIOS()){
            window.onerror = function (errorMsg, url, lineNumber) {
                errorMsg = 'Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber;
                qmService.reportErrorDeferred(errorMsg);
            };
        }
        if($rootScope.isMobile){if(typeof PushNotification === "undefined"){qmService.reportErrorDeferred('PushNotification is undefined on mobile!');}}
        if (typeof PushNotification !== "undefined") {
            var pushConfig = {
                android: {senderID: "1052648855194", badge: true, sound: false, vibrate: false, icon: 'ic_stat_icon_bw', clearBadge: true},
                browser: {pushServiceURL: 'http://push.api.phonegap.com/v1/push'},
                ios: {alert: "false", badge: "true", sound: "false", clearBadge: true},
                windows: {}
            };
            console.debug("Going to try to register push with " + JSON.stringify(pushConfig));
            var push = PushNotification.init(pushConfig);
             push.on('registration', function(registerResponse) {
                 console.debug('Registered device for push notifications: ' + JSON.stringify(registerResponse));
                 if(!registerResponse.registrationId){qmService.bugsnagNotify('No registerResponse.registrationId from push registration');}
                 console.debug("Got device token for push notifications: " + registerResponse.registrationId);
                 var deviceTokenOnServer = localStorage.getItem('deviceTokenOnServer');
                 if(!deviceTokenOnServer || registerResponse.registrationId !== deviceTokenOnServer){
                     localStorage.setItem('deviceTokenToSync', registerResponse.registrationId);
                 }
             });

             var finishPushes = true;  // Setting to false didn't solve notification dismissal problem

             push.on('notification', function(data) {
                 console.debug('Received push notification: ' + JSON.stringify(data));
                 qmService.updateLocationVariablesAndPostMeasurementIfChanged();
                 qmService.refreshTrackingReminderNotifications().then(function(){
                     console.debug('push.on.notification: successfully refreshed notifications');
                 }, function (error) {
                     console.error('push.on.notification: ' + error);
                 });
                 // data.message,
                 // data.title,
                 // data.count,
                 // data.sound,
                 // data.image,
                 // data.additionalData
                 if(!finishPushes) {
                     console.debug('Not doing push.finish for data.additionalData.notId: ' + data.additionalData.notId);
                     return;
                 }
                 push.finish(function () {console.debug("processing of push data is finished: " + JSON.stringify(data));});
             });
             push.on('error', function(e) {qmService.reportException(e, e.message, pushConfig);});
             var finishPush = function (data) {
                 $rootScope.$broadcast('getTrackingReminderNotificationsFromLocalStorage');  // Refresh Reminders Inbox
                 if(!finishPushes){
                     console.debug('Not doing push.finish for data.additionalData.notId: ' + data.additionalData.notId);
                     return;
                 }
                 push.finish(function() {
                     console.debug('accept callback finished for data.additionalData.notId: ' + data.additionalData.notId);
                 }, function() {
                     console.debug('accept callback failed for data.additionalData.notId: ' + data.additionalData.notId);
                 }, data.additionalData.notId);
             };
             window.trackOneRatingAction = function (data){
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 1};
                 qmService.trackTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
             window.trackTwoRatingAction = function (data){
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 2};
                 qmService.trackTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
             window.trackThreeRatingAction = function (data){
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 3};
                 qmService.trackTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
             window.trackFourRatingAction = function (data){
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 4};
                 qmService.trackTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
             window.trackFiveRatingAction = function (data){
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: 5};
                 qmService.trackTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
             window.trackDefaultValueAction = function (data){
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId};
                 qmService.trackTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
             window.snoozeAction = function (data){
                 console.debug("snoozeAction push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId};
                 qmService.snoozeTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
             window.trackLastValueAction = function (data){
                 console.debug("trackLastValueAction Push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: data.additionalData.lastValue};
                 qmService.trackTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
             window.trackSecondToLastValueAction = function (data){
                 console.debug("trackSecondToLastValueAction Push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: data.additionalData.secondToLastValue};
                 qmService.trackTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
             window.trackThirdToLastValueAction = function (data){
                 console.debug("trackThirdToLastValueAction Push data: " + JSON.stringify(data));
                 var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId, modifiedValue: data.additionalData.thirdToLastValue};
                 qmService.trackTrackingReminderNotificationDeferred(body);
                 finishPush(data);
             };
         }
        window.notification_callback = function(reportedVariable, reportingTime){
            var startTime  = Math.floor(reportingTime/1000) || Math.floor(new Date().getTime()/1000);
            var val = false;
            if(reportedVariable === "repeat_rating"){
                val = localStorage['lastReportedPrimaryOutcomeVariableValue']? JSON.parse(localStorage['lastReportedPrimaryOutcomeVariableValue']) : false;
            } else {
                val = qmService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[reportedVariable]? qmService.getPrimaryOutcomeVariable().ratingTextToValueConversionDataSet[reportedVariable] : false;
            }
            if(val){
                localStorage['lastReportedPrimaryOutcomeVariableValue'] = val;
                var allMeasurementsObject = {storedValue : val, value : val, startTime : startTime};
                if(localStorage['primaryOutcomeVariableMeasurements']){
                    var allMeasurements = JSON.parse(localStorage['primaryOutcomeVariableMeasurements']);
                    allMeasurements.push(allMeasurementsObject);
                    localStorage['primaryOutcomeVariableMeasurements'] = JSON.stringify(allMeasurements);
                }
                if(localStorage['measurementsQueue']){
                    var measurementsQueue = JSON.parse(localStorage['measurementsQueue']);
                    measurementsQueue.push(allMeasurementsObject);
                    localStorage['measurementsQueue'] = JSON.stringify(measurementsQueue);
                }
            }
        };
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false); // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs
        }
        if (window.StatusBar) {StatusBar.styleDefault();} // org.apache.cordova.statusbar required
    });
    $rootScope.goToState = function(stateName, stateParameters){
        if(stateName.indexOf('button') !== -1){
            var buttonName = stateName;
            stateName = $rootScope.appSettings.appDesign.floatingActionButton.active[buttonName].stateName;
            stateParameters = $rootScope.appSettings.appDesign.floatingActionButton.active[buttonName].stateParameters;
        }
        $state.go(stateName, stateParameters, {reload: stateName === $state.current.name});
    };
    $ionicPlatform.registerBackButtonAction(function (event) {
        if($rootScope.backButtonState){
            $state.go($rootScope.backButtonState);
            $rootScope.backButtonState = null;
            return;
        }
        if($ionicHistory.currentStateName() === 'app.upgrade'){
            console.debug('registerBackButtonAction from upgrade: Going to default state...');
            $state.go(config.appSettings.appDesign.defaultState);
            return;
        }
        if($ionicHistory.currentStateName() === config.appSettings.appDesign.defaultState){
            ionic.Platform.exitApp();
            return;
        }
        if($ionicHistory.backView()){
            $ionicHistory.goBack();
            return;
        }
        if(localStorage.user){
            $rootScope.hideNavigationMenu = false;
            console.debug('registerBackButtonAction: Going to default state...');
            $state.go(config.appSettings.appDesign.defaultState);
            return;
        }
        console.debug('registerBackButtonAction: Closing the app');
        ionic.Platform.exitApp();
    }, 100);

    var intervalChecker = setInterval(function(){if(typeof config !== "undefined"){clearInterval(intervalChecker);}}, 500);
    if (appsManager.getUrlParameter('existingUser') || appsManager.getUrlParameter('introSeen') || appsManager.getUrlParameter('refreshUser')) {
        window.localStorage.introSeen = true;
        window.localStorage.onboarded = true;
    }
})
.config(function($stateProvider, $urlRouterProvider, $compileProvider, ionicTimePickerProvider, ionicDatePickerProvider, $ionicConfigProvider, AnalyticsProvider) {
    window.debugMode = !!(appsManager.getUrlParameter('debug'));
    window.designMode = (window.location.href.indexOf('configuration-index.html') !== -1);
    if(appsManager.getUrlParameter('apiUrl')){localStorage.setItem('apiUrl', "https://" + appsManager.getUrlParameter('apiUrl'));}
    var analyticsOptions = {tracker: 'UA-39222734-25', trackEvent: true};  // Note:  This will be replaced by config.appSettings.additionalSettings.googleAnalyticsTrackingIds.endUserApps in qmService.getUserAndSetupGoogleAnalytics
    if(ionic.Platform.isAndroid()){
        var clientId = window.localStorage.GA_LOCAL_STORAGE_KEY;
        if(!clientId){
            clientId = Math.floor((Math.random() * 9999999999) + 1000000000);
            clientId = clientId+'.'+Math.floor((Math.random() * 9999999999) + 1000000000);
            window.localStorage.setItem('GA_LOCAL_STORAGE_KEY', clientId);
        }
        analyticsOptions.fields = {storage: 'none', fields: clientId};
    }
    AnalyticsProvider.setAccount(analyticsOptions);
    AnalyticsProvider.delayScriptTag(true);  // Needed to set user id later
    // Track all routes (default is true).
    AnalyticsProvider.trackPages(true); // Track all URL query params (default is false).
    AnalyticsProvider.trackUrlParams(true);  // Ignore first page view (default is false).
    AnalyticsProvider.ignoreFirstPageLoad(true);  // Helpful when using hashes and whenever your bounce rate looks obscenely low.
    //AnalyticsProvider.trackPrefix('my-application'); // Helpful when the app doesn't run in the root directory. URL prefix (default is empty).
    AnalyticsProvider.setPageEvent('$stateChangeSuccess'); // Change the default page event name. Helpful when using ui-router, which fires $stateChangeSuccess instead of $routeChangeSuccess.
    AnalyticsProvider.setHybridMobileSupport(true);  // Set hybrid mobile application support
    //AnalyticsProvider.enterDebugMode(true);
    AnalyticsProvider.useECommerce(true, true); // Enable e-commerce module (ecommerce.js)
    //$ionicCloudProvider.init({"core": {"app_id": "42fe48d4"}}); Trying to move to appCtrl
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|mailto|chrome-extension|ms-appx-web|ms-appx):/);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|ftp|mailto|chrome-extension|ms-appx-web|ms-appx):/);
    $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
    $ionicConfigProvider.navBar.alignTitle('center');
    if(ionic.Platform.isIPad() || ionic.Platform.isIOS()){
        $ionicConfigProvider.views.swipeBackEnabled(false);  // Prevents back swipe white screen on iOS when caching is disabled https://github.com/driftyco/ionic/issues/3216
    }
    String.prototype.toCamel = function(){return this.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});};
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {if (this[i] === obj) {return true;}}
    };

    var config_resolver = {
        appSettingsResponse: function($http){
            var settingsUrl = 'configs/default.config.json';
            var clientId = appsManager.getQuantiModoClientId();
            if(!appsManager.shouldWeUseLocalConfig(clientId)){
                settingsUrl = appsManager.getQuantiModoApiUrl() + '/api/v1/appSettings?clientId=' + clientId;
                if(window.designMode){settingsUrl += '&designMode=true';}
            }
            return $http({method: 'GET', url: settingsUrl});
        }
    };
    //config_resolver.loadMyService = ['$ocLazyLoad', function($ocLazyLoad) {return $ocLazyLoad.load([appsManager.getAppConfig(), appsManager.getPrivateConfig()]);}];
    ionicTimePickerProvider.configTimePicker({format: 12, step: 1, closeLabel: 'Cancel'});
    var datePickerObj = {
        inputDate: new Date(),
        setLabel: 'Set',
        todayLabel: 'Today',
        closeLabel: 'Cancel',
        mondayFirst: false,
        weeksList: ["S", "M", "T", "W", "T", "F", "S"],
        //monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
        templateType: 'modal',
        from: new Date(2012, 8, 1),
        to: new Date(),
        showTodayButton: true,
        dateFormat: 'dd MMMM yyyy',
        closeOnSelect: false
    };
    ionicDatePickerProvider.configDatePicker(datePickerObj);

    $stateProvider
        .state('intro', {
            cache: true,
            url: '/',
            templateUrl: 'templates/intro-tour-new.html',
            controller: 'IntroCtrl',
            resolve : config_resolver
        })
        .state('app', {
            url: "/app",
            templateUrl: "templates/menu.html",
            controller: 'AppCtrl',
            resolve : config_resolver
        })
        .state('app.welcome', {
            cache: true,
            url: "/welcome",
            views: {
                'menuContent': {
                    templateUrl: "templates/welcome.html",
                    controller: 'WelcomeCtrl'
                }
            }
        })
        .state('app.login', {
            url: "/login",
            params: {
                fromState : null,
                fromUrl : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/login-page.html",
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('app.intro', {
            cache: true,
            url: "/intro",
            params: {
                doNotRedirect: true
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/intro-tour-new.html",
                    controller: 'IntroCtrl'
                }
            },
            resolve : config_resolver
        })
        .state('app.track', {
            url: "/track",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/track-primary-outcome-variable.html",
                    controller: 'TrackPrimaryOutcomeCtrl'
                }
            }
        })
        .state('app.measurementAddSearch', {
            url: "/measurement-add-search",
            params: {
                reminder : null,
                fromState : null,
                measurement : null,
                variableObject : null,
                nextState: 'app.measurementAdd',
                variableCategoryName: null,
                excludeDuplicateBloodPressure: true,
                variableSearchParameters: {
                    limit: 100,
                    includePublic: true,
                    manualTracking: true
                },
                hideNavigationMenu: null,
                doneState: null
            },
            views: {
                'menuContent': {
                  templateUrl: "templates/variable-search.html",
                  controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.reminderSearch', {
            url: "/reminder-search",
            params: {
                variableCategoryName : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                reminderSearch: true,
                nextState: 'app.reminderAdd',
                excludeDuplicateBloodPressure: true,
                variableSearchParameters: {
                    limit: 100,
                    includePublic: true,
                    manualTracking: true
                },
                hideNavigationMenu: null,
                skipReminderSettingsIfPossible: null,
                doneState: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.favoriteSearch', {
            url: "/favorite-search",
            params: {
                variableCategoryName : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                favoriteSearch: true,
                nextState: 'app.favoriteAdd',
                pageTitle: 'Add a favorite',
                excludeDuplicateBloodPressure: true,
                variableSearchParameters: {
                    limit: 100,
                    includePublic: true,
                    manualTracking: true
                },
                hideNavigationMenu: null,
                doneState: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.measurementAdd', {
            url: "/measurement-add",
            cache: false,
            params: {
                trackingReminder: null,
                reminderNotification: null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                variableName: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/measurement-add.html",
                    controller: 'MeasurementAddCtrl'
                }
            }
        })
        .state('app.measurementAddVariable', {
            url: "/measurement-add-variable-name/:variableName",
            cache: false,
            params: {
                trackingReminder: null,
                reminderNotification: null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/measurement-add.html",
                    controller: 'MeasurementAddCtrl'
                }
            }
        })
        .state('app.variableSettings', {
            url: "/variable-settings/:variableName",
            cache: false,
            params: {
                reminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-settings.html",
                    controller: 'VariableSettingsCtrl'
                }
            }
        })
        .state('app.import', {
            url: "/import",
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/import-data.html",
                    controller: 'ImportCtrl'
                }
            }
        })
        .state('app.importNative', {
            url: "/import-native",
            cache: false,
            params: {
                native: true
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/import-data.html",
                    controller: 'ImportCtrl'
                }
            }
        })
        .state('app.chartSearch', {
            url: "/chart-search",
            cache: false,
            params: {
                variableCategoryName: null,
                fromState: null,
                fromUrl: null,
                measurement: null,
                nextState: 'app.charts',
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                variableSearchParameters: {
                    limit: 100,
                    includePublic: false
                    //manualTracking: false  Shouldn't do this because it will only include explicitly false variables
                },
                hideNavigationMenu: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.predictorSearch', {
            url: "/predictor-search",
            cache: false,
            params: {
                title: "Outcomes", // Gets cut off on iPod if any longer
                variableSearchPlaceholderText: "Search for an outcome...",
                helpText: "Search for an outcome like overall mood or a symptom that you want to know the causes of...",
                variableCategoryName: null,
                nextState: 'app.predictorsAll',
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                noVariablesFoundCard: {
                    body: "I don't have enough data to determine the top predictors of __VARIABLE_NAME__, yet. " +
                    "I generally need about a month of data to produce significant results so start tracking!"
                },
                variableSearchParameters: {
                    includePublic: true,
                    fallbackToAggregatedCorrelations: true,
                    numberOfUserCorrelationsAsEffect: '(gt)1',
                    outcome: true
                },
                hideNavigationMenu: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.tageeSearch', {
            url: "/tagee-search",
            cache: false,
            params: {
                userTagVariableObject: null,
                title: "Select Tagee", // Gets cut off on iPod if any longer
                variableSearchPlaceholderText: "Search for a variable to tag...",
                variableCategoryName: null,
                nextState: 'app.tagAdd',
                fromState: null,
                fromStateParams: null,
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                noVariablesFoundCard: {
                    body: "I can't find __VARIABLE_NAME__. Please try another"
                },
                variableSearchParameters: {
                    includePublic: true
                },
                hideNavigationMenu: null,
                doneState: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.tagSearch', {
            url: "/tag-search",
            cache: false,
            params: {
                userTaggedVariableObject: null,
                title: "Tags", // Gets cut off on iPod if any longer
                variableSearchPlaceholderText: "Search for a tag...",
                variableCategoryName: null,
                nextState: 'app.tagAdd',
                fromState: null,
                fromStateParams: null,
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                noVariablesFoundCard: {
                    body: "I can't find __VARIABLE_NAME__. Please try another"
                },
                variableSearchParameters: {
                    includePublic: true
                },
                hideNavigationMenu: null,
                doneState: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.tagAdd', {
            url: "/tag-add",
            cache: false,
            params: {
                tagConversionFactor: null,
                fromState : null,
                fromStateParams: null,
                fromUrl : null,
                userTagVariableObject : null,
                userTaggedVariableObject : null,
                variableObject: null,
                helpText: "Say I want to track how much sugar I consume and see how that affects me.  I don't need to " +
                    "check the label every time.  I can just tag Candy Bar and Lollypop with the amount sugar. Then during " +
                    "analysis the sugar from those items will be included.  Additionally if I have multiple variables that " +
                    "are basically the same thing like maybe a drug and it's generic name, I can tag those and then the " +
                    "measurements from both variables will be included in the analysis."
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/tag-add.html",
                    controller: 'TagAddCtrl'
                }
            }
        })
        .state('app.outcomeSearch', {
            url: "/outcome-search",
            cache: false,
            params: {
                title: "Predictors", // Gets cut off on iPod if any longer
                variableSearchPlaceholderText: "Search for an predictor...",
                helpText: "Search for a predictor like a food or treatment that you want to know the effects of...",
                variableCategoryName: null,
                nextState: 'app.outcomesAll',
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                noVariablesFoundCard: {
                    body: "I don't have enough data to determine the top outcomes of __VARIABLE_NAME__, yet. " +
                    "I generally need about a month of data to produce significant results so start tracking!"
                },
                variableSearchParameters: {
                    includePublic: true,
                    fallbackToAggregatedCorrelations: true,
                    numberOfUserCorrelationsAsCause: '(gt)1'
                },
                hideNavigationMenu: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.searchVariablesWithUserPredictors', {
            url: "/search-variables-with-user-predictors",
            cache: false,
            params: {
                variableCategoryName: null,
                nextState: 'app.predictors',
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                variableSearchParameters: {
                    includePublic: false,
                    //manualTracking: false,  Shouldn't do this because it will only include explicitly false variables
                    numberOfUserCorrelations: '(gt)1'
                },
                hideNavigationMenu: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.searchVariablesWithCommonPredictors', {
            url: "/search-variables-with-common-predictors",
            cache: false,
            params: {
                variableCategoryName: null,
                nextState: 'app.predictors',
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                variableSearchParameters: {
                    includePublic: true,
                    //manualTracking: false  Shouldn't do this because it will only include explicitly false variables
                    numberOfAggregatedCorrelations: '(gt)1'
                },
                hideNavigationMenu: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.charts', {
            url: "/charts/:variableName",
            cache: false,
            params: {
                trackingReminder : null,
                variableObject: null,
                measurementInfo: null,
                noReload: false,
                fromState : null,
                fromUrl : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/charts-page.html",
                    controller: 'ChartsPageCtrl'
                }
            }
        })
        .state('app.predictorsAll', {
            url: "/predictors/:effectVariableName",
            params: {
                aggregated: false,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: null
                }
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.outcomesAll', {
            url: "/outcomes/:causeVariableName",
            params: {
                aggregated: false,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: null
                }
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsPositive', {
            url: "/predictors-positive",
            params: {
                aggregated: false,
                valence: 'positive',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: '(gt)0'
                }
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsPositiveVariable', {
            url: "/predictors-positive-variable/:effectVariableName",
            params: {
                aggregated: false,
                valence: 'positive',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: '(gt)0'
                }
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsNegative', {
            url: "/predictors-negative",
            params: {
                aggregated: false,
                valence: 'negative',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: '(lt)0'
                }
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsNegativeVariable', {
            url: "/predictors-negative-variable/:effectVariableName",
            params: {
                aggregated: false,
                valence: 'negative',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: '(lt)0'
                }
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsUser', {
            url: "/predictors/user/:effectVariableName",
            params: {
                aggregated: false,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: null
                }
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsAggregated', {
            url: "/predictors/aggregated/:effectVariableName",
            params: {
                aggregated: true,
                variableObject : null,
                requestParams : {
                    causeVariableName: null,
                    effectVariableName: null,
                    correlationCoefficient: null
                }
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.study', {
            cache: true,
            url: "/study",
            params: {
                correlationObject: null,
                causeVariableName: null,
                effectVariableName: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/study-page.html",
                    controller: 'StudyCtrl'
                }
            }
        })
        .state('app.studyJoin', {
            cache: false,
            url: "/study-join",
            params: {
                correlationObject: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/study-join-page.html",
                    controller: 'StudyJoinCtrl'
                }
            }
        })
        .state('app.studyCreation', {
            cache: false,
            url: "/study-creation",
            params: {
                correlationObject: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/study-creation-page.html",
                    controller: 'StudyCreationCtrl'
                }
            }
        })
        .state('app.settings', {
            url: "/settings",
            views: {
                'menuContent': {
                    templateUrl: "templates/settings.html",
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state('app.notificationPreferences', {
            url: "/notificationPreferences",
            views: {
                'menuContent': {
                    templateUrl: "templates/notification-preferences.html",
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state('app.map', {
            url: "/map",
            views: {
                'menuContent': {
                    templateUrl: "templates/map.html",
                    controller: 'MapCtrl'
                }
            }
        })
        .state('app.help', {
            url: "/help",
            views: {
                'menuContent': {
                    templateUrl: "templates/help.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        .state('app.feedback', {
            url: "/feedback",
            views: {
                'menuContent': {
                    templateUrl: "templates/feedback.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        .state('app.contact', {
            url: "/contact",
            views: {
                'menuContent': {
                    templateUrl: "templates/contact.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        // Broken; redirecting to help page instead
        /*
        .state('app.postIdea', {
            url: "/postidea",
            views: {
                'menuContent': {
                    templateUrl: "templates/post-idea.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        */
        .state('app.history', {
            url: "/history",
            views: {
                'menuContent': {
                    templateUrl: "templates/history-primary-outcome-variable.html",
                    controller: 'HistoryPrimaryOutcomeCtrl'
                }
            }
        })
        .state('app.historyAll', {
            url: "/history-all",
            cache: true,
            params: {
                variableCategoryName: null,
                connectorName: null,
                sourceName: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/history-all.html",
                    controller: 'historyAllMeasurementsCtrl'
                }
            }
        })
        .state('app.historyAllCategory', {
            url: "/history-all-category/:variableCategoryName",
            cache: true,
            params: {},
            views: {
                'menuContent': {
                    templateUrl: "templates/history-all.html",
                    controller: 'historyAllMeasurementsCtrl'
                }
            }
        })
        .state('app.historyAllVariable', {
            url: "/history-all-variable/:variableName",
            cache: true,
            params: {
                variableObject : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/history-all.html",
                    controller: 'historyAllMeasurementsCtrl'
                }
            }
        })
        .state('app.remindersInbox', {
            url: "/reminders-inbox",
            cache: false,
            params: {
                title: 'Reminder Inbox',
                reminderFrequency: null,
                unit: null,
                variableName : null,
                dateTime : null,
                value : null,
                fromUrl : null,
                showHelpCards: true
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-inbox.html",
                    controller: 'RemindersInboxCtrl'
                }
            }
        })
        .state('app.remindersInboxCompact', {
            url: "/reminders-inbox-compact",
            cache: false,
            params: {
                title: 'Reminder Inbox',
                reminderFrequency: null,
                unit: null,
                variableName : null,
                dateTime : null,
                value : null,
                fromUrl : null,
                showHelpCards: false,
                hideNavigationMenu: true
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-inbox.html",
                    controller: 'RemindersInboxCtrl'
                }
            }
        })
        .state('app.favorites', {
            url: "/favorites",
            cache: false,
            params: {
                reminderFrequency: 0,
                unit: null,
                variableName : null,
                dateTime : null,
                value : null,
                fromUrl : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/favorites.html",
                    controller: 'FavoritesCtrl'
                }
            }
        })
        .state('app.configurationClientId', {
            cache: true,
            url: "/configuration/:clientId",
            views: {
                'menuContent': {
                    templateUrl: "../../app-configuration/templates/configuration.html",
                    controller: 'ConfigurationCtrl'
                }
            }
        })
        .state('app.configuration', {
            cache: true,
            url: "/configuration",
            views: {
                'menuContent': {
                    templateUrl: "../../app-configuration/templates/configuration.html",
                    controller: 'ConfigurationCtrl'
                }
            }
        })
        .state('app.remindersInboxToday', {
            url: "/reminders-inbox-today",
            params: {
                unit: null,
                variableName : null,
                dateTime : null,
                value : null,
                fromUrl : null,
                today : true
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-inbox.html",
                    controller: 'RemindersInboxCtrl'
                }
            }
        })
        .state('app.manageScheduledMeds', {
            url: "/manage-scheduled-meds",
            params: {
                title: "Manage Scheduled Meds",
                helpText: "Here you can add and manage your scheduled medications.  Long-press on a medication for more options.  You can drag down to refresh.",
                addButtonText: "Add scheduled medication",
                variableCategoryName : 'Treatments'
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-manage.html",
                    controller: 'RemindersManageCtrl'
                }
            }
        })
        .state('app.todayMedSchedule', {
            url: "/today-med-schedule",
            params: {
                title: "Today's Med Schedule",
                helpText: "Here you can see and record today's scheduled doses.",
                today : true,
                variableCategoryName : 'Treatments'
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-inbox.html",
                    controller: 'RemindersInboxCtrl'
                }
            }
        })
        .state('app.asNeededMeds', {
            url: "/as-needed-meds",
            params: {
                title: "As Needed Meds",
                variableCategoryName : 'Treatments'
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/favorites.html",
                    controller: 'FavoritesCtrl'
                }
            }
        })
        .state('app.remindersManage', {
            cache: false,
            url: "/reminders-manage",
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-manage.html",
                    controller: 'RemindersManageCtrl'
                }
            },
            params: {
                variableCategoryName : null
            }
        })
        .state('app.remindersManageCategory', {
            cache: false,
            url: "/reminders-manage-category/:variableCategoryName",
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-manage.html",
                    controller: 'RemindersManageCtrl'
                }
            },
            params: {}
        })
        .state('app.remindersList', {
            cache: false,
            url: "/reminders-list",
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-list.html",
                    controller: 'RemindersManageCtrl'
                }
            },
            params: {
                variableCategoryName : null
            }
        })
        .state('app.remindersListCategory', {
            cache: false,
            url: "/reminders-list-category/:variableCategoryName",
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-list.html",
                    controller: 'RemindersManageCtrl'
                }
            },
            params: {}
        })
        .state('app.variableList', {
            cache: true,
            url: "/variable-list",
            params: {
                variableCategoryName : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-list.html",
                    controller: 'RemindersManageCtrl'
                }
            }
        })
        .state('app.variableListCategory', {
            cache: true,
            url: "/variable-list-category/:variableCategoryName",
            params: {},
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-list.html",
                    controller: 'RemindersManageCtrl'
                }
            }
        })
        .state('app.reminderAdd', {
            url: "/reminder-add/:variableName",
            cache: false,
            params: {
                variableCategoryName : null,
                reminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                favorite: false,
                doneState: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminder-add.html",
                    controller: 'ReminderAddCtrl'
                }
            }
        })
        .state('app.onboarding', {
            url: "/onboarding",
            cache: true,
            params: { },
            views: {
                'menuContent': {
                    templateUrl: "templates/onboarding-page.html",
                    controller: 'OnboardingCtrl'
                }
            }
        })
        .state('app.upgrade', {
            url: "/upgrade",
            cache: true,
            params: {
                litePlanState: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/upgrade-page-cards.html",
                    controller: 'UpgradeCtrl'
                }
            }
        })
        .state('app.tabs', {
            url: "/tabs",
            cache: true,
            params: { },
            views: {
                'menuContent': {
                    templateUrl: "templates/tabs.html",
                    controller: 'TabsCtrl'
                }
            }
        })
        .state('app.favoriteAdd', {
            url: "/favorite-add",
            cache: false,
            params: {
                reminder: null,
                variableCategoryName : null,
                reminderNotification: null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                favorite: true,
                doneState: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminder-add.html",
                    controller: 'ReminderAddCtrl'
                }
            }
        });

    if (!window.localStorage.introSeen) {
        //console.debug("Intro not seen so setting default route to intro");
        $urlRouterProvider.otherwise('/');
    } else if (!window.localStorage.onboarded) {
        //console.debug("Not onboarded so setting default route to onboarding");
        $urlRouterProvider.otherwise('/app/onboarding');
    } else {
        //console.debug("Intro seen so setting default route to inbox");
        $urlRouterProvider.otherwise('/app/reminders-inbox');
    }
});
angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
    return function (exception, cause) {
        if (typeof Bugsnag !== "undefined") {
            Bugsnag.apiKey = "ae7bc49d1285848342342bb5c321a2cf";
            Bugsnag.notifyException(exception, {diagnostics: {cause: cause}});
        }
    };
});
