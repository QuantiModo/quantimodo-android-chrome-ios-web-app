(function() {
  'use strict';

  angular.module('oauth.fitbit', ['oauth.utils'])
    .factory('$ngCordovaFitbit', fitbit);

  function fitbit($q, $http, $cordovaOauthUtility) {
    return { signin: oauthFitbit };

    /*
     * Sign into the Fitbit service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string appScope
     * @param    object options
     * @return   promise
     */
    function oauthFitbit(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {

          var redirect_uri = "http://localhost/callback";

          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://www.fitbit.com/oauth2/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var authorizationCode = (event.url).split("code=")[1];
              authorizationCode = authorizationCode.replace("#_=_", "");
              console.log("Fitbit authorization code is " + authorizationCode);
              deferred.resolve(authorizationCode);
              browserRef.close();
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

  fitbit.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
