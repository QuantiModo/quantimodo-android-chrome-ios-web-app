angular.module('starter')

    .factory('localStorageService',function($rootScope, $q, utilsService) {

        var localStorageService = {

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
                var localStorageItemAsString = this.getItemSync(localStorageItemName);
                var localStorageItemArray = JSON.parse(localStorageItemAsString);
                if(!localStorageItemArray){
                    console.warn("Local storage item " + localStorageItemName + " not found");
                } else {
                    for(var i = 0; i < localStorageItemArray.length; i++){
                        if(localStorageItemArray[i].id !== elementId){
                            elementsToKeep.push(localStorageItemArray[i]);
                        }
                    }
                    this.setItem(localStorageItemName, JSON.stringify(elementsToKeep));
                }
                deferred.resolve(elementsToKeep);
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

            addToOrReplaceElementOfItemByIdOrMoveToFront : function(localStorageItemName, replacementElementArray){
                var deferred = $q.defer();
                if(replacementElementArray.constructor !== Array){
                    replacementElementArray = [replacementElementArray];
                }
                // Have to stringify/parse to create cloned variable or it adds all stored reminders to the array to be posted
                var elementsToKeep = JSON.parse(JSON.stringify(replacementElementArray));
                var localStorageItemArray = JSON.parse(this.getItemSync(localStorageItemName));
                var found = false;
                if(localStorageItemArray){
                    for(var i = 0; i < localStorageItemArray.length; i++){
                        found = false;
                        for (var j = 0; j < replacementElementArray.length; j++){
                            if(replacementElementArray[j].id &&
                                localStorageItemArray[i].id === replacementElementArray[j].id){
                                found = true;
                            }
                        }
                        if(!found){
                            elementsToKeep.push(localStorageItemArray[i]);
                        }
                    }
                }
                this.setItem(localStorageItemName, JSON.stringify(elementsToKeep));
                deferred.resolve();
                return deferred.promise;
            },

            setItem:function(key, value){
                var deferred = $q.defer();
                var keyIdentifier = config.appSettings.appStorageIdentifier;
                if ($rootScope.isChromeApp) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    var obj = {};
                    obj[keyIdentifier+key] = value;
                    chrome.storage.local.set(obj);
                    deferred.resolve();
                } else {
                    localStorage.setItem(keyIdentifier+key,value);
                    deferred.resolve();
                }
                return deferred.promise;
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
                var itemAsString;

                var i;
                if ($rootScope.isChromeApp) {
                    // Code running in a Chrome extension (content script, background page, etc.)
                    chrome.storage.local.get(keyIdentifier+localStorageItemName,function(localStorageItems){
                        itemAsString = localStorageItems[keyIdentifier + localStorageItemName];
                    });
                } else {
                    //console.debug(localStorage.getItem(keyIdentifier + localStorageItemName));
                    itemAsString = localStorage.getItem(keyIdentifier + localStorageItemName);
                }

                if(!itemAsString){
                    return null;
                }

                var matchingElements = JSON.parse(itemAsString);

                if(matchingElements.length){

                    if(greaterThanPropertyName && typeof matchingElements[0][greaterThanPropertyName] === "undefined") {
                        console.error(greaterThanPropertyName + " greaterThanPropertyName does not exist for " + localStorageItemName);
                    }

                    if(filterPropertyName && typeof matchingElements[0][filterPropertyName] === "undefined"){
                        console.error(filterPropertyName + " filterPropertyName does not exist for " + localStorageItemName);
                    }

                    if(lessThanPropertyName && typeof matchingElements[0][lessThanPropertyName] === "undefined"){
                        console.error(lessThanPropertyName + " lessThanPropertyName does not exist for " + localStorageItemName);
                    }
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


        localStorageService.getCachedResponse = function(requestName, params){
            var cachedResponse = JSON.parse(localStorageService.getItemSync('cached' + requestName));
            if(cachedResponse &&
                JSON.stringify(cachedResponse.requestParams) === JSON.stringify(params) &&
                cachedResponse.response.length &&
                Date.now() < cachedResponse.expirationTimeMilliseconds){
                return cachedResponse.response;
            } else {
                return false;
            }
        };

        localStorageService.storeCachedResponse = function(requestName, params, response){
            var cachedResponse = {
                requestParams: params,
                response: response,
                expirationTimeMilliseconds: Date.now() + 86400 * 1000
            };
            localStorageService.setItem('cached' + requestName, JSON.stringify(cachedResponse));
        };

        localStorageService.deleteCachedResponse = function(requestName, params, response){
            var cachedResponse = {
                requestParams: params,
                response: response,
                expirationTimeMilliseconds: Date.now() + 86400 * 1000
            };
            localStorageService.setItem('cached' + requestName, JSON.stringify(cachedResponse));
        };

        localStorageService.getElementsFromItemWithRequestParams = function (localStorageItemName, requestParams) {
            var greaterThanPropertyName = null;
            var greaterThanPropertyValue = null;
            var lessThanPropertyName = null;
            var lessThanPropertyValue = null;
            var filterPropertyName = null;
            var filterPropertyValue = null;

            var log = [];
            angular.forEach(requestParams, function(value, key) {
                if(typeof value === "string" && value.indexOf('(lt)') !== -1){
                    lessThanPropertyValue = value.replace('(lt)', "");
                    if(!isNaN(lessThanPropertyValue)){
                        lessThanPropertyValue = Number(lessThanPropertyValue);
                    }
                    lessThanPropertyName = key;
                } else if (typeof value === "string" && value.indexOf('(gt)') !== -1){
                    greaterThanPropertyValue = value.replace('(gt)', "");
                    if(!isNaN(greaterThanPropertyValue)){
                        greaterThanPropertyValue = Number(greaterThanPropertyValue);
                    }
                    greaterThanPropertyName = key;
                } else if (typeof value === "string"){
                    filterPropertyValue = value;
                    if(!isNaN(filterPropertyValue)){
                        filterPropertyValue = Number(filterPropertyValue);
                    }
                    filterPropertyName = key;
                } else if (typeof value === "boolean" && key === "outcome"){
                    filterPropertyValue = value;
                    filterPropertyName = key;
                }
            }, log);

            return localStorageService.getElementsFromItemWithFilters(localStorageItemName, filterPropertyName,
                filterPropertyValue, lessThanPropertyName, lessThanPropertyValue, greaterThanPropertyName,
                greaterThanPropertyValue);
        };

        return localStorageService;
    });