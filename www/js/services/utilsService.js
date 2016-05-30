angular.module('starter')

    // utility methods
    .factory('utilsService', function($ionicPopup, $state, $ionicLoading) {

        var loginAlert;

        return {

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

            // Hide spinner
            loadingStop : function(){
                $ionicLoading.hide();
            },

            // show spinner
            loadingStart : function(loadingMessage, hideAfter){
                
                if(!hideAfter){
                    hideAfter = 10;
                }
                
                if(!loadingMessage) {
                    $ionicLoading.show({
                        noBackdrop: true,
                        template: '<img src={{loaderImagePath}}><!--<br><p class="item-icon-left">Loading stuff...<ion-spinner icon="lines"/></p>-->'
                    });
                }
                
                if(loadingMessage) {
                    $ionicLoading.show({
                        noBackdrop: true,
                        template: '<p class="item-icon-left">' + loadingMessage + '<ion-spinner icon="lines"/></p>'
                    });
                }

                setTimeout(function(){
                    $ionicLoading.hide();
                }, hideAfter);
            },

            // returns bool
            // if a string starts with substring
            startsWith : function (fullString, search) {
                return fullString.slice(0, search.length) === search;
            },

            hasInIt : function(fullString, search){
                return fullString.indexOf(search) === -1 ? false : true;
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
            },
        };
    });