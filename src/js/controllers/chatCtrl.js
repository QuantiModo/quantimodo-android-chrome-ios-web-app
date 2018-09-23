angular.module('starter').controller('ChatCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout",
    function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout) {
        $scope.controller_name = "ChatCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        var listAllCards = true;
        $scope.state = {
            cards: [],
            chat: true,
            dialogFlow: false,
            messages: [],
            userInputString: '',
            visualizationType: 'rainbow', // 'siri', 'rainbow', 'equalizer'
            listening: qm.mic.listening,
            circlePage: {
                title: null,
                image: {
                    url: null
                }
            },
            lastBotMessage: '',
            htmlClick: function(card){
                if(card.link){
                    //qm.urlHelper.goToUrl(card.link);
                } else {
                    getMostRecentCardAndTalk();
                }
            },
            onSwipeLeft: function($event, $target){
                handleSwipe($event, $target);
            },
            onSwipeRight: function($event, $target){
                handleSwipe($event, $target);
            },
            cardButtonClick: function(card, button){
                qmLog.info("card", card);
                qmLog.info("button", button);
                if(card.parameters.trackingReminderNotificationId){
                    card.selectedButton = button;
                    qm.feed.addToFeedQueueAndRemoveFromFeed(card, function (nextCard) {
                        //$scope.state.cards = [nextCard];
                        getMostRecentCardAndTalk();
                    });
                } else {
                    qmLog.error("Not sure how to handle this button", {card: card, button: button});
                }
            },
            openActionSheet: function (card) {
                qmService.actionSheets.openActionSheet(card, getMostRecentCardAndTalk);
            }
        };
        $scope.$on('$ionicView.beforeEnter', function(e) {
            qmLog.debug('beforeEnter state ' + $state.current.name);
            qmService.showBasicLoader();
            if ($stateParams.hideNavigationMenu !== true){qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();}
            //refresh();
            qmService.rootScope.setProperty('showRobot', true);
            $scope.showRobot = true;  // Not sure why scope doesn't work
        });
        $scope.$on('$ionicView.afterEnter', function(e) {
            if(!qm.getUser()){
                qmService.login.sendToLoginIfNecessaryAndComeBack();
                return;
            }
            //qm.speech.deepThought(notification);
            getMostRecentCardAndTalk(null, function(){
                qm.mic.onMicEnabled = getMostRecentCardAndTalk;
            }, function(error){
                qmLog.error(error);
                qm.mic.onMicEnabled = getMostRecentCardAndTalk;
            });
            qmService.actionSheet.setDefaultActionSheet(function() {
                refresh();
            });
            qm.mic.onMicEnabled = getMostRecentCardAndTalk;
            qm.robot.onRobotClick = getMostRecentCardAndTalk;
            qm.mic.wildCardHandler = $scope.state.userReply;
            qmService.pusher.stateSpecificMessageHandler = botReply;
            //qm.dialogFlow.apiAiPrepare();
        });
        function handleSwipe($event, $target) {
            qmLog.info("onSwipe $event", $event);
            qmLog.info("onSwipe $target", $target);
            if($scope.state.cards[0].parameters.trackingReminderNotificationId){qmService.notification.skip($scope.state.cards[0].parameters);}
            getMostRecentCardAndTalk();
        }
        function refresh(){
            qm.feed.getFeedFromApi({}, function(cards){
                if(!qm.speech.alreadySpeaking()){getMostRecentCardAndTalk();}
            });
        }
        if($scope.state.visualizationType === 'rainbow'){
            $scope.state.bodyCss = "background: hsl(250,10%,10%); overflow: hidden;";
        }
        if($scope.state.visualizationType === 'siri'){
            $scope.state.bodyCss = "background: radial-gradient(farthest-side, #182158 0%, #030414 100%) no-repeat fixed 0 0; margin: 0;";
        }
        if($scope.state.visualizationType === 'equalizer'){
            $scope.state.bodyCss = "background-color:#333;";
        }
        function getCards() {
            qm.feed.getFeedFromLocalForageOrApi({}, function(cards){
                $scope.state.cards = cards;
            });
        }
        function getMostRecentCardAndTalk(nextCard, successHandler, errorHandler) {
            if(listAllCards){
                getCards();
            }
            qm.feed.getMostRecentCard(function (mostRecentCard) {
                qmService.hideLoader();
                if(nextCard){mostRecentCard = nextCard;}
                $scope.safeApply(function () {
                    if(mostRecentCard.parameters.trackingReminderNotificationTimeEpoch){
                        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
                        d.setUTCSeconds(mostRecentCard.parameters.trackingReminderNotificationTimeEpoch);
                        mostRecentCard.date = d;
                    }
                    if(!listAllCards){
                        $scope.state.cards = [mostRecentCard];
                    }
                });
                //$scope.$apply(function () { $scope.state.cards = [card]; });// Not sure why this is necessary
                mostRecentCard.followUpAction = function (successToastText) {
                    if(successToastText){
                        qmService.toast.showUndoToast(successToastText, function () {
                            qm.localForage.deleteById(qm.items.feedQueue, mostRecentCard.id, function(){getMostRecentCardAndTalk(mostRecentCard);});
                        });
                    }
                    //qm.speech.talkRobot(successToastText);
                    if($scope.state.cards && $scope.state.cards.length > 1){
                        $scope.state.cards = $scope.state.cards.filter(function(card){
                            return card.id !== mostRecentCard.id;
                        });
                        qm.feed.readCard($scope.state.cards[0]);
                    } else {
                        getMostRecentCardAndTalk();
                    }
                };
                qm.feed.readCard(mostRecentCard, successHandler, errorHandler);
                $scope.state.lastBotMessage = qm.speech.lastUtterance.text;
            }, errorHandler);
        }
        function botReply(message){
            $scope.state.lastBotMessage = message;
            $scope.state.messages.push({who: 'bot', message: message, time: 'Just now'});
            qm.speech.talkRobot(message);
        }
        $scope.state.userReply = function(reply) {
            if(qm.arrayHelper.variableIsArray(reply)){reply = reply[0];}
            qmLog.info("userReply: "+reply);
            reply = reply || $scope.state.userInputString;
            if(reply){$scope.state.userInputString = reply;}
            if ( reply === '' || !reply) {
                qmLog.error("No reply!");
                return;
            }
            qm.mic.saveThought(reply);
            $scope.safeApply(function () {
                //$scope.state.messages.push({who: 'user', message: $scope.state.userInputString, time: 'Just now'});
                $scope.state.cards.push({subHeader: reply, avatarCircular: qm.getUser().avatarImage});
                qmService.dialogFlow.fulfillIntent($scope.state.userInputString, function (response) {
                    botReply(response.message || response);
                }, function(error){
                    botReply(error.message || error);
                });
                $scope.state.userInputString = '';
                $scope.state.lastBotMessage = "One moment please...";
            });
        };
    }]
);
