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
            if(stateName === qm.stateNames.reminderSearch){
                qmService.search.reminderSearch(null, ev, stateParameters.variableCategoryName);
                return;
            }
            if(stateName === qm.stateNames.measurementAddSearch) {
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
        qmService.intro.setIntroSeen(true, "Url params have existingUser or introSeen or refreshUser or designMode");
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
    var isBuilderMode = window.designMode = qm.appMode.isBuilder();
    if(qm.urlHelper.getParam(qm.items.apiUrl)){qm.storage.setItem(qm.items.apiUrl, "https://" + qm.urlHelper.getParam(qm.items.apiUrl));}
    function setupGoogleAnalytics() {
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
    }
    setupGoogleAnalytics();
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
            qm.appsManager.getAppSettingsLocallyOrFromApi(function(appSettings){deferred.resolve(appSettings);});
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
    qm.staticData.states.forEach(function(state){
        if(state.name === ''){return;}
        if(state.name === 'app'){state.resolve = config_resolver;}
        var isBuilderState = state.views && state.views.menuContent.templateUrl.indexOf('configuration') !== -1;
        if(isBuilderState && !isBuilderMode){return;}
        if(isBuilderState && state.views.menuContent.templateUrl.indexOf('builder-templates') === -1){ // TODO: remove once API states.json is updated
            state.views.menuContent.templateUrl =  state.views.menuContent.templateUrl.replace('templates', 'builder-templates');
        }
        $stateProvider.state(state.name, state);
    });
    function setFallbackRoute() {
        if(qm.appMode.isBuilder()){
            $urlRouterProvider.otherwise('/app/configuration');
        } else if (!qm.storage.getItem(qm.items.introSeen)) {
            $urlRouterProvider.otherwise('/app/intro');
        } else if (!qm.storage.getItem(qm.items.onboarded)) {
            $urlRouterProvider.otherwise('/app/onboarding');
        } else {
            $urlRouterProvider.otherwise('/app/reminders-inbox');
        }
    }
    setFallbackRoute();
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