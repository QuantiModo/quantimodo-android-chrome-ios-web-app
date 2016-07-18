angular.module('starter')
    // Correlation service
    .factory('correlationService', function(QuantiModo, $q) {
        var positive_factors = [];
        var negative_factors = [];
        var usersPositiveFactors = [];
        var usersNegativeFactors = [];
        return {
            // get Positive correlationObjects
            getCauses : function(){
                var deferred = $q.defer();
                    QuantiModo.getCauses(function(correlationObjects){

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

            getUserCauses: function () {
                var deferred = $q.defer();
                QuantiModo.getUsersCauses(function(correlationObjects){

                    // populate positives & Negatives
                    for(var i in correlationObjects){
                        if(correlationObjects[i].correlationCoefficient > 0){
                            usersPositiveFactors.push(correlationObjects[i]);
                        }
                        else if(correlationObjects[i].correlationCoefficient < 0){
                            usersNegativeFactors.push(correlationObjects[i]);
                        }
                    }

                    deferred.resolve('success');
                }, function(error){
                    Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    deferred.reject(error);
                });
                return deferred.promise;
            },

            getPositiveFactors: function(){
                var deferred = $q.defer();
                if(positive_factors.length===0){
                    this.getCauses().then(function () {
                        deferred.resolve(positive_factors);
                    });
                }else{
                    deferred.resolve(positive_factors);
                }
                return deferred.promise;
            },

            getUsersPositiveFactors: function(){
                var deferred = $q.defer();
                if(usersPositiveFactors.length===0){
                    this.getUserCauses().then(function () {
                        deferred.resolve(usersPositiveFactors);
                    });
                }else{
                    deferred.resolve(usersPositiveFactors);
                }
                return deferred.promise;
            },

            getNegativeFactors: function(){
                var deferred = $q.defer();
                if(negative_factors.length===0){
                    this.getCauses().then(function () {
                        deferred.resolve(negative_factors);
                    });
                }else{
                    deferred.resolve(negative_factors);
                }
                return deferred.promise;
            },

            getUsersNegativeFactors: function(){
                var deferred = $q.defer();
                if(usersNegativeFactors.length===0){
                    this.getUserCauses().then(function () {
                        deferred.resolve(usersNegativeFactors);
                    });
                }else{
                    deferred.resolve(usersNegativeFactors);
                }
                return deferred.promise;
            },


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
            },
        };
    });