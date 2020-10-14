angular.module('starter').controller('VoteCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams",
    function($state, $scope, $rootScope, $http, qmService, $stateParams){
        $scope.controller_name = "VoteCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            cards: [],
            cardButtonClick: function(card, button, ev){
                card.selectedButton = button;
                if(clickHandlers[button.action]){
                    clickHandlers[button.action](card, ev);
                }else{
                    qmService.actionSheets.handleCardButtonClick(button, card);
                }
            },
            openActionSheetForCard: function(card){
                var destructiveButtonClickedFunction = cardHandlers.removeCard;
                qmService.actionSheets.openActionSheetForCard(card, destructiveButtonClickedFunction);
            },
            refreshFeed: function(){
                cardHandlers.getCards();
            },
            title: "Your Votes",
            loading: true
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.debug('beforeEnter state ' + $state.current.name);
            if($stateParams.hideNavigationMenu !== true){
                qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            }
        });
        $scope.$on('$ionicView.enter', function(e){
            if(!qm.getUser()){
                qmService.login.sendToLoginIfNecessaryAndComeBack("No user in " + $state.current.name);
                return;
            }
            cardHandlers.getCards();
        });
        var cardHandlers = {
            addCardsToScope: function(cards){
                $scope.safeApply(function(){
                    $scope.state.cards = cards;
                    hideLoader();
                });
            },
            removeCard: function(card){
                card.hide = true;
                qmService.showInfoToast("Deleted vote");
                qm.studyHelper.deleteVote(card.parameters, function(response){
                    qmLog.debug('deleteVote response', null, response);
                }, function(error){
                    qmLog.error("deleteVote error", error);
                });
            },
            getCards: function(cards){
                if(cards){
                    cardHandlers.addCardsToScope(cards);
                    return;
                }
                $scope.state.loading = true;
                qm.api.get('api/v1/votes', [], {}, function(data){
                    hideLoader();
                    if(!data.cards || !data.cards.length){
                        qmService.goToState(qm.staticData.stateNames.studies);
                        return;
                    }
                    $scope.state.cards = data.cards;
                }, function(error){
                    hideLoader();
                    qmService.goToState(qm.staticData.stateNames.studies);
                    qmService.showMaterialAlert("Error", error);
                });
            }
        };
        var clickHandlers = {
            skipAll: function(card, ev){
                qm.ui.preventDragAfterAlert(ev);
                qmService.showBasicLoader();
                qm.feed.postCardImmediately(card, function(cardsFromResponse){
                    cardHandlers.getCards(cardsFromResponse);
                });
                cardHandlers.removeCard(card);
                return true;
            },
            track: function(card){
                cardHandlers.removeCard(card);
                qm.feed.addToFeedQueueAndRemoveFromFeed(card);
                return true;
            }
        };
        function hideLoader(){
            $scope.state.loading = false;
            qmService.hideLoader();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        }
    }]
);
