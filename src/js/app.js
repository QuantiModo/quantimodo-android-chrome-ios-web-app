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
        //'angular-google-adsense',
        'ngMaterialDatePicker',
        'ngMaterial',
        'ngMessages',
        'angular-cache',
        'angular-d3-word-cloud',
        'ngFileUpload',
        //'ngOpbeat',
        'angular-web-notification',
        //'ui-iconpicker',
        'ngFitText'
    ]
)
.run(["$ionicPlatform", "$ionicHistory", "$state", "$rootScope", "qmService", "qmLogService",
    function($ionicPlatform, $ionicHistory, $state, $rootScope, qmService, qmLogService) {
    if(!qm.urlHelper.onQMSubDomain()){qm.appsManager.loadPrivateConfigFromJsonFile();}
    qmService.showBlackRingLoader();
    if(qm.urlHelper.getParam('logout')){qm.storage.clear(); qmService.setUser(null);}
    qmService.setPlatformVariables();
    $ionicPlatform.ready(function() {
        //$ionicAnalytics.register();
        if(ionic.Platform.isIPad() || ionic.Platform.isIOS()){
            window.onerror = function (errorMsg, url, lineNumber) {
                errorMsg = 'Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber;
                qmLogService.error(null, errorMsg);
            };
        }
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false); // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs
        }
        if (window.StatusBar) {StatusBar.styleDefault();} // org.apache.cordova.statusbar required
    });
    $rootScope.goToState = function(stateName, stateParameters, ev){
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
        qm.storage.setItem(qm.items.introSeen, true);
        qm.storage.setItem(qm.items.onboarded, true);
    }
}])
.config(["$stateProvider", "$urlRouterProvider", "$compileProvider", "ionicTimePickerProvider", "ionicDatePickerProvider",
    "$ionicConfigProvider", "AnalyticsProvider",
    //"$opbeatProvider",
    function($stateProvider, $urlRouterProvider, $compileProvider, ionicTimePickerProvider, ionicDatePickerProvider,
                 $ionicConfigProvider, AnalyticsProvider
             //, $opbeatProvider
    ) {
    //$opbeatProvider.config({orgId: '10d58117acb546c08a2cae66d650480d', appId: 'fc62a74505'});
    window.debugMode = (qm.urlHelper.getParam('debug') || qm.urlHelper.getParam('debugMode'));
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
            qm.appsManager.getAppSettingsLocallyOrFromApi(function(appSettings){
                deferred.resolve(appSettings);
            });
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
        "configuration": "app.configuration",
        "configurationClientId": "app.configurationClientId",
        "contact": "app.contact",
        "favoriteAdd": "app.favoriteAdd",
        "favorites": "app.favorites",
        "favoriteSearch": "app.favoriteSearch",
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
                fromUrl : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/login-page.html",
                    controller: 'LoginCtrl'
                }
            }
        })
        .state(qmStates.intro, {
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
        .state(qmStates.track, {
            url: "/track",
            cache: false,
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
                doneState: null
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
                doneState: null
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
                doneState: null
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
                trackingReminder: null,
                reminderNotification: null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                variableName: null,
                currentMeasurementHistory: null
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
        .state(qmStates.variableSettings, {
            url: "/variable-settings",
            cache: false,
            params: {
                reminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                variableName : null,
                variableId : null
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
                reminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                variableName : null
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
                native: true
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
                hideNavigationMenu: null
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
                hideNavigationMenu: null
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
                doneState: null
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
                doneState: null
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
        .state(qmStates.outcomeSearch, {
            url: "/outcome-search",
            cache: false,
            params: {
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
                hideNavigationMenu: null
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
                variableCategoryName: null,
                nextState: qmStates.predictorsAll,
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
        .state(qmStates.searchVariablesWithCommonPredictors, {
            url: "/search-variables-with-common-predictors",
            cache: false,
            params: {
                variableCategoryName: null,
                nextState: qmStates.predictorsAll,
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
        .state(qmStates.charts, {
            url: "/charts/:variableName",
            cache: false,
            params: {
                trackingReminder : null,
                variableObject: null,
                measurementInfo: null,
                noReload: false,
                fromState : null,
                fromUrl : null,
                refresh: null
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
                aggregated: null,
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
        .state(qmStates.predictorsAll, {
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
        .state(qmStates.outcomesAll, {
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
        .state(qmStates.predictorsPositive, {
            url: "/predictors-positive",
            params: {
                aggregated: false,
                valence: 'positive',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
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
        .state(qmStates.predictorsPositiveVariable, {
            url: "/predictors-positive-variable/:effectVariableName",
            params: {
                aggregated: false,
                valence: 'positive',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
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
        .state(qmStates.predictorsNegative, {
            url: "/predictors-negative",
            params: {
                aggregated: false,
                valence: 'negative',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
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
        .state(qmStates.predictorsNegativeVariable, {
            url: "/predictors-negative-variable/:effectVariableName",
            params: {
                aggregated: false,
                valence: 'negative',
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
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
        .state(qmStates.predictorsUser, {
            url: "/predictors/user/:effectVariableName",
            params: {
                aggregated: false,
                variableObject : null,
                causeVariableName: null,
                effectVariableName: null,
                fallBackToPrimaryOutcome: true,
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
        .state(qmStates.predictorsAggregated, {
            url: "/predictors/aggregated/:effectVariableName",
            params: {
                aggregated: true,
                variableObject : null,
                fallBackToPrimaryOutcome: true,
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
        .state(qmStates.study, {
            cache: true,
            url: "/study",
            params: {
                correlationObject: null,
                causeVariableName: null,
                effectVariableName: null,
                refresh: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/study-page.html",
                    controller: 'StudyCtrl'
                }
            }
        })
        .state(qmStates.studyJoin, {
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
        .state(qmStates.studyCreation, {
            cache: false,
            url: "/study-creation",
            params: {
                correlationObject: null,
                causeVariable: null,
                effectVariable: null
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
            views: {
                'menuContent': {
                    templateUrl: "templates/settings.html",
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state(qmStates.notificationPreferences, {
            url: "/notificationPreferences",
            views: {
                'menuContent': {
                    templateUrl: "templates/notification-preferences.html",
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state(qmStates.map, {
            url: "/map",
            views: {
                'menuContent': {
                    templateUrl: "templates/map.html",
                    controller: 'MapCtrl'
                }
            }
        })
        .state(qmStates.help, {
            url: "/help",
            views: {
                'menuContent': {
                    templateUrl: "templates/help.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        .state(qmStates.feedback, {
            url: "/feedback",
            views: {
                'menuContent': {
                    templateUrl: "templates/feedback.html",
                    controller: 'ExternalCtrl'
                }
            }
        })
        .state(qmStates.contact, {
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
                updatedMeasurementHistory: null,
                variableObject : null,
                refresh: null,
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
        .state(qmStates.historyAll, {
            url: "/history-all",
            cache: true,
            params: {
                variableCategoryName: null,
                connectorName: null,
                sourceName: null,
                updatedMeasurementHistory: null,
                refresh: null
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
                updatedMeasurementHistory: null,
                refresh: null
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
                variableObject : null,
                updatedMeasurementHistory: null,
                refresh: null
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
                hideNavigationMenu: true
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
        .state(qmStates.configurationClientId, {
            cache: true,
            url: "/configuration/:clientId",
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
        .state(qmStates.manageScheduledMeds, {
            url: "/manage-scheduled-meds",
            params: {
                title: "Manage Scheduled Meds",
                helpText: "Here you can add and manage your scheduled medications.  Long-press on a medication for more options.  You can drag down to refresh.",
                addButtonText: "Add scheduled medication",
                variableCategoryName : 'Treatments',
                trackingReminders: null
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
        .state(qmStates.asNeededMeds, {
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
                variableCategoryName : null,
                trackingReminders: null
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
                trackingReminders: null
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
                variableCategoryName : null,
                trackingReminders: null
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
                trackingReminders: null
            }
        })
        .state(qmStates.variableList, {
            cache: true,
            url: "/variable-list",
            params: {
                variableCategoryName : null,
                trackingReminders: null
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
                trackingReminders: null
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
                variableCategoryName : null,
                variableName : null,
                reminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                favorite: false,
                doneState: null,
                skipReminderSettingsIfPossible: null
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
            params: { },
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
                litePlanState: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/upgrade-page-cards.html",
                    controller: 'UpgradeCtrl'
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
                skipReminderSettingsIfPossible: null
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
        $urlRouterProvider.otherwise('/app/reminders-inbox');
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
