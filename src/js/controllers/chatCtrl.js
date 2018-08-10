angular.module('starter').controller('ChatCtrl', ["$state", "$scope", "$rootScope", "$http", "qmService", "$stateParams", "$timeout",
	function( $state, $scope, $rootScope, $http, qmService, $stateParams, $timeout) {
		$scope.controller_name = "ChatCtrl";
		$scope.state = {
			dialogFlow: false,
			trackingReminderNotification: null,
			messages: [],
            replyMessage: '',
            visualizationType: 'rainbow' // 'siri', 'rainbow', 'equalizer'
		};
		if($scope.state.visualizationType === 'rainbow'){$scope.state.bodyCss = "background: hsl(250,10%,10%); overflow: hidden;"}
        if($scope.state.visualizationType === 'siri'){$scope.state.bodyCss = "background: radial-gradient(farthest-side, #182158 0%, #030414 100%) no-repeat fixed 0 0; margin: 0;"}
        if($scope.state.visualizationType === 'equalizer'){$scope.state.bodyCss = "background-color:#333;"}
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.$on('$ionicView.beforeEnter', function(e) {
            qmLog.debug('beforeEnter state ' + $state.current.name);
            $scope.state.trackingReminderNotification = qm.notifications.getMostRecentNotification();
            if ($stateParams.hideNavigationMenu !== true){qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();}
        });
        $scope.$on('$ionicView.afterEnter', function(e) {qmService.hideLoader();
            if($scope.state.trackingReminderNotification){
                respondWithMessageToUser($scope.state.trackingReminderNotification.longQuestion)
            } else {
                postMessage(qm.dialogFlow.welcomeBody);
            }

        });
        $scope.state.userReply = function(reply) {
            if(reply){$scope.state.replyMessage = reply;}
            if ( $scope.state.replyMessage === '' ) {return;}
			$scope.state.messages.push({
				who    : 'user',
				message: $scope.state.replyMessage,
				time   : 'Just now'
			});
			qm.dialogFlow.postNotificationResponse($scope.state.replyMessage, function (body) {
				respondWithMessageToUser()
			}, function (error) {
				respondWithMessageToUser(error)
			});
			$scope.state.replyMessage = '';
		};
		function postMessage(body) {
            qm.dialogFlow.post(body, function (response) {
                respondWithMessageToUser();
            }, function(error){
            	respondWithMessageToUser(error);
			});
        }
        function talk(message) {
            var useRobot = true;
            if(useRobot){qm.speech.makeRobotTalk(message);} else {qm.speech.readOutLoud(message);}
        }
        function respondWithMessageToUser(message) {
            if(!message && !qm.dialogFlow.lastApiResponse.payload){return;}
			if(!message && !qm.dialogFlow.lastApiResponse.payload.google){return;}
			message = message || qm.dialogFlow.lastApiResponse.payload.google.systemIntent.data.listSelect.title;
			$scope.state.lastBotMessage = message;
			talk(message);
            $scope.state.messages.push({
                who    : 'bot',
                message: message,
                time   : 'Just now'
            });
            //qm.speech.initializeSpeechKit(qmService);
            var commands = {
                "I don't know": function () {
                    talk("OK. We'll skip that one.");
                    $scope.state.userReply('skip');
                },
                '*tag': function(tag) {
					qmLog.info("Just heard user say " + tag);
                    function isNumeric(n) {return !isNaN(parseFloat(n)) && isFinite(n);}
                    var possibleResponses = ["skip", "snooze", "yes", "no"];
					if(possibleResponses.indexOf(tag) > -1 || isNumeric(tag)){
                        $scope.state.userReply(tag);
                    } else {
                        talk("I'm kind of an idiot, ! . ! . ! . ! and I'm not sure how to handle the response " + tag +
                            ". ! . ! . ! . ! You can say a number ! . ! . ! . ! or skip ! . ! . ! . !"+
                            " or ! . ! . ! . ! snooze ! . ! . ! . ! or yes or no. ! . ! . ! . ! Thank you for loving me despite my many failures in life!");
                    }
                }
            };
            qm.speech.startListening(commands, $scope.state.visualizationType);
        }
		function getMostRecentNotification() {
			$scope.state.trackingReminderNotification = qm.notifications.getMostRecentNotification();
			$scope.state.messages.push({
				who    : 'bot',
				message: $scope.state.trackingReminderNotification.longQuestion,
				time   : 'Just now'
			})
		}
        $(function() {
            $(".anim").on("click", ".material-icons", function() {
                var $this = $(this),
                    $anim = $this.closest(".anim");
                $anim.addClass("animate");
                $("input.search").addClass("speak").attr("placeholder", "Listening...  Speak Now...");
                setTimeout( removeAnim, 7000);

            })
        });
        function removeAnim() {
            $(".anim").removeClass("animate");
            $("input.search").removeClass("speak").attr("placeholder", "Enter a Keyword, Phrase, or Question...");
        }
    }]
);