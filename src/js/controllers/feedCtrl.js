angular.module('starter').controller('FeedCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout",
    function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout) {
        $scope.controller_name = "FeedCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            cards: [],
            cardButtonClick: function(card, button){
                qmLog.info("card", card);
                qmLog.info("button", button);
                if(card.parameters.trackingReminderNotificationId){
                    card.selectedButton = button;
                    removeCard(card);
                } else {
                    qmLog.error("Not sure how to handle this button", {card: card, button: button});
                }
            },
            openActionSheet: function (card) {
                var destructiveButtonClickedFunction = removeCard;
                qmService.actionSheets.openActionSheet(card, destructiveButtonClickedFunction);
            },
            htmlClick: function(card){
                $scope.state.openActionSheet(card);
            },
            refreshFeed: function () {
                qm.feed.getFeedFromApi({}, function(cards){
                    $scope.$broadcast('scroll.refreshComplete');
                    getCards();
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
            getCards();
        });
        $rootScope.$on('getCards', function() {
            qmLogService.info('getCards broadcast received..');
            getCards();
        });
        function removeCard(card) {
            card.hide = true;
            qm.feed.deleteCardFromLocalForage(card, function(){getCards();});
        }
        function getCards() {qm.feed.getFeedFromLocalForageOrApi({}, function(cards){$scope.state.cards = cards;});}
    }]
);
