angular.module('starter')

    // utility methods
    .factory('utilsService', function($ionicPopup,$state) {

        var loginAlert;

        return {
            // returns bool
            // if a string starts with substring
            startsWith : function (fullString, search) {
                return fullString.slice(0, search.length) == search;
            },

            hasInIt : function(fullString, search){
                return fullString.indexOf(search) === -1 ? false : true;
            },

            // returns bool | string
            // if search param is found: returns its value
            // returns false if not found
            getUrlParameter : function (url, sParam) {
                if(url.split('?').length > 0){
                    var sPageURL = url.split('?')[1];
                    var sURLVariables = sPageURL.split('&');
                    for (var i = 0; i < sURLVariables.length; i++)
                    {
                        var sParameterName = sURLVariables[i].split('=');
                        if (sParameterName[0] == sParam)
                        {
                            return sParameterName[1];
                        }
                    }
                    return false;
                } else return false;
            },

            showLoginRequiredAlert: function(login){
               loginAlert =  $ionicPopup.show({
                    title:'This feature requires you to be logged in',
                    buttons:[
                        {
                            text:'Register',
                            type:'button-assertive',
                            onTap: function(e){
                                var ref = window.open(config.getURL('register'),'_blank');
                                $state.go('app.welcome');

                         }
                        },
                        {
                            text:'Login',
                            type: 'button-positive',
                            onTap:function(e){
                                login();
                                $state.go('app.welcome');
                            }
                        },
                        {
                            text:'Cancel',
                            type:'button-stable',
                            onTap:function(e){
                                $state.go('app.track');
                            }
                        }
                    ],
                    cssClass:'alert-popup'
                })
            }
        };
    });