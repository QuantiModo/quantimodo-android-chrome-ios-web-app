/**
 * Created by Abdullah on 8/14/2015.
 * //
 */

angular.module('starter')

    .factory('localStorageService',function(){

        return{

            convertToObjectIfJsonString : function (stringOrObject) {
                try {
                    stringOrObject = JSON.parse(stringOrObject);
                } catch (e) {
                    return stringOrObject;
                }
                return stringOrObject;
            },


            deleteItem : function(key){
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                if (window.chrome && chrome.runtime && chrome.runtime.id) {

                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.remove(keyIdentifier+key);

                } else {
                    localStorage.removeItem(keyIdentifier+key);
                }
            },

            setItem:function(key, value){
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    var obj = {};
                    obj[keyIdentifier+key] = value;
                    chrome.storage.local.set(obj);

                } else {
                    localStorage.setItem(keyIdentifier+key,value);
                }
            },
            
            getItem:function(key,callback){
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.get(keyIdentifier+key,function(val){
                        callback(val[keyIdentifier+key]);
                    });
                } else {
                    var val = localStorage.getItem(keyIdentifier+key);
                    callback(val);
                }
            },

            getItemSync: function (key) {
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.get(keyIdentifier+key,function(val){
                        return val[keyIdentifier+key];
                    });
                } else {
                    return localStorage.getItem(keyIdentifier+key);
                }
            },

            getItemAsObject: function (key) {
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.get(keyIdentifier+key,function(val){
                        var item = val[keyIdentifier+key];
                        item = this.convertToObjectIfJsonString(item);
                        return item;
                    });
                } else {
                    var item = localStorage.getItem(keyIdentifier+key);
                    item = this.convertToObjectIfJsonString(item);
                    return item;
                }
            },

            clear:function(){
                if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    chrome.storage.local.clear();
                } else {
                    localStorage.clear();
                }
            }
        };
    });