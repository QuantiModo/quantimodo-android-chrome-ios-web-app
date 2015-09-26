/**
 * Created by Abdullah on 7/31/2015.
 */
angular.module('starter')

    .factory('correlationService', function(QuantiModo,$q) {
        var positive_factors = [];
        var negative_factors = [];
        var users_positive_factors = [];
        var users_negative_factors = [];
        return {
            // get Positive List
            getCauses : function(){
                var deferred = $q.defer();
                    QuantiModo.getCauses(function(list){

                        // populate positives & Negatives
                        for(var i in list){
                            if(list[i].correlationCoefficient > 0){
                                positive_factors.push(list[i]);
                            }
                            else if(list[i].correlationCoefficient < 0){
                                negative_factors.push(list[i]);
                            }
                        }

                        deferred.resolve('success');
                    }, function(error){
                        deferred.reject(error);
                    });
                return deferred.promise;
            },

            getUserCauses: function () {
                var deferred = $q.defer();
                QuantiModo.getUsersCauses(function(list){

                    // populate positives & Negatives
                    for(var i in list){
                        if(list[i].correlationCoefficient > 0){
                            users_positive_factors.push(list[i]);
                        }
                        else if(list[i].correlationCoefficient < 0){
                            users_negative_factors.push(list[i]);
                        }
                    }

                    deferred.resolve('success');
                }, function(error){
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
                if(users_positive_factors.length===0){
                    this.getUserCauses().then(function () {
                        deferred.resolve(users_positive_factors);
                    });
                }else{
                    deferred.resolve(users_positive_factors);
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
                if(users_negative_factors.length===0){
                    this.getUserCauses().then(function () {
                        deferred.resolve(users_negative_factors);
                    });
                }else{
                    deferred.resolve(users_negative_factors);
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
            }
        }
    });