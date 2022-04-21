(function() {
  'use strict';

  angular.module('oauth.linkedin', ['oauth.utils'])
    .factory('$ngCordovaLinkedin', linkedin);

  function linkedin($q, $http, $cordovaOauthUtility) {
    return { signin: oauthLinkedin };

    /*
     * Sign into the LinkedIn service
     *
     * @param    string clientId
     * @param    string clientSecret
     * @param    array appScope
     * @param    string state
     * @param    object options
     * @return   promise
     */
    function oauthLinkedin(clientId, clientSecret, appScope, state, options) {
      var deferred = $q.defer();
      if(window.cordova) {
        if($cordovaOauthUtility.isInAppBrowserInstalled()) {
          var redirect_uri = "http://localhost/callback";
          if(options !== undefined) {
            if(options.hasOwnProperty("redirect_uri")) {
              redirect_uri = options.redirect_uri;
            }
          }
          var browserRef = window.cordova.InAppBrowser.open('https://www.linkedin.com/oauth/v2/authorization?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope.join(" ") + '&response_type=code&state=' + state, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
          browserRef.addEventListener('loadstart', function(event) {
            if((event.url).indexOf(redirect_uri) === 0) {
              try {
                var requestToken = (event.url).split("code=")[1].split("&")[0];
                $http({method: "post", headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Access-Control-Allow-Origin': '*', 'X-Requested-With': 'XMLHttpRequest'}, url: "https://www.linkedin.com/oauth/v2/accessToken", data: "client_id=" + clientId + "&client_secret=" + clientSecret + "&redirect_uri=" + redirect_uri + "&grant_type=authorization_code" + "&code=" + requestToken })
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
              }catch(e){
                setTimeout(function() {
                    browserRef.close();
                }, 10);
              }
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

  linkedin.$inject = ['$q', '$http', '$cordovaOauthUtility'];
})();
