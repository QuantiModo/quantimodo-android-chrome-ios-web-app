angular.module('starter')

    // utility methods
    .factory('utilsService', function($ionicPopup) {

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
            } else {
                var platform = getPlatform();
                if (platform === "Web") { return window.private_keys.client_ids.Web }
                if (platform === "iOS") { return window.private_keys.client_ids.iOS }
                if (platform === "Android") { return window.private_keys.client_ids.Android }
                if (platform === "windows") { return window.private_keys.client_ids.windows }
                return window.private_keys.client_ids.Web;
            }
        };
        
        utilsService.getPlatform = function () {
            if(typeof ionic !== "undefined" &&
                typeof ionic.Platform !== "undefined") {
                var currentPlatform = ionic.Platform.platform();
                if (currentPlatform.indexOf('win') > -1){
                    return 'windows';
                }
                return ionic.Platform.isIOS() ? "iOS" : ionic.Platform.isAndroid() ? "Android" : "Web";
            }
            else {
                return "Unknown Platform";
            }
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
            } else {
                var platform = getPlatform();
                if (platform === "Web") { return window.private_keys.client_secrets.Web }
                if (platform === "iOS") { return window.private_keys.client_secrets.iOS }
                if (platform === "Android") { return window.private_keys.client_secrets.Android }
                if (platform === "windows") { return window.private_keys.client_secrets.windows }
                return window.private_keys.client_secrets.Web;
            }
        };

        utilsService.getRedirectUri = function () {
            if(!window.private_keys.redirect_uris){
                return 'https://app.quantimo.do/ionic/Modo/www/callback/';
            }
            if (window.chrome && chrome.runtime && chrome.runtime.id) {
                return window.private_keys.redirect_uris.Chrome;
            } else {
                var platform = getPlatform();
                if (platform === "Web") { return window.private_keys.redirect_uris.Web }
                if (platform === "iOS") { return window.private_keys.redirect_uris.iOS }
                if (platform === "Android") { return window.private_keys.redirect_uris.Android }
                if (platform === "windows") { return window.private_keys.redirect_uris.windows }
                return window.private_keys.redirect_uris.Web;
            }
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
            if(!window.private_keys.api_urls){
                return 'https://app.quantimo.do';
            }
            var platform = utilsService.getPlatform();
            if (window.chrome && chrome.runtime && chrome.runtime.id) {
                return window.private_keys.api_urls.Chrome;
            } else if (platform === 'Web' && window.private_keys.client_ids.Web === 'oAuthDisabled') {
                return window.location.origin;
            } else {
                if (platform === "Web") { return window.private_keys.api_urls.Web }
                if (platform === "iOS") { return window.private_keys.api_urls.iOS }
                if (platform === "Android") { return window.private_keys.api_urls.Android }
                if (platform === "windows") { return window.private_keys.api_urls.windows }
                return window.private_keys.api_urls.Web;
            }
        };

        utilsService.getURL = function (path) {
            console.warn('utilsService.getURL is deprecated. Please use utilsService.getURL');
            if(typeof path === "undefined") {
                path = "";
            }
            else {
                path += "?";
            }

            var url = "";

            if(utilsService.getApiUrl() !== "undefined") {
                url = utilsService.getApiUrl() + "/" + path;
            }
            else
            {
                url = utilsService.getProtocol() + "://app.quantimo.do/" + path;
            }

            return url;
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