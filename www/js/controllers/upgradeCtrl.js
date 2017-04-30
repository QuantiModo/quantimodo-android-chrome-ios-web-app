angular.module('starter').controller('UpgradeCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading, $rootScope, $stateParams, quantimodoService) {
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        if(!$rootScope.user){
            console.debug('Setting afterLoginGoToState to ' + $state.current.name);
            quantimodoService.setLocalStorageItem('afterLoginGoToState', 'app.upgrade');
            $state.go('app.login');
            return;
        }
        if($rootScope.isChromeExtension){chrome.tabs.create({url: 'https://app.quantimo.do/upgrade'}); window.close(); return;}
        $scope.planFeaturesCard = $rootScope.planFeaturesCards[1];
        $rootScope.upgradeFooterText = null;
        $rootScope.hideNavigationMenu = true;
        quantimodoService.setupUpgradePages();
        $ionicLoading.hide();
    });
    $scope.useLitePlan = function () {if($stateParams.litePlanState){$state.go($stateParams.litePlanState);} else { $scope.goBack();}};
    $scope.hideUpgradePage = function () {
        $rootScope.upgradePages = $rootScope.upgradePages.filter(function( obj ) {
            return obj.id !== $rootScope.upgradePages[0].id; });
        if($rootScope.upgradePages.length === 1){ $scope.hideLearnMoreButton = true; }
        if(!$rootScope.upgradePages || $rootScope.upgradePages.length === 0){
            $rootScope.hideMenuButton = false;
            $state.go(config.appSettings.defaultState);
        } else { $rootScope.hideMenuButton = true; }
    };
    $rootScope.planFeaturesCards = [
        {
            title: 'QuantiModo Lite',
            headerColor: "#f2f9ff",
            backgroundColor: "#f2f9ff",
            subtitle: 'Improve your life!',
            featuresBasicList: [
                {
                    title: '3 month data history',
                },
            ],
            featuresAvatarList: [
                {
                    title: 'Emotion Tracking',
                    subtitle: 'Turn data into happiness!',
                    moreInfo: $rootScope.variableCategories.Emotions.moreInfo,
                    image: $rootScope.variableCategories.Emotions.imageUrl,
                },
                {
                    title: 'Track Symptoms',
                    subtitle: 'in just seconds a day',
                    moreInfo: $rootScope.variableCategories.Symptoms.moreInfo,
                    image: $rootScope.variableCategories.Symptoms.imageUrl,
                },
                {
                    title: 'Track Diet',
                    subtitle: 'Identify dietary triggers',
                    moreInfo: $rootScope.variableCategories.Foods.moreInfo,
                    image: $rootScope.variableCategories.Foods.imageUrl,
                },
                {
                    title: 'Treatment Tracking',
                    subtitle: 'with reminders',
                    moreInfo: $rootScope.variableCategories.Treatments.moreInfo,
                    image: $rootScope.variableCategories.Treatments.imageUrl,
                },
            ],
            priceHtml: "Price: Free forever",
            buttonText: "Sign Up Now",
            buttonClass: "button button-balanced"
        },
        {
            title: 'QuantiModo Plus',
            headerColor: "#f0df9a",
            backgroundColor: "#ffeda5",
            subtitle: 'Perfect your life!',
            featuresAvatarList: [
                {
                    title: 'Import from Apps',
                    subtitle: 'Facebook, Google Calendar, Runkeeper, Github, Sleep as Android, MoodiModo, and even ' +
                    'the weather!',
                    moreInfo: "Automatically import your data from Google Calendar, Facebook, Runkeeper, " +
                    "QuantiModo, Sleep as Android, MoodiModo, Github, and even the weather!",
                    image: 'img/features/smartphone.svg'
                },
                {
                    title: 'Import from Devices',
                    subtitle: 'Fitbit, Jawbone Up, Withings...',
                    moreInfo: "Automatically import your data from Fitbit, Withings, Jawbone.",
                    image: 'img/features/smartwatch.svg'
                },
                {
                    title: 'Sync Across Devices',
                    subtitle: 'Web, Chrome, Android, and iOS',
                    moreInfo: "Any of your QuantiModo-supported apps will automatically sync with any other app " +
                    "on the web, Chrome, Android, and iOS.",
                    image: 'img/features/devices.svg'
                },
                {
                    title: 'Unlimited History',
                    subtitle: 'Lite gets 3 months',
                    moreInfo: "Premium accounts can see unlimited historical data (Free accounts can see only " +
                    "the most recent three months). This is great for seeing long-term trends in your " +
                    "productivity or getting totals for the entire year.",
                    image: 'img/features/calendar.svg'
                },
                {
                    title: 'Location Tracking',
                    subtitle: 'Automatically log places',
                    moreInfo: $rootScope.variableCategories.Location.moreInfo,
                    image: $rootScope.variableCategories.Location.imageUrl,
                },
                {
                    title: 'Purchase Tracking',
                    subtitle: 'Automatically log purchases',
                    moreInfo: $rootScope.variableCategories.Payments.moreInfo,
                    image: $rootScope.variableCategories.Payments.imageUrl,
                },
                {
                    title: 'Weather Tracking',
                    subtitle: 'Automatically log weather',
                    moreInfo: $rootScope.variableCategories.Environment.moreInfo,
                    image: $rootScope.variableCategories.Environment.imageUrl,
                },
                {
                    title: 'Productivity Tracking',
                    subtitle: 'Passively track app usage',
                    moreInfo: "You can do this by installing and connecting Rescuetime on the Import Data page.  Rescuetime is a program" +
                    " that runs on your computer & passively tracks of productivity and app usage.",
                    image: 'img/features/rescuetime.png',
                },
                {
                    title: 'Sleep Tracking',
                    subtitle: 'Automatically track sleep duration and quality',
                    moreInfo: $rootScope.variableCategories.Sleep.moreInfo,
                    image: $rootScope.variableCategories.Sleep.imageUrl,
                },
                {
                    title: 'Vital Signs',
                    subtitle: 'Keep your heart healthy',
                    moreInfo: "I can get your heart rate data from the Fitbit Charge HR, Fitbit Surge.  " +
                    "Resting heart rate is a good measure of general fitness, and heart rate during " +
                    "workouts show intensity.  I can also talk to Withing's bluetooth blood pressure monitor. ",
                    image: 'img/features/heart-like.png',
                },
                {
                    title: 'Physique',
                    subtitle: 'Monitor weight and body fat',
                    moreInfo: $rootScope.variableCategories.Physique.moreInfo,
                    image: $rootScope.variableCategories.Physique.imageUrl
                },
                {
                    title: 'Fitness Tracking',
                    subtitle: 'Steps and physical activity',
                    moreInfo: $rootScope.variableCategories['Physical Activity'].moreInfo,
                    image: $rootScope.variableCategories['Physical Activity'].imageUrl
                },
                {
                    title: 'Advanced Analytics',
                    subtitle: 'See Top Predictors',
                    moreInfo: "See a list of the strongest predictors for any outcome.  See the values for each " +
                    "predictor that typically precede optimal outcomes.  Dive deeper by checking " +
                    "out the full study on any predictor and outcome combination.",
                    image: 'img/features/calendar.svg'
                },
            ],
            priceHtml: "14 day free trial <br> Monthly: $6.99/month <br> Annual: $4.99/month (4 months free!)",
            buttonText: "Start My 14 Day Free Trial",
            buttonClass: "button button-large button-assertive"
        },
    ];
});
