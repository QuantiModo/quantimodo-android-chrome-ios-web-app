angular.module('starter', ['ionic','oc.lazyLoad','highcharts-ng','ngCordova','ionic-datepicker','ionic-timepicker'])

.run(function($ionicPlatform, $ionicHistory, $state) {

    var intervalChecker = setInterval(function(){
        if(typeof config !== "undefined"){
            clearInterval(intervalChecker);
            //Set Bugsnag Release Stage
            Bugsnag.apiKey = private_keys.bugsnag_key;
            Bugsnag.releaseStage = config.getEnv();
            Bugsnag.notifyReleaseStages = config.bugsnag.notifyReleaseStages;

            $ionicPlatform.ready(function() {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }
            });

            $ionicPlatform.registerBackButtonAction(function (event) {
                if($ionicHistory.currentStateName() == "app.track"){
                    ionic.Platform.exitApp();
                }
                else {
                    if($ionicHistory.backView()){
                        $ionicHistory.goBack();
                    } else if(localStorage.isLoggedIn){
                        $state.go('app.track');
                    } else {
                        $state.go('app.welcome');
                    }
                }
            }, 100);  
        }
    }, 500);

})

.config(function($stateProvider, $urlRouterProvider,$compileProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|mailto|chrome-extension):/);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|ftp|mailto|chrome-extension):/);

    var config_resolver = {
      loadMyService: ['$ocLazyLoad', function($ocLazyLoad) {
        var getAppNameFromUrl = function () {
            var sPageURL = document.location.toString().split('?')[1];
            if(!sPageURL) return false;
            var sURLVariables = sPageURL.split('&');
            if(!sURLVariables) return false;
            for (var i = 0; i < sURLVariables.length; i++)
            {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == 'app')
                {
                    return sParameterName[1].split('#')[0];
                }
            }
            return false;
        };

        var appName = getAppNameFromUrl();

        if(appName){
            console.log('loadin', appsManager.getAppConfig(appName), appsManager.getPrivateConfig(appName));
            return $ocLazyLoad.load([appsManager.getAppConfig(appName), appsManager.getPrivateConfig(appName)]);
        } else{
            console.log('loading default ', 'MoodiModo');
            return $ocLazyLoad.load([appsManager.getDefaultConfig(), appsManager.getDefaultPrivateConfig()]);          
        }

      }]
    };

    $stateProvider
      .state('intro', {
          url: '/',
          templateUrl: 'templates/intro.html',
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
        url: "/welcome",
        views: {
          'menuContent': {
            templateUrl: "templates/welcome.html",
            controller: 'WelcomeCtrl'
          }
        }
      })
      .state('app.track', {
          url: "/track",
          views: {
              'menuContent': {
                  templateUrl: "templates/track.html",
                  controller: 'TrackCtrl'
              }
          }
      })
      .state('app.track_factors', {
          url: "/track_factors",
          views: {
              'menuContent': {
                  templateUrl: "templates/track_factors.html",
                  controller: 'TrackFactorsCtrl'
              }
          }
      })
      .state('app.track_factors_category', {
          url: "/track_factors_category/:category",
          views: {
              'menuContent': {
                  templateUrl: "templates/track_factors.html",
                  controller: 'TrackFactorsCategoryCtrl'
              }
          }
      })
      .state('app.import', {
          url: "/import",
          cache:"false",
          views: {
              'menuContent': {
                  templateUrl: "templates/import.html",
                  controller: 'ImportCtrl'
              }
          }
      })
      .state('app.negative', {
          url: "/negative",
          cache:false,
          views: {
              'menuContent': {
                  templateUrl: "templates/negative.html",
                  controller: 'NegativeCtrl'
              }
          }
      })
      .state('app.positive', {
          url: "/positive",
          cache:false,
          views: {
              'menuContent': {
                  templateUrl: "templates/positive.html",
                  controller: 'PositiveCtrl'
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
      .state('app.postidea', {
          url: "/postidea",
          views: {
              'menuContent': {
                  templateUrl: "templates/postidea.html",
                  controller: 'ExternalCtrl'
              }
          }
      })
      .state('app.history', {
          url: "/history",
          views: {
              'menuContent': {
                  templateUrl: "templates/history.html",
                  controller: 'HistoryCtrl'
              }
          }
      })

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/');
});

angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
    return function (exception, cause) {
        Bugsnag.notifyException(exception, {diagnostics:{cause: cause}});
    };
});