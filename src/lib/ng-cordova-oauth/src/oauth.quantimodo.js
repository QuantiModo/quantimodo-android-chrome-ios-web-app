(function() {
  'use strict';

  angular.module('oauth.quantimodo', ['oauth.utils'])
    .factory('$ngCordovaQuantiModo', quantimodo);

  function quantimodo($q, $http, $cordovaOauthUtility) {
    return { signin: oauthQuantiModo };

    /*
     * Sign into the QuantiModo service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    array appScope
     * @param    object options
     * @return   promise
     */
    function oauthQuantiModo(clientId, clientSecret, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://app.quantimo.do/api/oauth2/authorize?response_type=code&client_id=' + clientId +
            '&redirect_uri=' + redirect_uri + '&scope=' + appScope.join(","), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var requestToken = (event.url).split("code=")[1];
              $http({method: "post", headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 'accept': 'application/json'
                },
                url: "https://app.quantimo.do/api/oauth2/token",
                data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&code=" + requestToken + "&grant_type=authorization_code" })
                .success(function(data) {
                  deferred.resolve(data);
                })
                .error(function(data, status) {
                  deferred.reject("Problem authenticating");
                })
                .finally(function() {
                  setTimeout(function() {
                      browserRef.close();
                  }, 10);
                });
            }
          });
          browserRef.addEventListener('exit', function(event) {
              deferred.reject("The sign in flow was canceled");
          });
        } else {
            deferred.reject("Could not find InAppBrowser plugin");
        }
      } else {
        deferred.reject("Cannot authenticate via a web browser");
      }

      return deferred.promise;
    }
  }

  quantimodo.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
