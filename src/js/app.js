// Database
//var db = null;
/** @namespace window.qmLog */
angular.module('starter',
    [
        'ionic',
        //'ionic.service.core',
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
        'angular-google-adsense',
        'ngMaterialDatePicker',
        'ngMaterial',
        'ngMessages',
        'angular-cache',
        'angular-d3-word-cloud',
        'ngFileUpload',
        //'ngOpbeat',
        'angular-web-notification',
        //'ui-iconpicker',
        'ngFitText',
        'ngMdIcons',
        'angularMoment',
        'open-chat-framework'
    ]
)
.run(["$ionicPlatform", "$ionicHistory", "$state", "$rootScope", "qmService", "ngChatEngine",
    function($ionicPlatform, $ionicHistory, $state, $rootScope, qmService, ngChatEngine) {
    if(typeof ChatEngineCore !== "undefined"){
        $rootScope.ChatEngine = ChatEngineCore.create({
            publishKey: 'pub-c-d8599c43-cecf-42ba-a72f-aa3b24653c2b',
            subscribeKey: 'sub-c-6c6c021c-c4e2-11e7-9628-f616d8b03518'
        }, {
            debug: true,
            globalChannel: 'chat-engine-angular-simple'
        });
    }
    if(!qm.urlHelper.onQMSubDomain()){qm.appsManager.loadPrivateConfigFromJsonFile();}
    qmService.showBlackRingLoader();
    if(qm.urlHelper.getParam('logout')){qm.storage.clear(); qmService.setUser(null);}
    qmService.setPlatformVariables();
    $ionicPlatform.ready(function() {
        //$ionicAnalytics.register();
        if(ionic.Platform.isIPad() || ionic.Platform.isIOS()){
            window.onerror = function (error, url, lineNumber) {
                var name = error.name || error.message || error;
                var message = ' Script: ' + url + ' Line: ' + lineNumber;
                qmLog.error(name, message, error);
            };
        }
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false); // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs
        }
        if (window.StatusBar) {StatusBar.styleDefault();} // org.apache.cordova.statusbar required
    });
    $rootScope.goToState = function(stateName, stateParameters, ev){
        if(stateName === 'toggleRobot'){
            qm.robot.toggle();
            return;
        }
        if(stateName.indexOf('button') !== -1){
            var buttonName = stateName;
            /** @namespace $rootScope.appSettings.appDesign.floatingActionButton */
            stateName = $rootScope.appSettings.appDesign.floatingActionButton.active[buttonName].stateName;
            stateParameters = $rootScope.appSettings.appDesign.floatingActionButton.active[buttonName].stateParameters;
            if(stateName === qmStates.reminderSearch){
                qmService.search.reminderSearch(null, ev, stateParameters.variableCategoryName);
                return;
            }
            if(stateName === qmStates.measurementAddSearch) {
                qmService.search.measurementAddSearch(null, ev, stateParameters.variableCategoryName);
                return;
            }
        }
        qmService.goToState(stateName, stateParameters, {reload: stateName === $state.current.name});
    };
    $ionicPlatform.registerBackButtonAction(function (event) {
        if(qmService.backButtonState){
            qmService.goToState(qmService.backButtonState);
            qmService.backButtonState = null;
            return;
        }
        if($ionicHistory.currentStateName() === 'app.upgrade'){
            console.debug('registerBackButtonAction from upgrade: Going to default state...');
            qmService.goToDefaultState();
            return;
        }
        /** @namespace qm.getAppSettings().appDesign.defaultState */
        if($ionicHistory.currentStateName() === qm.getAppSettings().appDesign.defaultState){
            ionic.Platform.exitApp();
            return;
        }
        if($ionicHistory.backView()){
            $ionicHistory.goBack();
            return;
        }
        if(qm.storage.getItem(qm.items.user)){
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            window.qmLog.debug('registerBackButtonAction: Going to default state...');
            qmService.goToDefaultState();
            return;
        }
        window.qmLog.debug('registerBackButtonAction: Closing the app');
        ionic.Platform.exitApp();
    }, 100);

    var intervalChecker = setInterval(function(){if(qm.getAppSettings()){clearInterval(intervalChecker);}}, 500);
    if (qm.urlHelper.getParam('existingUser') || qm.urlHelper.getParam('introSeen') || qm.urlHelper.getParam('refreshUser') || window.designMode) {
        qmService.intro.setIntroSeen(true, "Url parms have existingUser or introSeen or refreshUser or designMode");
        qm.storage.setItem(qm.items.onboarded, true);
    }
}])
.config(["$stateProvider", "$urlRouterProvider", "$compileProvider", "ionicTimePickerProvider", "ionicDatePickerProvider",
    "$ionicConfigProvider", "AnalyticsProvider", "ngMdIconServiceProvider",
    //"$opbeatProvider",
    function($stateProvider, $urlRouterProvider, $compileProvider, ionicTimePickerProvider, ionicDatePickerProvider,
                 $ionicConfigProvider, AnalyticsProvider
             //, $opbeatProvider
    ) {
    //$opbeatProvider.config({orgId: '10d58117acb546c08a2cae66d650480d', appId: 'fc62a74505'});
    window.designMode = (window.location.href.indexOf('configuration-index.html') !== -1);
    if(qm.urlHelper.getParam(qm.items.apiUrl)){qm.storage.setItem(qm.items.apiUrl, "https://" + qm.urlHelper.getParam(qm.items.apiUrl));}
    var analyticsOptions = {tracker: 'UA-39222734-25', trackEvent: true};  // Note:  This will be replaced by qm.getAppSettings().additionalSettings.googleAnalyticsTrackingIds.endUserApps in qmService.getUserAndSetupGoogleAnalytics
    if(ionic.Platform.isAndroid()){
        var clientId = qm.storage.getItem('GA_LOCAL_STORAGE_KEY');
        if(!clientId){
            clientId = Math.floor((Math.random() * 9999999999) + 1000000000);
            clientId = clientId+'.'+Math.floor((Math.random() * 9999999999) + 1000000000);
            window.qm.storage.setItem('GA_LOCAL_STORAGE_KEY', clientId);
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
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {if (this[i] === obj) {return true;}}
    };

    var config_resolver = {
        appSettingsResponse: function($q){
            var deferred = $q.defer();
            if(qm.appMode.isDevelopment()){ // TODO: Faster.  We might want to do this globally at some point
                deferred.resolve(qm.staticData.appSettings);
            } else {
                qm.appsManager.getAppSettingsLocallyOrFromApi(function(appSettings){deferred.resolve(appSettings);});
            }
            return deferred.promise;
        }
    };
    //config_resolver.loadMyService = ['$ocLazyLoad', function($ocLazyLoad) {return $ocLazyLoad.load([qm.appsManager.getAppConfig(), qm.appsManager.getPrivateConfig()]);}];
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

    window.qmStates = {
        "asNeededMeds": "app.asNeededMeds",
        "charts": "app.charts",
        "chartSearch": "app.chartSearch",
        "chat": "app.chat",
        "configuration": "app.configuration",
        "configurationClientId": "app.configurationClientId",
        "contact": "app.contact",
        "dataSharing": "app.dataSharing",
        "favoriteAdd": "app.favoriteAdd",
        "favorites": "app.favorites",
        "favoriteSearch": "app.favoriteSearch",
        "feed": "app.feed",
        "feedback": "app.feedback",
        "help": "app.help",
        "history": "app.history",
        "historyAll": "app.historyAll",
        "historyAllCategory": "app.historyAllCategory",
        "historyAllVariable": "app.historyAllVariable",
        "import": "app.import",
        "importNative": "app.importNative",
        "intro": "app.intro",
        "login": "app.login",
        "manageScheduledMeds": "app.manageScheduledMeds",
        "map": "app.map",
        "measurementAdd": "app.measurementAdd",
        "measurementAddSearch": "app.measurementAddSearch",
        "measurementAddVariable": "app.measurementAddVariable",
        "notificationPreferences": "app.notificationPreferences",
        "onboarding": "app.onboarding",
        "outcomesAll": "app.outcomesAll",
        "outcomeSearch": "app.outcomeSearch",
        "predictorsAggregated": "app.predictorsAggregated",
        "predictorsAll": "app.predictorsAll",
        "predictorSearch": "app.predictorSearch",
        "predictorsNegative": "app.predictorsNegative",
        "predictorsNegativeVariable": "app.predictorsNegativeVariable",
        "predictorsPositive": "app.predictorsPositive",
        "predictorsPositiveVariable": "app.predictorsPositiveVariable",
        "predictorsUser": "app.predictorsUser",
        "reminderAdd": "app.reminderAdd",
        "reminderSearch": "app.reminderSearch",
        "remindersInbox": "app.remindersInbox",
        "remindersInboxCompact": "app.remindersInboxCompact",
        "remindersInboxToday": "app.remindersInboxToday",
        "remindersList": "app.remindersList",
        "remindersListCategory": "app.remindersListCategory",
        "remindersManage": "app.remindersManage",
        "remindersManageCategory": "app.remindersManageCategory",
        "searchVariablesWithCommonPredictors": "app.searchVariablesWithCommonPredictors",
        "searchVariablesWithUserPredictors": "app.searchVariablesWithUserPredictors",
        "settings": "app.settings",
        "study": "app.study",
        "studies": "app.studies",
        "studiesOpen": "app.studiesOpen",
        "studiesCreated": "app.studiesCreated",
        "studyCreation": "app.studyCreation",
        "studyJoin": "app.studyJoin",
        "tabs": "app.tabs",
        "tagAdd": "app.tagAdd",
        "tageeSearch": "app.tageeSearch",
        "tagSearch": "app.tagSearch",
        "todayMedSchedule": "app.todayMedSchedule",
        "track": "app.track",
        "upgrade": "app.upgrade",
        "variableList": "app.variableList",
        "variableListCategory": "app.variableListCategory",
        variableSettingsVariableName: "app.variableSettingsVariableName",
        variableSettings: "app.variableSettings",
        "welcome": "app.welcome"
    };
    $stateProvider
        // .state('intro', {
        //     cache: true,
        //     url: '/',
        //     templateUrl: 'templates/intro-tour-new.html',
        //     controller: 'IntroCtrl',
        //     resolve : config_resolver
        // })
        .state('app', {
            url: "/app",
            templateUrl: "templates/menu.html",
            controller: 'AppCtrl',
            resolve : config_resolver
        })
        .state(qmStates.welcome, {
            cache: true,
            url: "/welcome",
            views: {
                'menuContent': {
                    templateUrl: "templates/welcome.html",
                    controller: 'WelcomeCtrl'
                }
            }
        })
        .state(qmStates.login, {
            url: "/login",
            params: {
                fromState : null,
                fromUrl : null,
                title: "Login",
                ionIcon: ionIcons.login
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/login-page.html",
                    controller: 'LoginCtrl'
                }
            }
        })
        .state(qmStates.intro, {
            cache: false,
            url: "/intro",
            params: {
                doNotRedirect: true,
                title: "Intro",
                ionIcon: ionIcons.login
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/intro-tour-new.html",
                    controller: 'IntroCtrl'
                }
            },
            resolve : config_resolver
        })
        .state(qmStates.track, {
            url: "/track",
            cache: false,
            params: {
                showAds: true,
                title: "Track Primary Outcome",
                ionIcon: ionIcons.recordMeasurement
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/track-primary-outcome-variable.html",
                    controller: 'TrackPrimaryOutcomeCtrl'
                }
            }
        })
        .state(qmStates.measurementAddSearch, {
            url: "/measurement-add-search",
            params: {
                showAds: true,
                reminder : null,
                fromState : null,
                measurement : null,
                variableObject : null,
                nextState: qmStates.measurementAdd,
                variableCategoryName: null,
                excludeDuplicateBloodPressure: true,
                variableSearchParameters: {
                    limit: 100,
                    includePublic: true,
                    manualTracking: true
                },
                hideNavigationMenu: null,
                doneState: null,
                title: "Select a Variable",
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                  templateUrl: "templates/variable-search.html",
                  controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.reminderSearch, {
            url: "/reminder-search",
            params: {
                showAds: true,
                variableCategoryName : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                reminderSearch: true,
                nextState: qmStates.reminderAdd,
                excludeDuplicateBloodPressure: true,
                variableSearchParameters: {
                    limit: 100,
                    includePublic: true,
                    manualTracking: true
                },
                hideNavigationMenu: null,
                skipReminderSettingsIfPossible: null,
                doneState: null,
                title: "Select a Variable",
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.favoriteSearch, {
            url: "/favorite-search",
            params: {
                showAds: true,
                variableCategoryName : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                favoriteSearch: true,
                nextState: qmStates.favoriteAdd,
                pageTitle: 'Add a favorite',
                excludeDuplicateBloodPressure: true,
                variableSearchParameters: {
                    limit: 100,
                    includePublic: true,
                    manualTracking: true
                },
                hideNavigationMenu: null,
                doneState: null,
                title: "Select a Variable",
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.measurementAdd, {
            url: "/measurement-add",
            cache: false,
            params: {
                showAds: true,
                trackingReminder: null,
                reminderNotification: null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                variableName: null,
                currentMeasurementHistory: null,
                title: "Record a Measurement",
                ionIcon: ionIcons.recordMeasurement
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/measurement-add.html",
                    controller: 'MeasurementAddCtrl'
                }
            }
        })
        .state(qmStates.measurementAddVariable, {
            url: "/measurement-add-variable-name/:variableName",
            cache: false,
            params: {
                showAds: true,
                trackingReminder: null,
                reminderNotification: null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                title: "Record a Measurement",
                ionIcon: ionIcons.recordMeasurement
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/measurement-add.html",
                    controller: 'MeasurementAddCtrl'
                }
            }
        })
        .state(qmStates.variableSettings, {
            url: "/variable-settings",
            cache: false,
            params: {
                showAds: true,
                reminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                variableName : null,
                variableId : null,
                title: "Variable Settings",
                ionIcon: ionIcons.settings
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-settings.html",
                    controller: 'VariableSettingsCtrl'
                }
            }
        })
        .state(qmStates.variableSettingsVariableName, {
            url: "/variable-settings/:variableName",
            cache: false,
            params: {
                showAds: true,
                reminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                variableName : null,
                title: "Variable Settings",
                ionIcon: ionIcons.settings
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-settings.html",
                    controller: 'VariableSettingsCtrl'
                }
            }
        })
        .state(qmStates.import, {
            url: "/import",
            cache: false,
            params: {
                showAds: true,
                reminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                variableName : null,
                title: "Import Data",
                ionIcon: ionIcons.importData
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/import-data.html",
                    controller: 'ImportCtrl'
                }
            }
        })
        .state(qmStates.importNative, {
            url: "/import-native",
            cache: false,
            params: {
                showAds: true,
                native: true,
                title: "Import Data",
                ionIcon: ionIcons.importData
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/import-data.html",
                    controller: 'ImportCtrl'
                }
            }
        })
        .state(qmStates.chartSearch, {
            url: "/chart-search",
            cache: false,
            params: {
                showAds: true,
                variableCategoryName: null,
                fromState: null,
                fromUrl: null,
                measurement: null,
                nextState: qmStates.charts,
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                variableSearchParameters: {
                    limit: 100,
                    includePublic: false
                    //manualTracking: false  Shouldn't do this because it will only include explicitly false variables
                },
                hideNavigationMenu: null,
                title: "Select a Variable",
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.predictorSearch, {
            url: "/predictor-search",
            cache: false,
            params: {
                showAds: true,
                title: "Outcomes", // Gets cut off on iPod if any longer
                variableSearchPlaceholderText: "Search for an outcome...",
                helpText: "Search for an outcome like overall mood or a symptom that you want to know the causes of...",
                variableCategoryName: null,
                nextState: qmStates.predictorsAll,
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                noVariablesFoundCard: {
                    body: "I don't have enough data to determine the top predictors of __VARIABLE_NAME__, yet. " +
                    "I generally need about a month of data to produce significant results so start tracking!"
                },
                variableSearchParameters: {
                    includePublic: true,
                    fallbackToAggregatedCorrelations: true,
                    numberOfCorrelationsAsEffect: '(gt)1',
                    sort: "-numberOfCorrelationsAsEffect",
                    outcome: true
                },
                hideNavigationMenu: null,
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.tageeSearch, {
            url: "/tagee-search",
            cache: false,
            params: {
                showAds: true,
                userTagVariableObject: null,
                title: "Select Tagee", // Gets cut off on iPod if any longer
                variableSearchPlaceholderText: "Search for a variable to tag...",
                variableCategoryName: null,
                nextState: qmStates.tagAdd,
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
                doneState: null,
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.tagSearch, {
            url: "/tag-search",
            cache: false,
            params: {
                showAds: true,
                userTaggedVariableObject: null,
                title: "Tags", // Gets cut off on iPod if any longer
                variableSearchPlaceholderText: "Search for a tag...",
                variableCategoryName: null,
                nextState: qmStates.tagAdd,
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
                doneState: null,
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.tagAdd, {
            url: "/tag-add",
            cache: false,
            params: {
                showAds: true,
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
                    "measurements from both variables will be included in the analysis.",
                title: "Tag a Variable",
                ionIcon: ionIcons.tag
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/tag-add.html",
                    controller: 'TagAddCtrl'
                }
            }
        })
        .state(qmStates.outcomeSearch, {
            url: "/outcome-search",
            cache: false,
            params: {
                showAds: true,
                title: "Predictors", // Gets cut off on iPod if any longer
                variableSearchPlaceholderText: "Search for an predictor...",
                helpText: "Search for a predictor like a food or treatment that you want to know the effects of...",
                variableCategoryName: null,
                nextState: qmStates.outcomesAll,
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                noVariablesFoundCard: {
                    body: "I don't have enough data to determine the top outcomes of __VARIABLE_NAME__, yet. " +
                    "I generally need about a month of data to produce significant results so start tracking!"
                },
                variableSearchParameters: {
                    includePublic: true,
                    fallbackToAggregatedCorrelations: true,
                    numberOfCorrelationsAsCause: '(gt)1',
                    sort: "-numberOfCorrelationsAsCause"
                },
                hideNavigationMenu: null,
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.searchVariablesWithUserPredictors, {
            url: "/search-variables-with-user-predictors",
            cache: false,
            params: {
                showAds: true,
                variableCategoryName: null,
                nextState: qmStates.predictorsAll,
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                variableSearchParameters: {
                    includePublic: false,
                    //manualTracking: false,  Shouldn't do this because it will only include explicitly false variables
                    numberOfUserCorrelations: '(gt)1'
                },
                hideNavigationMenu: null,
                title: "Select a Variable",
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.searchVariablesWithCommonPredictors, {
            url: "/search-variables-with-common-predictors",
            cache: false,
            params: {
                showAds: true,
                variableCategoryName: null,
                nextState: qmStates.predictorsAll,
                doNotShowAddVariableButton: true,
                excludeSingularBloodPressure: true,
                variableSearchParameters: {
                    includePublic: true,
                    //manualTracking: false  Shouldn't do this because it will only include explicitly false variables
                    numberOfAggregatedCorrelations: '(gt)1'
                },
                hideNavigationMenu: null,
                title: "Select a Variable",
                ionIcon: ionIcons.search
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/variable-search.html",
                    controller: 'VariableSearchCtrl'
                }
            }
        })
        .state(qmStates.charts, {
            url: "/charts/:variableName",
            cache: false,
            params: {
                showAds: true,
                trackingReminder : null,
                variableObject: null,
                measurementInfo: null,
                noReload: false,
                fromState : null,
                fromUrl : null,
                refresh: null,
                title: "Charts",
                ionIcon: ionIcons.charts
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/charts-page.html",
                    controller: 'ChartsPageCtrl'
                }
            }
        })
        .state(qmStates.studies, {
            url: "/studies",
            params: {
                showAds: true,
                aggregated: null,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: null
                },
                title: "Studies",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.studiesOpen, {
            url: "/studies/open",
            params: {
                showAds: true,
                aggregated: null,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                open: true,
                requestParams : {
                    correlationCoefficient: null
                },
                title: "Open Studies",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.studiesCreated, {
            url: "/studies/created",
            params: {
                showAds: true,
                aggregated: null,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                created: true,
                requestParams : {
                    correlationCoefficient: null
                },
                title: "Your Studies",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.predictorsAll, {
            url: "/predictors/:effectVariableName",
            params: {
                showAds: true,
                aggregated: false,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: null
                },
                title: "Top Predictors",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.outcomesAll, {
            url: "/outcomes/:causeVariableName",
            params: {
                showAds: true,
                aggregated: false,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                requestParams : {
                    correlationCoefficient: null
                },
                title: "Top Outcomes",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.predictorsPositive, {
            url: "/predictors-positive",
            params: {
                showAds: true,
                aggregated: false,
                valence: 'positive',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
                requestParams : {
                    correlationCoefficient: '(gt)0'
                },
                title: "Positive Predictors",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.predictorsPositiveVariable, {
            url: "/predictors-positive-variable/:effectVariableName",
            params: {
                showAds: true,
                aggregated: false,
                valence: 'positive',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
                requestParams : {
                    correlationCoefficient: '(gt)0'
                },
                title: "Positive Predictors",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.predictorsNegative, {
            url: "/predictors-negative",
            params: {
                showAds: true,
                aggregated: false,
                valence: 'negative',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
                requestParams : {
                    correlationCoefficient: '(lt)0'
                },
                title: "Negative Predictors",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.predictorsNegativeVariable, {
            url: "/predictors-negative-variable/:effectVariableName",
            params: {
                showAds: true,
                aggregated: false,
                valence: 'negative',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
                requestParams : {
                    correlationCoefficient: '(lt)0'
                },
                title: "Negative Predictors",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.predictorsUser, {
            url: "/predictors/user/:effectVariableName",
            params: {
                showAds: true,
                aggregated: false,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
                requestParams : {
                    correlationCoefficient: null
                },
                title: "Your Predictors",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.predictorsAggregated, {
            url: "/predictors/aggregated/:effectVariableName",
            params: {
                showAds: true,
                aggregated: true,
                variableObject : null,
                fallBackToPrimaryOutcome: true,
                requestParams : {
                    causeVariableName: null,
                    effectVariableName: null,
                    correlationCoefficient: null
                },
                title: "Common Predictors",
                ionIcon: ionIcons.study
            },
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: "templates/studies-list-page.html",
                    controller: 'StudiesCtrl'
                }
            }
        })
        .state(qmStates.study, {
            cache: true,
            url: "/study",
            params: {
                showAds: true,
                causeVariableName: null,
                effectVariableName: null,
                refresh: null,
                study: null,
                title: "Study",
                ionIcon: ionIcons.study
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/study-page.html",
                    controller: 'StudyCtrl'
                }
            }
        })
        .state(qmStates.studyJoin, {
            cache: true,
            url: "/study-join",
            params: {
                causeVariableName: null,
                effectVariableName: null,
                study: null,
                title: "Join Study",
                ionIcon: ionIcons.study
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/study-join-page.html",
                    controller: 'StudyJoinCtrl'
                }
            }
        })
        .state(qmStates.studyCreation, {
            cache: true,
            url: "/study-creation",
            params: {
                showAds: true,
                causeVariable: null,
                effectVariable: null,
                study: null,
                title: "Create Study",
                ionIcon: ionIcons.study
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/study-creation-page.html",
                    controller: 'StudyCreationCtrl'
                }
            }
        })
        .state(qmStates.settings, {
            url: "/settings",
            params: {
                title: "Settings",
                ionIcon: ionIcons.settings
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/settings.html",
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state(qmStates.notificationPreferences, {
            url: "/notificationPreferences",
            params: {
                title: "Notification Settings",
                ionIcon: ionIcons.androidNotifications
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/notification-preferences.html",
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state(qmStates.map, {
            url: "/map",
            params: {
                title: "Map",
                ionIcon: ionIcons.map
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/map.html",
                    controller: 'MapCtrl'
                }
            }
        })
        .state(qmStates.help, {
            url: "/help",
            params: {
                title: "Help",
                ionIcon: ionIcons.help
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/help.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        .state(qmStates.feedback, {
            url: "/feedback",
            params: {
                title: "Feedback",
                ionIcon: ionIcons.speakerphone
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/feedback.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        .state(qmStates.contact, {
            url: "/contact",
            params: {
                title: "Feedback",
                ionIcon: ionIcons.androidChat
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/contact.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        // Broken; redirecting to help page instead
        /*
        .state(qmStates.postIdea, {
            url: "/postidea",
            views: {
                'menuContent': {
                    templateUrl: "templates/post-idea.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        */
        .state(qmStates.history, {
            url: "/history",
            params: {
                showAds: true,
                updatedMeasurementHistory: null,
                variableObject : null,
                refresh: null,
                variableCategoryName: null,
                connectorName: null,
                sourceName: null,
                title: "History",
                ionIcon: ionIcons.history
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/history-all.html",
                    controller: 'historyAllMeasurementsCtrl'
                }
            }
        })
        .state(qmStates.historyAll, {
            url: "/history-all",
            cache: true,
            params: {
                showAds: true,
                variableCategoryName: null,
                connectorName: null,
                sourceName: null,
                updatedMeasurementHistory: null,
                refresh: null,
                title: "History",
                ionIcon: ionIcons.history
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/history-all.html",
                    controller: 'historyAllMeasurementsCtrl'
                }
            }
        })
        .state(qmStates.historyAllCategory, {
            url: "/history-all-category/:variableCategoryName",
            cache: true,
            params: {
                showAds: true,
                updatedMeasurementHistory: null,
                refresh: null,
                title: "History",
                ionIcon: ionIcons.history
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/history-all.html",
                    controller: 'historyAllMeasurementsCtrl'
                }
            }
        })
        .state(qmStates.historyAllVariable, {
            url: "/history-all-variable/:variableName",
            cache: true,
            params: {
                showAds: true,
                variableObject : null,
                updatedMeasurementHistory: null,
                refresh: null,
                title: "History",
                ionIcon: ionIcons.history
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/history-all.html",
                    controller: 'historyAllMeasurementsCtrl'
                }
            }
        })
        .state(qmStates.remindersInbox, {
            url: "/reminders-inbox",
            cache: true,
            params: {
                showAds: true,
                title: 'Reminder Inbox',
                reminderFrequency: null,
                unit: null,
                variableName : null,
                dateTime : null,
                value : null,
                fromUrl : null,
                showHelpCards: true,
                ionIcon: ionIcons.inbox
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-inbox.html",
                    controller: 'RemindersInboxCtrl'
                }
            }
        })
        .state(qmStates.remindersInboxCompact, {
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
                hideNavigationMenu: true,
                ionIcon: ionIcons.inbox
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-inbox-compact.html",
                    controller: 'RemindersInboxCtrl'
                }
            }
        })
        .state(qmStates.favorites, {
            url: "/favorites",
            cache: false,
            params: {
                showAds: true,
                reminderFrequency: 0,
                unit: null,
                variableName : null,
                dateTime : null,
                value : null,
                fromUrl : null,
                title: "Favorites",
                ionIcon: ionIcons.star
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/favorites.html",
                    controller: 'FavoritesCtrl'
                }
            }
        })
        .state(qmStates.configurationClientId, {
            cache: true,
            url: "/configuration/:clientId",
            params: {
                title: "App Builder",
                ionIcon: ionIcons.settings
            },
            views: {
                'menuContent': {
                    templateUrl: "../../app-configuration/templates/configuration.html",
                    controller: 'ConfigurationCtrl'
                }
            }
        })
        .state(qmStates.configuration, {
            cache: true,
            url: "/configuration",
            params: {
                title: "App Builder",
                ionIcon: ionIcons.settings
            },
            views: {
                'menuContent': {
                    templateUrl: "../../app-configuration/templates/configuration.html",
                    controller: 'ConfigurationCtrl'
                }
            }
        })
        .state(qmStates.remindersInboxToday, {
            url: "/reminders-inbox-today",
            params: {
                showAds: true,
                unit: null,
                variableName : null,
                dateTime : null,
                value : null,
                fromUrl : null,
                today : true,
                title: "Inbox",
                ionIcon: ionIcons.inbox
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-inbox.html",
                    controller: 'RemindersInboxCtrl'
                }
            }
        })
        .state(qmStates.manageScheduledMeds, {
            url: "/manage-scheduled-meds",
            params: {
                showAds: true,
                title: "Manage Scheduled Meds",
                helpText: "Here you can add and manage your scheduled medications.  Long-press on a medication for more options.  You can drag down to refresh.",
                addButtonText: "Add scheduled medication",
                variableCategoryName : 'Treatments',
                trackingReminders: null,
                ionIcon: ionIcons.reminder
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-manage.html",
                    controller: 'RemindersManageCtrl'
                }
            }
        })
        .state(qmStates.todayMedSchedule, {
            url: "/today-med-schedule",
            params: {
                showAds: true,
                title: "Today's Med Schedule",
                helpText: "Here you can see and record today's scheduled doses.",
                today : true,
                variableCategoryName : 'Treatments',
                ionIcon: ionIcons.reminder
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-inbox.html",
                    controller: 'RemindersInboxCtrl'
                }
            }
        })
        .state(qmStates.asNeededMeds, {
            url: "/as-needed-meds",
            params: {
                showAds: true,
                title: "As Needed Meds",
                variableCategoryName : 'Treatments',
                ionIcon: ionIcons.star
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/favorites.html",
                    controller: 'FavoritesCtrl'
                }
            }
        })
        .state(qmStates.remindersManage, {
            cache: false,
            url: "/reminders-manage",
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-manage.html",
                    controller: 'RemindersManageCtrl'
                }
            },
            params: {
                showAds: true,
                variableCategoryName : null,
                trackingReminders: null,
                title: "Manage Reminders",
                ionIcon: ionIcons.reminder
            }
        })
        .state(qmStates.remindersManageCategory, {
            cache: false,
            url: "/reminders-manage-category/:variableCategoryName",
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-manage.html",
                    controller: 'RemindersManageCtrl'
                }
            },
            params: {
                showAds: true,
                trackingReminders: null,
                title: "Manage Reminders",
                ionIcon: ionIcons.reminder
            }
        })
        .state(qmStates.remindersList, {
            cache: false,
            url: "/reminders-list",
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-list.html",
                    controller: 'RemindersManageCtrl'
                }
            },
            params: {
                showAds: true,
                variableCategoryName : null,
                trackingReminders: null,
                title: "Manage Reminders",
                ionIcon: ionIcons.reminder
            }
        })
        .state(qmStates.remindersListCategory, {
            cache: false,
            url: "/reminders-list-category/:variableCategoryName",
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-list.html",
                    controller: 'RemindersManageCtrl'
                }
            },
            params: {
                showAds: true,
                trackingReminders: null,
                title: "Manage Reminders",
                ionIcon: ionIcons.reminder
            }
        })
        .state(qmStates.variableList, {
            cache: true,
            url: "/variable-list",
            params: {
                showAds: true,
                variableCategoryName : null,
                trackingReminders: null,
                title: "Manage Variables",
                ionIcon: ionIcons.reminder
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-list.html",
                    controller: 'RemindersManageCtrl'
                }
            }
        })
        .state(qmStates.variableListCategory, {
            cache: true,
            url: "/variable-list-category/:variableCategoryName",
            params: {
                showAds: true,
                trackingReminders: null,
                title: "Manage Variables",
                ionIcon: ionIcons.reminder
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminders-list.html",
                    controller: 'RemindersManageCtrl'
                }
            }
        })
        .state(qmStates.reminderAdd, {
            url: "/reminder-add/:variableName",
            cache: false,
            params: {
                doneState: null,
                favorite: false,
                fromState : null,
                fromUrl : null,
                ionIcon: ionIcons.reminder,
                measurement : null,
                reminder : null,
                skipReminderSettingsIfPossible: null,
                stopTrackingDate: null,
                startTrackingData: null,
                title: "Add Reminder",
                trackingReminder : null,
                trackingReminderId : null,
                unitAbbreviatedName: null,
                unitName: null,
                unitId: null,
                variableId : null,
                variableCategoryName : null,
                variableName : null,
                variableObject : null,
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminder-add.html",
                    controller: 'ReminderAddCtrl'
                }
            }
        })
        .state(qmStates.onboarding, {
            url: "/onboarding",
            cache: true,
            params: {
                title: "Getting Started",
                ionIcon: ionIcons.reminder
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/onboarding-page.html",
                    controller: 'OnboardingCtrl'
                }
            }
        })
        .state(qmStates.upgrade, {
            url: "/upgrade",
            cache: true,
            params: {
                litePlanState: null,
                title: "Upgrade",
                ionIcon: ionIcons.star
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/upgrade-page-cards.html",
                    controller: 'UpgradeCtrl'
                }
            }
        })
        .state(qmStates.dataSharing, {
            url: "/data-sharing",
            cache: true,
            params: {
                title: "Manage Data Sharing",
                ionIcon: ionIcons.locked
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/data-sharing-page.html",
                    controller: 'DataSharingCtrl'
                }
            }
        })
        .state(qmStates.tabs, {
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
        .state(qmStates.chat, {
            url: "/chat",
            cache: true,
            params: {
                title: "Talk to Dr. Modo",
                ionIcon: ionIcons.chatbox
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/chat.html",
                    controller: 'ChatCtrl'
                }
            }
        })
        .state(qmStates.feed, {
            url: "/feed",
            cache: true,
            params: {
                title: "Talk to Dr. Modo",
                ionIcon: ionIcons.chatbox
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/feed.html",
                    controller: 'FeedCtrl'
                }
            }
        })
        .state(qmStates.favoriteAdd, {
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
                doneState: null,
                skipReminderSettingsIfPossible: null,
                title: "Add Favorite",
                ionIcon: ionIcons.star
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/reminder-add.html",
                    controller: 'ReminderAddCtrl'
                }
            }
        });

    if (!qm.storage.getItem(qm.items.introSeen)) {
        //console.debug("Intro not seen so setting default route to intro");
        $urlRouterProvider.otherwise('/app/intro');
    } else if (!qm.storage.getItem(qm.items.onboarded)) {
        //console.debug("Not onboarded so setting default route to onboarding");
        $urlRouterProvider.otherwise('/app/onboarding');
    } else {
        //console.debug("Intro seen so setting default route to inbox");
        if(qm.appMode.isBuilder()){
            $urlRouterProvider.otherwise('/app/configuration');
        } else {
            $urlRouterProvider.otherwise('/app/reminders-inbox');
        }
    }
}])
.component("mdFabProgress", {
    template: "<md-button class='md-fab' ng-click='$ctrl.onClick()' ng-class=\"{'is-done': $ctrl.done}\"><md-icon ng-if='!done' class=\"ion-checkmark\" md-font-icon=\"ion-checkmark\"></md-icon><md-icon ng-if='done' class=\"ion-upload\" md-font-icon=\"ion-upload\"></md-icon></md-button><md-progress-circular ng-class=\"{'is-active': $ctrl.active}\" value='{{$ctrl.value}}' md-mode='determinate' md-diameter='68'></md-progress-circular>",
    bindings: {
        "icon": "<",
        "iconDone": "<",
        "value": "<",
        "doAction": "&"
    },
    controller: function($scope) {
        var that = this;
        that.active = false;
        that.done = false;
        that.onClick = function() {
            if (!that.active) {
                that.doAction();
            }
        };
        $scope.$watch(function() {
            return that.value;
        }, function(newValue) {
            if (newValue >= 100) {
                that.done = true;
                that.active = false;
            } else if (newValue == 0) {
                that.done = false;
                that.active = false;
            } else if (!that.active) {
                that.active = true;
            }
        });
    }
});
angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
    return function (exception, cause) {
        if (typeof bugsnag !== "undefined") {
            window.bugsnagClient = bugsnag("ae7bc49d1285848342342bb5c321a2cf");
            bugsnagClient.notify(exception, {diagnostics: {cause: cause}});
        }
    };
});
angular.module('open-chat-framework', [])
.service('ngChatEngine', ['$timeout', function($timeout) {
    this.bind = function(ChatEngine) {
        // updates angular when anything changes
        ChatEngine.onAny(function(event, payload) {
            $timeout(function() {});
        });
    }
}]);
