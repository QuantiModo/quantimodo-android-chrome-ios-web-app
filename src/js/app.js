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
        qmService.intro.setIntroSeen(true, "Url parms have existingUser or introSeen or refreshUser or desingMode");
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
    window.ionIcons = {
        history: 'ion-ios-list-outline',
        reminder: 'ion-android-notifications-none',
        recordMeasurement: 'ion-compose',
        charts: 'ion-arrow-graph-up-right',
        predictors: 'ion-log-in',
        outcomes: 'ion-log-out',
        study: 'ion-ios-book',
        discoveries: 'ion-ios-analytics',
        inbox: 'ion-android-inbox',
        importData: 'ion-ios-cloud-download-outline',
        login: 'ion-log-in',
        tag: 'ion-pricetag',
        alert: "ion-alert",
        alertCircled: "ion-alert-circled",
        androidAdd: "ion-android-add",
        androidAddCircle: "ion-android-add-circle",
        androidAlarmClock: "ion-android-alarm-clock",
        androidAlert: "ion-android-alert",
        androidApps: "ion-android-apps",
        androidArchive: "ion-android-archive",
        androidArrowBack: "ion-android-arrow-back",
        androidArrowDown: "ion-android-arrow-down",
        androidArrowDropdown: "ion-android-arrow-dropdown",
        androidArrowDropdownCircle: "ion-android-arrow-dropdown-circle",
        androidArrowDropleft: "ion-android-arrow-dropleft",
        androidArrowDropleftCircle: "ion-android-arrow-dropleft-circle",
        androidArrowDropright: "ion-android-arrow-dropright",
        androidArrowDroprightCircle: "ion-android-arrow-dropright-circle",
        androidArrowDropup: "ion-android-arrow-dropup",
        androidArrowDropupCircle: "ion-android-arrow-dropup-circle",
        androidArrowForward: "ion-android-arrow-forward",
        androidArrowUp: "ion-android-arrow-up",
        androidAttach: "ion-android-attach",
        androidBar: "ion-android-bar",
        androidBicycle: "ion-android-bicycle",
        androidBoat: "ion-android-boat",
        androidBookmark: "ion-android-bookmark",
        androidBulb: "ion-android-bulb",
        androidBus: "ion-android-bus",
        androidCalendar: "ion-android-calendar",
        androidCall: "ion-android-call",
        androidCamera: "ion-android-camera",
        androidCancel: "ion-android-cancel",
        androidCar: "ion-android-car",
        androidCart: "ion-android-cart",
        androidChat: "ion-android-chat",
        androidCheckbox: "ion-android-checkbox",
        androidCheckboxBlank: "ion-android-checkbox-blank",
        androidCheckboxOutline: "ion-android-checkbox-outline",
        androidCheckboxOutlineBlank: "ion-android-checkbox-outline-blank",
        androidCheckmarkCircle: "ion-android-checkmark-circle",
        androidClipboard: "ion-android-clipboard",
        androidClose: "ion-android-close",
        androidCloud: "ion-android-cloud",
        androidCloudCircle: "ion-android-cloud-circle",
        androidCloudDone: "ion-android-cloud-done",
        androidCloudOutline: "ion-android-cloud-outline",
        androidColorPalette: "ion-android-color-palette",
        androidCompass: "ion-android-compass",
        androidContact: "ion-android-contact",
        androidContacts: "ion-android-contacts",
        androidContract: "ion-android-contract",
        androidCreate: "ion-android-create",
        androidDelete: "ion-android-delete",
        androidDesktop: "ion-android-desktop",
        androidDocument: "ion-android-document",
        androidDone: "ion-android-done",
        androidDoneAll: "ion-android-done-all",
        androidDownload: "ion-android-download",
        androidDrafts: "ion-android-drafts",
        androidExit: "ion-android-exit",
        androidExpand: "ion-android-expand",
        androidFavorite: "ion-android-favorite",
        androidFavoriteOutline: "ion-android-favorite-outline",
        androidFilm: "ion-android-film",
        androidFolder: "ion-android-folder",
        androidFolderOpen: "ion-android-folder-open",
        androidFunnel: "ion-android-funnel",
        androidGlobe: "ion-android-globe",
        androidHand: "ion-android-hand",
        androidHangout: "ion-android-hangout",
        androidHappy: "ion-android-happy",
        androidHome: "ion-android-home",
        androidImage: "ion-android-image",
        androidLaptop: "ion-android-laptop",
        androidList: "ion-android-list",
        androidLocate: "ion-android-locate",
        androidLock: "ion-android-lock",
        androidMail: "ion-android-mail",
        androidMap: "ion-android-map",
        androidMenu: "ion-android-menu",
        androidMicrophone: "ion-android-microphone",
        androidMicrophoneOff: "ion-android-microphone-off",
        androidMoreHorizontal: "ion-android-more-horizontal",
        androidMoreVertical: "ion-android-more-vertical",
        androidNavigate: "ion-android-navigate",
        androidNotifications: "ion-android-notifications",
        androidNotificationsNone: "ion-android-notifications-none",
        androidNotificationsOff: "ion-android-notifications-off",
        androidOpen: "ion-android-open",
        androidOptions: "ion-android-options",
        androidPeople: "ion-android-people",
        androidPerson: "ion-android-person",
        androidPersonAdd: "ion-android-person-add",
        androidPhoneLandscape: "ion-android-phone-landscape",
        androidPhonePortrait: "ion-android-phone-portrait",
        androidPin: "ion-android-pin",
        androidPlane: "ion-android-plane",
        androidPlaystore: "ion-android-playstore",
        androidPrint: "ion-android-print",
        androidRadioButtonOff: "ion-android-radio-button-off",
        androidRadioButtonOn: "ion-android-radio-button-on",
        androidRefresh: "ion-android-refresh",
        androidRemove: "ion-android-remove",
        androidRemoveCircle: "ion-android-remove-circle",
        androidRestaurant: "ion-android-restaurant",
        androidSad: "ion-android-sad",
        androidSearch: "ion-android-search",
        androidSend: "ion-android-send",
        androidSettings: "ion-android-settings",
        androidShare: "ion-android-share",
        androidShareAlt: "ion-android-share-alt",
        androidStar: "ion-android-star",
        androidStarHalf: "ion-android-star-half",
        androidStarOutline: "ion-android-star-outline",
        androidStopwatch: "ion-android-stopwatch",
        androidSubway: "ion-android-subway",
        androidSunny: "ion-android-sunny",
        androidSync: "ion-android-sync",
        androidTextsms: "ion-android-textsms",
        androidTime: "ion-android-time",
        androidTrain: "ion-android-train",
        androidUnlock: "ion-android-unlock",
        androidUpload: "ion-android-upload",
        androidVolumeDown: "ion-android-volume-down",
        androidVolumeMute: "ion-android-volume-mute",
        androidVolumeOff: "ion-android-volume-off",
        androidVolumeUp: "ion-android-volume-up",
        androidWalk: "ion-android-walk",
        androidWarning: "ion-android-warning",
        androidWatch: "ion-android-watch",
        androidWifi: "ion-android-wifi",
        aperture: "ion-aperture",
        archive: "ion-archive",
        arrowDownA: "ion-arrow-down-a",
        arrowDownB: "ion-arrow-down-b",
        arrowDownC: "ion-arrow-down-c",
        arrowExpand: "ion-arrow-expand",
        arrowGraphDownLeft: "ion-arrow-graph-down-left",
        arrowGraphDownRight: "ion-arrow-graph-down-right",
        arrowGraphUpLeft: "ion-arrow-graph-up-left",
        arrowGraphUpRight: "ion-arrow-graph-up-right",
        arrowLeftA: "ion-arrow-left-a",
        arrowLeftB: "ion-arrow-left-b",
        arrowLeftC: "ion-arrow-left-c",
        arrowMove: "ion-arrow-move",
        arrowResize: "ion-arrow-resize",
        arrowReturnLeft: "ion-arrow-return-left",
        arrowReturnRight: "ion-arrow-return-right",
        arrowRightA: "ion-arrow-right-a",
        arrowRightB: "ion-arrow-right-b",
        arrowRightC: "ion-arrow-right-c",
        arrowShrink: "ion-arrow-shrink",
        arrowSwap: "ion-arrow-swap",
        arrowUpA: "ion-arrow-up-a",
        arrowUpB: "ion-arrow-up-b",
        arrowUpC: "ion-arrow-up-c",
        asterisk: "ion-asterisk",
        at: "ion-at",
        backspace: "ion-backspace",
        backspaceOutline: "ion-backspace-outline",
        bag: "ion-bag",
        batteryCharging: "ion-battery-charging",
        batteryEmpty: "ion-battery-empty",
        batteryFull: "ion-battery-full",
        batteryHalf: "ion-battery-half",
        batteryLow: "ion-battery-low",
        beaker: "ion-beaker",
        beer: "ion-beer",
        bluetooth: "ion-bluetooth",
        bonfire: "ion-bonfire",
        bookmark: "ion-bookmark",
        bowtie: "ion-bowtie",
        briefcase: "ion-briefcase",
        bug: "ion-bug",
        calculator: "ion-calculator",
        calendar: "ion-calendar",
        camera: "ion-camera",
        card: "ion-card",
        cash: "ion-cash",
        chatbox: "ion-chatbox",
        chatboxWorking: "ion-chatbox-working",
        chatboxes: "ion-chatboxes",
        chatbubble: "ion-chatbubble",
        chatbubbleWorking: "ion-chatbubble-working",
        chatbubbles: "ion-chatbubbles",
        checkmark: "ion-checkmark",
        checkmarkCircled: "ion-checkmark-circled",
        checkmarkRound: "ion-checkmark-round",
        chevronDown: "ion-chevron-down",
        chevronLeft: "ion-chevron-left",
        chevronRight: "ion-chevron-right",
        chevronUp: "ion-chevron-up",
        clipboard: "ion-clipboard",
        clock: "ion-clock",
        close: "ion-close",
        closeCircled: "ion-close-circled",
        closeRound: "ion-close-round",
        closedCaptioning: "ion-closed-captioning",
        cloud: "ion-cloud",
        code: "ion-code",
        codeDownload: "ion-code-download",
        codeWorking: "ion-code-working",
        coffee: "ion-coffee",
        compass: "ion-compass",
        compose: "ion-compose",
        connectionBars: "ion-connection-bars",
        contrast: "ion-contrast",
        crop: "ion-crop",
        cube: "ion-cube",
        disc: "ion-disc",
        document: "ion-document",
        documentText: "ion-document-text",
        drag: "ion-drag",
        earth: "ion-earth",
        easel: "ion-easel",
        edit: "ion-edit",
        egg: "ion-egg",
        eject: "ion-eject",
        email: "ion-email",
        emailUnread: "ion-email-unread",
        erlenmeyerFlask: "ion-erlenmeyer-flask",
        eye: "ion-eye",
        eyeDisabled: "ion-eye-disabled",
        female: "ion-female",
        filing: "ion-filing",
        filmMarker: "ion-film-marker",
        fireball: "ion-fireball",
        flag: "ion-flag",
        flame: "ion-flame",
        flash: "ion-flash",
        flashOff: "ion-flash-off",
        folder: "ion-folder",
        fork: "ion-fork",
        forkRepo: "ion-fork-repo",
        forward: "ion-forward",
        funnel: "ion-funnel",
        gearA: "ion-gear-a",
        gearB: "ion-gear-b",
        grid: "ion-grid",
        hammer: "ion-hammer",
        happy: "ion-happy",
        happyOutline: "ion-happy-outline",
        headphone: "ion-headphone",
        heart: "ion-heart",
        heartBroken: "ion-heart-broken",
        help: "ion-help",
        helpBuoy: "ion-help-buoy",
        helpCircled: "ion-help-circled",
        home: "ion-home",
        icecream: "ion-icecream",
        image: "ion-image",
        images: "ion-images",
        information: "ion-information",
        informationCircled: "ion-information-circled",
        ionic: "ion-ionic",
        iosAlarm: "ion-ios-alarm",
        iosAlarmOutline: "ion-ios-alarm-outline",
        iosAlbums: "ion-ios-albums",
        iosAlbumsOutline: "ion-ios-albums-outline",
        iosAmericanfootball: "ion-ios-americanfootball",
        iosAmericanfootballOutline: "ion-ios-americanfootball-outline",
        iosAnalytics: "ion-ios-analytics",
        iosAnalyticsOutline: "ion-ios-analytics-outline",
        iosArrowBack: "ion-ios-arrow-back",
        iosArrowDown: "ion-ios-arrow-down",
        iosArrowForward: "ion-ios-arrow-forward",
        iosArrowLeft: "ion-ios-arrow-left",
        iosArrowRight: "ion-ios-arrow-right",
        iosArrowThinDown: "ion-ios-arrow-thin-down",
        iosArrowThinLeft: "ion-ios-arrow-thin-left",
        iosArrowThinRight: "ion-ios-arrow-thin-right",
        iosArrowThinUp: "ion-ios-arrow-thin-up",
        iosArrowUp: "ion-ios-arrow-up",
        iosAt: "ion-ios-at",
        iosAtOutline: "ion-ios-at-outline",
        iosBarcode: "ion-ios-barcode",
        iosBarcodeOutline: "ion-ios-barcode-outline",
        iosBaseball: "ion-ios-baseball",
        iosBaseballOutline: "ion-ios-baseball-outline",
        iosBasketball: "ion-ios-basketball",
        iosBasketballOutline: "ion-ios-basketball-outline",
        iosBell: "ion-ios-bell",
        iosBellOutline: "ion-ios-bell-outline",
        iosBody: "ion-ios-body",
        iosBodyOutline: "ion-ios-body-outline",
        iosBolt: "ion-ios-bolt",
        iosBoltOutline: "ion-ios-bolt-outline",
        iosBook: "ion-ios-book",
        iosBookOutline: "ion-ios-book-outline",
        iosBookmarks: "ion-ios-bookmarks",
        iosBookmarksOutline: "ion-ios-bookmarks-outline",
        iosBox: "ion-ios-box",
        iosBoxOutline: "ion-ios-box-outline",
        iosBriefcase: "ion-ios-briefcase",
        iosBriefcaseOutline: "ion-ios-briefcase-outline",
        iosBrowsers: "ion-ios-browsers",
        iosBrowsersOutline: "ion-ios-browsers-outline",
        iosCalculator: "ion-ios-calculator",
        iosCalculatorOutline: "ion-ios-calculator-outline",
        iosCalendar: "ion-ios-calendar",
        iosCalendarOutline: "ion-ios-calendar-outline",
        iosCamera: "ion-ios-camera",
        iosCameraOutline: "ion-ios-camera-outline",
        iosCart: "ion-ios-cart",
        iosCartOutline: "ion-ios-cart-outline",
        iosChatboxes: "ion-ios-chatboxes",
        iosChatboxesOutline: "ion-ios-chatboxes-outline",
        iosChatbubble: "ion-ios-chatbubble",
        iosChatbubbleOutline: "ion-ios-chatbubble-outline",
        iosCheckmark: "ion-ios-checkmark",
        iosCheckmarkEmpty: "ion-ios-checkmark-empty",
        iosCheckmarkOutline: "ion-ios-checkmark-outline",
        iosCircleFilled: "ion-ios-circle-filled",
        iosCircleOutline: "ion-ios-circle-outline",
        iosClock: "ion-ios-clock",
        iosClockOutline: "ion-ios-clock-outline",
        iosClose: "ion-ios-close",
        iosCloseEmpty: "ion-ios-close-empty",
        iosCloseOutline: "ion-ios-close-outline",
        iosCloud: "ion-ios-cloud",
        iosCloudDownload: "ion-ios-cloud-download",
        iosCloudDownloadOutline: "ion-ios-cloud-download-outline",
        iosCloudOutline: "ion-ios-cloud-outline",
        iosCloudUpload: "ion-ios-cloud-upload",
        iosCloudUploadOutline: "ion-ios-cloud-upload-outline",
        iosCloudy: "ion-ios-cloudy",
        iosCloudyNight: "ion-ios-cloudy-night",
        iosCloudyNightOutline: "ion-ios-cloudy-night-outline",
        iosCloudyOutline: "ion-ios-cloudy-outline",
        iosCog: "ion-ios-cog",
        iosCogOutline: "ion-ios-cog-outline",
        iosColorFilter: "ion-ios-color-filter",
        iosColorFilterOutline: "ion-ios-color-filter-outline",
        iosColorWand: "ion-ios-color-wand",
        iosColorWandOutline: "ion-ios-color-wand-outline",
        iosCompose: "ion-ios-compose",
        iosComposeOutline: "ion-ios-compose-outline",
        iosCopy: "ion-ios-copy",
        iosCopyOutline: "ion-ios-copy-outline",
        iosCrop: "ion-ios-crop",
        iosCropStrong: "ion-ios-crop-strong",
        iosDownload: "ion-ios-download",
        iosDownloadOutline: "ion-ios-download-outline",
        iosDrag: "ion-ios-drag",
        iosEmail: "ion-ios-email",
        iosEmailOutline: "ion-ios-email-outline",
        iosEye: "ion-ios-eye",
        iosEyeOutline: "ion-ios-eye-outline",
        iosFastforward: "ion-ios-fastforward",
        iosFastforwardOutline: "ion-ios-fastforward-outline",
        iosFiling: "ion-ios-filing",
        iosFilingOutline: "ion-ios-filing-outline",
        iosFilm: "ion-ios-film",
        iosFilmOutline: "ion-ios-film-outline",
        iosFlag: "ion-ios-flag",
        iosFlagOutline: "ion-ios-flag-outline",
        iosFlame: "ion-ios-flame",
        iosFlameOutline: "ion-ios-flame-outline",
        iosFlask: "ion-ios-flask",
        iosFlaskOutline: "ion-ios-flask-outline",
        iosFlower: "ion-ios-flower",
        iosFlowerOutline: "ion-ios-flower-outline",
        iosFolder: "ion-ios-folder",
        iosFolderOutline: "ion-ios-folder-outline",
        iosFootball: "ion-ios-football",
        iosFootballOutline: "ion-ios-football-outline",
        iosGameControllerA: "ion-ios-game-controller-a",
        iosGameControllerAOutline: "ion-ios-game-controller-a-outline",
        iosGameControllerB: "ion-ios-game-controller-b",
        iosGameControllerBOutline: "ion-ios-game-controller-b-outline",
        iosGear: "ion-ios-gear",
        iosGearOutline: "ion-ios-gear-outline",
        iosGlasses: "ion-ios-glasses",
        iosGlassesOutline: "ion-ios-glasses-outline",
        iosGridView: "ion-ios-grid-view",
        iosGridViewOutline: "ion-ios-grid-view-outline",
        iosHeart: "ion-ios-heart",
        iosHeartOutline: "ion-ios-heart-outline",
        iosHelp: "ion-ios-help",
        iosHelpEmpty: "ion-ios-help-empty",
        iosHelpOutline: "ion-ios-help-outline",
        iosHome: "ion-ios-home",
        iosHomeOutline: "ion-ios-home-outline",
        iosInfinite: "ion-ios-infinite",
        iosInfiniteOutline: "ion-ios-infinite-outline",
        iosInformation: "ion-ios-information",
        iosInformationEmpty: "ion-ios-information-empty",
        iosInformationOutline: "ion-ios-information-outline",
        iosIonicOutline: "ion-ios-ionic-outline",
        iosKeypad: "ion-ios-keypad",
        iosKeypadOutline: "ion-ios-keypad-outline",
        iosLightbulb: "ion-ios-lightbulb",
        iosLightbulbOutline: "ion-ios-lightbulb-outline",
        iosList: "ion-ios-list",
        iosListOutline: "ion-ios-list-outline",
        iosLocation: "ion-ios-location",
        iosLocationOutline: "ion-ios-location-outline",
        iosLocked: "ion-ios-locked",
        iosLockedOutline: "ion-ios-locked-outline",
        iosLoop: "ion-ios-loop",
        iosLoopStrong: "ion-ios-loop-strong",
        iosMedical: "ion-ios-medical",
        iosMedicalOutline: "ion-ios-medical-outline",
        iosMedkit: "ion-ios-medkit",
        iosMedkitOutline: "ion-ios-medkit-outline",
        iosMic: "ion-ios-mic",
        iosMicOff: "ion-ios-mic-off",
        iosMicOutline: "ion-ios-mic-outline",
        iosMinus: "ion-ios-minus",
        iosMinusEmpty: "ion-ios-minus-empty",
        iosMinusOutline: "ion-ios-minus-outline",
        iosMonitor: "ion-ios-monitor",
        iosMonitorOutline: "ion-ios-monitor-outline",
        iosMoon: "ion-ios-moon",
        iosMoonOutline: "ion-ios-moon-outline",
        iosMore: "ion-ios-more",
        iosMoreOutline: "ion-ios-more-outline",
        iosMusicalNote: "ion-ios-musical-note",
        iosMusicalNotes: "ion-ios-musical-notes",
        iosNavigate: "ion-ios-navigate",
        iosNavigateOutline: "ion-ios-navigate-outline",
        iosNutrition: "ion-ios-nutrition",
        iosNutritionOutline: "ion-ios-nutrition-outline",
        iosPaper: "ion-ios-paper",
        iosPaperOutline: "ion-ios-paper-outline",
        iosPaperplane: "ion-ios-paperplane",
        iosPaperplaneOutline: "ion-ios-paperplane-outline",
        iosPartlysunny: "ion-ios-partlysunny",
        iosPartlysunnyOutline: "ion-ios-partlysunny-outline",
        iosPause: "ion-ios-pause",
        iosPauseOutline: "ion-ios-pause-outline",
        iosPaw: "ion-ios-paw",
        iosPawOutline: "ion-ios-paw-outline",
        iosPeople: "ion-ios-people",
        iosPeopleOutline: "ion-ios-people-outline",
        iosPerson: "ion-ios-person",
        iosPersonOutline: "ion-ios-person-outline",
        iosPersonadd: "ion-ios-personadd",
        iosPersonaddOutline: "ion-ios-personadd-outline",
        iosPhotos: "ion-ios-photos",
        iosPhotosOutline: "ion-ios-photos-outline",
        iosPie: "ion-ios-pie",
        iosPieOutline: "ion-ios-pie-outline",
        iosPint: "ion-ios-pint",
        iosPintOutline: "ion-ios-pint-outline",
        iosPlay: "ion-ios-play",
        iosPlayOutline: "ion-ios-play-outline",
        iosPlus: "ion-ios-plus",
        iosPlusEmpty: "ion-ios-plus-empty",
        iosPlusOutline: "ion-ios-plus-outline",
        iosPricetag: "ion-ios-pricetag",
        iosPricetagOutline: "ion-ios-pricetag-outline",
        iosPricetags: "ion-ios-pricetags",
        iosPricetagsOutline: "ion-ios-pricetags-outline",
        iosPrinter: "ion-ios-printer",
        iosPrinterOutline: "ion-ios-printer-outline",
        iosPulse: "ion-ios-pulse",
        iosPulseStrong: "ion-ios-pulse-strong",
        iosRainy: "ion-ios-rainy",
        iosRainyOutline: "ion-ios-rainy-outline",
        iosRecording: "ion-ios-recording",
        iosRecordingOutline: "ion-ios-recording-outline",
        iosRedo: "ion-ios-redo",
        iosRedoOutline: "ion-ios-redo-outline",
        iosRefresh: "ion-ios-refresh",
        iosRefreshEmpty: "ion-ios-refresh-empty",
        iosRefreshOutline: "ion-ios-refresh-outline",
        iosReload: "ion-ios-reload",
        iosReverseCamera: "ion-ios-reverse-camera",
        iosReverseCameraOutline: "ion-ios-reverse-camera-outline",
        iosRewind: "ion-ios-rewind",
        iosRewindOutline: "ion-ios-rewind-outline",
        iosRose: "ion-ios-rose",
        iosRoseOutline: "ion-ios-rose-outline",
        iosSearch: "ion-ios-search",
        iosSearchStrong: "ion-ios-search-strong",
        iosSettings: "ion-ios-settings",
        iosSettingsStrong: "ion-ios-settings-strong",
        iosShuffle: "ion-ios-shuffle",
        iosShuffleStrong: "ion-ios-shuffle-strong",
        iosSkipbackward: "ion-ios-skipbackward",
        iosSkipbackwardOutline: "ion-ios-skipbackward-outline",
        iosSkipforward: "ion-ios-skipforward",
        iosSkipforwardOutline: "ion-ios-skipforward-outline",
        iosSnowy: "ion-ios-snowy",
        iosSpeedometer: "ion-ios-speedometer",
        iosSpeedometerOutline: "ion-ios-speedometer-outline",
        iosStar: "ion-ios-star",
        iosStarHalf: "ion-ios-star-half",
        iosStarOutline: "ion-ios-star-outline",
        iosStopwatch: "ion-ios-stopwatch",
        iosStopwatchOutline: "ion-ios-stopwatch-outline",
        iosSunny: "ion-ios-sunny",
        iosSunnyOutline: "ion-ios-sunny-outline",
        iosTelephone: "ion-ios-telephone",
        iosTelephoneOutline: "ion-ios-telephone-outline",
        iosTennisball: "ion-ios-tennisball",
        iosTennisballOutline: "ion-ios-tennisball-outline",
        iosThunderstorm: "ion-ios-thunderstorm",
        iosThunderstormOutline: "ion-ios-thunderstorm-outline",
        iosTime: "ion-ios-time",
        iosTimeOutline: "ion-ios-time-outline",
        iosTimer: "ion-ios-timer",
        iosTimerOutline: "ion-ios-timer-outline",
        iosToggle: "ion-ios-toggle",
        iosToggleOutline: "ion-ios-toggle-outline",
        iosTrash: "ion-ios-trash",
        iosTrashOutline: "ion-ios-trash-outline",
        iosUndo: "ion-ios-undo",
        iosUndoOutline: "ion-ios-undo-outline",
        iosUnlocked: "ion-ios-unlocked",
        iosUnlockedOutline: "ion-ios-unlocked-outline",
        iosUpload: "ion-ios-upload",
        iosUploadOutline: "ion-ios-upload-outline",
        iosVideocam: "ion-ios-videocam",
        iosVideocamOutline: "ion-ios-videocam-outline",
        iosVolumeHigh: "ion-ios-volume-high",
        iosVolumeLow: "ion-ios-volume-low",
        iosWineglass: "ion-ios-wineglass",
        iosWineglassOutline: "ion-ios-wineglass-outline",
        iosWorld: "ion-ios-world",
        iosWorldOutline: "ion-ios-world-outline",
        ipad: "ion-ipad",
        iphone: "ion-iphone",
        ipod: "ion-ipod",
        jet: "ion-jet",
        key: "ion-key",
        knife: "ion-knife",
        laptop: "ion-laptop",
        leaf: "ion-leaf",
        levels: "ion-levels",
        lightbulb: "ion-lightbulb",
        link: "ion-link",
        loadA: "ion-load-a",
        loadB: "ion-load-b",
        loadC: "ion-load-c",
        loadD: "ion-load-d",
        location: "ion-location",
        lockCombination: "ion-lock-combination",
        locked: "ion-locked",
        logIn: "ion-log-in",
        logOut: "ion-log-out",
        loop: "ion-loop",
        magnet: "ion-magnet",
        male: "ion-male",
        man: "ion-man",
        map: "ion-map",
        medkit: "ion-medkit",
        merge: "ion-merge",
        micA: "ion-mic-a",
        micB: "ion-mic-b",
        micC: "ion-mic-c",
        minus: "ion-minus",
        minusCircled: "ion-minus-circled",
        minusRound: "ion-minus-round",
        modelS: "ion-model-s",
        monitor: "ion-monitor",
        more: "ion-more",
        mouse: "ion-mouse",
        musicNote: "ion-music-note",
        navicon: "ion-navicon",
        naviconRound: "ion-navicon-round",
        navigate: "ion-navigate",
        network: "ion-network",
        noSmoking: "ion-no-smoking",
        nuclear: "ion-nuclear",
        outlet: "ion-outlet",
        paintbrush: "ion-paintbrush",
        paintbucket: "ion-paintbucket",
        paperAirplane: "ion-paper-airplane",
        paperclip: "ion-paperclip",
        pause: "ion-pause",
        person: "ion-person",
        personAdd: "ion-person-add",
        personStalker: "ion-person-stalker",
        pieGraph: "ion-pie-graph",
        pin: "ion-pin",
        pinpoint: "ion-pinpoint",
        pizza: "ion-pizza",
        plane: "ion-plane",
        planet: "ion-planet",
        play: "ion-play",
        playstation: "ion-playstation",
        plus: "ion-plus",
        plusCircled: "ion-plus-circled",
        plusRound: "ion-plus-round",
        podium: "ion-podium",
        pound: "ion-pound",
        power: "ion-power",
        pricetag: "ion-pricetag",
        pricetags: "ion-pricetags",
        printer: "ion-printer",
        pullRequest: "ion-pull-request",
        qrScanner: "ion-qr-scanner",
        quote: "ion-quote",
        radioWaves: "ion-radio-waves",
        record: "ion-record",
        refresh: "ion-refresh",
        reply: "ion-reply",
        replyAll: "ion-reply-all",
        ribbonA: "ion-ribbon-a",
        ribbonB: "ion-ribbon-b",
        sad: "ion-sad",
        sadOutline: "ion-sad-outline",
        scissors: "ion-scissors",
        search: "ion-search",
        settings: "ion-settings",
        share: "ion-share",
        shuffle: "ion-shuffle",
        skipBackward: "ion-skip-backward",
        skipForward: "ion-skip-forward",
        socialAndroid: "ion-social-android",
        socialAndroidOutline: "ion-social-android-outline",
        socialAngular: "ion-social-angular",
        socialAngularOutline: "ion-social-angular-outline",
        socialApple: "ion-social-apple",
        socialAppleOutline: "ion-social-apple-outline",
        socialBitcoin: "ion-social-bitcoin",
        socialBitcoinOutline: "ion-social-bitcoin-outline",
        socialBuffer: "ion-social-buffer",
        socialBufferOutline: "ion-social-buffer-outline",
        socialChrome: "ion-social-chrome",
        socialChromeOutline: "ion-social-chrome-outline",
        socialCodepen: "ion-social-codepen",
        socialCodepenOutline: "ion-social-codepen-outline",
        socialCss3: "ion-social-css3",
        socialCss3Outline: "ion-social-css3-outline",
        socialDesignernews: "ion-social-designernews",
        socialDesignernewsOutline: "ion-social-designernews-outline",
        socialDribbble: "ion-social-dribbble",
        socialDribbbleOutline: "ion-social-dribbble-outline",
        socialDropbox: "ion-social-dropbox",
        socialDropboxOutline: "ion-social-dropbox-outline",
        socialEuro: "ion-social-euro",
        socialEuroOutline: "ion-social-euro-outline",
        socialFacebook: "ion-social-facebook",
        socialFacebookOutline: "ion-social-facebook-outline",
        socialFoursquare: "ion-social-foursquare",
        socialFoursquareOutline: "ion-social-foursquare-outline",
        socialFreebsdDevil: "ion-social-freebsd-devil",
        socialGithub: "ion-social-github",
        socialGithubOutline: "ion-social-github-outline",
        socialGoogle: "ion-social-google",
        socialGoogleOutline: "ion-social-google-outline",
        socialGoogleplus: "ion-social-googleplus",
        socialGoogleplusOutline: "ion-social-googleplus-outline",
        socialHackernews: "ion-social-hackernews",
        socialHackernewsOutline: "ion-social-hackernews-outline",
        socialHtml5: "ion-social-html5",
        socialHtml5Outline: "ion-social-html5-outline",
        socialInstagram: "ion-social-instagram",
        socialInstagramOutline: "ion-social-instagram-outline",
        socialJavascript: "ion-social-javascript",
        socialJavascriptOutline: "ion-social-javascript-outline",
        socialLinkedin: "ion-social-linkedin",
        socialLinkedinOutline: "ion-social-linkedin-outline",
        socialMarkdown: "ion-social-markdown",
        socialNodejs: "ion-social-nodejs",
        socialOctocat: "ion-social-octocat",
        socialPinterest: "ion-social-pinterest",
        socialPinterestOutline: "ion-social-pinterest-outline",
        socialPython: "ion-social-python",
        socialReddit: "ion-social-reddit",
        socialRedditOutline: "ion-social-reddit-outline",
        socialRss: "ion-social-rss",
        socialRssOutline: "ion-social-rss-outline",
        socialSass: "ion-social-sass",
        socialSkype: "ion-social-skype",
        socialSkypeOutline: "ion-social-skype-outline",
        socialSnapchat: "ion-social-snapchat",
        socialSnapchatOutline: "ion-social-snapchat-outline",
        socialTumblr: "ion-social-tumblr",
        socialTumblrOutline: "ion-social-tumblr-outline",
        socialTux: "ion-social-tux",
        socialTwitch: "ion-social-twitch",
        socialTwitchOutline: "ion-social-twitch-outline",
        socialTwitter: "ion-social-twitter",
        socialTwitterOutline: "ion-social-twitter-outline",
        socialUsd: "ion-social-usd",
        socialUsdOutline: "ion-social-usd-outline",
        socialVimeo: "ion-social-vimeo",
        socialVimeoOutline: "ion-social-vimeo-outline",
        socialWhatsapp: "ion-social-whatsapp",
        socialWhatsappOutline: "ion-social-whatsapp-outline",
        socialWindows: "ion-social-windows",
        socialWindowsOutline: "ion-social-windows-outline",
        socialWordpress: "ion-social-wordpress",
        socialWordpressOutline: "ion-social-wordpress-outline",
        socialYahoo: "ion-social-yahoo",
        socialYahooOutline: "ion-social-yahoo-outline",
        socialYen: "ion-social-yen",
        socialYenOutline: "ion-social-yen-outline",
        socialYoutube: "ion-social-youtube",
        socialYoutubeOutline: "ion-social-youtube-outline",
        soupCan: "ion-soup-can",
        soupCanOutline: "ion-soup-can-outline",
        speakerphone: "ion-speakerphone",
        speedometer: "ion-speedometer",
        spoon: "ion-spoon",
        star: "ion-star",
        statsBars: "ion-stats-bars",
        steam: "ion-steam",
        stop: "ion-stop",
        thermometer: "ion-thermometer",
        thumbsdown: "ion-thumbsdown",
        thumbsup: "ion-thumbsup",
        toggle: "ion-toggle",
        toggleFilled: "ion-toggle-filled",
        transgender: "ion-transgender",
        trashA: "ion-trash-a",
        trashB: "ion-trash-b",
        trophy: "ion-trophy",
        tshirt: "ion-tshirt",
        tshirtOutline: "ion-tshirt-outline",
        umbrella: "ion-umbrella",
        university: "ion-university",
        unlocked: "ion-unlocked",
        upload: "ion-upload",
        usb: "ion-usb",
        videocamera: "ion-videocamera",
        volumeHigh: "ion-volume-high",
        volumeLow: "ion-volume-low",
        volumeMedium: "ion-volume-medium",
        volumeMute: "ion-volume-mute",
        wand: "ion-wand",
        waterdrop: "ion-waterdrop",
        wifi: "ion-wifi",
        wineglass: "ion-wineglass",
        woman: "ion-woman",
        wrench: "ion-wrench",
        xbox: "ion-xbox",
    };
    window.qmStates = {
        "asNeededMeds": "app.asNeededMeds",
        "charts": "app.charts",
        "chartSearch": "app.chartSearch",
        "configuration": "app.configuration",
        "configurationClientId": "app.configurationClientId",
        "contact": "app.contact",
        "dataSharing": "app.dataSharing",
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
            cache: true,
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
                variableCategoryName : null,
                variableName : null,
                reminder : null,
                trackingReminder : null,
                fromState : null,
                fromUrl : null,
                measurement : null,
                variableObject : null,
                favorite: false,
                doneState: null,
                skipReminderSettingsIfPossible: null,
                title: "Add Reminder",
                ionIcon: ionIcons.reminder
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
