angular.module('starter').controller('ChatCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout", "$q",
	function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout, $q) {
		$scope.controller_name = "ChatCtrl";
		$scope.state = {
			dialogFlow: false,
			trackingReminderNotification: null,
			messages: [],
            userInputString: '',
            visualizationType: 'siri', // 'siri', 'rainbow', 'equalizer'
            listening: qm.speech.listening
		};
		if($scope.state.visualizationType === 'rainbow'){$scope.state.bodyCss = "background: hsl(250,10%,10%); overflow: hidden;"}
        if($scope.state.visualizationType === 'siri'){$scope.state.bodyCss = "background: radial-gradient(farthest-side, #182158 0%, #030414 100%) no-repeat fixed 0 0; margin: 0;"}
        if($scope.state.visualizationType === 'equalizer'){$scope.state.bodyCss = "background-color:#333;"}
        qmService.navBar.setFilterBarSearchIcon(false);
        function blurAll(){
            var tmp = document.createElement("input");
            document.body.appendChild(tmp);
            tmp.focus();
            document.body.removeChild(tmp);
        }
		$scope.state.toggleMicrophone = function(){
            $scope.state.listening = qm.speech.toggleListening();
            var container = document.getElementById('mic-input-field-container');
            if($scope.state.listening){
                blurAll();
            } else {
                container[0].focus();
            }
        };
        $scope.$on('$ionicView.beforeEnter', function(e) {
            qmLog.debug('beforeEnter state ' + $state.current.name);
            if ($stateParams.hideNavigationMenu !== true){qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();}
        });
        $scope.$on('$ionicView.afterEnter', function(e) {qmService.hideLoader();
            if(!qm.getUser()){
                talk("I'm not sure who you are so while you're logging in, take that time to ask yourself who you think you are on a deeper level.");
                qmService.login.sendToLoginIfNecessaryAndComeBack();
                return;
            }
            var robot = document.querySelector('.robot');
            robot.addEventListener('click', function (event) {
                if (speechSynthesis.speaking) {
                    qm.speech.shutUpRobot();
                } else {
                    qm.speech.talkRobot(qm.speech.lastUtterance.text);
                }
            });
            qm.speech.initializeListening(reminderNotificationCommands, $scope.state.visualizationType);
            getMostRecentNotificationAndTalk();
            qm.speech.siriVisualizer();
        });
        function ask(text){
            qm.speech.listening = $scope.state.listening = true;
            talk(text);
            //annyang.addCommands(reminderNotificationCommands);
        }
        function getMostRecentNotificationAndTalk(){
            qm.notifications.getMostRecentNotification(function (trackingReminderNotification) {
                $scope.state.trackingReminderNotification = trackingReminderNotification;
                if(trackingReminderNotification){
                    ask(trackingReminderNotification.card.title);
                } else {
                    qmLog.error("No tracking reminder notification");
                    postToDialogFlow(qm.dialogFlow.welcomeBody);
                }
            }, function(error){
                qmLog.error(error);
                postToDialogFlow(qm.dialogFlow.welcomeBody);
            });
        }
        $scope.state.userReply = function(reply) {
            reply = reply || $scope.state.userInputString;
            if(reply){$scope.state.userInputString = reply;}
            if ( reply === '' || !reply) {
                qmLog.error("No reply!");
                return;
            }
			$scope.state.messages.push({who: 'user', message: $scope.state.userInputString, time: 'Just now'});
            var notification = $scope.state.trackingReminderNotification;
            notification.modifiedValue = reply;
            qmService.trackTrackingReminderNotificationDeferred(notification);
            var message = notification.userOptimalValueMessage || notification.commonOptimalValueMessage || "OK. I'll record " + reply + ".  ";
            talk(message);
            getMostRecentNotificationAndTalk();
			// qm.dialogFlow.postNotificationResponse($scope.state.userInputString, function (body) {
			// 	talk()
			// }, function (error) {
			// 	talk(error)
			// });
			$scope.state.userInputString = '';
		};
		function postToDialogFlow(body) {
            qm.dialogFlow.post(body, function (response) {
                talk();
            }, function(error){
            	talk(error);
			});
        }
        function talk(message) {
            if(!message && !qm.dialogFlow.lastApiResponse.payload){return;}
			if(!message && !qm.dialogFlow.lastApiResponse.payload.google){return;}
			message = message || qm.dialogFlow.lastApiResponse.payload.google.systemIntent.data.listSelect.title;
			$scope.state.lastBotMessage = message;
            $scope.state.messages.push({who    : 'bot', message: message, time   : 'Just now'});
            qm.speech.talkRobot(message)
        }
		function getMostRecentNotification() {
			$scope.state.trackingReminderNotification = qm.notifications.getMostRecentNotification();
			$scope.state.messages.push({
				who    : 'bot',
				message: $scope.state.trackingReminderNotification.longQuestion,
				time   : 'Just now'
			})
		}
		var reminderNotificationCommands = {
            "I don't know": function () {
                qm.speech.talkRobot("OK. We'll skip that one.");
                $scope.state.userReply('skip');
            },
            '*tag': function(tag) {
                qmLog.info("Just heard user say " + tag);
                function isNumeric(n) {return !isNaN(parseFloat(n)) && isFinite(n);}
                var possibleResponses = ["skip", "snooze", "yes", "no"];
                if(possibleResponses.indexOf(tag) > -1 || isNumeric(tag)){
                    $scope.state.userReply(tag);
                } else {
                    qm.speech.fallbackMessage(tag);
                }
            }
        };
        $scope.state.simulateQuery = false;
        $scope.state.isDisabled    = false;
        $scope.state.allListItems        = loadAll();  // list of `state` value/display objects
        $scope.state.newState = function(state) {
            alert("Sorry! You'll need to create a Constitution for " + state + " first!");
        };
        $scope.state.querySearch = function(query) {
            var results = query ? $scope.state.allListItems.filter( createFilterFor(query) ) : $scope.state.allListItems,
                deferred;
            if ($scope.state.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        };
        $scope.state.searchTextChange = function(text) {
            qmLog.info('Text changed to ' + text);
        };
        $scope.state.selectedItemChange = function(item) {
            qmLog.info('Item changed to ' + JSON.stringify(item));
        };
        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
            var lowercaseQuery = query.toLowerCase();
            return function filterFn(button) {
                return (button.value.indexOf(lowercaseQuery) === 0);
            };
        }
        /**
         * Build `states` list of key/value pairs
         */
        function loadAll() {
            if(!$scope.state.trackingReminderNotification){return [];}
            var buttons = $scope.state.trackingReminderNotification.card.buttons;
            return buttons.map( function (button) {
                return {
                    value: button.longTitle,
                    display: state.longTitle
                };
            });
        }
    }]
);