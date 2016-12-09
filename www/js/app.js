// Database
//var db = null;

angular.module('starter',
    [
        'ionic',
        //'ionic.service.core',
        'ionic.cloud',
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
        'fabric',
        'ngCordovaOauth',
        'jtt_wikipedia'
    ]
)

.run(function($ionicPlatform, $ionicHistory, $state, $rootScope, localStorageService, qmLocationService, reminderService) {
//.run(function($ionicPlatform, $ionicHistory, $state, $rootScope, $ionicAnalytics) {
// Database
//.run(function($ionicPlatform, $ionicHistory, $state, $rootScope, $cordovaSQLite) {

    $ionicPlatform.ready(function() {
        //$ionicAnalytics.register();

        /*
        if(ionic.Platform.isIPad() || ionic.Platform.isIOS()){
            window.onerror = function (errorMsg, url, lineNumber) {
                alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
            };
        }
        */

         if (typeof PushNotification !== "undefined") {
             console.debug("Going to try to register push");
             var push = PushNotification.init({
                 android: {
                     senderID: "1052648855194",
                     badge: true,
                     sound: false,
                     vibrate: false,
                     icon: 'ic_stat_icon_bw',
                     clearBadge: true
                 },
                 browser: {
                     pushServiceURL: 'http://push.api.phonegap.com/v1/push'
                 },
                 ios: {
                     alert: "false",
                     badge: "true",
                     sound: "false",
                     clearBadge: true
                 },
                 windows: {}
             });

             push.on('registration', function(registerResponse) {
                 console.debug('Registered device for push notifications: ' + JSON.stringify(registerResponse));
                 // data.registrationId
                 var newDeviceToken = registerResponse.registrationId;
                 console.debug("Got device token for push notifications: " + registerResponse.registrationId);
                 var deviceTokenOnServer = localStorageService.getItemSync('deviceTokenOnServer');
                 $rootScope.deviceToken = deviceTokenOnServer;
                 console.debug('deviceTokenOnServer from localStorage is ' + deviceTokenOnServer);
                 if(deviceTokenOnServer !== registerResponse.registrationId) {
                     $rootScope.deviceToken = newDeviceToken;
                     localStorageService.setItem('deviceTokenToSync', newDeviceToken);
                     console.debug('New push device token does not match push device token on server so saving to localStorage to sync after login');
                 }
             });

             var finishPushes = true;  // Setting to false didn't solve notification dismissal problem

             push.on('notification', function(data) {
                 console.debug('Received push notification: ' + JSON.stringify(data));
                 qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
                 reminderService.refreshTrackingReminderNotifications().then(function(){
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
                 push.finish(function () {
                     console.debug("processing of push data is finished: " + JSON.stringify(data));
                 });
             });

             push.on('error', function(e) {
                 alert(e.message);
             });

             var finishPush = function (data) {
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
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 1
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackTwoRatingAction = function (data){
                 
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 2
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackThreeRatingAction = function (data){
                 
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 3
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackFourRatingAction = function (data){
                 
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 4
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackFiveRatingAction = function (data){
                 
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 5
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackDefaultValueAction = function (data){
                 
                 console.debug("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.snoozeAction = function (data){
                 
                 console.debug("snoozeAction push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId
                 };
                 reminderService.snoozeReminderNotification(body);
                 finishPush(data);
             };

             window.trackLastValueAction = function (data){
                 
                 console.debug("trackLastValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: data.additionalData.lastValue
                 };
                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackSecondToLastValueAction = function (data){
                 
                 console.debug("trackSecondToLastValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: data.additionalData.secondToLastValue
                 };
                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackThirdToLastValueAction = function (data){
                 
                 console.debug("trackThirdToLastValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: data.additionalData.thirdToLastValue
                 };
                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };
         }

        if(typeof analytics !== "undefined") {
            console.debug("Configuring Google Analytics");
            //noinspection JSUnresolvedFunction
            analytics.startTrackerWithId("UA-39222734-24");
        } else {
            //console.debug("Google Analytics Unavailable");
        }
        
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        // Database
        /*
         if (!$rootScope.isMobile) {
         db = window.openDatabase("my.db", "1.0", "Cordova Demo", 200000);
         }
         else {
         db = $cordovaSQLite.openDB("my.db");
         }
         */

    });

    $rootScope.goToState = function(state, params){
        $state.go(state, params);
    };


    $ionicPlatform.registerBackButtonAction(function (event) {
        if($ionicHistory.currentStateName() === config.appSettings.defaultState){
            ionic.Platform.exitApp();
        }
        else {
            if($ionicHistory.backView()){
                $ionicHistory.goBack();
            } else if(localStorage.user){
                $rootScope.hideNavigationMenu = false;
                console.debug('registerBackButtonAction: Going to default state...');
                $state.go(config.appSettings.defaultState);
            } else {
                /*
                 console.debug('registerBackButtonAction: Going to welcome state...');
                 $state.go(config.appSettings.welcomeState);
                 */
                console.debug('registerBackButtonAction: Closing the app');
                ionic.Platform.exitApp();
            }
        }
    }, 100);

    var intervalChecker = setInterval(function(){
        if(typeof config !== "undefined"){
            clearInterval(intervalChecker);
        }
    }, 500);

    $rootScope.getAllUrlParams = function() {
        $rootScope.urlParameters = {};
        var queryString = document.location.toString().split('?')[1];
        var sURLVariables;
        var parameterNameValueArray;
        if(queryString) {
            sURLVariables = queryString.split('&');
        }
        if(sURLVariables) {
            for (var i = 0; i < sURLVariables.length; i++) {
                parameterNameValueArray = sURLVariables[i].split('=');
                if(parameterNameValueArray[1].indexOf('http') > -1){
                    $rootScope.urlParameters[parameterNameValueArray[0]] = parameterNameValueArray[1];
                } else {
                    $rootScope.urlParameters[parameterNameValueArray[0]] = decodeURIComponent(parameterNameValueArray[1]);
                }

            }
        }
    };

    $rootScope.getAllUrlParams();
    if ($rootScope.urlParameters.existingUser || $rootScope.urlParameters.introSeen || $rootScope.urlParameters.refreshUser) {
        window.localStorage.introSeen = true;
        window.localStorage.isWelcomed = true;
    }
    console.debug('url params are ' + JSON.stringify($rootScope.urlParameters));
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider, ionicTimePickerProvider,
                 ionicDatePickerProvider, $ionicConfigProvider, $ionicCloudProvider) {

    $ionicCloudProvider.init({
        "core": {
            "app_id": "__IONIC_APP_ID__"
        }
    });

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|mailto|chrome-extension|ms-appx-web|ms-appx):/);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|ftp|mailto|chrome-extension|ms-appx-web|ms-appx):/);
    $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS

    var config_resolver = {
      loadMyService: ['$ocLazyLoad', function($ocLazyLoad) {
        var getAppNameFromUrl = function () {
            var sPageURL = document.location.toString().split('?')[1];
            if(!sPageURL) {
                return false;
            }
            var sURLVariables = sPageURL.split('&');
            if(!sURLVariables) {
                return false;
            }
            for (var i = 0; i < sURLVariables.length; i++)
            {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] === 'app') {
                    return sParameterName[1].split('#')[0];
                }
            }
            return false;
        };

        var appName = getAppNameFromUrl();
        return $ocLazyLoad.load([appsManager.getAppConfig(appName), appsManager.getPrivateConfig(appName)]);
      }]
    };

    // Configure timepicker
    var timePickerObj = {
        format: 12,
        step: 1,
        closeLabel: 'Cancel'
    };
    ionicTimePickerProvider.configTimePicker(timePickerObj);

    // Configure datepicker
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
            url: '/',
            templateUrl: 'templates/intro-tour.html',
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
            cache: false,
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
            url: "/intro",
            params: {
                doNotRedirect: true
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/intro-tour.html",
                    controller: 'IntroCtrl'
                }
            }
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
                }
            },
            views: {
                'menuContent': {
                  templateUrl: "templates/variable-search.html",
                  controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.measurementAddSearchCategory', {
            url: "/measurement-add-search-category/:variableCategoryName",
            params: {
                variableCategoryName : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                nextState: 'app.measurementAdd',
                excludeDuplicateBloodPressure: true,
                variableSearchParameters: {
                    limit: 100,
                    includePublic: true,
                    manualTracking: true
                }
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.reminderSearchCategory', {
            url: "/reminder-search-category/:variableCategoryName",
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
                }
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
                }
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.favoriteSearchCategory', {
            url: "/favorite-search-category/:variableCategoryName",
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
                }
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
                }
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.measurementAdd', {
            url: "/measurement-add/:variableName",
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
                variableName : null,
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
                }
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.chartSearchCategory', {
            url: "/chart-search-category/:variableCategoryName",
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
                }
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
                commonVariableSearchParameters: {
                    numberOfAggregateCorrelationsAsEffect: '(gt)1'
                }
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
                tagVariableObject: null,
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
                commonVariableSearchParameters: {}
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
                taggedVariableObject: null,
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
                commonVariableSearchParameters: {}
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
                tagVariableObject : null,
                taggedVariableObject : null,
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
                commonVariableSearchParameters: {
                    numberOfAggregateCorrelationsAsCause: '(gt)1'
                }
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
                }
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
                }
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
                variableName : null,
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
        .state('app.searchCommonRelationships', {
            url: "/search-common-relationships",
            views: {
                'menuContent': {
                    templateUrl: "templates/iframe-embed.html",
                    controller: 'IframeScreenCtrl'
                }
            }
        })
        .state('app.searchUserRelationships', {
            url: "/search-user-relationships",
            views: {
                'menuContent': {
                    templateUrl: "templates/iframe-embed.html",
                    controller: 'IframeScreenCtrl'
                }
            }
        })
        .state('app.updateCard', {
            url: "/update-card",
            views: {
                'menuContent': {
                    templateUrl: "templates/iframe-embed.html",
                    controller: 'IframeScreenCtrl'
                }
            }
        })
        .state('app.studyCreate', {
            url: "/study-create",
            views: {
                'menuContent': {
                    templateUrl: "templates/iframe-embed.html",
                    controller: 'IframeScreenCtrl'
                }
            }
        })
        .state('app.predictorsAll', {
            url: "/predictors",
            params: {
                aggregated: false,
                variableObject : null,
                requestParams : {
                    causeVariableName: null,
                    effectVariableName: null,
                    correlationCoefficient: null
                }
            },
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.outcomesAll', {
            url: "/outcomes",
            params: {
                aggregated: false,
                variableObject : null,
                requestParams : {
                    causeVariableName: null,
                    effectVariableName: null,
                    correlationCoefficient: null
                }
            },
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsPositive', {
            url: "/predictors/positive",
            params: {
                aggregated: false,
                valence: 'positive',
                variableObject : null,
                requestParams : {
                    causeVariableName: null,
                    effectVariableName: null,
                    correlationCoefficient: null
                }
            },
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsNegative', {
            url: "/predictors/negative",
            params: {
                aggregated: false,
                valence: 'negative',
                variableObject : null,
                requestParams : {
                    causeVariableName: null,
                    effectVariableName: null,
                    correlationCoefficient: null
                }
            },
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsUser', {
            url: "/predictors/user",
            params: {
                aggregated: false,
                variableObject : null,
                requestParams : {
                    causeVariableName: null,
                    effectVariableName: null,
                    correlationCoefficient: null
                }
            },
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.predictorsAggregated', {
            url: "/predictors/aggregated",
            params: {
                aggregated: true,
                variableObject : null,
                requestParams : {
                    causeVariableName: null,
                    effectVariableName: null,
                    correlationCoefficient: null
                }
            },
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: "templates/predictors-list.html",
                    controller: 'PredictorsCtrl'
                }
            }
        })
        .state('app.study', {
            cache: false,
            url: "/study",
            params: {
                correlationObject: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/study-page.html",
                    controller: 'StudyCtrl'
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
            url: "/history-all/:variableCategoryName",
            cache: false,
            params: {
                variableCategoryName : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/history-all.html",
                    controller: 'historyAllMeasurementsCtrl'
                }
            }
        })
        .state('app.historyAllVariable', {
            url: "/history-all/:variableName",
            cache: false,
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
        .state('app.favoritesCategory', {
            url: "/favorites-category/:variableCategoryName",
            cache: false,
            params: {
                variableCategoryName: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/favorites.html",
                    controller: 'FavoritesCtrl'
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
        .state('app.remindersInboxTodayCategory', {
            url: "/reminders-inbox-today/:variableCategoryName",
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
        .state('app.remindersInboxCategory', {
            url: "/reminders-inbox/:variableCategoryName",
            params: {
                unit: null,
                variableName : null,
                dateTime : null,
                value : null,
                fromUrl : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-inbox.html",
                    controller: 'RemindersInboxCtrl'
                }
            }
        })
        .state('app.remindersManage', {
            cache: false,
            url: "/reminders-manage/:variableCategoryName",
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-manage.html",
                    controller: 'RemindersManageCtrl'
                }
            }
        })
        .state('app.reminderAdd', {
            url: "/reminder-add",
            cache: false,
            params: {
                variableCategoryName : null,
                reminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                favorite: false
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminder-add.html",
                    controller: 'RemindersAddCtrl'
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
                favorite: true
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminder-add.html",
                    controller: 'RemindersAddCtrl'
                }
            }
        })
        .state('app.tabs', {
            url: '/tabs',
            views: {
                'menuContent': {
                    templateUrl: 'templates/tabs/tabs.html',
                    controller: 'TabCtrl'
                }
            }
        })

       .state('app.tab-detail', {
            url: '/tabs/:tabId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/tabs/tab-detail.html',
                    controller: 'TabDetailCtrl'
                }
            }
        });

    if (window.localStorage.introSeen) {
        console.debug("Intro seen so going to inbox");
         $urlRouterProvider.otherwise('/app/tabs')
    } else {
        console.debug("Intro not seen so going to intro");
        $urlRouterProvider.otherwise('/');
    }
      // if none of the above states are matched, use this as the fallback
    
});

angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
    return function (exception, cause) {
        if (typeof Bugsnag !== "undefined") {
            Bugsnag.apiKey = "ae7bc49d1285848342342bb5c321a2cf";
            Bugsnag.notifyException(exception, {diagnostics: {cause: cause}});
        }
    };
});
