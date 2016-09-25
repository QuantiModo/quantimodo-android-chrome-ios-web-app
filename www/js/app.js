// Database
//var db = null;

angular.module('starter',
    [
        'ionic','ionic.service.core',
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
        'ngCordovaOauth'
    ]
)

.run(function($ionicPlatform, $ionicHistory, $state, $rootScope, localStorageService, qmLocationService, reminderService) {
//.run(function($ionicPlatform, $ionicHistory, $state, $rootScope, $ionicAnalytics) {
// Database
//.run(function($ionicPlatform, $ionicHistory, $state, $rootScope, $cordovaSQLite) {

    $ionicPlatform.ready(function() {
        //$ionicAnalytics.register();
        if(ionic.Platform.isIPad() || ionic.Platform.isIOS()){
            window.onerror = function (errorMsg, url, lineNumber) {
                alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
            };
        }

         if (ionic.Platform.isAndroid() || ionic.Platform.isIPad() || ionic.Platform.isIOS()) {
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
                 console.debug('deviceTokenOnServer from localStorage is ' + deviceTokenOnServer);
                 if(deviceTokenOnServer !== registerResponse.registrationId) {
                     localStorageService.setItem('deviceTokenToSync', newDeviceToken);
                     console.debug('New push device token does not match push device token on server so saving to localStorage to sync after login');
                 }
             });

             var finishPushes = true;  // Setting to false didn't solve notification dismissal problem

             push.on('notification', function(data) {
                 console.log('Received push notification: ' + JSON.stringify(data));
                 qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
                 reminderService.refreshTrackingReminderNotifications();
                 // data.message,
                 // data.title,
                 // data.count,
                 // data.sound,
                 // data.image,
                 // data.additionalData
                 if(!finishPushes) {
                     console.log('Not doing push.finish for data.additionalData.notId: ' + data.additionalData.notId);
                     return;
                 }
                 push.finish(function () {
                     console.log("processing of push data is finished: " + JSON.stringify(data));
                 });
             });

             push.on('error', function(e) {
                 alert(e.message);
             });

             var finishPush = function (data) {
                 if(!finishPushes){
                     console.log('Not doing push.finish for data.additionalData.notId: ' + data.additionalData.notId);
                     return;
                 }

                 push.finish(function() {
                     console.log('accept callback finished for data.additionalData.notId: ' + data.additionalData.notId);
                 }, function() {
                     console.log('accept callback failed for data.additionalData.notId: ' + data.additionalData.notId);
                 }, data.additionalData.notId);

             };

             window.trackOneRatingAction = function (data){
                 
                 console.log("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 1
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackTwoRatingAction = function (data){
                 
                 console.log("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 2
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackThreeRatingAction = function (data){
                 
                 console.log("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 3
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackFourRatingAction = function (data){
                 
                 console.log("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 4
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackFiveRatingAction = function (data){
                 
                 console.log("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: 5
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackDefaultValueAction = function (data){
                 
                 console.log("trackDefaultValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId
                 };

                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.snoozeAction = function (data){
                 
                 console.log("snoozeAction push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId
                 };
                 reminderService.snoozeReminderNotification(body);
                 finishPush(data);
             };

             window.trackLastValueAction = function (data){
                 
                 console.log("trackLastValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: data.additionalData.lastValue
                 };
                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackSecondToLastValueAction = function (data){
                 
                 console.log("trackSecondToLastValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: data.additionalData.secondToLastValue
                 };
                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };

             window.trackThirdToLastValueAction = function (data){
                 
                 console.log("trackThirdToLastValueAction Push data: " + JSON.stringify(data));
                 var body = {
                     trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                     modifiedValue: data.additionalData.thirdToLastValue
                 };
                 reminderService.trackReminderNotification(body);
                 finishPush(data);
             };
         }

        if(typeof analytics !== "undefined") {
            console.log("Configuring Google Analytics");
            //noinspection JSUnresolvedFunction
            analytics.startTrackerWithId("UA-39222734-24");
        } else {
            //console.log("Google Analytics Unavailable");
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

    var intervalChecker = setInterval(function(){
        if(typeof config !== "undefined"){
            clearInterval(intervalChecker);

            if(!window.private_keys) {
                console.error('Please add private config file to www/private_configs folder!  Contact mike@quantimo.do if you need help');
                return;
            }

            $rootScope.appVersion = "1.9.8.0";
            $rootScope.appName = config.appSettings.appName;

            if (typeof Bugsnag !== "undefined") {
                //$rootScope.bugsnagApiKey = window.private_keys.bugsnag_key;
                //Bugsnag.apiKey = "ae7bc49d1285848342342bb5c321a2cf";
                //Bugsnag.notifyReleaseStages = ['Production','Staging'];
                Bugsnag.appVersion = $rootScope.appVersion;
                Bugsnag.metaData = {
                    platform: ionic.Platform.platform(),
                    platformVersion: ionic.Platform.version(),
                    appName: config.appSettings.appName
                };
            }

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
        }
    }, 500);

})

.config(function($stateProvider, $urlRouterProvider, $compileProvider, ionicTimePickerProvider,
                 ionicDatePickerProvider, $ionicConfigProvider) {
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
                if (sParameterName[0] === 'app')
                {
                    return sParameterName[1].split('#')[0];
                }
            }
            return false;
        };

        var appName = getAppNameFromUrl();

        if(appName){
            console.log('loading', appsManager.getAppConfig(appName), appsManager.getPrivateConfig(appName));
            return $ocLazyLoad.load([appsManager.getAppConfig(appName), appsManager.getPrivateConfig(appName)]);
        } else{
            console.log('Loading default app: ' + appsManager.getDefaultApp());
            return $ocLazyLoad.load([appsManager.getDefaultConfig(), appsManager.getDefaultPrivateConfig()]);          
        }

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
            views: {
                'menuContent': {
                    templateUrl: "templates/intro-tour.html",
                    controller: 'IntroPageCtrl'
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
                nextState: 'app.measurementAdd'
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
                nextState: 'app.measurementAdd'
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.reminderSearchCategory', {
            url: "/reminderSearchCategory/:variableCategoryName",
            params: {
                variableCategoryName : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                reminderSearch: true,
                nextState: 'app.reminderAdd'
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.reminderSearch', {
            url: "/reminderSearch",
            params: {
                variableCategoryName : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                reminderSearch: true,
                nextState: 'app.reminderAdd'
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
                pageTitle: 'Add a favorite'
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
                pageTitle: 'Add a favorite'
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
            url: "/variable_settings/:variableName",
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
        .state('app.chartsSearch', {
            url: "/search-variables",
            cache: false,
            params: {
                variableCategoryName: null,
                fromState: null,
                fromUrl: null,
                measurement: null,
                doNotIncludePublicVariables: true,
                nextState: 'app.charts'
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state('app.charts', {
            url: "/variables/:variableName",
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
        .state('app.search-user-relationships', {
            url: "/search-user-relationships",
            views: {
                'menuContent': {
                    templateUrl: "templates/iframe-embed.html",
                    controller: 'IframeScreenCtrl'
                }
            }
        })
        .state('app.predictors', {
            url: "/predictors/:valence",
            params: {
                variableObject : null,
                requestParams : {
                    cause: null,
                    effect: null,
                    correlationCoefficient: null
                }
            },
            cache: false,
            views: {
                'menuContent': {
                  templateUrl: "templates/predictors.html",
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
                variableCategoryName : null,
                fromState : null,
                fromUrl : null,
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
                fromUrl : null
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
                fromUrl : null,
                helpText: "Favorites are variables that you might want to track on a frequent but irregular basis.  Examples: As-needed medications, cups of coffee, or glasses of water",
                moreHelpText: "Tip: I recommend using reminders instead of favorites whenever possible because they allow you to record regular 0 values as well. Knowing when you didn't take a medication or eat something helps our analytics engine to figure out how these things might be affecting you."
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
                addButtonText: "Add as-needed medication",
                helpText: "Quickly record doses of medications taken as needed just by tapping.  Tap twice for two doses, etc.",
                variableCategoryName : 'Treatments',
                addButtonIcon: "ion-ios-medkit-outline",
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
            url: "/reminder_add",
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
        });

    if (window.localStorage.introSeen) {
        console.log("Intro seen so going to inbox");
        $urlRouterProvider.otherwise('/app/reminders-inbox');
    } else {
        console.log("Intro not seen so going to intro");
        localStorage.setItem('introSeen', true);
        $urlRouterProvider.otherwise('/');
    }
      // if none of the above states are matched, use this as the fallback
    
});

angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
    return function (exception, cause) {
        if (typeof Bugsnag !== "undefined") {
            Bugsnag.notifyException(exception, {diagnostics: {cause: cause}});
        }
    };
});
