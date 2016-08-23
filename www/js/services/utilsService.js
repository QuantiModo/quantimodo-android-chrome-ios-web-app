angular.module('starter')

    // utility methods
    .factory('utilsService', function($ionicPopup, $ionicLoading, $rootScope) {

        return {

            getAccessTokenFromUrlParameter: function () {
                $rootScope.accessTokenInUrl = this.getUrlParameter(location.href, 'accessToken');
                if (!$rootScope.accessTokenInUrl) {
                    $rootScope.accessTokenInUrl = this.getUrlParameter(location.href, 'access_token');
                }
                if($rootScope.accessTokenInUrl){
                    localStorageService.setItem('accessTokenInUrl', $rootScope.accessTokenInUrl);
                    localStorageService.setItem('accessToken', $rootScope.accessTokenInUrl);
                } else {
                    localStorageService.deleteItem('accessTokenInUrl');
                }

                return $rootScope.accessTokenInUrl;
            },

            convertToObjectIfJsonString : function (stringOrObject) {
                try {
                    stringOrObject = JSON.parse(stringOrObject);
                } catch (e) {
                    return stringOrObject;
                }
                return stringOrObject;
            },

            showAlert : function(title, template) {
                var alertPopup = $ionicPopup.alert({
                    cssClass : 'positive',
                    okType : 'button-positive',
                    title: title,
                    template: template
                });
            },

            // returns bool
            // if a string starts with substring
            startsWith : function (fullString, search) {
                return fullString.slice(0, search.length) === search;
            },

            // returns bool | string
            // if search param is found: returns its value
            // returns false if not found
            getUrlParameter : function (url, sParam, shouldDecode) {
                if(url.split('?').length > 1){
                    var sPageURL = url.split('?')[1];
                    var sURLVariables = sPageURL.split('&');
                    for (var i = 0; i < sURLVariables.length; i++)
                    {
                        var sParameterName = sURLVariables[i].split('=');
                        if (sParameterName[0] === sParam)
                        {
                            if(typeof shouldDecode !== "undefined")  {
                                return decodeURIComponent(sParameterName[1]);
                            }
                            else {
                                return sParameterName[1];
                            }
                        }
                    }
                    return false;
                } else {
                    return false;
                }
            }
        };
    });