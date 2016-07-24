angular.module('starter')
    // Correlation service
    .factory('correlationService', function(QuantiModo, $q) {
        return {
            getPublicCauses : function(variableName, params){
                var deferred = $q.defer();
                    QuantiModo.getPublicCauses(variableName, params, function(correlationObjects){
                        deferred.resolve(correlationObjects);
                    }, function(error){
                        Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                        deferred.reject(error);
                    });
                return deferred.promise;
            },

            getUserCauses: function (variableName, params) {
                var deferred = $q.defer();
                QuantiModo.getUsersCauses(variableName, params, function(correlationObjects){
                    deferred.resolve(correlationObjects);
                }, function(error){
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            vote : function(correlationObject){
                var deferred = $q.defer();
                QuantiModo.postVote(correlationObject, function(response){
                    console.debug("postVote response", response);
                    deferred.resolve(true);
                }, function(response){
                    console.error("postVote response", response);
                    deferred.reject(false);
                });
                return deferred.promise;
            },
            
            deleteVote: function(correlationObject){
                var deferred = $q.defer();
                QuantiModo.deleteVote(correlationObject, function(response){
                    console.debug("deleteVote response", response);
                    deferred.resolve(true);
                }, function(response){
                    console.error("deleteVote response", response);
                    deferred.reject(false);
                });
                return deferred.promise;
            }
        };
    });