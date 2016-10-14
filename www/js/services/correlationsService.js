angular.module('starter')
    // Correlation service
    .factory('correlationService', function($q, QuantiModo) {
        return {
            getAggregatedCorrelations : function(params){
                var deferred = $q.defer();
                    QuantiModo.getAggregatedCorrelations(params, function(correlationObjects){
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
                QuantiModo.getUserCorrelations(params, function(correlationObjects){
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