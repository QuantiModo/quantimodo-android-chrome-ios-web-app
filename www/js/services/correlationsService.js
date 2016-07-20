angular.module('starter')
    // Correlation service
    .factory('correlationService', function(QuantiModo, $q) {

        return {
            // get Positive correlationObjects

            // up/down vote
            vote : function(vote, cause, effect, correlationcoefficient){
                var deferred = $q.defer();

                console.log(vote, cause, effect, correlationcoefficient);
                var correlation =
                {
                    cause: cause,
                    effect: effect,
                    correlation: correlationcoefficient,
                    vote: vote
                };

                QuantiModo.postVote(correlation, function(response){
                    console.log("the response beingx", response);
                    deferred.resolve(true);
                }, function(response){
                    console.log("the response beingy", response);
                    deferred.reject(false);
                });

                return deferred.promise;
            },
            
            deleteVote: function(cause, effect, correlationcoefficient){
                var deferred = $q.defer();

                console.log(cause, effect, correlationcoefficient);
                var correlation =
                {
                    cause: cause,
                    effect: effect,
                    correlation: correlationcoefficient,
                };

                QuantiModo.deleteVote(correlation, function(response){
                    console.log("the response beingx", response);
                    deferred.resolve(true);
                }, function(response){
                    console.log("the response beingy", response);
                    deferred.reject(false);
                });
                
                return deferred.promise;
            }
        };
    });