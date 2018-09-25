angular.module('starter').controller('FeedCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout",
    function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout) {
        $scope.controller_name = "FeedCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            cards: [],
            cardButtonClick: function(card, button, ev){
                qmLog.debug("card", card);
                qmLog.debug("button", button);
                card.selectedButton = button;
                if(card.parameters.trackingReminderNotificationId){
                    cardHandlers.removeCard(card);
                } else {
                    qmLog.error("Not sure how to handle this button", {card: card, button: button});
                }
                if(clickHandlers[button.action]){
                    clickHandlers[button.action](card, button, ev);
                } else {
                    qmService.actionSheets.handleCardButtonClick(button, card);
                }
            },
            openActionSheet: function (card) {
                var destructiveButtonClickedFunction = cardHandlers.removeCard;
                qmService.actionSheets.openActionSheetForCard(card, destructiveButtonClickedFunction);
            },
            htmlClick: function(card){
                $scope.state.openActionSheet(card);
            },
            refreshFeed: function () {
                qm.feed.getFeedFromApi({}, function(cards){
                    hideLoader();
                    cardHandlers.getCards(cards);
                });
            }
        };
        $scope.$on('$ionicView.beforeEnter', function(e) {
            qmLog.debug('beforeEnter state ' + $state.current.name);
            qmService.showBasicLoader();
            if ($stateParams.hideNavigationMenu !== true){qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();}
        });
        $scope.$on('$ionicView.enter', function(e) {
            if(!qm.getUser()){qmService.login.sendToLoginIfNecessaryAndComeBack(); return;}
            cardHandlers.getCards();
            if(!$scope.state.cards){qmService.showBasicLoader();}
        });
        $rootScope.$on('getCards', function() {
            qmLogService.info('getCards broadcast received..');
            cardHandlers.getCards();
        });
        var cardHandlers = {
            addCardsToScope: function(cards){
                $scope.safeApply(function () {
                    $scope.state.cards = cards;
                });
            },
            removeCard: function(card) {
                card.hide = true;
                qm.feed.deleteCardFromLocalForage(card, function(){
                    cardHandlers.getCards();
                });
            },
            getCards: function(cards) {
                if(cards){
                    cardHandlers.addCardsToScope(cards);
                    return;
                }
                qm.feed.getFeedFromLocalForageOrApi({}, function(cards){
                    hideLoader();
                    cardHandlers.addCardsToScope(cards);
                });
            }
        };
        var clickHandlers = {
            skipAll: function (card, button, ev) {
                qm.ui.preventDragAfterAlert(ev);
                qmService.showBasicLoader();
                qm.feed.postCardImmediately(card, function (cardsFromResponse) {
                    cardHandlers.getCards(cardsFromResponse);
                });
                return true;
            }
        };
        function hideLoader() {
            qmService.hideLoader();
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
        }
    }]
);