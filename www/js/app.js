angular.module('starter',
    [
        'ionic',
        'oc.lazyLoad',
        'highcharts-ng',
        'ngCordova',
        'ionic-datepicker',
        'ionic-timepicker',
        'ngIOS9UIWebViewPatch',
        'ng-mfb'
    ]
)

.run(function($ionicPlatform, $ionicHistory, $state, $rootScope) {

    $rootScope.goToState = function(state, params){
        $state.go(state, params);
    };

    var intervalChecker = setInterval(function(){
        if(typeof config !== "undefined"){
            clearInterval(intervalChecker);

            if(window.private_keys.bugsnag_key) {
                //Set Bugsnag Release Stage
                Bugsnag.apiKey = window.private_keys.bugsnag_key;
                Bugsnag.releaseStage = config.getEnv();
                Bugsnag.notifyReleaseStages = config.bugsnag.notifyReleaseStages;
            } else {
                console.warn('No bugsnag_key found in private config!');
            }

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
                if($ionicHistory.currentStateName() === config.appSettings.default_state){
                    ionic.Platform.exitApp();
                }
                else {
                    if($ionicHistory.backView()){
                        $ionicHistory.goBack();
                    } else if(localStorage.isLoggedIn){
                        $state.go(config.appSettings.default_state);
                    } else {
                        $state.go('app.welcome');
                    }
                }
            }, 100);  
        }
    }, 500);

})

.config(function($stateProvider, $urlRouterProvider, $compileProvider, ionicTimePickerProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|mailto|chrome-extension):/);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|ftp|mailto|chrome-extension):/);

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

    var timePickerObj = {
        format: 12,
        step: 1
    };

    ionicTimePickerProvider.configTimePicker(timePickerObj);

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
      .state('app.login', {
        url: "/login",
        views: {
          'menuContent': {
            templateUrl: "templates/login_page.html",
            controller: 'LoginCtrl'
          }
        }
      })
        .state('app.intro', {
            url: "/intro",
            views: {
                'menuContent': {
                    templateUrl: "templates/intro.html",
                    controller: 'IntroPageCtrl'
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
                  controller: 'TrackFactorsCategoryCtrl'
              }
          }
      })
      .state('app.track_factors_category', {
          url: "/track_factors_category/:variableCategoryName",
          cache:false,
          params: {
              variableCategoryName : null,
              fromState : null,
              measurement : null
          },
          views: {
              'menuContent': {
                  templateUrl: "templates/track_factors.html",
                  controller: 'TrackFactorsCategoryCtrl'
              }
          }
      })
        .state('app.measurementAdd', {
            url: "/measurement-add/:variableName",
            cache:false,
            params: {
                fromState : null,
                measurement : null,
                variableObject : null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/measurement_add.html",
                    controller: 'MeasurementAddCtrl'
                }
            }
        })
        .state('app.variable_settings', {
            url: "/variable_settings/:variableName",
            views: {
                'menuContent': {
                    templateUrl: "templates/variable_settings.html",
                    controller: 'VariableSettingsCtrl'
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
      .state('app.search-variables', {
          url: "/search-variables",
          cache:false,
          views: {
              'menuContent': {
                  templateUrl: "templates/iFrame.html",
                  controller: 'IframeScreenCtrl'
              }
          }
      })
      .state('app.search-common-relationships', {
          url: "/search-common-relationships",
          cache:false,
          views: {
              'menuContent': {
                  templateUrl: "templates/iFrame.html",
                  controller: 'IframeScreenCtrl'
              }
          }
      })
      .state('app.search-user-relationships', {
          url: "/search-user-relationships",
          cache:false,
          views: {
              'menuContent': {
                  templateUrl: "templates/iFrame.html",
                  controller: 'IframeScreenCtrl'
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
      .state('app.historyAll', {
          url: "/history-all",
          views: {
              'menuContent': {
                  templateUrl: "templates/history_all.html",
                  controller: 'AllHistoryCtrl'
              }
          }
      })
      .state('app.reminders_inbox', {
          url: "/reminders-inbox",
          cache:false,
          params: {
            unit: null,
            variableName : null,
            dateTime : null,
            value : null
          },
          views: {
              'menuContent': {
                  templateUrl: "templates/reminders_inbox.html",
                  controller: 'RemindersInboxCtrl'
              }
          }
      })
      .state('app.reminders_inbox_category', {
          url: "/reminders-inbox/:variableCategoryName",
          cache:false,
          params: {
            unit: null,
            variableName : null,
            dateTime : null,
            value : null
          },
          views: {
              'menuContent': {
                  templateUrl: "templates/reminders_inbox.html",
                  controller: 'RemindersInboxCtrl'
              }
          }
      })
      .state('app.reminders_manage', {
          url: "/reminders-manage",
          cache:false,
          views: {
              'menuContent': {
                  templateUrl: "templates/reminders_manage.html",
                  controller: 'RemindersManageCtrl'
              }
          }
      })
      .state('app.reminders_manage_category', {
          url: "/reminders-manage/:variableCategoryName",
          cache:false,
          views: {
              'menuContent': {
                  templateUrl: "templates/reminders_manage.html",
                  controller: 'RemindersManageCtrl'
              }
          }
      })
      .state('app.reminder_add_category', {
          url: "/reminder_add/:variableCategoryName",
          cache:false,
          views: {
              'menuContent': {
                  templateUrl: "templates/reminder_add.html",
                  controller: 'RemindersAddCtrl'
              }
          }
      })
      .state('app.reminder_add', {
          url: "/reminder_add",
          cache:false,
          params: {
            reminder: null
          },
          views: {
              'menuContent': {
                  templateUrl: "templates/reminder_add.html",
                  controller: 'RemindersAddCtrl'
              }
          }
      });


      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/');
});

angular.module('exceptionOverride', []).factory('$exceptionHandler', function () {
    return function (exception, cause) {
        Bugsnag.notifyException(exception, {diagnostics:{cause: cause}});
    };
});