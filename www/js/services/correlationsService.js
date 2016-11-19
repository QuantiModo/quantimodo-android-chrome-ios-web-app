angular.module('starter')
    // Correlation service
    .factory('correlationService', function($q, QuantiModo, localStorageService) {

        if (!Date.now) {
            Date.now = function() { return new Date().getTime(); };
        }

        var useLocalImages = function (correlationObjects) {
            for(var i = 0; i < correlationObjects.length; i++){
                correlationObjects[i].gaugeImage = correlationObjects[i].gaugeImage.substring(correlationObjects[i].gaugeImage.lastIndexOf("/") + 1);
                correlationObjects[i].gaugeImage = 'img/gauges/' + correlationObjects[i].gaugeImage;

                correlationObjects[i].causeVariableImageUrl = correlationObjects[i].causeVariableImageUrl.substring(correlationObjects[i].causeVariableImageUrl.lastIndexOf("/") + 1);
                correlationObjects[i].causeVariableImageUrl = 'img/variable_categories/' + correlationObjects[i].causeVariableImageUrl;

                correlationObjects[i].effectVariableImageUrl = correlationObjects[i].effectVariableImageUrl.substring(correlationObjects[i].effectVariableImageUrl.lastIndexOf("/") + 1);
                correlationObjects[i].effectVariableImageUrl = 'img/variable_categories/' + correlationObjects[i].effectVariableImageUrl;
            }
            return correlationObjects;
        };

        return {
            getAggregatedCorrelations : function(params){
                var deferred = $q.defer();
                var cachedCorrelations = localStorageService.getCachedResponse('GetAggregatedCorrelations', params);
                if(cachedCorrelations){
                    deferred.resolve(cachedCorrelations);
                    return deferred.promise;
                }

                QuantiModo.getAggregatedCorrelations(params, function(correlationObjects){
                    correlationObjects = useLocalImages(correlationObjects);
                    localStorageService.storeCachedResponse('GetAggregatedCorrelations', params, correlationObjects);
                    deferred.resolve(correlationObjects);
                }, function(error){
                    if (typeof Bugsnag !== "undefined") {
                        Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    }
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getUserCorrelations: function (params) {
                var deferred = $q.defer();
                var cachedCorrelations = localStorageService.getCachedResponse('GetUserCorrelations', params);
                if(cachedCorrelations){
                    deferred.resolve(cachedCorrelations);
                    return deferred.promise;
                }
                QuantiModo.getUserCorrelations(params, function(correlationObjects){
                    correlationObjects = useLocalImages(correlationObjects);
                    localStorageService.storeCachedResponse('GetUserCorrelations', params, correlationObjects);
                    deferred.resolve(correlationObjects);
                }, function(error){
                    if (typeof Bugsnag !== "undefined") {
                        Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    }
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            vote : function(correlationObject){
                var deferred = $q.defer();
                QuantiModo.postVote(correlationObject, function(response){
                    localStorageService.deleteCachedResponse('GetUserCorrelations');
                    localStorageService.deleteCachedResponse('GetAggregatedCorrelations');
                    console.debug("postVote response", response);
                    deferred.resolve(true);
                }, function(error){
                    console.error("postVote response", error);
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            
            deleteVote: function(correlationObject){
                var deferred = $q.defer();
                QuantiModo.deleteVote(correlationObject, function(response){
                    localStorageService.deleteCachedResponse('GetUserCorrelations');
                    localStorageService.deleteCachedResponse('GetAggregatedCorrelations');
                    console.debug("deleteVote response", response);
                    deferred.resolve(true);
                }, function(error){
                    console.error("deleteVote response", error);
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        };
    });