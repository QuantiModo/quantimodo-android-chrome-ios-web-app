/**
 * Created by Abdullah on 8/14/2015.
 * //
 */

angular.module('starter')

    .factory('localStorageService',function(){

        return{
            setItem:function(key, value){
                var key_identifier = config.appSettings.storage_identifier;
                if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    var obj = {};
                    obj[key_identifier+key] = value;
                    chrome.storage.local.set(obj);

                } else {
                    localStorage.setItem(key_identifier+key,value);
                }
            },

            getItem:function(key,callback){
                var key_identifier = config.appSettings.storage_identifier;
                if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.get(key_identifier+key,function(val){
                        callback(val[key_identifier+key]);
                    });
                } else {
                    var val = localStorage.getItem(key_identifier+key);
                    callback(val);
                }
            },

            clear:function(){
                if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    chrome.storage.local.clear();
                } else {
                    localStorage.clear();
                }
            }
        }
    });