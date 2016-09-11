angular.module('starter')

    // utility methods
    .factory('utilsService', function($ionicPopup, $rootScope) {

        var utilsService = {};

        utilsService.getEnv = function(){

            var env = "";

            if(window.location.origin.indexOf('local')> -1){
                //On localhost
                env = "Development";
            }
            else if(window.location.origin.indexOf('file://')){
                env = this.environment;
            }
            else if(window.location.origin.indexOf('staging.quantimo.do') > -1){
                env = "Staging";
            }
            else if(window.location.origin.indexOf('app.quantimo.do')){
                env = "Production";
            }

            return env;
        };

        utilsService.getClientId = function(){
            //if chrome app
            if (window.chrome && chrome.runtime && chrome.runtime.id) {
                return window.private_keys.client_ids.Chrome;
            }
            if ($rootScope.isIOS) { return window.private_keys.client_ids.iOS; }
            if ($rootScope.isAndroid) { return window.private_keys.client_ids.Android; }
            if ($rootScope.isWindows) { return window.private_keys.client_ids.Windows; }
            return window.private_keys.client_ids.Web;
        };
        
        utilsService.setPlatformVariables = function () {
            if (window.cordova) {
                $rootScope.currentPlatformVersion = ionic.Platform.version();
                if (ionic.Platform.isIOS()){
                    $rootScope.isIOS = true;
                    $rootScope.isMobile = true;
                    $rootScope.currentPlatform = "iOS";
                }
                if (ionic.Platform.isAndroid()){
                    $rootScope.isAndroid = true;
                    $rootScope.isMobile = true;
                    $rootScope.currentPlatform = "Android";
                }
            } else if (window.location.href.indexOf('ms-appx') > -1) {
                $rootScope.isWindows = true;
                $rootScope.currentPlatform = "Windows";
            } else {
                $rootScope.isChrome = window.chrome ? true : false;
                $rootScope.currentPlatformVersion = null;
                var currentUrl =  window.location.href;
                if (currentUrl.indexOf('chrome-extension') !== -1) {
                    $rootScope.isChromeExtension = true;
                    $rootScope.isChromeApp = false;
                    $rootScope.currentPlatform = "ChromeExtension";
                } else if ($rootScope.isChrome && chrome.identity) {
                    $rootScope.isChromeExtension = false;
                    $rootScope.isChromeApp = true;
                    $rootScope.currentPlatform = "ChromeApp";
                } else {
                    $rootScope.isWeb = true;
                    $rootScope.currentPlatform = "Web";
                }
            }
            if($rootScope.isChromeExtension){
                $rootScope.localNotificationsEnabled = true;
            }
            $rootScope.qmApiUrl = utilsService.getApiUrl();
        };

        utilsService.getPermissionString = function(){
            var str = "";
            var permissions = ['readmeasurements', 'writemeasurements'];
            for(var i=0; i < permissions.length; i++) {
                str += permissions[i] + "%20";
            }
            return str.replace(/%20([^%20]*)$/,'$1');
        };

        utilsService.getClientSecret = function(){
            if (window.chrome && chrome.runtime && chrome.runtime.id) {
                return window.private_keys.client_secrets.Chrome;
            }
            if ($rootScope.isIOS) { return window.private_keys.client_secrets.iOS; }
            if ($rootScope.isAndroid) { return window.private_keys.client_secrets.Android; }
            if ($rootScope.isWindows) { return window.private_keys.client_secrets.Windows; }
            return window.private_keys.client_secrets.Web;
        };

        utilsService.getRedirectUri = function () {
            return 'https://utopia.quantimo.do:4417/ionic/Modo/www/callback/';
            if(!window.private_keys.redirect_uris){
                return 'https://app.quantimo.do/ionic/Modo/www/callback/';
            }
            if (window.chrome && chrome.runtime && chrome.runtime.id) {
                return window.private_keys.redirect_uris.Chrome;
            }
            if ($rootScope.isIOS) { return window.private_keys.redirect_uris.iOS; }
            if ($rootScope.isAndroid) { return window.private_keys.redirect_uris.Android; }
            if ($rootScope.isWindows) { return window.private_keys.redirect_uris.Windows; }
            return window.private_keys.redirect_uris.Web;
        };

        utilsService.getProtocol = function () {
            if (typeof ionic !== "undefined") {
                var currentPlatform = ionic.Platform.platform();
                if(currentPlatform.indexOf('win') > -1){
                    return 'ms-appx-web';
                }
            }
            return 'https';
        };

        utilsService.getApiUrl = function () {
            return "https://utopia.quantimo.do:4417";
            if ($rootScope.isWeb && window.private_keys.client_ids.Web === 'oAuthDisabled') {
                return window.location.origin;
            }
            if ($rootScope.isWeb) { return window.private_keys.api_urls.Web; }
            if ($rootScope.isIOS) { return window.private_keys.api_urls.iOS; }
            if ($rootScope.isAndroid) { return window.private_keys.api_urls.Android; }
            if ($rootScope.isWindows) { return window.private_keys.api_urls.Windows; }
            return "https://app.quantimo.do";
        };

        utilsService.getURL = function (path) {
            if(typeof path === "undefined") {
                path = "";
            } else {
                path += "?";
            }

            return $rootScope.qmApiUrl + "/" + path;
        };

        utilsService.convertToObjectIfJsonString = function (stringOrObject) {
            try {
                stringOrObject = JSON.parse(stringOrObject);
            } catch (e) {
                return stringOrObject;
            }
            return stringOrObject;
        };

        utilsService.showAlert = function(title, template) {
            var alertPopup = $ionicPopup.alert({
                cssClass : 'positive',
                okType : 'button-positive',
                title: title,
                template: template
            });
        };

        // returns bool
        // if a string starts with substring
        utilsService.startsWith = function (fullString, search) {
            return fullString.slice(0, search.length) === search;
        };

        // returns bool | string
        // if search param is found: returns its value
        // returns false if not found
        utilsService.getUrlParameter = function (url, sParam, shouldDecode) {
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
        };

        return utilsService;
    });