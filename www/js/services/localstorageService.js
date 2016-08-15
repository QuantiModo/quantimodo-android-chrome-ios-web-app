angular.module('starter')

    .factory('localStorageService',function($rootScope, $q, utilsService) {

        return{

            deleteItem : function(key){
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                if ($rootScope.isChromeApp) {

                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.remove(keyIdentifier+key);

                } else {
                    localStorage.removeItem(keyIdentifier+key);
                }
            },

            deleteElementOfItemById : function(localStorageItemName, elementId){
                var deferred = $q.defer();
                var elementsToKeep = [];
                var localStorageItemArray = JSON.parse(this.getItemSync(localStorageItemName));
                if(!localStorageItemArray){
                    console.error("Local storage item " + localStorageItemName + " not found");
                } else {
                    for(var i = 0; i < localStorageItemArray.length; i++){
                        if(localStorageItemArray[i].id !== elementId){
                            elementsToKeep.push(localStorageItemArray[i]);
                        }
                    }
                    this.setItem(localStorageItemName, JSON.stringify(elementsToKeep));
                }
                deferred.resolve();
                return deferred.promise;
            },

            deleteElementOfItemByProperty : function(localStorageItemName, propertyName, propertyValue){
                var deferred = $q.defer();
                var elementsToKeep = [];
                var localStorageItemArray = JSON.parse(this.getItemSync(localStorageItemName));
                if(!localStorageItemArray){
                    console.error("Local storage item " + localStorageItemName + " not found");
                } else {
                    for(var i = 0; i < localStorageItemArray.length; i++){
                        if(localStorageItemArray[i][propertyName] !== propertyValue){
                            elementsToKeep.push(localStorageItemArray[i]);
                        }
                    }
                    this.setItem(localStorageItemName, JSON.stringify(elementsToKeep));
                }
                deferred.resolve();
                return deferred.promise;
            },

            addToOrReplaceElementOfItemByIdOrMoveToFront : function(localStorageItemName, replacementElement){
                var deferred = $q.defer();
                var elementsToKeep = [];
                elementsToKeep.push(replacementElement);

                var localStorageItemArray = JSON.parse(this.getItemSync(localStorageItemName));
                if(localStorageItemArray){
                    for(var i = 0; i < localStorageItemArray.length; i++){
                        if(localStorageItemArray[i].id !== replacementElement.id){
                            elementsToKeep.push(localStorageItemArray[i]);
                        }
                    }
                }
                this.setItem(localStorageItemName, JSON.stringify(elementsToKeep));
                deferred.resolve();
                return deferred.promise;
            },

            setItem:function(key, value){
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                if ($rootScope.isChromeApp) {
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
                if ($rootScope.isChromeApp) {
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
                if ($rootScope.isChromeApp) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.get(keyIdentifier+key,function(val){
                        return val[keyIdentifier+key];
                    });
                } else {
                    return localStorage.getItem(keyIdentifier+key);
                }
            },

            getElementsFromItemWithFilters: function (localStorageItemName, filterPropertyName, filterPropertyValue, 
                                                      lessThanPropertyName, lessThanPropertyValue,
                                                      greaterThanPropertyName, greaterThanPropertyValue) {
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                var unfilteredElementArray = [];
                var matchingElements = [];
                var i;
                if ($rootScope.isChromeApp) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.get(keyIdentifier+localStorageItemName,function(localStorageItems){
                        matchingElements = JSON.parse(localStorageItems[keyIdentifier + localStorageItemName]);
                    });
                } else {
                    //console.log(localStorage.getItem(keyIdentifier + localStorageItemName));
                    matchingElements = JSON.parse(localStorage.getItem(keyIdentifier + localStorageItemName));
                }

                if(filterPropertyName && typeof filterPropertyValue !== "undefined" && filterPropertyValue !== null){
                    if(matchingElements){
                        unfilteredElementArray = matchingElements;
                    }
                    matchingElements = [];
                    for(i = 0; i < unfilteredElementArray.length; i++){
                        if(unfilteredElementArray[i][filterPropertyName] === filterPropertyValue){
                            matchingElements.push(unfilteredElementArray[i]);
                        }
                    }
                }
                
                if(lessThanPropertyName && lessThanPropertyValue){
                    if(matchingElements){
                        unfilteredElementArray = matchingElements;
                    }
                    matchingElements = [];
                    for(i = 0; i < unfilteredElementArray.length; i++){
                        if(unfilteredElementArray[i][lessThanPropertyName] < lessThanPropertyValue){
                            matchingElements.push(unfilteredElementArray[i]);
                        }
                    }
                }

                if(greaterThanPropertyName && greaterThanPropertyValue){
                    if(matchingElements){
                        unfilteredElementArray = matchingElements;
                    }
                    matchingElements = [];
                    for(i = 0; i < unfilteredElementArray.length; i++){
                        if(unfilteredElementArray[i][greaterThanPropertyName] > greaterThanPropertyValue){
                            matchingElements.push(unfilteredElementArray[i]);
                        }
                    }
                }
                
                return matchingElements;
            },
            

            getItemAsObject: function (key) {
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                if ($rootScope.isChromeApp) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.get(keyIdentifier+key,function(val){
                        var item = val[keyIdentifier+key];
                        item = utilsService.convertToObjectIfJsonString(item);
                        return item;
                    });
                } else {
                    var item = localStorage.getItem(keyIdentifier+key);
                    item = utilsService.convertToObjectIfJsonString(item);
                    return item;
                }
            },

            clear:function(){
                if ($rootScope.isChromeApp) {
                    chrome.storage.local.clear();
                } else {
                    localStorage.clear();
                }
            }
        };
    });