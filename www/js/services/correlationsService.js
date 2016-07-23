angular.module('starter')
    // Correlation service
    .factory('correlationService', function(QuantiModo, $q) {
        var positive_factors = [];
        var negative_factors = [];
        var usersPositivePredictors = [];
        var usersNegativePredictors = [];
        return {
            // get Positive correlationObjects
            getCauses : function(variableName){
                var deferred = $q.defer();
                    QuantiModo.getCauses(variableName, function(correlationObjects){

                        // populate positives & Negatives
                        for(var i in correlationObjects){
                            if(correlationObjects[i].correlationCoefficient > 0){
                                positive_factors.push(correlationObjects[i]);
                            }
                            else if(correlationObjects[i].correlationCoefficient < 0){
                                negative_factors.push(correlationObjects[i]);
                            }
                        }

                        deferred.resolve('success');
                    }, function(error){
                        Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                        deferred.reject(error);
                    });
                return deferred.promise;
            },

            getUserCauses: function (variableName) {
                var deferred = $q.defer();
                QuantiModo.getUsersCauses(variableName, function(correlationObjects){

                    // populate positives & Negatives
                    for(var i in correlationObjects){
                        if(correlationObjects[i].correlationCoefficient > 0){
                            usersPositivePredictors.push(correlationObjects[i]);
                        }
                        else if(correlationObjects[i].correlationCoefficient < 0){
                            usersNegativePredictors.push(correlationObjects[i]);
                        }
                    }

                    deferred.resolve('success');
                }, function(error){
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getPositivePredictors: function(variableName){
                var deferred = $q.defer();
                if(positive_factors.length===0){
                    this.getCauses(variableName).then(function () {
                        deferred.resolve(positive_factors);
                    });
                }else{
                    deferred.resolve(positive_factors);
                }
                return deferred.promise;
            },

            getUsersPositivePredictors: function(variableName){
                var deferred = $q.defer();
                if(usersPositivePredictors.length===0){
                    this.getUserCauses(variableName).then(function () {
                        deferred.resolve(usersPositivePredictors);
                    });
                }else{
                    deferred.resolve(usersPositivePredictors);
                }
                return deferred.promise;
            },

            getNegativePredictors: function(variableName){
                var deferred = $q.defer();
                if(negative_factors.length===0){
                    this.getCauses(variableName).then(function () {
                        deferred.resolve(negative_factors);
                    });
                }else{
                    deferred.resolve(negative_factors);
                }
                return deferred.promise;
            },

            getUsersNegativePredictors: function(variableName){
                var deferred = $q.defer();
                if(usersNegativePredictors.length===0){
                    this.getUserCauses(variableName).then(function () {
                        deferred.resolve(usersNegativePredictors);
                    });
                }else{
                    deferred.resolve(usersNegativePredictors);
                }
                return deferred.promise;
            },


            // up/down vote
            vote : function(vote, cause, effect, correlationCoefficient){
                var deferred = $q.defer();

                console.log(vote, cause, effect, correlationCoefficient);
                var correlation =
                {
                    cause: cause,
                    effect: effect,
                    correlation: correlationCoefficient,
                    vote: vote
                };

                QuantiModo.postVote(correlation, function(response){
                    console.log("postVote response", response);
                    deferred.resolve(true);
                }, function(response){
                    console.log("postVote response", response);
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
                    console.log("deleteVote response", response);
                    deferred.resolve(true);
                }, function(response){
                    console.log("deleteVote response", response);
                    deferred.reject(false);
                });
                
                return deferred.promise;
            },
        };
    });