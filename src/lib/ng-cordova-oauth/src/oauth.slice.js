(function() {
  'use strict';

  angular.module('oauth.slice', ['oauth.utils'])
    .factory('$ngCordovaSlice', slice);

  function slice($q, $http, $cordovaOauthUtility) {
    return { signin: oauthSlice };

    /*
     * Sign into the Slice service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    string appScope
     * @param    object options
     * @return   promise
     */
    function oauthSlice(clientId, appScope, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {

          var redirect_uri = "http://localhost/callback";

          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://api.slice.com/oauth/authorize?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=' + appScope.join(" "), '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');

          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              var authorizationCode = (event.url).split("code=")[1];
              console.log("Slice authorization code is " + authorizationCode);
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

  slice.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
