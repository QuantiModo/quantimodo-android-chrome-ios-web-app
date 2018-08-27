angular.module('starter').controller('ChatCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout", "$ionicActionSheet",
    function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout, $ionicActionSheet) {
        $scope.controller_name = "ChatCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
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
                    qm.urlHelper.goToUrl(card.link);
                } else {
                    talk();
                }
            },
            cardButtonClick: function(card, button){
                qmLog.info("card", card);
                qmLog.info("button", button);
                if(button && button.parameters && button.parameters.trackingReminderNotificationId){
                    card.selectedButton = button;
                    qm.feed.addToFeedQueue(card, function (nextCard) {
                        //$scope.state.cards = [nextCard];
                        talk();
                    });
                } else {
                    qmLog.error("Not sure how to handle this button", {card: card, button: button});
                }
            },
            openActionSheet: function (card) {
                qmService.actionSheets.openActionSheet(card, talk);
            }
        };
        $scope.$on('$ionicView.beforeEnter', function(e) {
            qmLog.debug('beforeEnter state ' + $state.current.name);
            if ($stateParams.hideNavigationMenu !== true){qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();}
            //refresh();
            qmService.rootScope.setProperty('showRobot', true);
            $scope.showRobot = true;  // Not sure why scope doesn't work
        });
        $scope.$on('$ionicView.afterEnter', function(e) {qmService.hideLoader();
            if(!qm.getUser()){
                qmService.login.sendToLoginIfNecessaryAndComeBack();
                return;
            }
            //qm.speech.deepThought(notification);
            talk(null, function(){
                qm.mic.onMicEnabled = talk;
            }, function(error){
                qmLog.error(error);
                qm.mic.onMicEnabled = talk;
            });
            qmService.actionSheet.setDefaultActionSheet(function() {
                refresh();
            });
            qm.mic.initializeListening(qm.mic.startListeningCommands);
            qm.mic.onMicEnabled = function () {
                qm.mic.initializeListening(qm.mic.startListeningCommands);
            };
            qm.robot.onRobotClick = talk;
            qm.mic.wildCardHandler = $scope.state.userReply;
            //qm.dialogFlow.apiAiPrepare();
        });
        function refresh(){
            qm.feed.getFeedFromApi({}, function(cards){
                if(!qm.speech.alreadySpeaking()){talk();}
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
        function talk(nextCard, successHandler, errorHandler) {
            qm.feed.getMostRecentCard(function (card) {
                if(nextCard){card = nextCard;}
                $scope.safeApply(function () {
                    $scope.state.cards = [card];
                });
                //$scope.$apply(function () { $scope.state.cards = [card]; });// Not sure why this is necessary
                card.followUpAction = function (successToastText) {
                    qmService.toast.showUndoToast(successToastText, function () {
                        qm.localForage.deleteById(qm.items.feedQueue, card.id, function(){
                            talk(card);
                        })
                    });
                    //qm.speech.talkRobot(successToastText);
                    talk();
                };
                qm.feed.readCard(card, successHandler, errorHandler);
                $scope.state.lastBotMessage = qm.speech.lastUtterance.text;
            }, errorHandler);
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
                $scope.state.messages.push({who: 'user', message: $scope.state.userInputString, time: 'Just now'});
                //$scope.state.cards.push({subHeader: reply, avatarCircular: qm.getUser().avatarImage});
                qm.dialogFlow.fulfillIntent($scope.state.userInputString, function (reply) {
                    $scope.state.messages.push({who: 'bot', message: reply, time: 'Just now'});
                });
                qm.speech.getMostRecentNotificationAndTalk();
                $scope.state.userInputString = '';
                $scope.state.lastBotMessage = "One moment please...";
            });
        };
        qm.staticData.dialogAgent.intents["Cancel Intent"].callback = function(){
            qm.speech.talkRobot(qm.staticData.dialogAgent.intents["Cancel Intent"].responses.messages.speech);
            qm.mic.abortListening();
            qmService.goToDefaultState();
        };
        qm.staticData.dialogAgent.intents["Create Reminder Intent"].callback = function(){
            qm.speech.currentIntent.name = "Create Reminder Intent";
            var intent = qm.staticData.dialogAgent.intents["Create Reminder Intent"];
            if(!qm.dialogFlow.weHaveRequiredParams(intent)){return;}
            qm.variablesHelper.getFromLocalStorageOrApi({searchPhrase: qm.speech.currentIntent.parameters.variableName}, function(variable){
                qmService.addToRemindersUsingVariableObject(variable, {skipReminderSettingsIfPossible: true, doneState: "false"});
            });
        };
    }]
);
